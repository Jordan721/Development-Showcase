const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../model.js');
const T = require('../pay-transfer.js');
function storage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return { values, getItem: key => values.get(key) ?? null, setItem(key, value) { values.set(key, value); }, removeItem(key) { values.delete(key); } };
}
function transaction(state, overrides = {}) {
    return M.upsertTransaction(state, { type: 'expense', amount: 25, category: 'Groceries', date: '2026-11-01', description: 'Groceries', ...overrides });
}
test('add, edit and delete transactions without changing unrelated groups', () => {
    const original = M.empty(); original.budgets.Groceries = 100;
    const added = transaction(original);
    assert.equal(original.transactions.length, 0);
    const id = added.transactions[0].id;
    const edited = transaction(added, { id, amount: 40 });
    assert.equal(edited.transactions.length, 1); assert.equal(edited.transactions[0].amount, 40);
    assert.equal(M.remove(edited, 'transactions', [id]).transactions.length, 0);
    assert.equal(M.remove(edited, 'transactions', [id]).budgets.Groceries, 100);
    assert.throws(() => transaction(edited, { id: 'missing' }));
    for (const amount of [0, -1, NaN, Infinity]) assert.throws(() => transaction(original, { amount }));
});
test('monthly totals use cents, exact date boundaries and unavailable savings rate with no income', () => {
    let state = M.empty();
    state = transaction(state, { amount: .1 }); state = transaction(state, { amount: .2 });
    state = transaction(state, { type: 'income', category: 'Salary', amount: 10 });
    state = transaction(state, { amount: 50, date: '2026-10-31' });
    assert.deepEqual(M.totals(state, '2026-11'), { income: 10, expenses: .3, surplus: 9.7, savingsRate: 97, count: 3 });
    assert.equal(M.totals(state, '2026-10').savingsRate, null);
    assert.deepEqual(M.spending(state, '2026-11'), [{ category: 'Groceries', amount: .3 }]);
    assert.deepEqual(M.trend(state, '2026-01').map(row => row.month), ['2025-08','2025-09','2025-10','2025-11','2025-12','2026-01']);
    assert.equal(M.validDate('2026-02-30'), false); assert.equal(M.validDate('2028-02-29'), true);
});
test('bill payments create expenses and keep month-end anchoring through leap years', () => {
    let state = M.empty(); state.bills = [{ id:'rent', name:'Rent', amount:1200, category:'Housing', due:'2028-01-31', day:31 }];
    state = M.payBill(state, 'rent', '2028-01-31');
    assert.equal(state.bills[0].due, '2028-02-29'); assert.equal(state.transactions[0].billDue, '2028-01-31');
    state = M.payBill(state, 'rent', '2028-02-29'); assert.equal(state.bills[0].due, '2028-03-31');
    assert.equal(M.totals(state, '2028-02').expenses, 1200);
    assert.equal(M.nextDue('2026-12-31', 31), '2027-01-31');
    state.bills[0].due = '2028-01-31'; assert.throws(() => M.payBill(state, 'rent'));
});
test('bill schedule deletion preserves payments; payment deletion does not rewind schedules', () => {
    let state = M.empty(); state.bills = [{id:'bill',name:'Internet',amount:60,category:'Utilities',due:'2026-11-20',day:20}];
    state = M.payBill(state, 'bill', '2026-11-20');
    assert.equal(M.remove(state, 'bills', ['bill']).transactions.length, 1);
    assert.equal(M.remove(state, 'transactions', [state.transactions[0].id]).bills[0].due, '2026-12-20');
});
test('legacy browser data migrates before old copies are removed, without creating paycheck transactions', () => {
    const oldJobs = T.validate(T.exportJobs([{id:'job',company:'Example',role:'Engineer',stage:'applied',salary:'$90k/year'}]));
    const old = { transactions: JSON.stringify([{id:123,type:'income',amount:1000,category:'Salary',description:'Pay',date:'2026-11-01'}]), budgets:'{"Housing":1200}', 'cashCompass.plan':'{"planSavings":"6000","planCosts":"2000","planPay":"90000","planPeriod":"year","planDeductions":"20"}', 'cashCompass.jobComparisons.v1':JSON.stringify(oldJobs) };
    const disk=storage(old), store=new M.Store(disk), loaded=store.load();
    assert.equal(loaded.migrated,true); assert.equal(loaded.state.transactions[0].id,'123'); assert.equal(loaded.state.plan.pay,90000); assert.equal(loaded.state.jobs.length,1);
    assert.equal(loaded.state.transactions.length,1); for(const key of Object.keys(old))assert.equal(disk.getItem(key),null);
    assert(disk.getItem(M.KEY)); assert.equal(new M.Store(disk).load().migrated,false);
});
test('one atomic save succeeds before revision changes; quota errors preserve saved data', () => {
    const disk=storage(),store=new M.Store(disk);store.load();const state=store.save(transaction(M.empty()));const before=disk.getItem(M.KEY),revision=store.revision;
    disk.setItem=()=>{throw new Error('Quota');};
    assert.throws(()=>store.save(transaction(state)));assert.equal(disk.getItem(M.KEY),before);assert.equal(store.revision,revision);assert.equal(store.raw,before);
});
test('failed migration keeps old source keys, while failed legacy cleanup is surfaced after a successful save', () => {
    const old = JSON.stringify([{id:1,type:'expense',amount:50,category:'Groceries',description:'Food',date:'2026-11-01'}]);
    const disk = storage({transactions:old}); disk.setItem = () => { throw new Error('Full'); };
    assert.throws(() => new M.Store(disk).load()); assert.equal(disk.getItem('transactions'),old); assert.equal(disk.getItem(M.KEY),null);
    const readonlyDelete = storage({transactions:old}); readonlyDelete.removeItem = () => { throw new Error('Denied'); };
    const store = new M.Store(readonlyDelete),loaded = store.load();
    assert.equal(loaded.state.transactions.length,1); assert.equal(store.cleanupWarning,true); assert(readonlyDelete.getItem(M.KEY));
});
test('conflicting tabs cannot overwrite a newer workspace', () => {
    const disk=storage(), first=new M.Store(disk),second=new M.Store(disk);first.load();second.load();
    first.save(transaction(M.empty()));assert.throws(()=>second.save(M.empty()),/another tab/);assert.equal(new M.Store(disk).load().state.transactions.length,1);
});
test('corrupted or malformed saved data is blocked, preserved and recoverable by explicit restore', () => {
    const disk=storage({[M.KEY]:'broken JSON'}),store=new M.Store(disk);assert.throws(()=>store.load());assert.equal(disk.getItem(M.KEY),'broken JSON');assert.throws(()=>store.save(M.empty()));
    store.save(M.empty(),true);assert.equal(new M.Store(disk).load().state.transactions.length,0);
    const legacy=storage({transactions:'not-json'});assert.throws(()=>new M.Store(legacy).load());assert.equal(legacy.getItem('transactions'),'not-json');assert.equal(legacy.getItem(M.KEY),null);
});
test('clear selected groups preserves other records and never resurrects migrated legacy data', () => {
    const old=JSON.stringify([{id:1,type:'expense',amount:50,category:'Groceries',description:'Food',date:'2026-11-01'}]);
    const disk=storage({transactions:old,'pipelinetrack-jobs':'private'}),store=new M.Store(disk);let state=store.load().state;state.budgets.Housing=1000;state.plan.costs=2000;
    state=store.save(M.clearGroups(state,['transactions']));assert.equal(state.transactions.length,0);assert.equal(state.budgets.Housing,1000);assert.equal(state.plan.costs,2000);
    assert.equal(new M.Store(disk).load().state.transactions.length,0);assert.equal(disk.getItem('transactions'),null);assert.equal(disk.getItem('pipelinetrack-jobs'),'private');
    state=store.save(M.clearGroups(state,Object.keys(M.empty())));assert.deepEqual(new M.Store(disk).load().state,M.empty());
});
test('backup roundtrip includes bills/goals/jobs and older backups restore missing groups as empty', () => {
    const state=M.demo(new Date(2026,10,17));assert.deepEqual(M.fromBackup(JSON.parse(JSON.stringify(M.backup(state)))),state);
    const old={transactions:[{id:5,type:'expense',amount:2,category:'Groceries',date:'2026-11-01',description:'Food'}],budgets:{Groceries:100},plan:{planCosts:'2000',planDeductions:'20',planPeriod:'year'}};
    const restored=M.fromBackup(old);assert.equal(restored.transactions.length,1);assert.equal(restored.plan.costs,2000);assert.equal(restored.bills.length,0);
    assert.throws(()=>M.fromBackup(T.exportJobs([{id:'j',company:'X',role:'Y'}])));assert.throws(()=>M.fromBackup({...M.backup(state),version:99}));
});
test('job import preserves financial records, deduplicates, and clears stale estimates only for changed pay', () => {
    let state=transaction(M.empty());const plan=M.clone(state.plan);const data=T.exportJobs([{id:'job',company:'Example',role:'Developer',stage:'applied',salary:'$80k/year'}]);
    state=M.importJobs(state,data);state.jobs[0].estimate={low:80000,high:80000,period:'year',confirmed:true};
    data.jobs[0].stage='offer';state=M.importJobs(state,data);assert.equal(state.jobs.length,1);assert.equal(state.jobs[0].estimate.confirmed,true);
    data.jobs[0].offerPay='$90k/year';state=M.importJobs(state,data);assert.equal(state.jobs[0].estimate,null);assert.equal(state.transactions.length,1);assert.deepEqual(state.plan,plan);
});
test('unreviewed backup estimates are discarded and invalid ranges never become income', () => {
    const state=M.importJobs(M.empty(),T.exportJobs([{id:'job',company:'X',role:'Y',salary:'$80k/year'}]));
    for(const estimate of [{low:1,high:2,period:'year',confirmed:false},{low:5,high:1,period:'year',confirmed:true},{low:1,high:2,period:['year'],confirmed:true}]){
        state.jobs[0].estimate=estimate;assert.equal(M.normalize(state).jobs[0].estimate,null);
    }
    assert.equal(state.transactions.length,0);
});
test('CSV safely escapes quotes, commas and spreadsheet formula prefixes', () => {
    const state=transaction(M.empty(),{description:'=SUM(1,2) "test"'});const csv=M.csv(state.transactions);assert(csv.includes('"\'=SUM(1,2) ""test"""'));assert(csv.includes('"25.00"'));assert.equal(csv.split('\r\n').length,2);
});
test('demo is independent of saved data, with valid charts, bills and goals', () => {
    const disk=storage(),store=new M.Store(disk);store.load();store.save(transaction(M.empty()));const before=disk.getItem(M.KEY);let demo=M.demo(new Date(2026,10,17));demo=transaction(demo);assert.equal(disk.getItem(M.KEY),before);assert.equal(M.trend(demo,'2026-11').length,6);assert.equal(demo.goals.length,2);assert.equal(demo.bills.length,2);assert.equal(new M.Store(disk).load().state.transactions.length,1);
});

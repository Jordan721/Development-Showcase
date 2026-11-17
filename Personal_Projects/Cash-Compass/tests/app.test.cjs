/* Interaction checks without a browser: exercise the actual app event handlers. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const M = require('../model.js');
const T = require('../pay-transfer.js');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

function setup(initial = M.empty(), raw = null) {
    const nodes = new Map(), docEvents = {}, windowEvents = {};
    const attrs = text => Object.fromEntries([...text.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] ?? '']));
    class Element {
        constructor(id = '') {
            this.id = id; this.events = {}; this.dataset = {}; this.value = ''; this.checked = false; this.disabled = false; this.hidden = false; this.elements = {}; this.inputs = []; this._html = ''; this.required = false;
            const classes = new Set();
            this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), toggle(name, force) { const next = force ?? !classes.has(name); next ? classes.add(name) : classes.delete(name); return next; } };
        }
        set innerHTML(value) {
            this._html = value;
            if (this.tagName === 'select') {
                const options = [...value.matchAll(/<option([^>]*)>([^<]*)<\/option>/g)];
                const chosen = options.find(m => /\bselected\b/.test(m[1])) || options[0];
                if (chosen) this.value = attrs(chosen[1]).value ?? chosen[2];
            }
            if (this.id === 'dialogBody') {
                const form = get('dialogForm'); form.inputs = []; form.elements = {};
                const matches = [...value.matchAll(/<input\b([^>]*)>|<select\b([^>]*)>([\s\S]*?)<\/select>/g)];
                for (const match of matches) {
                    const a = attrs(match[1] || match[2]); const node = new Element(a.id || '');
                    node.tagName = match[1] ? 'input' : 'select'; node.type = a.type || ''; node.name = a.name || ''; node.value = a.value ?? (node.type === 'checkbox' ? 'on' : ''); node.checked = Object.hasOwn(a, 'checked'); node.required = Object.hasOwn(a, 'required');
                    if (node.tagName === 'select') node.innerHTML = match[3];
                    form.inputs.push(node); if (node.name) form.elements[node.name] = node; if (a.id) nodes.set(a.id, node);
                }
                for (const match of value.matchAll(/\bid="([^"]+)"/g)) if (!nodes.has(match[1])) nodes.set(match[1], new Element(match[1]));
            }
        }
        get innerHTML() { return this._html; }
        addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
        async emit(name, event = {}) { event.target ||= this; event.preventDefault ||= () => {}; for (const fn of this.events[name] || []) await fn(event); if (this['on' + name]) await this['on' + name](event); }
        dispatchEvent(event) { this.emit(event.type, event); }
        querySelectorAll(selector) { return this.inputs.filter(input => input.name === 'scope' && (!selector.includes(':checked') || input.checked)); }
        setAttribute(name, value) { this[name] = value; }
        removeAttribute(name) { delete this[name]; }
        closest(selector) { return selector === '[data-action]' && this.dataset.action ? this : null; }
        matches(selector) { return selector === '[data-select-transaction]' ? !!this.dataset.selectTransaction : selector === '[data-select-job]' ? !!this.dataset.selectJob : false; }
        checkValidity() { return [...Object.values(this.elements)].every(input => !input.required || (input.type === 'checkbox' ? input.checked : String(input.value) !== '')); }
        reportValidity() { return this.checkValidity(); }
        showModal() { this.open = true; }
        close() { this.open = false; }
        focus() {}
        scrollIntoView() {}
        append() {}
        click() {}
        remove() {}
    }
    const get = id => { if (!nodes.has(id)) nodes.set(id, new Element(id)); return nodes.get(id); };
    for (const match of html.matchAll(/\bid="([^"]+)"/g)) get(match[1]);
    for (const id of ['transactionTypeFilter', 'transactionCategoryFilter', 'jobStageFilter']) { get(id).tagName = 'select'; get(id).value = 'all'; }
    for (const name of ['savings','costs','pay','period','deductions']) { const node = new Element(); node.name = name; node.value = '0'; node.required = true; node.tagName = name === 'period' ? 'select' : 'input'; get('payPlanForm').elements[name] = node; }
    const pages = ['overview','transactions','budgets','bills','career','settings'].map(name => { const node = get('view-' + name); node.dataset.page = name; return node; });
    const links = pages.map(page => { const node = new Element(); node.dataset.route = page.dataset.page; return node; });
    const disk = new Map([[M.KEY, raw ?? JSON.stringify({ version: 2, revision: 1, data: initial })]]);
    const document = { getElementById: get, documentElement: new Element(), body: new Element(), createElement: () => new Element(), querySelectorAll: selector => selector === '[data-page]' ? pages : links,
        addEventListener(name, fn) { (docEvents[name] ||= []).push(fn); } };
    const location = { hash: '#overview' };
    const context = { CashCompassModel: M, CashCompassTransfer: T, document, location,
        window: { addEventListener(name, fn) { windowEvents[name] = fn; }, scrollTo() {} },
        localStorage: { getItem: key => disk.get(key) ?? null, setItem: (key, value) => disk.set(key, value), removeItem: key => disk.delete(key) },
        FormData: class { constructor(form) { this.form = form; } get(name) { const input = this.form.inputs.find(input => input.name === name && (input.type !== 'checkbox' || input.checked)); return input?.value || null; } getAll(name) { return this.form.inputs.filter(input => input.name === name && input.checked).map(input => input.value); } },
        Event: class { constructor(type) { this.type = type; } }, setTimeout() { return 1; }, clearTimeout() {},
        URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, Blob: class {}, Intl, Date, console };
    vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8'), context);
    docEvents.DOMContentLoaded[0]();
    async function click(action, id) { const button = new Element(); button.dataset = { action, id }; for (const fn of docEvents.click) await fn({ target: button, preventDefault() {} }); }
    function navigate(page) { location.hash = '#' + page; windowEvents.hashchange(); }
    return { get, disk, click, navigate, state: () => JSON.parse(disk.get(M.KEY)).data, async submit(values = {}) { for (const [key,value] of Object.entries(values)) { const node = get('dialogForm').elements[key]; if (node.type === 'checkbox') node.checked = value; else node.value = String(value); } await get('dialogForm').emit('submit'); } };
}

test('all rebuilt screens boot, preserve stored data, and render populated finance views', () => {
    const app = setup(M.demo(new Date(2026,10,17))); const before = app.disk.get(M.KEY);
    for (const name of ['overview','transactions','budgets','bills','career','settings']) app.navigate(name);
    assert.match(app.get('overviewContent').innerHTML, /Monthly surplus/);
    assert.match(app.get('overviewContent').innerHTML, /<svg class="trend-chart"/);
    assert.match(app.get('billsContent').innerHTML, /Mark paid/);
    assert.match(app.get('budgetContent').innerHTML, /Your monthly category limits/);
    assert.match(app.get('jobCards').innerHTML, /POTENTIAL INCOME/);
    assert.match(app.get('settingsContent').innerHTML, /Restore backup/);
    assert.equal(app.disk.get(M.KEY), before);
    app.navigate('planning'); assert.equal(app.get('pageName').textContent, 'Career & Pay');
});
test('real transaction editor adds and edits one record; delete requires the final dialog submit', async () => {
    const app = setup(); await app.click('add-transaction');
    await app.submit({ amount: '52.25', description: 'Food', date: '2026-11-17', type: 'expense', category: 'Groceries' });
    assert.equal(app.state().transactions.length, 1); const id = app.state().transactions[0].id;
    await app.click('edit-transaction', id); await app.submit({ amount: 60 });
    assert.equal(app.state().transactions.length, 1); assert.equal(app.state().transactions[0].amount, 60);
    await app.click('delete-transaction', id); assert.equal(app.state().transactions.length, 1);
    await app.submit(); assert.equal(app.state().transactions.length, 0);
});
test('demo changes and exits never overwrite personal data', async () => {
    const app = setup(); const before = app.disk.get(M.KEY);
    await app.click('demo'); assert.equal(app.get('demoBanner').hidden, false);
    await app.click('add-goal'); await app.submit({ name: 'Demo goal', target: 100, saved: 20 });
    assert.equal(app.disk.get(M.KEY), before);
    await app.click('exit-demo'); assert.equal(app.get('demoBanner').hidden, true); assert.equal(app.disk.get(M.KEY), before);
});
test('job file preview does not import until confirmed; reviewed pay and duplicates stay out of transactions', async () => {
    const app = setup(); app.navigate('career');
    const data = T.exportJobs([{id:'test-job',company:'Example',role:'Engineer',stage:'applied',salary:'$90k/year'}]);
    async function choose() { await app.click('import-jobs'); const input = app.get('importFile'); input.value = 'jobs.json'; await input.emit('change', { target: { files: [{ size: 100, text: async () => JSON.stringify(data) }] } }); }
    await choose(); assert.equal(app.state().jobs.length, 0); assert.equal(app.get('dialogSubmit').disabled, false);
    await app.submit(); assert.equal(app.state().jobs.length, 1);
    await app.click('review-job', 'test-job'); await app.submit({ confirmed: true });
    assert.equal(app.state().jobs[0].estimate.low, 90000); assert.equal(app.state().transactions.length, 0);
    await choose(); await app.submit(); assert.equal(app.state().jobs.length, 1); assert.equal(app.state().jobs[0].estimate.confirmed, true);
    await app.click('use-job', 'test-job'); assert.equal(app.get('payPlanForm').elements.pay.value, 90000); assert.equal(app.state().plan.pay, 0);
});
test('manage data begins unchecked and clears only selected groups after submit', async () => {
    const app = setup(M.demo(new Date(2026,10,17))); await app.click('manage-data');
    assert.equal(app.get('dialogSubmit').disabled, true);
    assert(app.get('dialogForm').inputs.filter(input => input.name === 'scope').every(input => !input.checked));
    app.get('dialogForm').inputs.find(input => input.name === 'scope' && input.value === 'jobs').checked = true;
    await app.get('dialogBody').emit('change'); assert.equal(app.get('dialogSubmit').disabled, false);
    await app.submit(); assert.equal(app.state().jobs.length, 0); assert(app.state().transactions.length > 0); assert.equal(app.state().goals.length, 2);
});

test('full backup restore previews every group and replaces data only after confirmation', async () => {
    const app = setup(); const backup = M.backup(M.demo(new Date(2026,10,17)));
    await app.click('restore'); const input = app.get('importFile'); input.value = 'backup.json';
    await input.emit('change', { target: { files: [{size: 100, text: async () => JSON.stringify(backup)}] } });
    assert.equal(app.state().transactions.length, 0); assert.match(app.get('importPreview').innerHTML, /Ready to replace/);
    await app.submit(); assert.equal(app.state().bills.length, 2); assert.equal(app.state().goals.length, 2); assert.equal(app.state().jobs.length, 1);
});

test('bill payment and budget editor save valid records through the app', async () => {
    const app = setup(); await app.click('add-bill');
    await app.submit({name:'Internet',amount:65,due:'2026-11-25',category:'Utilities'});
    const id = app.state().bills[0].id; await app.click('pay-bill',id);
    assert.equal(app.state().transactions.length,0);
    await app.submit({paidOn:'2026-11-25'});
    assert.equal(app.state().transactions.length,1); assert.equal(app.state().transactions[0].amount,65); assert.equal(app.state().bills[0].due,'2026-12-25');
    await app.click('edit-budgets'); await app.submit({budget0:1500}); assert.equal(app.state().budgets.Housing,1500);
});

test('unreadable data is not exported as an empty backup, and leaving demo still permits recovery', async () => {
    const app = setup(M.empty(),'broken-json');
    assert.equal(app.get('recoveryBanner').hidden,false);
    await app.click('backup'); assert.match(app.get('toast').textContent,/raw recovery copy/);
    await app.click('demo'); await app.click('exit-demo');
    assert.equal(app.get('demoBanner').hidden,true); assert.equal(app.disk.get(M.KEY),'broken-json');
    await app.click('restore'); const input = app.get('importFile'); input.value = 'backup.json';
    await input.emit('change',{target:{files:[{size:100,text:async()=>JSON.stringify(M.backup(M.empty()))}]}});
    await app.submit(); assert.equal(app.state().transactions.length,0); assert.equal(app.get('recoveryBanner').hidden,true);
});

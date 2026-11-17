/* Pure finance operations and one atomic, versioned workspace store. */
(function (root) {
    'use strict';
    const transfer = typeof module !== 'undefined' && module.exports ? require('./pay-transfer.js') : root.CashCompassTransfer;
    const KEY = 'cashCompass.workspace.v2';
    const categories = {
        income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'],
        expense: ['Housing', 'Transportation', 'Food & Dining', 'Groceries', 'Entertainment', 'Healthcare', 'Utilities', 'Shopping', 'Education', 'Job Search', 'Other Expense']
    };
    const stages = { saved: 'Saved', applied: 'Applied', screening: 'Screening', interview: 'Interview', offer: 'Offer', declined: 'Not selected', withdrew: 'Declined', ghosted: 'Ghosted', archived: 'Archived' };
    const clone = value => JSON.parse(JSON.stringify(value));
    const object = value => value && typeof value === 'object' && !Array.isArray(value);
    const string = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    const money = (value, allowZero = true) => typeof value === 'number' && Number.isFinite(value) && value >= (allowZero ? 0 : 0.01) && value <= 1e9;
    const cents = value => Math.round((value + Number.EPSILON) * 100);
    const sum = rows => rows.reduce((total, row) => total + cents(row.amount), 0) / 100;
    const today = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    function validDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2200-12-31') return false;
        const date = new Date(value + 'T12:00:00');
        return !Number.isNaN(date.getTime()) && today(date) === value;
    }
    const uid = () => root.crypto?.randomUUID?.() || `cc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    function empty() { return { transactions: [], budgets: {}, bills: [], goals: [], jobs: [], plan: { savings: 0, costs: 0, pay: 0, period: 'year', deductions: 0 } }; }
    function array(value, max, name) {
        if (!Array.isArray(value) || value.length > max) throw new Error(`Invalid ${name} in this file.`);
        return value;
    }
    function unique(rows, name) {
        if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error(`Duplicate ${name} IDs in this file.`);
        return rows;
    }
    function normalize(raw) {
        if (!object(raw)) throw new Error('This is not a Cash Compass workspace.');
        const state = empty();
        state.transactions = unique(array(raw.transactions, 100000, 'transactions').map(row => {
            if (!object(row) || !['income', 'expense'].includes(row.type) || !money(row.amount, false) || !validDate(row.date) || !['string', 'number'].includes(typeof row.id) || !String(row.id).trim()) throw new Error('A transaction has an invalid ID, amount, type, or date.');
            return { id: String(row.id), type: row.type, amount: cents(row.amount) / 100, date: row.date,
                category: categories[row.type].includes(row.category) ? row.category : row.type === 'income' ? 'Other Income' : 'Other Expense',
                description: string(row.description) || row.category || 'Transaction',
                ...(row.billId ? { billId: string(row.billId, 200), billDue: string(row.billDue, 10) } : {}) };
        }), 'transaction');
        if (!object(raw.budgets)) throw new Error('Invalid category budgets.');
        for (const [category, amount] of Object.entries(raw.budgets)) {
            if (!categories.expense.includes(category) || !money(amount)) throw new Error('A category budget has an invalid limit.');
            state.budgets[category] = cents(amount) / 100;
        }
        state.bills = unique(array(raw.bills || [], 1000, 'bills').map(bill => {
            if (!object(bill) || !string(bill.id, 200) || !string(bill.name) || !money(bill.amount, false) || !validDate(bill.due) || !categories.expense.includes(bill.category)) throw new Error('A recurring bill has invalid details.');
            const day = bill.day === undefined ? Number(bill.due.slice(-2)) : bill.day;
            if (!Number.isInteger(day) || day < 1 || day > 31) throw new Error('Invalid recurring bill day.');
            return { id: string(bill.id, 200), name: string(bill.name), amount: cents(bill.amount) / 100, category: bill.category, due: bill.due, day };
        }), 'bill');
        state.goals = unique(array(raw.goals || [], 1000, 'goals').map(goal => {
            if (!object(goal) || !string(goal.id, 200) || !string(goal.name) || !money(goal.target, false) || !money(goal.saved)) throw new Error('A savings goal has invalid amounts.');
            return { id: string(goal.id, 200), name: string(goal.name), target: cents(goal.target) / 100, saved: cents(goal.saved) / 100 };
        }), 'goal');
        const jobs = array(raw.jobs || [], 1000, 'job comparisons');
        for (let index = 0; index < jobs.length; index += 500) {
            const chunk = jobs.slice(index, index + 500);
            state.jobs.push(...transfer.validate({ kind: 'pipelinetrack-cash-compass', version: 1, jobs: chunk }).map((job, i) => {
                const estimate = chunk[i].estimate;
                const valid = object(estimate) && typeof estimate.period === 'string' && transfer.monthly(estimate.low, estimate.high, estimate.period, 0) && estimate.confirmed === true;
                return { ...job, estimate: valid ? { low: estimate.low, high: estimate.high, period: estimate.period, confirmed: true } : null };
            }));
        }
        if (new Set(state.jobs.map(job => job.sourceJobId)).size !== state.jobs.length) throw new Error('Duplicate imported job IDs.');
        const plan = raw.plan || state.plan;
        if (!object(plan) || !['savings', 'costs', 'pay'].every(key => money(plan[key])) || typeof plan.period !== 'string' || !Object.hasOwn(transfer.periods, plan.period) || !Number.isFinite(plan.deductions) || plan.deductions < 0 || plan.deductions > 100) throw new Error('The pay plan has invalid amounts or deductions.');
        state.plan = { savings: plan.savings, costs: plan.costs, pay: plan.pay, period: plan.period, deductions: plan.deductions };
        return state;
    }
    function legacyPlan(plan) {
        const number = key => {
            const value = Number(plan[key] || 0);
            if (!money(value)) throw new Error('The previous pay plan could not be read.');
            return value;
        };
        return { savings: number('planSavings'), costs: number('planCosts'), pay: number('planPay'), period: plan.planPeriod || 'year', deductions: number('planDeductions') };
    }
    function fromBackup(data) {
        if (data?.kind === 'cash-compass-backup' && data.version === 2) return normalize(data.data);
        if (object(data) && !data.kind && Array.isArray(data.transactions) && object(data.budgets)) {
            return normalize({ ...empty(), transactions: data.transactions, budgets: data.budgets, plan: data.plan ? legacyPlan(data.plan) : empty().plan, jobs: data.jobComparisons || [] });
        }
        throw new Error('Choose a Cash Compass JSON backup. PipelineTrack job files belong in Career & Pay.');
    }
    class Store {
        constructor(storage) { this.storage = storage; this.revision = 0; this.raw = null; this.blocked = false; this.cleanupWarning = false; }
        cleanupLegacy() {
            this.cleanupWarning = false;
            for (const key of ['transactions', 'budgets', 'cashCompass.plan', 'cashCompass.jobComparisons.v1', 'sampleDataLoaded']) {
                try { this.storage.removeItem(key); } catch (_) { this.cleanupWarning = true; }
            }
        }
        load() {
            try {
                const raw = this.storage.getItem(KEY);
                if (raw !== null) {
                    const saved = JSON.parse(raw);
                    if (saved.version !== 2 || !Number.isInteger(saved.revision) || saved.revision < 1) throw new Error('Unsupported workspace.');
                    const state = normalize(saved.data);
                    this.raw = raw; this.revision = saved.revision; this.blocked = false;
                    this.cleanupLegacy();
                    return { state, migrated: false };
                }
                const read = (key, fallback) => JSON.parse(this.storage.getItem(key) || JSON.stringify(fallback));
                const previous = { ...empty(), transactions: read('transactions', []), budgets: read('budgets', {}), jobs: read('cashCompass.jobComparisons.v1', []) };
                const plan = this.storage.getItem('cashCompass.plan');
                if (plan) previous.plan = legacyPlan(JSON.parse(plan));
                const state = normalize(previous);
                const migrated = state.transactions.length > 0 || Object.keys(state.budgets).length > 0 || state.jobs.length > 0 || !!plan;
                this.raw = null; this.revision = 0; this.blocked = false;
                if (migrated) this.save(state);
                return { state, migrated };
            } catch (_) {
                this.blocked = true;
                throw new Error('Saved data could not be opened. It has not been replaced. Use Data Settings to download a recovery copy or restore a backup.');
            }
        }
        save(next, force = false) {
            if (this.blocked && !force) throw new Error('Restore a backup in Data Settings before saving new changes. Your original data is still stored.');
            const state = normalize(next);
            const latest = this.storage.getItem(KEY);
            if (!force && latest !== this.raw) throw new Error('This workspace changed in another tab. Reload before saving to avoid overwriting it.');
            const revision = this.revision + 1;
            const raw = JSON.stringify({ version: 2, revision, data: state });
            this.storage.setItem(KEY, raw);
            this.raw = raw; this.revision = revision; this.blocked = false;
            // Remove old copies only after the complete workspace is durably saved.
            // Otherwise deleted records could remain in legacy browser keys.
            this.cleanupLegacy();
            return state;
        }
    }
    function totals(state, month) {
        const rows = state.transactions.filter(row => row.date.startsWith(month));
        const income = sum(rows.filter(row => row.type === 'income'));
        const expenses = sum(rows.filter(row => row.type === 'expense'));
        return { income, expenses, surplus: (cents(income) - cents(expenses)) / 100, savingsRate: income ? (income - expenses) / income * 100 : null, count: rows.length };
    }
    function spending(state, month) {
        const map = new Map();
        state.transactions.filter(row => row.type === 'expense' && row.date.startsWith(month)).forEach(row => map.set(row.category, (map.get(row.category) || 0) + cents(row.amount)));
        return [...map].map(([category, amount]) => ({ category, amount: amount / 100 })).sort((a, b) => b.amount - a.amount);
    }
    function trend(state, month) {
        const [year, index] = month.split('-').map(Number);
        return Array.from({ length: 6 }, (_, i) => {
            const date = new Date(year, index - 6 + i, 15);
            const key = today(date).slice(0, 7);
            return { month: key, ...totals(state, key) };
        });
    }
    function upsertTransaction(state, input) {
        const next = clone(state);
        const record = { ...input, id: input.id || uid(), amount: Number(input.amount) };
        const index = next.transactions.findIndex(row => row.id === record.id);
        if (input.id && index === -1) throw new Error('This transaction no longer exists. Close the editor and try again.');
        if (index === -1) next.transactions.push(record); else next.transactions[index] = { ...next.transactions[index], ...record };
        return normalize(next);
    }
    function remove(state, group, ids) {
        if (!['transactions', 'jobs', 'bills', 'goals'].includes(group)) throw new Error('Unknown record group.');
        const selected = new Set(ids);
        const next = clone(state);
        next[group] = next[group].filter(row => !selected.has(group === 'jobs' ? row.sourceJobId : row.id));
        return normalize(next);
    }
    function nextDue(due, day) {
        const date = new Date(due + 'T12:00:00');
        const year = date.getFullYear(), month = date.getMonth() + 1;
        return today(new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()), 12));
    }
    function payBill(state, id, paidOn = today()) {
        const next = clone(state);
        const bill = next.bills.find(row => row.id === id);
        if (!bill) throw new Error('This bill no longer exists.');
        if (next.transactions.some(row => row.billId === id && row.billDue === bill.due)) throw new Error('This bill occurrence is already recorded.');
        next.transactions.push({ id: uid(), type: 'expense', category: bill.category, amount: bill.amount, description: bill.name, date: paidOn, billId: id, billDue: bill.due });
        bill.due = nextDue(bill.due, bill.day);
        return normalize(next);
    }
    function importJobs(state, data) {
        const incoming = transfer.validate(data);
        const jobs = transfer.merge(state.jobs, incoming);
        if (jobs.length > 1000) throw new Error('Keep up to 1,000 job comparisons. Remove old comparisons first.');
        return normalize({ ...state, jobs });
    }
    function clearGroups(state, groups) {
        const next = clone(state), initial = empty();
        for (const group of groups) {
            if (!Object.hasOwn(initial, group)) throw new Error('Unknown data group.');
            next[group] = initial[group];
        }
        return normalize(next);
    }
    function backup(state) { return { kind: 'cash-compass-backup', version: 2, exportedAt: new Date().toISOString(), data: normalize(state) }; }
    function csv(rows) {
        const cell = value => {
            let text = String(value);
            if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
        };
        return [['Date', 'Type', 'Category', 'Description', 'Amount'], ...rows.map(row => [row.date, row.type, row.category, row.description, row.amount.toFixed(2)])].map(row => row.map(cell).join(',')).join('\r\n');
    }
    function demo(now = new Date()) {
        const state = empty();
        const date = (offset, day) => today(new Date(now.getFullYear(), now.getMonth() + offset, day, 12));
        for (let offset = -5; offset <= 0; offset++) {
            const rows = [ ['income', 'Salary', 4600 + offset * 30, 1, 'Monthly paycheck'], ['income', 'Freelance', 650, 14, 'Website project'], ['expense', 'Housing', 1450, 2, 'Apartment rent'], ['expense', 'Groceries', 280 - offset * 12, 5, 'Weekly grocery shops'], ['expense', 'Food & Dining', 124, 12, 'Coffee & meals'], ['expense', 'Transportation', 110, 6, 'Transit & fuel'], ['expense', 'Utilities', 155, 8, 'Electric & internet'], ['expense', 'Education', 89, 16, 'Design course'] ];
            for (const [type, category, amount, day, description] of rows) state.transactions.push({ id: uid(), type, category, amount, date: date(offset, day), description });
        }
        state.budgets = { Housing: 1500, Groceries: 400, 'Food & Dining': 200, Transportation: 150, Utilities: 200, Education: 100 };
        state.bills = [{ id: uid(), name: 'Internet', amount: 65, due: date(0, 25), day: 25, category: 'Utilities' }, { id: uid(), name: 'Music subscription', amount: 12, due: date(0, 28), day: 28, category: 'Entertainment' }];
        state.goals = [{ id: uid(), name: 'Emergency fund', saved: 3400, target: 6000 }, { id: uid(), name: 'Next certification', saved: 240, target: 500 }];
        state.plan = { savings: 8000, costs: 2300, pay: 78000, period: 'year', deductions: 22 };
        state.jobs = transfer.validate(transfer.exportJobs([{ id: 'demo-job', company: 'Example Studio (fictional)', role: 'Product Designer', stage: 'interview', salary: '$75,000 – $90,000 / year' }]));
        return normalize(state);
    }
    const api = { KEY, categories, stages, empty, normalize, fromBackup, Store, today, validDate, uid, clone, totals, spending, trend, upsertTransaction, remove, nextDue, payBill, importJobs, clearGroups, backup, csv, demo, sum };
    if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CashCompassModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

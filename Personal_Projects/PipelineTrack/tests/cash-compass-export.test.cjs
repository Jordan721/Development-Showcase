const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const transfer = require('../../Cash-Compass/pay-transfer.js');

function setup() {
    class Element {
        constructor(tag = 'div') { this.tag = tag; this.events = {}; this.children = []; this.value = ''; this.checked = false; this.hidden = false; }
        addEventListener(name, fn) { this.events[name] = fn; }
        append(...nodes) { this.children.push(...nodes); }
        replaceChildren() { this.children = []; }
        querySelectorAll(selector) {
            const all = this.children.flatMap(node => [node, ...node.querySelectorAll('*')]);
            return selector === '*' ? all : all.filter(node => node.type === 'checkbox' && (selector !== 'input:checked' || node.checked));
        }
        showModal() {}
        close() {}
        focus() {}
        click() { this.events.click?.(); }
        remove() {}
    }
    const nodes = new Map();
    const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
    let ready, downloaded;
    const context = {
        document: { getElementById: get, createElement: tag => new Element(tag), addEventListener(name, fn) { ready = fn; }, body: new Element() },
        state: { jobs: [
            { id: 'a', company: 'Acme', role: 'Frontend Engineer', location: 'Boston', stage: 'applied', salary: '$90,000/year' },
            { id: 'b', company: 'Beta', role: 'Backend Engineer', location: 'Remote', stage: 'offer', salary: '$100,000/year', offerMilestone: { salaryOffered: '$110,000/year' } },
            { id: 'c', company: 'Acme', role: 'Designer', location: 'Remote', stage: 'saved', salary: '$80,000/year' }
        ] },
        STAGE_LABELS: { applied: 'Applied', offer: 'Offer', saved: 'Saved' }, CashCompassTransfer: transfer,
        Blob: class { constructor(parts) { downloaded = JSON.parse(parts.join('')); } },
        URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, setTimeout() {}, Date
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../javascript/features/cash-compass-export.js'), 'utf8'), context);
    ready(); get('cash-compass-export-btn').click();
    const search = query => { get('cash-compass-export-search').value = query; get('cash-compass-export-search').events.input(); };
    return { get, search, downloaded: () => downloaded };
}

test('export search matches company, role, location, stage and pay; selections survive filtering', () => {
    const app = setup();
    assert.equal(app.get('cash-compass-download').disabled, true);
    app.search('acme engineer');
    assert.equal(app.get('cash-compass-export-list').children.filter(row => !row.hidden).length, 1);
    app.get('cash-compass-select-all').click();
    app.search('offer 110000');
    assert.equal(app.get('cash-compass-export-list').children.filter(row => !row.hidden).length, 1);
    assert.match(app.get('cash-compass-export-status').textContent, /1 outside this search/);
    app.get('cash-compass-select-all').click();
    app.get('cash-compass-download').click();
    assert.deepEqual(app.downloaded().jobs.map(job => job.sourceJobId), ['a', 'b']);
    app.search('remote');
    assert.equal(app.get('cash-compass-export-list').children.filter(row => !row.hidden).length, 2);
    app.get('cash-compass-select-none').click();
    assert.equal(app.get('cash-compass-download').disabled, true);
});

test('no matches is explicit and selecting search results never selects hidden jobs', () => {
    const app = setup(); app.search('nothing matches');
    assert.equal(app.get('cash-compass-no-matches').hidden, false);
    app.get('cash-compass-select-all').click();
    assert.equal(app.get('cash-compass-download').disabled, true);
    app.search('designer'); app.get('cash-compass-select-all').click(); app.get('cash-compass-download').click();
    assert.deepEqual(app.downloaded().jobs.map(job => job.sourceJobId), ['c']);
    app.get('cash-compass-export-btn').click();
    assert.equal(app.get('cash-compass-export-search').value, '');
    assert.equal(app.get('cash-compass-download').disabled, true);
});

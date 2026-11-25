const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(jobs = []) {
  const elements = new Map();
  function element() {
    return {
      innerHTML: '', controls: [],
      querySelectorAll(selector) {
        const attribute = selector.match(/\[data-([\w-]+)\]/)?.[1];
        if (!attribute) return [];
        const pattern = new RegExp('data-' + attribute + '="([^"]*)"', 'g');
        this.controls = [...this.innerHTML.matchAll(pattern)].map(match => ({
          dataset: { [attribute]: match[1] },
          addEventListener(event, handler) { this[event] = handler; }
        }));
        return this.controls;
      },
      insertAdjacentHTML(position, html) { this.innerHTML = html + this.innerHTML; }
    };
  }
  const context = vm.createContext({
    state: { jobs },
    document: { getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    } },
    STAGE_LABELS: { saved: 'Saved', applied: 'Applied', screening: 'Screening', interview: 'Interview', offer: 'Offer', declined: 'Not Selected', withdrew: 'Declined' },
    escHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    compactWorkspace: { matches: true }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../javascript/views/analytics.js'), 'utf8'), context);
  context.openFilterModal = (title, subtitle, matched) => { context.lastSelection = { title, matched }; };
  return { context, elements };
}

test('metrics include unsuccessful submissions in progress denominator and open their matching jobs', () => {
  const jobs = [
    { id: 1, stage: 'saved', fitScore: null },
    { id: 2, stage: 'applied', fitScore: 50 },
    { id: 3, stage: 'interview', fitScore: 90 },
    { id: 4, stage: 'declined', fitScore: null },
    { id: 5, stage: 'withdrew', fitScore: null }
  ];
  const { context, elements } = setup(jobs);
  context.renderAnalyticsKPIs(jobs);
  const metrics = elements.get('an-kpi-strip');
  assert.match(metrics.innerHTML, /Submitted: 4/);
  assert.match(metrics.innerHTML, /Progress rate: 25%/);
  assert.match(metrics.innerHTML, /Average fit: 70%/);
  metrics.controls[3].onclick();
  assert.deepEqual(context.lastSelection.matched.map(job => job.id), [3]);
  metrics.controls[0].onclick();
  assert.deepEqual(context.lastSelection.matched.map(job => job.id), [2, 3, 4, 5]);
});

test('empty metrics and pipeline never display invalid numbers', () => {
  const { context, elements } = setup();
  context.renderAnalyticsKPIs([]);
  context.renderAnalyticsFunnel([]);
  assert.match(elements.get('an-kpi-strip').innerHTML, /Average fit: No data/);
  assert.doesNotMatch(elements.get('an-kpi-strip').innerHTML, /NaN|Infinity/);
  assert.doesNotMatch(elements.get('an-funnel').innerHTML, /NaN|Infinity/);
  assert.equal(elements.get('an-funnel').controls.length, 7);
});

test('pipeline accounts for every stage, including imported stages, and supports drill-downs', () => {
  const jobs = [{ stage: 'saved' }, { stage: 'interview' }, { stage: 'custom' }];
  const { context, elements } = setup(jobs);
  context.renderAnalyticsFunnel(jobs);
  const pipeline = elements.get('an-funnel');
  assert.match(pipeline.innerHTML, /3 tracked opportunities/);
  pipeline.controls.find(control => control.dataset.stage === 'other').onclick();
  assert.deepEqual(context.lastSelection.matched, [jobs[2]]);
  pipeline.controls.find(control => control.dataset.stage === 'saved').onclick();
  assert.deepEqual(context.lastSelection.matched, [jobs[0]]);
});

test('company list escapes names, handles special object keys, and opens exact matches', () => {
  const jobs = [{ company: '__proto__' }, { company: '<Studio>' }, { company: '__proto__' }];
  const { context, elements } = setup(jobs);
  context.renderAnalyticsTopCompanies(jobs);
  const companies = elements.get('an-top-companies');
  assert.match(companies.innerHTML, /&lt;Studio>/);
  assert.doesNotMatch(companies.innerHTML, /<Studio>/);
  companies.controls[0].onclick();
  assert.equal(context.lastSelection.title, '__proto__');
  assert.deepEqual(context.lastSelection.matched, [jobs[0], jobs[2]]);
});

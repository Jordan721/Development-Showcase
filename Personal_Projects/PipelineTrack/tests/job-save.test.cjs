const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function workspace() {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const elements = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id, {
    value: '', dataset: {}, hidden: true, textContent: '', setAttribute() {}, focus() {}
  }]));
  const storage = new Map();
  let failKey;
  let closed = false;
  const context = vm.createContext({
    console: { error() {} }, URL,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem(key, value) {
        if (key === failKey) throw Object.assign(new Error('Full'), { name: 'QuotaExceededError' });
        storage.set(key, value);
      }
    },
    document: { getElementById: id => elements[id], querySelector: () => ({ click() {} }) },
    setTimeout() {}
  });
  for (const file of ['data/catalog.js', 'core/utils.js', 'core/state.js', 'views/board.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'javascript', file), 'utf8'), context, { filename: file });
  }
  context.onClose = () => { closed = true; };
  vm.runInContext('toast=()=>{}; closeModal=onClose; renderView=()=>{}; checkMilestoneToast=()=>{}', context);
  elements['job-role'].value = 'Software Engineer';
  elements['job-company'].value = 'Example Company';
  elements['job-stage'].value = 'saved';
  elements['job-description'].value = 'Requirements: JavaScript and Python required. 3+ years of experience.';
  return {
    context, elements, storage,
    failAt(key) { failKey = key; },
    save() { vm.runInContext('saveJob()', context); },
    jobs() { return JSON.parse(vm.runInContext('JSON.stringify(state.jobs)', context)); },
    get closed() { return closed; }
  };
}

test('a complete job is analyzed and persisted', () => {
  const app = workspace();
  app.save();
  assert.equal(JSON.parse(app.storage.get('pt_jobs')).length, 1);
  assert.ok(app.jobs()[0].requirements.length);
  assert.equal(app.closed, true);
});

test('failed storage preserves the form and retry adds only one job', () => {
  const app = workspace();
  app.failAt('pt_jobs');
  app.save();
  app.save();
  assert.equal(app.closed, false);
  assert.equal(app.jobs().length, 0);
  assert.equal(app.elements['job-save-error'].hidden, false);
  assert.match(app.elements['job-save-error'].textContent, /storage is full/);
  assert.match(app.elements['job-description'].value, /JavaScript/);
  app.failAt(undefined);
  app.save();
  assert.equal(app.jobs().length, 1);
  assert.equal(app.elements['job-save-error'].hidden, true);
});

test('a later workspace failure does not leave an already saved job open for retry', () => {
  const app = workspace();
  app.failAt('pt_profile');
  app.save();
  assert.equal(app.closed, true);
  assert.equal(JSON.parse(app.storage.get('pt_jobs')).length, 1);
});

test('analysis errors are shown inside the form', () => {
  const app = workspace();
  vm.runInContext('analyzeJobForRole=()=>{throw new Error("Analysis failed")}', app.context);
  app.save();
  assert.equal(app.closed, false);
  assert.equal(app.jobs().length, 0);
  assert.equal(app.elements['job-save-error'].hidden, false);
  assert.match(app.elements['job-save-error'].textContent, /Could not save/);
});

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
  let quota = Infinity;
  let closed = false;
  const context = vm.createContext({
    console: { error() {} }, URL,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem(key, value) {
        if (key === failKey) throw Object.assign(new Error('Full'), { name: 'QuotaExceededError' });
        const size = [...storage].reduce((sum, [storedKey, storedValue]) => sum + (storedKey === key ? 0 : storedValue.length), value.length);
        if (size > quota) throw Object.assign(new Error('Full'), { name: 'QuotaExceededError' });
        storage.set(key, value);
      }
    },
    document: { getElementById: id => elements[id], querySelector: () => ({ click() {} }) },
    FileReader: class {
      readAsText(file) { this.onload({ target: { result: file.text } }); }
    },
    setTimeout() {}
  });
  for (const file of ['data/catalog.js', 'core/utils.js', 'core/state.js', 'views/board.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'javascript', file), 'utf8'), context, { filename: file });
  }
  context.window = context;
  context.document.addEventListener = () => {};
  vm.runInContext(fs.readFileSync(path.join(root, 'javascript/features/features.js'), 'utf8'), context);
  context.onClose = () => { closed = true; };
  vm.runInContext('toast=()=>{}; closeModal=onClose; renderView=()=>{}; checkMilestoneToast=()=>{}; openJobDetail=()=>{}; reanalyzeAllJobs=()=>{}', context);
  elements['job-role'].value = 'Software Engineer';
  elements['job-company'].value = 'Example Company';
  elements['job-stage'].value = 'saved';
  elements['job-description'].value = 'Requirements: JavaScript and Python required. 3+ years of experience.';
  return {
    context, elements, storage,
    limitStorage(size) { quota = size; },
    failAt(key) { failKey = key; },
    save() { vm.runInContext('saveJob()', context); },
    jobs() { return JSON.parse(vm.runInContext('JSON.stringify(state.jobs)', context)); },
    get closed() { return closed; }
  };
}

test('a complete job is analyzed and persisted', () => {
  const app = workspace();
  app.save();
  assert.equal(JSON.parse(vm.runInContext('unpackStorageValue(localStorage.getItem("pt_jobs"))', app.context)).length, 1);
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
  assert.equal(JSON.parse(vm.runInContext('unpackStorageValue(localStorage.getItem("pt_jobs"))', app.context)).length, 1);
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

for (const format of ['json', 'csv']) {
  test(`jobs can be added and updated immediately after a ${format} import`, () => {
    const app = workspace();
    app.context.importFile = {
      name: `backup.${format}`,
      text: format === 'json'
        ? JSON.stringify({ jobs: [{ id: 'imported', role: 'Developer', company: 'Imported Co', stage: 'saved' }] })
        : 'Role,Company,Stage\nDeveloper,Imported Co,Saved'
    };
    vm.runInContext('importData(importFile)', app.context);
    assert.equal(app.jobs().length, 1);
    app.save();
    assert.equal(app.jobs().length, 2);
    app.elements['job-edit-id'].value = app.jobs()[0].id;
    app.elements['job-role'].value = 'Updated Developer';
    app.save();
    assert.equal(app.jobs().length, 2);
    assert.equal(app.jobs()[0].role, 'Updated Developer');
    assert.equal(JSON.parse(vm.runInContext('unpackStorageValue(localStorage.getItem("pt_jobs"))', app.context))[0].role, 'Updated Developer');
    assert.equal(app.elements['job-save-error'].hidden, true);
  });
}

test('invalid submission after import does not change an imported job', () => {
  const app = workspace();
  app.context.importFile = { name: 'backup.json', text: JSON.stringify({ jobs: [
    { id: 'imported', role: 'Developer', company: 'Imported Co', deadline: '2026-12-01' }
  ] }) };
  vm.runInContext('importData(importFile)', app.context);
  const before = app.storage.get('pt_jobs');
  app.elements['job-role'].value = '';
  app.save();
  assert.equal(app.closed, false);
  assert.equal(app.storage.get('pt_jobs'), before);
  assert.equal(app.jobs()[0].deadline, '2026-12-01');
});
test('storage compression preserves Unicode, escapes, and repeated strings', () => {
  const app = workspace();
  for (const value of ['', 'short', '\x01'.repeat(100), '漢字 🧑🏽‍💻 résumé '.repeat(1000), 'abcde'.repeat(20000)]) {
    app.context.value = value;
    assert.equal(vm.runInContext('unpackStorageValue(packStorageValue(value))', app.context), value);
  }
});

test('full storage is compacted so adding and editing jobs can continue without reload', () => {
  const app = workspace();
  const resumes = JSON.stringify([{ id: 'resume', dataUrl: 'data:application/pdf;base64,' + 'abcdef0123456789'.repeat(2000) }]);
  app.storage.set('pt_resumes', resumes);
  vm.runInContext('state.resumes = JSON.parse(localStorage.getItem("pt_resumes"))', app.context);
  app.limitStorage(resumes.length + 100);
  app.save();
  assert.equal(app.closed, true);
  assert.equal(app.jobs().length, 1);
  assert.ok(app.storage.get('pt_resumes').length < resumes.length);
  assert.equal(vm.runInContext('unpackStorageValue(localStorage.getItem("pt_resumes"))', app.context), resumes);
  app.elements['job-edit-id'].value = app.jobs()[0].id;
  app.elements['job-role'].value = 'Updated after compaction';
  app.save();
  assert.equal(app.jobs()[0].role, 'Updated after compaction');
  vm.runInContext('load()', app.context);
  assert.equal(app.jobs()[0].role, 'Updated after compaction');
  assert.equal(vm.runInContext('JSON.stringify(state.resumes)', app.context), resumes);
});
test('saving and deleting jobs skips compression and writes for unchanged vault files', () => {
  const app = workspace();
  vm.runInContext(`
    state.resumes = [{ id: 'resume', dataUrl: 'data:application/pdf;base64,' + 'abcdef'.repeat(100000) }];
    state.coverLetters = [{ id: 'letter', dataUrl: 'data:application/pdf;base64,' + 'uvwxyz'.repeat(100000) }];
    for (const key of ['pt_resumes', 'pt_cover_letters']) {
      const value = JSON.stringify(key === 'pt_resumes' ? state.resumes : state.coverLetters);
      localStorage.setItem(key, packStorageValue(value));
    }
    const originalPack = packStorageValue;
    const originalSet = localStorage.setItem;
    packCalls = 0;
    writtenKeys = [];
    packStorageValue = value => { packCalls++; return originalPack(value); };
    localStorage.setItem = (key, value) => { writtenKeys.push(key); originalSet(key, value); };
  `, app.context);
  app.save();
  assert.equal(vm.runInContext('packCalls', app.context), 0);
  assert.equal(vm.runInContext('writtenKeys.includes("pt_resumes") || writtenKeys.includes("pt_cover_letters")', app.context), false);
  vm.runInContext('writtenKeys = []; state.jobs = []; save()', app.context);
  assert.equal(vm.runInContext('packCalls', app.context), 0);
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(writtenKeys)', app.context)), ['pt_jobs']);
  vm.runInContext('state.resumes[0].name = "Renamed"; save()', app.context);
  assert.equal(vm.runInContext('JSON.parse(unpackStorageValue(localStorage.getItem("pt_resumes")))[0].name', app.context), 'Renamed');
  assert.equal(vm.runInContext('packCalls', app.context), 1);
});

test('cached writes detect storage changes made by another tab', () => {
  const app = workspace();
  app.save();
  app.storage.set('pt_jobs', '[]');
  vm.runInContext('save()', app.context);
  assert.equal(JSON.parse(vm.runInContext('unpackStorageValue(localStorage.getItem("pt_jobs"))', app.context)).length, 1);
});
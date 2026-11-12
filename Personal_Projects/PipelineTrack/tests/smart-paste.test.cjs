const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function workspace() {
  const elements = {};
  const context = vm.createContext({
    URL, console, localStorage: { getItem: () => null },
    document: { getElementById: id => elements[id] ||= { value: '', dataset: {} } },
    updateHybridDaysVisibility() {}, updateJobDurationVisibility() {}, updateJobDuplicateNotice() {},
    updateSalaryPreview() {}, previewJobDate() {}, updateJobSourceFromUrl() {}
  });
  for (const file of ['data/catalog.js', 'core/utils.js', 'core/state.js', 'views/board.js', 'features/smart-paste.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../javascript', file), 'utf8'), context);
  }
  for (const name of ['updateHybridDaysVisibility', 'updateJobDurationVisibility', 'updateJobDuplicateNotice', 'updateSalaryPreview', 'previewJobDate', 'updateJobSourceFromUrl']) context[name] = () => {};
  return { context, elements, review: text => Object.fromEntries(context.buildSmartPasteReview(text).map(field => [field.key, field])) };
}

test('explicit metadata is selected while requirements are kept out of fields', () => {
  const { review } = workspace();
  const fields = review('Job title: Developer\nCompany: Cedar Labs\nLocation: New York, NY\nEmployment type: Full-time\nResponsibilities:\nWork with senior staff and support remote clients.');
  assert.equal(fields.role.value, 'Developer');
  assert.equal(fields.company.confident, true);
  assert.equal(fields.jobType.value, 'Full-time');
  assert.equal(fields.jobType.confident, true);
  assert.equal(fields.seniority.confident, false);
  assert.equal(fields.workType.confident, false);
});

test('unlabeled headings and conflicting labels require review', () => {
  const { review } = workspace();
  assert.equal(review('Apply now\nDeveloper\nBuild great products.').role.confident, false);
  const fields = review('Company: Cedar Labs\nCompany: Different Company');
  assert.equal(fields.company.value, '');
  assert.equal(fields.company.confident, false);
});

test('empty labels do not consume metadata from the next line', () => {
  const { review } = workspace();
  const fields = review('Company:\nLocation: New York, NY\nApply by:   \nDate posted: yesterday');
  assert.equal(fields.company.confident, false);
  assert.equal(fields.location.value, 'New York, NY');
  assert.equal(fields.deadline.confident, false);
  assert.equal(fields.datePosted.confident, true);
});

test('a future posting date stays unchecked', () => {
  const { review } = workspace();
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  assert.equal(review(`Date posted: ${future.getFullYear()}-12-31`).datePosted.confident, false);
});

test('posting age is not used as an application deadline', () => {
  const { review } = workspace();
  const fields = review('Date posted: yesterday\nApplication deadline: 2027-02-01');
  assert.equal(fields.datePosted.confident, true);
  assert.equal(fields.deadline.value, '2027-02-01');
  assert.equal(fields.deadline.confident, true);
  assert.equal(review('Posted 3 days ago\nInterviews on 2027-02-01').deadline.value, '');
});

test('ambiguous dates and negated work arrangements are not preselected', () => {
  const { review } = workspace();
  assert.equal(review('Apply by: sometime next spring').deadline.confident, false);
  assert.equal(review('Work arrangement: Not remote').workType.confident, false);
  assert.equal(review('Work arrangement: Remote or hybrid').workType.confident, false);
  assert.equal(review('Job URL: javascript:alert(1)').url.confident, false);
});

test('applying details preserves manual entries and the entire original posting', () => {
  const { context, elements } = workspace();
  context.document.getElementById('job-role').value = 'My edited title';
  const raw = 'Developer\nSalary: $70,000\nFull original posting and footer.';
  context.applySmartPasteValues({ role: 'Different title', company: 'Cedar Labs' }, raw);
  assert.equal(elements['job-role'].value, 'My edited title');
  assert.equal(elements['job-company'].value, 'Cedar Labs');
  assert.equal(elements['job-description'].value, raw);
  assert.equal(elements['job-smart-paste-original'].value, raw);
  elements['job-description'].value = 'My own description';
  context.applySmartPasteValues({}, 'Another complete posting');
  assert.equal(elements['job-description'].value, 'My own description');
});

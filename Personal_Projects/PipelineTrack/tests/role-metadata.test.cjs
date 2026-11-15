const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../javascript/core/utils.js'), 'utf8'), context);
const parse = title => JSON.parse(JSON.stringify(context.parseRoleMetadata(title)));

test('combined titles supply all three metadata fields', () => {
  assert.deepEqual(parse('Sr. Software Engineer - Full Time (Remote)'), {
    seniority: 'Senior', jobType: 'Full-time', workType: 'Remote'
  });
  assert.deepEqual(parse('Developer 2 | Contract | Hybrid'), {
    seniority: 'Mid-Level', jobType: 'Contract', workType: 'Hybrid'
  });
});

test('numeric and Roman role levels agree, with explicit seniority taking priority', () => {
  for (const [level, expected] of [['1', 'Entry Level'], ['I', 'Entry Level'], ['2', 'Mid-Level'], ['II', 'Mid-Level'], ['3', 'Senior'], ['III', 'Senior'], ['IV', 'Lead']]) {
    assert.equal(parse(`Software Engineer ${level}`).seniority, expected);
  }
  assert.equal(parse('Sr Developer II').seniority, 'Senior');
  assert.equal(parse('Jr. Analyst - Onsite - Part-time').seniority, 'Junior');
  assert.equal(parse('Analyst (Level 2)').seniority, 'Mid-Level');
});

test('parentheses preserve title metadata and role levels', () => {
  assert.deepEqual(parse('Software Engineer (II) (Contract) (Remote)'), {
    seniority: 'Mid-Level', jobType: 'Contract', workType: 'Remote'
  });
  assert.equal(parse('Developer (1)').seniority, 'Entry Level');
  assert.equal(parse('Developer (Sr.) (Full-time) (Hybrid)').seniority, 'Senior');
  assert.equal(parse('Analyst (Level 2)').seniority, 'Mid-Level');
  assert.equal(parse('Engineer (2 days per week)').seniority, '');
});

test('unrelated numbers and ambiguous or negated arrangements remain unset', () => {
  for (const title of ['Engineer - 2 days per week', 'Developer 2026', '3D Designer', 'Engineer IIoT']) {
    assert.equal(parse(title).seniority, '');
  }
  for (const title of ['Developer (not remote)', 'Developer - Remote or Hybrid']) {
    assert.equal(parse(title).workType, '');
  }
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const context = vm.createContext({ state: { profile: { skills: [{ name: 'python' }], certifications: [] } } });
for (const file of ['javascript/data/catalog.js', 'javascript/core/utils.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
const parse = text => context.parseJobRequirements(text);

test('mixed priorities remain attached to the right skill', () => {
  const result = parse('Python required, AWS preferred').requirements;
  assert.equal(result.find(r => r.skill === 'python').priority, 'required');
  assert.equal(result.find(r => r.skill === 'aws').priority, 'preferred');
});
test('numbered lists and markdown headings retain section priority', () => {
  assert.equal(parse('**Must-haves:**\n1. Python').requirements[0].priority, 'required');
  assert.equal(parse('Nice to have:\n▪ AWS').requirements[0].priority, 'preferred');
});
test('alternatives count once in initial and persisted fit scores', () => {
  const result = context.analyzeJob('Requirements:\nPython or Java required');
  assert.equal(result.score, 100);
  assert.equal(result.requirements[0].alternatives.length, 2);
  const persisted = JSON.parse(JSON.stringify(result.requirements));
  assert.equal(context.calculateRoleWeightedSkillScore(result.matched, result.missing, null, persisted), 100);
});
test('independent required mentions still count separately', () => {
  assert.equal(context.analyzeJob('Python or Java required. Java required.').score, 50);
});
test('overall and skill experience stay separate', () => {
  const result = parse('3 years overall experience and 2 years with Python').experience;
  assert.equal(result.length, 2);
  assert.equal(result[0].scope, 'overall');
  assert.equal(result[1].skills[0], 'python');
});
test('negation, benefits and dismissals do not become requirements', () => {
  assert.equal(parse('Python not required').requirements.length, 0);
  assert.equal(parse('Benefits:\nPython training').requirements.length, 0);
  assert.equal(context.parseJobRequirements('Python required', ['python']).requirements.length, 0);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function workspace() {
  const ctx = vm.createContext({});
  for (const file of ['data/catalog.js', 'core/utils.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../javascript', file), 'utf8'), ctx);
  }
  vm.runInContext('const state = { profile: { skills: [{ name: "Ceramic restoration" }] } };', ctx);
  return ctx;
}
test('new fields have detectable skills and learning search links', () => {
  const ctx = workspace();
  for (const skill of ['patient care', 'lesson planning', 'legal research', 'blueprint reading', 'welding']) {
    ctx.skill = skill;
    assert.equal(vm.runInContext('parseJobRequirements("Required: " + skill).requirements[0].skill', ctx), skill);
    assert.equal(vm.runInContext('learningSearchUrl(skill)', ctx), 'https://www.coursera.org/search?query=' + encodeURIComponent(skill));
  }
});
test('custom skills preserve priority, exclusions and negation', () => {
  const ctx = workspace();
  assert.equal(vm.runInContext('parseJobRequirements("Preferred: Ceramic restoration").requirements[0].priority', ctx), 'preferred');
  assert.equal(vm.runInContext('parseJobRequirements("No ceramic restoration required").requirements.length', ctx), 0);
  assert.equal(vm.runInContext('parseJobRequirements("Required: ceramic restoration", ["Ceramic restoration"]).requirements.length', ctx), 0);
  assert.equal(vm.runInContext('parseJobRequirements("Required: ceramic restoration").requirements[0].skill', ctx), 'ceramic restoration');
});

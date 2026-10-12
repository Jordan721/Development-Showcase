const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const storage = new Map();
const context = vm.createContext({
  console,
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  },
  document: {
    getElementById: () => ({
      addEventListener() {}
    })
  }
});
for (const file of ['data.js', 'data-industries.js', 'utils.js', 'state.js', 'career-flow.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context, {
    filename: file
  });
}
const run = code => vm.runInContext(code, context);
assert.equal(run("_skillRegex('r').test('Requirements')"), false);
assert.equal(run("_skillRegex('c++').test('Skills: C++ and SQL')"), true);
assert.equal(run("extractResumeSections('Summary\\nAnalyst\\nExperience\\nBuilt reports\\nSkills\\nSQL\\nEducation\\nState College').experience"), 'Built reports');
assert.equal(run("extractResumeSections('No headings here').education"), '');
run(`state.jobs = [
  {id:'one', role:'Developer', company:'A', stage:'saved', description:'Python and SQL'},
  {id:'two', role:'Analyst', company:'B', stage:'applied', description:'SQL'},
  {id:'old', stage:'archived', description:'Java'}
]; state.profile.skills = [{name:'python',level:'Intermediate'}];`);
assert.equal(run("careerLearningEntries().find(e => e.skill === 'sql').jobs.length"), 2);
assert.equal(run("careerLearningEntries().some(e => e.skill === 'python')"), false);
assert.equal(run("careerLearningEntries().some(e => e.skill === 'java')"), false);
run("careerTargetJobId = 'one'");
assert.equal(run("careerLearningEntries().find(e => e.skill === 'sql').jobs.length"), 1);
run("state.savedCourses = ['react']; careerLearningProgress().react = 'completed'; state.profile.resumeSections = {education:'College'}; save(); load();");
assert.equal(run("state.profile.learningProgress.react"), 'completed');
assert.equal(run("state.profile.resumeSections.education"), 'College');
assert.equal(run("careerLearningEntries().find(e => e.skill === 'react').progress"), 'completed');
assert.equal(run("_normalizeBackupData({profile:state.profile}).profile.learningProgress.react"), 'completed');
assert.equal(run("careerJobLabel(state.jobs[0])"), 'Developer · A');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const learningSection = html.slice(html.indexOf('id="view-learning"'), html.indexOf('id="view-resume"'));
assert.ok(learningSection.includes('id="learning-plan"'));
assert.equal((html.match(/id="learning-plan"/g) || []).length, 1);
assert.ok(html.indexOf('javascript/career-flow.js') < html.indexOf('javascript/app.js'));
run("state.profile.skills.push({name:'sql',level:'Beginner'})");
assert.equal(run("careerLearningEntries().some(e => e.skill === 'sql')"), false);
console.log('Career flow checks passed: extraction, boundaries, active job gaps, target focus, saved plans, persistence, and backup normalization.');
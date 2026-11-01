'use strict';

let careerTargetJobId = '';
let careerResumeText = '';

function careerJobs() {
  return state.jobs.filter(job => !['declined', 'withdrew', 'ghosted', 'archived'].includes(job.stage));
}

function careerJobLabel(job) {
  return [job.role || job.title, job.company].filter(Boolean).join(' · ') || 'Untitled job';
}

function careerRequirements(job) {
  const description = job.description || '';
  const detected = [...KNOWN_SKILLS].filter(skill => _skillRegex(skill).test(description));
  return [...new Set([...detected, ...(job.matched || []), ...(job.missing || [])])];
}

function careerJobOptions(includeAll = false) {
  return `<option value="">${includeAll ? 'All active jobs' : 'Choose a tracked job'}</option>` + careerJobs().map(job =>
    `<option value="${escHtml(job.id)}" ${job.id === careerTargetJobId ? 'selected' : ''}>${escHtml(careerJobLabel(job))}</option>`).join('');
}

function extractResumeSections(text) {
  const result = {
    summary: '',
    experience: '',
    education: ''
  };
  const headings = {
    summary: /^(professional\s+)?(summary|objective|about me|profile|overview)$/i,
    experience: /^(professional\s+|work\s+|relevant\s+)?(experience|employment|work history)$/i,
    education: /^education(\s*(and|&)\s*qualifications)?$/i
  };
  let section = '';
  for (const line of text.split(/\r?\n/)) {
    const heading = line.trim().replace(/:$/, '');
    const match = Object.keys(headings).find(key => headings[key].test(heading));
    if (match) section = match;
    else if (/^(skills|technical skills|certifications|projects|awards|references|languages|interests)$/i.test(heading)) section = '';
    else if (section) result[section] += line + '\n';
  }
  Object.keys(result).forEach(key => result[key] = result[key].trim());
  return result;
}

function parseResume() {
  const text = document.getElementById('resume-text').value;
  if (!text.trim()) {
    scanResumeSkills();
    return;
  }
  careerResumeText = text;
  scanResumeSkills();
  const sections = extractResumeSections(text);
  const review = document.getElementById('resume-career-review');
  review.hidden = false;
  review.innerHTML = `
    <div class="career-review-grid">
      <div class="career-panel">
        <div class="workspace-eyebrow">RESUME PREVIEW</div><h3>Detected sections</h3>
        <p class="career-muted">Check what the scanner found. Make corrections in the resume text above and scan again.</p>
        ${Object.entries(sections).map(([key, value]) => `<div class="career-section-draft"><h4>${key.charAt(0).toUpperCase() + key.slice(1)} ${!value ? '<span class="career-review-badge">Not detected</span>' : ''}</h4><p class="career-section-preview">${escHtml(value || 'No section text found under a recognized heading.')}</p></div>`).join('')}
      </div>
      <div class="career-panel">
        <div class="workspace-eyebrow">FROM RESUME TO NEXT MOVE</div><h3>Compare a job</h3>
        <label class="form-label" for="career-compare-job">Target opportunity</label>
        <select class="select-input" id="career-compare-job">${careerJobOptions()}</select>
        <div id="career-comparison" aria-live="polite"></div>
        <button class="btn-primary" id="career-open-learning">Build my learning plan →</button>
        <div class="career-feedback"><h3>Writing to revisit</h3>${careerWritingFeedback(text)}</div>
      </div>
    </div>`;
  document.getElementById('career-compare-job').addEventListener('change', event => {
    careerTargetJobId = event.target.value;
    renderCareerComparison();
  });
  document.getElementById('career-open-learning').addEventListener('click', () => {
    document.getElementById('show-bookmarked').checked = false;
    navigate('learning');
  });
  renderCareerComparison();
}

function careerWritingFeedback(text) {
  const suggestions = WRITING_RULES.filter(rule => {
      rule.pattern.lastIndex = 0;
      return rule.pattern.test(text);
    })
    .slice(0, 3).map(rule => `<li><strong>${escHtml(rule.label)}</strong> — ${escHtml(rule.suggestion)}</li>`);
  if (!/\d+\s*%|\$[\d,]+|\d+\+?\s*(users|clients|projects|people|hours)/i.test(text)) {
    suggestions.push('<li>Add a measurable result where you have one. Try: “Improved [process] by [measured result] through [your action].” Replace the brackets with facts from your experience.</li>');
  }
  return suggestions.length ? `<ul>${suggestions.join('')}</ul>` : '<p class="career-muted">No common weak phrases detected. Check that each bullet explains your action and its result.</p>';
}

function renderCareerComparison() {
  const container = document.getElementById('career-comparison');
  const job = careerJobs().find(item => item.id === careerTargetJobId);
  if (!job) {
    container.innerHTML = `<p class="career-muted">${careerJobs().length ? 'Choose a job to compare the skills mentioned in this resume with its requirements.' : 'Add an active job with a description to compare your resume.'}</p>`;
    return;
  }
  const requirements = careerRequirements(job);
  const matched = requirements.filter(skill => _skillRegex(skill).test(careerResumeText));
  const missing = requirements.filter(skill => !matched.includes(skill));
  container.innerHTML = requirements.length ? `
    <div class="career-fit"><strong>${Math.round(matched.length / requirements.length * 100)}%</strong><span>of detected job skills mentioned<br>${matched.length} of ${requirements.length} skills · keyword comparison</span></div>
    <h4>Mentioned in your resume</h4><div class="career-chips">${matched.map(skill => `<span>${escHtml(skill)}</span>`).join('') || '<p class="career-muted">No matches detected.</p>'}</div>
    <h4>Not mentioned</h4><div class="career-chips career-chips--gap">${missing.map(skill => `<span>${escHtml(skill)}</span>`).join('') || '<p class="career-muted">All detected requirements are mentioned.</p>'}</div>
    <p class="career-muted">Review missing mentions against your experience. Import skills you have; use the learning plan for gaps in your profile.</p>` : '<p class="career-muted">No recognized requirements yet. Add a job description and analyze it first.</p>';
}

function careerLearningProgress() {
  if (!state.profile.learningProgress || typeof state.profile.learningProgress !== 'object' || Array.isArray(state.profile.learningProgress)) state.profile.learningProgress = {};
  return state.profile.learningProgress;
}

function careerLearningEntries() {
  const jobs = careerJobs().filter(job => !careerTargetJobId || job.id === careerTargetJobId);
  const gaps = new Map();
  jobs.forEach(job => analyzeJobForRole(job).missing.forEach(skill => {
    if (!gaps.has(skill)) gaps.set(skill, []);
    gaps.get(skill).push(job);
  }));
  const progress = careerLearningProgress();
  const skills = new Set([...gaps.keys(), ...state.savedCourses, ...Object.keys(progress)]);
  return [...skills].map(skill => ({
      skill,
      jobs: gaps.get(skill) || [],
      resource: LEARNING[skill],
      progress: progress[skill] || 'not-started'
    }))
    .sort((a, b) => b.jobs.length - a.jobs.length || a.skill.localeCompare(b.skill));
}

document.getElementById('resume-text').addEventListener('input', () => {
  if (!careerResumeText) return;
  document.getElementById('resume-career-review').hidden = true;
  document.getElementById('resume-parse-results').innerHTML = '<p class="parse-placeholder">Resume text changed. Scan again to update your review.</p>';
  careerResumeText = '';
});

function renderLearning() {
  if (careerTargetJobId && !careerJobs().some(job => job.id === careerTargetJobId)) careerTargetJobId = '';
  const entries = careerLearningEntries();
  const planned = entries.filter(entry => state.savedCourses.includes(entry.skill) || entry.progress !== 'not-started');
  const completed = planned.filter(entry => entry.progress === 'completed').length;
  const next = entries.find(entry => entry.jobs.length && entry.progress !== 'completed');
  const panel = document.getElementById('learning-plan');
  panel.innerHTML = `<div class="career-plan-heading"><div><div class="workspace-eyebrow">YOUR NEXT CHAPTER</div><h2>A learning plan with a purpose.</h2><p class="career-muted">Prioritized by demand in active jobs. Completing a course does not automatically add a profile skill.</p></div><button class="btn-secondary" id="learning-review-resume">Review my resume →</button></div>
    <div class="career-plan-stats"><div><strong>${entries.filter(entry => entry.jobs.length).length}</strong><span>Skill gaps</span></div><div><strong>${planned.length}</strong><span>In your plan</span></div><div><strong>${completed}</strong><span>Completed</span></div></div>
    <label class="form-label" for="learning-target-job">Focus your recommendations</label><select class="select-input" id="learning-target-job">${careerJobOptions(true)}</select>
    ${next ? `<p class="career-next"><strong>Learn next: ${escHtml(next.skill)}</strong> · Needed by ${next.jobs.length} active job${next.jobs.length !== 1 ? 's' : ''}. Start with the resource, practice on a small project, then update your profile when ready.</p>` : '<p class="career-next">Add jobs with descriptions or review your profile to find your next learning priority.</p>'}
    ${planned.length ? `<div class="career-path"><h3>Your learning path</h3><ol>${planned.map(entry => `<li><strong>${escHtml(entry.skill)}</strong><span>${entry.progress === 'completed' ? 'Completed ✓' : entry.progress === 'in-progress' ? 'In progress' : 'Planned'}</span></li>`).join('')}</ol><progress max="${planned.length}" value="${completed}" aria-label="Completed courses in your learning plan"></progress></div>` : ''}`;
  document.getElementById('learning-review-resume').addEventListener('click', () => navigate('resume'));
  document.getElementById('learning-target-job').addEventListener('change', event => {
    careerTargetJobId = event.target.value;
    renderLearning();
  });
  const bookmarkedOnly = document.getElementById('show-bookmarked').checked;
  const visible = entries.filter(entry => bookmarkedOnly ? state.savedCourses.includes(entry.skill) : entry.jobs.length || state.savedCourses.includes(entry.skill) || entry.progress !== 'not-started');
  const grid = document.getElementById('learning-grid');
  if (!visible.length) {
    grid.innerHTML = `<p class="learning-empty">${bookmarkedOnly ? 'No saved courses yet. Save a recommendation to start your plan.' : !careerJobs().length ? 'Add active jobs with descriptions to find skills worth learning.' : 'No recognized skill gaps in this selection. Check that your jobs have descriptions and your profile is up to date.'}</p>`;
    return;
  }
  grid.innerHTML = visible.map(entry => {
    const {
      skill,
      jobs,
      resource,
      progress
    } = entry;
    const saved = state.savedCourses.includes(skill);
    return `<article class="learning-card ${saved ? 'bookmarked' : ''}">
      <div class="learning-card-top"><h3 class="learning-skill">${escHtml(skill)}</h3><button type="button" class="learning-bookmark" data-bookmark="${escHtml(skill)}" aria-label="${saved ? 'Unsave' : 'Save'} ${escHtml(skill)}" aria-pressed="${saved}">${saved ? '★' : '☆'}</button></div>
      <div class="learning-course">${resource ? escHtml(resource.course) : 'Build your own practice plan'}</div>
      <div class="learning-provider">${resource ? escHtml(resource.provider) : 'No curated course for this skill yet'}</div>
      ${resource ? `<div class="learning-meta"><span class="learning-tag">${escHtml(resource.time)} · catalog estimate</span></div>` : ''}
      <p class="career-muted">${jobs.length ? `Needed by ${jobs.length} active job${jobs.length !== 1 ? 's' : ''}` : 'Saved in your plan · no current gap in this selection'}</p>
      ${jobs.length ? `<details class="career-job-details"><summary>See related opportunities</summary><ul>${jobs.map(job => `<li>${escHtml(careerJobLabel(job))}</li>`).join('')}</ul></details>` : ''}
      <label class="form-label" for="learn-${escHtml(skill)}">Learning progress</label><select class="select-input" id="learn-${escHtml(skill)}" data-learning-progress="${escHtml(skill)}">${[['not-started', 'Not started'], ['in-progress', 'In progress'], ['completed', 'Completed']].map(([value, label]) => `<option value="${value}" ${value === progress ? 'selected' : ''}>${label}</option>`).join('')}</select>
      ${resource ? `<a class="btn-primary" href="${escHtml(resource.url)}" target="_blank" rel="noopener">Open course ↗</a><p class="career-muted career-catalog-note">Check current pricing, level, and duration with the provider.</p>` : '<p class="career-muted">Choose a resource, practice this skill, and record your progress here.</p>'}
    </article>`;
  }).join('');
  grid.querySelectorAll('[data-bookmark]').forEach(button => button.addEventListener('click', () => {
    const skill = button.dataset.bookmark;
    const index = state.savedCourses.indexOf(skill);
    if (index < 0) state.savedCourses.push(skill);
    else state.savedCourses.splice(index, 1);
    save();
    renderLearning();
  }));
  grid.querySelectorAll('[data-learning-progress]').forEach(select => select.addEventListener('change', () => {
    careerLearningProgress()[select.dataset.learningProgress] = select.value;
    save();
    renderLearning();
    toast('Learning progress saved.', 'success');
  }));
}
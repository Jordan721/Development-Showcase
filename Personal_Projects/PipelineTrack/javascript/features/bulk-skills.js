'use strict';

let bulkSkillReview = [];
let bulkSkillReviewLevel = 'Intermediate';

function cleanBulkSkill(value) {
  return normalizeSkillName(String(value).trim().replace(/\s+/g, ' '));
}

function skillEditDistance(a, b) {
  let row = Array.from({
    length: b.length + 1
  }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    row = next;
  }
  return row[b.length];
}

function bulkSkillSuggestion(name) {
  const lower = name.toLowerCase();
  if (lower.length < 4 || lower.length > 80 || KNOWN_SKILLS.has(lower) || Object.prototype.hasOwnProperty.call(SKILL_CANONICAL, lower)) return '';
  const limit = lower.length >= 8 ? 2 : 1;
  let best = limit + 1;
  const matches = new Set();
  const candidates = new Set([...KNOWN_SKILLS, ...Object.keys(SKILL_CANONICAL)]);
  candidates.forEach(candidate => {
    if (Math.abs(candidate.length - lower.length) > limit) return;
    const distance = skillEditDistance(lower, candidate);
    if (distance > limit || distance > best) return;
    if (distance < best) {
      best = distance;
      matches.clear();
    }
    matches.add(cleanBulkSkill(candidate));
  });
  return matches.size === 1 ? [...matches][0] : '';
}

function buildBulkSkillReview(raw) {
  return raw.split(/[\n,;]+/).map(value => {
    const name = cleanBulkSkill(value);
    return {
      original: value.trim(),
      name,
      selected: true,
      suggestion: name ? bulkSkillSuggestion(name) : ''
    };
  }).filter(entry => entry.name);
}

function bulkSkillReviewStatus(entries) {
  const seen = new Set(state.profile.skills.map(skill => cleanBulkSkill(skill.name).toLowerCase()));
  return entries.map(entry => {
    const name = cleanBulkSkill(entry.name);
    if (!entry.selected) return {
      name,
      status: 'Excluded'
    };
    if (!name) return {
      name,
      status: 'Enter a skill name'
    };
    if (seen.has(name.toLowerCase())) return {
      name,
      status: 'Duplicate — skipped'
    };
    seen.add(name.toLowerCase());
    return {
      name,
      status: 'Ready to add'
    };
  });
}

function updateBulkSkillReview() {
  const statuses = bulkSkillReviewStatus(bulkSkillReview);
  const count = statuses.filter(entry => entry.status === 'Ready to add').length;
  document.getElementById('bulk-review-summary').textContent = `${count} new skill${count === 1 ? '' : 's'} ready · Level: ${bulkSkillReviewLevel}`;
  const add = document.getElementById('bulk-review-confirm');
  add.textContent = `Add ${count} skill${count === 1 ? '' : 's'}`;
  add.disabled = count === 0;
  document.querySelectorAll('.bulk-review-row').forEach((row, index) => {
    row.querySelector('.bulk-review-status').textContent = statuses[index].status;
    row.classList.toggle('bulk-review-skipped', statuses[index].status !== 'Ready to add');
  });
}

function openBulkSkillReview(raw, level) {
  bulkSkillReview = buildBulkSkillReview(raw);
  if (!bulkSkillReview.length) {
    toast('Enter skills separated by commas, semicolons, or lines.', 'error');
    return;
  }
  bulkSkillReviewLevel = LEVELS.includes(level) ? level : 'Intermediate';
  document.getElementById('bulk-review-list').innerHTML = bulkSkillReview.map((entry, index) => `<div class="bulk-review-row">
    <input type="checkbox" class="bulk-review-check" data-review-index="${index}" checked aria-label="Include ${escHtml(entry.name)}" />
    <div class="bulk-review-copy"><label for="bulk-review-name-${index}">Pasted: ${escHtml(entry.original)}</label>
      <input type="text" class="text-input bulk-review-name" id="bulk-review-name-${index}" data-review-index="${index}" value="${escHtml(entry.name)}" spellcheck="false" />
      <span class="bulk-review-status"></span>${entry.suggestion ? `<button type="button" class="bulk-review-suggestion" data-review-index="${index}">Use suggested spelling: ${escHtml(entry.suggestion)}</button>` : ''}
    </div></div>`).join('');
  document.querySelectorAll('.bulk-review-check').forEach(input => input.onchange = () => {
    bulkSkillReview[Number(input.dataset.reviewIndex)].selected = input.checked;
    updateBulkSkillReview();
  });
  document.querySelectorAll('.bulk-review-name').forEach(input => input.oninput = () => {
    bulkSkillReview[Number(input.dataset.reviewIndex)].name = input.value;
    updateBulkSkillReview();
  });
  document.querySelectorAll('.bulk-review-suggestion').forEach(button => button.onclick = () => {
    const index = Number(button.dataset.reviewIndex);
    bulkSkillReview[index].name = bulkSkillReview[index].suggestion;
    document.getElementById('bulk-review-name-' + index).value = bulkSkillReview[index].name;
    button.hidden = true;
    updateBulkSkillReview();
  });
  document.getElementById('bulk-review-confirm').onclick = confirmBulkSkills;
  updateBulkSkillReview();
  openModal('modal-bulk-skills');
}

function confirmBulkSkills() {
  const additions = bulkSkillReviewStatus(bulkSkillReview).filter(entry => entry.status === 'Ready to add');
  if (!additions.length) return;
  state.profile.skills.push(...additions.map(entry => ({
    name: entry.name,
    level: bulkSkillReviewLevel
  })));
  save();
  reanalyzeAllJobs();
  renderProfile();
  closeModal('modal-bulk-skills');
  document.getElementById('bulk-skill-input').value = '';
  document.getElementById('bulk-skill-area').style.display = 'none';
  toast(`${additions.length} skill${additions.length === 1 ? '' : 's'} added.`, 'success');
  bulkSkillReview = [];
}
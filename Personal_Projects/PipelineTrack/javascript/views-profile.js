'use strict';

/* ══════════════════════════════════════════════════════════
   PROFILE
   ══════════════════════════════════════════════════════════ */
function renderProfile() {
  renderSkillTags();
  renderCertTags();
  document.getElementById('profile-summary').value = state.profile.summary || '';
  renderCoverageBars();
  renderLinks();
}

function renderLinks() {
  const links = state.profile.links || {};
  ['linkedin', 'github', 'portfolio'].forEach(key => {
    const input = document.getElementById('link-' + key);
    const openBtn = document.getElementById('link-' + key + '-open');
    if (!input) return;
    input.value = links[key] || '';
    if (links[key]) {
      openBtn.href = links[key];
      openBtn.style.display = '';
    } else {
      openBtn.style.display = 'none';
    }
  });
}

function saveLinks() {
  state.profile.links = {
    linkedin: document.getElementById('link-linkedin').value.trim(),
    github: document.getElementById('link-github').value.trim(),
    portfolio: document.getElementById('link-portfolio').value.trim(),
  };
  save();
  renderLinks();
  toast('Links saved!', 'success');
}

const CERT_TYPES = ["Certificate","Associate's","Bachelor's","Master's","PhD","Bootcamp","License"];

function certTypeOptions(selected) {
  return CERT_TYPES.map(t => `<option value="${t}"${t === selected ? ' selected' : ''}>${t}</option>`).join('');
}

function renderCertTags() {
  const container = document.getElementById('cert-tags-container');
  const certs = state.profile.certifications;
  if (certs.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="margin-top:8px">No certifications, degrees, or licenses added yet.</p>';
    return;
  }
  container.innerHTML = certs.map((c, i) => `
    <div class="cert-card" data-cert-index="${i}">
      <div class="cert-card-view">
        <div class="cert-card-header">
          <span class="cert-card-name">${escHtml(c.name)}</span>
          <span class="level">${escHtml(c.type)}</span>
          <button class="cert-card-edit" data-index="${i}" title="Edit">✎</button>
          <button class="cert-card-remove" data-index="${i}" title="Remove">✕</button>
        </div>
        ${c.description ? `<div class="cert-card-desc">${escHtml(c.description)}</div>` : '<div class="cert-card-desc cert-no-desc">No description — click ✎ to add one</div>'}
      </div>
      <div class="cert-card-edit-form" style="display:none">
        <input class="text-input cert-edit-name" value="${escHtml(c.name)}" placeholder="Name" />
        <select class="select-input cert-edit-type">${certTypeOptions(c.type)}</select>
        <textarea class="text-area cert-edit-desc" rows="2" placeholder="Skills covered, technologies, field of study…">${escHtml(c.description || '')}</textarea>
        <div class="cert-edit-actions">
          <button class="btn-primary cert-save-btn" data-index="${i}">Save</button>
          <button class="btn-ghost cert-cancel-btn" data-index="${i}">Cancel</button>
        </div>
      </div>
    </div>
  `).join('');

  // Edit button — toggle to edit form
  container.querySelectorAll('.cert-card-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = container.querySelector(`.cert-card[data-cert-index="${btn.dataset.index}"]`);
      card.querySelector('.cert-card-view').style.display = 'none';
      card.querySelector('.cert-card-edit-form').style.display = '';
      card.querySelector('.cert-edit-name').focus();
    });
  });

  // Cancel — back to view
  container.querySelectorAll('.cert-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = container.querySelector(`.cert-card[data-cert-index="${btn.dataset.index}"]`);
      card.querySelector('.cert-card-view').style.display = '';
      card.querySelector('.cert-card-edit-form').style.display = 'none';
    });
  });

  // Save edit
  container.querySelectorAll('.cert-save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const card = container.querySelector(`.cert-card[data-cert-index="${idx}"]`);
      const name = card.querySelector('.cert-edit-name').value.trim();
      if (!name) { toast('Name is required.', 'error'); return; }
      state.profile.certifications[idx] = {
        name,
        type: card.querySelector('.cert-edit-type').value,
        description: card.querySelector('.cert-edit-desc').value.trim(),
      };
      save();
      reanalyzeAllJobs();
      renderCertTags();
      toast('Updated!', 'success');
    });
  });

  // Remove
  container.querySelectorAll('.cert-card-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.certifications.splice(parseInt(btn.dataset.index), 1);
      save();
      reanalyzeAllJobs();
      renderCertTags();
    });
  });
}

function addCert() {
  const input = document.getElementById('cert-input');
  const descEl = document.getElementById('cert-desc');
  const type = document.getElementById('cert-type').value;
  const name = input.value.trim();
  const description = descEl ? descEl.value.trim() : '';
  if (!name) return;
  if (state.profile.certifications.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    toast('Already added.', 'error');
    return;
  }
  state.profile.certifications.push({ name, type, description });
  input.value = '';
  if (descEl) descEl.value = '';
  save();
  reanalyzeAllJobs();
  renderCertTags();
  toast(`"${name}" added!`, 'success');
}

const SKILL_SHOW_LIMIT = 10;
const LEVELS = ['Beginner', 'Intermediate', 'Expert'];

function renderSkillTags() {
  const container = document.getElementById('skill-tags-container');
  const footer = document.getElementById('skill-footer');
  const skills = state.profile.skills;

  if (skills.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="margin-top:8px">No skills added yet.</p>';
    if (footer) footer.innerHTML = '';
    return;
  }

  if (typeof window._skillsExpanded === 'undefined') window._skillsExpanded = false;
  if (typeof window._skillFilter === 'undefined') window._skillFilter = 'all';

  // Sort Expert → Intermediate → Beginner, preserving original array indices
  const sorted = ['Expert', 'Intermediate', 'Beginner'].flatMap(lvl =>
    skills.map((s, i) => ({
      ...s,
      realIdx: i
    })).filter(s => s.level === lvl)
  );

  // Apply level filter
  const activeFilter = window._skillFilter;
  const filtered = activeFilter === 'all' ? sorted : sorted.filter(s => s.level === activeFilter);

  // Sync filter pill active state
  document.querySelectorAll('.skill-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === activeFilter);
  });

  const showAll = window._skillsExpanded || filtered.length <= SKILL_SHOW_LIMIT;
  const visible = showAll ? filtered : filtered.slice(0, SKILL_SHOW_LIMIT);

  // Build HTML — only show group labels when viewing all levels
  const showGroups = activeFilter === 'all';
  let html = '';
  let lastLevel = null;
  visible.forEach(s => {
    if (showGroups && s.level !== lastLevel) {
      lastLevel = s.level;
      const groupTotal = filtered.filter(x => x.level === s.level).length;
      const groupVisible = visible.filter(x => x.level === s.level).length;
      const note = groupVisible < groupTotal ? ` · ${groupVisible} of ${groupTotal}` : ` · ${groupTotal}`;
      html += `<span class="skill-group-label" data-group="${s.level}">${s.level}${note}</span>`;
    }
    html += `<span class="skill-tag" data-skill="${escHtml(s.name)}" data-level="${s.level}">
      ${escHtml(s.name)}
      <button class="level level-btn" data-index="${s.realIdx}" title="Click to change level">${s.level}</button>
      <span class="skill-tag-remove" data-index="${s.realIdx}">✕</span>
    </span>`;
  });
  container.innerHTML = html;

  container.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const cur = state.profile.skills[idx].level;
      state.profile.skills[idx].level = LEVELS[(LEVELS.indexOf(cur) + 1) % LEVELS.length];
      save();
      reanalyzeAllJobs();
      renderSkillTags();
      if (state.activeView === 'dashboard') renderDashboard();
    });
  });

  container.querySelectorAll('.skill-tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.skills.splice(parseInt(btn.dataset.index), 1);
      save();
      reanalyzeAllJobs();
      renderProfile();
      if (state.activeView === 'dashboard') renderDashboard();
    });
  });

  if (footer) {
    const hidden = filtered.length - SKILL_SHOW_LIMIT;
    const expandBtn = filtered.length > SKILL_SHOW_LIMIT ?
      `<button class="skill-expand-toggle" id="skill-expand-toggle">${showAll ? 'Show fewer' : `Show ${hidden} more`}</button>` :
      '';
    footer.innerHTML = `
      <div class="skill-footer-left">${expandBtn}</div>
      <button class="skill-clear-btn" id="clear-skills-btn">Clear all</button>
    `;

    const toggleBtn = document.getElementById('skill-expand-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        window._skillsExpanded = !window._skillsExpanded;
        renderSkillTags();
      });
    }

    document.getElementById('clear-skills-btn').addEventListener('click', () => {
      if (!confirm(`Remove all ${skills.length} skill${skills.length !== 1 ? 's' : ''}?`)) return;
      state.profile.skills = [];
      window._skillsExpanded = false;
      save();
      reanalyzeAllJobs();
      renderProfile();
      if (state.activeView === 'dashboard') renderDashboard();
      toast('All skills cleared.', 'success');
    });
  }
}

const COVERAGE_SHOW_LIMIT = 8;

function renderCoverageBars() {
  const el = document.getElementById('skill-coverage-bars');
  const footer = document.getElementById('coverage-footer');
  const skills = state.profile.skills;

  if (skills.length === 0) {
    el.innerHTML = '<p class="empty-msg">Add skills to see coverage.</p>';
    if (footer) footer.innerHTML = '';
    return;
  }

  if (typeof window._coverageExpanded === 'undefined') window._coverageExpanded = false;
  if (typeof window._coverageFilter === 'undefined') window._coverageFilter = 'all';

  const jobCount = state.jobs.length;
  const countMap = {};
  state.jobs.forEach(j => (j.matched || []).forEach(skill => {
    const match = skills.find(s => s.name.toLowerCase().includes(skill) || skill.includes(s.name.toLowerCase()));
    if (match) countMap[match.name] = (countMap[match.name] || 0) + 1;
  }));

  // Sort Expert → Intermediate → Beginner, then apply filter
  const sorted = ['Expert', 'Intermediate', 'Beginner'].flatMap(lvl =>
    skills.filter(s => s.level === lvl)
  );
  const activeCoverageFilter = window._coverageFilter;
  const filtered = activeCoverageFilter === 'all' ? sorted : sorted.filter(s => s.level === activeCoverageFilter);

  // Sync filter pill active state
  document.querySelectorAll('.coverage-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === activeCoverageFilter);
  });

  const showAll = window._coverageExpanded || filtered.length <= COVERAGE_SHOW_LIMIT;
  const visible = showAll ? filtered : filtered.slice(0, COVERAGE_SHOW_LIMIT);

  // Group labels only when showing all levels
  const showCoverageGroups = activeCoverageFilter === 'all';
  let html = '';
  let lastLevel = null;
  visible.forEach(s => {
    if (showCoverageGroups && s.level !== lastLevel) {
      lastLevel = s.level;
      const groupTotal = filtered.filter(x => x.level === s.level).length;
      const groupVisible = visible.filter(x => x.level === s.level).length;
      const note = groupVisible < groupTotal ? ` · ${groupVisible} of ${groupTotal}` : ` · ${groupTotal}`;
      html += `<div class="coverage-group-label" data-group="${s.level}">${s.level}${note}</div>`;
    }
    const count = countMap[s.name] || 0;
    const pct = jobCount > 0 ? Math.round((count / jobCount) * 100) : 0;
    html += `<div class="coverage-row">
      <div class="coverage-skill">${escHtml(s.name)}</div>
      <div class="coverage-track"><div class="coverage-fill" style="width:${pct}%"></div></div>
      <div class="coverage-count">${count} jobs</div>
    </div>`;
  });
  el.innerHTML = html;

  if (footer) {
    const hidden = filtered.length - COVERAGE_SHOW_LIMIT;
    footer.innerHTML = filtered.length > COVERAGE_SHOW_LIMIT ?
      `<button class="skill-expand-toggle" id="coverage-expand-toggle">${showAll ? 'Show fewer' : `Show ${hidden} more`}</button>` :
      '';
    const toggleBtn = document.getElementById('coverage-expand-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        window._coverageExpanded = !window._coverageExpanded;
        renderCoverageBars();
      });
    }
  }

  if (typeof animateBars === 'function') animateBars('.coverage-fill');
}

function addSkill() {
  const input = document.getElementById('skill-input');
  const level = document.getElementById('skill-level').value;
  const name = input.value.trim();
  if (!name) return;
  if (state.profile.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    toast('Skill already added.', 'error');
    return;
  }
  state.profile.skills.push({
    name,
    level
  });
  input.value = '';
  save();
  reanalyzeAllJobs();
  renderProfile();
  if (typeof animateNewSkillTags === 'function') animateNewSkillTags(1, name);
  if (state.activeView === 'dashboard') renderDashboard();
  toast(`"${name}" added!`, 'success');
}

function bulkAddSkills() {
  const textarea = document.getElementById('bulk-skill-input');
  const level = document.getElementById('skill-level').value;
  const raw = textarea.value.trim();
  if (!raw) return;

  const names = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  let added = 0,
    skipped = 0;
  names.forEach(name => {
    if (state.profile.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      skipped++;
    } else {
      state.profile.skills.push({
        name,
        level
      });
      added++;
    }
  });

  textarea.value = '';
  document.getElementById('bulk-skill-area').style.display = 'none';
  save();
  reanalyzeAllJobs();
  renderProfile();
  if (state.activeView === 'dashboard') renderDashboard();
  let msg = `${added} skill${added !== 1 ? 's' : ''} added`;
  if (skipped) msg += `, ${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped`;
  toast(msg, added > 0 ? 'success' : 'error');
}

function reanalyzeAllJobs() {
  state.jobs = state.jobs.map(j => {
    const {
      score,
      matched,
      missing
    } = analyzeJob(j.description);
    return {
      ...j,
      fitScore: score,
      matched,
      missing
    };
  });
  save();
}

'use strict';

/* ══════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════ */
function renderDashboard() {
  const jobs = state.jobs;

  const total = jobs.length;
  const applied = jobs.filter(j => j.stage === 'applied').length;
  const progress = jobs.filter(j => ['screening', 'interview'].includes(j.stage)).length;
  const offers = jobs.filter(j => j.stage === 'offer').length;
  const declined = jobs.filter(j => j.stage === 'declined').length;

  const scored = jobs.filter(j => j.fitScore !== null && j.fitScore !== undefined);
  const avgFit = scored.length ? Math.round(scored.reduce((a, j) => a + j.fitScore, 0) / scored.length) : null;

  // Set stat values; data-count + data-suffix drive the count-up animation
  const setStatCount = (id, val, suffix) => {
    suffix = suffix || '';
    const el = document.getElementById(id);
    el.dataset.count = val;
    el.dataset.suffix = suffix;
    el.textContent = val + suffix; // instant fallback before animation runs
  };
  setStatCount('stat-total', total);
  setStatCount('stat-applied', applied);
  setStatCount('stat-progress', progress);
  setStatCount('stat-offers', offers);
  setStatCount('stat-declined', declined);
  if (avgFit !== null) {
    setStatCount('stat-fit', avgFit, '%');
  } else {
    const fitEl = document.getElementById('stat-fit');
    fitEl.textContent = '—';
    delete fitEl.dataset.count;
  }
  document.getElementById('sidebar-job-count').textContent = `${total} job${total !== 1 ? 's' : ''} tracked`;

  // Gap aggregation
  const gapCount = {};
  jobs.forEach(j => (j.missing || []).forEach(skill => {
    gapCount[skill] = (gapCount[skill] || 0) + 1;
  }));
  const sortedGaps = Object.entries(gapCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const gapsEl = document.getElementById('dash-gaps');
  if (sortedGaps.length === 0) {
    gapsEl.innerHTML = '<p class="empty-msg">Add jobs with descriptions to see skill gaps.</p>';
  } else {
    gapsEl.innerHTML = sortedGaps.map(([skill, count]) =>
      `<span class="gap-tag">${skill} <span class="gap-count">${count}</span></span>`
    ).join('');
  }

  // Recent activity
  const recent = [...jobs].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 6);
  const recentEl = document.getElementById('dash-recent');
  if (recent.length === 0) {
    recentEl.innerHTML = '<p class="empty-msg">No jobs tracked yet.</p>';
  } else {
    recentEl.innerHTML = recent.map(j => `
      <div class="recent-item" data-job-id="${j.id}" style="cursor:pointer">
        <div>
          <div class="recent-role">${j.role}</div>
          <div class="recent-company">${j.company}</div>
        </div>
        <div class="recent-date">${formatDate(j.dateAdded)}</div>
      </div>
    `).join('');
    recentEl.querySelectorAll('.recent-item').forEach(el => {
      el.addEventListener('click', () => openJobDetail(el.dataset.jobId));
    });
  }

  // Pipeline bars
  const maxCount = Math.max(...STAGES.filter(s => s !== 'archived').map(s => jobs.filter(j => j.stage === s).length), 1);
  const barsEl = document.getElementById('dash-pipeline-bars');
  barsEl.innerHTML = STAGES.filter(s => s !== 'archived').map(stage => {
    const count = jobs.filter(j => j.stage === stage).length;
    const pct = Math.round((count / maxCount) * 100);
    return `
      <div class="pipeline-bar-row">
        <div class="pipeline-bar-label">${STAGE_LABELS[stage]}</div>
        <div class="pipeline-bar-track"><div class="pipeline-bar-fill" style="width:${pct}%"></div></div>
        <div class="pipeline-bar-count">${count}</div>
      </div>`;
  }).join('');

  // Top skills — green if matched in any tracked job
  const skillsEl = document.getElementById('dash-skills');
  const skills = state.profile.skills;
  if (skills.length === 0) {
    skillsEl.innerHTML = '<p class="empty-msg">Add skills in My Profile.</p>';
  } else {
    const matchedCountMap = {};
    jobs.forEach(j => (j.matched || []).forEach(ms => {
      matchedCountMap[ms] = (matchedCountMap[ms] || 0) + 1;
    }));
    skillsEl.innerHTML = skills.slice(0, 10).map(s => {
      const key = s.name.toLowerCase();
      const matchCount = Object.entries(matchedCountMap).reduce((sum, [ms, c]) =>
        (ms.includes(key) || key.includes(ms)) ? sum + c : sum, 0);
      const isMatched = matchCount > 0;
      return `<span class="skill-tag${isMatched ? ' skill-matched' : ''}" style="margin:3px">
        ${escHtml(s.name)}
        <span class="level">${isMatched ? `✓ ${matchCount} job${matchCount !== 1 ? 's' : ''}` : s.level}</span>
      </span>`;
    }).join('');
  }

  if (typeof animateDashboardStats === 'function') animateDashboardStats();
  if (typeof animateBars === 'function') animateBars('.pipeline-bar-fill');
}


/* renderActivity() lives in views-calendar.js */


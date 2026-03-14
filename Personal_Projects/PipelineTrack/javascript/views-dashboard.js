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
  // Pace — avg jobs per week / month / year shown as sub-label under Total
  const paceEl = document.getElementById('stat-pace');
  if (paceEl) {
    if (jobs.length >= 1) {
      const earliest = Math.min(...jobs.map(j => new Date(j.dateAdded).getTime()));
      const msElapsed = Date.now() - earliest;
      const weeksElapsed  = msElapsed / (7 * 24 * 60 * 60 * 1000);
      const monthsElapsed = msElapsed / (30.44 * 24 * 60 * 60 * 1000);
      const yearsElapsed  = msElapsed / (365.25 * 24 * 60 * 60 * 1000);
      const wk  = weeksElapsed  >= 1 ? (total / weeksElapsed).toFixed(1)  + '/wk'  : null;
      const mo  = monthsElapsed >= 1 ? (total / monthsElapsed).toFixed(1) + '/mo'  : null;
      const yr  = yearsElapsed  >= 1 ? (total / yearsElapsed).toFixed(1)  + '/yr'  : null;
      const parts = [wk, mo, yr].filter(Boolean);
      paceEl.textContent = parts.length ? 'avg. ' + parts.join(' · ') : '';
    } else {
      paceEl.textContent = '';
    }
  }

  document.getElementById('sidebar-job-count').textContent = `${total} job${total !== 1 ? 's' : ''} tracked`;

  // Streak + motivational nudge
  const vibeRow = document.getElementById('dash-vibe-row');
  if (vibeRow) {
    const streak = computeStreak(jobs);
    const streakHtml = streak >= 2 ?
      `<span class="dash-streak">🔥 ${streak}-day streak</span>` :
      '';
    vibeRow.innerHTML = streakHtml + `<span class="dash-nudge">${getDashboardNudge(jobs)}</span>`;
  }

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
      `<span class="gap-tag dash-gap-tag" data-skill="${escHtml(skill)}" title="View ${count} job${count !== 1 ? 's' : ''} missing this skill">${escHtml(skill)} <span class="gap-count">${count}</span></span>`
    ).join('');
    gapsEl.querySelectorAll('.dash-gap-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const skill = tag.dataset.skill;
        const matched = jobs.filter(j => (j.missing || []).includes(skill));
        openFilterModal(`Skill Gap: ${skill}`, `${matched.length} job${matched.length !== 1 ? 's' : ''}`, matched);
      });
    });
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
      <div class="pipeline-bar-row pipeline-bar-row-click" data-stage="${stage}" title="View ${count} job${count !== 1 ? 's' : ''}">
        <div class="pipeline-bar-label">${STAGE_LABELS[stage]}</div>
        <div class="pipeline-bar-track"><div class="pipeline-bar-fill" style="width:${pct}%"></div></div>
        <div class="pipeline-bar-count">${count}</div>
      </div>`;
  }).join('');
  barsEl.querySelectorAll('.pipeline-bar-row-click').forEach(row => {
    row.addEventListener('click', () => {
      const stage = row.dataset.stage;
      const matched = jobs.filter(j => j.stage === stage);
      openFilterModal(`Stage: ${STAGE_LABELS[stage]}`, `${matched.length} job${matched.length !== 1 ? 's' : ''}`, matched);
    });
  });

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
    const levelDotCount = { Expert: 3, Intermediate: 2, Beginner: 1 };
    skillsEl.innerHTML = skills.slice(0, 10).map(s => {
      const key = s.name.toLowerCase();
      const matchCount = Object.entries(matchedCountMap).reduce((sum, [ms, c]) =>
        (ms.includes(key) || key.includes(ms)) ? sum + c : sum, 0);
      const isMatched = matchCount > 0;
      const dots = levelDotCount[s.level] || 2;
      const dotsHtml = [1,2,3].map(i => `<span class="skill-dot${i <= dots ? ' filled' : ''}"></span>`).join('');
      const levelClass = s.level === 'Expert' ? 'skill-card--expert' : s.level === 'Beginner' ? 'skill-card--beginner' : 'skill-card--intermediate';
      return `<div class="skill-card ${levelClass}${isMatched ? ' skill-card--matched' : ''} dash-skill-tag" data-key="${escHtml(key)}" data-name="${escHtml(s.name)}"${isMatched ? ' style="cursor:pointer"' : ''}>
        <div class="skill-card-name">${escHtml(s.name)}</div>
        <div class="skill-card-footer">
          <div class="skill-card-dots">${dotsHtml}</div>
          ${isMatched
            ? `<span class="skill-card-match">✓ ${matchCount} job${matchCount !== 1 ? 's' : ''}</span>`
            : `<span class="skill-card-level">${escHtml(s.level)}</span>`}
        </div>
      </div>`;
    }).join('');
    skillsEl.querySelectorAll('.dash-skill-tag[data-key]').forEach(tag => {
      tag.addEventListener('click', () => {
        const key = tag.dataset.key;
        const matched = jobs.filter(j =>
          (j.matched || []).some(ms => ms.toLowerCase().includes(key) || key.includes(ms.toLowerCase()))
        );
        if (matched.length === 0) return;
        openFilterModal(`Skill: ${tag.dataset.name}`, `${matched.length} matched job${matched.length !== 1 ? 's' : ''}`, matched);
      });
    });
  }

  renderWeekSummary();

  if (typeof animateDashboardStats === 'function') animateDashboardStats();
  if (typeof animateBars === 'function') animateBars('.pipeline-bar-fill');
}

function renderWeekSummary() {
  const el = document.getElementById('dash-week-summary');
  if (!el) return;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const jobs = state.jobs;
  const thisWeekJobs = jobs.filter(j => new Date(j.dateAdded) >= weekStart);
  const appsAdded = thisWeekJobs.length;
  const inProgress = jobs.filter(j => ['screening', 'interview'].includes(j.stage)).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followupsDue = (state.contacts || []).filter(c =>
    c.nextFollowUp && new Date(c.nextFollowUp + 'T00:00:00') <= today
  ).length;

  // Weekly goals — computeGoalCurrent is in views-goals.js (loaded after)
  const weekGoals = (state.goals || []).filter(g => g.period === 'week');
  const goalsHTML = weekGoals.length === 0 ? '' :
    `<div class="week-goals-section">
      ${weekGoals.map(g => {
        const current = typeof computeGoalCurrent === 'function' ? computeGoalCurrent(g) : 0;
        const pct = g.target > 0 ? Math.min(Math.round((current / g.target) * 100), 100) : 0;
        const color = pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--accent)' : 'var(--red)';
        const label = (typeof GOAL_TYPE_LABELS !== 'undefined' && GOAL_TYPE_LABELS[g.type]) || g.type;
        return `<div class="week-goal-row">
          <span class="week-goal-label">${label}</span>
          <span class="week-goal-val" style="color:${color}">${current}/${g.target}</span>
        </div>`;
      }).join('')}
    </div>`;

  const fuColor = followupsDue > 0 ? 'var(--red)' : 'var(--text-muted)';

  el.innerHTML = `
    <div class="dash-card dash-week-summary-card">
      <div class="dash-card-header">This Week</div>
      <div class="week-summary-body">
        <div class="week-stat">
          <div class="week-stat-val" style="color:var(--accent)">${appsAdded}</div>
          <div class="week-stat-label">Added This Week</div>
        </div>
        <div class="week-stat">
          <div class="week-stat-val" style="color:var(--yellow)">${inProgress}</div>
          <div class="week-stat-label">In Progress</div>
        </div>
        <div class="week-stat">
          <div class="week-stat-val" style="color:${fuColor}">${followupsDue}</div>
          <div class="week-stat-label">Follow-ups Due</div>
        </div>
        ${goalsHTML}
      </div>
    </div>`;
}


/* renderActivity() lives in views-calendar.js */
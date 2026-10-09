'use strict';

/* ══════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════ */
function dashboardDate(value) {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value + 'T00:00:00' : value);
}

function renderDashboardPriorities(jobs) {
  const overview = document.getElementById('dash-overview');
  const actionsEl = document.getElementById('dash-next-actions');
  const fitsEl = document.getElementById('dash-best-fits');
  if (!overview || !actionsEl || !fitsEl) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const active = jobs.filter(j => ['saved', 'applied', 'screening', 'interview', 'offer'].includes(j.stage));
  const scored = jobs.filter(j => Number.isFinite(j.fitScore));
  const saved = active.filter(j => j.stage === 'saved');
  const advanced = active.filter(j => ['screening', 'interview', 'offer'].includes(j.stage));
  const coverage = jobs.length ? Math.round(scored.length / jobs.length * 100) : 0;
  const actions = [];
  active.forEach(j => {
    const deadlineDays = j.deadline ? Math.round((new Date(j.deadline + 'T00:00:00') - today) / 86400000) : NaN;
    const age = Math.floor((today - dashboardDate(j.dateApplied || j.dateAdded)) / 86400000);
    if (j.stage === 'saved' && deadlineDays <= 7) {
      actions.push({
        job: j,
        priority: 0,
        sort: deadlineDays,
        label: deadlineDays < 0 ? 'Review expired deadline' : deadlineDays === 0 ? 'Application due today' : `Apply within ${deadlineDays} day${deadlineDays === 1 ? '' : 's'}`,
        detail: deadlineDays < 0 ? 'Check whether this role is still accepting applications.' : 'Review the requirements and prepare your application.',
        tone: 'urgent'
      });
    } else if (['applied', 'screening', 'interview'].includes(j.stage) && age >= 14) {
      actions.push({
        job: j,
        priority: 1,
        sort: -age,
        label: 'Consider a follow-up',
        detail: `${age} days since ${j.dateApplied ? 'applying' : 'adding this job'}. Check your latest contact before reaching out.`,
        tone: 'waiting'
      });
    } else if (!Number.isFinite(j.fitScore)) {
      actions.push({
        job: j,
        priority: 2,
        sort: 0,
        label: 'Complete the skill analysis',
        detail: 'Add a job description and profile skills to understand your fit.',
        tone: 'analyze'
      });
    }
  });
  actions.sort((a, b) => a.priority - b.priority || a.sort - b.sort);
  overview.innerHTML = `<div class="dash-overview-copy"><span class="dash-insight-label">SEARCH SNAPSHOT</span><h2>${jobs.length ? `${active.length} active opportunit${active.length === 1 ? 'y' : 'ies'}. Keep your next step clear.` : 'Start building your next opportunity.'}</h2><p>${jobs.length ? `${saved.length} saved to explore and ${advanced.length} at screening, interview, or offer. ${actions.length ? `${actions.length} job${actions.length === 1 ? ' has' : 's have'} a suggested next action below.` : 'Your active jobs have no flagged next actions.'}` : 'Add a job and your profile skills to unlock fit scores, learning priorities, and a personalized action list.'}</p></div><div class="dash-coverage"><span class="dash-insight-label">FIT ANALYSIS COVERAGE</span><strong>${coverage}%</strong><div class="dash-coverage-track"><span style="width:${coverage}%"></span></div><span>${scored.length} of ${jobs.length} jobs scored</span></div>`;
  actionsEl.innerHTML = actions.length ? `<div class="dash-action-list">${actions.slice(0, 4).map(a => `<button type="button" class="dash-opportunity-row" data-job-id="${escHtml(a.job.id)}"><span class="dash-action-marker dash-action-marker--${a.tone}" aria-hidden="true">${a.priority === 0 ? '!' : a.priority === 1 ? '&hellip;' : '+'}</span><span class="dash-opportunity-copy"><strong>${a.label}</strong><span class="dash-opportunity-job">${escHtml(a.job.role)} &middot; ${escHtml(a.job.company)}</span><span class="dash-opportunity-note">${a.detail}</span></span><span class="dash-row-arrow" aria-hidden="true">&rarr;</span></button>`).join('')}</div><p class="dash-card-note">Showing ${Math.min(actions.length, 4)} of ${actions.length} jobs with suggested actions. Follow-up suggestions use application or added dates, not contact history.</p>` : '<div class="dash-clear-state"><span class="dash-insight-label">ALL CLEAR</span><strong>No urgent next moves.</strong><p>Save new opportunities or review your skill priorities to keep your search moving.</p></div>';
  const bestFits = active.filter(j => Number.isFinite(j.fitScore)).sort((a, b) => b.fitScore - a.fitScore).slice(0, 4);
  fitsEl.innerHTML = bestFits.length ? bestFits.map(j => `<button type="button" class="dash-opportunity-row" data-job-id="${escHtml(j.id)}"><span class="dash-fit-score">${Math.round(j.fitScore)}<small>% fit</small></span><span class="dash-opportunity-copy"><strong>${escHtml(j.role)}</strong><span class="dash-opportunity-job">${escHtml(j.company)} &middot; ${escHtml(STAGE_LABELS[j.stage] || j.stage)}</span><span class="dash-opportunity-note">${new Set(j.matched || []).size} matched skills &middot; ${new Set(j.missing || []).size} skill gaps</span></span><span class="dash-row-arrow" aria-hidden="true">&rarr;</span></button>`).join('') + '<p class="dash-card-note">Fit measures skill alignment with your profile. It does not predict hiring outcomes.</p>' : '<div class="dash-clear-state"><span class="dash-insight-label">DISCOVER YOUR FIT</span><strong>Your best matches will appear here.</strong><p>Analyze an active job against your profile to compare opportunities.</p></div>';
  [actionsEl, fitsEl].forEach(el => el.querySelectorAll('[data-job-id]').forEach(button => {
    button.addEventListener('click', () => openJobDetail(button.dataset.jobId));
  }));
}

function renderDashboard() {
  const jobs = state.jobs;
  renderDashboardPriorities(jobs);

  const total = jobs.length;
  const applied = jobs.filter(j => j.stage === 'applied').length;
  const progress = jobs.filter(j => ['screening', 'interview'].includes(j.stage)).length;
  const offers = jobs.filter(j => j.stage === 'offer').length;
  const declined = jobs.filter(j => j.stage === 'declined').length;

  const scored = jobs.filter(j => Number.isFinite(j.fitScore));
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
      const validDates = jobs.map(j => dashboardDate(j.dateAdded).getTime()).filter(time => Number.isFinite(time) && time <= Date.now());
      const earliest = validDates.length ? Math.min(...validDates) : Date.now();
      const msElapsed = Date.now() - earliest;
      const weeksElapsed = msElapsed / (7 * 24 * 60 * 60 * 1000);
      const monthsElapsed = msElapsed / (30.44 * 24 * 60 * 60 * 1000);
      const yearsElapsed = msElapsed / (365.25 * 24 * 60 * 60 * 1000);
      const wk = weeksElapsed >= 1 ? (total / weeksElapsed).toFixed(1) + '/wk' : null;
      const mo = monthsElapsed >= 1 ? (total / monthsElapsed).toFixed(1) + '/mo' : null;
      const yr = yearsElapsed >= 1 ? (total / yearsElapsed).toFixed(1) + '/yr' : null;
      const parts = [wk, mo, yr].filter(Boolean);
      paceEl.textContent = parts.length ? 'avg. ' + parts.join(' · ') : '';
    } else {
      paceEl.textContent = '';
    }
  }

  document.getElementById('sidebar-job-count').textContent = `${total} job${total !== 1 ? 's' : ''} tracked`;

  // Streak + motivational nudge (with health warning — see bottom of function)
  const vibeRow = document.getElementById('dash-vibe-row');

  const statNotes = {
    'stat-applied': 'Currently awaiting a response',
    'stat-progress': 'Screening or interviewing',
    'stat-offers': 'Currently at the offer stage',
    'stat-declined': 'Applications marked not selected',
    'stat-fit': scored.length ? `Based on ${scored.length} scored job${scored.length !== 1 ? 's' : ''} of ${total} tracked` : 'Add a description to analyze job fit'
  };
  Object.entries(statNotes).forEach(([id, note]) => {
    const card = document.getElementById(id).parentElement;
    let caption = card.querySelector('.stat-context');
    if (!caption) {
      caption = document.createElement('div');
      caption.className = 'stat-context';
      card.appendChild(caption);
    }
    caption.textContent = note;
  });

  // Count each skill once per job, merging capitalization variants.
  const gapMap = new Map();
  const analyzedJobs = jobs.filter(j => Number.isFinite(j.fitScore) || (j.missing || []).length || (j.matched || []).length);
  jobs.forEach(j => {
    const seen = new Set();
    (j.missing || []).forEach(raw => {
      const skill = raw.trim();
      const key = skill.toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      if (!gapMap.has(key)) gapMap.set(key, {
        skill,
        jobs: []
      });
      gapMap.get(key).jobs.push(j);
    });
  });
  const sortedGaps = [...gapMap.values()].sort((a, b) => b.jobs.length - a.jobs.length || a.skill.localeCompare(b.skill)).slice(0, 6);
  const gapsEl = document.getElementById('dash-gaps');
  if (sortedGaps.length === 0) {
    gapsEl.innerHTML = `<p class="empty-msg">${analyzedJobs.length ? 'No missing skills found in analyzed jobs. Add more job descriptions to broaden your comparison.' : 'Add job descriptions and your profile skills to discover which skills to focus on.'}</p>`;
  } else {
    const top = sortedGaps[0];
    gapsEl.innerHTML = `<div class="dash-gap-focus"><span class="dash-insight-label">SUGGESTED FOCUS</span><strong>${escHtml(top.skill)}</strong><p>Listed as missing in ${top.jobs.length} job${top.jobs.length !== 1 ? 's' : ''}. Build practice or add evidence of this skill to your profile.</p></div>
      <div class="dash-gap-list">${sortedGaps.map(({ skill, jobs: affected }, index) => {
        const pct = Math.round(affected.length / analyzedJobs.length * 100);
        const active = affected.filter(j => ['saved', 'applied', 'screening', 'interview'].includes(j.stage)).length;
        return `
          <button type="button" class="dash-gap-row" data-skill="${escHtml(skill)}" aria-label="${escHtml(skill)}: view ${affected.length} affected jobs">
            <span class="dash-gap-rank">${index + 1}</span>
            <span class="dash-gap-detail">
              <span class="dash-gap-heading">
                <strong>${escHtml(skill)}</strong>
                <span>${affected.length} job${affected.length !== 1 ? 's' : ''} <b>${pct}%</b></span>
              </span>
              <span class="dash-gap-track"><span style="width:${pct}%"></span></span>
              <span class="dash-gap-meta">
                ${active} active opportunit${active === 1 ? 'y' : 'ies'}
                <span>View jobs &rarr;</span>
              </span>
            </span>
          </button>`;
      }).join('')}</div><p class="dash-card-note">Top ${sortedGaps.length} of ${gapMap.size} missing skills across ${analyzedJobs.length} analyzed jobs. Percentages show the share of analyzed jobs; a job can have several gaps.</p>`;
    gapsEl.querySelectorAll('.dash-gap-row').forEach(tag => {
      tag.addEventListener('click', () => {
        const skill = tag.dataset.skill;
        const matched = gapMap.get(skill.toLowerCase()).jobs;
        openFilterModal(`Skill Gap: ${skill}`, `${matched.length} job${matched.length !== 1 ? 's' : ''}`, matched);
      });
    });
  }

  // Recent activity
  const recentEl = document.getElementById('dash-recent');
  const stageColors = {
    saved: '#8b949e',
    applied: '#3b82f6',
    screening: '#8b5cf6',
    interview: '#f59e0b',
    offer: '#22c55e',
    declined: '#ef4444',
    withdrew: '#f97316',
    ghosted: '#6b7280',
    archived: '#6b7280'
  };
  const stageBgColors = {
    saved: 'rgba(139,148,158,0.15)',
    applied: 'rgba(59,130,246,0.15)',
    screening: 'rgba(139,92,246,0.15)',
    interview: 'rgba(245,158,11,0.15)',
    offer: 'rgba(34,197,94,0.15)',
    declined: 'rgba(239,68,68,0.15)',
    withdrew: 'rgba(249,115,22,0.15)',
    ghosted: 'rgba(107,114,128,0.15)',
    archived: 'rgba(107,114,128,0.12)'
  };
  const activityDate = dashboardDate;
  const recent = jobs.flatMap(j => [{
        job: j,
        label: 'Opportunity added',
        date: j.dateAdded
      },
      {
        job: j,
        label: 'Application recorded',
        date: j.dateApplied
      }
    ]).filter(event => event.date && Number.isFinite(activityDate(event.date).getTime()) && activityDate(event.date) <= new Date())
    .sort((a, b) => activityDate(b.date) - activityDate(a.date)).slice(0, 6);
  if (recent.length === 0) {
    recentEl.innerHTML = '<p class="empty-msg">No jobs tracked yet.</p>';
  } else {
    recentEl.innerHTML = recent.map(({
      job: j,
      label,
      date
    }) => `
      <button type="button" class="recent-item dash-recent-button" data-job-id="${escHtml(j.id)}">
        <span class="dash-activity-dot" aria-hidden="true" style="background:${label === 'Application recorded' ? 'var(--accent)' : 'var(--text-muted)'}"></span>
        <div class="recent-info">
          <div class="dash-activity-label">${label}</div>
          <div class="recent-role">${escHtml(j.role)}</div>
          <div class="recent-company">${escHtml(j.company)}</div>
          <div class="recent-date">${escHtml(formatDate(activityDate(date)))}</div>
        </div>
        <div class="recent-right">
          <span class="recent-stage-badge" style="color:${stageColors[j.stage] || 'var(--accent)'}; background:${stageBgColors[j.stage] || 'rgba(0,212,170,0.15)'}">
            ${STAGE_EMOJIS[j.stage] || ''} ${escHtml(STAGE_LABELS[j.stage] || j.stage)}
          </span>
        </div>
      </button>
    `).join('') + '<p class="dash-card-note">Latest six added and application events. Badges show the job\'s current stage.</p>';
    recentEl.querySelectorAll('.recent-item').forEach(el => {
      el.addEventListener('click', () => openJobDetail(el.dataset.jobId));
    });
  }

  // Pipeline bars
  const stageCounts = STAGES.filter(s => s !== 'archived').map(stage => ({
    stage,
    count: jobs.filter(j => j.stage === stage).length
  }));
  const largest = [...stageCounts].sort((a, b) => b.count - a.count)[0];
  const barsEl = document.getElementById('dash-pipeline-bars');
  barsEl.innerHTML = (total ? `<div class="dash-pipeline-insight"><span class="dash-insight-label">LARGEST STAGE</span><strong>${largest.count ? escHtml(STAGE_LABELS[largest.stage]) : 'All jobs archived'}</strong><span>${largest.count ? `${largest.count} of ${total} tracked jobs (${Math.round(largest.count / total * 100)}%)` : 'Add an active opportunity to build your pipeline.'}</span></div>` : '<p class="empty-msg">Add your first job to start building your pipeline.</p>') + stageCounts.map(({
    stage,
    count
  }) => {
    const pct = total ? Math.round((count / total) * 100) : 0;
    return `
      <button type="button" class="pipeline-bar-row pipeline-bar-row-click dash-pipeline-button" data-stage="${stage}" title="View ${count} job${count !== 1 ? 's' : ''}">
        <div class="pipeline-bar-label">${STAGE_LABELS[stage]}</div>
        <div class="pipeline-bar-track"><div class="pipeline-bar-fill" style="width:${pct}%"></div></div>
        <div class="pipeline-bar-count">${count}</div><span class="dash-pipeline-percent">${pct}%</span>
      </button>`;
  }).join('') + `<p class="dash-card-note">Percentages use all ${total} tracked jobs. ${jobs.filter(j => j.stage === 'archived').length} archived jobs are excluded from the rows.</p>`;
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
    const jobsForSkill = name => jobs.filter(j => (j.matched || []).some(ms => ms.trim().toLowerCase() === name.trim().toLowerCase()));
    const rankedSkills = skills.map(s => ({
      ...s,
      matchedJobs: jobsForSkill(s.name)
    })).sort((a, b) => b.matchedJobs.length - a.matchedJobs.length || a.name.localeCompare(b.name));
    const skillsAnalyzed = jobs.filter(j => Number.isFinite(j.fitScore) || (j.matched || []).length || (j.missing || []).length).length;
    const levelDotCount = {
      Expert: 3,
      Intermediate: 2,
      Beginner: 1
    };
    skillsEl.innerHTML = `<div class="dash-skills-summary"><span class="dash-insight-label">YOUR SKILL STRENGTHS</span><strong>${rankedSkills.filter(s => s.matchedJobs.length).length} of ${skills.length} profile skills matched</strong><span>Ranked by the number of analyzed jobs recognizing each skill.</span></div>` + rankedSkills.slice(0, 8).map(s => {
      const key = s.name.toLowerCase();
      const matchCount = s.matchedJobs.length;
      const pct = skillsAnalyzed ? Math.round(matchCount / skillsAnalyzed * 100) : 0;
      const isMatched = matchCount > 0;
      const dots = levelDotCount[s.level] || 2;
      const dotsHtml = [1, 2, 3].map(i => `<span class="skill-dot${i <= dots ? ' filled' : ''}"></span>`).join('');
      const levelClass = s.level === 'Expert' ? 'skill-card--expert' : s.level === 'Beginner' ? 'skill-card--beginner' : 'skill-card--intermediate';
      return `<button type="button" class="skill-card ${levelClass}${isMatched ? ' skill-card--matched' : ''} dash-skill-tag dash-skill-button" data-key="${escHtml(key)}" data-name="${escHtml(s.name)}" ${isMatched ? '' : 'disabled'}>
        <div class="skill-card-name">${escHtml(s.name)}</div>
        <span class="dash-skill-level">${escHtml(s.level || 'Intermediate')}</span>
        <div class="skill-card-footer">
          <div class="skill-card-dots">${dotsHtml}</div>
          ${isMatched
            ? `<span class="skill-card-match">✓ ${matchCount} job${matchCount !== 1 ? 's' : ''}</span>`
            : '<span class="skill-card-level">No matches yet</span>'}
        </div>
        <span class="dash-skill-demand">${pct}% of analyzed jobs</span>
      </button>`;
    }).join('') + `<p class="dash-card-note dash-skills-summary">Showing ${Math.min(skills.length, 8)} of ${skills.length} skills across ${skillsAnalyzed} analyzed jobs. Matches use skill names; each job counts once per skill.</p>`;
    skillsEl.querySelectorAll('.dash-skill-tag[data-key]').forEach(tag => {
      tag.addEventListener('click', () => {
        const key = tag.dataset.key;
        const matched = jobsForSkill(key);
        if (matched.length === 0) return;
        openFilterModal(`Skill: ${tag.dataset.name}`, `${matched.length} matched job${matched.length !== 1 ? 's' : ''}`, matched);
      });
    });
  }

  // Pipeline health warning
  const now = new Date();
  const stale = jobs.filter(j => ['applied', 'screening', 'interview'].includes(j.stage) &&
    (now - dashboardDate(j.dateApplied || j.dateAdded)) / 86400000 > 14
  );
  const healthHtml = stale.length > 0 ?
    `<span class="dash-health-warn dash-health-warn--clickable">⚠ ${stale.length} application${stale.length !== 1 ? 's' : ''} aged 14+ days</span>` :
    '';
  if (vibeRow) {
    const streak = computeStreak(jobs);
    const streakHtml = streak >= 2 ? `<span class="dash-streak" id="streak-pill" title="Click to see your streak timeline">🔥 ${streak}-day streak</span>` : '';
    vibeRow.innerHTML = streakHtml + healthHtml + `<span class="dash-nudge">${getDashboardNudge(jobs)}</span>`;
    if (stale.length > 0) {
      vibeRow.querySelector('.dash-health-warn--clickable').addEventListener('click', () => {
        openFilterModal('Applications Aged 14+ Days', `${stale.length} job${stale.length !== 1 ? 's' : ''}`, stale);
      });
    }
    if (streak >= 2) {
      document.getElementById('streak-pill').addEventListener('click', () => toggleStreakTimeline(jobs));
    }
  }

  renderDashFunnel();
  renderDashVelocity();
  renderDashDeadlines();
  renderDashTimeInStage();
  renderWeekSummary();

  if (typeof animateDashboardStats === 'function') animateDashboardStats();
  if (typeof animateBars === 'function') animateBars('.pipeline-bar-fill');
}

/* ── STREAK TIMELINE POPUP ───────────────────────────────── */
function toggleStreakTimeline(jobs) {
  const panel = document.getElementById('streak-timeline-panel');
  const pill = document.getElementById('streak-pill');
  if (!panel) return;

  if (!panel.hidden) {
    panel.classList.remove('streak-timeline-panel--open');
    panel.addEventListener('transitionend', () => {
      panel.hidden = true;
    }, {
      once: true
    });
    pill.classList.remove('dash-streak--active');
    return;
  }

  // Build items sorted oldest → newest
  const STAGE_COLORS = {
    saved: '#6b7280',
    applied: '#3b82f6',
    screening: '#a78bfa',
    interview: '#f59e0b',
    offer: '#10b981',
    declined: '#ef4444'
  };
  const sorted = [...jobs]
    .filter(j => j.dateAdded)
    .sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));

  if (!sorted.length) return;

  // Group by date
  const byDate = {};
  sorted.forEach(j => {
    const d = new Date(j.dateAdded);
    d.setHours(0, 0, 0, 0);
    const key = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    (byDate[key] = byDate[key] || []).push(j);
  });

  const rows = Object.entries(byDate).map(([date, dayJobs]) => {
    const chips = dayJobs.map(j => {
      const color = STAGE_COLORS[j.stage] || '#6b7280';
      return `<span class="stl-chip" style="border-color:${color};color:${color}">${j.company || 'Unknown'} — ${j.title || 'Role'}</span>`;
    }).join('');
    return `<div class="stl-row"><span class="stl-date">${date}</span><div class="stl-chips">${chips}</div></div>`;
  }).join('');

  panel.innerHTML = `<div class="stl-inner" id="stl-scroll">${rows}</div>`;
  panel.hidden = false;
  // Force reflow then animate open
  void panel.offsetWidth;
  panel.classList.add('streak-timeline-panel--open');
  pill.classList.add('dash-streak--active');

  // Pan to the bottom (most recent) after transition
  panel.addEventListener('transitionend', () => {
    const inner = document.getElementById('stl-scroll');
    if (inner) inner.scrollTo({
      top: inner.scrollHeight,
      behavior: 'smooth'
    });
  }, {
    once: true
  });
}

function renderWeekSummary() {
  const el = document.getElementById('dash-week-summary');
  if (!el) return;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const jobs = state.jobs;
  const activityDate = dashboardDate;
  const thisWeekJobs = jobs.filter(j => activityDate(j.dateAdded) >= weekStart && activityDate(j.dateAdded) <= now);
  const appsAdded = thisWeekJobs.length;
  const savedJobs = thisWeekJobs.filter(j => j.stage === 'saved');
  const submittedJobs = jobs.filter(j => j.dateApplied && activityDate(j.dateApplied) >= weekStart && activityDate(j.dateApplied) <= now);
  const previousStart = new Date(weekStart);
  previousStart.setDate(previousStart.getDate() - 7);
  const previousEnd = new Date(now);
  previousEnd.setDate(previousEnd.getDate() - 7);
  const previousAdded = jobs.filter(j => activityDate(j.dateAdded) >= previousStart && activityDate(j.dateAdded) <= previousEnd).length;
  const change = appsAdded - previousAdded;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueContacts = (state.contacts || []).filter(c =>
    c.nextFollowUp && new Date(c.nextFollowUp + 'T00:00:00') <= today
  ).sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));
  const followupsDue = dueContacts.length;

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
          <span class="week-goal-label">${escHtml(label)}</span>
          <span class="week-goal-val" style="color:${color}">${current}/${g.target}</span>
        </div><div class="dash-week-goal-track"><span style="width:${pct}%;background:${color}"></span></div>`;
      }).join('')}
    </div>`;

  const fuColor = followupsDue > 0 ? 'var(--red)' : 'var(--text-muted)';

  el.innerHTML = `
    <div class="dash-card dash-week-summary-card">
      <div class="dash-card-header">This Week</div>
      <p class="dash-card-description">${escHtml(formatDate(weekStart))} through today &middot; Week starts Sunday</p>
      <div class="week-summary-body dash-week-metrics">
        <button type="button" class="week-stat dash-week-stat-button" data-week-filter="added">
          <div class="week-stat-val" style="color:var(--accent)">${appsAdded}</div>
          <div class="week-stat-label">Added This Week</div>
        </button>
        <button type="button" class="week-stat dash-week-stat-button" data-week-filter="saved">
          <div class="week-stat-val">${savedJobs.length}</div>
          <div class="week-stat-label">New Jobs Still Saved</div>
        </button>
        <button type="button" class="week-stat dash-week-stat-button" data-week-filter="submitted">
          <div class="week-stat-val" style="color:var(--accent)">${submittedJobs.length}</div>
          <div class="week-stat-label">Applications Submitted</div>
        </button>
        <div class="week-stat">
          <div class="week-stat-val" style="color:${fuColor}">${followupsDue}</div>
          <div class="week-stat-label">Follow-ups Due</div>
        </div>
      </div>
      <div class="dash-week-detail"><p class="dash-card-note">${change === 0 ? 'Same number of jobs added' : `${Math.abs(change)} ${change > 0 ? 'more' : 'fewer'} jobs added`} than the same elapsed period last week. Submitted applications use recorded application dates.</p>
        ${dueContacts.length ? `<div class="dash-week-followups"><span class="dash-insight-label">FOLLOW UP NEXT</span>${dueContacts.slice(0, 3).map(c => `<button type="button" class="dash-contact-followup" data-contact-id="${escHtml(c.id)}"><span><strong>${escHtml(c.name)}</strong><span>${escHtml(c.company || 'Contact')} &middot; ${escHtml(formatDate(dashboardDate(c.nextFollowUp)))}</span></span><span>Review &rarr;</span></button>`).join('')}${dueContacts.length > 3 ? `<p class="dash-card-note">${dueContacts.length - 3} more due in Contacts.</p>` : ''}</div>` : '<p class="dash-card-note">No scheduled contact follow-ups due. Set a follow-up date in Contacts to track your outreach.</p>'}
        ${goalsHTML}
      </div>
    </div>`;
  const weekFilters = {
    added: ['Jobs Added This Week', thisWeekJobs],
    saved: ['New Jobs Still Saved', savedJobs],
    submitted: ['Applications Submitted This Week', submittedJobs]
  };
  el.querySelectorAll('[data-week-filter]').forEach(button => button.addEventListener('click', () => {
    const [title, matched] = weekFilters[button.dataset.weekFilter];
    openFilterModal(title, `${matched.length} jobs`, matched);
  }));
  el.querySelectorAll('[data-contact-id]').forEach(button => button.addEventListener('click', () => openContactModal(button.dataset.contactId)));
}


function renderDashFunnel() {
  const el = document.getElementById('dash-funnel');
  if (!el) return;
  const jobs = state.jobs;
  const stages = [{
      key: 'applied',
      label: 'Applied',
      cls: ''
    },
    {
      key: 'screening',
      label: 'Screening',
      cls: 'fill-purple'
    },
    {
      key: 'interview',
      label: 'Interview',
      cls: 'fill-yellow'
    },
    {
      key: 'offer',
      label: 'Offer',
      cls: 'fill-green'
    },
  ];
  const counts = stages.map(s => jobs.filter(j => j.stage === s.key).length);
  const max = Math.max(...counts, 1);
  const totalActive = jobs.filter(j => ['applied', 'screening', 'interview', 'offer'].includes(j.stage)).length;
  if (totalActive === 0) {
    el.innerHTML = '<p class="empty-msg">No applications yet.</p>';
    return;
  }
  el.innerHTML = stages.map((s, i) => {
    const count = counts[i];
    const pct = Math.round((count / max) * 100);
    const prev = i > 0 ? counts[i - 1] : null;
    const conv = prev != null && prev > 0 ? Math.round((count / prev) * 100) + '%' : null;
    return `<div class="pipeline-bar-row">
      <div class="pipeline-bar-label">${s.label}</div>
      <div class="pipeline-bar-track">
        <div class="pipeline-bar-fill ${s.cls}" style="width:${pct}%"></div>
      </div>
      <div class="pipeline-bar-count">${count}</div>
      <div class="dash-funnel-conv">${conv ? conv : ''}</div>
    </div>`;
  }).join('');
}

function renderDashVelocity() {
  const el = document.getElementById('dash-velocity');
  if (!el) return;
  const jobs = state.jobs;
  const now = new Date();
  const dateFor = dashboardDate;
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const periodJobs = jobs.filter(j => {
      const d = dateFor(j.dateAdded);
      return d >= start && d <= end && d <= now;
    });
    const count = periodJobs.length;
    const label = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    weeks.push({
      label,
      count,
      periodJobs,
      start,
      end
    });
  }
  if (weeks.every(w => w.count === 0)) {
    el.innerHTML = '<div class="dash-clear-state"><span class="dash-insight-label">BUILD YOUR MOMENTUM</span><strong>No jobs added in the last six weeks.</strong><p>Add an opportunity to start seeing your weekly pace here.</p></div>';
    return;
  }
  const max = Math.max(...weeks.map(w => w.count), 1);
  const latest = weeks[5].count;
  const previous = weeks[4].count;
  const totalAdded = weeks.reduce((sum, w) => sum + w.count, 0);
  const delta = latest - previous;
  const trend = delta === 0 ? 'Same pace as the previous 7 days' : `${Math.abs(delta)} ${delta > 0 ? 'more' : 'fewer'} job${Math.abs(delta) === 1 ? '' : 's'} than the previous 7 days`;
  el.innerHTML = `<div class="dash-velocity-summary"><div><span class="dash-insight-label">LAST 7 DAYS</span><strong>${latest}</strong><span>jobs added</span></div><div><span class="dash-insight-label">6-WEEK AVERAGE</span><strong>${(totalAdded / 6).toFixed(1)}</strong><span>jobs per week</span></div></div><p class="dash-velocity-trend">${trend}</p><div class="dash-vel-chart">
    ${weeks.map((w, index) => {
      const h = w.count > 0 ? Math.max(Math.round((w.count / max) * 80), 6) : 2;
      const range = `${w.label} to ${w.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      return `<button type="button" class="dash-vel-col dash-velocity-button${index === 5 ? ' dash-velocity-current' : ''}" data-week-index="${index}" aria-label="${range}: ${w.count} jobs added. View jobs." title="${range}: ${w.count} jobs added">
        <div class="dash-vel-count">${w.count}</div>
        <div class="dash-vel-bar-wrap">
          <div class="dash-vel-bar" style="height:${h}px"></div>
        </div>
        <div class="dash-vel-label">${w.label}</div>
      </button>`;
    }).join('')}
  </div><p class="dash-card-note">${totalAdded} jobs added across six consecutive seven-day periods ending today. Select a bar to view jobs. Counts measure opportunities added, including those later closed.</p>`;
  el.querySelectorAll('[data-week-index]').forEach(button => button.addEventListener('click', () => {
    const week = weeks[Number(button.dataset.weekIndex)];
    openFilterModal(`Jobs Added: ${week.label}`, `${week.count} jobs`, week.periodJobs);
  }));
}

function renderDashDeadlines() {
  const el = document.getElementById('dash-deadlines');
  if (!el) return;
  const jobs = state.jobs.filter(j => ['saved', 'applied', 'screening', 'interview', 'offer'].includes(j.stage));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);
  const overdue = jobs.filter(j => j.deadline && new Date(j.deadline + 'T00:00:00') < today).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const upcoming = jobs
    .filter(j => j.deadline && new Date(j.deadline + 'T00:00:00') >= today && new Date(j.deadline + 'T00:00:00') <= in7)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  if (overdue.length === 0 && upcoming.length === 0) {
    el.innerHTML = '<div class="dash-clear-state"><span class="dash-insight-label">NO DEADLINES DUE</span><strong>You have room to plan.</strong><p>No active jobs have deadlines through the next seven days. Add dates to job details to track upcoming commitments.</p></div>';
    return;
  }
  let html = '';
  if (overdue.length > 0) {
    html += `<div class="dash-deadline-overdue">⚠ ${overdue.length} overdue deadline${overdue.length !== 1 ? 's' : ''}</div>`;
  }
  html += [...overdue, ...upcoming].map(j => {
    const days = Math.round((new Date(j.deadline + 'T00:00:00') - today) / 86400000);
    const urgCls = days <= 0 ? 'dash-dl-today' : days <= 2 ? 'dash-dl-soon' : '';
    return `<button type="button" class="dash-deadline-item dash-deadline-button ${urgCls}" data-job-id="${escHtml(j.id)}">
      <div>
        <div class="dash-dl-role">${escHtml(j.role)}</div>
        <div class="dash-dl-company">${escHtml(j.company)}</div>
        <div class="dash-dl-date">${escHtml(formatDate(dashboardDate(j.deadline)))} &middot; ${escHtml(STAGE_LABELS[j.stage] || j.stage)}</div>
      </div>
      <div class="dash-dl-days">${days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? '1d left' : days + 'd left'}</div>
    </button>`;
  }).join('');
  html += '<p class="dash-card-note">Overdue dates and deadlines through the next seven days, for active jobs. Open a job to review or update its deadline.</p>';
  el.innerHTML = html;
  el.querySelectorAll('[data-job-id]').forEach(item => {
    item.addEventListener('click', () => openJobDetail(item.dataset.jobId));
  });
}

function renderDashTimeInStage() {
  const el = document.getElementById('dash-time-in-stage');
  if (!el) return;
  const jobs = state.jobs;
  const now = new Date();
  const stages = [{
      key: 'applied',
      label: 'Applied'
    },
    {
      key: 'screening',
      label: 'Screening'
    },
    {
      key: 'interview',
      label: 'Interview'
    },
    {
      key: 'offer',
      label: 'Offer'
    },
  ];
  const rows = stages.map(s => {
    const sJobs = jobs.filter(j => j.stage === s.key && Number.isFinite(dashboardDate(j.dateAdded).getTime()));
    if (sJobs.length === 0) return null;
    const avgDays = Math.round(sJobs.reduce((sum, j) => sum + Math.max(0, (now - dashboardDate(j.dateAdded)) / 86400000), 0) / sJobs.length);
    return {
      label: s.label,
      count: sJobs.length,
      avgDays
    };
  }).filter(Boolean);
  if (rows.length === 0) {
    el.innerHTML = '<p class="empty-msg">No active applications yet.</p>';
    return;
  }
  const maxDays = Math.max(...rows.map(r => r.avgDays), 1);
  el.innerHTML = rows.map(r => {
    const pct = Math.round((r.avgDays / maxDays) * 100);
    const color = r.avgDays >= 30 ? 'var(--red)' : r.avgDays >= 14 ? 'var(--yellow)' : 'var(--accent)';
    return `<div class="pipeline-bar-row">
      <div class="pipeline-bar-label">${r.label}</div>
      <div class="pipeline-bar-track">
        <div class="pipeline-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <div class="pipeline-bar-count" style="color:${color};font-weight:600;min-width:28px">${r.avgDays}d</div>
    </div>`;
  }).join('') + `<div class="dash-time-note">Avg. days since added, by active stage</div>`;
}

/* renderActivity() lives in views-calendar.js */

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
  const recentEl = document.getElementById('dash-recent');
  const stageColors = {
    saved: 'var(--text-muted)', applied: '#60a5fa', screening: '#a78bfa',
    interview: '#f59e0b', offer: 'var(--green)', declined: 'var(--red)',
    withdrew: '#f97316', ghosted: '#6b7280', archived: '#6b7280'
  };
  const lastChanged = j => j.dateApplied || j.dateAdded;
  const recent = [...jobs].sort((a, b) => new Date(lastChanged(b)) - new Date(lastChanged(a))).slice(0, 6);
  if (recent.length === 0) {
    recentEl.innerHTML = '<p class="empty-msg">No jobs tracked yet.</p>';
  } else {
    recentEl.innerHTML = recent.map(j => `
      <div class="recent-item" data-job-id="${j.id}" style="cursor:pointer">
        <div class="recent-info">
          <div class="recent-role">${j.role}</div>
          <div class="recent-company">${j.company}</div>
        </div>
        <div class="recent-right">
          <span class="recent-stage-badge" style="color:${stageColors[j.stage] || 'var(--accent)'}">
            ${STAGE_EMOJIS[j.stage] || ''} ${STAGE_LABELS[j.stage] || j.stage}
          </span>
          <div class="recent-date">${formatDate(lastChanged(j))}</div>
        </div>
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
    const levelDotCount = {
      Expert: 3,
      Intermediate: 2,
      Beginner: 1
    };
    skillsEl.innerHTML = skills.slice(0, 10).map(s => {
      const key = s.name.toLowerCase();
      const matchCount = Object.entries(matchedCountMap).reduce((sum, [ms, c]) =>
        (ms.includes(key) || key.includes(ms)) ? sum + c : sum, 0);
      const isMatched = matchCount > 0;
      const dots = levelDotCount[s.level] || 2;
      const dotsHtml = [1, 2, 3].map(i => `<span class="skill-dot${i <= dots ? ' filled' : ''}"></span>`).join('');
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

  // Pipeline health warning
  const now = new Date();
  const stale = jobs.filter(j => ['applied', 'screening', 'interview'].includes(j.stage) &&
    (now - new Date(j.dateAdded)) / 86400000 > 14
  );
  const healthHtml = stale.length > 0 ?
    `<span class="dash-health-warn dash-health-warn--clickable">⚠ ${stale.length} job${stale.length !== 1 ? 's' : ''} inactive 14+ days</span>` :
    '';
  if (vibeRow) {
    const streak = computeStreak(jobs);
    const streakHtml = streak >= 2 ? `<span class="dash-streak" id="streak-pill" title="Click to see your streak timeline">🔥 ${streak}-day streak</span>` : '';
    vibeRow.innerHTML = streakHtml + healthHtml + `<span class="dash-nudge">${getDashboardNudge(jobs)}</span>`;
    if (stale.length > 0) {
      vibeRow.querySelector('.dash-health-warn--clickable').addEventListener('click', () => {
        openFilterModal('Inactive 14+ Days', `${stale.length} job${stale.length !== 1 ? 's' : ''}`, stale);
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
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const count = jobs.filter(j => {
      const d = new Date(j.dateAdded);
      return d >= start && d <= end;
    }).length;
    const label = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    weeks.push({
      label,
      count
    });
  }
  if (weeks.every(w => w.count === 0)) {
    el.innerHTML = '<p class="empty-msg">No applications yet.</p>';
    return;
  }
  const max = Math.max(...weeks.map(w => w.count), 1);
  el.innerHTML = `<div class="dash-vel-chart">
    ${weeks.map(w => {
      const h = w.count > 0 ? Math.max(Math.round((w.count / max) * 80), 6) : 2;
      return `<div class="dash-vel-col">
        <div class="dash-vel-count">${w.count || ''}</div>
        <div class="dash-vel-bar-wrap">
          <div class="dash-vel-bar" style="height:0" data-ah="${h}"></div>
        </div>
        <div class="dash-vel-label">${w.label}</div>
      </div>`;
    }).join('')}
  </div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.querySelectorAll('[data-ah]').forEach(b => {
      b.style.height = b.dataset.ah + 'px';
    });
  }));
}

function renderDashDeadlines() {
  const el = document.getElementById('dash-deadlines');
  if (!el) return;
  const jobs = state.jobs;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);
  const overdue = jobs.filter(j => j.deadline && new Date(j.deadline + 'T00:00:00') < today);
  const upcoming = jobs
    .filter(j => j.deadline && new Date(j.deadline + 'T00:00:00') >= today && new Date(j.deadline + 'T00:00:00') <= in7)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  if (overdue.length === 0 && upcoming.length === 0) {
    el.innerHTML = '<p class="empty-msg">No upcoming deadlines in the next 7 days.</p>';
    return;
  }
  let html = '';
  if (overdue.length > 0) {
    html += `<div class="dash-deadline-overdue">⚠ ${overdue.length} overdue deadline${overdue.length !== 1 ? 's' : ''}</div>`;
  }
  html += upcoming.map(j => {
    const days = Math.round((new Date(j.deadline + 'T00:00:00') - today) / 86400000);
    const urgCls = days === 0 ? 'dash-dl-today' : days <= 2 ? 'dash-dl-soon' : '';
    return `<div class="dash-deadline-item ${urgCls}" data-job-id="${j.id}">
      <div>
        <div class="dash-dl-role">${escHtml(j.role)}</div>
        <div class="dash-dl-company">${escHtml(j.company)}</div>
      </div>
      <div class="dash-dl-days">${days === 0 ? 'Today' : days === 1 ? '1d left' : days + 'd left'}</div>
    </div>`;
  }).join('');
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
    const sJobs = jobs.filter(j => j.stage === s.key);
    if (sJobs.length === 0) return null;
    const avgDays = Math.round(sJobs.reduce((sum, j) => sum + (now - new Date(j.dateAdded)) / 86400000, 0) / sJobs.length);
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
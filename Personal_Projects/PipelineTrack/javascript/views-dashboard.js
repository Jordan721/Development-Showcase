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

  // Activity timeline — default to week view
  renderActivity('week');

  if (typeof animateDashboardStats === 'function') animateDashboardStats();
  if (typeof animateBars === 'function') animateBars('.pipeline-bar-fill');
}

/* ══════════════════════════════════════════════════════════
   JOB ACTIVITY TIMELINE
   ══════════════════════════════════════════════════════════ */
const ACT_DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ACT_MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ACT_MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function wireActivityFilters() {
  document.querySelectorAll('.activity-filter').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.activity-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderActivity(btn.dataset.period);
    };
  });
}

function wireCalClicks(el) {
  el.querySelectorAll('[data-day-jobs]').forEach(cell => {
    cell.addEventListener('click', () => openDayModal(cell.dataset.dayLabel, JSON.parse(cell.dataset.dayJobs)));
  });
}

function renderActivity(period = 'week') {
  const el = document.getElementById('dash-activity');
  const now = new Date();
  const jobs = state.jobs;

  wireActivityFilters();

  // ── WEEK: 7-day strip calendar ─────────────────────────
  if (period === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekCells = Array.from({
      length: 7
    }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dayJobs = jobs.filter(j => {
        const jd = new Date(j.dateAdded);
        return jd.getFullYear() === d.getFullYear() && jd.getMonth() === d.getMonth() && jd.getDate() === d.getDate();
      });
      const isToday = d.toDateString() === now.toDateString();
      const label = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      const ids = JSON.stringify(dayJobs.map(j => j.id));
      const cls = 'cal-week-day' + (isToday ? ' today' : '') + (dayJobs.length ? ' has-jobs' : '');
      const attrs = dayJobs.length ? ' data-day-jobs=\'' + ids + '\' data-day-label="' + label + '"' : '';
      const chips = dayJobs.slice(0, 2).map(j => '<div class="cal-job-chip">' + escHtml(j.role) + '</div>').join('');
      const more = dayJobs.length > 2 ? '<div class="cal-job-more">+' + (dayJobs.length - 2) + ' more</div>' : '';
      const inner = dayJobs.length ?
        '<div class="cal-week-jobs"><span class="cal-job-count">' + dayJobs.length + '</span>' + chips + more + '</div>' :
        '<div class="cal-week-empty">—</div>';
      return '<div class="' + cls + '"' + attrs + '>' +
        '<div class="cal-week-header">' +
        '<span class="cal-week-dayname">' + ACT_DAY_ABBR[d.getDay()] + '</span>' +
        '<span class="cal-week-datenum">' + d.getDate() + '</span>' +
        '</div>' + inner + '</div>';
    }).join('');
    el.innerHTML = '<div class="cal-week">' + weekCells + '</div>';
    wireCalClicks(el);
    return;
  }

  // ── MONTH: calendar grid ───────────────────────────────
  if (period === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const jobsByDay = {};
    jobs.forEach(j => {
      const d = new Date(j.dateAdded);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!jobsByDay[key]) jobsByDay[key] = [];
        jobsByDay[key].push(j);
      }
    });

    const dayCells = Array.from({
      length: totalCells
    }, (_, i) => {
      const cellDate = new Date(year, month, 1 - startOffset + i);
      const isCurrent = cellDate.getMonth() === month;
      const isToday = cellDate.toDateString() === now.toDateString();
      const cellJobs = isCurrent ? (jobsByDay[cellDate.getDate()] || []) : [];
      const label = cellDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      const ids = JSON.stringify(cellJobs.map(j => j.id));
      const cls = 'cal-month-cell' + (!isCurrent ? ' other-month' : '') + (isToday ? ' today' : '') + (cellJobs.length ? ' has-jobs' : '');
      const attrs = cellJobs.length ? ' data-day-jobs=\'' + ids + '\' data-day-label="' + label + '"' : '';
      const dot = cellJobs.length ? '<span class="cal-cell-dot">' + cellJobs.length + '</span>' : '';
      return '<div class="' + cls + '"' + attrs + '><span class="cal-cell-num">' + cellDate.getDate() + '</span>' + dot + '</div>';
    }).join('');

    const dayHeaders = ACT_DAY_ABBR.map(d => '<span>' + d + '</span>').join('');
    el.innerHTML = '<div class="cal-month">' +
      '<div class="cal-month-title">' + ACT_MONTH_LONG[month] + ' ' + year + '</div>' +
      '<div class="cal-month-daynames">' + dayHeaders + '</div>' +
      '<div class="cal-month-grid">' + dayCells + '</div>' +
      '</div>';
    wireCalClicks(el);
    return;
  }

  // ── YEAR: 12-month tile grid ───────────────────────────
  if (period === 'year') {
    const year = now.getFullYear();
    const monthJobs = Array.from({
      length: 12
    }, () => []);
    jobs.forEach(j => {
      const d = new Date(j.dateAdded);
      if (d.getFullYear() === year) monthJobs[d.getMonth()].push(j);
    });
    const maxCount = Math.max(...monthJobs.map(m => m.length), 1);

    const yearCells = ACT_MONTH_SHORT.map((name, i) => {
      const mJobs = monthJobs[i];
      const count = mJobs.length;
      const isCurrent = i === now.getMonth();
      const pct = Math.round((count / maxCount) * 100);
      const ids = JSON.stringify(mJobs.map(j => j.id));
      const label = ACT_MONTH_LONG[i] + ' ' + year;
      const cls = 'cal-year-month' + (count > 0 ? ' has-jobs' : '') + (isCurrent ? ' current-month' : '');
      const attrs = count > 0 ? ' data-day-jobs=\'' + ids + '\' data-day-label="' + label + '"' : '';
      const countText = count > 0 ? count + ' job' + (count !== 1 ? 's' : '') : '—';
      return '<div class="' + cls + '"' + attrs + '>' +
        '<div class="cal-year-month-name">' + name + '</div>' +
        '<div class="cal-year-bar-track"><div class="cal-year-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="cal-year-count">' + countText + '</div>' +
        '</div>';
    }).join('');

    el.innerHTML = '<div class="cal-year"><div class="cal-year-title">' + year + '</div>' +
      '<div class="cal-year-grid">' + yearCells + '</div></div>';
    wireCalClicks(el);
    return;
  }

  // ── ALL TIME: original list view ──────────────────────
  if (jobs.length === 0) {
    el.innerHTML = '<p class="empty-msg">No jobs tracked yet.</p>';
    return;
  }

  const groups = {};
  jobs.forEach(j => {
    const d = new Date(j.dateAdded);
    const key = d.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(j);
  });

  const sorted = Object.entries(groups).sort((a, b) => new Date(b[1][0].dateAdded) - new Date(a[1][0].dateAdded));

  el.innerHTML = sorted.map(([label, groupJobs]) => {
    const preview = groupJobs.slice(0, 3).map(j =>
      '<span class="activity-job-name">' + escHtml(j.role) + ' <span style="color:var(--text-muted)">@ ' + escHtml(j.company) + '</span></span>'
    ).join('');
    const extra = groupJobs.length > 3 ? '<span class="activity-extra">+' + (groupJobs.length - 3) + ' more</span>' : '';
    return '<div class="activity-row">' +
      '<div class="activity-date-col"><span class="activity-date">' + label + '</span>' +
      '<span class="activity-count">' + groupJobs.length + ' job' + (groupJobs.length !== 1 ? 's' : '') + '</span></div>' +
      '<div class="activity-jobs-col">' + preview + extra + '</div>' +
      '</div>';
  }).join('');
}


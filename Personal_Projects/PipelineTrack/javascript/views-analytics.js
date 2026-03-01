'use strict';

/* ══════════════════════════════════════════════════════════
   ANALYTICS VIEW
   ══════════════════════════════════════════════════════════ */
let anPeriod = 'all';
let anTimeGranularity = 'weekly';

function getJobsForPeriod(period) {
  const now = new Date();
  return state.jobs.filter(j => {
    const d = new Date(j.dateAdded);
    if (period === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return d >= start;
    }
    if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  });
}

function renderAnalyticsKPIs(jobs) {
  const el = document.getElementById('an-kpi-strip');
  if (!el) return;
  const total = jobs.length;
  const applied = jobs.filter(j => ['applied', 'screening', 'interview', 'offer'].includes(j.stage)).length;
  const interviews = jobs.filter(j => ['interview', 'offer'].includes(j.stage)).length;
  const offers = jobs.filter(j => j.stage === 'offer').length;
  const declined = jobs.filter(j => j.stage === 'declined').length;
  const scored = jobs.filter(j => j.fitScore !== null && j.fitScore !== undefined);
  const avgFit = scored.length ? Math.round(scored.reduce((s, j) => s + j.fitScore, 0) / scored.length) : null;
  const responseCount = jobs.filter(j => ['screening', 'interview', 'offer'].includes(j.stage)).length;
  const responseRate = applied > 0 ? Math.round((responseCount / applied) * 100) : null;
  el.innerHTML = [{
      label: 'Tracked',
      value: total,
      color: ''
    },
    {
      label: 'Applied',
      value: applied,
      color: 'var(--accent)'
    },
    {
      label: 'Interviews',
      value: interviews,
      color: 'var(--yellow)'
    },
    {
      label: 'Offers',
      value: offers,
      color: 'var(--green)'
    },
    {
      label: 'Declined',
      value: declined,
      color: 'var(--red)'
    },
    {
      label: 'Avg Fit',
      value: avgFit !== null ? avgFit + '%' : '—',
      color: ''
    },
    {
      label: 'Response Rate',
      value: responseRate !== null ? responseRate + '%' : '—',
      color: responseRate >= 30 ? 'var(--green)' : responseRate >= 10 ? 'var(--yellow)' : responseRate !== null ? 'var(--red)' : ''
    },
  ].map(k => `<div class="an-kpi-card">
    <div class="an-kpi-label">${k.label}</div>
    <div class="an-kpi-value" style="color:${k.color || 'var(--text)'}">${k.value}</div>
  </div>`).join('');
}

function renderAnalyticsFunnel(jobs) {
  const el = document.getElementById('an-funnel');
  if (!el) return;
  const stages = ['applied', 'screening', 'interview', 'offer'];
  const counts = stages.map(s => jobs.filter(j => j.stage === s).length);
  const max = Math.max(...counts, 1);
  const colors = {
    applied: 'var(--accent)',
    screening: '#a78bfa',
    interview: 'var(--yellow)',
    offer: 'var(--green)'
  };
  el.innerHTML = stages.map((s, i) => {
    const count = counts[i];
    const pct = Math.round((count / max) * 100);
    const prevCount = i > 0 ? counts[i - 1] : count;
    const convRate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
    const convText = i > 0 ? `<span class="an-conv-rate">${convRate}% from prev</span>` : '';
    return `<div class="an-funnel-row">
      <div class="an-funnel-label">${STAGE_LABELS[s]}</div>
      <div class="an-funnel-bar-wrap">
        <div class="an-funnel-bar" style="width:${Math.max(pct,1)}%;background:${colors[s]}">${count > 0 ? count : ''}</div>
        ${convText}
      </div>
    </div>`;
  }).join('');
}

function renderAnalyticsResponseRate(jobs) {
  const el = document.getElementById('an-response-rate');
  if (!el) return;
  const applied = jobs.filter(j => j.stage !== 'saved').length;
  const stages = ['screening', 'interview', 'offer', 'declined'];
  const labels = {
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    declined: 'Declined'
  };
  const colors = {
    screening: '#a78bfa',
    interview: 'var(--yellow)',
    offer: 'var(--green)',
    declined: 'var(--red)'
  };
  if (applied === 0) {
    el.innerHTML = '<p class="empty-msg">No applications yet.</p>';
    return;
  }
  el.innerHTML = stages.map(s => {
    const count = jobs.filter(j => j.stage === s).length;
    const pct = Math.round((count / applied) * 100);
    return `<div class="an-bar-row">
      <div class="an-bar-label">${labels[s]}</div>
      <div class="an-bar-track"><div class="an-bar-fill" style="width:${pct}%;background:${colors[s]}"></div></div>
      <div class="an-bar-count">${count}</div>
    </div>`;
  }).join('') + `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Based on ${applied} applications</div>`;
}

function renderAnalyticsOverTime(jobs, granularity) {
  const el = document.getElementById('an-over-time');
  if (!el) return;
  const now = new Date();
  let buckets = [];
  if (granularity === 'weekly') {
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      const count = jobs.filter(j => {
        const d = new Date(j.dateAdded);
        return d >= start && d <= end;
      }).length;
      buckets.push({
        label: (start.getMonth() + 1) + '/' + start.getDate(),
        count
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = jobs.filter(j => {
        const jd = new Date(j.dateAdded);
        return jd.getFullYear() === d.getFullYear() && jd.getMonth() === d.getMonth();
      }).length;
      buckets.push({
        label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()],
        count
      });
    }
  }
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  el.innerHTML = '<div class="an-timechart">' +
    buckets.map(b => {
      const h = Math.round((b.count / maxCount) * 155);
      return `<div class="an-timechart-col">
        <div class="an-timechart-count">${b.count || ''}</div>
        <div class="an-timechart-bar" style="height:${Math.max(h,2)}px" title="${b.label}: ${b.count}"></div>
        <div class="an-timechart-label">${b.label}</div>
      </div>`;
    }).join('') + '</div>';
}

function renderAnalyticsTopCompanies(jobs) {
  const el = document.getElementById('an-top-companies');
  if (!el) return;
  const counts = {};
  jobs.forEach(j => {
    const c = j.company || 'Unknown';
    counts[c] = (counts[c] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) {
    el.innerHTML = '<p class="empty-msg">No data yet.</p>';
    return;
  }
  const max = sorted[0][1];
  el.innerHTML = sorted.map(([co, count]) => `<div class="an-bar-row">
    <div class="an-bar-label">${escHtml(co)}</div>
    <div class="an-bar-track"><div class="an-bar-fill" style="width:${Math.round((count/max)*100)}%"></div></div>
    <div class="an-bar-count">${count}</div>
  </div>`).join('');
}

function renderAnalyticsSkillGaps(jobs) {
  const el = document.getElementById('an-skill-gaps');
  if (!el) return;
  const counts = {};
  jobs.forEach(j => (j.missing || []).forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  }));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sorted.length === 0) {
    el.innerHTML = '<p class="empty-msg">No skill gap data. Add job descriptions to see gaps.</p>';
    return;
  }
  const max = sorted[0][1];
  el.innerHTML = sorted.map(([skill, count]) => `<div class="an-bar-row">
    <div class="an-bar-label">${escHtml(skill)}</div>
    <div class="an-bar-track"><div class="an-bar-fill fill-red" style="width:${Math.round((count/max)*100)}%"></div></div>
    <div class="an-bar-count">${count}</div>
  </div>`).join('');
}

function renderAnalyticsFitDistribution(jobs) {
  const el = document.getElementById('an-fit-dist');
  if (!el) return;
  const scored = jobs.filter(j => j.fitScore !== null && j.fitScore !== undefined);
  if (scored.length === 0) {
    el.innerHTML = '<p class="empty-msg">No fit score data yet.</p>';
    return;
  }
  const buckets = [{
      label: '76–100%',
      min: 76,
      max: 100,
      cls: 'fill-green'
    },
    {
      label: '51–75%',
      min: 51,
      max: 75,
      cls: ''
    },
    {
      label: '26–50%',
      min: 26,
      max: 50,
      cls: 'fill-yellow'
    },
    {
      label: '0–25%',
      min: 0,
      max: 25,
      cls: 'fill-red'
    },
  ];
  const counts = buckets.map(b => scored.filter(j => j.fitScore >= b.min && j.fitScore <= b.max).length);
  const max = Math.max(...counts, 1);
  el.innerHTML = buckets.map((b, i) => `<div class="an-bar-row">
    <div class="an-bar-label">${b.label}</div>
    <div class="an-bar-track"><div class="an-bar-fill ${b.cls}" style="width:${Math.round((counts[i]/max)*100)}%"></div></div>
    <div class="an-bar-count">${counts[i]}</div>
  </div>`).join('');
}

function renderAnalyticsBreakdown(elId, jobs, field) {
  const el = document.getElementById(elId);
  if (!el) return;
  const counts = {};
  jobs.forEach(j => {
    const v = j[field] || 'Unknown';
    counts[v] = (counts[v] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    el.innerHTML = '<p class="empty-msg">No data yet.</p>';
    return;
  }
  const max = sorted[0][1];
  el.innerHTML = sorted.map(([val, count]) => `<div class="an-bar-row">
    <div class="an-bar-label">${escHtml(val)}</div>
    <div class="an-bar-track"><div class="an-bar-fill" style="width:${Math.round((count/max)*100)}%"></div></div>
    <div class="an-bar-count">${count}</div>
  </div>`).join('');
}

function wireAnalyticsControls() {
  document.querySelectorAll('.an-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.an-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      anPeriod = btn.dataset.anPeriod;
      renderAnalytics();
    };
  });
  document.querySelectorAll('.an-time-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.an-time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      anTimeGranularity = btn.dataset.time;
      renderAnalyticsOverTime(getJobsForPeriod(anPeriod), anTimeGranularity);
    };
  });
}

function renderAnalytics() {
  const jobs = getJobsForPeriod(anPeriod);
  renderAnalyticsKPIs(jobs);
  renderAnalyticsFunnel(jobs);
  renderAnalyticsResponseRate(jobs);
  renderAnalyticsOverTime(jobs, anTimeGranularity);
  renderAnalyticsTopCompanies(jobs);
  renderAnalyticsSkillGaps(jobs);
  renderAnalyticsFitDistribution(jobs);
  renderAnalyticsBreakdown('an-work-type', jobs, 'workType');
  renderAnalyticsBreakdown('an-job-type', jobs, 'jobType');
  renderAnalyticsBreakdown('an-seniority', jobs, 'seniority');
  wireAnalyticsControls();
}
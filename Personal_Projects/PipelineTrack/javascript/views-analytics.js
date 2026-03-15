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

/* ── Animation helpers ─────────────────────────────────── */

// Animate bar widths from 0 → data-aw and heights from 2px → data-ah
function _animateBars(container) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    container.querySelectorAll('[data-aw]').forEach(el => {
      el.style.width = el.dataset.aw + '%';
    });
    container.querySelectorAll('[data-ah]').forEach(el => {
      el.style.height = el.dataset.ah + 'px';
    });
  }));
}

// Count a numeric value up from 0 inside an element
function _countUp(el, target, suffix) {
  if (!el || isNaN(target)) return;
  const duration = 650;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + (suffix || '');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── Renderers ─────────────────────────────────────────── */

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

  const kpis = [{
      label: 'Tracked',
      value: total,
      raw: total,
      suffix: '',
      color: ''
    },
    {
      label: 'Applied',
      value: applied,
      raw: applied,
      suffix: '',
      color: 'var(--accent)'
    },
    {
      label: 'Interviews',
      value: interviews,
      raw: interviews,
      suffix: '',
      color: 'var(--yellow)'
    },
    {
      label: 'Offers',
      value: offers,
      raw: offers,
      suffix: '',
      color: 'var(--green)'
    },
    {
      label: 'Not Selected',
      value: declined,
      raw: declined,
      suffix: '',
      color: 'var(--red)'
    },
    {
      label: 'Avg Fit',
      value: avgFit !== null ? avgFit + '%' : '—',
      raw: avgFit,
      suffix: '%',
      color: ''
    },
    {
      label: 'Response Rate',
      value: responseRate !== null ? responseRate + '%' : '—',
      raw: responseRate,
      suffix: '%',
      color: responseRate >= 30 ? 'var(--green)' : responseRate >= 10 ? 'var(--yellow)' : responseRate !== null ? 'var(--red)' : ''
    },
  ];

  el.innerHTML = kpis.map((k, i) => `<div class="an-kpi-card an-kpi-enter" style="--i:${i}">
    <div class="an-kpi-label">${k.label}</div>
    <div class="an-kpi-value" style="color:${k.color || 'var(--text)'}" data-raw="${k.raw !== null ? k.raw : ''}" data-suffix="${k.suffix}">${k.value}</div>
  </div>`).join('');

  // Count-up animation for numeric KPI values
  el.querySelectorAll('.an-kpi-value[data-raw]').forEach(valEl => {
    const raw = parseFloat(valEl.dataset.raw);
    if (!isNaN(raw)) {
      valEl.textContent = '0' + valEl.dataset.suffix;
      _countUp(valEl, raw, valEl.dataset.suffix);
    }
  });
}

function renderAnalyticsFunnel(jobs) {
  const el = document.getElementById('an-funnel');
  if (!el) return;
  const stages = ['applied', 'screening', 'interview', 'offer'];
  const counts = stages.map(s => jobs.filter(j => j.stage === s).length);
  const max = Math.max(...counts, 1);
  const colorClasses = {
    applied: '',
    screening: 'fill-purple',
    interview: 'fill-yellow',
    offer: 'fill-green'
  };
  el.innerHTML = stages.map((s, i) => {
    const count = counts[i];
    const pct = Math.round((count / max) * 100);
    const prevCount = i > 0 ? counts[i - 1] : count;
    const convRate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
    const convText = i > 0 ? `<span class="an-conv-rate">${convRate}% from prev</span>` : '';
    return `<div class="an-funnel-row an-funnel-row-click" data-stage="${s}" title="View ${count} job${count !== 1 ? 's' : ''}">
      <div class="an-funnel-label">${STAGE_LABELS[s]}</div>
      <div class="an-funnel-bar-wrap">
        <div class="an-funnel-bar ${colorClasses[s]}" style="width:0" data-aw="${Math.max(pct, 1)}">${count > 0 ? count : ''}</div>
        ${convText}
      </div>
    </div>`;
  }).join('');
  _animateBars(el);

  el.querySelectorAll('.an-funnel-row-click').forEach(row => {
    row.addEventListener('click', () => {
      const stage = row.dataset.stage;
      const matched = jobs.filter(j => j.stage === stage);
      openFilterModal(`Stage: ${STAGE_LABELS[stage]}`, `${matched.length} job${matched.length !== 1 ? 's' : ''}`, matched);
    });
  });
}

function renderAnalyticsResponseRate(jobs) {
  const el = document.getElementById('an-response-rate');
  if (!el) return;
  const applied = jobs.filter(j => j.stage !== 'saved').length;
  const stages = ['screening', 'interview', 'offer', 'declined', 'withdrew'];
  const labels = {
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    declined: 'Not Selected',
    withdrew: 'Declined'
  };
  const colorClasses = {
    screening: 'fill-purple',
    interview: 'fill-yellow',
    offer: 'fill-green',
    declined: 'fill-red',
    withdrew: 'fill-orange'
  };
  if (applied === 0) {
    el.innerHTML = '<p class="empty-msg">No applications yet.</p>';
    return;
  }
  el.innerHTML = stages.map(s => {
    const count = jobs.filter(j => j.stage === s).length;
    const pct = Math.round((count / applied) * 100);
    return `<div class="an-bar-row an-bar-row-clickable" data-stage="${s}" title="View ${count} job${count !== 1 ? 's' : ''}">
      <div class="an-bar-label">${labels[s]}</div>
      <div class="an-bar-track"><div class="an-bar-fill ${colorClasses[s]}" style="width:0" data-aw="${pct}"></div></div>
      <div class="an-bar-count">${count}</div>
    </div>`;
  }).join('') + `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">Based on ${applied} applications</div>`;
  _animateBars(el);

  el.querySelectorAll('.an-bar-row-clickable[data-stage]').forEach(row => {
    row.addEventListener('click', () => {
      const stage = row.dataset.stage;
      const matched = jobs.filter(j => j.stage === stage);
      openFilterModal(`Stage: ${STAGE_LABELS[stage]}`, `${matched.length} job${matched.length !== 1 ? 's' : ''}`, matched);
    });
  });
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
        count,
        start: start.getTime(),
        end: end.getTime()
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const count = jobs.filter(j => {
        const jd = new Date(j.dateAdded);
        return jd.getFullYear() === d.getFullYear() && jd.getMonth() === d.getMonth();
      }).length;
      buckets.push({
        label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()],
        count,
        start: d.getTime(),
        end: end.getTime()
      });
    }
  }
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  el.innerHTML = '<div class="an-timechart">' +
    buckets.map(b => {
      const h = Math.round((b.count / maxCount) * 155);
      return `<div class="an-timechart-col an-col-click" data-start="${b.start}" data-end="${b.end}" data-label="${b.label}" title="${b.label}: ${b.count} job${b.count !== 1 ? 's' : ''}">
        <div class="an-timechart-count">${b.count || ''}</div>
        <div class="an-timechart-bar" style="height:2px" data-ah="${Math.max(h, 2)}"></div>
        <div class="an-timechart-label">${b.label}</div>
      </div>`;
    }).join('') + '</div>';
  _animateBars(el);

  el.querySelectorAll('.an-col-click').forEach(col => {
    col.addEventListener('click', () => {
      const start = new Date(+col.dataset.start);
      const end = new Date(+col.dataset.end);
      const matched = jobs.filter(j => {
        const d = new Date(j.dateAdded);
        return d >= start && d <= end;
      });
      openFilterModal(`Added: ${col.dataset.label}`, `${matched.length} job${matched.length !== 1 ? 's' : ''}`, matched);
    });
  });
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
    <div class="an-bar-track"><div class="an-bar-fill" style="width:0" data-aw="${Math.round((count/max)*100)}"></div></div>
    <div class="an-bar-count">${count}</div>
  </div>`).join('');
  _animateBars(el);
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
  el.innerHTML = sorted.map(([skill, count]) => `<div class="an-bar-row an-bar-row-clickable" data-skill="${escHtml(skill)}" title="View ${count} job${count !== 1 ? 's' : ''} missing ${escHtml(skill)}">
    <div class="an-bar-label">${escHtml(skill)}</div>
    <div class="an-bar-track"><div class="an-bar-fill fill-red" style="width:0" data-aw="${Math.round((count/max)*100)}"></div></div>
    <div class="an-bar-count">${count}</div>
  </div>`).join('');
  el.querySelectorAll('.an-bar-row-clickable').forEach(row => {
    row.addEventListener('click', () => {
      const skill = row.dataset.skill;
      const matched = jobs.filter(j => (j.missing || []).includes(skill));
      openFilterModal(`Skill Gap: ${skill}`, `${matched.length} job${matched.length !== 1 ? 's' : ''} missing this skill`, matched);
    });
  });
  _animateBars(el);
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
  el.innerHTML = buckets.map((b, i) => `<div class="an-bar-row an-bar-row-clickable" data-min="${b.min}" data-max="${b.max}">
    <div class="an-bar-label">${b.label}</div>
    <div class="an-bar-track"><div class="an-bar-fill ${b.cls}" style="width:0" data-aw="${Math.round((counts[i]/max)*100)}"></div></div>
    <div class="an-bar-count">${counts[i]}</div>
  </div>`).join('');
  _animateBars(el);

  el.querySelectorAll('.an-bar-row-clickable[data-min]').forEach((row, i) => {
    row.addEventListener('click', () => {
      const min = +row.dataset.min,
        maxScore = +row.dataset.max;
      const matched = scored.filter(j => j.fitScore >= min && j.fitScore <= maxScore);
      openFilterModal(`Fit Score: ${buckets[i].label}`, `${matched.length} job${matched.length !== 1 ? 's' : ''}`, matched);
    });
  });
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
  el.innerHTML = sorted.map(([val, count]) => `<div class="an-bar-row an-bar-row-clickable" data-field="${escHtml(field)}" data-val="${escHtml(val)}" title="View ${count} job${count !== 1 ? 's' : ''}">
    <div class="an-bar-label">${escHtml(val)}</div>
    <div class="an-bar-track"><div class="an-bar-fill" style="width:0" data-aw="${Math.round((count/max)*100)}"></div></div>
    <div class="an-bar-count">${count}</div>
  </div>`).join('');
  _animateBars(el);

  el.querySelectorAll('.an-bar-row-clickable').forEach(row => {
    row.addEventListener('click', () => {
      openAnalyticsFilterModal(field, row.dataset.val, jobs);
    });
  });
}

// Shared drill-down modal — used by analytics + dashboard
function openFilterModal(title, subtitle, matchedJobs) {
  document.getElementById('an-filter-modal-title').textContent = title;
  document.getElementById('an-filter-modal-sub').textContent = subtitle;

  const listEl = document.getElementById('an-filter-modal-jobs');
  if (matchedJobs.length === 0) {
    listEl.innerHTML = '<p class="empty-msg">No jobs found.</p>';
  } else {
    listEl.innerHTML = matchedJobs.map(job => {
      const cls = fitBadgeClass(job.fitScore);
      const lbl = fitBadgeLabel(job.fitScore);
      return `<div class="day-modal-job" data-job-id="${job.id}">
        <div class="day-modal-job-info">
          <div class="day-modal-job-role">${escHtml(job.role)}</div>
          <div class="day-modal-job-company">${escHtml(job.company)}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
        </div>
        <div class="day-modal-job-badges">
          <span class="stage-badge stage-${job.stage}">${STAGE_LABELS[job.stage]}</span>
          <span class="fit-badge ${cls}">${lbl}</span>
        </div>
      </div>`;
    }).join('');

    listEl.querySelectorAll('.day-modal-job').forEach(item => {
      item.addEventListener('click', () => {
        closeModal('modal-an-filter');
        openJobDetail(item.dataset.jobId);
      });
    });
  }

  openModal('modal-an-filter');
}

function openAnalyticsFilterModal(field, val, jobs) {
  const fieldLabels = {
    workType: 'Work Type',
    jobType: 'Job Type',
    seniority: 'Seniority'
  };
  const matched = jobs.filter(j => (j[field] || 'Unknown') === val);
  openFilterModal(
    `${fieldLabels[field] || field}: ${val}`,
    `${matched.length} job${matched.length !== 1 ? 's' : ''}`,
    matched
  );
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

  // Staggered entrance for section cards
  const view = document.getElementById('view-analytics');
  if (view) {
    view.querySelectorAll('.dash-card').forEach((card, i) => {
      card.classList.remove('an-card-enter');
      void card.offsetWidth; // force reflow to restart animation
      card.style.setProperty('--ci', i);
      card.classList.add('an-card-enter');
    });
  }
}
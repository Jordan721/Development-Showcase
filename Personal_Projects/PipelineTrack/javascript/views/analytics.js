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
    container.querySelectorAll('[data-chart-ratio]').forEach(el => {
      el.style.height = `max(3px, calc((100% - 42px) * ${el.dataset.chartRatio}))`;
    });
  }));
}

// Count a numeric value up from 0 inside an element
function _countUp(el, target, suffix) {
  if (!el || isNaN(target)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = Math.round(target) + (suffix || '');
    return;
  }
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
  const avgFit = scored.length ? Math.round(scored.reduce((s, j) => s + Number(j.fitScore), 0) / scored.length) : null;
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

// Shared category charts with keyboard-accessible drill-down buttons.
function renderAnalyticsComposition(el, segments, total, caption, onSelect, columns = false) {
  const palette = ['var(--accent)', 'var(--purple, #a78bfa)', 'var(--yellow)', 'var(--green)', 'var(--red)', 'var(--orange, #fb923c)'];
  const max = Math.max(1, ...segments.map(segment => segment.count));
  el.innerHTML = `<div class="an-distribution-summary">${total} ${escHtml(caption)}</div><div class="${columns ? 'an-distribution-columns' : 'an-distribution-bars'}">${segments.map((segment, i) => {
    const percent = total ? Math.round(segment.count / total * 100) : 0;
    const size = columns ? segment.count / max * 100 : total ? segment.count / total * 100 : 0;
    return `<button type="button" class="an-distribution-item" data-segment="${i}" style="--segment-color:${segment.color || palette[i % palette.length]};--segment-size:${size}%" aria-label="${escHtml(segment.label)}: ${segment.count} jobs (${percent}%). Show matching jobs."><span class="an-distribution-label">${escHtml(segment.label)}</span><span class="an-distribution-value"><strong>${segment.count}</strong><span>${percent}%</span></span><span class="an-distribution-track" aria-hidden="true"><span class="an-distribution-fill"></span></span></button>`;
  }).join('')}</div>`;
  el.querySelectorAll('[data-segment]').forEach(button => {
    button.onclick = () => onSelect(segments[Number(button.dataset.segment)]);
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
    const convText = `<span class="an-conv-rate">${count} currently in stage</span>`;
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
      <div class="an-bar-count">${pct}%<small>${count} jobs</small></div>
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
  const points = buckets.map((b, i) => ({
    x: 32 + i * 636 / (buckets.length - 1),
    y: 190 - b.count / maxCount * 160
  }));
  const line = points.map(p => `${p.x},${p.y}`).join(' ');
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  el.innerHTML = `<div class="an-trend-summary"><strong>${total}<span> opportunities added</span></strong><span>Last ${buckets.length} ${granularity === 'weekly' ? 'weeks' : 'months'}</span></div><div class="an-trend"><svg viewBox="0 0 700 220" role="img" aria-label="Opportunities added over time"><defs><linearGradient id="an-trend-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".3"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>${[0, 0.5, 1].map(f => `<line x1="32" x2="668" y1="${190 - f * 160}" y2="${190 - f * 160}" class="an-trend-grid"/><text x="4" y="${194 - f * 160}" class="an-trend-axis">${Math.round(maxCount * f)}</text>`).join('')}<polygon points="32,190 ${line} 668,190" fill="url(#an-trend-gradient)"/><polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${points.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"><title>${buckets[i].label}: ${buckets[i].count} jobs</title></circle>`).join('')}</svg><div class="an-trend-periods">${buckets.map(b => `<button type="button" class="an-col-click" data-start="${b.start}" data-end="${b.end}" data-label="${b.label}" aria-label="${b.label}: ${b.count} opportunities. View jobs."><strong>${b.count}</strong><span>${b.label}</span></button>`).join('')}</div></div>`;

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
  buckets.reverse();
  const counts = buckets.map(b => scored.filter(j => j.fitScore >= b.min && j.fitScore <= b.max).length);
  const colors = ['var(--red)', 'var(--yellow)', 'var(--accent)', 'var(--green)'];
  renderAnalyticsComposition(el, buckets.map((b, i) => ({
    ...b,
    count: counts[i],
    color: colors[i]
  })), counts.reduce((sum, count) => sum + count, 0), 'scored jobs', segment => {
    const matched = scored.filter(j => j.fitScore >= segment.min && j.fitScore <= segment.max);
    openFilterModal(`Fit Score: ${segment.label}`, `${matched.length} jobs`, matched);
  }, true);
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
  renderAnalyticsComposition(el, sorted.map(([label, count]) => ({
    label,
    count
  })), jobs.length, 'tracked jobs', segment => {
    openAnalyticsFilterModal(field, segment.label, jobs);
  });
}

// Shared drill-down modal — used by analytics + dashboard
function openFilterModal(title, subtitle, matchedJobs) {
  document.getElementById('an-filter-modal-title').textContent = title;
  document.getElementById('an-filter-modal-sub').textContent = subtitle;
  const searchEl = document.getElementById('an-filter-modal-search');
  const clearEl = document.getElementById('an-filter-modal-clear');
  searchEl.value = '';
  const listEl = document.getElementById('an-filter-modal-jobs');
  const renderResults = () => {
    const query = searchEl.value.trim().toLowerCase();
    const results = matchedJobs.filter(job => !query || [job.role, job.company, job.location].some(value => String(value || '').toLowerCase().includes(query)));
    clearEl.hidden = searchEl.value.length === 0;
    document.getElementById('an-filter-modal-count').textContent = query ?
      `${results.length} of ${matchedJobs.length} matching jobs` :
      `${matchedJobs.length} matching job${matchedJobs.length === 1 ? '' : 's'}`;
    if (results.length === 0) {
      listEl.innerHTML = query ?
        '<div class="filter-modal-empty"><span aria-hidden="true">&#8981;</span><strong>No search results</strong><p>Try another role, company, or location, or clear your search.</p></div>' :
        '<div class="filter-modal-empty"><span aria-hidden="true">&#8981;</span><strong>No matching jobs yet</strong><p>Jobs that match this insight will appear here.</p></div>';
    } else {
      listEl.innerHTML = results.map(job => {
        const cls = fitBadgeClass(job.fitScore);
        const lbl = fitBadgeLabel(job.fitScore);
        return `<button type="button" class="filter-modal-job" data-job-id="${escHtml(job.id)}">
          <span class="filter-modal-avatar" aria-hidden="true">${escHtml((job.company || '?').trim().slice(0, 2).toUpperCase())}</span>
          <span class="day-modal-job-info">
            <span class="day-modal-job-role">${jobDepartmentBadge(job, true)} ${escHtml(job.role)}</span>
            <span class="day-modal-job-company">${escHtml(job.company)}${job.location ? ' &middot; ' + escHtml(job.location) : ''}</span>
          </span>
          <span class="day-modal-job-badges">
            <span class="stage-badge stage-${escHtml(job.stage)}">${escHtml(STAGE_LABELS[job.stage] || job.stage)}</span>
            <span class="fit-badge ${cls}">${lbl}</span>
          </span>
          <span class="filter-modal-arrow" aria-hidden="true">&rarr;</span>
        </button>`;
      }).join('');

      listEl.querySelectorAll('.filter-modal-job').forEach(item => {
        item.addEventListener('click', () => {
          closeModal('modal-an-filter');
          openJobDetail(item.dataset.jobId);
        });
      });
    }

  };
  searchEl.oninput = renderResults;
  clearEl.onclick = () => {
    searchEl.value = '';
    renderResults();
    searchEl.focus();
  };
  renderResults();
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
  const summary = document.getElementById('an-summary');
  if (summary) {
    const active = jobs.filter(j => ['applied', 'screening', 'interview'].includes(j.stage)).length;
    const strong = jobs.filter(j => j.fitScore != null && Number(j.fitScore) >= 75).length;
    summary.innerHTML = jobs.length ?
      `<div><span class="workspace-eyebrow">YOUR SEARCH SNAPSHOT</span><h2>${active} active application${active === 1 ? '' : 's'}. Every next step counts.</h2><p>${strong} strong skill match${strong === 1 ? '' : 'es'} (75%+ fit) across ${jobs.length} tracked opportunit${jobs.length === 1 ? 'y' : 'ies'} in this period.</p></div><span class="an-summary-tag">Select a chart to explore its jobs</span>` :
      `<div><span class="workspace-eyebrow">BUILD YOUR SEARCH STORY</span><h2>${state.jobs.length ? 'No opportunities in this period yet.' : 'Your progress starts with one opportunity.'}</h2><p>${state.jobs.length ? 'Choose another period to explore your tracked jobs.' : 'Add jobs and update their stages to see your activity, skill matches, and pipeline here.'}</p></div>`;
  }
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

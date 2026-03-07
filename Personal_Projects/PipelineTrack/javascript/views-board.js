'use strict';

/* ══════════════════════════════════════════════════════════
   BOARD (KANBAN)
   ══════════════════════════════════════════════════════════ */
function boardInPeriod(job) {
  const d = new Date(job.dateAdded);
  const now = new Date();
  if (boardPeriod === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (boardPeriod === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (boardPeriod === 'year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

function applyBoardFilters(jobs) {
  let result = jobs;
  if (boardSearch.trim()) {
    const q = boardSearch.trim().toLowerCase();
    result = result.filter(j =>
      j.role.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q)
    );
  }
  if (boardFilterStage) result = result.filter(j => j.stage === boardFilterStage);
  if (boardFilterWorkType) result = result.filter(j => j.workType === boardFilterWorkType);
  if (boardFilterSeniority) result = result.filter(j => j.seniority === boardFilterSeniority);
  return result;
}

function sortTableJobs(jobs) {
  const s = [...jobs];
  if (boardSortTable === 'date-asc') return s.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
  if (boardSortTable === 'date-desc') return s.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  if (boardSortTable === 'fit-desc') return s.sort((a, b) => (b.fitScore != null ? b.fitScore : -1) - (a.fitScore != null ? a.fitScore : -1));
  if (boardSortTable === 'fit-asc') return s.sort((a, b) => (a.fitScore != null ? a.fitScore : 999) - (b.fitScore != null ? b.fitScore : 999));
  if (boardSortTable === 'role-asc') return s.sort((a, b) => a.role.localeCompare(b.role));
  if (boardSortTable === 'company-asc') return s.sort((a, b) => a.company.localeCompare(b.company));
  return s;
}

function updateBoardFilterUI() {
  const hasFilters = boardSearch || boardFilterStage || boardFilterWorkType || boardFilterSeniority;
  const clearBtn = document.getElementById('board-clear-filters');
  if (clearBtn) clearBtn.style.display = hasFilters ? '' : 'none';
  const sortSel = document.getElementById('board-sort-table');
  if (sortSel) sortSel.style.display = boardLayout === 'table' ? '' : 'none';
  const dragHint = document.getElementById('board-drag-hint');
  if (dragHint) dragHint.style.display = (boardLayout === 'table' || boardLayout === 'timeline') ? 'none' : '';
}

function renderBoard() {
  const showArchived = document.getElementById('show-archived').checked;
  const visibleStages = showArchived ? STAGES : STAGES.filter(s => s !== 'archived' && s !== 'declined' && s !== 'ghosted');
  const board = document.getElementById('kanban-board');
  const periodJobs = applyBoardFilters(state.jobs.filter(boardInPeriod));

  // Sync filter inputs from state
  const searchEl = document.getElementById('board-search');
  if (searchEl && searchEl.value !== boardSearch) searchEl.value = boardSearch;

  // Apply layout class
  board.className = `kanban kanban--${boardLayout}`;

  // Update layout toggle buttons
  document.querySelectorAll('.layout-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.layout === boardLayout);
  });

  updateBoardFilterUI();

  // Wire period filter + layout buttons (must run for all layouts, including table)
  document.querySelectorAll('.board-filter').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.board-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      boardPeriod = btn.dataset.period;
      renderBoard();
    };
  });
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.onclick = () => {
      boardLayout = btn.dataset.layout;
      localStorage.setItem('pt-board-layout', boardLayout);
      renderBoard();
    };
  });

  if (boardLayout === 'table') {
    const visibleJobs = sortTableJobs(
      boardFilterStage ?
      periodJobs :
      periodJobs.filter(j => visibleStages.includes(j.stage))
    );
    board.innerHTML = renderBoardTable(visibleJobs);
    board.querySelectorAll('.table-row-clickable').forEach(row => {
      row.addEventListener('click', () => openJobDetail(row.dataset.jobId));
    });
    board.querySelectorAll('.table-stage-select').forEach(sel => {
      sel.addEventListener('change', e => {
        e.stopPropagation();
        const job = state.jobs.find(j => j.id === sel.dataset.jobId);
        if (job) {
          const newStage = sel.value;
          job.stage = newStage;
          save();
          renderBoard();
          if (newStage === 'offer') setTimeout(launchConfetti, 200);
        }
      });
      sel.addEventListener('click', e => e.stopPropagation());
    });
    board.querySelectorAll('.table-delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const job = state.jobs.find(j => j.id === btn.dataset.deleteId);
        if (!job || !confirm(`Delete "${job.role}"?`)) return;
        state.jobs = state.jobs.filter(j => j.id !== btn.dataset.deleteId);
        save();
        renderBoard();
        toast(`"${job.role}" deleted.`, 'success');
      });
    });
    // Wire table sort header clicks
    board.querySelectorAll('.table-th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        boardSortTable = th.dataset.sort;
        const sortSel = document.getElementById('board-sort-table');
        if (sortSel) sortSel.value = boardSortTable;
        renderBoard();
      });
    });
    wireSearchAndFilters();
    return;
  }

  if (boardLayout === 'timeline') {
    const visibleJobs = periodJobs.filter(j => visibleStages.includes(j.stage));
    board.innerHTML = renderBoardTimeline(visibleJobs);
    board.querySelectorAll('.tl-row[data-job-id]').forEach(row => {
      row.addEventListener('click', () => openJobDetail(row.dataset.jobId));
    });
    wireSearchAndFilters();
    return;
  }

  if (boardLayout === 'columns') {
    board.innerHTML = visibleStages.map(stage => {
      const jobs = periodJobs.filter(j => j.stage === stage);
      return `
        <div class="kanban-col" data-stage="${stage}">
          <div class="col-stripe stripe-${stage}"></div>
          <div class="kanban-col-header">
            <span class="stage-emoji">${STAGE_EMOJIS[stage] || ''}</span>${STAGE_LABELS[stage]}
            <span class="kanban-col-count">${jobs.length}</span>
          </div>
          <div class="kanban-col-body" data-stage="${stage}">
            ${jobs.length === 0
              ? `<div class="no-jobs-col">No jobs here</div>`
              : jobs.map(j => jobCardHTML(j)).join('')}
          </div>
        </div>`;
    }).join('');
  } else {
    board.innerHTML = visibleStages.map(stage => {
      const jobs = periodJobs.filter(j => j.stage === stage);
      return `
        <div class="swimlane-row" data-stage="${stage}">
          <div class="swimlane-label">
            <div class="col-stripe stripe-${stage}"></div>
            <div class="swimlane-label-inner">
              <span class="swimlane-stage-name"><span class="stage-emoji">${STAGE_EMOJIS[stage] || ''}</span>${STAGE_LABELS[stage]}</span>
              <span class="kanban-col-count">${jobs.length}</span>
            </div>
          </div>
          <div class="swimlane-cards" data-stage="${stage}">
            ${jobs.length === 0
              ? `<div class="no-jobs-col">No jobs here</div>`
              : jobs.map(j => jobCardHTML(j)).join('')}
          </div>
        </div>`;
    }).join('');
  }

  const dropSelector = boardLayout === 'columns' ? '.kanban-col-body' : '.swimlane-cards';
  let draggedJobId = null;

  board.querySelectorAll('.card-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      const job = state.jobs.find(j => j.id === id);
      if (!job) return;
      state.jobs = state.jobs.filter(j => j.id !== id);
      save();
      renderBoard();
      if (state.activeView === 'dashboard') renderDashboard();
      toast(`"${job.role}" deleted.`, 'success');
    });
  });

  board.querySelectorAll('.job-card').forEach(card => {
    card.addEventListener('click', () => openJobDetail(card.dataset.jobId));

    card.addEventListener('dragstart', e => {
      draggedJobId = card.dataset.jobId;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedJobId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      board.querySelectorAll(dropSelector).forEach(b => b.classList.remove('drag-over'));
    });
  });

  board.querySelectorAll(dropSelector).forEach(body => {
    const targetStage = body.dataset.stage;

    body.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    body.addEventListener('dragenter', e => {
      e.preventDefault();
      body.classList.add('drag-over');
    });

    body.addEventListener('dragleave', e => {
      if (!body.contains(e.relatedTarget)) body.classList.remove('drag-over');
    });

    body.addEventListener('drop', e => {
      e.preventDefault();
      body.classList.remove('drag-over');
      if (!draggedJobId) return;
      const job = state.jobs.find(j => j.id === draggedJobId);
      if (job && job.stage !== targetStage) {
        job.stage = targetStage;
        save();
        renderBoard();
        toast(`${STAGE_EMOJIS[targetStage] || ''} Moved to ${STAGE_LABELS[targetStage]}.`, 'success');
        if (targetStage === 'offer') setTimeout(launchConfetti, 200);
      }
      draggedJobId = null;
    });
  });

  wireSearchAndFilters();
  if (typeof animateBoardCards === 'function') animateBoardCards();
}

function wireSearchAndFilters() {
  const searchEl = document.getElementById('board-search');
  const stageEl = document.getElementById('board-filter-stage');
  const workEl = document.getElementById('board-filter-work-type');
  const senEl = document.getElementById('board-filter-seniority');
  const sortEl = document.getElementById('board-sort-table');
  const clearBtn = document.getElementById('board-clear-filters');

  if (searchEl) searchEl.oninput = () => {
    boardSearch = searchEl.value;
    renderBoard();
  };
  if (stageEl) stageEl.onchange = () => {
    boardFilterStage = stageEl.value;
    renderBoard();
  };
  if (workEl) workEl.onchange = () => {
    boardFilterWorkType = workEl.value;
    renderBoard();
  };
  if (senEl) senEl.onchange = () => {
    boardFilterSeniority = senEl.value;
    renderBoard();
  };
  if (sortEl) sortEl.onchange = () => {
    boardSortTable = sortEl.value;
    renderBoard();
  };
  if (clearBtn) clearBtn.onclick = () => {
    boardSearch = '';
    boardFilterStage = '';
    boardFilterWorkType = '';
    boardFilterSeniority = '';
    if (searchEl) searchEl.value = '';
    if (stageEl) stageEl.value = '';
    if (workEl) workEl.value = '';
    if (senEl) senEl.value = '';
    renderBoard();
  };
}

function renderBoardTable(jobs) {
  if (jobs.length === 0) {
    return '<div style="padding:32px;text-align:center;color:var(--text-muted)">No jobs match your filters.</div>';
  }
  const sortIcon = (key) => boardSortTable === key ? ' ↓' : boardSortTable === key + '-asc' ? ' ↑' : '';
  const stageOptions = (current) => STAGES
    .map(s => `<option value="${s}"${s === current ? ' selected' : ''}>${STAGE_LABELS[s]}</option>`).join('');

  return `<table class="board-table">
    <thead>
      <tr>
        <th class="table-th" data-sort="role-asc">Role${sortIcon('role')}</th>
        <th class="table-th" data-sort="company-asc">Company${sortIcon('company')}</th>
        <th class="table-th">Stage</th>
        <th class="table-th">Work Type</th>
        <th class="table-th">Salary</th>
        <th class="table-th" data-sort="fit-desc">Fit${sortIcon('fit')}</th>
        <th class="table-th" data-sort="date-desc">Added${sortIcon('date')}</th>
        <th class="table-th">Deadline</th>
        <th class="table-th"></th>
      </tr>
    </thead>
    <tbody>
      ${jobs.map(j => {
        const fitCls = fitBadgeClass(j.fitScore);
        const fitLabel = fitBadgeLabel(j.fitScore);
        return `<tr class="table-row-clickable" data-job-id="${j.id}">
          <td class="table-td table-td-role">${escHtml(j.role)}</td>
          <td class="table-td">${escHtml(j.company)}${j.location ? `<span class="table-location"> · ${escHtml(j.location)}</span>` : ''}</td>
          <td class="table-td" onclick="event.stopPropagation()">
            <select class="table-stage-select stage-select-${j.stage}" data-job-id="${j.id}">${stageOptions(j.stage)}</select>
          </td>
          <td class="table-td"><span class="table-tag">${escHtml(j.workType || '—')}</span></td>
          <td class="table-td table-muted">${escHtml(j.salary || '—')}</td>
          <td class="table-td"><span class="fit-badge ${fitCls}">${fitLabel}</span></td>
          <td class="table-td table-muted">${formatDate(j.dateAdded)}</td>
          <td class="table-td table-muted${j.deadline && new Date(j.deadline+'T00:00:00') <= new Date() ? ' table-overdue' : ''}">${j.deadline ? formatDate(j.deadline) : '—'}</td>
          <td class="table-td table-actions">
            <button class="table-delete-btn" data-delete-id="${j.id}" title="Delete">✕</button>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

function jobCardHTML(job) {
  const cls = fitBadgeClass(job.fitScore);
  const label = fitBadgeLabel(job.fitScore);
  return `
    <div class="job-card" data-job-id="${job.id}" data-stage="${job.stage}" draggable="true">
      <button class="card-delete-btn" data-delete-id="${job.id}" title="Delete job" draggable="false">&times;</button>
      <div class="job-card-role"><span class="drag-handle" title="Drag to move stage" draggable="false">&#8942;</span>${escHtml(job.role)}</div>
      <div class="job-card-company">${escHtml(job.company)}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
      <div class="job-card-footer">
        <span class="job-card-date">${formatDate(job.dateAdded)}</span>
        <span class="fit-badge ${cls}">${label}</span>
      </div>
    </div>`;
}

function renderBoardTimeline(jobs) {
  if (jobs.length === 0) {
    return '<div class="tl-empty">No jobs match your filters.</div>';
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const sorted = [...jobs].sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));

  const minDate = new Date(sorted[0].dateAdded);
  minDate.setHours(0, 0, 0, 0);

  const spanMs = (today - minDate) || 1;
  const todayPct = 94; // pin "today" at 94% to leave a small right margin

  const pct = (date) => Math.max(0, Math.min(todayPct, ((new Date(date) - minDate) / spanMs) * todayPct));

  // Build month tick marks
  const ticks = [];
  const m = new Date(minDate);
  m.setDate(1);
  while (m <= today) {
    ticks.push({ label: m.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), p: pct(m) });
    m.setMonth(m.getMonth() + 1);
  }

  const stageColors = {
    saved: 'var(--text-muted)',
    applied: 'var(--accent)',
    screening: '#a78bfa',
    interview: 'var(--yellow)',
    offer: 'var(--green)',
    declined: 'var(--red)',
    ghosted: '#f97316',
    archived: 'var(--border)',
  };

  const axisHTML = ticks.map(t =>
    `<div class="tl-tick" style="left:${t.p.toFixed(2)}%">
      <div class="tl-tick-line"></div>
      <div class="tl-tick-label">${t.label}</div>
    </div>`
  ).join('') +
  `<div class="tl-today-marker" style="left:${todayPct}%">
    <div class="tl-today-line-head"></div>
    <div class="tl-today-label-head">Today</div>
  </div>`;

  const rowsHTML = sorted.map((j, idx) => {
    const startPct = pct(j.dateAdded);
    const widthPct = Math.max(0.8, todayPct - startPct);
    const color = stageColors[j.stage] || 'var(--accent)';
    const daysAgo = Math.floor((today - new Date(j.dateAdded)) / 86400000);
    const age = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1d' : `${daysAgo}d`;
    const stageName = STAGE_LABELS[j.stage] || j.stage;
    return `<div class="tl-row" data-job-id="${j.id}">
      <div class="tl-row-label">
        <div class="tl-row-role">${escHtml(j.role)}</div>
        <div class="tl-row-company">${escHtml(j.company)}</div>
      </div>
      <div class="tl-row-track">
        <div class="tl-today-track-line" style="left:${todayPct}%"></div>
        <div class="tl-bar" style="left:${startPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;--bar-color:${color};animation-delay:${idx * 55}ms" title="${escHtml(j.role)} @ ${escHtml(j.company)} — ${stageName} — ${age} ago">
          <span class="tl-bar-text">${STAGE_EMOJIS[j.stage] || ''}${stageName} &middot; ${age}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="tl-container">
    <div class="tl-axis-row">
      <div class="tl-label-spacer"></div>
      <div class="tl-axis-track">${axisHTML}</div>
    </div>
    ${rowsHTML}
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   JOB DETAIL MODAL
   ══════════════════════════════════════════════════════════ */
function openJobDetail(id) {
  const job = state.jobs.find(j => j.id === id);
  if (!job) return;
  state.activeJobId = id;

  document.getElementById('detail-title').textContent = `${job.role} @ ${job.company}`;
  document.getElementById('detail-meta').textContent = [job.location, formatDate(job.dateAdded)].filter(Boolean).join(' · ');

  // Salary
  const salaryRow = document.getElementById('detail-salary-row');
  if (job.salary) {
    document.getElementById('detail-salary').textContent = job.salary;
    salaryRow.style.display = '';
  } else {
    salaryRow.style.display = 'none';
  }

  // Date posted
  const datePostedRow = document.getElementById('detail-date-posted-row');
  if (job.datePosted) {
    document.getElementById('detail-date-posted').textContent = formatDate(job.datePosted + 'T12:00:00');
    datePostedRow.style.display = '';
  } else {
    datePostedRow.style.display = 'none';
  }

  // Date applied
  const dateAppliedRow = document.getElementById('detail-date-applied-row');
  if (job.dateApplied) {
    document.getElementById('detail-date-applied').textContent = formatDate(job.dateApplied + 'T12:00:00');
    dateAppliedRow.style.display = '';
  } else {
    dateAppliedRow.style.display = 'none';
  }

  // Benefits
  const benefitsRow = document.getElementById('detail-benefits-row');
  if (job.benefits) {
    const chips = parseBenefits(job.benefits);
    const el = document.getElementById('detail-benefits');
    if (chips.length) {
      el.innerHTML = chips.map(b => `<span class="benefit-chip">${escHtml(b)}</span>`).join('');
    } else {
      el.textContent = job.benefits;
    }
    benefitsRow.style.display = '';
  } else {
    benefitsRow.style.display = 'none';
  }

  // Department
  const departmentRow = document.getElementById('detail-department-row');
  if (job.department) {
    document.getElementById('detail-department').textContent = job.department;
    departmentRow.style.display = '';
  } else {
    departmentRow.style.display = 'none';
  }

  // Seniority badge
  const seniorityBadge = document.getElementById('detail-seniority');
  if (job.seniority) {
    seniorityBadge.textContent = job.seniority;
    seniorityBadge.style.display = '';
  } else {
    seniorityBadge.style.display = 'none';
  }

  // Job type badge
  const jobTypeBadge = document.getElementById('detail-job-type');
  if (job.jobType) {
    jobTypeBadge.textContent = job.jobType;
    jobTypeBadge.style.display = '';
  } else {
    jobTypeBadge.style.display = 'none';
  }

  // Work type badge
  const workTypeBadge = document.getElementById('detail-work-type');
  if (job.workType) {
    workTypeBadge.textContent = job.workType;
    workTypeBadge.style.display = '';
  } else {
    workTypeBadge.style.display = 'none';
  }

  // URL link
  const urlEl = document.getElementById('detail-url');
  if (job.url) {
    urlEl.href = job.url;
    urlEl.style.display = '';
  } else {
    urlEl.style.display = 'none';
  }

  // Fit ring
  const score = job.fitScore;
  const pct = score !== null && score !== undefined ? score : null;
  document.getElementById('detail-fit-pct').textContent = pct !== null ? `${pct}%` : '—';

  const ring = document.getElementById('fit-ring-fill');
  const circumference = 326.7;
  if (pct !== null) {
    const offset = circumference - (pct / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)';
  } else {
    ring.style.strokeDashoffset = circumference;
  }

  // Matched / missing
  document.getElementById('detail-matched').innerHTML =
    (job.matched || []).length ? job.matched.map(s => `<span class="skill-badge green">${s}</span>`).join('') : '<span style="font-size:12px;color:var(--text-muted)">None detected</span>';
  document.getElementById('detail-missing').innerHTML =
    (job.missing || []).length ? job.missing.map(s => `<span class="skill-badge red">${s}</span>`).join('') : '<span style="font-size:12px;color:var(--text-muted)">None — great fit!</span>';

  // Stage badge
  const stageBadge = document.getElementById('detail-stage-badge');
  stageBadge.textContent = STAGE_LABELS[job.stage];
  stageBadge.className = `stage-badge stage-${job.stage}`;

  // Description
  document.getElementById('detail-desc').textContent = job.description || 'No description provided.';

  // Company Notes
  document.getElementById('detail-company-notes').value = job.companyNotes || '';

  // Notes
  document.getElementById('detail-notes').value = job.notes || '';

  // Stage select
  const stageSelect = document.getElementById('detail-stage-select');
  stageSelect.innerHTML = STAGES.map(s => `<option value="${s}" ${s===job.stage?'selected':''}>${STAGE_LABELS[s]}</option>`).join('');

  // Back button — only shown when opened from a calendar day click
  const backBtn = document.getElementById('detail-back-btn');
  if (dayModalContext) {
    backBtn.style.display = '';
    backBtn.onclick = () => {
      const ctx = dayModalContext;
      dayModalContext = null;
      closeModal('modal-detail');
      openDayModal(ctx.label, ctx.ids);
    };
  } else {
    backBtn.style.display = 'none';
    backBtn.onclick = null;
  }

  openModal('modal-detail');
}

/* ══════════════════════════════════════════════════════════
   ADD / EDIT JOB
   ══════════════════════════════════════════════════════════ */
function openAddJobModal(editId = null) {
  const job = editId ? state.jobs.find(j => j.id === editId) : null;

  document.getElementById('modal-job-title').textContent = job ? 'Edit Job' : 'Add New Job';
  document.getElementById('job-modal-back-btn').style.display = editId ? '' : 'none';
  document.getElementById('job-edit-id').value = editId || '';
  document.getElementById('job-role').value = job ? job.role || '' : '';
  document.getElementById('job-company').value = job ? job.company || '' : '';
  document.getElementById('job-department').value = job ? job.department || '' : '';
  document.getElementById('job-location').value = job ? job.location || '' : '';
  document.getElementById('job-url').value = job ? job.url || '' : '';
  document.getElementById('job-salary').value = job ? job.salary || '' : '';
  document.getElementById('job-date-posted').value = job ? job.datePosted || '' : '';
  document.getElementById('job-date-applied').value = job ? job.dateApplied || '' : '';
  document.getElementById('job-stage').value = job ? job.stage || 'saved' : '';
  document.getElementById('job-seniority').value = job ? job.seniority || '' : '';
  document.getElementById('job-type').value = job ? job.jobType || '' : '';
  document.getElementById('job-work-type').value = job ? job.workType || '' : '';
  document.getElementById('job-description').value = job ? job.description || '' : '';
  document.getElementById('job-benefits').value = job ? job.benefits || '' : '';
  document.getElementById('job-company-notes').value = job ? job.companyNotes || '' : '';
  document.getElementById('job-notes').value = job ? job.notes || '' : '';
  document.getElementById('job-cover-letter').value = job ? job.coverLetter || '' : '';

  // Reset to first tab
  document.querySelectorAll('#job-modal-tabs .modal-tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('#modal-job .modal-tab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

  openModal('modal-job');
}

function saveJob() {
  const role = document.getElementById('job-role').value.trim();
  const company = document.getElementById('job-company').value.trim();
  if (!role || !company) {
    toast('Role and Company are required.', 'error');
    return;
  }

  const editId = document.getElementById('job-edit-id').value;
  const description = document.getElementById('job-description').value;
  const {
    score,
    matched,
    missing
  } = analyzeJob(description);

  const jobData = {
    role,
    company,
    department: document.getElementById('job-department').value.trim(),
    location: document.getElementById('job-location').value.trim(),
    url: document.getElementById('job-url').value.trim(),
    salary: document.getElementById('job-salary').value.trim(),
    datePosted: document.getElementById('job-date-posted').value,
    dateApplied: document.getElementById('job-date-applied').value,
    seniority: document.getElementById('job-seniority').value,
    jobType: document.getElementById('job-type').value,
    workType: document.getElementById('job-work-type').value,
    stage: document.getElementById('job-stage').value,
    description,
    benefits: document.getElementById('job-benefits').value.trim(),
    companyNotes: document.getElementById('job-company-notes').value.trim(),
    notes: document.getElementById('job-notes').value.trim(),
    coverLetter: document.getElementById('job-cover-letter').value.trim(),
    fitScore: score,
    matched,
    missing,
  };

  if (editId) {
    const idx = state.jobs.findIndex(j => j.id === editId);
    if (idx !== -1) {
      state.jobs[idx] = {
        ...state.jobs[idx],
        ...jobData
      };
    }
  } else {
    state.jobs.push({
      id: uid(),
      dateAdded: new Date().toISOString(),
      ...jobData
    });
  }

  save();
  closeModal('modal-job');
  toast(editId ? 'Job updated.' : 'Job added!', 'success');
  if (!editId) checkMilestoneToast(state.jobs.length);
  if (!editId && jobData.stage === 'offer') setTimeout(launchConfetti, 300);
  renderView(state.activeView);
  if (editId) openJobDetail(editId);
}

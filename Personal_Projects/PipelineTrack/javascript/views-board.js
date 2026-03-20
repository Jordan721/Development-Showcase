'use strict';

/* ══════════════════════════════════════════════════════════
   BOARD (KANBAN)
   ══════════════════════════════════════════════════════════ */
const collapsedColumns = new Set(JSON.parse(localStorage.getItem('pt-collapsed-cols') || '[]'));

/* ── BULK SELECTION ────────────────────────────────────── */
let bulkSelectMode = false;
const bulkSelected = new Set();

function setBulkMode(on) {
  bulkSelectMode = on;
  if (!on) bulkSelected.clear();
  const btn = document.getElementById('board-select-btn');
  const bar = document.getElementById('bulk-bar');
  if (btn) btn.classList.toggle('active', on);
  if (bar) bar.style.display = on ? '' : 'none';
  renderBoard();
}

function updateBulkBar() {
  const count = document.getElementById('bulk-bar-count');
  if (count) count.textContent = `${bulkSelected.size} selected`;
}

function initBulkActions() {
  const selectBtn = document.getElementById('board-select-btn');
  const cancelBtn = document.getElementById('bulk-cancel-btn');
  const stageSelect = document.getElementById('bulk-stage-select');
  const deleteBtn = document.getElementById('bulk-delete-btn');
  const exportBtn = document.getElementById('bulk-export-btn');

  if (selectBtn) selectBtn.addEventListener('click', () => setBulkMode(!bulkSelectMode));
  if (cancelBtn) cancelBtn.addEventListener('click', () => setBulkMode(false));

  if (stageSelect) stageSelect.addEventListener('change', () => {
    const stage = stageSelect.value;
    if (!stage || !bulkSelected.size) return;
    bulkSelected.forEach(id => {
      const job = state.jobs.find(j => j.id === id);
      if (job) {
        job.stage = stage;
        if (stage === 'declined') job.declinedAt = new Date().toISOString();
      }
    });
    save();
    toast(`Moved ${bulkSelected.size} job${bulkSelected.size > 1 ? 's' : ''} to ${STAGE_LABELS[stage]}.`, 'success');
    if (stage === 'offer') setTimeout(launchConfetti, 200);
    stageSelect.value = '';
    setBulkMode(false);
  });

  if (deleteBtn) deleteBtn.addEventListener('click', () => {
    if (!bulkSelected.size) return;
    const ids = [...bulkSelected];
    const snapshots = ids.map(id => JSON.parse(JSON.stringify(state.jobs.find(j => j.id === id)))).filter(Boolean);
    state.jobs = state.jobs.filter(j => !ids.includes(j.id));
    save();
    setBulkMode(false);
    if (state.activeView === 'dashboard') renderDashboard();
    toast(`Deleted ${snapshots.length} job${snapshots.length > 1 ? 's' : ''}.`, '', {
      undo: () => {
        snapshots.forEach(s => state.jobs.push(s));
        save();
        renderBoard();
        if (state.activeView === 'dashboard') renderDashboard();
        toast('Undo: jobs restored.', 'success');
      }
    });
  });

  if (exportBtn) exportBtn.addEventListener('click', () => {
    if (!bulkSelected.size) return;
    const selected = state.jobs.filter(j => bulkSelected.has(j.id));
    const csvCell = v => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const headers = ['Role', 'Company', 'Location', 'Stage', 'Fit Score', 'Salary', 'Date Added'];
    const rows = selected.map(j => [j.role, j.company, j.location, j.stage, j.fitScore ?? '', j.salary, j.dateAdded].map(csvCell).join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    }));
    a.download = `pipelinetrack-selected-${new Date().toLocaleDateString('en-CA')}.csv`;
    a.click();
    toast(`Exported ${selected.length} jobs.`, 'success');
  });
}

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
  if (boardSortTable === 'date-asc') s.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
  else if (boardSortTable === 'date-desc') s.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  else if (boardSortTable === 'fit-desc') s.sort((a, b) => (b.fitScore != null ? b.fitScore : -1) - (a.fitScore != null ? a.fitScore : -1));
  else if (boardSortTable === 'fit-asc') s.sort((a, b) => (a.fitScore != null ? a.fitScore : 999) - (b.fitScore != null ? b.fitScore : 999));
  else if (boardSortTable === 'role-asc') s.sort((a, b) => a.role.localeCompare(b.role));
  else if (boardSortTable === 'company-asc') s.sort((a, b) => a.company.localeCompare(b.company));
  // pinned always float to top
  return s.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
}

function updateBoardFilterUI() {
  const hasFilters = boardSearch || boardFilterStage || boardFilterWorkType || boardFilterSeniority;
  const clearBtn = document.getElementById('board-clear-filters');
  if (clearBtn) clearBtn.style.display = hasFilters ? '' : 'none';
  const sortSel = document.getElementById('board-sort-table');
  if (sortSel) sortSel.style.display = boardLayout === 'table' ? '' : 'none';
  const dragHint = document.getElementById('board-drag-hint');
  if (dragHint) dragHint.style.display = (boardLayout === 'table' || boardLayout === 'timeline' || boardLayout === 'matrix') ? 'none' : '';
}

/* ── PRIORITY MATRIX HELPERS ───────────────────────────── */
function getJobUrgency(job) {
  const now = new Date();
  if (job.deadline) {
    const d = new Date(job.deadline + 'T00:00:00');
    return (d - now) / 86400000 <= 14; // within 14 days (or overdue)
  }
  return (now - new Date(job.dateAdded)) / 86400000 >= 14; // 2+ weeks old
}

const PM_STAGE_COLORS = {
  saved: 'var(--text-muted)',
  applied: 'var(--accent)',
  screening: '#a78bfa',
  interview: 'var(--yellow)',
  offer: 'var(--green)',
  declined: 'var(--red)',
  withdrew: '#f97316',
  ghosted: '#94a3b8',
  archived: 'var(--border)',
};

function pmCardHTML(job) {
  const cls = fitBadgeClass(job.fitScore);
  const label = fitBadgeLabel(job.fitScore);
  const accent = PM_STAGE_COLORS[job.stage] || 'var(--border)';
  const now = new Date();
  let timeInfo;
  if (job.deadline) {
    const days = Math.round((new Date(job.deadline + 'T00:00:00') - now) / 86400000);
    timeInfo = days < 0 ?
      `<span style="color:var(--red);font-weight:600">${Math.abs(days)}d overdue</span>` :
      `<span style="color:var(--yellow);font-weight:600">${days}d left</span>`;
  } else {
    const days = Math.floor((now - new Date(job.dateAdded)) / 86400000);
    timeInfo = days === 0 ? 'Today' : `${days}d ago`;
  }
  const urgency = deadlineUrgencyClass(job);
  const pinCls = job.pinned ? ' pinned-card' : '';
  return `
    <div class="job-card pm-card${urgency ? ' ' + urgency : ''}${pinCls}" data-job-id="${job.id}" data-stage="${job.stage}" draggable="false" style="--card-accent:${accent}">
      <button class="card-delete-btn" data-delete-id="${job.id}" title="Delete job" draggable="false">&times;</button>
      <div class="pm-card-stage"><span class="pm-stage-dot stripe-${job.stage}"></span>${STAGE_LABELS[job.stage]}</div>
      <div class="job-card-role pm-card-role">${escHtml(job.role)}</div>
      <div class="job-card-company">${escHtml(job.company)}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
      <div class="job-card-footer">
        <span class="job-card-date">${timeInfo}</span>
        <span class="fit-badge ${cls}" data-job-id="${job.id}">${label}</span>
      </div>
    </div>`;
}

function renderBoardMatrix(jobs) {
  if (jobs.length === 0) {
    return emptyStateHTML('🔍', 'No results', 'Try adjusting your search or filters');
  }

  const scored = jobs.filter(j => j.fitScore != null);
  const unscored = jobs.filter(j => j.fitScore == null);

  const quadrants = [{
      id: 'tl',
      title: 'Plan Ahead',
      icon: '⭐',
      desc: 'High fit · Low urgency',
      highFit: true,
      urgent: false
    },
    {
      id: 'tr',
      title: 'Act Now',
      icon: '🔥',
      desc: 'High fit · High urgency',
      highFit: true,
      urgent: true
    },
    {
      id: 'bl',
      title: 'Low Priority',
      icon: '📋',
      desc: 'Low fit · Low urgency',
      highFit: false,
      urgent: false
    },
    {
      id: 'br',
      title: 'Quick Apply',
      icon: '⚡',
      desc: 'Low fit · High urgency',
      highFit: false,
      urgent: true
    },
  ];

  const qJobs = {};
  quadrants.forEach(q => {
    qJobs[q.id] = scored.filter(j => {
      const hf = j.fitScore >= 70;
      const urg = getJobUrgency(j);
      return hf === q.highFit && urg === q.urgent;
    });
  });

  return `
    <div class="pm-wrapper">
      <div class="pm-matrix-area">
        <div class="pm-y-label"><span>← HIGH FIT · LOW FIT →</span></div>
        <div class="pm-inner">
          <div class="pm-axis-top">
            <span class="pm-axis-cap">← Low Urgency</span>
            <span class="pm-axis-title">URGENCY</span>
            <span class="pm-axis-cap">High Urgency →</span>
          </div>
          <div class="pm-grid">
            ${quadrants.map(q => `
              <div class="pm-quadrant pm-q-${q.id}">
                <div class="pm-quadrant-header">
                  <div class="pm-q-icon-wrap">${q.icon}</div>
                  <div class="pm-q-meta">
                    <div class="pm-q-title">${q.title}</div>
                    <div class="pm-q-desc">${q.desc}</div>
                  </div>
                  <span class="pm-q-count">${qJobs[q.id].length}</span>
                </div>
                <div class="pm-cards">
                  ${qJobs[q.id].length === 0
                    ? '<div class="pm-empty-q">No jobs here</div>'
                    : qJobs[q.id].map(j => pmCardHTML(j)).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>
      ${unscored.length > 0 ? `
        <div class="pm-unscored">
          <div class="pm-unscored-title">⚪ Unscored (${unscored.length}) — add a Fit Score to place these in the matrix</div>
          <div class="pm-unscored-cards">${unscored.map(j => pmCardHTML(j)).join('')}</div>
        </div>` : ''}
    </div>`;
}

function renderBoard() {
  const showArchived = document.getElementById('show-archived').checked;
  const visibleStages = showArchived ? STAGES : STAGES.filter(s => s !== 'archived' && s !== 'declined' && s !== 'withdrew' && s !== 'ghosted');
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
          if (newStage === 'declined') job.declinedAt = new Date().toISOString();
          save();
          renderBoard();
          if (newStage === 'offer') setTimeout(launchConfetti, 200);
          if (MILESTONE_STAGES.includes(newStage)) setTimeout(() => openStageMilestoneModal(job, newStage), 350);
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

  if (boardLayout === 'matrix') {
    const visibleJobs = periodJobs.filter(j => visibleStages.includes(j.stage));
    board.innerHTML = renderBoardMatrix(visibleJobs);
    board.querySelectorAll('.card-delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.deleteId;
        const job = state.jobs.find(j => j.id === id);
        if (!job) return;
        const snapshot = JSON.parse(JSON.stringify(job));
        state.jobs = state.jobs.filter(j => j.id !== id);
        save();
        renderBoard();
        if (state.activeView === 'dashboard') renderDashboard();
        toast(`"${job.role}" deleted.`, '', {
          undo: () => {
            state.jobs.push(snapshot);
            save();
            renderBoard();
            if (state.activeView === 'dashboard') renderDashboard();
            toast('Undo: job restored.', 'success');
          }
        });
      });
    });
    board.querySelectorAll('.card-pin-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.pinId;
        const job = state.jobs.find(j => j.id === id);
        if (!job) return;
        job.pinned = !job.pinned;
        save();
        renderBoard();
      });
    });
    board.querySelectorAll('.job-card').forEach(card => {
      card.addEventListener('click', () => openJobDetail(card.dataset.jobId));
    });
    wireSearchAndFilters();
    if (typeof animateBoardCards === 'function') animateBoardCards();
    return;
  }

  // columns layout
  board.innerHTML = visibleStages.map(stage => {
    const jobs = periodJobs.filter(j => j.stage === stage);
    const collapsed = collapsedColumns.has(stage);
    return `
      <div class="kanban-col${collapsed ? ' kanban-col--collapsed' : ''}" data-stage="${stage}">
        <div class="col-stripe stripe-${stage}"></div>
        <div class="kanban-col-header kanban-col-header--clickable" data-collapse-stage="${stage}" title="${collapsed ? 'Expand' : 'Collapse'} column">
          <span class="kanban-col-header-label"><span class="stage-emoji">${STAGE_EMOJIS[stage] || ''}</span>${STAGE_LABELS[stage]}</span>
          <span class="kanban-col-count">${jobs.length}</span>
          <span class="kanban-col-collapse-icon">${collapsed ? '›' : '‹'}</span>
        </div>
        <div class="kanban-col-body" data-stage="${stage}">
          ${jobs.length === 0
            ? emptyStateHTML('📭', 'No jobs here', 'Drag a card here to move a job to this stage')
            : jobs.map(j => jobCardHTML(j)).join('')}
        </div>
      </div>`;
  }).join('');

  board.querySelectorAll('.kanban-col-header--clickable').forEach(header => {
    header.addEventListener('click', () => {
      const stage = header.dataset.collapseStage;
      if (collapsedColumns.has(stage)) {
        collapsedColumns.delete(stage);
      } else {
        collapsedColumns.add(stage);
      }
      localStorage.setItem('pt-collapsed-cols', JSON.stringify([...collapsedColumns]));
      renderBoard();
    });
  });

  const dropSelector = '.kanban-col-body';
  let draggedJobId = null;

  board.querySelectorAll('.card-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      const job = state.jobs.find(j => j.id === id);
      if (!job) return;
      const snapshot = JSON.parse(JSON.stringify(job));
      state.jobs = state.jobs.filter(j => j.id !== id);
      save();
      renderBoard();
      if (state.activeView === 'dashboard') renderDashboard();
      toast(`"${job.role}" deleted.`, '', {
        undo: () => {
          state.jobs.push(snapshot);
          save();
          renderBoard();
          if (state.activeView === 'dashboard') renderDashboard();
          toast('Undo: job restored.', 'success');
        }
      });
    });
  });

  board.querySelectorAll('.card-pin-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.pinId;
      const job = state.jobs.find(j => j.id === id);
      if (!job) return;
      job.pinned = !job.pinned;
      save();
      renderBoard();
    });
  });

  board.querySelectorAll('.job-card').forEach(card => {
    card.addEventListener('click', e => {
      if (bulkSelectMode) {
        const id = card.dataset.jobId;
        if (bulkSelected.has(id)) bulkSelected.delete(id);
        else bulkSelected.add(id);
        updateBulkBar();
        card.classList.toggle('bulk-selected', bulkSelected.has(id));
        card.querySelector('.bulk-check')?.classList.toggle('checked', bulkSelected.has(id));
        return;
      }
      openJobDetail(card.dataset.jobId);
    });

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
        if (targetStage === 'declined') job.declinedAt = new Date().toISOString();
        save();
        renderBoard();
        toast(`${STAGE_EMOJIS[targetStage] || ''} Moved to ${STAGE_LABELS[targetStage]}.`, 'success');
        if (targetStage === 'offer') setTimeout(launchConfetti, 200);
        if (MILESTONE_STAGES.includes(targetStage)) setTimeout(() => openStageMilestoneModal(job, targetStage), 350);
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
    return emptyStateHTML('🔍', 'No results', 'Try adjusting your search or filters');
  }
  const sortIcon = (key) => boardSortTable === key ? ' ↓' : boardSortTable === key + '-asc' ? ' ↑' : '';
  const stageOptions = (current) => STAGES
    .map(s => `<option value="${s}"${s === current ? ' selected' : ''}>${STAGE_LABELS[s]}</option>`).join('');

  return `<table class="board-table">
    <thead>
      <tr class="table-header-row">
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
      ${jobs.map((j, i) => {
        const fitCls = fitBadgeClass(j.fitScore);
        const fitLabel = fitBadgeLabel(j.fitScore);
        return `<tr class="table-row-clickable" data-stage="${j.stage}" data-job-id="${j.id}" style="animation-delay:${i * 28}ms">
          <td class="table-td table-td-role">${escHtml(j.role)}</td>
          <td class="table-td">${escHtml(j.company)}${j.location ? `<span class="table-location"> · ${escHtml(j.location)}</span>` : ''}</td>
          <td class="table-td" onclick="event.stopPropagation()">
            <select class="table-stage-select stage-select-${j.stage}" data-job-id="${j.id}">${stageOptions(j.stage)}</select>
          </td>
          <td class="table-td"><span class="table-tag">${escHtml(j.workType || '—')}</span></td>
          <td class="table-td table-muted">${escHtml(formatSalary(j.salary) || '—')}</td>
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

function fitRingHTML(score) {
  const cls = fitBadgeClass(score);
  const label = fitBadgeLabel(score);
  return `<span class="fit-badge ${cls}" title="Fit score${score != null ? ': ' + score + '%' : ''}">${label}</span>`;
}

function deadlineUrgencyClass(job) {
  if (!job.deadline) return '';
  const days = Math.round((new Date(job.deadline + 'T00:00:00') - new Date()) / 86400000);
  if (days < 0) return 'deadline-overdue';
  if (days === 0) return 'deadline-today';
  if (days <= 2) return 'deadline-soon';
  if (days <= 7) return 'deadline-week';
  return '';
}

function jobCardHTML(job) {
  const urgency = deadlineUrgencyClass(job);
  const pinCls = job.pinned ? ' pinned-card' : '';
  const selectedCls = bulkSelected.has(job.id) ? ' bulk-selected' : '';
  const pinBtn = bulkSelectMode ? '' : `<button class="card-pin-btn${job.pinned ? ' pinned' : ''}" data-pin-id="${job.id}" title="${job.pinned ? 'Unpin' : 'Pin to top'}" draggable="false">${job.pinned ? '📌' : '📍'}</button>`;
  const checkOverlay = bulkSelectMode ? `<span class="bulk-check${bulkSelected.has(job.id) ? ' checked' : ''}" data-bulk-id="${job.id}">✓</span>` : '';
  return `
    <div class="job-card${urgency ? ' ' + urgency : ''}${pinCls}${selectedCls}" data-job-id="${job.id}" data-stage="${job.stage}" draggable="${bulkSelectMode ? 'false' : 'true'}">
      ${bulkSelectMode ? '' : `<button class="card-delete-btn" data-delete-id="${job.id}" title="Delete job" draggable="false">&times;</button>`}
      ${pinBtn}
      ${checkOverlay}
      <div class="job-card-role"><span class="drag-handle" title="Drag to move stage" draggable="false">&#8942;</span>${escHtml(job.role)}</div>
      <div class="job-card-company">${escHtml(job.company)}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
      <div class="job-card-footer">
        <span class="job-card-date">${job.stage === 'declined' && job.declinedAt ? '❌ ' + formatDate(job.declinedAt) : formatDate(job.dateAdded)}</span>
        ${fitRingHTML(job.fitScore)}
      </div>
    </div>`;
}

function renderBoardTimeline(jobs) {
  if (jobs.length === 0) {
    return emptyStateHTML('⏱', 'No timeline entries', 'Jobs with dates will appear here');
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
    ticks.push({
      label: m.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      }),
      p: pct(m)
    });
    m.setMonth(m.getMonth() + 1);
  }

  const stageColors = {
    saved: 'var(--text-muted)',
    applied: 'var(--accent)',
    screening: '#a78bfa',
    interview: 'var(--yellow)',
    offer: 'var(--green)',
    declined: 'var(--red)',
    withdrew: '#f97316',
    ghosted: '#94a3b8',
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
    return `<div class="tl-row" data-stage="${j.stage}" data-job-id="${j.id}">
      <div class="tl-row-label">
        <div class="tl-row-role"><span class="tl-stage-dot stripe-${j.stage}"></span>${escHtml(j.role)}</div>
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

  const presentStages = [...new Set(sorted.map(j => j.stage))];
  const legendHTML = `<div class="tl-legend">
    ${presentStages.map(s => `<span class="tl-legend-item"><span class="tl-legend-dot stripe-${s}"></span>${STAGE_LABELS[s] || s}</span>`).join('')}
  </div>`;

  return `<div class="tl-container">
    ${legendHTML}
    <div class="tl-axis-row">
      <div class="tl-label-spacer"></div>
      <div class="tl-axis-track">${axisHTML}</div>
    </div>
    ${rowsHTML}
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   STAGE MILESTONE MODAL
   ══════════════════════════════════════════════════════════ */
const MILESTONE_STAGES = ['screening', 'interview', 'offer'];

function openStageMilestoneModal(job, stage) {
  if (!MILESTONE_STAGES.includes(stage)) return;
  const existing = job[stage + 'Milestone'] || {};

  const titles = {
    screening: '📞 Log Screening Details',
    interview: '🤝 Log Interview Details',
    offer: '🎉 Log Offer Details',
  };
  const subtitles = {
    screening: `${escHtml(job.role)} @ ${escHtml(job.company)} moved to screening — log the call details.`,
    interview: `${escHtml(job.role)} @ ${escHtml(job.company)} has an interview — log the details.`,
    offer: `You received an offer from ${escHtml(job.company)}! Log the details here.`,
  };

  document.getElementById('milestone-modal-title').textContent = titles[stage];

  let bodyHTML = `<p class="milestone-subtitle">${subtitles[stage]}</p>`;

  if (stage === 'screening' || stage === 'interview') {
    const typeOpts = stage === 'screening' ? ['Phone', 'Video', 'In-person'] : ['Phone', 'Video', 'In-person', 'Panel', 'Technical'];
    const defaultType = existing.type || (stage === 'screening' ? 'Phone' : 'Video');
    bodyHTML += `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" class="text-input" id="milestone-date" value="${existing.date || ''}"/>
        </div>
        <div class="form-group">
          <label class="form-label">Time</label>
          <input type="time" class="text-input" id="milestone-time" value="${existing.time || ''}"/>
        </div>
      </div>
      ${stage === 'interview' ? `
      <div class="form-group">
        <label class="form-label">Round</label>
        <select class="select-input" id="milestone-round">
          <option value="">—</option>
          ${['1st Round', '2nd Round', '3rd Round', 'Final Round'].map(r =>
            `<option value="${r}"${existing.round === r ? ' selected' : ''}>${r}</option>`
          ).join('')}
        </select>
      </div>` : ''}
      <div class="form-group">
        <label class="form-label">Type</label>
        <div class="milestone-type-group">
          ${typeOpts.map(t =>
            `<label class="milestone-type-option"><input type="radio" name="milestone-type" value="${t}"${defaultType === t ? ' checked' : ''}/> ${t}</label>`
          ).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="text-input" id="milestone-notes" rows="2" placeholder="${stage === 'screening' ? 'Recruiter name, topics to cover…' : 'Interviewer, topics to prepare, format…'}">${escHtml(existing.notes || '')}</textarea>
      </div>
      <div class="form-group" style="margin-top:8px">
        <label class="toggle-label">
          <input type="checkbox" id="milestone-thankyou" ${existing.thankYouSent ? 'checked' : ''}/>
          Thank-you note sent
        </label>
      </div>`;
  } else {
    bodyHTML += `
      <div class="form-group">
        <label class="form-label">Salary Offered</label>
        <input type="text" class="text-input" id="milestone-salary" value="${escHtml(existing.salaryOffered || '')}" placeholder="e.g. $95,000 / year"/>
      </div>
      <div class="form-group">
        <label class="form-label">Deadline to Respond</label>
        <input type="date" class="text-input" id="milestone-deadline" value="${existing.responseDeadline || ''}"/>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="text-input" id="milestone-notes" rows="2" placeholder="Benefits, equity, negotiation notes…">${escHtml(existing.notes || '')}</textarea>
      </div>
      <div class="form-group" style="margin-top:8px">
        <label class="toggle-label">
          <input type="checkbox" id="milestone-thankyou" ${existing.thankYouSent ? 'checked' : ''}/>
          Thank-you note sent
        </label>
      </div>`;
  }

  document.getElementById('milestone-modal-body').innerHTML = bodyHTML;

  document.getElementById('milestone-save-btn').onclick = () => {
    const milestone = {};
    if (stage === 'screening' || stage === 'interview') {
      milestone.date = (document.getElementById('milestone-date') || {}).value || '';
      milestone.time = (document.getElementById('milestone-time') || {}).value || '';
      milestone.type = (document.querySelector('input[name="milestone-type"]:checked') || {}).value || '';
      milestone.notes = (document.getElementById('milestone-notes') || {}).value.trim();
      if (stage === 'interview') milestone.round = (document.getElementById('milestone-round') || {}).value || '';
    } else {
      milestone.salaryOffered = (document.getElementById('milestone-salary') || {}).value.trim();
      milestone.responseDeadline = (document.getElementById('milestone-deadline') || {}).value || '';
      milestone.notes = (document.getElementById('milestone-notes') || {}).value.trim();
    }
    milestone.thankYouSent = !!(document.getElementById('milestone-thankyou') || {}).checked;
    job[stage + 'Milestone'] = milestone;
    save();
    closeModal('modal-milestone');
    renderView(state.activeView);
    if (state.activeJobId === job.id) openJobDetail(job.id);
    toast('Details saved.', 'success');
  };

  openModal('modal-milestone');
}

function renderMilestoneStrip(job) {
  const el = document.getElementById('detail-milestone-strip');
  if (!el) return;
  const active = MILESTONE_STAGES.filter(s => job[s + 'Milestone']);
  if (active.length === 0) {
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }

  const icons = {
    screening: '📞',
    interview: '🤝',
    offer: '🎉'
  };
  const labels = {
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer'
  };

  el.style.display = '';
  el.innerHTML = `
    <div class="milestone-strip-title">Application Timeline</div>
    <div class="milestone-strip">
      ${active.map((s, i) => {
        const m = job[s + 'Milestone'];
        const parts = [
          m.date  ? formatDate(m.date + 'T12:00:00') : '',
          m.time  ? m.time : '',
          m.round ? m.round : '',
          m.type  ? m.type : '',
          m.salaryOffered    ? m.salaryOffered : '',
          m.responseDeadline ? 'Respond by ' + formatDate(m.responseDeadline + 'T12:00:00') : '',
        ].filter(Boolean);
        return `${i > 0 ? '<div class="milestone-connector"></div>' : ''}
        <div class="milestone-item milestone-item-${s}">
          <div class="milestone-icon">${icons[s]}</div>
          <div class="milestone-info">
            <div class="milestone-label">${labels[s]}</div>
            <div class="milestone-detail">${parts.length ? escHtml(parts.join(' · ')) : '<span style="opacity:.5">No details yet</span>'}</div>
            ${m.notes ? `<div class="milestone-notes">${escHtml(m.notes)}</div>` : ''}
            ${m.thankYouSent ? `<div class="milestone-ty-sent">✓ Thank-you sent</div>` : ''}
          </div>
          <button class="milestone-edit-btn" data-stage="${s}" title="Edit">✎</button>
        </div>`;
      }).join('')}
    </div>`;

  el.querySelectorAll('.milestone-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openStageMilestoneModal(job, btn.dataset.stage));
  });
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
    document.getElementById('detail-salary').textContent = formatSalary(job.salary);
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

  // Deadline
  const deadlineRow = document.getElementById('detail-deadline-row');
  if (deadlineRow) {
    if (job.deadline) {
      document.getElementById('detail-deadline').textContent = formatDate(job.deadline + 'T12:00:00');
      deadlineRow.style.display = '';
    } else {
      deadlineRow.style.display = 'none';
    }
  }

  // Date declined
  const dateDeclinedRow = document.getElementById('detail-date-declined-row');
  if (job.declinedAt) {
    document.getElementById('detail-date-declined').textContent = formatDate(job.declinedAt);
    dateDeclinedRow.style.display = '';
  } else {
    dateDeclinedRow.style.display = 'none';
  }

  // Benefits
  const benefitsRow = document.getElementById('detail-benefits-row');
  if (job.benefits) {
    const chips = parseBenefits(job.benefits);
    const el = document.getElementById('detail-benefits');
    const openBenefitsModal = () => {
      document.getElementById('benefits-modal-chips').innerHTML =
        chips.length ? chips.map(b => `<span class="benefit-chip">${escHtml(b)}</span>`).join('') : '';
      document.getElementById('benefits-modal-raw').textContent = job.benefits;
      openModal('modal-benefits');
    };
    if (chips.length) {
      el.innerHTML = chips.map(b => `<span class="benefit-chip benefit-chip--clickable" title="Click to see full benefits">${escHtml(b)}</span>`).join('') +
        `<button class="benefit-view-all">View all ↗</button>`;
    } else {
      el.innerHTML = `<button class="benefit-view-all">View benefits ↗</button>`;
    }
    el.querySelectorAll('.benefit-chip--clickable, .benefit-view-all').forEach(btn => {
      btn.addEventListener('click', openBenefitsModal);
    });
    benefitsRow.style.display = '';
  } else {
    benefitsRow.style.display = 'none';
  }

  // Department
  const departmentRow = document.getElementById('detail-department-row');
  if (job.department) {
    const deptEl = document.getElementById('detail-department');
    deptEl.textContent = job.department;
    const existingTag = deptEl.querySelector('.inferred-tag');
    if (existingTag) existingTag.remove();
    if (job.departmentInferred) {
      const tag = document.createElement('span');
      tag.className = 'inferred-tag';
      tag.title = 'Auto-filled from job title / description — you can edit this';
      tag.textContent = '✦ Auto-filled';
      deptEl.appendChild(tag);
    }
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
    if (job.workTypeInferred) {
      const tag = document.createElement('span');
      tag.className = 'inferred-tag';
      tag.title = 'Auto-filled from job description — you can edit this';
      tag.textContent = '✦ Auto-filled';
      workTypeBadge.appendChild(tag);
    }
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

  // Matched / missing — with dismiss buttons to remove false positives
  function renderSkillBadges(listId, arr, field, colorClass) {
    const el = document.getElementById(listId);
    if (!arr.length) {
      el.innerHTML = field === 'matched' ?
        '<span style="font-size:12px;color:var(--text-muted)">None detected</span>' :
        '<span style="font-size:12px;color:var(--text-muted)">None — great fit!</span>';
      return;
    }
    el.innerHTML = arr.map(s =>
      `<span class="skill-badge ${colorClass}" style="padding-right:4px">
        ${escHtml(s)}
        ${field === 'missing' ? `<button class="skill-badge-add" data-skill="${escHtml(s)}" title="Add to My Skills">+</button>` : ''}
        ${field === 'matched' ? `<button class="skill-badge-remove" data-skill="${escHtml(s)}" title="Move to Skill Gaps">−</button>` : ''}
        <button class="skill-badge-dismiss" data-skill="${escHtml(s)}" title="Remove — not relevant to this job">×</button>
      </span>`
    ).join('');
    el.querySelectorAll('.skill-badge-add').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const skill = btn.dataset.skill;
        const normalized = typeof normalizeSkillName === 'function' ? normalizeSkillName(skill) : skill;
        if (!state.profile.skills.some(s => s.name.toLowerCase() === normalized.toLowerCase())) {
          state.profile.skills.push({
            name: normalized,
            level: 'Beginner'
          });
          save();
        }
        // Move from missing → matched
        job.missing = job.missing.filter(x => x !== skill);
        job.matched = [...(job.matched || []), skill];
        const total = (job.matched || []).length + (job.missing || []).length;
        job.fitScore = total === 0 ? null : Math.round(((job.matched || []).length / total) * 100);
        save();
        renderSkillBadges('detail-matched', job.matched || [], 'matched', 'green');
        renderSkillBadges('detail-missing', job.missing || [], 'missing', 'red');
        toast(`"${normalized}" added to your skills`, 'success');
      });
    });
    el.querySelectorAll('.skill-badge-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const skill = btn.dataset.skill;
        job.matched = job.matched.filter(x => x !== skill);
        job.missing = [...(job.missing || []), skill];
        const total = (job.matched || []).length + (job.missing || []).length;
        job.fitScore = total === 0 ? null : Math.round(((job.matched || []).length / total) * 100);
        save();
        renderSkillBadges('detail-matched', job.matched || [], 'matched', 'green');
        renderSkillBadges('detail-missing', job.missing || [], 'missing', 'red');
        toast(`"${skill}" moved to skill gaps`, 'info');
      });
    });
    el.querySelectorAll('.skill-badge-dismiss').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const skill = btn.dataset.skill;
        job[field] = job[field].filter(x => x !== skill);
        // Recalculate fit score
        const total = (job.matched || []).length + (job.missing || []).length;
        job.fitScore = total === 0 ? null : Math.round(((job.matched || []).length / total) * 100);
        save();
        renderSkillBadges(listId, job[field], field, colorClass);
        // Refresh description highlights and fit ring
        const descEl = document.getElementById('detail-desc');
        const legendEl = document.getElementById('detail-desc-legend');
        if (job.description && (job.matched || []).length + (job.missing || []).length > 0) {
          descEl.innerHTML = highlightJobDescription(job.description, job.matched || [], job.missing || []);
          if (legendEl) legendEl.style.display = '';
        } else {
          descEl.textContent = job.description || '';
          if (legendEl) legendEl.style.display = 'none';
        }
        // Refresh fit ring
        const ring = document.getElementById('detail-fit-ring');
        const label = document.getElementById('detail-fit-label');
        const circumference = 2 * Math.PI * 20;
        if (job.fitScore !== null && job.fitScore !== undefined) {
          const offset = circumference - (job.fitScore / 100) * circumference;
          ring.style.strokeDashoffset = offset;
          ring.style.stroke = job.fitScore >= 70 ? 'var(--green)' : job.fitScore >= 40 ? 'var(--accent)' : 'var(--red)';
          label.textContent = job.fitScore + '%';
        } else {
          ring.style.strokeDashoffset = circumference;
          label.textContent = '—';
        }
      });
    });
  }
  renderSkillBadges('detail-matched', job.matched || [], 'matched', 'green');
  renderSkillBadges('detail-missing', job.missing || [], 'missing', 'red');

  // Milestone strip
  renderMilestoneStrip(job);

  // Stage badge
  const stageBadge = document.getElementById('detail-stage-badge');
  stageBadge.textContent = STAGE_LABELS[job.stage];
  stageBadge.className = `stage-badge stage-${job.stage}`;

  // Description with keyword highlighting
  const descEl = document.getElementById('detail-desc');
  const legendEl = document.getElementById('detail-desc-legend');
  if (job.description && (job.matched || []).length + (job.missing || []).length > 0) {
    descEl.innerHTML = highlightJobDescription(job.description, job.matched || [], job.missing || []);
    if (legendEl) legendEl.style.display = '';
  } else {
    descEl.textContent = job.description || 'No description provided.';
    if (legendEl) legendEl.style.display = 'none';
  }

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

  // Linked contacts
  renderDetailLinkedContacts(job);

  openModal('modal-detail');
}

function renderDetailLinkedContacts(job) {
  const el = document.getElementById('detail-linked-contacts');
  if (!el) return;
  const contacts = (state.contacts || []).filter(c => c.jobId === job.id);
  if (contacts.length === 0) {
    el.innerHTML = '';
    el.style.display = 'none';
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const typeLabels = {
    Recruiter: 'Recruiter',
    HM: 'Hiring Mgr',
    Referral: 'Referral',
    Other: 'Other'
  };
  const typeCls = {
    Recruiter: 'type-recruiter',
    HM: 'type-hm',
    Referral: 'type-referral',
    Other: 'type-other'
  };
  el.style.display = '';
  el.innerHTML = `
    <div class="detail-desc-label">Linked Contacts</div>
    <div class="detail-contacts-list">
      ${contacts.map(c => {
        const isOverdue = c.nextFollowUp && new Date(c.nextFollowUp + 'T00:00:00') <= today;
        const lbl = typeLabels[c.type] || c.type;
        const cls = typeCls[c.type] || 'type-other';
        return `<div class="detail-contact-row">
          <div class="detail-contact-info">
            <span class="detail-contact-name">${escHtml(c.name)}</span>
            ${c.role || c.company ? `<span class="detail-contact-meta">${escHtml([c.role, c.company].filter(Boolean).join(' · '))}</span>` : ''}
          </div>
          <div class="detail-contact-badges">
            <span class="contact-type-badge ${cls}">${lbl}</span>
            ${c.nextFollowUp ? `<span style="font-size:11px;color:${isOverdue ? 'var(--red)' : 'var(--text-muted)'}">${isOverdue ? '⚠ ' : ''}${formatDate(c.nextFollowUp)}</span>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   SMART PASTE PARSER
   ══════════════════════════════════════════════════════════ */
function parseJobListing(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = {};

  // Role / Title
  const titleMatch = text.match(/(?:job\s*title|position|role|title)\s*[:\-]\s*(.+)/i);
  if (titleMatch) {
    result.role = titleMatch[1].trim().split('\n')[0];
  } else if (lines[0] && lines[0].length < 90) {
    result.role = lines[0];
  }

  // Company
  const companyMatch = text.match(/(?:company|employer|organization|hiring\s*(?:company|team))\s*[:\-]\s*(.+)/i) ||
    text.match(/(?:^|\n)(?:about|join)\s+([A-Z][a-zA-Z0-9\s&.,'-]{2,40}?)(?:\n|,|\.|$)/m);
  if (companyMatch) result.company = companyMatch[1].trim().split('\n')[0];

  // Location
  const locationMatch = text.match(/(?:location|office|based\s*in|where\s*you.{0,10}work)\s*[:\-]\s*(.+)/i);
  if (locationMatch) {
    result.location = locationMatch[1].trim().split('\n')[0];
  } else {
    // city, ST pattern
    const cityMatch = text.match(/\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\b/);
    if (cityMatch) result.location = cityMatch[1];
  }

  // Salary
  const salaryMatch = text.match(/(?:salary|pay|compensation|rate|package)\s*[:\-]?\s*([\$£€][\d,. ]+(?:k|K)?(?:\s*[-–—to]+\s*[\$£€]?[\d,. ]+(?:k|K)?)?(?:\s*(?:USD|GBP|EUR|per\s*year|\/yr|annually))?)/i) ||
    text.match(/([\$£€][\d,.]+\s*(?:k|K)?\s*[-–—]\s*[\$£€]?[\d,.]+\s*(?:k|K)?)/);
  if (salaryMatch) result.salary = salaryMatch[1].trim();

  // Work Type
  if (/\b(fully\s+remote|100%\s+remote|work\s+from\s+home|wfh)\b/i.test(text)) result.workType = 'Remote';
  else if (/\bhybrid\b/i.test(text)) result.workType = 'Hybrid';
  else if (/\b(on[\s-]?site|in[\s-]?office|in[\s-]?person)\b/i.test(text)) result.workType = 'On-site';
  else if (/\bremote\b/i.test(text)) result.workType = 'Remote';

  // Job Type
  if (/\bfull[\s-]?time\b/i.test(text)) result.jobType = 'Full-time';
  else if (/\bpart[\s-]?time\b/i.test(text)) result.jobType = 'Part-time';
  else if (/\bcontract\b/i.test(text)) result.jobType = 'Contract';
  else if (/\bfreelance\b/i.test(text)) result.jobType = 'Freelance';
  else if (/\btemporary\b/i.test(text)) result.jobType = 'Temporary';
  else if (/\binternship\b/i.test(text)) result.jobType = 'Internship';

  // Seniority
  if (/\b(staff|principal)\b/i.test(text)) result.seniority = 'Staff';
  else if (/\blead\b/i.test(text)) result.seniority = 'Lead';
  else if (/\bsenior\b/i.test(text)) result.seniority = 'Senior';
  else if (/\b(mid[\s-]?level)\b/i.test(text)) result.seniority = 'Mid-Level';
  else if (/\bjunior\b/i.test(text)) result.seniority = 'Junior';
  else if (/\bentry[\s-]?level\b/i.test(text)) result.seniority = 'Entry Level';
  else if (/\bintern\b/i.test(text)) result.seniority = 'Internship';

  // ── Clean description ──────────────────────────────────
  // Strategy 1: find a named body header and keep everything from there
  const BODY_HEADER = /^(?:about\s+(?:the\s+)?(?:role|job|position|company|us|this\s+role|you)|job\s+(?:description|summary|overview|details)|(?:role|position)\s+(?:overview|summary|description)|overview|summary|the\s+role|what\s+you.{0,15}(?:do|work|build|own)|what\s+we.{0,10}(?:look|need|expect)|responsibilities|key\s+responsibilities|your\s+(?:role|responsibilities|impact|mission)|duties|the\s+opportunity|who\s+(?:we|you)\s+are|we.{0,6}looking\s+for|your\s+day[\s-]to[\s-]day)/i;

  // Metadata line patterns — stripped regardless of position
  const META_LINE = [
    /^(?:job\s*title|position|role|title)\s*[:\-–]/i,
    /^(?:company|employer|organization|hiring\s*(?:company|team))\s*[:\-–]/i,
    /^(?:location|office|city|where\s+(?:we\s+)?work)\s*[:\-–]/i,
    /^(?:salary|pay|compensation|pay\s*range|package|rate)\s*[:\-–]/i,
    /^(?:employment|job|work|contract|schedule)\s*type\s*[:\-–]/i,
    /^(?:work\s*(?:model|mode|arrangement|type|setting))\s*[:\-–]/i,
    /^(?:seniority|level|career\s*level|experience\s*level)\s*[:\-–]/i,
    /^(?:department|team|division|group|org)\s*[:\-–]/i,
    /^(?:posted|date\s*posted|listing\s*date|listed)\s*[:\-–]/i,
    /^(?:apply\s*by|deadline|closing\s*date|application\s*(?:deadline|date))\s*[:\-–]/i,
    /^(?:req(?:uisition)?|job|listing|posting)\s*(?:id|#|number)\s*[:\-–]/i,
    /^(?:reports\s*to|reporting\s*line|manager)\s*[:\-–]/i,
    /^(?:industry|sector|vertical)\s*[:\-–]/i,
    /^(?:url|link|apply(?:\s*here)?|application\s*link|how\s*to\s*apply)\s*[:\-–]/i,
    /^(?:headcount|openings?|vacancies)\s*[:\-–]/i,
    /^(?:visa|sponsorship|authorization)\s*[:\-–]/i,
    // Standalone short-form metadata values (whole-line matches)
    /^(?:full[\s-]?time|part[\s-]?time|contract|freelance|temporary|temp|internship|apprenticeship)$/i,
    /^(?:remote|fully\s+remote|hybrid|on[\s-]?site|in[\s-]?(?:person|office))$/i,
    /^(?:senior|sr\.?|junior|jr\.?|mid[\s-]?level|entry[\s-]?level|staff|lead|principal|associate)$/i,
    /^[\$£€][\d,.\s]+(?:k|K|USD|GBP|EUR)?(?:\s*[-–—to]+\s*[\$£€]?[\d,.\s]+(?:k|K|USD|GBP|EUR)?)?(?:\s*(?:\/yr|per\s*year|annually|\/hour|\/hr))?$/,
    /^https?:\/\/\S+$/i,
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
    /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2},?\s*\d{4}$/i,
    // Pipe/bullet separated tag lines (e.g. "Full-time | Remote | $120k")
    /^[\w\s$£€.,\-–—|•·]+$(?=.*\|)/,
  ];

  const extractedVals = new Set(
    Object.entries(result)
    .filter(([k]) => k !== 'description')
    .map(([, v]) => v && v.toLowerCase().trim())
    .filter(Boolean)
  );

  const allLines = text.split('\n');

  // Try Strategy 1 first
  let bodyStart = -1;
  for (let i = 0; i < allLines.length; i++) {
    const l = allLines[i].trim();
    if (l && BODY_HEADER.test(l)) {
      bodyStart = i;
      break;
    }
  }
  if (bodyStart > 0) {
    result.description = allLines.slice(bodyStart).join('\n').trim();
    return result;
  }

  // Strategy 2: filter metadata lines, keep body content
  const cleaned = [];
  let bodyStarted = false;
  for (let i = 0; i < allLines.length; i++) {
    const raw = allLines[i];
    const l = raw.trim();
    if (!l) {
      if (bodyStarted) cleaned.push('');
      continue;
    }

    const isMeta = META_LINE.some(p => p.test(l)) ||
      extractedVals.has(l.toLowerCase())
      // pipe-delimited tag lines (Full-time | Remote | Senior)
      ||
      (/^[^.!?]{1,120}$/.test(l) && (l.match(/\|/g) || []).length >= 1 && l.split('|').every(seg => seg.trim().length < 40));

    if (isMeta && !bodyStarted) continue;

    bodyStarted = true;
    cleaned.push(raw);
  }

  result.description = cleaned.join('\n').trim() || text;
  return result;
}

function flashField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('field-flashed');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('field-flashed');
  el.addEventListener('animationend', () => el.classList.remove('field-flashed'), {
    once: true
  });
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

  // Show/clear the "Auto-filled" indicator on the department label
  const deptLabel = document.querySelector('label[for="job-department"], #job-department').closest('.form-group').querySelector('.form-label');
  const existingFormTag = deptLabel ? deptLabel.querySelector('.inferred-tag') : null;
  if (existingFormTag) existingFormTag.remove();
  if (job && job.departmentInferred && deptLabel) {
    const tag = document.createElement('span');
    tag.className = 'inferred-tag';
    tag.title = 'Auto-filled from job title / description';
    tag.textContent = '✦ Auto-filled';
    deptLabel.appendChild(tag);
    // Remove the tag as soon as the user manually edits the field
    document.getElementById('job-department').addEventListener('input', function clearTag() {
      tag.remove();
      this.removeEventListener('input', clearTag);
    }, {
      once: true
    });
  }

  document.getElementById('job-location').value = job ? job.location || '' : '';
  document.getElementById('job-url').value = job ? job.url || '' : '';
  document.getElementById('job-salary').value = job ? job.salary || '' : '';
  document.getElementById('job-date-posted').value = job ? job.datePosted || '' : '';
  document.getElementById('job-date-applied').value = job ? job.dateApplied || '' : '';
  document.getElementById('job-deadline').value = job ? job.deadline || '' : '';
  document.getElementById('job-stage').value = job ? job.stage || 'saved' : '';
  document.getElementById('job-seniority').value = job ? job.seniority || '' : '';
  document.getElementById('job-type').value = job ? job.jobType || '' : '';
  document.getElementById('job-work-type').value = job ? job.workType || '' : '';

  // Show/clear the "Auto-filled" indicator on the work type label
  const workTypeSelect = document.getElementById('job-work-type');
  const workTypeLabel = workTypeSelect.closest('.form-group').querySelector('.form-label');
  const existingWorkTag = workTypeLabel ? workTypeLabel.querySelector('.inferred-tag') : null;
  if (existingWorkTag) existingWorkTag.remove();
  if (job && job.workTypeInferred && workTypeLabel) {
    const tag = document.createElement('span');
    tag.className = 'inferred-tag';
    tag.title = 'Auto-filled from job description';
    tag.textContent = '✦ Auto-filled';
    workTypeLabel.appendChild(tag);
    workTypeSelect.addEventListener('change', function clearTag() {
      tag.remove();
      this.removeEventListener('change', clearTag);
    }, {
      once: true
    });
  }

  document.getElementById('job-description').value = job ? job.description || '' : '';
  document.getElementById('job-benefits').value = job ? job.benefits || '' : '';
  document.getElementById('job-company-notes').value = job ? job.companyNotes || '' : '';
  document.getElementById('job-notes').value = job ? job.notes || '' : '';
  document.getElementById('job-cover-letter').value = job ? job.coverLetter || '' : '';

  // Reset smart paste panel (hide for edits, show trigger for new jobs)
  const spPanel = document.getElementById('smart-paste-panel');
  const spTrigger = document.getElementById('smart-paste-trigger');
  const spInput = document.getElementById('smart-paste-input');
  if (spPanel) {
    spPanel.classList.remove('open');
    spPanel.style.display = '';
  }
  if (spTrigger) spTrigger.style.display = editId ? 'none' : '';
  if (spInput) spInput.value = '';
  // Clear any leftover auto-fill tags
  document.querySelectorAll('#modal-job .inferred-tag').forEach(t => t.remove());

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

  const typedDept = document.getElementById('job-department').value.trim();
  const inferredDept = !typedDept ? inferDepartment(role, description) : null;
  const department = typedDept || inferredDept || '';
  const departmentInferred = !typedDept && !!inferredDept;

  const jobData = {
    role,
    company,
    department,
    departmentInferred,
    location: document.getElementById('job-location').value.trim(),
    url: document.getElementById('job-url').value.trim(),
    salary: formatSalary(document.getElementById('job-salary').value.trim()),
    datePosted: document.getElementById('job-date-posted').value,
    dateApplied: document.getElementById('job-date-applied').value,
    deadline: document.getElementById('job-deadline').value,
    seniority: document.getElementById('job-seniority').value,
    jobType: document.getElementById('job-type').value,
    ...(() => {
      const typed = document.getElementById('job-work-type').value;
      const inferred = !typed ? inferWorkType(description) : null;
      return {
        workType: typed || inferred || '',
        workTypeInferred: !typed && !!inferred
      };
    })(),
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

/* ══════════════════════════════════════════════════════════
   JOB COMPARISON
   ══════════════════════════════════════════════════════════ */
let _compareSearch = '';

function openComparePickerModal() {
  _compareSearch = '';
  renderComparePicker('');
  openModal('modal-compare');
}

function renderComparePicker(search) {
  const list = document.getElementById('compare-picker-list');
  const btn = document.getElementById('compare-go-btn');
  const counter = document.getElementById('compare-selected-counter');
  const clearBtn = document.getElementById('compare-clear-btn');
  if (!list) return;

  const q = search.trim().toLowerCase();
  const jobs = state.jobs.filter(j => !['archived'].includes(j.stage));
  const filtered = q ?
    jobs.filter(j => j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) :
    jobs;

  const checked = Array.from(list.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

  list.innerHTML = filtered.length === 0 ?
    '<p class="empty-msg">No jobs found.</p>' :
    filtered.map((j, i) => {
      const isChecked = checked.includes(j.id);
      const fitLabel = j.fitScore !== null && j.fitScore !== undefined ? `${j.fitScore}%` : 'No score';
      return `<label class="compare-picker-item${isChecked ? ' selected' : ''}" style="animation-delay:${i * 35}ms">
          <input type="checkbox" value="${j.id}" ${isChecked ? 'checked' : ''}/>
          <div class="compare-picker-check">${isChecked ? '✓' : ''}</div>
          <div class="compare-picker-info">
            <div class="compare-picker-role">${escHtml(j.role)}</div>
            <div class="compare-picker-company">${escHtml(j.company)}${j.location ? ' · ' + escHtml(j.location) : ''}</div>
          </div>
          <span class="fit-badge ${fitBadgeClass(j.fitScore)}">${fitLabel}</span>
          <span class="stage-badge stage-${j.stage}" style="font-size:10px">${STAGE_LABELS[j.stage]}</span>
        </label>`;
    }).join('');

  function updateCount() {
    const total = list.querySelectorAll('input:checked').length;
    if (btn) {
      btn.disabled = total < 2;
      btn.textContent = total >= 2 ? `Compare ${total} Jobs` : 'Select 2–3 Jobs';
    }
    if (counter) {
      counter.textContent = `${total} / 3 selected`;
      counter.classList.toggle('ready', total >= 2);
    }
    if (clearBtn) clearBtn.style.display = total > 0 ? '' : 'none';
  }

  list.querySelectorAll('.compare-picker-item').forEach(item => {
    item.addEventListener('change', () => {
      const cb = item.querySelector('input');
      const check = item.querySelector('.compare-picker-check');
      const total = list.querySelectorAll('input:checked').length;
      if (total > 3) {
        cb.checked = false;
        item.classList.remove('selected');
        if (check) check.textContent = '';
        toast('Select up to 3 jobs to compare.', 'error');
        updateCount();
        return;
      }
      item.classList.toggle('selected', cb.checked);
      if (check) check.textContent = cb.checked ? '✓' : '';
      updateCount();
    });
  });

  updateCount();
}

function runComparison() {
  const list = document.getElementById('compare-picker-list');
  const pickerView = document.getElementById('compare-picker-view');
  const resultView = document.getElementById('compare-result-view');
  const backBtn = document.getElementById('compare-back-btn');
  const ids = Array.from(list.querySelectorAll('input:checked')).map(cb => cb.value);
  if (ids.length < 2) {
    toast('Select at least 2 jobs.', 'error');
    return;
  }
  const jobs = ids.map(id => state.jobs.find(j => j.id === id)).filter(Boolean);
  pickerView.style.animation = 'compareViewOut 0.2s ease forwards';
  setTimeout(() => {
    pickerView.style.display = 'none';
    pickerView.style.animation = '';
    renderComparisonGrid(jobs);
    resultView.style.display = '';
    resultView.classList.add('compare-view-in');
    resultView.addEventListener('animationend', () => resultView.classList.remove('compare-view-in'), {
      once: true
    });
    if (backBtn) backBtn.style.display = '';
  }, 200);
}

function renderComparisonGrid(jobs) {
  const grid = document.getElementById('compare-result-grid');
  if (!grid) return;

  const COL_COLORS = ['#6366f1', '#f59e0b', '#10b981'];
  const CIRCUMFERENCE = 2 * Math.PI * 24;

  const maxFit = Math.max(...jobs.map(j => j.fitScore ?? -1));

  function parseSalaryNum(s) {
    if (!s) return null;
    const nums = s.replace(/,/g, '').match(/\d+(\.\d+)?/g);
    if (!nums) return null;
    const vals = nums.map(Number).map(n => n < 1500 ? n * 1000 : n);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const salaryNums = jobs.map(j => parseSalaryNum(j.salary));
  const maxSalary = Math.max(...salaryNums.filter(Boolean));

  grid.style.gridTemplateColumns = `repeat(${jobs.length}, 1fr)`;

  grid.innerHTML = jobs.map((j, i) => {
    const color = COL_COLORS[i % COL_COLORS.length];
    const isWinner = j.fitScore !== null && j.fitScore !== undefined && j.fitScore === maxFit && maxFit >= 0;
    const fitScore = (j.fitScore !== null && j.fitScore !== undefined) ? j.fitScore : null;
    const fitColor = fitScore >= 70 ? 'var(--green)' : fitScore >= 40 ? 'var(--yellow)' : fitScore !== null ? 'var(--red)' : 'var(--text-muted)';
    const fitSub = fitScore >= 70 ? 'Strong fit' : fitScore >= 40 ? 'Moderate fit' : fitScore !== null ? 'Low fit' : 'No score';
    const dashOffset = fitScore !== null ? CIRCUMFERENCE * (1 - fitScore / 100) : CIRCUMFERENCE;
    const salaryNum = salaryNums[i];
    const salaryPct = (maxSalary && salaryNum) ? Math.round((salaryNum / maxSalary) * 100) : 0;
    const parsedBenefits = j.benefits ? parseBenefits(j.benefits) : [];
    return `<div class="compare-col${isWinner ? ' is-winner' : ''}" style="--col-accent:${color}">
      <div class="compare-col-header">
        ${isWinner ? '<div class="compare-col-winner-badge" title="Best fit score">👑</div>' : ''}
        <div class="compare-col-role">${escHtml(j.role)}</div>
        <div class="compare-col-company">${escHtml(j.company)}${j.location ? ' · ' + escHtml(j.location) : ''}</div>
      </div>
      <div class="compare-col-body">
        <div class="compare-row">
          <div class="compare-row-label">Fit Score</div>
          <div class="compare-fit-label">
            <svg viewBox="0 0 60 60" class="compare-fit-ring">
              <circle class="compare-fit-track" cx="30" cy="30" r="24"/>
              <circle class="compare-fit-fill" cx="30" cy="30" r="24"
                stroke-dasharray="${CIRCUMFERENCE}"
                stroke-dashoffset="${CIRCUMFERENCE}"
                data-offset="${dashOffset}"
                style="stroke:${fitColor}"/>
            </svg>
            <div>
              <div class="compare-fit-number" style="color:${fitColor}">${fitScore !== null ? fitScore + '%' : '—'}</div>
              <div class="compare-fit-sub">${fitSub}</div>
            </div>
          </div>
        </div>
        <div class="compare-row">
          <div class="compare-row-label">Stage</div>
          <span class="stage-badge stage-${j.stage}">${STAGE_LABELS[j.stage]}</span>
        </div>
        <div class="compare-row">
          <div class="compare-row-label">Salary</div>
          <div class="compare-row-value">${escHtml(j.salary || '—')}</div>
          ${salaryPct > 0 ? `<div class="compare-salary-bar-wrap"><div class="compare-salary-bar" data-pct="${salaryPct}"></div></div>` : ''}
        </div>
        <div class="compare-row">
          <div class="compare-row-label">Work Type</div>
          <div class="compare-row-value">${escHtml(j.workType || '—')}</div>
        </div>
        <div class="compare-row">
          <div class="compare-row-label">Seniority</div>
          <div class="compare-row-value">${escHtml(j.seniority || '—')}</div>
        </div>
        <div class="compare-row">
          <div class="compare-row-label">Matched Skills <span style="color:var(--green)">(${(j.matched||[]).length})</span></div>
          <div class="compare-skill-list">
            ${(j.matched || []).slice(0, 8).map((s, si) => `<span class="skill-badge green skill-pop" style="animation-delay:${si * 45}ms">${s}</span>`).join('')}
            ${(j.matched||[]).length > 8 ? `<span style="font-size:11px;color:var(--text-muted)">+${(j.matched||[]).length - 8} more</span>` : ''}
          </div>
        </div>
        <div class="compare-row">
          <div class="compare-row-label">Skill Gaps <span style="color:var(--red)">(${(j.missing||[]).length})</span></div>
          <div class="compare-skill-list">
            ${(j.missing || []).slice(0, 8).map((s, si) => `<span class="skill-badge red skill-pop" style="animation-delay:${(si + 8) * 45}ms">${s}</span>`).join('')}
            ${(j.missing||[]).length > 8 ? `<span style="font-size:11px;color:var(--text-muted)">+${(j.missing||[]).length - 8} more</span>` : ''}
          </div>
        </div>
        ${parsedBenefits.length ? `<div class="compare-row">
          <div class="compare-row-label">Benefits</div>
          <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">
            ${parsedBenefits.map(b => `<span class="benefit-chip">${escHtml(b)}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>`;
  }).join('');

  // Stagger column entrance
  grid.querySelectorAll('.compare-col').forEach((col, i) => {
    col.style.opacity = '0';
    col.style.animationDelay = `${i * 90}ms`;
    col.classList.add('compare-col-enter');
    col.addEventListener('animationend', () => {
      col.style.opacity = '';
      col.classList.remove('compare-col-enter');
      col.style.animationDelay = '';
    }, {
      once: true
    });
  });

  // Animate fit ring arcs + salary bars after paint
  requestAnimationFrame(() => {
    grid.querySelectorAll('.compare-fit-fill').forEach(arc => {
      arc.style.strokeDashoffset = arc.dataset.offset;
    });
    grid.querySelectorAll('.compare-salary-bar').forEach(bar => {
      bar.style.width = bar.dataset.pct + '%';
    });
  });
}
'use strict';

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════════ */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Cmd+Shift+K (Mac) / Ctrl+Shift+K (Windows) → command palette
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }

    // Escape → close topmost open modal (works even when typing inside it)
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal-overlay.open');
      if (open) { e.preventDefault(); closeModal(open.id); }
      return;
    }

    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    const typing = ['input', 'textarea', 'select'].includes(tag) || (document.activeElement && document.activeElement.isContentEditable);
    if (typing) return;

    // N → add job
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      const btn = document.getElementById('topbar-action');
      if (btn) btn.click();
    }
    // / → focus board search
    if (e.key === '/') {
      e.preventDefault();
      const search = document.getElementById('board-search');
      if (search) {
        search.focus();
        search.select();
      }
    }
  });
}

/* ══════════════════════════════════════════════════════════
   COMMAND PALETTE
   ══════════════════════════════════════════════════════════ */
const CMD_VIEWS = [{
    icon: '◈',
    label: 'Dashboard',
    view: 'dashboard'
  },
  {
    icon: '⊞',
    label: 'Job Board',
    view: 'board'
  },
  {
    icon: '◫',
    label: 'Calendar & Activity',
    view: 'calendar'
  },
  {
    icon: '◎',
    label: 'Network',
    view: 'contacts'
  },
  {
    icon: '⊕',
    label: 'Goals',
    view: 'goals'
  },
  {
    icon: '⊛',
    label: 'Analytics',
    view: 'analytics'
  },
  {
    icon: '◉',
    label: 'My Profile',
    view: 'profile'
  },
  {
    icon: '✦',
    label: 'Resume Hub',
    view: 'resume'
  },
  {
    icon: '◎',
    label: 'Learning Hub',
    view: 'learning'
  },
];

const CMD_ACTIONS = [{
    icon: '＋',
    label: 'Add Job',
    action: () => {
      const b = document.getElementById('topbar-action');
      if (b) b.click();
    }
  },
  {
    icon: '⬇',
    label: 'Export Data (JSON)',
    action: () => exportData()
  },
  {
    icon: '🖨',
    label: 'Print Summary',
    action: () => printSummary()
  },
  {
    icon: '◑',
    label: 'Toggle Color-Blind Mode',
    action: () => toggleColorBlindMode()
  },
];

let _cmdOpen = false;
let _cmdIdx = 0;

function toggleCommandPalette() {
  if (_cmdOpen) closeCommandPalette();
  else openCommandPalette();
}

function openCommandPalette() {
  const ov = document.getElementById('cmd-palette');
  if (!ov) return;
  ov.classList.add('open');
  ov.setAttribute('aria-hidden', 'false');
  _cmdOpen = true;
  const inp = document.getElementById('cmd-input');
  if (inp) {
    inp.value = '';
    inp.focus();
  }
  renderCmdResults('');
}

function closeCommandPalette() {
  const ov = document.getElementById('cmd-palette');
  if (!ov) return;
  ov.classList.remove('open');
  ov.setAttribute('aria-hidden', 'true');
  _cmdOpen = false;
}

function renderCmdResults(query) {
  const q = query.toLowerCase().trim();
  const el = document.getElementById('cmd-results');
  if (!el) return;

  const items = [];

  // Views
  CMD_VIEWS.forEach(v => {
    if (!q || v.label.toLowerCase().includes(q)) items.push({
      type: 'view',
      ...v
    });
  });

  // Actions
  CMD_ACTIONS.forEach(a => {
    if (!q || a.label.toLowerCase().includes(q)) items.push({
      type: 'action',
      ...a
    });
  });

  // Jobs (only when typing)
  if (q && typeof state !== 'undefined' && Array.isArray(state.jobs)) {
    state.jobs
      .filter(j => j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(j => items.push({
        type: 'job',
        icon: (STAGE_EMOJIS && STAGE_EMOJIS[j.stage]) || '📋',
        label: `${j.role} · ${j.company}`,
        jobId: j.id
      }));
  }

  _cmdIdx = 0;
  el._items = items;

  if (!items.length) {
    el.innerHTML = `<div class="cmd-empty">No results${q ? ` for "${escHtml(query)}"` : ''}</div>`;
    return;
  }

  let html = '';
  let lastType = null;
  items.forEach((item, i) => {
    if (item.type !== lastType) {
      if (lastType !== null) html += '</div>';
      const grp = item.type === 'view' ? 'Navigation' : item.type === 'action' ? 'Actions' : 'Jobs';
      html += `<div class="cmd-group"><div class="cmd-group-label">${grp}</div>`;
      lastType = item.type;
    }
    html += `<div class="cmd-item${i === 0 ? ' active' : ''}" data-cmd-idx="${i}">
      <span class="cmd-item-icon">${item.icon}</span>
      <span class="cmd-item-label">${escHtml(item.label)}</span>
    </div>`;
  });
  if (lastType !== null) html += '</div>';

  el.innerHTML = html;

  el.querySelectorAll('.cmd-item').forEach((row, i) => {
    row.addEventListener('mouseenter', () => {
      el.querySelectorAll('.cmd-item').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      _cmdIdx = i;
    });
    row.addEventListener('click', () => _execCmdItem(items[i]));
  });
}

function _execCmdItem(item) {
  closeCommandPalette();
  if (item.type === 'view') navigate(item.view);
  else if (item.type === 'action') item.action();
  else if (item.type === 'job') {
    navigate('board');
    setTimeout(() => openJobDetail(item.jobId), 200);
  }
}

function initCommandPalette() {
  const ov = document.getElementById('cmd-palette');
  if (!ov) return;

  ov.addEventListener('click', e => {
    if (e.target === ov) closeCommandPalette();
  });

  const inp = document.getElementById('cmd-input');
  if (!inp) return;

  inp.addEventListener('input', () => renderCmdResults(inp.value));
  inp.addEventListener('keydown', e => {
    const el = document.getElementById('cmd-results');
    const items = el && el._items;
    if (!items || !items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _cmdIdx = Math.min(_cmdIdx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _cmdIdx = Math.max(_cmdIdx - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      _execCmdItem(items[_cmdIdx]);
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
      return;
    } else {
      return;
    }
    el.querySelectorAll('.cmd-item').forEach((r, i) => r.classList.toggle('active', i === _cmdIdx));
    const active = el.querySelector('.cmd-item.active');
    if (active) active.scrollIntoView({
      block: 'nearest'
    });
  });
}

/* ══════════════════════════════════════════════════════════
   FIT SCORE TOOLTIP
   ══════════════════════════════════════════════════════════ */
let _fitTipTimer = null;

function initFitTooltip() {
  const tip = document.getElementById('fit-tooltip');
  if (!tip) return;

  document.addEventListener('mouseover', e => {
    const badge = e.target.closest('.fit-badge[data-job-id]');
    if (!badge) return;
    clearTimeout(_fitTipTimer);
    _fitTipTimer = setTimeout(() => {
      const job = typeof state !== 'undefined' && state.jobs.find(j => j.id === badge.dataset.jobId);
      if (!job || job.fitScore === null || job.fitScore === undefined) return;
      const m = (job.matched || []).length;
      const g = (job.missing || []).length;
      tip.innerHTML = `
        <div class="fit-tip-score">${job.fitScore}% fit</div>
        <div class="fit-tip-row"><span class="fit-tip-dot fit-tip-matched"></span>${m} matched</div>
        <div class="fit-tip-row"><span class="fit-tip-dot fit-tip-gap"></span>${g} gaps</div>`;
      const r = badge.getBoundingClientRect();
      tip.style.left = (r.left + r.width / 2) + 'px';
      tip.style.top = (r.top - 8) + 'px';
      tip.classList.add('show');
    }, 320);
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest('.fit-badge[data-job-id]')) {
      clearTimeout(_fitTipTimer);
      tip.classList.remove('show');
    }
  });
}

/* ══════════════════════════════════════════════════════════
   JOB CARD HOVER PREVIEW
   ══════════════════════════════════════════════════════════ */
let _previewTimer = null;

function initCardPreview() {
  const pv = document.getElementById('card-preview');
  if (!pv) return;

  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.job-card[data-job-id]');
    if (!card || e.target.closest('.card-delete-btn')) return;
    clearTimeout(_previewTimer);
    _previewTimer = setTimeout(() => {
      const job = typeof state !== 'undefined' && state.jobs.find(j => j.id === card.dataset.jobId);
      if (!job) return;
      const cls = typeof fitBadgeClass === 'function' ? fitBadgeClass(job.fitScore) : '';
      const lbl = typeof fitBadgeLabel === 'function' ? fitBadgeLabel(job.fitScore) : '';
      const stage = (typeof STAGE_LABELS !== 'undefined' && STAGE_LABELS[job.stage]) || job.stage;
      pv.innerHTML = `
        <div class="cpv-role">${escHtml(job.role)}</div>
        <div class="cpv-company">${escHtml(job.company)}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
        <div class="cpv-row">
          <span class="stage-badge stage-${job.stage}">${stage}</span>
          <span class="fit-badge ${cls}">${lbl}</span>
        </div>
        ${job.salary ? `<div class="cpv-detail">💰 ${escHtml(job.salary)}</div>` : ''}
        ${job.deadline ? `<div class="cpv-detail">⏰ ${escHtml(typeof formatDate === 'function' ? formatDate(job.deadline) : job.deadline)}</div>` : ''}
        ${job.workType ? `<div class="cpv-detail">🏢 ${escHtml(job.workType)}</div>` : ''}
        ${(job.matched || []).length ? `<div class="cpv-detail cpv-matched">✓ ${(job.matched||[]).length} matched skills</div>` : ''}
        ${(job.missing || []).length ? `<div class="cpv-detail cpv-gap">✗ ${(job.missing||[]).length} skill gaps</div>` : ''}
        <div class="cpv-hint">Click to open</div>`;
      const rect = card.getBoundingClientRect();
      const pw = 240;
      const ph = 220;
      // Prefer above the card; fall back to below if not enough room
      let top = rect.top - ph - 10;
      if (top < 8) top = rect.bottom + 10;
      // Center horizontally over the card; clamp to viewport edges
      let left = rect.left + rect.width / 2 - pw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
      pv.style.cssText = `left:${left}px;top:${top}px;width:${pw}px`;
      pv.classList.add('show');
    }, 480);
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest('.job-card[data-job-id]')) {
      clearTimeout(_previewTimer);
      pv.classList.remove('show');
    }
  });

  document.addEventListener('click', e => {
    if (e.target.closest('.job-card')) pv.classList.remove('show');
  });
}

/* ══════════════════════════════════════════════════════════
   COLOR-BLIND MODE
   ══════════════════════════════════════════════════════════ */
function initColorBlindMode() {
  if (localStorage.getItem('pt-colorblind') === '1') {
    document.documentElement.classList.add('colorblind');
  }
  const btn = document.getElementById('btn-colorblind');
  if (btn) {
    btn.classList.toggle('active', document.documentElement.classList.contains('colorblind'));
    btn.addEventListener('click', () => toggleColorBlindMode());
  }
}

function toggleColorBlindMode() {
  const on = document.documentElement.classList.toggle('colorblind');
  localStorage.setItem('pt-colorblind', on ? '1' : '0');
  const btn = document.getElementById('btn-colorblind');
  if (btn) btn.classList.toggle('active', on);
  if (typeof toast === 'function') toast(on ? 'Color-blind mode on.' : 'Color-blind mode off.', 'success');
}

/* ══════════════════════════════════════════════════════════
   PRINT SUMMARY
   ══════════════════════════════════════════════════════════ */
function printSummary() {
  if (typeof navigate === 'function') navigate('analytics');
  setTimeout(() => window.print(), 350);
}

/* ══════════════════════════════════════════════════════════
   GETTING STARTED CHECKLIST
   ══════════════════════════════════════════════════════════ */
const GS_STEPS = [{
    id: 'skills',
    label: 'Add your skills',
    view: 'profile',
    done: () => typeof state !== 'undefined' && (state.profile.skills || []).length > 0
  },
  {
    id: 'job',
    label: 'Add your first job',
    view: 'board',
    done: () => typeof state !== 'undefined' && state.jobs.length > 0
  },
  {
    id: 'fit',
    label: 'Get a fit score',
    view: 'board',
    done: () => typeof state !== 'undefined' && state.jobs.some(j => j.fitScore != null)
  },
  {
    id: 'learn',
    label: 'Visit Learning Hub',
    view: 'learning',
    done: () => localStorage.getItem('pt-visited-learning') === '1'
  },
];

function updateGettingStarted() {
  const bar = document.getElementById('getting-started-bar');
  if (!bar) return;
  if (localStorage.getItem('pt-gs-dismissed') === '1') {
    bar.style.display = 'none';
    return;
  }
  const allDone = GS_STEPS.every(s => s.done());
  if (allDone) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = '';
  const done = GS_STEPS.filter(s => s.done()).length;
  bar.innerHTML = `
    <div class="gs-inner">
      <span class="gs-label">Getting Started</span>
      <div class="gs-steps">
        ${GS_STEPS.map(s => `<div class="gs-step${s.done() ? ' gs-done' : ''}" data-view="${s.view}" title="${s.label}">
          <span class="gs-check">${s.done() ? '✓' : ''}</span>${s.label}
        </div>`).join('')}
      </div>
      <div class="gs-track"><div class="gs-fill" style="width:${done / GS_STEPS.length * 100}%"></div></div>
      <button class="gs-close" title="Dismiss">×</button>
    </div>`;
  bar.querySelectorAll('.gs-step:not(.gs-done)').forEach(s => s.addEventListener('click', () => typeof navigate === 'function' && navigate(s.dataset.view)));
  bar.querySelector('.gs-close').addEventListener('click', () => {
    localStorage.setItem('pt-gs-dismissed', '1');
    bar.style.display = 'none';
  });
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
function initUXEnhancements() {
  initCommandPalette();
  initKeyboardShortcuts();
  initFitTooltip();
  initCardPreview();
  initColorBlindMode();
  updateGettingStarted();

  // Track learning hub visit for checklist
  document.querySelectorAll('[data-view="learning"]').forEach(el => {
    el.addEventListener('click', () => {
      localStorage.setItem('pt-visited-learning', '1');
      setTimeout(updateGettingStarted, 100);
    });
  });
}
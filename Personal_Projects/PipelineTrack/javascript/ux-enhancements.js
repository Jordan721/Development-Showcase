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
      if (open) {
        e.preventDefault();
        closeModal(open.id);
      }
      return;
    }

    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    const typing = ['input', 'textarea', 'select'].includes(tag) || (document.activeElement && document.activeElement.isContentEditable);
    if (typing) return;

    // 1 / 2 / 3 → switch job modal tabs when modal is open
    if (['1', '2', '3'].includes(e.key)) {
      const jobModal = document.getElementById('modal-job');
      if (jobModal && jobModal.classList.contains('open')) {
        const idx = parseInt(e.key) - 1;
        const tabs = document.querySelectorAll('#job-modal-tabs .modal-tab-btn');
        const panels = document.querySelectorAll('#modal-job .modal-tab-panel');
        if (tabs[idx]) {
          e.preventDefault();
          tabs.forEach((b, i) => b.classList.toggle('active', i === idx));
          panels.forEach((p, i) => p.classList.toggle('active', i === idx));
        }
        return;
      }
    }

    // N → add job
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      const btn = document.getElementById('topbar-action');
      if (btn) btn.click();
    }
    // E → open job picker to edit
    if (e.key === 'e' || e.key === 'E') {
      const jobModal = document.getElementById('modal-job');
      if (jobModal && jobModal.classList.contains('open')) return; // already editing
      e.preventDefault();
      openJobPickerModal();
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
   JOB PICKER MODAL (E shortcut)
   ══════════════════════════════════════════════════════════ */
const PICKER_STAGE_COLORS = {
  saved: 'var(--text-muted)', applied: 'var(--accent)', screening: '#a78bfa',
  interview: 'var(--yellow)', offer: 'var(--green)', declined: 'var(--red)',
  withdrew: '#f97316', ghosted: '#94a3b8', archived: 'var(--border)'
};

function renderJobPickerList(query) {
  const list = document.getElementById('job-picker-list');
  if (!list) return;
  const q = (query || '').toLowerCase().trim();
  const jobs = (state.jobs || []).filter(j => {
    if (!q) return true;
    return (j.role || '').toLowerCase().includes(q) ||
      (j.company || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q) ||
      (j.stage || '').toLowerCase().includes(q) ||
      (j.seniority || '').toLowerCase().includes(q) ||
      (j.jobType || '').toLowerCase().includes(q) ||
      (j.workType || '').toLowerCase().includes(q) ||
      (j.salary || '').toLowerCase().includes(q);
  });

  const hint = document.getElementById('job-picker-hint');
  if (hint) hint.textContent = jobs.length ? `${jobs.length} job${jobs.length !== 1 ? 's' : ''} · ↵ to select · Esc to close` : '↵ to select · Esc to close';

  if (jobs.length === 0) {
    list.innerHTML = `<div class="job-picker-empty">No jobs match your search.</div>`;
    return;
  }

  list.innerHTML = jobs.map((j, i) => {
    const dotColor = PICKER_STAGE_COLORS[j.stage] || 'var(--border)';
    const chips = [j.seniority, j.jobType, j.workType, j.salary].filter(Boolean);
    const fitCls = j.fitScore != null ? (j.fitScore >= 70 ? 'green' : j.fitScore >= 40 ? 'yellow' : 'red') : '';
    const fitPill = j.fitScore != null
      ? `<span class="fit-badge ${fitCls} job-picker-fit">${j.fitScore}%</span>` : '';
    return `
    <div class="job-picker-row" data-edit-id="${j.id}" style="animation-delay:${i * 30}ms">
      <span class="job-picker-stage-dot" style="background:${dotColor}"></span>
      <div class="job-picker-row-body">
        <div class="job-picker-role">${escHtml(j.role)}</div>
        <div class="job-picker-meta">${escHtml(j.company)}${j.location ? ' · ' + escHtml(j.location) : ''}</div>
        ${chips.length ? `<div class="job-picker-chips">${chips.map(c => `<span class="job-picker-chip">${escHtml(c)}</span>`).join('')}</div>` : ''}
      </div>
      ${fitPill}
    </div>`;
  }).join('');

  list.querySelectorAll('.job-picker-row').forEach(row => {
    row.addEventListener('click', () => {
      closeModal('modal-job-picker');
      if (typeof openAddJobModal === 'function') openAddJobModal(row.dataset.editId);
    });
  });
}

function openJobPickerModal() {
  const search = document.getElementById('job-picker-search');
  if (search) search.value = '';
  renderJobPickerList('');
  openModal('modal-job-picker');
  setTimeout(() => search && search.focus(), 80);

  const existing = document.getElementById('job-picker-search');
  if (existing && !existing._pickerWired) {
    existing._pickerWired = true;
    existing.addEventListener('input', () => renderJobPickerList(existing.value));
  }
}

/* ══════════════════════════════════════════════════════════
   BACK TO TOP
   ══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const content = document.getElementById('main-content') || document.documentElement;
  const onScroll = () => btn.classList.toggle('visible', (content.scrollTop || window.scrollY) > 300);
  content.addEventListener('scroll', onScroll, {
    passive: true
  });
  window.addEventListener('scroll', onScroll, {
    passive: true
  });
  btn.addEventListener('click', () => {
    content.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
   SENIORITY INFERENCE
   ══════════════════════════════════════════════════════════ */
const _seniorityRules = [{
    value: 'Internship',
    patterns: [/\bintern(ship)?\b/i]
  },
  {
    value: 'Entry Level',
    patterns: [/\bentry[\s-]?level\b/i, /\bnew[\s-]?grad\b/i, /\bgraduate\b/i, /\bassociate\b/i, /\bjunior\b/i, /\bjr\.?\b/i]
  },
  {
    value: 'Junior',
    patterns: [/\bjunior\b/i, /\bjr\.?\b/i]
  },
  {
    value: 'Mid-Level',
    patterns: [/\bmid[\s-]?level\b/i, /\bintermediate\b/i, /\blevel\s?ii\b/i, /\bengineer\s?ii\b/i, /\bii\b/i]
  },
  {
    value: 'Senior',
    patterns: [/\bsenior\b/i, /\bsr\.?\b/i]
  },
  {
    value: 'Lead',
    patterns: [/\blead\b/i, /\btech\s?lead\b/i, /\bteam\s?lead\b/i]
  },
  {
    value: 'Staff',
    patterns: [/\bstaff\b/i, /\bprincipal\b/i]
  },
];

// More specific title-only rules checked first (order matters — more specific → less specific)
const _titleRules = [{
    value: 'Internship',
    patterns: [/\bintern(ship)?\b/i]
  },
  {
    value: 'Staff',
    patterns: [/\bstaff\b/i, /\bprincipal\b/i]
  },
  {
    value: 'Lead',
    patterns: [/\blead\b/i]
  },
  {
    value: 'Senior',
    patterns: [/\bsenior\b/i, /\bsr\.?\b/i]
  },
  {
    value: 'Mid-Level',
    patterns: [/\bmid[\s-]?level\b/i, /\blevel\s?ii\b/i, /\bengineer\s?ii\b/i]
  },
  {
    value: 'Junior',
    patterns: [/\bjunior\b/i, /\bjr\.?\b/i]
  },
  {
    value: 'Entry Level',
    patterns: [/\bentry[\s-]?level\b/i, /\bnew[\s-]?grad\b/i, /\bgraduate\b/i]
  },
];

// L-levels / E-levels / P-levels used by major tech companies
const _levelRules = [{
    value: 'Entry Level',
    pattern: /\b(L3|E3|IC3|T3|P3|SDE[\s-]?I|SWE[\s-]?I|engineer[\s-]?I\b)/i
  },
  {
    value: 'Mid-Level',
    pattern: /\b(L4|E4|IC4|T4|P4|SDE[\s-]?II|SWE[\s-]?II|engineer[\s-]?II\b)/i
  },
  {
    value: 'Senior',
    pattern: /\b(L5|E5|IC5|T5|P5|SDE[\s-]?III|SWE[\s-]?III|engineer[\s-]?III\b)/i
  },
  {
    value: 'Lead',
    pattern: /\b(L6|E6|IC6|T6|P6|SDE[\s-]?IV)\b/i
  },
  {
    value: 'Staff',
    pattern: /\b(L7|E7|IC7|T7|P7|distinguished)\b/i
  },
];

function _inferFromLevels(text) {
  if (!text) return null;
  for (const rule of _levelRules) {
    if (rule.pattern.test(text)) return rule.value;
  }
  return null;
}

// Responsibility language patterns
const _respRules = [{
    value: 'Lead',
    patterns: [/\blead(ing)?\s+(a\s+)?team\b/i, /\bmanage\s+(a\s+team|engineers|developers)\b/i, /\bdirect\s+reports\b/i, /\bpeople\s+manager\b/i]
  },
  {
    value: 'Senior',
    patterns: [/\bmentor(ing)?\s+(junior|engineers|developers)\b/i, /\barchitect(ing|ure)?\s+(systems|solutions)\b/i, /\bown(ing)?\s+the\s+(technical|system)\b/i]
  },
  {
    value: 'Junior',
    patterns: [/\bunder\s+(the\s+)?(guidance|supervision|mentorship)\b/i, /\bwe('ll|will)\s+teach\b/i, /\blearning\s+opportunity\b/i, /\bno\s+experience\s+required\b/i, /\bfresh\s+gradu?a/i, /\bnew\s+gradu?a/i, /\brecent\s+gradu?a/i]
  },
  {
    value: 'Entry Level',
    patterns: [/\bno\s+experience\s+(required|necessary|needed)\b/i, /\bentry[\s-]?level\s+welcome\b/i, /\brecent\s+gradu?a/i, /\bnew\s+gradu?a/i, /\bfresh\s+gradu?a/i]
  },
];

function _inferFromResponsibilities(description) {
  if (!description) return null;
  for (const rule of _respRules) {
    if (rule.patterns.some(p => p.test(description))) return rule.value;
  }
  return null;
}

function _inferFromYears(description) {
  if (!description) return null;
  // Match patterns like "3+ years", "2-4 years", "minimum 5 years", "at least 3 years"
  const yrsPattern = /(?:minimum\s+|at\s+least\s+|(\d+)\s*[-–]\s*)?(\d+)\+?\s*years?\s*(?:of\s+)?(?:experience|exp)?/gi;
  const matches = [...description.matchAll(yrsPattern)];
  if (!matches.length) return null;
  // Use the lowest mentioned year count as the baseline requirement
  const nums = matches.map(m => parseInt(m[1] || m[2])).filter(n => !isNaN(n) && n <= 20);
  if (!nums.length) return null;
  const min = Math.min(...nums);
  if (min === 0) return 'Internship';
  if (min <= 2) return 'Junior';
  if (min <= 4) return 'Mid-Level';
  if (min <= 7) return 'Senior';
  if (min <= 10) return 'Lead';
  return 'Staff';
}

function inferSeniority(role, description) {
  // 1. Title keywords — most reliable
  for (const rule of _titleRules) {
    if (rule.patterns.some(p => p.test(role))) return rule.value;
  }
  // 2. L-levels / E-levels in title or description — unambiguous when present
  const fromLevel = _inferFromLevels(role) || _inferFromLevels(description);
  if (fromLevel) return fromLevel;
  // 3. Years of experience — strong signal
  const fromYears = _inferFromYears(description);
  if (fromYears) return fromYears;
  // 4. Responsibility language — mentoring, managing, under guidance, fresh grad etc.
  const fromResp = _inferFromResponsibilities(description);
  if (fromResp) return fromResp;
  // 5. Keyword frequency in description — require ≥2 hits to reduce noise
  if (description) {
    for (const rule of _seniorityRules) {
      const hits = rule.patterns.reduce((n, p) => {
        const m = description.match(new RegExp(p.source, 'gi'));
        return n + (m ? m.length : 0);
      }, 0);
      if (hits >= 2) return rule.value;
    }
  }
  return null;
}

function backfillSeniority() {
  if (typeof state === 'undefined') return;
  let filled = 0;
  state.jobs.forEach(job => {
    if (job.seniority) return;
    const inferred = inferSeniority(job.role || '', job.description || '');
    if (inferred) {
      job.seniority = inferred;
      filled++;
    }
  });
  if (filled > 0) {
    if (typeof save === 'function') save();
    if (typeof toast === 'function') toast(`Seniority inferred for ${filled} existing job${filled !== 1 ? 's' : ''}.`, 'success');
  }
}

function initSeniorityInference() {
  // Wire on the modal-add-job form; re-wires each time the modal opens
  document.addEventListener('click', e => {
    // any button that opens the add/edit form
    if (!e.target.closest('[data-action="add-job"], .job-edit-btn, #topbar-action')) return;
    // wait for form to render
    requestAnimationFrame(() => _wireSeniorityFields());
  });
  // Also wire immediately in case form is already open
  _wireSeniorityFields();
}

function _wireSeniorityFields() {
  const roleInput = document.getElementById('job-role');
  const descInput = document.getElementById('job-description');
  const senSelect = document.getElementById('job-seniority');
  if (!roleInput || !senSelect) return;
  if (roleInput._senWired) return; // already wired this instance
  roleInput._senWired = true;

  const tryInfer = () => {
    if (senSelect.value) return; // user already picked one — don't override
    const inferred = inferSeniority(roleInput.value, descInput ? descInput.value : '');
    if (inferred) {
      senSelect.value = inferred;
      senSelect.title = `Auto-inferred from job title/description — change if needed`;
      senSelect.classList.add('inferred');
    }
  };

  roleInput.addEventListener('blur', tryInfer);
  if (descInput) descInput.addEventListener('blur', tryInfer);

  // Clear the inferred flag when user manually changes the select
  senSelect.addEventListener('change', () => {
    senSelect.classList.remove('inferred');
    senSelect.title = '';
  });
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   WEEKLY RECAP
   ══════════════════════════════════════════════════════════ */
function maybeShowWeeklyRecap() {
  const now = new Date();
  if (now.getDay() !== 1) return; // only Monday
  const key = 'pt-recap-shown';
  const lastShown = localStorage.getItem(key);
  const todayStr = now.toLocaleDateString('en-CA');
  if (lastShown === todayStr) return;

  // Build last-week stats
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now);
  weekEnd.setHours(0, 0, 0, 0);

  const jobs = state.jobs || [];
  const applied = jobs.filter(j => {
    const d = new Date(j.dateAdded);
    return d >= weekStart && d < weekEnd;
  });
  const advanced = jobs.filter(j => {
    const d = new Date(j.dateAdded);
    const inStage = ['screening', 'interview', 'offer'].includes(j.stage);
    return d >= weekStart && d < weekEnd && inStage;
  });
  const scored = applied.filter(j => j.fitScore != null);
  const avgFit = scored.length ? Math.round(scored.reduce((s, j) => s + j.fitScore, 0) / scored.length) : null;
  const topStage = (() => {
    const counts = {};
    applied.forEach(j => {
      counts[j.stage] = (counts[j.stage] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : null;
  })();

  if (applied.length === 0) return; // nothing to recap

  const body = document.getElementById('weekly-recap-body');
  if (!body) return;

  body.innerHTML = `
    <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">Here's what happened last week:</p>
    <div class="recap-stats">
      <div class="recap-stat"><span class="recap-stat-num">${applied.length}</span><span class="recap-stat-label">Jobs added</span></div>
      ${avgFit != null ? `<div class="recap-stat"><span class="recap-stat-num">${avgFit}%</span><span class="recap-stat-label">Avg fit score</span></div>` : ''}
      ${advanced.length ? `<div class="recap-stat"><span class="recap-stat-num">${advanced.length}</span><span class="recap-stat-label">In pipeline</span></div>` : ''}
    </div>
    ${topStage ? `<p style="font-size:12px;color:var(--text-muted);margin-top:14px">Most common stage: <strong style="color:var(--text)">${topStage}</strong></p>` : ''}
    <p style="font-size:12px;color:var(--text-muted);margin-top:6px">Keep the momentum going this week! 💪</p>
  `;

  localStorage.setItem(key, todayStr);
  setTimeout(() => openModal('modal-weekly-recap'), 1200);
}

function initUXEnhancements() {
  initCommandPalette();
  initKeyboardShortcuts();
  initBackToTop();
  setTimeout(maybeShowWeeklyRecap, 1500);
  initFitTooltip();
  initCardPreview();
  initColorBlindMode();
  initSeniorityInference();
  backfillSeniority();
  updateGettingStarted();

  // Track learning hub visit for checklist
  document.querySelectorAll('[data-view="learning"]').forEach(el => {
    el.addEventListener('click', () => {
      localStorage.setItem('pt-visited-learning', '1');
      setTimeout(updateGettingStarted, 100);
    });
  });
}
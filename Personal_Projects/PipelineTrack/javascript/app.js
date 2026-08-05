'use strict';

/* ══════════════════════════════════════════════════════════
   EVENT WIRING
   ══════════════════════════════════════════════════════════ */
function wireEvents() {
  // Nav links
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(a.dataset.view);
    });
  });

  // Topbar action (context-sensitive)
  document.getElementById('topbar-action').addEventListener('click', () => {
    const action = document.getElementById('topbar-action').dataset.action;
    if (action === 'add-contact') openContactModal();
    else if (action === 'add-goal') openGoalModal();
    else openAddJobModal();
  });

  // Theme toggle
  document.getElementById('theme-toggle-btn').addEventListener('click', e => toggleTheme(e.currentTarget));
  document.getElementById('btn-theme-motion')?.addEventListener('click', toggleThemeMotion);

  // Theme swatches
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.addEventListener('click', () => setTheme(s.dataset.theme, {
      sourceEl: s
    }));
  });

  // Close modals via [data-close]
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.close === 'modal-detail') dayModalContext = null;
      if (btn.dataset.close === 'modal-stale-ghost') snoozeGhostPrompt();
      closeModal(btn.dataset.close);
    });
  });

  // Close modal on a deliberate backdrop hold, which prevents accidental outside-click closes.
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    let closeHoldTimer = null;
    let closeHoldPointerId = null;
    const holdMs = 900;

    function cancelBackdropHold() {
      if (closeHoldTimer) clearTimeout(closeHoldTimer);
      closeHoldTimer = null;
      closeHoldPointerId = null;
      overlay.classList.remove('hold-to-close');
    }

    function closeFromBackdropHold() {
      cancelBackdropHold();
      if (overlay.id === 'modal-detail') dayModalContext = null;
      if (overlay.id === 'modal-stale-ghost') snoozeGhostPrompt();
      closeModal(overlay.id);
    }

    overlay.addEventListener('pointerdown', e => {
      if (e.target !== overlay || e.button > 0) return;
      closeHoldPointerId = e.pointerId;
      overlay.classList.add('hold-to-close');
      closeHoldTimer = setTimeout(closeFromBackdropHold, holdMs);
    });
    overlay.addEventListener('pointerup', e => {
      if (e.pointerId === closeHoldPointerId) cancelBackdropHold();
    });
    overlay.addEventListener('pointercancel', cancelBackdropHold);
    overlay.addEventListener('pointerleave', e => {
      if (e.pointerId === closeHoldPointerId) cancelBackdropHold();
    });
  });

  // Job modal tab switching
  document.getElementById('job-modal-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.modal-tab-btn');
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll('#job-modal-tabs .modal-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('#modal-job .modal-tab-panel').forEach(p => p.classList.toggle('active', p.dataset.tab === tab));
  });

  // Save job
  document.getElementById('save-job-btn').addEventListener('click', saveJob);
  const jobWorkTypeEl = document.getElementById('job-work-type');
  if (jobWorkTypeEl) {
    jobWorkTypeEl.addEventListener('change', () => {
      if (typeof updateHybridDaysVisibility === 'function') updateHybridDaysVisibility(true);
    });
  }
  const jobTypeEl = document.getElementById('job-type');
  if (jobTypeEl) {
    jobTypeEl.addEventListener('change', () => {
      if (typeof updateJobDurationVisibility === 'function') updateJobDurationVisibility(true);
    });
  }
  const hybridDaysOpenBtn = document.getElementById('job-hybrid-days-open');
  if (hybridDaysOpenBtn) hybridDaysOpenBtn.addEventListener('click', openHybridDaysModal);
  const hybridDaysApplyBtn = document.getElementById('hybrid-days-apply-btn');
  if (hybridDaysApplyBtn) hybridDaysApplyBtn.addEventListener('click', applyHybridDaysModal);
  const hybridDaysClearBtn = document.getElementById('hybrid-days-clear-btn');
  if (hybridDaysClearBtn) hybridDaysClearBtn.addEventListener('click', () => {
    setHybridDaysValue('');
    closeModal('modal-hybrid-days');
  });
  const durationOpenBtn = document.getElementById('job-duration-open');
  if (durationOpenBtn) durationOpenBtn.addEventListener('click', openJobDurationModal);
  const durationApplyBtn = document.getElementById('job-duration-apply-btn');
  if (durationApplyBtn) durationApplyBtn.addEventListener('click', applyJobDurationModal);
  const durationClearBtn = document.getElementById('job-duration-clear-btn');
  if (durationClearBtn) durationClearBtn.addEventListener('click', () => {
    setJobDurationValue('');
    closeModal('modal-job-duration');
  });
  document.querySelectorAll('#job-duration-presets .duration-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      setJobDurationValue(btn.dataset.duration || '');
      closeModal('modal-job-duration');
    });
  });

  // Smart paste panel
  document.getElementById('show-smart-paste-btn').addEventListener('click', () => {
    const panel = document.getElementById('smart-paste-panel');
    panel.classList.add('open');
    document.getElementById('smart-paste-input').focus();
  });
  document.getElementById('smart-paste-cancel').addEventListener('click', () => {
    document.getElementById('smart-paste-panel').classList.remove('open');
    document.getElementById('smart-paste-input').value = '';
    const analysisEl = document.getElementById('smart-paste-analysis');
    if (analysisEl) {
      analysisEl.style.display = 'none';
      analysisEl.innerHTML = '';
    }
  });
  document.getElementById('smart-paste-btn').addEventListener('click', () => {
    const text = document.getElementById('smart-paste-input').value.trim();
    if (!text) return;
    const parsed = parseJobListing(text);
    const analysis = typeof analyzeJobPosting === 'function' ? analyzeJobPosting(text, parsed) : null;

    function addAutoTag(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const group = el.closest('.form-group');
      if (!group) return;
      const label = group.querySelector('.form-label');
      if (!label) return;
      // Remove existing auto tag
      const existing = label.querySelector('.inferred-tag');
      if (existing) existing.remove();
      const tag = document.createElement('span');
      tag.className = 'inferred-tag';
      tag.title = 'Auto-filled from pasted listing';
      tag.textContent = '✦ Auto-filled';
      label.appendChild(tag);
      // Clear tag when user edits
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => tag.remove(), {
        once: true
      });
    }

    const fieldMap = {
      role: 'job-role',
      company: 'job-company',
      location: 'job-location',
      salary: 'job-salary',
      hybridDays: 'job-hybrid-days',
      duration: 'job-duration'
    };
    const selectMap = {
      workType: 'job-work-type',
      jobType: 'job-type',
      seniority: 'job-seniority'
    };

    Object.entries(fieldMap).forEach(([key, id]) => {
      if (parsed[key]) {
        if (key === 'hybridDays' && typeof setHybridDaysValue === 'function') setHybridDaysValue(parsed[key]);
        else if (key === 'duration' && typeof setJobDurationValue === 'function') setJobDurationValue(parsed[key]);
        else if (key === 'salary' && typeof splitSalaryAndPayPeriod === 'function') {
          const salaryParts = splitSalaryAndPayPeriod(parsed[key]);
          document.getElementById(id).value = salaryParts.salary;
          const periodSelect = document.getElementById('job-pay-period');
          if (periodSelect) periodSelect.value = salaryParts.payPeriod;
        } else document.getElementById(id).value = parsed[key];
        flashField(id);
        addAutoTag(id);
      }
    });
    Object.entries(selectMap).forEach(([key, id]) => {
      if (parsed[key]) {
        document.getElementById(id).value = parsed[key];
        flashField(id);
        addAutoTag(id);
      }
    });
    if (typeof updateHybridDaysVisibility === 'function') {
      updateHybridDaysVisibility(false);
    }
    if (typeof updateJobDurationVisibility === 'function') {
      updateJobDurationVisibility(false);
    }

    // Move cleaned description to Job Info tab (metadata header stripped)
    document.getElementById('job-description').value = parsed.description || text;
    if (typeof renderSmartPasteAnalysis === 'function') renderSmartPasteAnalysis(analysis);
    // Collapse the paste panel, but keep the analyzer visible below it.
    document.getElementById('smart-paste-panel').classList.remove('open');
    document.getElementById('smart-paste-input').value = '';
    const filled = Object.entries(parsed).filter(([key, value]) => key !== 'analysis' && value).length;
    toast(`Auto-filled ${filled} field${filled !== 1 ? 's' : ''} — review and add the rest.`, 'success');
  });

  // Add skill
  document.getElementById('add-skill-btn').addEventListener('click', addSkill);
  document.getElementById('skill-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addSkill();
  });

  document.getElementById('bulk-skill-toggle').addEventListener('click', () => {
    const area = document.getElementById('bulk-skill-area');
    const isOpen = area.style.display !== 'none';
    area.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) document.getElementById('bulk-skill-input').focus();
  });
  document.getElementById('bulk-skill-cancel').addEventListener('click', () => {
    document.getElementById('bulk-skill-area').style.display = 'none';
    document.getElementById('bulk-skill-input').value = '';
  });
  document.getElementById('bulk-skill-add').addEventListener('click', bulkAddSkills);

  // Skill level filter pills
  document.querySelectorAll('.skill-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window._skillFilter = btn.dataset.filter;
      window._skillsExpanded = false;
      const container = document.getElementById('skill-tags-container');
      if (container) {
        container.classList.add('skill-filter-exit');
        setTimeout(() => renderSkillTags(), 110);
      } else {
        renderSkillTags();
      }
    });
  });

  // Coverage level filter pills
  document.querySelectorAll('.coverage-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window._coverageFilter = btn.dataset.filter;
      window._coverageExpanded = false;
      renderCoverageBars();
    });
  });

  // Add certification / degree
  document.getElementById('add-cert-btn').addEventListener('click', addCert);
  document.getElementById('cert-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addCert();
  });

  // Save summary
  document.getElementById('save-summary-btn').addEventListener('click', () => {
    state.profile.summary = document.getElementById('profile-summary').value;
    save();
    toast('Summary saved.', 'success');
  });

  // Export / Import / Clear All
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
  document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
  document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (!confirm('Clear all tracked jobs? This cannot be undone.')) return;
    state.jobs = [];
    save();
    toast('All jobs cleared.', '');
    renderView(state.activeView);
  });
  document.getElementById('clear-all-data-btn').addEventListener('click', () => {
    if (!confirm('Delete ALL data — jobs, contacts, goals, events, profile, and skills? This cannot be undone.')) return;
    state.jobs = [];
    state.contacts = [];
    state.goals = [];
    state.events = [];
    state.savedCourses = [];
    state.templates = [];
    state.profile = {
      skills: [],
      certifications: [],
      summary: '',
      links: {
        linkedin: '',
        github: '',
        portfolio: ''
      }
    };
    save();
    toast('All data deleted.', '');
    renderView(state.activeView);
  });
  document.getElementById('import-file-input').addEventListener('change', e => {
    if (e.target.files[0]) {
      importData(e.target.files[0]);
      e.target.value = '';
    }
  });

  // Your Links
  document.getElementById('save-links-btn').addEventListener('click', saveLinks);

  // Show archived toggle
  document.getElementById('show-archived').addEventListener('change', () => renderBoard());

  // Show bookmarked toggle
  document.getElementById('show-bookmarked').addEventListener('change', () => renderLearning());

  // Resume Hub — parse resume
  document.getElementById('parse-resume-btn').addEventListener('click', parseResume);

  // Resume Hub — portfolio/GitHub scan
  document.getElementById('scan-portfolio-btn').addEventListener('click', scanPortfolio);

  // Resume Hub — check writing
  document.getElementById('polish-btn').addEventListener('click', checkWriting);

  // Resume Hub — file upload (browse button)
  const fileInput = document.getElementById('resume-file-input');
  document.getElementById('resume-browse-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleResumeFile(fileInput.files[0]);
    fileInput.value = '';
  });

  // Resume Hub — drag and drop
  const dropZone = document.getElementById('resume-drop-zone');
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleResumeFile(file);
  });

  // Detail modal — save company notes on change
  document.getElementById('detail-company-notes').addEventListener('input', () => {
    const job = state.jobs.find(j => j.id === state.activeJobId);
    if (job) {
      job.companyNotes = document.getElementById('detail-company-notes').value;
      save();
    }
  });

  // Detail modal — save notes on change
  document.getElementById('detail-notes').addEventListener('input', () => {
    const job = state.jobs.find(j => j.id === state.activeJobId);
    if (job) {
      job.notes = document.getElementById('detail-notes').value;
      save();
    }
  });

  // Detail modal — change stage
  document.getElementById('detail-stage-select').addEventListener('change', e => {
    const job = state.jobs.find(j => j.id === state.activeJobId);
    if (job) {
      job.stage = e.target.value;
      if (job.stage === 'declined') job.declinedAt = new Date().toISOString();
      if (job.stage === 'ghosted') job.ghostedAt = new Date().toISOString();
      save();
      const badge = document.getElementById('detail-stage-badge');
      badge.textContent = STAGE_LABELS[job.stage];
      badge.className = `stage-badge stage-${job.stage}`;
      toast('Stage updated.', 'success');
      if (job.stage === 'offer') setTimeout(launchConfetti, 200);
      renderView(state.activeView);
      if (MILESTONE_STAGES.includes(job.stage)) setTimeout(() => openStageMilestoneModal(job, job.stage), 350);
    }
  });

  // Detail modal — edit button
  document.getElementById('detail-edit-btn').addEventListener('click', () => {
    closeModal('modal-detail');
    openAddJobModal(state.activeJobId);
  });

  // Job modal — back button (edit mode only)
  document.getElementById('job-modal-back-btn').addEventListener('click', () => {
    const editId = document.getElementById('job-edit-id').value;
    closeModal('modal-job');
    if (editId) openJobDetail(editId);
  });

  // Detail modal — delete button
  document.getElementById('detail-delete-btn').addEventListener('click', () => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    state.jobs = state.jobs.filter(j => j.id !== state.activeJobId);
    save();
    closeModal('modal-detail');
    toast('Job deleted.', '');
    renderView(state.activeView);
  });

  // Save contact
  document.getElementById('save-contact-btn').addEventListener('click', saveContact);

  // Save goal
  document.getElementById('save-goal-btn').addEventListener('click', saveGoal);

  const staleGhostKeepBtn = document.getElementById('stale-ghost-keep-btn');
  if (staleGhostKeepBtn) staleGhostKeepBtn.addEventListener('click', () => {
    snoozeGhostPrompt();
    closeModal('modal-stale-ghost');
    toast('Okay, kept as Applied for now.');
  });

  const staleGhostConfirmBtn = document.getElementById('stale-ghost-confirm-btn');
  if (staleGhostConfirmBtn) staleGhostConfirmBtn.addEventListener('click', moveStaleJobsToGhosted);

  // Email templates
  const addTplBtn = document.getElementById('add-template-btn');
  if (addTplBtn) addTplBtn.addEventListener('click', addTemplate);
  const tplNameInput = document.getElementById('template-name');
  if (tplNameInput) tplNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTemplate();
  });

  // Job comparison
  const compareBtn = document.getElementById('board-compare-btn');
  if (compareBtn) compareBtn.addEventListener('click', openComparePickerModal);

  const compareSearchInput = document.getElementById('compare-search');
  if (compareSearchInput) compareSearchInput.addEventListener('input', () => {
    _compareSearch = compareSearchInput.value;
    renderComparePicker(_compareSearch);
  });

  const compareGoBtn = document.getElementById('compare-go-btn');
  if (compareGoBtn) compareGoBtn.addEventListener('click', runComparison);

  const compareClearBtn = document.getElementById('compare-clear-btn');
  if (compareClearBtn) compareClearBtn.addEventListener('click', () => {
    const list = document.getElementById('compare-picker-list');
    if (!list) return;
    list.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      cb.checked = false;
      const item = cb.closest('.compare-picker-item');
      if (item) {
        item.classList.remove('selected');
        const check = item.querySelector('.compare-picker-check');
        if (check) check.textContent = '';
      }
    });
    renderComparePicker(document.getElementById('compare-search')?.value || '');
  });

  const compareBackBtn = document.getElementById('compare-back-btn');
  if (compareBackBtn) compareBackBtn.addEventListener('click', () => {
    const resultView = document.getElementById('compare-result-view');
    const pickerView = document.getElementById('compare-picker-view');
    resultView.style.animation = 'compareViewOut 0.2s ease forwards';
    setTimeout(() => {
      resultView.style.display = 'none';
      resultView.style.animation = '';
      pickerView.style.display = '';
      pickerView.classList.add('compare-view-in');
      pickerView.addEventListener('animationend', () => pickerView.classList.remove('compare-view-in'), {
        once: true
      });
      compareBackBtn.style.display = 'none';
    }, 200);
  });

  // Template loader in job modal (cover letter tab)
  const tplLoadBtn = document.getElementById('tpl-load-btn');
  if (tplLoadBtn) tplLoadBtn.addEventListener('click', () => {
    const sel = document.getElementById('tpl-load-select');
    if (!sel || sel.value === '') return;
    const tpl = state.templates[parseInt(sel.value)];
    if (!tpl) return;
    const cl = document.getElementById('job-cover-letter');
    if (cl) {
      cl.value = tpl.body;
      toast(`Template "${tpl.name}" loaded.`, 'success');
    }
  });
  // Also re-populate the template select whenever the modal tab switches to Application
  const jobTabsEl = document.getElementById('job-modal-tabs');
  if (jobTabsEl) {
    jobTabsEl.addEventListener('click', e => {
      const btn = e.target.closest('.modal-tab-btn');
      if (btn && btn.dataset.tab === 'application') {
        const sel = document.getElementById('tpl-load-select');
        if (sel) sel.innerHTML = buildTemplateOptions();
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
const SVG_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const SVG_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

const LIGHT_THEMES = ['light'];
const THEME_MOTION_KEY = 'pt-theme-motion-enabled';
let themeTransitionTimer = null;

function setThemeIcon(theme) {
  document.getElementById('theme-icon').innerHTML = LIGHT_THEMES.includes(theme) ? SVG_MOON : SVG_SUN;
}

function isThemeMotionEnabled() {
  return localStorage.getItem(THEME_MOTION_KEY) !== '0';
}

function syncThemeMotionButton() {
  const enabled = isThemeMotionEnabled();
  const button = document.getElementById('btn-theme-motion');
  document.documentElement.classList.toggle('theme-motion-off', !enabled);
  if (!button) return;
  button.classList.toggle('active', enabled);
  button.setAttribute('aria-pressed', String(enabled));
  button.title = enabled ? 'Theme animation on' : 'Theme animation off';
}

function toggleThemeMotion() {
  const enabled = !isThemeMotionEnabled();
  localStorage.setItem(THEME_MOTION_KEY, enabled ? '1' : '0');
  syncThemeMotionButton();
  toast(`Theme animation ${enabled ? 'on' : 'off'}.`);
}

function playThemeTransition(sourceEl) {
  if (!isThemeMotionEnabled() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  root.classList.remove('theme-shift');
  void root.offsetWidth;
  root.classList.add('theme-shift');

  if (sourceEl) {
    sourceEl.classList.remove('theme-shift-pop');
    void sourceEl.offsetWidth;
    sourceEl.classList.add('theme-shift-pop');
    sourceEl.addEventListener('animationend', () => sourceEl.classList.remove('theme-shift-pop'), {
      once: true
    });
  }

  if (themeTransitionTimer) clearTimeout(themeTransitionTimer);
  themeTransitionTimer = setTimeout(() => {
    root.classList.remove('theme-shift');
    themeTransitionTimer = null;
  }, 720);
}

function setTheme(theme, options = {}) {
  const previousTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const shouldAnimate = options.animate !== false && previousTheme !== theme;
  document.documentElement.setAttribute('data-theme', theme);
  setThemeIcon(theme);
  localStorage.setItem('pt-theme', theme);
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('theme-swatch--active', s.dataset.theme === theme);
  });
  if (shouldAnimate) playThemeTransition(options.sourceEl);
}

function initTheme() {
  const saved = localStorage.getItem('pt-theme') || 'dark';
  setTheme(saved, {
    animate: false
  });
}

function toggleTheme(sourceEl) {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next, {
    sourceEl
  });
}

/* ══════════════════════════════════════════════════════════
   STALE APPLICATION CHECK
   ══════════════════════════════════════════════════════════ */
const GHOST_PROMPT_DAYS = 90;
const GHOST_PROMPT_SNOOZE_DAYS = 7;
const GHOST_PROMPT_SNOOZE_KEY = 'pt_ghost_prompt_snoozed_until';

function getApplicationDate(job) {
  const raw = job.dateApplied || job.dateAdded;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getStaleAppliedJobs() {
  const cutoff = Date.now() - GHOST_PROMPT_DAYS * 86400000;
  return state.jobs.filter(job => {
    if (job.stage !== 'applied') return false;
    const applicationDate = getApplicationDate(job);
    return applicationDate && applicationDate.getTime() <= cutoff;
  });
}

function maybePromptForGhostedJobs() {
  const snoozedUntil = localStorage.getItem(GHOST_PROMPT_SNOOZE_KEY);
  if (snoozedUntil && new Date(snoozedUntil).getTime() > Date.now()) return;

  const staleJobs = getStaleAppliedJobs();
  if (staleJobs.length === 0) return;

  openStaleGhostModal(staleJobs);
}

function snoozeGhostPrompt() {
  const snoozedUntilDate = new Date(Date.now() + GHOST_PROMPT_SNOOZE_DAYS * 86400000).toISOString();
  localStorage.setItem(GHOST_PROMPT_SNOOZE_KEY, snoozedUntilDate);
}

function openStaleGhostModal(staleJobs) {
  const countEl = document.getElementById('stale-ghost-count');
  const listEl = document.getElementById('stale-ghost-list');
  const confirmBtn = document.getElementById('stale-ghost-confirm-btn');
  if (!countEl || !listEl || !confirmBtn) return;

  countEl.textContent = `${staleJobs.length} applied job${staleJobs.length !== 1 ? 's' : ''} have been waiting ${GHOST_PROMPT_DAYS}+ days with no stage change.`;
  confirmBtn.textContent = `Move ${staleJobs.length === 1 ? 'Job' : staleJobs.length + ' Jobs'} to Ghosted`;

  listEl.innerHTML = staleJobs.map(job => {
    const applicationDate = getApplicationDate(job);
    const ageDays = applicationDate ? Math.floor((Date.now() - applicationDate.getTime()) / 86400000) : null;
    return `<div class="stale-ghost-job">
      <div class="stale-ghost-job-main">
        <div class="stale-ghost-role">${escHtml(job.role || 'Untitled role')}</div>
        <div class="stale-ghost-company">${escHtml(job.company || 'Unknown company')}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
      </div>
      <div class="stale-ghost-age">${ageDays ? ageDays + 'd' : GHOST_PROMPT_DAYS + '+d'}</div>
    </div>`;
  }).join('');

  openModal('modal-stale-ghost');
}

function moveStaleJobsToGhosted() {
  const staleJobs = getStaleAppliedJobs();
  if (staleJobs.length === 0) {
    closeModal('modal-stale-ghost');
    return;
  }

  const now = new Date().toISOString();
  staleJobs.forEach(job => {
    job.stage = 'ghosted';
    job.ghostedAt = now;
  });
  localStorage.removeItem(GHOST_PROMPT_SNOOZE_KEY);
  save();
  closeModal('modal-stale-ghost');
  renderView(state.activeView);
  toast(`${staleJobs.length} job${staleJobs.length !== 1 ? 's' : ''} moved to Ghosted.`, 'success');
}

// Cleans up pasted text: normalises line endings, strips trailing spaces
// per line, and collapses more than 2 consecutive blank lines to 2.
function cleanPastedText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wirePasteCleaners() {
  const ids = [
    'job-description', 'job-cover-letter', 'job-notes',
    'job-benefits', 'job-company-notes',
    'detail-notes', 'detail-company-notes',
    'resume-text', 'polish-text',
    'contact-notes', 'event-notes', 'profile-summary',
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('paste', e => {
      e.preventDefault();
      const raw = (e.clipboardData || window.clipboardData).getData('text');
      const cleaned = cleanPastedText(raw);
      const start = el.selectionStart;
      const end = el.selectionEnd;
      el.value = el.value.slice(0, start) + cleaned + el.value.slice(end);
      el.selectionStart = el.selectionEnd = start + cleaned.length;
      el.dispatchEvent(new Event('input', {
        bubbles: true
      }));
    });
  });
}

function init() {
  syncThemeMotionButton();
  initTheme();
  load();
  reanalyzeAllJobs();
  wireEvents();
  wirePasteCleaners();
  navigate('dashboard');
  setTimeout(maybePromptForGhostedJobs, 350);
  if (typeof initUXEnhancements === 'function') initUXEnhancements();
  if (typeof initBulkActions === 'function') initBulkActions();
}

document.addEventListener('DOMContentLoaded', init);

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
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

  // Close modals via [data-close]
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.close === 'modal-detail') dayModalContext = null;
      closeModal(btn.dataset.close);
    });
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        if (overlay.id === 'modal-detail') dayModalContext = null;
        closeModal(overlay.id);
      }
    });
  });

  // Save job
  document.getElementById('save-job-btn').addEventListener('click', saveJob);

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
      renderSkillTags();
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
  document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
  document.getElementById('clear-all-btn').addEventListener('click', () => {
    if (!confirm('Clear all tracked jobs? This cannot be undone.')) return;
    state.jobs = [];
    save();
    toast('All jobs cleared.', '');
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
      save();
      const badge = document.getElementById('detail-stage-badge');
      badge.textContent = STAGE_LABELS[job.stage];
      badge.className = `stage-badge stage-${job.stage}`;
      toast('Stage updated.', 'success');
      renderView(state.activeView);
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
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
const SVG_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const SVG_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function setThemeIcon(theme) {
  document.getElementById('theme-icon').innerHTML = theme === 'light' ? SVG_MOON : SVG_SUN;
}

function initTheme() {
  const saved = localStorage.getItem('pt-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  setThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  setThemeIcon(next);
  localStorage.setItem('pt-theme', next);
}

function init() {
  initTheme();
  load();
  reanalyzeAllJobs();
  wireEvents();
  navigate('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
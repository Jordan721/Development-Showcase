'use strict';

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */
const STAGES = ['saved', 'applied', 'screening', 'interview', 'offer', 'declined', 'archived'];
let boardPeriod = 'all';
let boardLayout = localStorage.getItem('pt-board-layout') || 'swimlane';
let boardSearch = '';
let boardFilterStage = '';
let boardFilterWorkType = '';
let boardFilterSeniority = '';
let boardSortTable = 'date-desc';
const STAGE_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  declined: 'Declined',
  archived: 'Archived'
};

let state = {
  jobs: [],
  profile: {
    skills: [],
    certifications: [],
    summary: '',
    links: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  },
  savedCourses: [],
  contacts: [],
  goals: [],
  activeView: 'dashboard',
  activeJobId: null,
};

/* ══════════════════════════════════════════════════════════
   LOCALSTORAGE
   ══════════════════════════════════════════════════════════ */
function save() {
  localStorage.setItem('pt_jobs', JSON.stringify(state.jobs));
  localStorage.setItem('pt_profile', JSON.stringify(state.profile));
  localStorage.setItem('pt_saved_courses', JSON.stringify(state.savedCourses));
  localStorage.setItem('pt_contacts', JSON.stringify(state.contacts));
  localStorage.setItem('pt_goals', JSON.stringify(state.goals));
}

function load() {
  try {
    state.jobs = JSON.parse(localStorage.getItem('pt_jobs')) || [];
  } catch {
    state.jobs = [];
  }
  try {
    state.profile = JSON.parse(localStorage.getItem('pt_profile')) || {
      skills: [],
      certifications: [],
      summary: ''
    };
    // backfill for existing saved data
    if (!state.profile.certifications) state.profile.certifications = [];
    if (!state.profile.links) state.profile.links = {
      linkedin: '',
      github: '',
      portfolio: ''
    };
  } catch {
    state.profile = {
      skills: [],
      certifications: [],
      summary: ''
    };
  }
  try {
    state.savedCourses = JSON.parse(localStorage.getItem('pt_saved_courses')) || [];
  } catch {
    state.savedCourses = [];
  }
  try {
    state.contacts = JSON.parse(localStorage.getItem('pt_contacts')) || [];
  } catch {
    state.contacts = [];
  }
  try {
    state.goals = JSON.parse(localStorage.getItem('pt_goals')) || [];
  } catch {
    state.goals = [];
  }
}

/* ══════════════════════════════════════════════════════════
   EXPORT / IMPORT
   ══════════════════════════════════════════════════════════ */
function exportData() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    jobs: state.jobs,
    profile: state.profile,
    savedCourses: state.savedCourses,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = 'pipelinetrack-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup downloaded.', 'success');
  const statusEl = document.getElementById('backup-status');
  if (statusEl) {
    statusEl.textContent = '⬇ Exported: ' + filename;
    statusEl.className = 'import-status success';
  }
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const statusEl = document.getElementById('backup-status');
      if (!Array.isArray(data.jobs) || typeof data.profile !== 'object') {
        if (statusEl) {
          statusEl.textContent = '✕ Invalid backup file — make sure you\'re using a PipelineTrack export.';
          statusEl.className = 'import-status error';
        }
        return;
      }
      state.jobs = data.jobs;
      state.profile = data.profile;
      if (!state.profile.certifications) state.profile.certifications = [];
      state.savedCourses = Array.isArray(data.savedCourses) ? data.savedCourses : [];
      save();
      reanalyzeAllJobs();
      renderView(state.activeView);
      // Re-query after renderView since it rebuilds the DOM
      const freshStatusEl = document.getElementById('backup-status');
      if (freshStatusEl) {
        const count = state.jobs.length;
        freshStatusEl.textContent = '⬆ Imported: ' + file.name + ' — ' + count + ' job' + (count !== 1 ? 's' : '');
        freshStatusEl.className = 'import-status success';
      }
      toast('Backup imported successfully.', 'success');
    } catch {
      const statusEl = document.getElementById('backup-status');
      if (statusEl) {
        statusEl.textContent = '✕ Could not read file. Make sure it\'s a valid .json backup.';
        statusEl.className = 'import-status error';
      }
    }
  };
  reader.readAsText(file);
}


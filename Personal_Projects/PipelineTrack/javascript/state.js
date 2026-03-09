'use strict';

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */
const STAGES = ['saved', 'applied', 'screening', 'interview', 'offer', 'declined', 'ghosted', 'archived'];
let boardPeriod = 'all';
let boardLayout = localStorage.getItem('pt-board-layout') || 'swimlane';
let boardSearch = '';
let boardFilterStage = '';
let boardFilterWorkType = '';
let boardFilterSeniority = '';
let boardSortTable = 'date-desc';
const STAGE_EMOJIS = {
  saved: '🔖',
  applied: '📨',
  screening: '📞',
  interview: '🤝',
  offer: '🎉',
  declined: '❌',
  ghosted: '👻',
  archived: '📦',
};

const STAGE_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  declined: 'Declined',
  ghosted: 'Ghosted',
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
  events: [],
  templates: [],
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
  localStorage.setItem('pt_events', JSON.stringify(state.events));
  localStorage.setItem('pt_templates', JSON.stringify(state.templates));
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
  try {
    state.events = JSON.parse(localStorage.getItem('pt_events')) || [];
  } catch {
    state.events = [];
  }
  try {
    state.templates = JSON.parse(localStorage.getItem('pt_templates')) || [];
  } catch {
    state.templates = [];
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
    events: state.events,
    templates: state.templates,
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

function exportCSV() {
  const csvCell = v => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  const headers = [
    'Role', 'Company', 'Location', 'Stage', 'Seniority', 'Job Type', 'Work Type',
    'Department', 'Salary', 'Date Posted', 'Date Applied', 'Date Added', 'Deadline', 'Fit Score (%)',
    'Matched Skills', 'Skill Gaps', 'URL', 'Notes', 'Company Notes', 'Benefits', 'Cover Letter', 'Job Description'
  ];

  const rows = state.jobs.map(j => [
    j.role,
    j.company,
    j.location,
    STAGE_LABELS[j.stage] || j.stage,
    j.seniority,
    j.jobType,
    j.workType,
    j.department,
    j.salary,
    j.datePosted,
    j.dateApplied || '',
    j.dateAdded ? j.dateAdded.slice(0, 10) : '',
    j.deadline || '',
    j.fitScore !== null && j.fitScore !== undefined ? j.fitScore : '',
    (j.matched || []).join('; '),
    (j.missing || []).join('; '),
    j.url,
    j.notes,
    j.companyNotes,
    j.benefits,
    j.coverLetter,
    j.description,
  ].map(csvCell).join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = 'pipelinetrack-jobs-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV downloaded.', 'success');
  const statusEl = document.getElementById('backup-status');
  if (statusEl) {
    statusEl.textContent = '⬇ Exported: ' + filename + ' (' + state.jobs.length + ' jobs)';
    statusEl.className = 'import-status success';
  }
}

// Parses a full CSV string into an array of field arrays,
// correctly handling quoted fields that contain commas and newlines.
function _parseCSV(text) {
  const rows = [];
  let field = '';
  let fields = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(field);
        field = '';
      } else if (ch === '\r' && next === '\n') {
        fields.push(field);
        field = '';
        rows.push(fields);
        fields = [];
        i++; // skip \n
      } else if (ch === '\n') {
        fields.push(field);
        field = '';
        rows.push(fields);
        fields = [];
      } else {
        field += ch;
      }
    }
  }
  // push last field/row
  fields.push(field);
  if (fields.some(f => f !== '')) rows.push(fields);

  return rows;
}

function _importFromCSV(text) {
  const rows = _parseCSV(text);
  if (rows.length < 2) throw new Error('Empty CSV');

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const idx = name => headers.indexOf(name.toLowerCase());
  const get = (fields, col) => (fields[idx(col)] !== undefined ? fields[idx(col)].trim() : '');

  const stageLabelToKey = {};
  Object.entries(STAGE_LABELS).forEach(([k, v]) => {
    stageLabelToKey[v.toLowerCase()] = k;
  });

  // Replace existing jobs rather than appending
  state.jobs = [];

  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const f = rows[i];
    const role = get(f, 'role');
    const company = get(f, 'company');
    if (!role && !company) continue;

    const stageRaw = get(f, 'stage').toLowerCase();
    const fitRaw = get(f, 'fit score (%)');
    const fitScore = fitRaw !== '' && !isNaN(parseInt(fitRaw)) ? parseInt(fitRaw) : null;

    state.jobs.push({
      id: 'j' + Date.now() + Math.random().toString(36).slice(2, 6),
      role,
      company,
      location: get(f, 'location'),
      stage: stageLabelToKey[stageRaw] || 'saved',
      seniority: get(f, 'seniority'),
      jobType: get(f, 'job type'),
      workType: get(f, 'work type'),
      department: get(f, 'department'),
      salary: get(f, 'salary'),
      datePosted: get(f, 'date posted'),
      dateAdded: get(f, 'date added') || new Date().toISOString().slice(0, 10),
      fitScore,
      matched: get(f, 'matched skills') ? get(f, 'matched skills').split(';').map(s => s.trim()).filter(Boolean) : [],
      missing: get(f, 'skill gaps') ? get(f, 'skill gaps').split(';').map(s => s.trim()).filter(Boolean) : [],
      url: get(f, 'url'),
      notes: get(f, 'notes'),
      companyNotes: get(f, 'company notes'),
      benefits: get(f, 'benefits'),
      coverLetter: get(f, 'cover letter'),
      description: get(f, 'job description'),
      deadline: get(f, 'deadline'),
    });
    count++;
  }
  return count;
}

function importData(file) {
  const isCSV = file.name.toLowerCase().endsWith('.csv');
  const reader = new FileReader();
  reader.onload = e => {
    const statusEl = document.getElementById('backup-status');
    try {
      if (isCSV) {
        const count = _importFromCSV(e.target.result);
        save();
        renderView(state.activeView);
        const freshStatusEl = document.getElementById('backup-status');
        if (freshStatusEl) {
          freshStatusEl.textContent = '⬆ Imported: ' + file.name + ' — ' + count + ' job' + (count !== 1 ? 's' : '') + ' replaced. Note: CSV only restores jobs. Use a JSON backup to restore skills, contacts, goals, and events.';
          freshStatusEl.className = 'import-status success';
        }
        toast(count + ' job' + (count !== 1 ? 's' : '') + ' imported from CSV. Skills/contacts not included — use JSON backup for full restore.', 'success');
      } else {
        const data = JSON.parse(e.target.result);
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
        state.events = Array.isArray(data.events) ? data.events : [];
        state.templates = Array.isArray(data.templates) ? data.templates : [];
        save();
        reanalyzeAllJobs();
        renderView(state.activeView);
        const freshStatusEl = document.getElementById('backup-status');
        if (freshStatusEl) {
          const count = state.jobs.length;
          freshStatusEl.textContent = '⬆ Imported: ' + file.name + ' — ' + count + ' job' + (count !== 1 ? 's' : '');
          freshStatusEl.className = 'import-status success';
        }
        toast('Backup imported successfully.', 'success');
      }
    } catch {
      if (statusEl) {
        statusEl.textContent = isCSV ?
          '✕ Could not read CSV. Make sure it\'s a PipelineTrack CSV export.' :
          '✕ Could not read file. Make sure it\'s a valid .json backup.';
        statusEl.className = 'import-status error';
      }
    }
  };
  reader.readAsText(file);
}
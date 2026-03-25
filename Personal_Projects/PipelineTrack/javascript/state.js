'use strict';

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */
const STAGES = ['saved', 'applied', 'screening', 'interview', 'offer', 'declined', 'withdrew', 'ghosted', 'archived'];
let boardPeriod = 'all';
let boardLayout = (() => {
  const v = localStorage.getItem('pt-board-layout');
  return (v && v !== 'swimlane') ? v : 'matrix';
})();
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
  withdrew: '🚫',
  ghosted: '👻',
  archived: '📦',
};

const STAGE_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  declined: 'Not Selected',
  withdrew: 'Declined',
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
  resumes: [],
  coverLetters: [],
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
  localStorage.setItem('pt_resumes', JSON.stringify(state.resumes));
  localStorage.setItem('pt_cover_letters', JSON.stringify(state.coverLetters));
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
    if (state.profile.skills && typeof normalizeSkillName === 'function') {
      state.profile.skills = state.profile.skills.map(s => ({
        ...s,
        name: normalizeSkillName(s.name)
      }));
    }
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
  try {
    state.resumes = JSON.parse(localStorage.getItem('pt_resumes')) || [];
  } catch {
    state.resumes = [];
  }
  try {
    state.coverLetters = JSON.parse(localStorage.getItem('pt_cover_letters')) || [];
  } catch {
    state.coverLetters = [];
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
    contacts: state.contacts,
    goals: state.goals,
    events: state.events,
    templates: state.templates,
    resumes: state.resumes,
    coverLetters: state.coverLetters,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = 'pipelinetrack-backup-' + new Date().toLocaleDateString('en-CA') + '.json';
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
  const filename = 'pipelinetrack-jobs-' + new Date().toLocaleDateString('en-CA') + '.csv';
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

  // Merge: match by role+company, update existing or add new. Keep jobs not in the file.
  const jobKey = j => (j.role + '|' + j.company).toLowerCase();
  const currentByKey = {};
  state.jobs.forEach((j, i) => {
    currentByKey[jobKey(j)] = i;
  });

  let added = 0,
    updated = 0;
  for (let i = 1; i < rows.length; i++) {
    const f = rows[i];
    const role = get(f, 'role');
    const company = get(f, 'company');
    if (!role && !company) continue;

    const stageRaw = get(f, 'stage').toLowerCase();
    const fitRaw = get(f, 'fit score (%)');
    const fitScore = fitRaw !== '' && !isNaN(parseInt(fitRaw)) ? parseInt(fitRaw) : null;

    const rowKey = (role + '|' + company).toLowerCase();
    const existingIdx = currentByKey[rowKey];

    const csvDept = get(f, 'department');
    const csvWorkType = get(f, 'work type');
    const csvDesc = get(f, 'job description');
    const inferredDept = !csvDept ? inferDepartment(role, csvDesc) : null;
    const inferredWorkType = !csvWorkType ? inferWorkType(csvDesc) : null;

    const jobData = {
      role,
      company,
      location: get(f, 'location'),
      stage: stageLabelToKey[stageRaw] || 'saved',
      seniority: get(f, 'seniority'),
      jobType: get(f, 'job type'),
      workType: csvWorkType || inferredWorkType || '',
      workTypeInferred: !csvWorkType && !!inferredWorkType,
      department: csvDept || inferredDept || '',
      departmentInferred: !csvDept && !!inferredDept,
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
      description: csvDesc,
      deadline: get(f, 'deadline'),
    };

    if (existingIdx !== undefined) {
      state.jobs[existingIdx] = {
        ...state.jobs[existingIdx],
        ...jobData
      };
      updated++;
    } else {
      state.jobs.push({
        id: 'j' + Date.now() + Math.random().toString(36).slice(2, 6),
        ...jobData
      });
      added++;
    }
  }
  return {
    added,
    updated
  };
}

function importData(file) {
  const isCSV = file.name.toLowerCase().endsWith('.csv');
  const reader = new FileReader();
  reader.onload = e => {
    const statusEl = document.getElementById('backup-status');
    try {
      if (isCSV) {
        const {
          added,
          updated
        } = _importFromCSV(e.target.result);
        save();
        if (typeof backfillSeniority === 'function') backfillSeniority();
        renderView(state.activeView);
        const freshStatusEl = document.getElementById('backup-status');
        if (freshStatusEl) {
          freshStatusEl.textContent = `⬆ Imported: ${file.name} — ${added} added, ${updated} updated. New jobs not in the file were kept. Note: CSV only merges jobs — use JSON backup to restore skills, contacts, goals, and events.`;
          freshStatusEl.className = 'import-status success';
        }
        toast(`CSV merged: ${added} added, ${updated} updated. Your new jobs were kept.`, 'success');
      } else {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.jobs) || typeof data.profile !== 'object') {
          if (statusEl) {
            statusEl.textContent = '✕ Invalid backup file — make sure you\'re using a PipelineTrack export.';
            statusEl.className = 'import-status error';
          }
          return;
        }
        // Merge jobs by ID: update existing, add new, keep current-only jobs
        const currentById = {};
        state.jobs.forEach((j, i) => {
          currentById[j.id] = i;
        });
        let added = 0,
          updated = 0;
        data.jobs.forEach(importedJob => {
          if (currentById[importedJob.id] !== undefined) {
            state.jobs[currentById[importedJob.id]] = importedJob;
            updated++;
          } else {
            state.jobs.push(importedJob);
            added++;
          }
        });
        // Merge contacts, events, templates by ID
        const mergeById = (current, incoming) => {
          if (!Array.isArray(incoming)) return current;
          const map = {};
          current.forEach((item, i) => {
            if (item.id) map[item.id] = i;
          });
          incoming.forEach(item => {
            if (item.id && map[item.id] !== undefined) {
              current[map[item.id]] = item;
            } else {
              current.push(item);
            }
          });
          return current;
        };
        // Merge profile: add imported skills/certs that don't already exist; only overwrite text fields if non-empty
        if (data.profile && typeof data.profile === 'object') {
          const imp = data.profile;
          // Skills: merge by lowercased name
          if (Array.isArray(imp.skills)) {
            const existing = new Set((state.profile.skills || []).map(s => s.name.toLowerCase()));
            imp.skills.forEach(s => {
              if (s && s.name && !existing.has(s.name.toLowerCase())) state.profile.skills.push(s);
            });
          }
          // Certifications: merge by lowercased name
          if (Array.isArray(imp.certifications)) {
            const existing = new Set((state.profile.certifications || []).map(c => c.name.toLowerCase()));
            imp.certifications.forEach(c => {
              if (c && c.name && !existing.has(c.name.toLowerCase())) state.profile.certifications.push(c);
            });
          }
          // Text fields: only overwrite if current is blank and imported has a value
          if (!state.profile.summary && imp.summary) state.profile.summary = imp.summary;
          if (imp.name && !state.profile.name) state.profile.name = imp.name;
          // Links: overwrite each key only if currently blank
          if (imp.links) {
            if (!state.profile.links) state.profile.links = {
              linkedin: '',
              github: '',
              portfolio: ''
            };
            ['linkedin', 'github', 'portfolio'].forEach(k => {
              if (!state.profile.links[k] && imp.links[k]) state.profile.links[k] = imp.links[k];
            });
          }
        }
        state.contacts = mergeById(state.contacts, data.contacts);
        state.goals = mergeById(state.goals, data.goals);
        state.events = mergeById(state.events, data.events);
        state.templates = mergeById(state.templates, data.templates);
        state.resumes = mergeById(state.resumes, data.resumes);
        state.coverLetters = mergeById(state.coverLetters, data.coverLetters || []);
        if (Array.isArray(data.savedCourses)) {
          const courseSet = new Set(state.savedCourses);
          data.savedCourses.forEach(c => courseSet.add(c));
          state.savedCourses = [...courseSet];
        }
        save();
        reanalyzeAllJobs();
        if (typeof backfillSeniority === 'function') backfillSeniority();
        renderView(state.activeView);
        const freshStatusEl = document.getElementById('backup-status');
        if (freshStatusEl) {
          freshStatusEl.textContent = `⬆ Imported: ${file.name} — ${added} added, ${updated} updated. Your new jobs were kept.`;
          freshStatusEl.className = 'import-status success';
        }
        toast(`Backup merged: ${added} added, ${updated} updated. Your new jobs were kept.`, 'success');
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
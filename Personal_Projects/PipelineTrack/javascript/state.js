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
let matrixFitThreshold = Number(localStorage.getItem('pt-matrix-fit-threshold')) || 70;
let matrixUrgencyDays = Number(localStorage.getItem('pt-matrix-urgency-days')) || 14;
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

function migrateJobSalaryPayPeriods() {
  if (typeof splitSalaryAndPayPeriod !== 'function' || typeof formatSalaryWithPayPeriod !== 'function') return false;

  let changed = false;
  state.jobs = state.jobs.map(job => {
    if (!job || !job.salary) return job;
    const salaryParts = splitSalaryAndPayPeriod(job.salary);
    if (!salaryParts.payPeriodInferred) return job;

    const formattedSalary = formatSalaryWithPayPeriod(salaryParts.salary, salaryParts.payPeriod);
    if (!formattedSalary || formattedSalary === job.salary) return job;

    changed = true;
    return {
      ...job,
      salary: formattedSalary,
      salaryPayPeriodInferred: true
    };
  });

  return changed;
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

  state.jobs = (Array.isArray(state.jobs) ? state.jobs : []).map(_normalizeJob);
  const migratedSalaryPayPeriods = migrateJobSalaryPayPeriods();
  state.profile = _normalizeProfile(state.profile);
  state.contacts = _normalizeEntityArray(state.contacts);
  state.goals = _normalizeEntityArray(state.goals);
  state.events = _normalizeEntityArray(state.events);
  state.templates = _normalizeEntityArray(state.templates);
  state.resumes = _normalizeEntityArray(state.resumes);
  state.coverLetters = _normalizeEntityArray(state.coverLetters);
  state.savedCourses = Array.isArray(state.savedCourses) ? state.savedCourses : [];
  if (migratedSalaryPayPeriods) save();
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
    'Role', 'Company', 'Location', 'Stage', 'Seniority', 'Job Type', 'Duration', 'Work Type', 'In-office Days',
    'Department', 'Salary', 'Date Posted', 'Date Applied', 'Date Added', 'Deadline', 'Fit Score (%)',
    'Role Profile', 'Job Fit Score (%)', 'Posting Quality Score (%)', 'Red Flags', 'Matched Skills', 'Skill Gaps', 'URL', 'Notes', 'Company Notes', 'Benefits', 'Cover Letter', 'Job Description'
  ];

  const rows = state.jobs.map(j => [
    j.role,
    j.company,
    j.location,
    STAGE_LABELS[j.stage] || j.stage,
    j.seniority,
    j.jobType,
    j.duration,
    j.workType,
    j.hybridDays,
    j.department,
    j.salary,
    j.datePosted,
    j.dateApplied || '',
    j.dateAdded ? j.dateAdded.slice(0, 10) : '',
    j.deadline || '',
    j.fitScore !== null && j.fitScore !== undefined ? j.fitScore : '',
    j.roleProfile || '',
    j.jobFitScore !== null && j.jobFitScore !== undefined ? j.jobFitScore : '',
    j.jobQualityScore !== null && j.jobQualityScore !== undefined ? j.jobQualityScore : '',
    (j.redFlags || []).join('; '),
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
    const jobFitRaw = get(f, 'job fit score (%)');
    const qualityRaw = get(f, 'posting quality score (%)');

    const rowKey = (role + '|' + company).toLowerCase();
    const existingIdx = currentByKey[rowKey];

    const csvDept = get(f, 'department');
    const csvWorkType = get(f, 'work type');
    const csvHybridDays = get(f, 'in-office days');
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
      duration: get(f, 'duration'),
      workType: csvWorkType || inferredWorkType || '',
      workTypeInferred: !csvWorkType && !!inferredWorkType,
      hybridDays: /\bhybrid\b/i.test(csvWorkType || inferredWorkType || '') ? csvHybridDays : '',
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
      roleProfile: get(f, 'role profile'),
      jobFitScore: jobFitRaw !== '' && !isNaN(parseInt(jobFitRaw)) ? parseInt(jobFitRaw) : null,
      jobQualityScore: qualityRaw !== '' && !isNaN(parseInt(qualityRaw)) ? parseInt(qualityRaw) : null,
      redFlags: get(f, 'red flags') ? get(f, 'red flags').split(';').map(s => s.trim()).filter(Boolean) : [],
    };

    if (typeof analyzeJobForRole === 'function' && (!jobData.roleProfile || jobData.jobFitScore === null || jobData.jobQualityScore === null)) {
      const analysis = analyzeJobForRole(jobData);
      jobData.fitScore = fitScore !== null ? fitScore : analysis.score;
      jobData.matched = jobData.matched.length ? jobData.matched : analysis.matched;
      jobData.missing = jobData.missing.length ? jobData.missing : analysis.missing;
      jobData.roleProfile = jobData.roleProfile || analysis.roleProfile;
      jobData.jobQualityScore = jobData.jobQualityScore !== null ? jobData.jobQualityScore : analysis.jobQualityScore;
      jobData.redFlags = jobData.redFlags.length ? jobData.redFlags : analysis.redFlags;
      jobData.jobFitScore = jobData.jobFitScore !== null ? jobData.jobFitScore : analysis.jobFitScore;
    }

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

function _isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function _stringValue(value) {
  return value === null || value === undefined ? '' : String(value);
}

function _normalizeSkillEntry(skill) {
  if (typeof skill === 'string') {
    const name = skill.trim();
    return name ? {
      name,
      level: 'Beginner'
    } : null;
  }
  if (!_isPlainObject(skill)) return null;

  const name = _stringValue(skill.name).trim();
  if (!name) return null;

  return {
    ...skill,
    name,
    level: ['Beginner', 'Intermediate', 'Expert'].includes(skill.level) ? skill.level : 'Beginner',
  };
}

function _normalizeCertEntry(cert) {
  if (typeof cert === 'string') {
    const name = cert.trim();
    return name ? {
      name,
      type: 'Certificate',
      status: 'completed',
      provider: '',
      startDate: '',
      targetDate: '',
      completedDate: '',
      progress: 100,
      description: ''
    } : null;
  }
  if (!_isPlainObject(cert)) return null;

  const name = _stringValue(cert.name).trim();
  if (!name) return null;
  const statuses = ['planned', 'in-progress', 'completed'];
  const status = statuses.includes(cert.status) ? cert.status : 'completed';
  const progress = Number(cert.progress);
  const normalizedProgress = Number.isFinite(progress) ?
    Math.max(0, Math.min(100, Math.round(progress))) :
    (status === 'completed' ? 100 : 0);

  return {
    ...cert,
    name,
    type: _stringValue(cert.type).trim() || 'Certificate',
    status,
    provider: _stringValue(cert.provider),
    startDate: _stringValue(cert.startDate),
    targetDate: _stringValue(cert.targetDate),
    completedDate: _stringValue(cert.completedDate),
    progress: status === 'completed' && normalizedProgress === 0 ? 100 : normalizedProgress,
    description: _stringValue(cert.description),
  };
}

function _normalizeProfile(profile) {
  const source = _isPlainObject(profile) ? profile : {};
  return {
    ...source,
    name: _stringValue(source.name),
    summary: _stringValue(source.summary),
    links: {
      linkedin: _stringValue(source.links && source.links.linkedin),
      github: _stringValue(source.links && source.links.github),
      portfolio: _stringValue(source.links && source.links.portfolio),
    },
    skills: (Array.isArray(source.skills) ? source.skills : [])
      .map(_normalizeSkillEntry)
      .filter(Boolean),
    certifications: (Array.isArray(source.certifications) ? source.certifications : [])
      .map(_normalizeCertEntry)
      .filter(Boolean),
  };
}

function _normalizeStringArray(value) {
  return (Array.isArray(value) ? value : [])
    .map(item => _stringValue(item).trim())
    .filter(Boolean);
}

function _normalizeFitScore(value) {
  if (value === null || value === undefined || value === '') return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function _normalizeJob(job) {
  const source = _isPlainObject(job) ? job : {};
  return {
    ...source,
    id: _stringValue(source.id).trim() || uid(),
    role: _stringValue(source.role).trim() || 'Untitled Role',
    company: _stringValue(source.company).trim() || 'Unknown Company',
    department: _stringValue(source.department),
    location: _stringValue(source.location),
    url: _stringValue(source.url),
    salary: _stringValue(source.salary),
    datePosted: _stringValue(source.datePosted),
    dateApplied: _stringValue(source.dateApplied),
    dateAdded: _stringValue(source.dateAdded) || new Date().toISOString(),
    deadline: _stringValue(source.deadline),
    seniority: _stringValue(source.seniority),
    jobType: _stringValue(source.jobType),
    duration: _stringValue(source.duration),
    workType: _stringValue(source.workType),
    hybridDays: _stringValue(source.hybridDays),
    stage: STAGES.includes(source.stage) ? source.stage : 'saved',
    description: _stringValue(source.description),
    benefits: _stringValue(source.benefits),
    companyNotes: _stringValue(source.companyNotes),
    notes: _stringValue(source.notes),
    coverLetter: _stringValue(source.coverLetter),
    resumeVaultId: _stringValue(source.resumeVaultId),
    matched: _normalizeStringArray(source.matched),
    missing: _normalizeStringArray(source.missing),
    fitScore: _normalizeFitScore(source.fitScore),
    roleProfile: _stringValue(source.roleProfile),
    jobQualityScore: _normalizeFitScore(source.jobQualityScore),
    jobFitScore: _normalizeFitScore(source.jobFitScore),
    redFlags: _normalizeStringArray(source.redFlags),
  };
}

function _normalizeEntityArray(value) {
  return (Array.isArray(value) ? value : [])
    .filter(_isPlainObject)
    .map(item => ({
      ...item,
      id: _stringValue(item.id).trim() || uid(),
    }));
}

function _normalizeBackupData(data) {
  if (!_isPlainObject(data)) return null;

  const knownKeys = [
    'jobs',
    'profile',
    'savedCourses',
    'contacts',
    'goals',
    'events',
    'templates',
    'resumes',
    'coverLetters',
  ];
  if (!knownKeys.some(key => Object.prototype.hasOwnProperty.call(data, key))) return null;

  return {
    jobs: (Array.isArray(data.jobs) ? data.jobs : []).map(_normalizeJob),
    profile: _normalizeProfile(data.profile),
    savedCourses: Array.isArray(data.savedCourses) ? data.savedCourses : [],
    contacts: _normalizeEntityArray(data.contacts),
    goals: _normalizeEntityArray(data.goals),
    events: _normalizeEntityArray(data.events),
    templates: _normalizeEntityArray(data.templates),
    resumes: _normalizeEntityArray(data.resumes),
    coverLetters: _normalizeEntityArray(data.coverLetters),
  };
}

function _removeDuplicateResumes() {
  if (!Array.isArray(state.resumes)) return 0;

  const keptByDataUrl = new Map();
  const replacementIds = new Map();
  const uniqueResumes = [];

  state.resumes.forEach(resume => {
    // Only remove byte-for-byte copies of an uploaded file. Files with the
    // same name but different contents remain separate vault entries.
    if (!resume || typeof resume.dataUrl !== 'string' || !resume.dataUrl) {
      uniqueResumes.push(resume);
      return;
    }

    const keptResume = keptByDataUrl.get(resume.dataUrl);
    if (keptResume) {
      replacementIds.set(resume.id, keptResume.id);
      return;
    }

    keptByDataUrl.set(resume.dataUrl, resume);
    uniqueResumes.push(resume);
  });

  if (replacementIds.size) {
    state.jobs.forEach(job => {
      if (job && replacementIds.has(job.resumeVaultId)) {
        job.resumeVaultId = replacementIds.get(job.resumeVaultId);
      }
    });
    state.resumes = uniqueResumes;
  }

  return replacementIds.size;
}

function _isStorageQuotaError(err) {
  return Boolean(err && (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  ));
}

function importData(file) {
  const isCSV = file.name.toLowerCase().endsWith('.csv');
  const reader = new FileReader();
  reader.onload = e => {
    const statusEl = document.getElementById('backup-status');
    let importSnapshot = null;
    try {
      if (isCSV) {
        const {
          added,
          updated
        } = _importFromCSV(e.target.result);
        migrateJobSalaryPayPeriods();
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
        let parsed;
        try {
          parsed = JSON.parse(e.target.result);
        } catch {
          if (statusEl) {
            statusEl.textContent = 'Could not parse JSON. Check that the file is not empty or corrupted.';
            statusEl.className = 'import-status error';
          }
          return;
        }

        const data = _normalizeBackupData(parsed);
        if (!data) {
          if (statusEl) {
            statusEl.textContent = '✕ Invalid backup file — make sure you\'re using a PipelineTrack export.';
            statusEl.className = 'import-status error';
          }
          return;
        }
        // Keep an in-memory copy so a failed localStorage write does not
        // leave the running app showing an import that was not saved.
        importSnapshot = JSON.parse(JSON.stringify({
          jobs: state.jobs,
          profile: state.profile,
          savedCourses: state.savedCourses,
          contacts: state.contacts,
          goals: state.goals,
          events: state.events,
          templates: state.templates,
          resumes: state.resumes,
          coverLetters: state.coverLetters,
        }));
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
            if (!Array.isArray(state.profile.skills)) state.profile.skills = [];
            const existing = new Set((state.profile.skills || [])
              .map(s => s && s.name ? s.name.toLowerCase() : '')
              .filter(Boolean));
            imp.skills.forEach(s => {
              if (s && s.name && !existing.has(s.name.toLowerCase())) state.profile.skills.push(s);
            });
          }
          // Certifications: merge by lowercased name
          if (Array.isArray(imp.certifications)) {
            if (!Array.isArray(state.profile.certifications)) state.profile.certifications = [];
            const existing = new Set((state.profile.certifications || [])
              .map(c => c && c.name ? c.name.toLowerCase() : '')
              .filter(Boolean));
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
        migrateJobSalaryPayPeriods();
        const removedDuplicates = _removeDuplicateResumes();
        save();
        let refreshWarning = '';
        try {
          reanalyzeAllJobs();
          if (typeof backfillSeniority === 'function') backfillSeniority();
          renderView(state.activeView);
        } catch (refreshErr) {
          refreshWarning = ' Refresh the page if the screen does not update right away.';
          console.error('PipelineTrack refresh after import failed:', refreshErr);
        }
        const freshStatusEl = document.getElementById('backup-status');
        if (freshStatusEl) {
          freshStatusEl.textContent = `⬆ Imported: ${file.name} — ${added} added, ${updated} updated. Your new jobs were kept.`;
          freshStatusEl.className = 'import-status success';
        }
        if (freshStatusEl && removedDuplicates) {
          freshStatusEl.textContent += ` Removed ${removedDuplicates} duplicate resume${removedDuplicates === 1 ? '' : 's'} from the Resume Vault.`;
        }
        if (freshStatusEl && refreshWarning) freshStatusEl.textContent += refreshWarning;
        toast(`Backup merged: ${added} added, ${updated} updated. Your new jobs were kept.`, 'success');
      }
    } catch (err) {
      if (importSnapshot) {
        Object.assign(state, importSnapshot);
        try {
          save();
        } catch (restoreErr) {
          console.error('PipelineTrack could not restore data after failed import:', restoreErr);
        }
      }
      if (statusEl) {
        statusEl.textContent = isCSV ?
          '✕ Could not read CSV. Make sure it\'s a PipelineTrack CSV export.' :
          '✕ Could not read file. Make sure it\'s a valid .json backup.';
        statusEl.className = 'import-status error';
        if (!isCSV && _isStorageQuotaError(err)) {
          statusEl.textContent = 'Import could not be saved because browser storage is full. Remove some Resume Vault files, then try again.';
        } else if (!isCSV) {
          statusEl.textContent = 'Could not finish importing this backup. Some saved data may be malformed.';
        }
      }
      console.error('PipelineTrack import failed:', err);
    }
  };
  reader.onerror = () => {
    const statusEl = document.getElementById('backup-status');
    if (statusEl) {
      statusEl.textContent = 'Browser could not read this file. Try exporting it again or choose another file.';
      statusEl.className = 'import-status error';
    }
  };
  reader.readAsText(file);
}

'use strict';

/* ══════════════════════════════════════════════════════════
   FIT ANALYSIS
   ══════════════════════════════════════════════════════════ */
// Returns a regex that matches a skill as a whole word/token,
// not as a substring of another word (e.g. "r" won't match "requirements").
function _skillRegex(skill) {
  const esc = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(?<![a-zA-Z0-9])' + esc + '(?![a-zA-Z0-9])', 'i');
}

function analyzeJob(description) {
  if (!description || !description.trim()) return {
    score: null,
    matched: [],
    missing: []
  };

  const userSkills = state.profile.skills.map(s => s.name.toLowerCase());

  // Extract known skills mentioned in cert/license/degree descriptions
  const certText = (state.profile.certifications || [])
    .map(c => c.description || '').join(' ').toLowerCase();
  const certSkills = certText ? [...KNOWN_SKILLS].filter(skill => _skillRegex(skill).test(certText)) : [];
  const allUserSkills = [...new Set([...userSkills, ...certSkills])];

  // Check known skills by looking for them as whole words in the job description
  const foundInJob = [...KNOWN_SKILLS].filter(skill => _skillRegex(skill).test(description));
  const matched = foundInJob.filter(skill => allUserSkills.some(us => us.includes(skill) || skill.includes(us)));
  const missing = foundInJob.filter(skill => !matched.includes(skill));

  const total = matched.length + missing.length;
  const score = total === 0 ? null : Math.round((matched.length / total) * 100);

  return {
    score,
    matched,
    missing
  };
}

function fitBadgeClass(score) {
  if (score === null) return 'fit-none';
  if (score >= 70) return 'fit-high';
  if (score >= 40) return 'fit-mid';
  return 'fit-low';
}

function fitBadgeLabel(score) {
  return score === null ? 'No desc' : `${score}%`;
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Converts salary input like "80k", "10k-100k", "150000" → "$80,000", "$10,000 – $100,000"
function formatSalary(raw) {
  if (!raw || typeof raw !== 'string') return raw;

  function parseAmt(s) {
    s = s.trim().replace(/^\$/, '').replace(/,/g, '');
    const kMatch = s.match(/^([\d.]+)\s*[kK]$/);
    if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
    const n = parseFloat(s);
    return (!isNaN(n) && n > 0) ? Math.round(n) : null;
  }

  function fmt(n) { return '$' + n.toLocaleString('en-US'); }

  // Range: two monetary values separated by -, –, or "to"
  const rangeMatch = raw.match(/^(\$?[\d,]+(?:\.\d+)?\s*[kK]?)\s*(?:[-–—]|to)\s*(\$?[\d,]+(?:\.\d+)?\s*[kK]?)([\s\S]*)$/i);
  if (rangeMatch) {
    const a = parseAmt(rangeMatch[1]);
    const b = parseAmt(rangeMatch[2]);
    const suffix = rangeMatch[3].trim();
    if (a && b) return fmt(a) + ' – ' + fmt(b) + (suffix ? ' ' + suffix : '');
  }

  // Single value with optional suffix (e.g. "80k/yr", "95000 per year")
  const singleMatch = raw.match(/^(\$?[\d,]+(?:\.\d+)?\s*[kK]?)([\s\S]*)$/i);
  if (singleMatch) {
    const n = parseAmt(singleMatch[1]);
    const suffix = singleMatch[2].trim();
    if (n) return fmt(n) + (suffix ? ' ' + suffix : '');
  }

  return raw;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.className = 'toast';
  }, 2600);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.getElementById(id).setAttribute('aria-hidden', 'false');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.getElementById(id).setAttribute('aria-hidden', 'true');
}

let dayModalContext = null;

function openDayModal(label, ids) {
  dayModalContext = {
    label,
    ids
  };
  document.getElementById('day-modal-title').textContent = label;
  const dayJobs = ids.map(id => state.jobs.find(j => j.id === id)).filter(Boolean);
  const el = document.getElementById('day-modal-jobs');
  el.innerHTML = dayJobs.map(job => {
    const cls = fitBadgeClass(job.fitScore);
    const lbl = fitBadgeLabel(job.fitScore);
    return `
      <div class="day-modal-job" data-job-id="${job.id}">
        <div class="day-modal-job-info">
          <div class="day-modal-job-role">${escHtml(job.role)}</div>
          <div class="day-modal-job-company">${escHtml(job.company)}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
        </div>
        <div class="day-modal-job-badges">
          <span class="stage-badge stage-${job.stage}">${STAGE_LABELS[job.stage]}</span>
          <span class="fit-badge ${cls}">${lbl}</span>
        </div>
      </div>`;
  }).join('');
  el.querySelectorAll('.day-modal-job').forEach(item => {
    item.addEventListener('click', () => {
      closeModal('modal-day');
      openJobDetail(item.dataset.jobId);
    });
  });
  openModal('modal-day');
}

/* ══════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════ */
const VIEW_TITLES = {
  dashboard: 'Dashboard',
  board: 'Job Board',
  profile: 'My Profile',
  learning: 'Learning Hub',
  resume: 'Resume Hub',
  calendar: 'Calendar & Activity',
  contacts: 'Network & Contacts',
  analytics: 'Analytics',
  goals: 'Goals',
};
const TOPBAR_ACTIONS = {
  dashboard: true,
  board: true,
  profile: false,
  learning: false,
  resume: false,
  calendar: true,
  contacts: false,
  analytics: false,
  goals: false,
};

function navigate(view) {
  state.activeView = view;

  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.classList.remove('view-enter');
  });

  const target = document.getElementById(`view-${view}`);
  target.classList.add('active');
  void target.offsetWidth; // reflow so animation restarts
  target.classList.add('view-enter');

  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.view === view);
  });

  document.getElementById('topbar-title').textContent = VIEW_TITLES[view];
  const actionBtn = document.getElementById('topbar-action');
  if (view === 'contacts') {
    actionBtn.style.display = '';
    actionBtn.dataset.action = 'add-contact';
    actionBtn.textContent = '+ Add Contact';
  } else if (view === 'goals') {
    actionBtn.style.display = '';
    actionBtn.dataset.action = 'add-goal';
    actionBtn.textContent = '+ Add Goal';
  } else {
    actionBtn.style.display = TOPBAR_ACTIONS[view] ? '' : 'none';
    actionBtn.dataset.action = 'add-job';
    actionBtn.textContent = '+ Add Job';
  }

  renderView(view);
}

function renderView(view) {
  if (view === 'dashboard') renderDashboard();
  if (view === 'board') renderBoard();
  if (view === 'profile') renderProfile();
  if (view === 'learning') renderLearning();
  if (view === 'resume') renderResume();
  if (view === 'calendar') renderCalendarView();
  if (view === 'contacts') renderContacts();
  if (view === 'analytics') renderAnalytics();
  if (view === 'goals') renderGoals();
}


function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightJobDescription(text, matched, missing) {
  if (!text) return '';
  if (!matched.length && !missing.length) return escHtml(text);

  // Build list of skills with their CSS class, longest first to avoid partial overlaps
  const allSkills = [
    ...matched.map(s => ({
      s: s.toLowerCase(),
      cls: 'kw-match'
    })),
    ...missing.map(s => ({
      s: s.toLowerCase(),
      cls: 'kw-gap'
    })),
  ];
  allSkills.sort((a, b) => b.s.length - a.s.length);

  const marks = [];

  for (const {
      s,
      cls
    } of allSkills) {
    const re = new RegExp('(?<![a-zA-Z0-9])' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-zA-Z0-9])', 'gi');
    let m;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      const overlap = marks.some(mk => mk.start < end && mk.end > start);
      if (!overlap) marks.push({
        start,
        end,
        cls
      });
    }
  }

  marks.sort((a, b) => a.start - b.start);

  let html = '';
  let pos = 0;
  for (const m of marks) {
    if (m.start > pos) html += escHtml(text.slice(pos, m.start));
    html += `<mark class="${m.cls}">${escHtml(text.slice(m.start, m.end))}</mark>`;
    pos = m.end;
  }
  if (pos < text.length) html += escHtml(text.slice(pos));
  return html;
}

function parseBenefits(text) {
  // Keyword map: pattern → short label
  const MAP = [
    [/health\s*insurance|medical/i, 'Health Insurance'],
    [/dental/i, 'Dental'],
    [/vision/i, 'Vision'],
    [/401k|retirement|pension/i, '401k / Retirement'],
    [/equity|stock|rsu|espp/i, 'Equity'],
    [/bonus/i, 'Bonus'],
    [/unlimited\s*pto|unlimited\s*vacation/i, 'Unlimited PTO'],
    [/pto|paid\s*time\s*off|vacation/i, 'PTO'],
    [/sick\s*(days?|leave)/i, 'Sick Leave'],
    [/parental\s*leave|maternity|paternity/i, 'Parental Leave'],
    [/remote|work\s*from\s*home|wfh/i, 'Remote Work'],
    [/flexible\s*(hours?|schedule)/i, 'Flexible Hours'],
    [/life\s*insurance/i, 'Life Insurance'],
    [/disability/i, 'Disability Insurance'],
    [/hsa|fsa/i, 'HSA / FSA'],
    [/tuition|education|learning\s*stipend/i, 'Education Stipend'],
    [/professional\s*development/i, 'Prof. Development'],
    [/gym|fitness|wellness/i, 'Wellness / Gym'],
    [/commuter|transit|parking/i, 'Commuter Benefits'],
    [/relocation/i, 'Relocation'],
    [/signing\s*bonus/i, 'Signing Bonus'],
    [/snacks?|lunch|meals?|food/i, 'Free Food'],
    [/home\s*office\s*stipend|equipment/i, 'Home Office Stipend'],
    [/mental\s*health/i, 'Mental Health'],
    [/childcare|dependent\s*care/i, 'Childcare'],
    [/volunteer|community/i, 'Volunteer Time'],
  ];

  // Split on common delimiters
  const parts = text.split(/[,;\n•\-\*]+/).map(s => s.trim()).filter(Boolean);

  const seen = new Set();
  const results = [];

  for (const part of parts) {
    let matched = false;
    for (const [pattern, label] of MAP) {
      if (pattern.test(part) && !seen.has(label)) {
        seen.add(label);
        results.push(label);
        matched = true;
        break;
      }
    }
    // If nothing matched but it's short enough, show it as-is
    if (!matched && part.length <= 40 && !seen.has(part)) {
      seen.add(part);
      results.push(part);
    }
  }

  return results;
}
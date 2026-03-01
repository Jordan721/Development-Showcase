'use strict';

/* ══════════════════════════════════════════════════════════
   FIT ANALYSIS
   ══════════════════════════════════════════════════════════ */
function analyzeJob(description) {
  if (!description || !description.trim()) return {
    score: null,
    matched: [],
    missing: []
  };

  const userSkills = state.profile.skills.map(s => s.name.toLowerCase());
  const text = description.toLowerCase();

  // Check known skills by looking for them in the job description text
  const foundInJob = [...KNOWN_SKILLS].filter(skill => text.includes(skill));
  const matched = foundInJob.filter(skill => userSkills.some(us => us.includes(skill) || skill.includes(us)));
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
  calendar: 'Calendar',
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
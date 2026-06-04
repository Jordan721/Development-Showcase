'use strict';

/* ══════════════════════════════════════════════════════════
   DEPARTMENT INFERENCE
   ══════════════════════════════════════════════════════════ */
const DEPT_MAP = [{
    dept: 'Engineering',
    keywords: ['engineer', 'developer', 'software', 'backend', 'front-end', 'frontend', 'full stack', 'fullstack', 'devops', 'platform', 'sre', 'infrastructure', 'mobile', 'ios', 'android', 'embedded', 'firmware', 'qa', 'quality assurance', 'test engineer']
  },
  {
    dept: 'Data',
    keywords: ['data scientist', 'data analyst', 'data engineer', 'machine learning', 'ml engineer', 'ai engineer', 'analytics', 'business intelligence', 'bi developer', 'nlp', 'deep learning']
  },
  {
    dept: 'Design',
    keywords: ['designer', 'ux', 'ui ', 'user experience', 'product design', 'visual design', 'graphic design', 'interaction design', 'motion design']
  },
  {
    dept: 'Product',
    keywords: ['product manager', 'product owner', 'program manager', 'scrum master', 'agile coach', 'product lead']
  },
  {
    dept: 'Marketing',
    keywords: ['marketing', 'growth', 'seo', 'content strategist', 'brand', 'social media', 'campaign', 'demand generation', 'copywriter', 'communications']
  },
  {
    dept: 'Sales',
    keywords: ['sales', 'account executive', 'business development', 'bdr', 'sdr', 'account manager', 'revenue', 'partnerships', 'closing deals']
  },
  {
    dept: 'Finance',
    keywords: ['finance', 'accounting', 'financial analyst', 'controller', 'cfo', 'treasury', 'payroll', 'bookkeeper', 'auditor', 'actuary']
  },
  {
    dept: 'HR / People',
    keywords: ['human resources', ' hr ', 'recruiter', 'recruiting', 'talent acquisition', 'people ops', 'people operations', 'compensation', 'onboarding']
  },
  {
    dept: 'Legal',
    keywords: ['legal', 'counsel', 'compliance', 'attorney', 'lawyer', 'paralegal', 'contract', 'regulatory']
  },
  {
    dept: 'IT Operations',
    keywords: ['computer operator', 'computer operations', 'it operations', 'data center', 'mainframe', 'batch processing', 'job scheduling', 'system monitoring', 'network monitoring', 'production support', 'operations support']
  },
  {
    dept: 'Operations',
    keywords: ['operations', 'ops manager', 'supply chain', 'logistics', 'project manager', 'chief of staff', 'process improvement']
  },
  {
    dept: 'Customer Success',
    keywords: ['customer success', 'customer support', 'customer service', 'support engineer', 'technical support', 'help desk', 'client success']
  },
  {
    dept: 'Security',
    keywords: ['security engineer', 'cybersecurity', 'infosec', 'penetration', 'soc analyst', 'threat', 'vulnerability']
  },
  {
    dept: 'Research',
    keywords: ['researcher', 'research scientist', 'r&d', 'research and development', 'scientist', 'lab']
  },
];

function inferWorkType(description) {
  const text = (description || '').toLowerCase();
  if (/\bhybrid\b/.test(text)) return 'Hybrid';
  if (/\bremote\b|\bwork from home\b|\bwfh\b|\bfully remote\b|\b100%\s*remote\b/.test(text)) return 'Remote';
  if (/\bon.?site\b|\bin.?office\b|\bin person\b|\bon location\b/.test(text)) return 'On-site';
  return null;
}

function inferDepartment(role, description) {
  const text = ` ${(role + ' ' + (description || '')).toLowerCase()} `;
  for (const {
      dept,
      keywords
    } of DEPT_MAP) {
    if (keywords.some(kw => text.includes(kw))) return dept;
  }
  return null;
}

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
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);

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

  function fmt(n) {
    return '$' + n.toLocaleString('en-US');
  }

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

const EMPTY_STATE_SVGS = {
  '📋': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="8" width="40" height="48" rx="4" fill="var(--card)" stroke="var(--border)" stroke-width="2"/>
    <rect x="20" y="18" width="24" height="3" rx="1.5" fill="var(--border)"/>
    <rect x="20" y="26" width="18" height="3" rx="1.5" fill="var(--border)"/>
    <rect x="20" y="34" width="20" height="3" rx="1.5" fill="var(--border)"/>
    <rect x="24" y="4" width="16" height="8" rx="2" fill="var(--accent-dim)" stroke="var(--accent)" stroke-width="1.5"/>
  </svg>`,
  '📭': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="20" width="48" height="32" rx="4" fill="var(--card)" stroke="var(--border)" stroke-width="2"/>
    <path d="M8 24l24 16 24-16" stroke="var(--border)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M36 12h16M44 8v8" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  '🔍': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="16" fill="var(--card)" stroke="var(--border)" stroke-width="2.5"/>
    <line x1="40" y1="40" x2="54" y2="54" stroke="var(--border)" stroke-width="3" stroke-linecap="round"/>
    <line x1="22" y1="28" x2="34" y2="28" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/>
    <line x1="28" y1="22" x2="28" y2="34" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  '⏱': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="36" r="20" fill="var(--card)" stroke="var(--border)" stroke-width="2.5"/>
    <line x1="32" y1="36" x2="32" y2="24" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="32" y1="36" x2="42" y2="40" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"/>
    <rect x="26" y="10" width="12" height="4" rx="2" fill="var(--border)"/>
  </svg>`,
  '👤': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="22" r="12" fill="var(--card)" stroke="var(--border)" stroke-width="2"/>
    <path d="M10 54c0-12.15 9.85-22 22-22s22 9.85 22 22" fill="var(--card)" stroke="var(--border)" stroke-width="2"/>
  </svg>`,
  '🧠': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="32" rx="20" ry="16" fill="var(--card)" stroke="var(--border)" stroke-width="2"/>
    <path d="M32 16c0 0-4 4-4 8s4 8 4 8" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M20 28c4 0 6 4 6 4" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M44 28c-4 0-6 4-6 4" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
};

function emptyStateHTML(emoji, title, subtitle = '') {
  const svg = EMPTY_STATE_SVGS[emoji];
  return `<div class="empty-state">
    ${svg ? `<div class="empty-state-illustration">${svg}</div>` : `<div class="empty-state-emoji">${emoji}</div>`}
    <div class="empty-state-title">${title}</div>
    ${subtitle ? `<div class="empty-state-sub">${subtitle}</div>` : ''}
  </div>`;
}

function toast(msg, type = '', opts = {}) {
  const el = document.getElementById('toast');
  clearTimeout(el._t);
  if (opts && opts.undo) {
    el.innerHTML = `<span class="toast-msg">${escHtml(msg)}</span><button class="toast-undo-btn">Undo</button>`;
    el.querySelector('.toast-undo-btn').addEventListener('click', () => {
      clearTimeout(el._t);
      el.className = 'toast';
      opts.undo();
    });
  } else {
    el.textContent = msg;
  }
  el.className = `toast show${type ? ' ' + type : ''}`;
  el._t = setTimeout(() => {
    el.className = 'toast';
  }, opts && opts.undo ? 5000 : 3000);
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

  // skeleton flash — add class, force reflow so animation starts, render content, let animationend clean up
  target.classList.remove('view-skeleton');
  void target.offsetWidth;
  target.classList.add('view-skeleton');
  target.addEventListener('animationend', () => target.classList.remove('view-skeleton'), {
    once: true
  });
  renderView(view);
  if (typeof updateGettingStarted === 'function') updateGettingStarted();
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
  // Scan the full text for each pattern — works with bullet lists, paragraphs, or plain sentences.
  // Order matters: more specific patterns (e.g. Signing Bonus, Unlimited PTO) must come before
  // broader ones (Bonus, PTO) so they aren't swallowed by a generic match.
  const MAP = [
    [/signing\s*bonus/i, 'Signing Bonus'],
    [/unlimited\s*pto|unlimited\s*paid\s*time\s*off|unlimited\s*vacation/i, 'Unlimited PTO'],
    [/pto\b|paid\s*time\s*off|paid\s*vacation/i, 'PTO'],
    [/performance\s*bonus|annual\s*bonus|quarterly\s*bonus/i, 'Performance Bonus'],
    [/\bbonus\b/i, 'Bonus'],
    [/health\s*insurance|medical\s*(insurance|coverage|benefits)/i, 'Health Insurance'],
    [/dental\s*(insurance|coverage|plan|care)/i, 'Dental'],
    [/vision\s*(insurance|coverage|plan|care)/i, 'Vision'],
    [/401\s*k|403\s*b|\bretirement\s*(plan|savings|benefits)\b|\bpension\b/i, '401k / Retirement'],
    [/equity|stock\s*(options?|grants?|awards?)|rsu|espp/i, 'Equity'],
    [/sick\s*(days?|leave|time)/i, 'Sick Leave'],
    [/parental\s*(leave|benefits)|maternity\s*leave|paternity\s*leave/i, 'Parental Leave'],
    [/work\s*from\s*home|remote\s*work|fully\s*remote|wfh/i, 'Remote Work'],
    [/flexible\s*(hours?|schedule|work(ing)?\s*hours?)/i, 'Flexible Hours'],
    [/life\s*insurance/i, 'Life Insurance'],
    [/disability\s*(insurance|coverage|benefits)/i, 'Disability Insurance'],
    [/\bhsa\b|\bfsa\b|health\s*savings\s*account|flexible\s*spending/i, 'HSA / FSA'],
    [/tuition\s*(reimbursement|assistance|benefit)|education\s*(reimbursement|stipend|assistance)|learning\s*stipend/i, 'Education Stipend'],
    [/professional\s*development|career\s*development|training\s*(budget|allowance)/i, 'Prof. Development'],
    [/gym\s*(membership|subsidy|reimbursement)|fitness\s*(benefit|allowance|stipend)|wellness\s*(benefit|program|stipend)/i, 'Wellness / Gym'],
    [/commuter\s*(benefits?|allowance)|transit\s*(benefits?|pass|allowance)|\bparking\b/i, 'Commuter Benefits'],
    [/relocation\s*(assistance|package|reimbursement)/i, 'Relocation'],
    [/free\s*(lunch|meals?|snacks?|food|breakfast)|catered\s*(lunch|meals?)|meal\s*(allowance|stipend)/i, 'Free Food'],
    [/home\s*office\s*(stipend|allowance|setup|reimbursement)|equipment\s*(stipend|allowance|provided)/i, 'Home Office Stipend'],
    [/mental\s*health\s*(benefits?|support|coverage|days?)/i, 'Mental Health'],
    [/childcare|child\s*care|dependent\s*care/i, 'Childcare'],
    [/volunteer\s*(time|days?|hours?|opportunities)/i, 'Volunteer Time'],
  ];

  const results = [];
  for (const [pattern, label] of MAP) {
    if (pattern.test(text)) results.push(label);
  }
  return results;
}
/* ── SKILL NAME NORMALIZER ────────────────────────────────── */
const SKILL_CANONICAL = {
  // Languages
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'python': 'Python',
  'java': 'Java',
  'kotlin': 'Kotlin',
  'swift': 'Swift',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'c++': 'C++',
  'c#': 'C#',
  'ruby': 'Ruby',
  'php': 'PHP',
  'scala': 'Scala',
  'r': 'R',
  'dart': 'Dart',
  'elixir': 'Elixir',
  'clojure': 'Clojure',
  'haskell': 'Haskell',
  'perl': 'Perl',
  'lua': 'Lua',
  'objective-c': 'Objective-C',
  'vba': 'VBA',
  'cobol': 'COBOL',
  'fortran': 'Fortran',
  // Frontend
  'react': 'React',
  'vue': 'Vue',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'svelte': 'Svelte',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'nuxtjs': 'Nuxt.js',
  'nuxt.js': 'Nuxt.js',
  'html': 'HTML',
  'css': 'CSS',
  'sass': 'Sass',
  'scss': 'SCSS',
  'less': 'Less',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'webpack': 'Webpack',
  'vite': 'Vite',
  'babel': 'Babel',
  'jquery': 'jQuery',
  'redux': 'Redux',
  'zustand': 'Zustand',
  'mobx': 'MobX',
  'graphql': 'GraphQL',
  'storybook': 'Storybook',
  // Backend
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node': 'Node.js',
  'express': 'Express',
  'expressjs': 'Express',
  'fastapi': 'FastAPI',
  'django': 'Django',
  'flask': 'Flask',
  'rails': 'Rails',
  'spring': 'Spring',
  'laravel': 'Laravel',
  'nestjs': 'NestJS',
  'nest.js': 'NestJS',
  'asp.net': 'ASP.NET',
  'dotnet': '.NET',
  '.net': '.NET',
  'rest': 'REST',
  'restful': 'RESTful',
  'grpc': 'gRPC',
  'websocket': 'WebSocket',
  'websockets': 'WebSockets',
  'oauth': 'OAuth',
  'oauth2': 'OAuth2',
  'jwt': 'JWT',
  // Databases
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'sqlite': 'SQLite',
  'redis': 'Redis',
  'elasticsearch': 'Elasticsearch',
  'cassandra': 'Cassandra',
  'dynamodb': 'DynamoDB',
  'firebase': 'Firebase',
  'supabase': 'Supabase',
  'prisma': 'Prisma',
  'sequelize': 'Sequelize',
  'typeorm': 'TypeORM',
  'mssql': 'MSSQL',
  'mariadb': 'MariaDB',
  'couchdb': 'CouchDB',
  'neo4j': 'Neo4j',
  // Cloud / DevOps
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'jenkins': 'Jenkins',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitbucket': 'Bitbucket',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'linux': 'Linux',
  'unix': 'Unix',
  'bash': 'Bash',
  'nginx': 'Nginx',
  'apache': 'Apache',
  'serverless': 'Serverless',
  'lambda': 'Lambda',
  'ec2': 'EC2',
  's3': 'S3',
  'cloudwatch': 'CloudWatch',
  'cloudfront': 'CloudFront',
  'heroku': 'Heroku',
  'vercel': 'Vercel',
  'netlify': 'Netlify',
  'digitalocean': 'DigitalOcean',
  // Mobile
  'react native': 'React Native',
  'flutter': 'Flutter',
  'android': 'Android',
  'ios': 'iOS',
  'xcode': 'Xcode',
  'swiftui': 'SwiftUI',
  // Data / ML / AI
  'machine learning': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'keras': 'Keras',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scipy': 'SciPy',
  'scikit-learn': 'scikit-learn',
  'sklearn': 'scikit-learn',
  'spark': 'Spark',
  'hadoop': 'Hadoop',
  'data science': 'Data Science',
  'data analysis': 'Data Analysis',
  'data engineering': 'Data Engineering',
  'nlp': 'NLP',
  'computer vision': 'Computer Vision',
  'llm': 'LLM',
  'llms': 'LLMs',
  'openai': 'OpenAI',
  'chatgpt': 'ChatGPT',
  'chat gpt': 'ChatGPT',
  'gpt': 'GPT',
  'gpt-4': 'GPT-4',
  'gpt-3': 'GPT-3',
  'gpt4': 'GPT-4',
  'gpt3': 'GPT-3',
  'claude': 'Claude',
  'claude ai': 'Claude AI',
  'anthropic': 'Anthropic',
  'gemini': 'Gemini',
  'google gemini': 'Google Gemini',
  'bard': 'Bard',
  'copilot': 'Copilot',
  'github copilot': 'GitHub Copilot',
  'microsoft copilot': 'Microsoft Copilot',
  'midjourney': 'Midjourney',
  'stable diffusion': 'Stable Diffusion',
  'dall-e': 'DALL-E',
  'dalle': 'DALL-E',
  'dall·e': 'DALL-E',
  'whisper': 'Whisper',
  'perplexity': 'Perplexity',
  'mistral': 'Mistral',
  'llama': 'LLaMA',
  'llama 2': 'LLaMA 2',
  'llama 3': 'LLaMA 3',
  'ollama': 'Ollama',
  'langchain': 'LangChain',
  'llamaindex': 'LlamaIndex',
  'llama index': 'LlamaIndex',
  'langgraph': 'LangGraph',
  'autogpt': 'AutoGPT',
  'crewai': 'CrewAI',
  'crew ai': 'CrewAI',
  'prompt engineering': 'Prompt Engineering',
  'rag': 'RAG',
  'retrieval augmented generation': 'Retrieval-Augmented Generation',
  'fine-tuning': 'Fine-Tuning',
  'finetuning': 'Fine-Tuning',
  'ai tools': 'AI Tools',
  'generative ai': 'Generative AI',
  'gen ai': 'Generative AI',
  'genai': 'Generative AI',
  'huggingface': 'Hugging Face',
  'hugging face': 'Hugging Face',
  'tableau': 'Tableau',
  'powerbi': 'Power BI',
  'power bi': 'Power BI',
  'looker': 'Looker',
  'dbt': 'dbt',
  // Tools & Practices
  'git': 'Git',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'jira': 'Jira',
  'figma': 'Figma',
  'photoshop': 'Photoshop',
  'illustrator': 'Illustrator',
  'sketch': 'Sketch',
  'jest': 'Jest',
  'pytest': 'Pytest',
  'cypress': 'Cypress',
  'selenium': 'Selenium',
  'tdd': 'TDD',
  'bdd': 'BDD',
  'microservices': 'Microservices',
  'api': 'API',
  'restapi': 'REST API',
  'rest api': 'REST API',
  'graphql api': 'GraphQL API',
  'postman': 'Postman',
  'swagger': 'Swagger',
  'openapi': 'OpenAPI',
  'sonarqube': 'SonarQube',
  'datadog': 'Datadog',
  'splunk': 'Splunk',
  'sentry': 'Sentry',
  'prometheus': 'Prometheus',
  'grafana': 'Grafana',
  'rabbitmq': 'RabbitMQ',
  'kafka': 'Kafka',
  'celery': 'Celery',
  'redis queue': 'Redis Queue',
  'sass/scss': 'Sass/SCSS',
  'ui': 'UI',
  'ux': 'UX',
  'ui/ux': 'UI/UX',
  // Business / IT Operations
  'data entry': 'Data Entry',
  'administrative support': 'Administrative Support',
  'records management': 'Records Management',
  'excel': 'Microsoft Excel',
  'microsoft excel': 'Microsoft Excel',
  'ms excel': 'Microsoft Excel',
  'microsoft office': 'Microsoft Office',
  'ms office': 'Microsoft Office',
  'office 365': 'Office 365',
  'basic computer proficiency': 'Basic Computer Proficiency',
  'computer proficiency': 'Computer Proficiency',
  'computer operator': 'Computer Operator',
  'computer operations': 'Computer Operations',
  'statewide financial system': 'Statewide Financial System',
  'sfs': 'Statewide Financial System',
};

function normalizeSkillName(raw) {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (SKILL_CANONICAL[lower]) return SKILL_CANONICAL[lower];
  // Title-case: capitalize first letter of each word
  return trimmed.replace(/\b\w/g, c => c.toUpperCase());
}

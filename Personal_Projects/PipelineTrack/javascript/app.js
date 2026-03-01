'use strict';

/* ══════════════════════════════════════════════════════════
   KNOWN SKILLS — used to filter noise from job descriptions
   ══════════════════════════════════════════════════════════ */
const KNOWN_SKILLS = new Set([
  // languages
  'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'go', 'golang', 'rust',
  'c++', 'c#', 'ruby', 'php', 'scala', 'r', 'dart', 'elixir', 'clojure', 'haskell', 'perl',
  // frontend
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxtjs', 'html', 'css', 'sass', 'tailwind',
  'bootstrap', 'webpack', 'vite', 'babel', 'jquery', 'redux', 'zustand', 'mobx', 'graphql',
  // backend
  'nodejs', 'express', 'fastapi', 'django', 'flask', 'rails', 'spring', 'laravel', 'nestjs',
  'asp.net', 'rest', 'restful', 'grpc', 'websocket', 'oauth',
  // databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'elasticsearch', 'cassandra',
  'dynamodb', 'firebase', 'supabase', 'prisma', 'sequelize', 'typeorm',
  // cloud / devops
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github',
  'gitlab', 'ci/cd', 'linux', 'bash', 'nginx', 'apache', 'serverless', 'lambda', 'ec2', 's3',
  // mobile
  'react native', 'flutter', 'android', 'ios', 'xcode', 'swiftui',
  // data / ml
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy',
  'scikit-learn', 'sklearn', 'spark', 'hadoop', 'data science', 'data analysis', 'nlp',
  'computer vision', 'llm', 'openai', 'langchain',
  // tools & practices
  'git', 'agile', 'scrum', 'jira', 'figma', 'photoshop', 'illustrator', 'sketch',
  'testing', 'jest', 'pytest', 'cypress', 'selenium', 'tdd', 'bdd', 'microservices',
  'api', 'restapi', 'graphql api', 'websockets',
  // roles / soft skills
  'leadership', 'communication', 'collaboration', 'problem solving', 'teamwork',
  'project management', 'product management', 'ux', 'ui', 'design',
]);

/* ══════════════════════════════════════════════════════════
   LEARNING RESOURCES MAP  skill → course info
   ══════════════════════════════════════════════════════════ */
const LEARNING = {
  javascript: {
    course: 'JavaScript: The Complete Guide',
    provider: 'Udemy',
    time: '~52h',
    url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginners-advanced/'
  },
  typescript: {
    course: 'Understanding TypeScript',
    provider: 'Udemy',
    time: '~22h',
    url: 'https://www.udemy.com/course/understanding-typescript/'
  },
  python: {
    course: 'Python for Everybody Specialization',
    provider: 'Coursera',
    time: '~8mo',
    url: 'https://www.coursera.org/specializations/python'
  },
  java: {
    course: 'Java Programming Masterclass',
    provider: 'Udemy',
    time: '~80h',
    url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/'
  },
  react: {
    course: 'React — The Complete Guide',
    provider: 'Udemy',
    time: '~49h',
    url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/'
  },
  vue: {
    course: 'Vue — The Complete Guide',
    provider: 'Udemy',
    time: '~32h',
    url: 'https://www.udemy.com/course/vuejs-2-the-complete-guide/'
  },
  angular: {
    course: 'Angular — The Complete Guide',
    provider: 'Udemy',
    time: '~34h',
    url: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/'
  },
  nodejs: {
    course: 'Node.js — The Complete Guide',
    provider: 'Udemy',
    time: '~40h',
    url: 'https://www.udemy.com/course/nodejs-the-complete-guide/'
  },
  sql: {
    course: 'The Complete SQL Bootcamp',
    provider: 'Udemy',
    time: '~9h',
    url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/'
  },
  postgresql: {
    course: 'SQL & PostgreSQL for Beginners',
    provider: 'Udemy',
    time: '~11h',
    url: 'https://www.udemy.com/course/sql-and-postgresql/'
  },
  mongodb: {
    course: 'MongoDB — The Complete Guide',
    provider: 'Udemy',
    time: '~17h',
    url: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/'
  },
  aws: {
    course: 'AWS Certified Cloud Practitioner',
    provider: 'AWS / Udemy',
    time: '~12h',
    url: 'https://www.udemy.com/course/aws-certified-cloud-practitioner-new/'
  },
  azure: {
    course: 'AZ-900: Azure Fundamentals',
    provider: 'Microsoft Learn',
    time: '~6h',
    url: 'https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/'
  },
  gcp: {
    course: 'Google Cloud Associate Cloud Engineer',
    provider: 'Coursera',
    time: '~5mo',
    url: 'https://www.coursera.org/professional-certificates/cloud-engineering-gcp'
  },
  docker: {
    course: 'Docker & Kubernetes: The Practical Guide',
    provider: 'Udemy',
    time: '~23h',
    url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/'
  },
  kubernetes: {
    course: 'Docker & Kubernetes: The Practical Guide',
    provider: 'Udemy',
    time: '~23h',
    url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/'
  },
  terraform: {
    course: 'Terraform for Beginners',
    provider: 'Udemy',
    time: '~6h',
    url: 'https://www.udemy.com/course/terraform-beginner-to-advanced/'
  },
  git: {
    course: 'Git & GitHub Bootcamp',
    provider: 'Udemy',
    time: '~17h',
    url: 'https://www.udemy.com/course/git-and-github-bootcamp/'
  },
  'machine learning': {
    course: 'Machine Learning Specialization',
    provider: 'Coursera / Andrew Ng',
    time: '~3mo',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction'
  },
  'deep learning': {
    course: 'Deep Learning Specialization',
    provider: 'Coursera / deeplearning.ai',
    time: '~5mo',
    url: 'https://www.coursera.org/specializations/deep-learning'
  },
  tensorflow: {
    course: 'TensorFlow Developer Certificate',
    provider: 'Google / Coursera',
    time: '~4mo',
    url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice'
  },
  pytorch: {
    course: 'PyTorch for Deep Learning Bootcamp',
    provider: 'Udemy',
    time: '~24h',
    url: 'https://www.udemy.com/course/pytorch-for-deep-learning/'
  },
  graphql: {
    course: 'GraphQL with React',
    provider: 'Udemy',
    time: '~14h',
    url: 'https://www.udemy.com/course/graphql-with-react-course/'
  },
  'react native': {
    course: 'React Native — The Practical Guide',
    provider: 'Udemy',
    time: '~31h',
    url: 'https://www.udemy.com/course/react-native-the-practical-guide/'
  },
  flutter: {
    course: 'The Complete Flutter Development Bootcamp',
    provider: 'Udemy',
    time: '~27h',
    url: 'https://www.udemy.com/course/flutter-bootcamp-with-dart/'
  },
  tailwind: {
    course: 'Tailwind CSS From Scratch',
    provider: 'Udemy',
    time: '~8h',
    url: 'https://www.udemy.com/course/tailwind-from-scratch/'
  },
  figma: {
    course: 'UI/UX Design Bootcamp with Figma',
    provider: 'Udemy',
    time: '~18h',
    url: 'https://www.udemy.com/course/ui-ux-web-design-using-adobe-xd/'
  },
  agile: {
    course: 'Agile Crash Course',
    provider: 'Udemy',
    time: '~3h',
    url: 'https://www.udemy.com/course/agile-fundamentals-scrum-kanban-scrumban/'
  },
  scrum: {
    course: 'Scrum Master Certification Prep',
    provider: 'Udemy',
    time: '~5h',
    url: 'https://www.udemy.com/course/scrum-master-certification-preparation-mock-exam-questions-s/'
  },
  rust: {
    course: 'Ultimate Rust Crash Course',
    provider: 'Udemy',
    time: '~5h',
    url: 'https://www.udemy.com/course/ultimate-rust-crash-course/'
  },
  go: {
    course: 'Go: The Complete Developer\'s Guide',
    provider: 'Udemy',
    time: '~9h',
    url: 'https://www.udemy.com/course/go-the-complete-developers-guide/'
  },
  golang: {
    course: 'Go: The Complete Developer\'s Guide',
    provider: 'Udemy',
    time: '~9h',
    url: 'https://www.udemy.com/course/go-the-complete-developers-guide/'
  },
  linux: {
    course: 'Linux Command Line Bootcamp',
    provider: 'Udemy',
    time: '~11h',
    url: 'https://www.udemy.com/course/the-linux-command-line-bootcamp/'
  },
  'data science': {
    course: 'IBM Data Science Professional Certificate',
    provider: 'Coursera',
    time: '~12mo',
    url: 'https://www.coursera.org/professional-certificates/ibm-data-science'
  },
};

/* ══════════════════════════════════════════════════════════
   RESOURCES — curated external tools
   ══════════════════════════════════════════════════════════ */
const RESOURCES = [{
    category: 'AI Writing & Review',
    items: [{
        name: 'ChatGPT',
        desc: 'Rewrite bullets, generate cover letters, and prep for interviews',
        url: 'https://chat.openai.com',
        tag: 'Free / Pro'
      },
      {
        name: 'Claude',
        desc: 'Great for resume review, technical writing, and detailed feedback',
        url: 'https://claude.ai',
        tag: 'Free / Pro'
      },
      {
        name: 'Grammarly',
        desc: 'Real-time grammar, clarity, tone, and engagement suggestions',
        url: 'https://grammarly.com',
        tag: 'Free / Pro'
      },
      {
        name: 'Hemingway Editor',
        desc: 'Flags complex sentences, passive voice, and hard-to-read sections',
        url: 'https://hemingwayapp.com',
        tag: 'Free'
      },
    ]
  },
  {
    category: 'Resume Builders',
    items: [{
        name: 'Reactive Resume',
        desc: 'Free open-source resume builder with clean, ATS-friendly output',
        url: 'https://rxresu.me',
        tag: 'Free'
      },
      {
        name: 'Novoresume',
        desc: 'Tech-focused templates with ATS optimization tips built in',
        url: 'https://novoresume.com',
        tag: 'Free / Pro'
      },
      {
        name: 'Canva',
        desc: 'Drag-and-drop resume templates with lots of design flexibility',
        url: 'https://www.canva.com/resumes/',
        tag: 'Free / Pro'
      },
      {
        name: 'Resume.io',
        desc: 'Professional templates with step-by-step guided editing',
        url: 'https://resume.io',
        tag: 'Paid'
      },
    ]
  },
  {
    category: 'Portfolio & Online Presence',
    items: [{
        name: 'GitHub Pages',
        desc: 'Host your portfolio for free directly from a GitHub repository',
        url: 'https://pages.github.com',
        tag: 'Free'
      },
      {
        name: 'LinkedIn',
        desc: 'Optimize your profile — most recruiters start their search here',
        url: 'https://linkedin.com',
        tag: 'Free'
      },
      {
        name: 'Vercel',
        desc: 'Deploy web projects instantly with a clean professional URL',
        url: 'https://vercel.com',
        tag: 'Free'
      },
      {
        name: 'Squarespace',
        desc: 'Build a polished portfolio or personal site with professional templates',
        url: 'https://www.squarespace.com',
        tag: 'Paid'
      },
    ]
  },
  {
    category: 'Financial Planning',
    items: [{
      name: 'Cash Compass',
      desc: 'Track your income, expenses, and spending habits while you job search — know your financial runway',
      url: 'https://jordan721.github.io/Development-Showcase/Personal_Projects/Cash-Compass/index.html',
      tag: 'Free'
    }, ]
  },
  {
    category: 'Job & Salary Research',
    items: [{
        name: 'levels.fyi',
        desc: 'Crowdsourced salary data for tech roles at top companies',
        url: 'https://www.levels.fyi',
        tag: 'Free'
      },
      {
        name: 'Glassdoor',
        desc: 'Company reviews, interview questions, and salary ranges',
        url: 'https://www.glassdoor.com',
        tag: 'Free'
      },
      {
        name: 'BuiltIn',
        desc: 'Tech-focused job board with culture info and company insights',
        url: 'https://builtin.com',
        tag: 'Free'
      },
      {
        name: 'Blind',
        desc: 'Anonymous tech community — comp discussions and company intel',
        url: 'https://www.teamblind.com',
        tag: 'Free'
      },
    ]
  },
];

/* ══════════════════════════════════════════════════════════
   WRITING RULES — for the Polish checker
   ══════════════════════════════════════════════════════════ */
const WRITING_RULES = [{
    pattern: /\bresponsible for\b/gi,
    label: 'Weak phrase: "responsible for"',
    suggestion: 'Start with an action verb instead — e.g. "Led", "Managed", "Owned"',
    type: 'red'
  },
  {
    pattern: /\bhelped (with|to)\b/gi,
    label: 'Vague phrase: "helped with/to"',
    suggestion: 'Be specific — e.g. "Contributed to", "Supported", or a direct action verb',
    type: 'yellow'
  },
  {
    pattern: /\bworked on\b/gi,
    label: 'Vague phrase: "worked on"',
    suggestion: 'Use a stronger verb — e.g. "Developed", "Built", "Implemented"',
    type: 'yellow'
  },
  {
    pattern: /\bassisted (with|in)\b/gi,
    label: 'Vague phrase: "assisted with/in"',
    suggestion: 'Try "Collaborated on", "Contributed to", or a direct action verb',
    type: 'yellow'
  },
  {
    pattern: /\bwas involved in\b/gi,
    label: 'Vague phrase: "was involved in"',
    suggestion: 'Describe your specific role directly',
    type: 'yellow'
  },
  {
    pattern: /\bparticipated in\b/gi,
    label: 'Vague phrase: "participated in"',
    suggestion: 'Try "Contributed to" or "Collaborated on"',
    type: 'yellow'
  },
  {
    pattern: /\b(was|were|is|are|been|being)\s+\w+ed\b/gi,
    label: 'Passive voice detected',
    suggestion: 'Flip to active voice — lead with the action, not what happened to you',
    type: 'red'
  },
  {
    pattern: /\bvery\b/gi,
    label: 'Filler word: "very"',
    suggestion: 'Remove it and use a stronger, more precise word',
    type: 'yellow'
  },
  {
    pattern: /\breally\b/gi,
    label: 'Filler word: "really"',
    suggestion: 'Remove it — be direct and specific',
    type: 'yellow'
  },
  {
    pattern: /\bjust\b/gi,
    label: 'Diminishing word: "just"',
    suggestion: '"Just" downplays your work — remove it',
    type: 'yellow'
  },
  {
    pattern: /\bbasically\b/gi,
    label: 'Filler word: "basically"',
    suggestion: 'State the fact directly without "basically"',
    type: 'yellow'
  },
  {
    pattern: /\bi (am|was|have been|have)\b/gi,
    label: 'First-person pronoun: "I"',
    suggestion: 'Resume bullets shouldn\'t start with "I" — drop it and lead with the verb',
    type: 'red'
  },
];

const STRONG_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'created', 'led', 'managed',
  'optimized', 'improved', 'increased', 'reduced', 'launched', 'deployed', 'architected',
  'engineered', 'automated', 'scaled', 'delivered', 'achieved', 'drove', 'spearheaded',
  'streamlined', 'established', 'transformed', 'coordinated', 'executed', 'migrated',
  'integrated', 'refactored', 'debugged', 'documented', 'analyzed', 'researched', 'collaborated',
];

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */
const STAGES = ['saved', 'applied', 'screening', 'interview', 'offer', 'declined', 'archived'];
let boardPeriod = 'all';
let boardLayout = localStorage.getItem('pt-board-layout') || 'swimlane';
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
};
const TOPBAR_ACTIONS = {
  dashboard: true,
  board: true,
  profile: false,
  learning: false,
  resume: false,
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
  actionBtn.style.display = TOPBAR_ACTIONS[view] ? '' : 'none';

  renderView(view);
}

function renderView(view) {
  if (view === 'dashboard') renderDashboard();
  if (view === 'board') renderBoard();
  if (view === 'profile') renderProfile();
  if (view === 'learning') renderLearning();
  if (view === 'resume') renderResume();
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════ */
function renderDashboard() {
  const jobs = state.jobs;

  const total = jobs.length;
  const applied = jobs.filter(j => j.stage === 'applied').length;
  const progress = jobs.filter(j => ['screening', 'interview'].includes(j.stage)).length;
  const offers = jobs.filter(j => j.stage === 'offer').length;
  const declined = jobs.filter(j => j.stage === 'declined').length;

  const scored = jobs.filter(j => j.fitScore !== null && j.fitScore !== undefined);
  const avgFit = scored.length ? Math.round(scored.reduce((a, j) => a + j.fitScore, 0) / scored.length) : null;

  // Set stat values; data-count + data-suffix drive the count-up animation
  const setStatCount = (id, val, suffix) => {
    suffix = suffix || '';
    const el = document.getElementById(id);
    el.dataset.count = val;
    el.dataset.suffix = suffix;
    el.textContent = val + suffix; // instant fallback before animation runs
  };
  setStatCount('stat-total', total);
  setStatCount('stat-applied', applied);
  setStatCount('stat-progress', progress);
  setStatCount('stat-offers', offers);
  setStatCount('stat-declined', declined);
  if (avgFit !== null) {
    setStatCount('stat-fit', avgFit, '%');
  } else {
    const fitEl = document.getElementById('stat-fit');
    fitEl.textContent = '—';
    delete fitEl.dataset.count;
  }
  document.getElementById('sidebar-job-count').textContent = `${total} job${total !== 1 ? 's' : ''} tracked`;

  // Gap aggregation
  const gapCount = {};
  jobs.forEach(j => (j.missing || []).forEach(skill => {
    gapCount[skill] = (gapCount[skill] || 0) + 1;
  }));
  const sortedGaps = Object.entries(gapCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const gapsEl = document.getElementById('dash-gaps');
  if (sortedGaps.length === 0) {
    gapsEl.innerHTML = '<p class="empty-msg">Add jobs with descriptions to see skill gaps.</p>';
  } else {
    gapsEl.innerHTML = sortedGaps.map(([skill, count]) =>
      `<span class="gap-tag">${skill} <span class="gap-count">${count}</span></span>`
    ).join('');
  }

  // Recent activity
  const recent = [...jobs].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 6);
  const recentEl = document.getElementById('dash-recent');
  if (recent.length === 0) {
    recentEl.innerHTML = '<p class="empty-msg">No jobs tracked yet.</p>';
  } else {
    recentEl.innerHTML = recent.map(j => `
      <div class="recent-item" data-job-id="${j.id}" style="cursor:pointer">
        <div>
          <div class="recent-role">${j.role}</div>
          <div class="recent-company">${j.company}</div>
        </div>
        <div class="recent-date">${formatDate(j.dateAdded)}</div>
      </div>
    `).join('');
    recentEl.querySelectorAll('.recent-item').forEach(el => {
      el.addEventListener('click', () => openJobDetail(el.dataset.jobId));
    });
  }

  // Pipeline bars
  const maxCount = Math.max(...STAGES.filter(s => s !== 'archived').map(s => jobs.filter(j => j.stage === s).length), 1);
  const barsEl = document.getElementById('dash-pipeline-bars');
  barsEl.innerHTML = STAGES.filter(s => s !== 'archived').map(stage => {
    const count = jobs.filter(j => j.stage === stage).length;
    const pct = Math.round((count / maxCount) * 100);
    return `
      <div class="pipeline-bar-row">
        <div class="pipeline-bar-label">${STAGE_LABELS[stage]}</div>
        <div class="pipeline-bar-track"><div class="pipeline-bar-fill" style="width:${pct}%"></div></div>
        <div class="pipeline-bar-count">${count}</div>
      </div>`;
  }).join('');

  // Top skills — green if matched in any tracked job
  const skillsEl = document.getElementById('dash-skills');
  const skills = state.profile.skills;
  if (skills.length === 0) {
    skillsEl.innerHTML = '<p class="empty-msg">Add skills in My Profile.</p>';
  } else {
    const matchedCountMap = {};
    jobs.forEach(j => (j.matched || []).forEach(ms => {
      matchedCountMap[ms] = (matchedCountMap[ms] || 0) + 1;
    }));
    skillsEl.innerHTML = skills.slice(0, 10).map(s => {
      const key = s.name.toLowerCase();
      const matchCount = Object.entries(matchedCountMap).reduce((sum, [ms, c]) =>
        (ms.includes(key) || key.includes(ms)) ? sum + c : sum, 0);
      const isMatched = matchCount > 0;
      return `<span class="skill-tag${isMatched ? ' skill-matched' : ''}" style="margin:3px">
        ${escHtml(s.name)}
        <span class="level">${isMatched ? `✓ ${matchCount} job${matchCount !== 1 ? 's' : ''}` : s.level}</span>
      </span>`;
    }).join('');
  }

  // Activity timeline — default to week view
  renderActivity('week');

  if (typeof animateDashboardStats === 'function') animateDashboardStats();
  if (typeof animateBars === 'function') animateBars('.pipeline-bar-fill');
}

/* ══════════════════════════════════════════════════════════
   JOB ACTIVITY TIMELINE
   ══════════════════════════════════════════════════════════ */
const ACT_DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ACT_MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ACT_MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function wireActivityFilters() {
  document.querySelectorAll('.activity-filter').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.activity-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderActivity(btn.dataset.period);
    };
  });
}

function wireCalClicks(el) {
  el.querySelectorAll('[data-day-jobs]').forEach(cell => {
    cell.addEventListener('click', () => openDayModal(cell.dataset.dayLabel, JSON.parse(cell.dataset.dayJobs)));
  });
}

function renderActivity(period = 'week') {
  const el = document.getElementById('dash-activity');
  const now = new Date();
  const jobs = state.jobs;

  wireActivityFilters();

  // ── WEEK: 7-day strip calendar ─────────────────────────
  if (period === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekCells = Array.from({
      length: 7
    }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dayJobs = jobs.filter(j => {
        const jd = new Date(j.dateAdded);
        return jd.getFullYear() === d.getFullYear() && jd.getMonth() === d.getMonth() && jd.getDate() === d.getDate();
      });
      const isToday = d.toDateString() === now.toDateString();
      const label = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      const ids = JSON.stringify(dayJobs.map(j => j.id));
      const cls = 'cal-week-day' + (isToday ? ' today' : '') + (dayJobs.length ? ' has-jobs' : '');
      const attrs = dayJobs.length ? ' data-day-jobs=\'' + ids + '\' data-day-label="' + label + '"' : '';
      const chips = dayJobs.slice(0, 2).map(j => '<div class="cal-job-chip">' + escHtml(j.role) + '</div>').join('');
      const more = dayJobs.length > 2 ? '<div class="cal-job-more">+' + (dayJobs.length - 2) + ' more</div>' : '';
      const inner = dayJobs.length ?
        '<div class="cal-week-jobs"><span class="cal-job-count">' + dayJobs.length + '</span>' + chips + more + '</div>' :
        '<div class="cal-week-empty">—</div>';
      return '<div class="' + cls + '"' + attrs + '>' +
        '<div class="cal-week-header">' +
        '<span class="cal-week-dayname">' + ACT_DAY_ABBR[d.getDay()] + '</span>' +
        '<span class="cal-week-datenum">' + d.getDate() + '</span>' +
        '</div>' + inner + '</div>';
    }).join('');
    el.innerHTML = '<div class="cal-week">' + weekCells + '</div>';
    wireCalClicks(el);
    return;
  }

  // ── MONTH: calendar grid ───────────────────────────────
  if (period === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const jobsByDay = {};
    jobs.forEach(j => {
      const d = new Date(j.dateAdded);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!jobsByDay[key]) jobsByDay[key] = [];
        jobsByDay[key].push(j);
      }
    });

    const dayCells = Array.from({
      length: totalCells
    }, (_, i) => {
      const cellDate = new Date(year, month, 1 - startOffset + i);
      const isCurrent = cellDate.getMonth() === month;
      const isToday = cellDate.toDateString() === now.toDateString();
      const cellJobs = isCurrent ? (jobsByDay[cellDate.getDate()] || []) : [];
      const label = cellDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      const ids = JSON.stringify(cellJobs.map(j => j.id));
      const cls = 'cal-month-cell' + (!isCurrent ? ' other-month' : '') + (isToday ? ' today' : '') + (cellJobs.length ? ' has-jobs' : '');
      const attrs = cellJobs.length ? ' data-day-jobs=\'' + ids + '\' data-day-label="' + label + '"' : '';
      const dot = cellJobs.length ? '<span class="cal-cell-dot">' + cellJobs.length + '</span>' : '';
      return '<div class="' + cls + '"' + attrs + '><span class="cal-cell-num">' + cellDate.getDate() + '</span>' + dot + '</div>';
    }).join('');

    const dayHeaders = ACT_DAY_ABBR.map(d => '<span>' + d + '</span>').join('');
    el.innerHTML = '<div class="cal-month">' +
      '<div class="cal-month-title">' + ACT_MONTH_LONG[month] + ' ' + year + '</div>' +
      '<div class="cal-month-daynames">' + dayHeaders + '</div>' +
      '<div class="cal-month-grid">' + dayCells + '</div>' +
      '</div>';
    wireCalClicks(el);
    return;
  }

  // ── YEAR: 12-month tile grid ───────────────────────────
  if (period === 'year') {
    const year = now.getFullYear();
    const monthJobs = Array.from({
      length: 12
    }, () => []);
    jobs.forEach(j => {
      const d = new Date(j.dateAdded);
      if (d.getFullYear() === year) monthJobs[d.getMonth()].push(j);
    });
    const maxCount = Math.max(...monthJobs.map(m => m.length), 1);

    const yearCells = ACT_MONTH_SHORT.map((name, i) => {
      const mJobs = monthJobs[i];
      const count = mJobs.length;
      const isCurrent = i === now.getMonth();
      const pct = Math.round((count / maxCount) * 100);
      const ids = JSON.stringify(mJobs.map(j => j.id));
      const label = ACT_MONTH_LONG[i] + ' ' + year;
      const cls = 'cal-year-month' + (count > 0 ? ' has-jobs' : '') + (isCurrent ? ' current-month' : '');
      const attrs = count > 0 ? ' data-day-jobs=\'' + ids + '\' data-day-label="' + label + '"' : '';
      const countText = count > 0 ? count + ' job' + (count !== 1 ? 's' : '') : '—';
      return '<div class="' + cls + '"' + attrs + '>' +
        '<div class="cal-year-month-name">' + name + '</div>' +
        '<div class="cal-year-bar-track"><div class="cal-year-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="cal-year-count">' + countText + '</div>' +
        '</div>';
    }).join('');

    el.innerHTML = '<div class="cal-year"><div class="cal-year-title">' + year + '</div>' +
      '<div class="cal-year-grid">' + yearCells + '</div></div>';
    wireCalClicks(el);
    return;
  }

  // ── ALL TIME: original list view ──────────────────────
  if (jobs.length === 0) {
    el.innerHTML = '<p class="empty-msg">No jobs tracked yet.</p>';
    return;
  }

  const groups = {};
  jobs.forEach(j => {
    const d = new Date(j.dateAdded);
    const key = d.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(j);
  });

  const sorted = Object.entries(groups).sort((a, b) => new Date(b[1][0].dateAdded) - new Date(a[1][0].dateAdded));

  el.innerHTML = sorted.map(([label, groupJobs]) => {
    const preview = groupJobs.slice(0, 3).map(j =>
      '<span class="activity-job-name">' + escHtml(j.role) + ' <span style="color:var(--text-muted)">@ ' + escHtml(j.company) + '</span></span>'
    ).join('');
    const extra = groupJobs.length > 3 ? '<span class="activity-extra">+' + (groupJobs.length - 3) + ' more</span>' : '';
    return '<div class="activity-row">' +
      '<div class="activity-date-col"><span class="activity-date">' + label + '</span>' +
      '<span class="activity-count">' + groupJobs.length + ' job' + (groupJobs.length !== 1 ? 's' : '') + '</span></div>' +
      '<div class="activity-jobs-col">' + preview + extra + '</div>' +
      '</div>';
  }).join('');
}

/* ══════════════════════════════════════════════════════════
   BOARD (KANBAN)
   ══════════════════════════════════════════════════════════ */
function boardInPeriod(job) {
  const d = new Date(job.dateAdded);
  const now = new Date();
  if (boardPeriod === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (boardPeriod === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (boardPeriod === 'year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

function renderBoard() {
  const showArchived = document.getElementById('show-archived').checked;
  const visibleStages = showArchived ? STAGES : STAGES.filter(s => s !== 'archived' && s !== 'declined');
  const board = document.getElementById('kanban-board');
  const periodJobs = state.jobs.filter(boardInPeriod);

  // Apply layout class
  board.className = `kanban kanban--${boardLayout}`;

  // Update layout toggle buttons
  document.querySelectorAll('.layout-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.layout === boardLayout);
  });

  if (boardLayout === 'columns') {
    board.innerHTML = visibleStages.map(stage => {
      const jobs = periodJobs.filter(j => j.stage === stage);
      return `
        <div class="kanban-col" data-stage="${stage}">
          <div class="col-stripe stripe-${stage}"></div>
          <div class="kanban-col-header">
            ${STAGE_LABELS[stage]}
            <span class="kanban-col-count">${jobs.length}</span>
          </div>
          <div class="kanban-col-body" data-stage="${stage}">
            ${jobs.length === 0
              ? `<div class="no-jobs-col">No jobs here</div>`
              : jobs.map(j => jobCardHTML(j)).join('')}
          </div>
        </div>`;
    }).join('');
  } else {
    board.innerHTML = visibleStages.map(stage => {
      const jobs = periodJobs.filter(j => j.stage === stage);
      return `
        <div class="swimlane-row" data-stage="${stage}">
          <div class="swimlane-label">
            <div class="col-stripe stripe-${stage}"></div>
            <div class="swimlane-label-inner">
              <span class="swimlane-stage-name">${STAGE_LABELS[stage]}</span>
              <span class="kanban-col-count">${jobs.length}</span>
            </div>
          </div>
          <div class="swimlane-cards" data-stage="${stage}">
            ${jobs.length === 0
              ? `<div class="no-jobs-col">No jobs here</div>`
              : jobs.map(j => jobCardHTML(j)).join('')}
          </div>
        </div>`;
    }).join('');
  }

  const dropSelector = boardLayout === 'columns' ? '.kanban-col-body' : '.swimlane-cards';
  let draggedJobId = null;

  board.querySelectorAll('.card-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      const job = state.jobs.find(j => j.id === id);
      if (!job) return;
      state.jobs = state.jobs.filter(j => j.id !== id);
      save();
      renderBoard();
      if (state.activeView === 'dashboard') renderDashboard();
      toast(`"${job.role}" deleted.`, 'success');
    });
  });

  board.querySelectorAll('.job-card').forEach(card => {
    card.addEventListener('click', () => openJobDetail(card.dataset.jobId));

    card.addEventListener('dragstart', e => {
      draggedJobId = card.dataset.jobId;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedJobId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      board.querySelectorAll(dropSelector).forEach(b => b.classList.remove('drag-over'));
    });
  });

  board.querySelectorAll(dropSelector).forEach(body => {
    const targetStage = body.dataset.stage;

    body.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    body.addEventListener('dragenter', e => {
      e.preventDefault();
      body.classList.add('drag-over');
    });

    body.addEventListener('dragleave', e => {
      if (!body.contains(e.relatedTarget)) body.classList.remove('drag-over');
    });

    body.addEventListener('drop', e => {
      e.preventDefault();
      body.classList.remove('drag-over');
      if (!draggedJobId) return;
      const job = state.jobs.find(j => j.id === draggedJobId);
      if (job && job.stage !== targetStage) {
        job.stage = targetStage;
        save();
        renderBoard();
        toast(`Moved to ${STAGE_LABELS[targetStage]}.`, 'success');
      }
      draggedJobId = null;
    });
  });

  // Wire board period filter buttons
  document.querySelectorAll('.board-filter').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.board-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      boardPeriod = btn.dataset.period;
      renderBoard();
    };
  });

  // Wire layout toggle buttons
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.onclick = () => {
      boardLayout = btn.dataset.layout;
      localStorage.setItem('pt-board-layout', boardLayout);
      renderBoard();
    };
  });

  if (typeof animateBoardCards === 'function') animateBoardCards();
}

function jobCardHTML(job) {
  const cls = fitBadgeClass(job.fitScore);
  const label = fitBadgeLabel(job.fitScore);
  return `
    <div class="job-card" data-job-id="${job.id}" draggable="true">
      <button class="card-delete-btn" data-delete-id="${job.id}" title="Delete job" draggable="false">&times;</button>
      <div class="job-card-role"><span class="drag-handle" title="Drag to move stage" draggable="false">&#8942;</span>${escHtml(job.role)}</div>
      <div class="job-card-company">${escHtml(job.company)}${job.location ? ' · ' + escHtml(job.location) : ''}</div>
      <div class="job-card-footer">
        <span class="job-card-date">${formatDate(job.dateAdded)}</span>
        <span class="fit-badge ${cls}">${label}</span>
      </div>
    </div>`;
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

/* ══════════════════════════════════════════════════════════
   JOB DETAIL MODAL
   ══════════════════════════════════════════════════════════ */
function openJobDetail(id) {
  const job = state.jobs.find(j => j.id === id);
  if (!job) return;
  state.activeJobId = id;

  document.getElementById('detail-title').textContent = `${job.role} @ ${job.company}`;
  document.getElementById('detail-meta').textContent = [job.location, formatDate(job.dateAdded)].filter(Boolean).join(' · ');

  // Salary
  const salaryRow = document.getElementById('detail-salary-row');
  if (job.salary) {
    document.getElementById('detail-salary').textContent = job.salary;
    salaryRow.style.display = '';
  } else {
    salaryRow.style.display = 'none';
  }

  // Date posted
  const datePostedRow = document.getElementById('detail-date-posted-row');
  if (job.datePosted) {
    document.getElementById('detail-date-posted').textContent = formatDate(job.datePosted + 'T12:00:00');
    datePostedRow.style.display = '';
  } else {
    datePostedRow.style.display = 'none';
  }

  // Benefits
  const benefitsRow = document.getElementById('detail-benefits-row');
  if (job.benefits) {
    const chips = parseBenefits(job.benefits);
    const el = document.getElementById('detail-benefits');
    if (chips.length) {
      el.innerHTML = chips.map(b => `<span class="benefit-chip">${escHtml(b)}</span>`).join('');
    } else {
      el.textContent = job.benefits;
    }
    benefitsRow.style.display = '';
  } else {
    benefitsRow.style.display = 'none';
  }

  // Department
  const departmentRow = document.getElementById('detail-department-row');
  if (job.department) {
    document.getElementById('detail-department').textContent = job.department;
    departmentRow.style.display = '';
  } else {
    departmentRow.style.display = 'none';
  }

  // Seniority badge
  const seniorityBadge = document.getElementById('detail-seniority');
  if (job.seniority) {
    seniorityBadge.textContent = job.seniority;
    seniorityBadge.style.display = '';
  } else {
    seniorityBadge.style.display = 'none';
  }

  // Job type badge
  const jobTypeBadge = document.getElementById('detail-job-type');
  if (job.jobType) {
    jobTypeBadge.textContent = job.jobType;
    jobTypeBadge.style.display = '';
  } else {
    jobTypeBadge.style.display = 'none';
  }

  // Work type badge
  const workTypeBadge = document.getElementById('detail-work-type');
  if (job.workType) {
    workTypeBadge.textContent = job.workType;
    workTypeBadge.style.display = '';
  } else {
    workTypeBadge.style.display = 'none';
  }

  // URL link
  const urlEl = document.getElementById('detail-url');
  if (job.url) {
    urlEl.href = job.url;
    urlEl.style.display = '';
  } else {
    urlEl.style.display = 'none';
  }

  // Fit ring
  const score = job.fitScore;
  const pct = score !== null && score !== undefined ? score : null;
  document.getElementById('detail-fit-pct').textContent = pct !== null ? `${pct}%` : '—';

  const ring = document.getElementById('fit-ring-fill');
  const circumference = 326.7;
  if (pct !== null) {
    const offset = circumference - (pct / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)';
  } else {
    ring.style.strokeDashoffset = circumference;
  }

  // Matched / missing
  document.getElementById('detail-matched').innerHTML =
    (job.matched || []).length ? job.matched.map(s => `<span class="skill-badge green">${s}</span>`).join('') : '<span style="font-size:12px;color:var(--text-muted)">None detected</span>';
  document.getElementById('detail-missing').innerHTML =
    (job.missing || []).length ? job.missing.map(s => `<span class="skill-badge red">${s}</span>`).join('') : '<span style="font-size:12px;color:var(--text-muted)">None — great fit!</span>';

  // Stage badge
  const stageBadge = document.getElementById('detail-stage-badge');
  stageBadge.textContent = STAGE_LABELS[job.stage];
  stageBadge.className = `stage-badge stage-${job.stage}`;

  // Description
  document.getElementById('detail-desc').textContent = job.description || 'No description provided.';

  // Notes
  document.getElementById('detail-notes').value = job.notes || '';

  // Stage select
  const stageSelect = document.getElementById('detail-stage-select');
  stageSelect.innerHTML = STAGES.map(s => `<option value="${s}" ${s===job.stage?'selected':''}>${STAGE_LABELS[s]}</option>`).join('');

  // Back button — only shown when opened from a calendar day click
  const backBtn = document.getElementById('detail-back-btn');
  if (dayModalContext) {
    backBtn.style.display = '';
    backBtn.onclick = () => {
      const ctx = dayModalContext;
      dayModalContext = null;
      closeModal('modal-detail');
      openDayModal(ctx.label, ctx.ids);
    };
  } else {
    backBtn.style.display = 'none';
    backBtn.onclick = null;
  }

  openModal('modal-detail');
}

/* ══════════════════════════════════════════════════════════
   ADD / EDIT JOB
   ══════════════════════════════════════════════════════════ */
function openAddJobModal(editId = null) {
  const job = editId ? state.jobs.find(j => j.id === editId) : null;

  document.getElementById('modal-job-title').textContent = job ? 'Edit Job' : 'Add New Job';
  document.getElementById('job-modal-back-btn').style.display = editId ? '' : 'none';
  document.getElementById('job-edit-id').value = editId || '';
  document.getElementById('job-role').value = job ? job.role || '' : '';
  document.getElementById('job-company').value = job ? job.company || '' : '';
  document.getElementById('job-department').value = job ? job.department || '' : '';
  document.getElementById('job-location').value = job ? job.location || '' : '';
  document.getElementById('job-url').value = job ? job.url || '' : '';
  document.getElementById('job-salary').value = job ? job.salary || '' : '';
  document.getElementById('job-date-posted').value = job ? job.datePosted || '' : '';
  document.getElementById('job-stage').value = job ? job.stage || 'saved' : '';
  document.getElementById('job-seniority').value = job ? job.seniority || '' : '';
  document.getElementById('job-type').value = job ? job.jobType || '' : '';
  document.getElementById('job-work-type').value = job ? job.workType || '' : '';
  document.getElementById('job-description').value = job ? job.description || '' : '';
  document.getElementById('job-benefits').value = job ? job.benefits || '' : '';
  document.getElementById('job-notes').value = job ? job.notes || '' : '';

  openModal('modal-job');
}

function saveJob() {
  const role = document.getElementById('job-role').value.trim();
  const company = document.getElementById('job-company').value.trim();
  if (!role || !company) {
    toast('Role and Company are required.', 'error');
    return;
  }

  const editId = document.getElementById('job-edit-id').value;
  const description = document.getElementById('job-description').value;
  const {
    score,
    matched,
    missing
  } = analyzeJob(description);

  const jobData = {
    role,
    company,
    department: document.getElementById('job-department').value.trim(),
    location: document.getElementById('job-location').value.trim(),
    url: document.getElementById('job-url').value.trim(),
    salary: document.getElementById('job-salary').value.trim(),
    datePosted: document.getElementById('job-date-posted').value,
    seniority: document.getElementById('job-seniority').value,
    jobType: document.getElementById('job-type').value,
    workType: document.getElementById('job-work-type').value,
    stage: document.getElementById('job-stage').value,
    description,
    benefits: document.getElementById('job-benefits').value.trim(),
    notes: document.getElementById('job-notes').value.trim(),
    fitScore: score,
    matched,
    missing,
  };

  if (editId) {
    const idx = state.jobs.findIndex(j => j.id === editId);
    if (idx !== -1) {
      state.jobs[idx] = {
        ...state.jobs[idx],
        ...jobData
      };
    }
  } else {
    state.jobs.push({
      id: uid(),
      dateAdded: new Date().toISOString(),
      ...jobData
    });
  }

  save();
  closeModal('modal-job');
  toast(editId ? 'Job updated.' : 'Job added!', 'success');
  renderView(state.activeView);
  if (editId) openJobDetail(editId);
}

/* ══════════════════════════════════════════════════════════
   PROFILE
   ══════════════════════════════════════════════════════════ */
function renderProfile() {
  renderSkillTags();
  renderCertTags();
  document.getElementById('profile-summary').value = state.profile.summary || '';
  renderCoverageBars();
  renderLinks();
}

function renderLinks() {
  const links = state.profile.links || {};
  ['linkedin', 'github', 'portfolio'].forEach(key => {
    const input = document.getElementById('link-' + key);
    const openBtn = document.getElementById('link-' + key + '-open');
    if (!input) return;
    input.value = links[key] || '';
    if (links[key]) {
      openBtn.href = links[key];
      openBtn.style.display = '';
    } else {
      openBtn.style.display = 'none';
    }
  });
}

function saveLinks() {
  state.profile.links = {
    linkedin: document.getElementById('link-linkedin').value.trim(),
    github: document.getElementById('link-github').value.trim(),
    portfolio: document.getElementById('link-portfolio').value.trim(),
  };
  save();
  renderLinks();
  toast('Links saved!', 'success');
}

function renderCertTags() {
  const container = document.getElementById('cert-tags-container');
  const certs = state.profile.certifications;
  if (certs.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="margin-top:8px">No certifications or degrees added yet.</p>';
    return;
  }
  container.innerHTML = certs.map((c, i) => `
    <span class="skill-tag">
      ${escHtml(c.name)}
      <span class="level">${c.type}</span>
      <span class="skill-tag-remove" data-index="${i}">✕</span>
    </span>
  `).join('');

  container.querySelectorAll('.skill-tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.certifications.splice(parseInt(btn.dataset.index), 1);
      save();
      renderCertTags();
    });
  });
}

function addCert() {
  const input = document.getElementById('cert-input');
  const type = document.getElementById('cert-type').value;
  const name = input.value.trim();
  if (!name) return;
  if (state.profile.certifications.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    toast('Already added.', 'error');
    return;
  }
  state.profile.certifications.push({
    name,
    type
  });
  input.value = '';
  save();
  renderCertTags();
  toast(`"${name}" added!`, 'success');
}

const SKILL_SHOW_LIMIT = 10;
const LEVELS = ['Beginner', 'Intermediate', 'Expert'];

function renderSkillTags() {
  const container = document.getElementById('skill-tags-container');
  const footer = document.getElementById('skill-footer');
  const skills = state.profile.skills;

  if (skills.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="margin-top:8px">No skills added yet.</p>';
    if (footer) footer.innerHTML = '';
    return;
  }

  if (typeof window._skillsExpanded === 'undefined') window._skillsExpanded = false;
  const showAll = window._skillsExpanded || skills.length <= SKILL_SHOW_LIMIT;
  const visible = showAll ? skills : skills.slice(0, SKILL_SHOW_LIMIT);

  container.innerHTML = visible.map((s, i) => `
    <span class="skill-tag">
      ${escHtml(s.name)}
      <button class="level level-btn" data-index="${i}" title="Click to change level">${s.level}</button>
      <span class="skill-tag-remove" data-index="${i}">✕</span>
    </span>
  `).join('');

  container.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const cur = state.profile.skills[idx].level;
      state.profile.skills[idx].level = LEVELS[(LEVELS.indexOf(cur) + 1) % LEVELS.length];
      save();
      reanalyzeAllJobs();
      renderSkillTags();
      if (state.activeView === 'dashboard') renderDashboard();
    });
  });

  container.querySelectorAll('.skill-tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.skills.splice(parseInt(btn.dataset.index), 1);
      save();
      reanalyzeAllJobs();
      renderProfile();
      if (state.activeView === 'dashboard') renderDashboard();
    });
  });

  if (footer) {
    const hidden = skills.length - SKILL_SHOW_LIMIT;
    const expandBtn = skills.length > SKILL_SHOW_LIMIT ?
      `<button class="skill-expand-toggle" id="skill-expand-toggle">${showAll ? 'Show fewer' : `Show ${hidden} more`}</button>` :
      '';
    footer.innerHTML = `
      <div class="skill-footer-left">${expandBtn}</div>
      <button class="skill-clear-btn" id="clear-skills-btn">Clear all</button>
    `;

    const toggleBtn = document.getElementById('skill-expand-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        window._skillsExpanded = !window._skillsExpanded;
        renderSkillTags();
      });
    }

    document.getElementById('clear-skills-btn').addEventListener('click', () => {
      if (!confirm(`Remove all ${skills.length} skill${skills.length !== 1 ? 's' : ''}?`)) return;
      state.profile.skills = [];
      window._skillsExpanded = false;
      save();
      reanalyzeAllJobs();
      renderProfile();
      if (state.activeView === 'dashboard') renderDashboard();
      toast('All skills cleared.', 'success');
    });
  }
}

function renderCoverageBars() {
  const el = document.getElementById('skill-coverage-bars');
  const skills = state.profile.skills;
  if (skills.length === 0) {
    el.innerHTML = '<p class="empty-msg">Add skills to see coverage.</p>';
    return;
  }

  const jobCount = state.jobs.length;
  const countMap = {};
  state.jobs.forEach(j => (j.matched || []).forEach(skill => {
    const match = skills.find(s => s.name.toLowerCase().includes(skill) || skill.includes(s.name.toLowerCase()));
    if (match) countMap[match.name] = (countMap[match.name] || 0) + 1;
  }));

  el.innerHTML = skills.map(s => {
    const count = countMap[s.name] || 0;
    const pct = jobCount > 0 ? Math.round((count / jobCount) * 100) : 0;
    return `
      <div class="coverage-row">
        <div class="coverage-skill">${escHtml(s.name)}</div>
        <div class="coverage-track"><div class="coverage-fill" style="width:${pct}%"></div></div>
        <div class="coverage-count">${count} jobs</div>
      </div>`;
  }).join('');

  if (typeof animateBars === 'function') animateBars('.coverage-fill');
}

function addSkill() {
  const input = document.getElementById('skill-input');
  const level = document.getElementById('skill-level').value;
  const name = input.value.trim();
  if (!name) return;
  if (state.profile.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    toast('Skill already added.', 'error');
    return;
  }
  state.profile.skills.push({
    name,
    level
  });
  input.value = '';
  save();
  reanalyzeAllJobs();
  renderProfile();
  if (typeof animateNewSkillTags === 'function') animateNewSkillTags(1);
  if (state.activeView === 'dashboard') renderDashboard();
  toast(`"${name}" added!`, 'success');
}

function bulkAddSkills() {
  const textarea = document.getElementById('bulk-skill-input');
  const level = document.getElementById('skill-level').value;
  const raw = textarea.value.trim();
  if (!raw) return;

  const names = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  let added = 0,
    skipped = 0;
  names.forEach(name => {
    if (state.profile.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      skipped++;
    } else {
      state.profile.skills.push({
        name,
        level
      });
      added++;
    }
  });

  textarea.value = '';
  document.getElementById('bulk-skill-area').style.display = 'none';
  save();
  reanalyzeAllJobs();
  renderProfile();
  if (added > 0 && typeof animateNewSkillTags === 'function') animateNewSkillTags(added);
  if (state.activeView === 'dashboard') renderDashboard();
  let msg = `${added} skill${added !== 1 ? 's' : ''} added`;
  if (skipped) msg += `, ${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped`;
  toast(msg, added > 0 ? 'success' : 'error');
}

function reanalyzeAllJobs() {
  state.jobs = state.jobs.map(j => {
    const {
      score,
      matched,
      missing
    } = analyzeJob(j.description);
    return {
      ...j,
      fitScore: score,
      matched,
      missing
    };
  });
  save();
}

/* ══════════════════════════════════════════════════════════
   LEARNING HUB
   ══════════════════════════════════════════════════════════ */
function renderLearning() {
  const showBookmarked = document.getElementById('show-bookmarked').checked;
  const grid = document.getElementById('learning-grid');

  // Aggregate skill gaps across all jobs
  const gapCount = {};
  state.jobs.forEach(j => (j.missing || []).forEach(skill => {
    gapCount[skill] = (gapCount[skill] || 0) + 1;
  }));

  // Find resources for gap skills
  let entries = Object.entries(gapCount)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count]) => ({
      skill,
      count,
      resource: LEARNING[skill] || null
    }))
    .filter(e => e.resource !== null);

  // Also include bookmarked skills even if not a current gap
  if (showBookmarked) {
    const bookmarkedNotInGaps = state.savedCourses
      .filter(skill => !entries.find(e => e.skill === skill))
      .map(skill => ({
        skill,
        count: 0,
        resource: LEARNING[skill] || null
      }))
      .filter(e => e.resource !== null);
    entries = [...entries, ...bookmarkedNotInGaps].filter(e => state.savedCourses.includes(e.skill));
  }

  if (entries.length === 0) {
    grid.innerHTML = `<p class="learning-empty">${
      showBookmarked
        ? 'No bookmarked courses yet.'
        : state.jobs.length === 0
          ? 'Add jobs with descriptions to get recommendations.'
          : 'No skill gaps detected — your profile matches your jobs well!'
    }</p>`;
    return;
  }

  grid.innerHTML = entries.map(({
    skill,
    count,
    resource
  }) => {
    const bookmarked = state.savedCourses.includes(skill);
    return `
      <div class="learning-card ${bookmarked ? 'bookmarked' : ''}" data-skill="${skill}">
        <div class="learning-card-top">
          <div class="learning-skill">${skill.charAt(0).toUpperCase()+skill.slice(1)}</div>
          <span class="learning-bookmark" data-bookmark="${skill}" title="Bookmark">${bookmarked ? '★' : '☆'}</span>
        </div>
        <div class="learning-course">${resource.course}</div>
        <div class="learning-provider">${resource.provider}</div>
        <div class="learning-meta">
          <span class="learning-tag">⏱ ${resource.time}</span>
          ${count > 0 ? `<span class="gap-count-badge">Missing in ${count} job${count!==1?'s':''}</span>` : ''}
        </div>
        <a class="btn-primary" href="${resource.url}" target="_blank" rel="noopener">View Course ↗</a>
      </div>`;
  }).join('');

  grid.querySelectorAll('.learning-bookmark').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.dataset.bookmark;
      const idx = state.savedCourses.indexOf(skill);
      if (idx === -1) state.savedCourses.push(skill);
      else state.savedCourses.splice(idx, 1);
      save();
      renderLearning();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   RESUME HUB
   ══════════════════════════════════════════════════════════ */
function renderResume() {
  renderResources();
}

/* ── File upload helpers ── */
function setDropZoneState(state, filename) {
  const zone = document.getElementById('resume-drop-zone');
  const icon = document.getElementById('file-drop-icon');
  const text = document.getElementById('file-drop-text');
  const hint = document.getElementById('file-drop-hint');
  if (state === 'loading') {
    zone.className = 'file-drop-zone';
    icon.textContent = '⏳';
    text.textContent = `Reading ${filename}…`;
    hint.textContent = 'Please wait';
  } else if (state === 'loaded') {
    zone.className = 'file-drop-zone loaded';
    icon.textContent = '✓';
    text.textContent = filename;
    hint.textContent = 'Text extracted — ready to scan';
  } else {
    zone.className = 'file-drop-zone';
    icon.textContent = '📄';
    text.textContent = 'Drop your resume here';
    hint.textContent = 'PDF, Word (.docx), or plain text (.txt)';
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readFilePDF(file) {
  if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js not loaded');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: buffer
  }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

async function readFileDOCX(file) {
  if (typeof mammoth === 'undefined') throw new Error('Mammoth not loaded');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({
    arrayBuffer: buffer
  });
  return result.value;
}

async function handleResumeFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  setDropZoneState('loading', file.name);
  try {
    let text = '';
    if (ext === 'txt') {
      text = await readFileAsText(file);
    } else if (ext === 'pdf') {
      text = await readFilePDF(file);
    } else if (ext === 'docx') {
      text = await readFileDOCX(file);
    } else {
      toast('Unsupported file type — use PDF, DOCX, or TXT.', 'error');
      setDropZoneState('idle');
      return;
    }
    document.getElementById('resume-text').value = text;
    setDropZoneState('loaded', file.name);
    toast('File loaded! Click "Scan for Skills" to analyze.', 'success');
  } catch {
    toast('Could not read file. Try pasting the text manually.', 'error');
    setDropZoneState('idle');
  }
}

function parseResume() {
  const text = document.getElementById('resume-text').value;
  if (!text.trim()) {
    toast('Paste your resume text first.', 'error');
    return;
  }

  const lower = text.toLowerCase();
  const found = [...KNOWN_SKILLS].filter(skill => lower.includes(skill));
  const container = document.getElementById('resume-parse-results');

  if (found.length === 0) {
    container.innerHTML = '<div class="parse-placeholder">No recognized tech skills found. Try including your skills section or more of your experience.</div>';
    return;
  }

  const alreadyHave = state.profile.skills.map(s => s.name.toLowerCase());
  const newSkills = found.filter(s => !alreadyHave.some(a => a.includes(s) || s.includes(a)));
  const existing = found.filter(s => alreadyHave.some(a => a.includes(s) || s.includes(a)));

  container.innerHTML = `
    <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">
      Found <strong style="color:var(--text)">${found.length}</strong> skills —
      <span style="color:var(--green)">${existing.length} already in profile</span>,
      <span style="color:var(--accent)">${newSkills.length} new</span>
    </div>
    ${found.map(skill => {
      const has = alreadyHave.some(a => a.includes(skill) || skill.includes(a));
      return `
        <div class="parsed-skill-row">
          <label style="display:flex;align-items:center;gap:8px;cursor:${has ? 'default' : 'pointer'}">
            <input type="checkbox" class="parse-skill-check" data-skill="${skill}"
              ${!has ? 'checked' : 'disabled'}
              style="accent-color:var(--accent);width:13px;height:13px;cursor:${has ? 'default' : 'pointer'}" />
            <span class="parsed-skill-name">${skill}</span>
          </label>
          ${has ? '<span class="parsed-already">✓ in profile</span>' : ''}
        </div>`;
    }).join('')}
    <div class="import-bar">
      <span class="import-count">${newSkills.length} new skill${newSkills.length !== 1 ? 's' : ''} ready to import</span>
      ${newSkills.length > 0 ? `<button class="btn-primary" id="import-skills-btn" style="font-size:12px;padding:6px 14px">Import Selected</button>` : ''}
    </div>`;

  const importBtn = document.getElementById('import-skills-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const checked = [...container.querySelectorAll('.parse-skill-check:not(:disabled):checked')];
      if (checked.length === 0) {
        toast('No new skills selected.', 'error');
        return;
      }
      checked.forEach(cb => {
        const name = cb.dataset.skill;
        if (!state.profile.skills.some(s => s.name.toLowerCase() === name)) {
          state.profile.skills.push({
            name,
            level: 'Intermediate'
          });
        }
      });
      save();
      reanalyzeAllJobs();
      toast(`${checked.length} skill${checked.length !== 1 ? 's' : ''} imported to your profile!`, 'success');
      parseResume();
    });
  }
}

async function scanPortfolio() {
  const raw = document.getElementById('portfolio-url').value.trim();
  if (!raw) {
    toast('Enter a GitHub or GitHub Pages URL first.', 'error');
    return;
  }

  let username = null;
  let specificRepo = null;

  try {
    const url = new URL(raw.startsWith('http') ? raw : 'https://' + raw);
    const host = url.hostname.toLowerCase();
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (host === 'github.com') {
      // https://github.com/username  or  https://github.com/username/repo
      username = pathParts[0] || null;
      specificRepo = pathParts[1] || null;
    } else if (host.endsWith('.github.io')) {
      // https://username.github.io  or  https://username.github.io/reponame/
      username = host.replace('.github.io', '');
      specificRepo = pathParts[0] || null;
    } else {
      toast('Only GitHub and GitHub Pages URLs are supported (github.com or username.github.io).', 'error');
      return;
    }
  } catch {
    toast('Invalid URL — paste a full GitHub or portfolio link.', 'error');
    return;
  }

  if (!username) {
    toast('Could not find a GitHub username in that URL.', 'error');
    return;
  }

  const resultsEl = document.getElementById('portfolio-results');
  resultsEl.innerHTML = '<div class="parse-placeholder">Fetching GitHub data…</div>';

  try {
    const termSet = new Set();

    // Fetch all user repos for languages + topics
    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=50&sort=updated`);
    if (reposRes.status === 404) {
      resultsEl.innerHTML = '<div class="parse-placeholder">GitHub user not found. Double-check the URL.</div>';
      return;
    }
    if (!reposRes.ok) throw new Error(`GitHub API ${reposRes.status}`);
    const repos = await reposRes.json();

    repos.forEach(repo => {
      if (repo.language) termSet.add(repo.language.toLowerCase());
      (repo.topics || []).forEach(t => termSet.add(t.toLowerCase()));
    });

    // If URL pointed at a specific repo, also fetch its full language breakdown
    if (specificRepo) {
      const langRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(specificRepo)}/languages`);
      if (langRes.ok) {
        const langs = await langRes.json();
        Object.keys(langs).forEach(l => termSet.add(l.toLowerCase()));
      }
    }

    const allTerms = [...termSet].join(' ');
    const found = [...KNOWN_SKILLS].filter(skill => allTerms.includes(skill));
    const sourceLabel = specificRepo ?
      `${repos.length} repos + "${specificRepo}" details` :
      `${repos.length} repos`;

    if (found.length === 0) {
      resultsEl.innerHTML = `<div class="parse-placeholder">No recognized tech skills found across ${sourceLabel}. Try the resume scanner instead.</div>`;
      return;
    }

    const alreadyHave = state.profile.skills.map(s => s.name.toLowerCase());
    const newSkills = found.filter(s => !alreadyHave.some(a => a.includes(s) || s.includes(a)));
    const existing = found.filter(s => alreadyHave.some(a => a.includes(s) || s.includes(a)));

    resultsEl.innerHTML = `
      <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">
        Found <strong style="color:var(--text)">${found.length}</strong> skills from ${sourceLabel} —
        <span style="color:var(--green)">${existing.length} already in profile</span>,
        <span style="color:var(--accent)">${newSkills.length} new</span>
      </div>
      ${found.map(skill => {
        const has = alreadyHave.some(a => a.includes(skill) || skill.includes(a));
        return `
          <div class="parsed-skill-row">
            <label style="display:flex;align-items:center;gap:8px;cursor:${has ? 'default' : 'pointer'}">
              <input type="checkbox" class="portfolio-skill-check" data-skill="${skill}"
                ${!has ? 'checked' : 'disabled'}
                style="accent-color:var(--accent);width:13px;height:13px;cursor:${has ? 'default' : 'pointer'}" />
              <span class="parsed-skill-name">${skill}</span>
            </label>
            ${has ? '<span class="parsed-already">✓ in profile</span>' : ''}
          </div>`;
      }).join('')}
      ${newSkills.length > 0 ? `
        <div class="import-bar">
          <span class="import-count">${newSkills.length} new skill${newSkills.length !== 1 ? 's' : ''} ready to import</span>
          <button class="btn-primary" id="import-portfolio-btn" style="font-size:12px;padding:6px 14px">Import Selected</button>
        </div>` : ''}`;

    const importBtn = document.getElementById('import-portfolio-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const checked = [...resultsEl.querySelectorAll('.portfolio-skill-check:not(:disabled):checked')];
        if (checked.length === 0) {
          toast('No new skills selected.', 'error');
          return;
        }
        checked.forEach(cb => {
          const name = cb.dataset.skill;
          if (!state.profile.skills.some(s => s.name.toLowerCase() === name)) {
            state.profile.skills.push({
              name,
              level: 'Intermediate'
            });
          }
        });
        save();
        reanalyzeAllJobs();
        toast(`${checked.length} skill${checked.length !== 1 ? 's' : ''} imported to your profile!`, 'success');
        scanPortfolio();
      });
    }
  } catch {
    resultsEl.innerHTML = '<div class="parse-placeholder">Could not reach GitHub. Check your connection or try again.</div>';
  }
}

function checkWriting() {
  const text = document.getElementById('polish-text').value;
  if (!text.trim()) {
    toast('Paste some text to check first.', 'error');
    return;
  }

  const container = document.getElementById('polish-results');
  const issues = [];

  WRITING_RULES.forEach(rule => {
    const matches = text.match(rule.pattern);
    if (matches) {
      const unique = [...new Set(matches.map(m => m.toLowerCase()))];
      issues.push({
        ...rule,
        matches: unique
      });
    }
  });

  const lowerText = text.toLowerCase();
  const usedStrong = STRONG_VERBS.filter(v => lowerText.includes(v));
  const score = Math.max(0, 100 - (issues.length * 12));
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';

  container.innerHTML = `
    <div class="polish-score">
      <span class="polish-score-label">Writing Score</span>
      <span class="polish-score-val" style="color:${scoreColor}">${score}/100</span>
      <span style="font-size:12px;color:var(--text-muted);margin-left:auto">${issues.length} issue${issues.length !== 1 ? 's' : ''} found</span>
    </div>
    ${issues.length === 0
      ? `<div class="polish-issue green">
           <div class="polish-found">Looks clean!</div>
           <div class="polish-suggestion">No common issues detected. Run it through Grammarly or the Hemingway Editor for deeper analysis.</div>
         </div>`
      : issues.map(issue => `
          <div class="polish-issue ${issue.type}">
            <div class="polish-found">${issue.label} — <em>"${issue.matches.join('", "')}"</em></div>
            <div class="polish-suggestion">💡 ${issue.suggestion}</div>
          </div>`).join('')}
    <div class="polish-issue ${usedStrong.length > 0 ? 'green' : 'yellow'}" style="margin-top:10px">
      ${usedStrong.length > 0
        ? `<div class="polish-found">Strong action verbs detected ✓</div>
           <div class="polish-suggestion">Good use of: ${usedStrong.join(', ')}</div>`
        : `<div class="polish-found">No strong action verbs found</div>
           <div class="polish-suggestion">Consider leading with verbs like: Built, Developed, Led, Optimized, Launched, Automated, Engineered…</div>`}
    </div>`;
}

function renderResources() {
  const grid = document.getElementById('resources-grid');
  grid.innerHTML = RESOURCES.map(cat => `
    <div class="resource-category">
      <div class="resource-category-title">${cat.category}</div>
      <div class="resource-row">
        ${cat.items.map(item => `
          <a class="resource-card" href="${item.url}" target="_blank" rel="noopener">
            <div class="resource-card-top">
              <div class="resource-name">${item.name}</div>
              <span class="resource-tag">${item.tag}</span>
            </div>
            <div class="resource-desc">${item.desc}</div>
            <span class="resource-link">Open ↗</span>
          </a>`).join('')}
      </div>
    </div>`).join('');
}

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

  // Topbar action (Add Job)
  document.getElementById('topbar-action').addEventListener('click', () => openAddJobModal());

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
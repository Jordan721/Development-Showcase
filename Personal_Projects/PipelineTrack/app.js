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
   STATE
   ══════════════════════════════════════════════════════════ */
const STAGES = ['saved', 'applied', 'screening', 'interview', 'offer', 'archived'];
const STAGE_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  archived: 'Archived'
};

let state = {
  jobs: [],
  profile: {
    skills: [],
    summary: ''
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
      summary: ''
    };
  } catch {
    state.profile = {
      skills: [],
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

/* ══════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════ */
const VIEW_TITLES = {
  dashboard: 'Dashboard',
  board: 'Job Board',
  profile: 'My Profile',
  learning: 'Learning Hub'
};
const TOPBAR_ACTIONS = {
  dashboard: true,
  board: true,
  profile: false,
  learning: false
};

function navigate(view) {
  state.activeView = view;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');

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

  const scored = jobs.filter(j => j.fitScore !== null && j.fitScore !== undefined);
  const avgFit = scored.length ? Math.round(scored.reduce((a, j) => a + j.fitScore, 0) / scored.length) : null;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-applied').textContent = applied;
  document.getElementById('stat-progress').textContent = progress;
  document.getElementById('stat-offers').textContent = offers;
  document.getElementById('stat-fit').textContent = avgFit !== null ? `${avgFit}%` : '—';
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

  // Top skills
  const skillsEl = document.getElementById('dash-skills');
  const skills = state.profile.skills;
  if (skills.length === 0) {
    skillsEl.innerHTML = '<p class="empty-msg">Add skills in My Profile.</p>';
  } else {
    skillsEl.innerHTML = skills.slice(0, 8).map(s =>
      `<span class="skill-tag" style="margin:3px">${s.name} <span class="level">${s.level}</span></span>`
    ).join('');
  }
}

/* ══════════════════════════════════════════════════════════
   BOARD (KANBAN)
   ══════════════════════════════════════════════════════════ */
function renderBoard() {
  const showArchived = document.getElementById('show-archived').checked;
  const visibleStages = showArchived ? STAGES : STAGES.filter(s => s !== 'archived');
  const board = document.getElementById('kanban-board');

  board.innerHTML = visibleStages.map(stage => {
    const jobs = state.jobs.filter(j => j.stage === stage);
    return `
      <div class="kanban-col">
        <div class="col-stripe stripe-${stage}"></div>
        <div class="kanban-col-header">
          ${STAGE_LABELS[stage]}
          <span class="kanban-col-count">${jobs.length}</span>
        </div>
        <div class="kanban-col-body">
          ${jobs.length === 0
            ? `<div class="no-jobs-col">No jobs here</div>`
            : jobs.map(j => jobCardHTML(j)).join('')}
        </div>
      </div>`;
  }).join('');

  board.querySelectorAll('.job-card').forEach(card => {
    card.addEventListener('click', () => openJobDetail(card.dataset.jobId));
  });
}

function jobCardHTML(job) {
  const cls = fitBadgeClass(job.fitScore);
  const label = fitBadgeLabel(job.fitScore);
  return `
    <div class="job-card" data-job-id="${job.id}">
      <div class="job-card-role">${escHtml(job.role)}</div>
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

/* ══════════════════════════════════════════════════════════
   JOB DETAIL MODAL
   ══════════════════════════════════════════════════════════ */
function openJobDetail(id) {
  const job = state.jobs.find(j => j.id === id);
  if (!job) return;
  state.activeJobId = id;

  document.getElementById('detail-title').textContent = `${job.role} @ ${job.company}`;
  document.getElementById('detail-meta').textContent = [job.location, formatDate(job.dateAdded)].filter(Boolean).join(' · ');

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

  openModal('modal-detail');
}

/* ══════════════════════════════════════════════════════════
   ADD / EDIT JOB
   ══════════════════════════════════════════════════════════ */
function openAddJobModal(editId = null) {
  const modal = document.getElementById('modal-job');
  const job = editId ? state.jobs.find(j => j.id === editId) : null;

  document.getElementById('modal-job-title').textContent = job ? 'Edit Job' : 'Add New Job';
  document.getElementById('job-edit-id').value = editId || '';
  document.getElementById('job-role').value = job?.role || '';
  document.getElementById('job-company').value = job?.company || '';
  document.getElementById('job-location').value = job?.location || '';
  document.getElementById('job-url').value = job?.url || '';
  document.getElementById('job-stage').value = job?.stage || 'saved';
  document.getElementById('job-description').value = job?.description || '';
  document.getElementById('job-notes').value = job?.notes || '';

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
    location: document.getElementById('job-location').value.trim(),
    url: document.getElementById('job-url').value.trim(),
    stage: document.getElementById('job-stage').value,
    description,
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
}

/* ══════════════════════════════════════════════════════════
   PROFILE
   ══════════════════════════════════════════════════════════ */
function renderProfile() {
  renderSkillTags();
  document.getElementById('profile-summary').value = state.profile.summary || '';
  renderCoverageBars();
}

function renderSkillTags() {
  const container = document.getElementById('skill-tags-container');
  const skills = state.profile.skills;
  if (skills.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="margin-top:8px">No skills added yet.</p>';
    return;
  }
  container.innerHTML = skills.map((s, i) => `
    <span class="skill-tag">
      ${escHtml(s.name)}
      <span class="level">${s.level}</span>
      <span class="skill-tag-remove" data-index="${i}">✕</span>
    </span>
  `).join('');

  container.querySelectorAll('.skill-tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.skills.splice(parseInt(btn.dataset.index), 1);
      save();
      reanalyzeAllJobs();
      renderProfile();
      if (state.activeView === 'dashboard') renderDashboard();
    });
  });
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
        <div class="coverage-count">${count} / ${jobCount} jobs</div>
      </div>`;
  }).join('');
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
  if (state.activeView === 'dashboard') renderDashboard();
  toast(`"${name}" added!`, 'success');
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

  // Close modals via [data-close]
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Save job
  document.getElementById('save-job-btn').addEventListener('click', saveJob);

  // Add skill
  document.getElementById('add-skill-btn').addEventListener('click', addSkill);
  document.getElementById('skill-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addSkill();
  });

  // Save summary
  document.getElementById('save-summary-btn').addEventListener('click', () => {
    state.profile.summary = document.getElementById('profile-summary').value;
    save();
    toast('Summary saved.', 'success');
  });

  // Show archived toggle
  document.getElementById('show-archived').addEventListener('change', () => renderBoard());

  // Show bookmarked toggle
  document.getElementById('show-bookmarked').addEventListener('change', () => renderLearning());

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
function init() {
  load();
  wireEvents();
  navigate('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
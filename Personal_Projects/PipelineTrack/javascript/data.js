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
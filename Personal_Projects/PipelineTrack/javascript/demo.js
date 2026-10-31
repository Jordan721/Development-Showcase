/* Install before application scripts: demo changes live only in this page's memory. */
(() => {
  'use strict';
  if (new URLSearchParams(window.location.search).get('demo') !== '1') return;

  const values = new Map();
  const storage = {
    getItem(key) { return values.get(String(key)) ?? null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
    clear() { values.clear(); },
    key(index) { return [...values.keys()][index] ?? null; },
    get length() { return values.size; }
  };
  // Fail closed: never seed or run a demo against the visitor's real storage.
  try {
    Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
  } catch {
    window.location.replace('index.html');
    return;
  }
  const day = offset => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const roles = [
    ['Frontend Developer', 'Northstar Studio', 'saved', 'JavaScript HTML CSS React accessibility', -2],
    ['Software Engineer', 'Cedar Labs', 'applied', 'JavaScript SQL Git testing REST APIs', -5],
    ['Web Developer', 'Harbor Digital', 'interview', 'HTML CSS JavaScript responsive design Git', -8],
    ['Data Analyst', 'Maple Insights', 'screening', 'SQL Excel Python data visualization', -6],
    ['Junior Developer', 'Juniper Works', 'offer', 'JavaScript HTML CSS Git SQL', -12],
    ['UI Developer', 'Beacon Creative', 'saved', 'CSS JavaScript Figma accessibility TypeScript', -1],
    ['Application Developer', 'Willow Systems', 'declined', 'Java SQL Spring Boot Docker', -15],
    ['Frontend Engineer', 'Summit Workshop', 'applied', 'React JavaScript TypeScript unit testing', -18]
  ];
  storage.setItem('pt_jobs', JSON.stringify(roles.map(([role, company, stage, skills, added], index) => ({
    id: `demo-job-${index + 1}`, role, company, stage,
    description: `Fictional sample listing. Build useful tools with ${skills}. Work with a collaborative team and communicate clearly.`,
    dateAdded: `${day(added)}T12:00:00`, dateApplied: stage === 'saved' ? '' : day(added + 1),
    deadline: stage === 'saved' ? day(index + 2) : '',
    location: 'New York, NY', workType: index % 2 ? 'Hybrid' : 'Remote',
    jobType: 'Full-time', seniority: 'Entry Level', department: '',
    salary: '', url: '', source: 'Other', notes: 'Fictional example for exploring PipelineTrack.',
    matched: [], missing: [], events: [],
    stageHistory: [{ stage, at: `${day(added + 1)}T12:00:00`, observed: false }]
  }))));
  storage.setItem('pt_profile', JSON.stringify({
    skills: ['JavaScript', 'HTML', 'CSS', 'SQL', 'Git'].map(name => ({ name, level: 'Intermediate' })),
    certifications: [], summary: 'Fictional demo profile: exploring frontend and software development roles.',
    links: { linkedin: '', github: '', portfolio: '' }
  }));
  storage.setItem('pt-onboarded', 'true');
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('workspace-preview').innerHTML = '<div><strong>Demo workspace · fictional data</strong><p>Explore the board, inspect skill fit, and try Analytics. Changes are temporary; reloading resets this demo.</p></div><a class="btn-secondary" href="index.html">Exit demo</a>';
  });
})();

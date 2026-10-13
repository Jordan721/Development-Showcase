'use strict';

const JOB_DEPARTMENT_VISUALS = {
  software: {
    label: 'Software',
    path: 'm8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18',
    color: 'var(--accent)'
  },
  engineering: {
    label: 'Engineering',
    path: 'M4 4h16v16H4zM8 8h8v8H8zM9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M20 9h3M1 15h3M20 15h3',
    color: 'var(--accent)'
  },
  data: {
    label: 'Data',
    path: 'M4 20V4M4 20h16M8 16v-4M12 16V7M16 16v-6M20 16V3',
    color: 'var(--green)'
  },
  design: {
    label: 'Design',
    path: 'm15 3 6 6-11 11-7 1 1-7L15 3ZM12 6l6 6M4 14l6 6',
    color: 'color-mix(in srgb, var(--accent) 40%, var(--red))'
  },
  product: {
    label: 'Product',
    path: 'M4 4h16v16H4zM4 9h16M9 9v11M13 13h4M13 16h4',
    color: 'var(--yellow)'
  },
  marketing: {
    label: 'Marketing',
    path: 'M3 9v6h5l12 5V4L8 9H3ZM8 15l2 6h4l-2-4M20 9h2v6h-2',
    color: 'var(--red)'
  },
  sales: {
    label: 'Sales',
    path: 'M3 17l6-6 4 4 8-11M15 4h6v6',
    color: 'var(--green)'
  },
  finance: {
    label: 'Finance',
    path: 'M12 2v20M17 6H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7',
    color: 'var(--yellow)'
  },
  people: {
    label: 'HR / People',
    path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-4M16 3a4 4 0 0 1 0 8',
    color: 'color-mix(in srgb, var(--accent) 50%, var(--red))'
  },
  legal: {
    label: 'Legal',
    path: 'M12 3v18M5 21h14M4 6h16M5 6l-3 7h6L5 6ZM19 6l-3 7h6l-3-7',
    color: 'var(--text-muted)'
  },
  it: {
    label: 'IT Operations',
    path: 'M3 3h18v7H3zM3 14h18v7H3zM7 6h1M7 17h1M12 6h5M12 17h5',
    color: 'color-mix(in srgb, var(--accent) 70%, var(--green))'
  },
  operations: {
    label: 'Operations',
    path: 'M3 4h18v5H3zM3 15h18v5H3zM8 9v6M16 9v6M7 6h1M7 17h1',
    color: 'color-mix(in srgb, var(--yellow) 60%, var(--accent))'
  },
  customer: {
    label: 'Customer Success',
    path: 'M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v7H3zM17 12h4v7h-4zM21 19a3 3 0 0 1-3 3h-6',
    color: 'var(--green)'
  },
  security: {
    label: 'Security',
    path: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4ZM8 12l3 3 5-6',
    color: 'var(--red)'
  },
  research: {
    label: 'Research',
    path: 'M9 2h6M10 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L14 9V2M7 16h10',
    color: 'color-mix(in srgb, var(--accent) 50%, var(--yellow))'
  },
  general: {
    label: 'General',
    path: 'M3 7h18v14H3zM8 7V3h8v4M3 12h18M10 12v3h4v-3',
    color: 'var(--text-muted)'
  }
};

function jobDepartmentVisual(job) {
  const role = String(job.role || '').toLowerCase();
  let department = String(job.department || '').trim();
  if (!department || job.departmentInferred) {
    // Specific fields take precedence over the broad engineering match.
    const match = [...DEPT_MAP].sort((a, b) => (a.dept === 'Engineering') - (b.dept === 'Engineering'))
      .find(entry => entry.keywords.some(keyword => ` ${role} `.includes(keyword)));
    department = match ? match.dept : department;
  }
  const text = department.toLowerCase();
  let key = ({
    'engineering': 'engineering',
    'data': 'data',
    'design': 'design',
    'product': 'product',
    'marketing': 'marketing',
    'sales': 'sales',
    'finance': 'finance',
    'hr / people': 'people',
    'legal': 'legal',
    'it operations': 'it',
    'operations': 'operations',
    'customer success': 'customer',
    'security': 'security',
    'research': 'research'
  })[text];
  if (/software|development/.test(text) || (key === 'engineering' && /software|developer|frontend|front-end|backend|back-end|full.?stack|web|mobile/.test(role))) key = 'software';
  if (!key) {
    const match = DEPT_MAP.find(entry => text.includes(entry.dept.toLowerCase()));
    if (match) key = jobDepartmentVisual({
      department: match.dept,
      role
    }).key;
  }
  key = key || 'general';
  return {
    key,
    ...JOB_DEPARTMENT_VISUALS[key],
    label: department && key === 'general' ? department : JOB_DEPARTMENT_VISUALS[key].label
  };
}

function jobDepartmentBadge(job, iconOnly = false) {
  const visual = jobDepartmentVisual(job);
  return `<span class="job-department-badge${iconOnly ? ' job-department-badge--icon' : ''}" style="--department-color:${visual.color}" title="${escHtml(visual.label)}"${iconOnly ? ` role="img" aria-label="${escHtml(visual.label)}"` : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${visual.path}" /></svg>${iconOnly ? '' : `<span>${escHtml(visual.label)}</span>`}</span>`;
}

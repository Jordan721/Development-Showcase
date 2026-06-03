'use strict';

/* ══════════════════════════════════════════════════════════
   INDUSTRY SKILLS — extends KNOWN_SKILLS from data.js
   Covers: Business Operations, IT Operations, Financial Operations,
           Project Management, Banking, Customer Success
   ══════════════════════════════════════════════════════════ */

[
  // ── Business Operations ──────────────────────────────────
  'process improvement', 'operations management', 'workflow automation',
  'kpi', 'kpis', 'stakeholder management', 'vendor management', 'forecasting',
  'strategic planning', 'business analysis', 'business analyst', 'process mapping',
  'lean', 'six sigma', 'sop', 'standard operating procedures', 'supply chain',
  'logistics', 'continuous improvement', 'erp', 'operational efficiency',
  'cross-functional', 'business operations', 'performance management',
  'reporting', 'data reporting', 'executive reporting',

  // IT Operations / Computer Operator
  'computer operator', 'computer operations', 'it operations',
  'data center operations', 'data center', 'mainframe', 'z/os', 'as400',
  'ibm i', 'batch processing', 'batch jobs', 'job scheduling',
  'system monitoring', 'network monitoring', 'console monitoring',
  'incident response', 'incident management', 'troubleshooting',
  'service desk', 'help desk', 'technical support', 'ticketing',
  'active directory', 'windows server', 'unix', 'shell scripting',
  'backup and recovery', 'backups', 'disaster recovery',
  'access control', 'change control', 'runbooks', 'sop',
  'shift handoff', 'production support', 'operations support',

  // ── Financial Operations ─────────────────────────────────
  'accounts payable', 'accounts receivable', 'financial analysis',
  'financial modeling', 'reconciliation', 'general ledger', 'gaap', 'ifrs',
  'quickbooks', 'sap', 'oracle financials', 'netsuite', 'financial reporting',
  'audit', 'internal audit', 'external audit', 'compliance', 'cash flow',
  'variance analysis', 'bookkeeping', 'tax', 'payroll', 'cost accounting',
  'budget management', 'financial planning', 'fp&a', 'treasury', 'month-end close',
  'expense management', 'procurement', 'financial operations',

  // ── Project Management ───────────────────────────────────
  'pmp', 'prince2', 'kanban', 'waterfall', 'resource planning', 'gantt',
  'ms project', 'asana', 'trello', 'monday.com', 'scope management',
  'change management', 'project lifecycle', 'program management',
  'portfolio management', 'deliverables', 'milestone tracking',
  'risk mitigation', 'dependency management', 'project coordination',
  'schedule management', 'pmo', 'project management office',

  // ── Banking ──────────────────────────────────────────────
  'banking operations', 'loan processing', 'loan origination', 'credit analysis',
  'credit underwriting', 'aml', 'anti-money laundering', 'kyc', 'know your customer',
  'regulatory compliance', 'core banking', 'swift', 'fdic', 'sox',
  'sarbanes-oxley', 'retail banking', 'commercial banking', 'mortgage',
  'underwriting', 'credit risk', 'market risk', 'fraud detection',
  'financial regulations', 'consumer banking', 'wire transfers',
  'banking software', 'teller', 'branch operations', 'lending',

  // ── Customer Success ─────────────────────────────────────
  'customer success', 'account management', 'customer retention',
  'churn reduction', 'churn prevention', 'customer onboarding', 'onboarding',
  'crm', 'salesforce', 'zendesk', 'hubspot', 'intercom', 'freshdesk',
  'nps', 'csat', 'customer satisfaction', 'customer journey', 'upselling',
  'cross-selling', 'sla', 'sla management', 'customer health scoring',
  'client relations', 'product adoption', 'customer experience', 'cx',
  'customer support', 'ticket management', 'escalation management',
  'renewal management', 'qbr', 'business reviews', 'voice of the customer',
].forEach(skill => KNOWN_SKILLS.add(skill));


/* ══════════════════════════════════════════════════════════
   INDUSTRY LEARNING RESOURCES — extends LEARNING from data.js
   ══════════════════════════════════════════════════════════ */

Object.assign(LEARNING, {

  // ── Business Operations ──────────────────────────────────
  'process improvement': {
    course: 'Business Analysis & Process Management',
    provider: 'Coursera',
    time: '~4mo',
    url: 'https://www.coursera.org/learn/business-process-management'
  },
  'lean': {
    course: 'Lean Six Sigma White Belt Certification',
    provider: 'Udemy',
    time: '~5h',
    url: 'https://www.udemy.com/course/lean-six-sigma-white-belt/'
  },
  'six sigma': {
    course: 'Six Sigma: Principles & Applications',
    provider: 'Udemy',
    time: '~8h',
    url: 'https://www.udemy.com/course/six-sigma-green-belt-certification/'
  },
  'business analysis': {
    course: 'Business Analysis Fundamentals',
    provider: 'Udemy',
    time: '~9h',
    url: 'https://www.udemy.com/course/business-analysis-fundamentals/'
  },
  'strategic planning': {
    course: 'Strategic Planning & Execution',
    provider: 'Coursera / UVA Darden',
    time: '~4mo',
    url: 'https://www.coursera.org/learn/uva-darden-strategic-planning-execution'
  },
  'erp': {
    course: 'SAP ERP Essential Training',
    provider: 'LinkedIn Learning',
    time: '~3h',
    url: 'https://www.linkedin.com/learning/sap-erp-essential-training'
  },

  // ── Financial Operations ─────────────────────────────────
  'financial analysis': {
    course: 'Financial Analysis & Financial Modeling',
    provider: 'Udemy',
    time: '~8h',
    url: 'https://www.udemy.com/course/financial-analysis/'
  },
  'financial modeling': {
    course: 'Financial Modeling & Valuation Analyst (FMVA)',
    provider: 'CFI',
    time: '~6mo',
    url: 'https://corporatefinanceinstitute.com/certifications/fmva/'
  },
  'gaap': {
    course: 'Accounting Foundations: GAAP',
    provider: 'LinkedIn Learning',
    time: '~2h',
    url: 'https://www.linkedin.com/learning/accounting-foundations-gaap'
  },
  'quickbooks': {
    course: 'QuickBooks Online Complete Training',
    provider: 'Udemy',
    time: '~9h',
    url: 'https://www.udemy.com/course/quickbooks-online/'
  },
  'fp&a': {
    course: 'FP&A Monthly Reporting',
    provider: 'CFI',
    time: '~3h',
    url: 'https://corporatefinanceinstitute.com/courses/fpa-monthly-reporting/'
  },
  'reconciliation': {
    course: 'Accounting: Account Reconciliation',
    provider: 'LinkedIn Learning',
    time: '~1h',
    url: 'https://www.linkedin.com/learning/accounting-foundations-account-reconciliation'
  },
  'payroll': {
    course: 'Payroll Fundamentals',
    provider: 'LinkedIn Learning',
    time: '~2h',
    url: 'https://www.linkedin.com/learning/payroll-fundamentals'
  },

  // ── Project Management ───────────────────────────────────
  'pmp': {
    course: 'PMP Certification Exam Prep',
    provider: 'Udemy',
    time: '~10h',
    url: 'https://www.udemy.com/course/pmp-certification-exam-prep-course-pmbok-6th-edition/'
  },
  'prince2': {
    course: 'PRINCE2 Foundation & Practitioner',
    provider: 'Udemy',
    time: '~9h',
    url: 'https://www.udemy.com/course/prince2-foundation-practitioner-exam-prep/'
  },
  'kanban': {
    course: 'Kanban Fundamentals',
    provider: 'Udemy',
    time: '~4h',
    url: 'https://www.udemy.com/course/kanban-fundamentals/'
  },
  'ms project': {
    course: 'Microsoft Project — A Complete Course',
    provider: 'Udemy',
    time: '~6h',
    url: 'https://www.udemy.com/course/microsoft-project-a-complete-course/'
  },
  'asana': {
    course: 'Asana for Beginners',
    provider: 'Udemy',
    time: '~3h',
    url: 'https://www.udemy.com/course/asana-project-management/'
  },
  'change management': {
    course: 'Organizational Change Management',
    provider: 'Coursera / ESCP',
    time: '~3mo',
    url: 'https://www.coursera.org/learn/change-management'
  },
  'program management': {
    course: 'Program Management Professional (PgMP) Prep',
    provider: 'LinkedIn Learning',
    time: '~5h',
    url: 'https://www.linkedin.com/learning/program-management-foundations'
  },

  // ── Banking ──────────────────────────────────────────────
  'credit analysis': {
    course: 'Credit Analysis Fundamentals',
    provider: 'CFI',
    time: '~5h',
    url: 'https://corporatefinanceinstitute.com/courses/credit-analysis-fundamentals/'
  },
  'aml': {
    course: 'Anti-Money Laundering (AML) Fundamentals',
    provider: 'Udemy',
    time: '~4h',
    url: 'https://www.udemy.com/course/anti-money-laundering-aml-fundamentals/'
  },
  'kyc': {
    course: 'KYC & AML Compliance',
    provider: 'Udemy',
    time: '~3h',
    url: 'https://www.udemy.com/course/kyc-aml-compliance/'
  },
  'underwriting': {
    course: 'Mortgage Underwriting Fundamentals',
    provider: 'LinkedIn Learning',
    time: '~2h',
    url: 'https://www.linkedin.com/learning/mortgage-underwriting-fundamentals'
  },
  'credit risk': {
    course: 'Credit Risk Management',
    provider: 'Coursera / NYU',
    time: '~4mo',
    url: 'https://www.coursera.org/learn/credit-risk-management'
  },
  'regulatory compliance': {
    course: 'Financial Regulatory Compliance',
    provider: 'Coursera',
    time: '~3mo',
    url: 'https://www.coursera.org/learn/financial-regulation'
  },

  // ── Customer Success ─────────────────────────────────────
  'customer success': {
    course: 'Customer Success Manager Fundamentals',
    provider: 'Udemy',
    time: '~6h',
    url: 'https://www.udemy.com/course/customer-success-manager-fundamentals/'
  },
  'salesforce': {
    course: 'Salesforce Certified Administrator',
    provider: 'Trailhead / Udemy',
    time: '~10h',
    url: 'https://www.udemy.com/course/salesforce-lex/'
  },
  'zendesk': {
    course: 'Zendesk Customer Service Fundamentals',
    provider: 'Zendesk / Udemy',
    time: '~4h',
    url: 'https://www.udemy.com/course/zendesk-customer-service/'
  },
  'hubspot': {
    course: 'HubSpot CRM Free Certification',
    provider: 'HubSpot Academy',
    time: '~3h',
    url: 'https://academy.hubspot.com/courses/crm-data-management'
  },
  'crm': {
    course: 'CRM Fundamentals',
    provider: 'LinkedIn Learning',
    time: '~2h',
    url: 'https://www.linkedin.com/learning/customer-relationship-management-crm-foundations'
  },
  'customer retention': {
    course: 'Customer Retention & Churn Prevention',
    provider: 'Udemy',
    time: '~4h',
    url: 'https://www.udemy.com/course/customer-retention/'
  },
  'account management': {
    course: 'Strategic Account Management',
    provider: 'LinkedIn Learning',
    time: '~3h',
    url: 'https://www.linkedin.com/learning/strategic-account-management'
  },
  'nps': {
    course: 'Net Promoter Score & Customer Experience',
    provider: 'LinkedIn Learning',
    time: '~1h',
    url: 'https://www.linkedin.com/learning/customer-experience-measurement'
  },
});

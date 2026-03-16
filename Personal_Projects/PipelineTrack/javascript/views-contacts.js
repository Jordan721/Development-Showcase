'use strict';

/* ══════════════════════════════════════════════════════════
   CONTACTS / NETWORK VIEW
   ══════════════════════════════════════════════════════════ */
let contactFilter = 'all';
let contactSort = 'recent';

function openContactModal(id) {
  const isEdit = !!id;
  document.getElementById('modal-contact-title').textContent = isEdit ? 'Edit Contact' : 'Add Contact';
  document.getElementById('contact-edit-id').value = id || '';
  const c = isEdit ? state.contacts.find(x => x.id === id) : null;
  document.getElementById('contact-name').value = c ? c.name : '';
  document.getElementById('contact-company').value = c ? (c.company || '') : '';
  document.getElementById('contact-role').value = c ? (c.role || '') : '';
  document.getElementById('contact-type').value = c ? (c.type || 'Recruiter') : 'Recruiter';
  document.getElementById('contact-email').value = c ? (c.email || '') : '';
  document.getElementById('contact-phone').value = c ? (c.phone || '') : '';
  document.getElementById('contact-linkedin').value = c ? (c.linkedin || '') : '';
  document.getElementById('contact-last-contact').value = c ? (c.lastContact || '') : '';
  document.getElementById('contact-next-followup').value = c ? (c.nextFollowUp || '') : '';
  document.getElementById('contact-notes').value = c ? (c.notes || '') : '';
  // Populate job select
  const sel = document.getElementById('contact-job-id');
  sel.innerHTML = '<option value="">— None —</option>' +
    state.jobs.map(j => `<option value="${j.id}"${c && c.jobId === j.id ? ' selected' : ''}>${escHtml(j.role + ' @ ' + j.company)}</option>`).join('');
  openModal('modal-contact');
}

function saveContact() {
  const name = document.getElementById('contact-name').value.trim();
  if (!name) {
    toast('Name is required.', 'error');
    return;
  }
  const id = document.getElementById('contact-edit-id').value || uid();
  const contact = {
    id,
    name,
    company: document.getElementById('contact-company').value.trim(),
    role: document.getElementById('contact-role').value.trim(),
    type: document.getElementById('contact-type').value,
    email: document.getElementById('contact-email').value.trim(),
    phone: document.getElementById('contact-phone').value.trim(),
    linkedin: document.getElementById('contact-linkedin').value.trim(),
    jobId: document.getElementById('contact-job-id').value,
    lastContact: document.getElementById('contact-last-contact').value,
    nextFollowUp: document.getElementById('contact-next-followup').value,
    notes: document.getElementById('contact-notes').value.trim(),
  };
  const idx = state.contacts.findIndex(x => x.id === id);
  if (idx >= 0) {
    contact.dateAdded = state.contacts[idx].dateAdded || new Date().toISOString().slice(0, 10);
    state.contacts[idx] = contact;
  } else {
    contact.dateAdded = new Date().toISOString().slice(0, 10);
    state.contacts.push(contact);
  }
  save();
  closeModal('modal-contact');
  toast(idx >= 0 ? 'Contact updated.' : 'Contact added.', 'success');
  if (state.activeView === 'contacts') renderContacts();
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  state.contacts = state.contacts.filter(c => c.id !== id);
  save();
  toast('Contact deleted.', '');
  renderContacts();
}

function renderContactStats() {
  const strip = document.getElementById('contacts-stat-strip');
  if (!strip) return;
  const contacts = state.contacts;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = contacts.filter(c => c.nextFollowUp && new Date(c.nextFollowUp + 'T00:00:00') <= today).length;
  const byType = {
    Recruiter: 0,
    HM: 0,
    Referral: 0,
    Other: 0
  };
  contacts.forEach(c => {
    if (byType[c.type] !== undefined) byType[c.type]++;
    else byType['Other']++;
  });
  strip.innerHTML = [{
      label: 'Total',
      value: contacts.length,
      color: ''
    },
    {
      label: 'Due Follow-up',
      value: overdue,
      color: overdue > 0 ? 'var(--red)' : ''
    },
    {
      label: 'Recruiters',
      value: byType.Recruiter,
      color: 'var(--accent)'
    },
    {
      label: 'Hiring Mgrs',
      value: byType.HM,
      color: '#a78bfa'
    },
    {
      label: 'Referrals',
      value: byType.Referral,
      color: 'var(--green)'
    },
  ].map(s => `<div class="contact-stat-chip">
    <div class="contact-stat-label">${s.label}</div>
    <div class="contact-stat-value" style="color:${s.color || 'var(--text)'}">${s.value}</div>
  </div>`).join('');
}

function contactCardHTML(c) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followupDate = c.nextFollowUp ? new Date(c.nextFollowUp + 'T00:00:00') : null;
  const isOverdue = followupDate && followupDate <= today;
  const typeCls = {
    Recruiter: 'type-recruiter',
    HM: 'type-hm',
    Referral: 'type-referral',
    Other: 'type-other'
  } [c.type] || 'type-other';
  const typeLabel = c.type === 'HM' ? 'Hiring Mgr' : c.type;
  const linkedJob = c.jobId ? state.jobs.find(j => j.id === c.jobId) : null;
  return `<div class="contact-card">
    <div class="contact-card-header">
      <div>
        <div class="contact-name">${escHtml(c.name)}</div>
        ${c.company || c.role ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${escHtml([c.role, c.company].filter(Boolean).join(' · '))}</div>` : ''}
      </div>
      <span class="contact-type-badge ${typeCls}">${typeLabel}</span>
    </div>
    <div class="contact-meta">
      ${c.email ? `<div class="contact-meta-row"><span class="contact-meta-icon">✉</span><a href="mailto:${escHtml(c.email)}" style="color:var(--text-muted);text-decoration:none">${escHtml(c.email)}</a></div>` : ''}
      ${c.phone ? `<div class="contact-meta-row"><span class="contact-meta-icon">☎</span>${escHtml(c.phone)}</div>` : ''}
      ${c.linkedin ? `<div class="contact-meta-row"><span class="contact-meta-icon">in</span><a href="${escHtml(c.linkedin)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-size:12px">LinkedIn ↗</a></div>` : ''}
    </div>
    <div class="contact-dates">
      ${c.lastContact ? `<div class="contact-date-item"><span class="contact-date-label">Last Contact</span><span class="contact-date-value">${formatDate(c.lastContact)}</span></div>` : ''}
      ${c.nextFollowUp ? `<div class="contact-date-item"><span class="contact-date-label">Follow-up</span><span class="contact-date-value${isOverdue ? ' overdue' : ''}">${isOverdue ? '⚠ ' : ''}${formatDate(c.nextFollowUp)}</span></div>` : ''}
    </div>
    ${linkedJob ? `<div><span class="contact-linked-job" data-job-id="${linkedJob.id}">📋 ${escHtml(linkedJob.role + ' @ ' + linkedJob.company)}</span></div>` : ''}
    ${c.notes ? `<div style="font-size:12px;color:var(--text-muted);line-height:1.5;margin-top:2px">${escHtml(c.notes)}</div>` : ''}
    <div class="contact-card-footer">
      <button class="btn-secondary contact-edit-btn" data-id="${c.id}" style="font-size:11px;padding:4px 10px">Edit</button>
      <button class="btn-ghost contact-delete-btn" data-id="${c.id}" style="font-size:11px">Delete</button>
    </div>
  </div>`;
}

function renderContacts() {
  renderContactStats();
  const search = (document.getElementById('contacts-search') || {}).value || '';
  const sort = (document.getElementById('contacts-sort') || {}).value || 'recent';
  let contacts = [...state.contacts];
  // Filter by type
  if (contactFilter !== 'all') contacts = contacts.filter(c => c.type === contactFilter);
  // Search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    contacts = contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q)
    );
  }
  // Sort
  if (sort === 'name') contacts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'company') contacts.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
  else if (sort === 'followup') contacts.sort((a, b) => {
    if (!a.nextFollowUp && !b.nextFollowUp) return 0;
    if (!a.nextFollowUp) return 1;
    if (!b.nextFollowUp) return -1;
    return a.nextFollowUp.localeCompare(b.nextFollowUp);
  });
  else contacts.sort((a, b) => (b.lastContact || '').localeCompare(a.lastContact || ''));

  const grid = document.getElementById('contacts-grid');
  if (!grid) return;
  if (contacts.length === 0) {
    grid.innerHTML = emptyStateHTML('🤝', 'No contacts yet', 'Add recruiters, hiring managers, and connections');
  } else {
    grid.innerHTML = contacts.map(c => contactCardHTML(c)).join('');
    grid.querySelectorAll('.contact-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openContactModal(btn.dataset.id));
    });
    grid.querySelectorAll('.contact-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteContact(btn.dataset.id));
    });
    grid.querySelectorAll('.contact-linked-job').forEach(el => {
      el.addEventListener('click', () => openJobDetail(el.dataset.jobId));
    });
  }
  // Wire type filter buttons
  document.querySelectorAll('.contact-filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.contact-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      contactFilter = btn.dataset.type;
      renderContacts();
    };
  });
  // Wire search + sort
  const searchEl = document.getElementById('contacts-search');
  const sortEl = document.getElementById('contacts-sort');
  if (searchEl) searchEl.oninput = () => renderContacts();
  if (sortEl) sortEl.onchange = () => {
    contactSort = sortEl.value;
    renderContacts();
  };
}
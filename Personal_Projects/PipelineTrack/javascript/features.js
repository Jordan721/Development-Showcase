'use strict';

/* ══════════════════════════════════════════════════════════
   FEATURES — deadline reminders · notes timeline · resume versioning
   Loaded after app.js; patches global functions and injects
   UI into existing modals via DOMContentLoaded.
   ══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   DEADLINE REMINDERS
   Adds an "Apply by" date field to the Add / Edit form and
   surfaces a warning banner on the dashboard for any jobs
   with a deadline within the next 7 days.
   ══════════════════════════════════════════════════════════ */

function deadlineDaysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(dateStr + 'T00:00:00');
  return Math.round((dl - today) / (1000 * 60 * 60 * 24));
}

function deadlineLabel(dateStr) {
  const d = deadlineDaysLeft(dateStr);
  if (d === null) return null;
  if (d < 0) return {
    text: 'Deadline passed',
    cls: 'deadline-urgent'
  };
  if (d === 0) return {
    text: 'Due today!',
    cls: 'deadline-urgent'
  };
  if (d === 1) return {
    text: 'Due tomorrow',
    cls: 'deadline-urgent'
  };
  if (d <= 7) return {
    text: `Due in ${d} days`,
    cls: 'deadline-soon'
  };
  return {
    text: 'Due ' + new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    cls: 'deadline-ok'
  };
}

function renderDeadlineBanner() {
  const banner = document.getElementById('deadline-banner');
  if (!banner) return;

  const urgent = state.jobs.filter(j => {
    if (!j.deadline) return false;
    if (j.stage === 'declined' || j.stage === 'archived' || j.stage === 'offer') return false;
    const d = deadlineDaysLeft(j.deadline);
    return d !== null && d <= 7;
  });

  if (urgent.length === 0) {
    banner.style.display = 'none';
    return;
  }

  urgent.sort((a, b) => deadlineDaysLeft(a.deadline) - deadlineDaysLeft(b.deadline));

  banner.style.display = '';
  banner.innerHTML =
    '<span class="deadline-banner-icon">⏰</span>' +
    '<span><strong>' + urgent.length + ' job' + (urgent.length !== 1 ? 's' : '') + '</strong> with an upcoming deadline: ' +
    urgent.map(j => {
      const lbl = deadlineLabel(j.deadline);
      return '<span class="' + lbl.cls + '">' + escHtml(j.role) + ' @ ' + escHtml(j.company) + ' — ' + lbl.text + '</span>';
    }).join(', ') +
    '</span>';
}


/* ══════════════════════════════════════════════════════════
   NOTES TIMELINE
   Replaces the plain notes textarea in the detail modal with
   a timestamped activity log. The edit-form notes field
   (job.notes) is kept and still accessible via Edit Job.
   ══════════════════════════════════════════════════════════ */

function migrateNotes(job) {
  /* On first open, lift any existing flat note into the log */
  if (!job.notesLog && job.notes && job.notes.trim()) {
    job.notesLog = [{
      text: job.notes.trim(),
      ts: job.dateAdded || new Date().toISOString()
    }];
    save();
  }
  if (!job.notesLog) job.notesLog = [];
}

function fmtTs(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function renderNotesTimeline(jobId) {
  const wrapper = document.getElementById('notes-timeline-wrapper');
  if (!wrapper) return;
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;

  migrateNotes(job);

  const TRUNCATE = 120; /* chars before collapsing */

  const entries = job.notesLog;
  const listHtml = entries.length === 0 ?
    '<div class="notes-empty">No entries yet — add one below.</div>' :
    entries.slice().reverse().map((e, ri) => {
      const realIdx = entries.length - 1 - ri;
      const long = e.text.length > TRUNCATE;
      const preview = long ? escHtml(e.text.slice(0, TRUNCATE)) + '…' : escHtml(e.text);
      const full = escHtml(e.text);
      const textHtml = long ?
        '<span class="note-preview">' + preview + '</span>' +
        '<span class="note-full" style="display:none">' + full + '</span>' +
        '<button class="note-expand-btn" data-expanded="0">show more</button>' :
        escHtml(e.text);
      return (
        '<div class="note-entry">' +
        '<div class="note-ts">' + fmtTs(e.ts) + '</div>' +
        '<div class="note-text">' + textHtml + '</div>' +
        '<button class="note-entry-delete" data-idx="' + realIdx + '" title="Remove">✕</button>' +
        '</div>'
      );
    }).join('');

  wrapper.innerHTML =
    '<div class="notes-timeline-header">Activity Log</div>' +
    '<div class="notes-timeline" id="notes-timeline-list">' + listHtml + '</div>' +
    '<div class="note-add-row">' +
    '<input class="note-add-input" id="note-add-input" type="text" placeholder="Add a note…" />' +
    '<button class="btn-secondary note-add-btn" id="note-add-btn">Add</button>' +
    '</div>';

  /* Expand / collapse long entries */
  wrapper.querySelectorAll('.note-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = btn.closest('.note-text');
      const preview = entry.querySelector('.note-preview');
      const full = entry.querySelector('.note-full');
      const expanded = btn.dataset.expanded === '1';
      preview.style.display = expanded ? '' : 'none';
      full.style.display = expanded ? 'none' : '';
      btn.textContent = expanded ? 'show more' : 'show less';
      btn.dataset.expanded = expanded ? '0' : '1';
    });
  });

  /* Delete entry */
  wrapper.querySelectorAll('.note-entry-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      job.notesLog.splice(parseInt(btn.dataset.idx, 10), 1);
      save();
      renderNotesTimeline(jobId);
    });
  });

  /* Add entry */
  const addInput = document.getElementById('note-add-input');
  const addBtn = document.getElementById('note-add-btn');

  function submitNote() {
    const text = addInput.value.trim();
    if (!text) return;
    job.notesLog.push({
      text,
      ts: new Date().toISOString()
    });
    save();
    renderNotesTimeline(jobId);
  }

  addBtn.addEventListener('click', submitNote);
  addInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitNote();
  });
}


/* ══════════════════════════════════════════════════════════
   SAVE JOB HOOK
   Wraps saveJob() to capture deadline and resumeVersion from
   the form before the modal closes, then persists them onto
   the saved job object.
   ══════════════════════════════════════════════════════════ */

(function patchSaveJob() {
  const _orig = window.saveJob;

  window.saveJob = function () {
    /* Capture before _orig closes and clears the modal */
    const editId = document.getElementById('job-edit-id').value;
    const deadline = (document.getElementById('job-deadline') || {}).value || '';
    const resumeVersion = ((document.getElementById('job-resume-version') || {}).value || '').trim();

    _orig(); /* saves job, closes modal, re-renders view */

    /* Attach extra fields to the job that was just saved */
    const targetId = editId || (state.jobs.length ? state.jobs[state.jobs.length - 1].id : null);
    if (targetId) {
      const job = state.jobs.find(j => j.id === targetId);
      if (job) {
        job.deadline = deadline;
        job.resumeVersion = resumeVersion;
        save();
      }
    }
  };
}());


/* ══════════════════════════════════════════════════════════
   OPEN DETAIL HOOK
   Wraps openJobDetail() to populate the extra meta rows and
   render the notes timeline after the base function runs.
   ══════════════════════════════════════════════════════════ */

(function patchOpenJobDetail() {
  const _orig = window.openJobDetail;

  window.openJobDetail = function (id) {
    _orig(id);

    const job = state.jobs.find(j => j.id === id);
    if (!job) return;

    /* — Apply-by deadline row — */
    const dlRow = document.getElementById('detail-deadline-row');
    const dlVal = document.getElementById('detail-deadline-val');
    if (dlRow && dlVal) {
      if (job.deadline) {
        const lbl = deadlineLabel(job.deadline);
        const dateText = new Date(job.deadline + 'T00:00:00').toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        dlVal.textContent = lbl ? dateText + ' — ' + lbl.text : dateText;
        dlVal.className = 'detail-meta-value ' + (lbl ? lbl.cls : '');
        dlRow.style.display = '';
      } else {
        dlRow.style.display = 'none';
      }
    }

    /* — Resume version row — */
    const rvRow = document.getElementById('detail-resume-version-row');
    const rvVal = document.getElementById('detail-resume-version-val');
    if (rvRow && rvVal) {
      if (job.resumeVersion) {
        rvVal.textContent = job.resumeVersion;
        rvRow.style.display = '';
      } else {
        rvRow.style.display = 'none';
      }
    }

    /* — Notes timeline — */
    renderNotesTimeline(id);
  };
}());


/* ══════════════════════════════════════════════════════════
   OPEN ADD / EDIT HOOK
   Wraps openAddJobModal() to pre-fill deadline and
   resumeVersion when editing an existing job.
   ══════════════════════════════════════════════════════════ */

(function patchOpenAddJobModal() {
  const _orig = window.openAddJobModal;

  window.openAddJobModal = function (editId = null) {
    _orig(editId);

    const job = editId ? state.jobs.find(j => j.id === editId) : null;
    const dlEl = document.getElementById('job-deadline');
    const rvEl = document.getElementById('job-resume-version');

    if (dlEl) dlEl.value = job ? (job.deadline || '') : '';
    if (rvEl) rvEl.value = job ? (job.resumeVersion || '') : '';
  };
}());


/* ══════════════════════════════════════════════════════════
   DASHBOARD HOOK
   Wraps renderDashboard() so the deadline banner is refreshed
   every time the dashboard re-renders.
   ══════════════════════════════════════════════════════════ */

(function patchRenderDashboard() {
  const _orig = window.renderDashboard;

  window.renderDashboard = function () {
    _orig();
    renderDeadlineBanner();
  };
}());


/* ══════════════════════════════════════════════════════════
   INIT
   Injects feature HTML into the existing modals once on load,
   then runs an initial deadline banner render.
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Deadline banner slot at top of dashboard view ── */
  const dashView = document.getElementById('view-dashboard');
  if (dashView) {
    const banner = document.createElement('div');
    banner.id = 'deadline-banner';
    banner.className = 'deadline-banner';
    banner.style.display = 'none';
    dashView.insertBefore(banner, dashView.querySelector('.stat-grid'));
  }

  /* ── Apply-by + Resume Used fields in Add / Edit Job modal ── */
  /* Placed after the Stage/Seniority/JobType/WorkType row, before the description */
  const stageRow = document.getElementById('job-stage') &&
    document.getElementById('job-stage').closest('.form-row');
  if (stageRow) {
    const row = document.createElement('div');
    row.className = 'form-row two-col';
    row.innerHTML =
      '<div class="form-group">' +
      '<label class="form-label">Apply by <span class="label-hint">(deadline)</span></label>' +
      '<input type="date" class="text-input" id="job-deadline" />' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">Resume Used <span class="label-hint">(version / label)</span></label>' +
      '<input type="text" class="text-input" id="job-resume-version" placeholder="e.g. SWE focus v2" />' +
      '</div>';
    stageRow.insertAdjacentElement('afterend', row);
  }

  /* ── Deadline + resume version meta rows in Detail modal ── */
  const benefitsRow = document.getElementById('detail-benefits-row');
  if (benefitsRow) {
    benefitsRow.insertAdjacentHTML('afterend',
      '<div class="detail-meta-row" id="detail-deadline-row" style="display:none">' +
      '<span class="detail-meta-label">Apply by</span>' +
      '<span class="detail-meta-value" id="detail-deadline-val"></span>' +
      '</div>' +
      '<div class="detail-meta-row" id="detail-resume-version-row" style="display:none">' +
      '<span class="detail-meta-label">Resume Used</span>' +
      '<span class="detail-meta-value" id="detail-resume-version-val"></span>' +
      '</div>'
    );
  }

  /* ── Notes timeline — replace detail notes textarea ── */
  const detailNotes = document.getElementById('detail-notes');
  if (detailNotes) {
    const notesGroup = detailNotes.closest('.form-group');
    if (notesGroup) {
      notesGroup.style.display = 'none'; /* hide the plain textarea — timeline takes over */
      const wrapper = document.createElement('div');
      wrapper.id = 'notes-timeline-wrapper';
      wrapper.className = 'notes-timeline-wrapper';
      notesGroup.insertAdjacentElement('afterend', wrapper);
    }
  }
});
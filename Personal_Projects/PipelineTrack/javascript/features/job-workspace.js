/* Job preparation, posting archive, offer decisions, and calendar downloads. */
const PREP_CHECKS = ['Research the company', 'Review the role requirements', 'Prepare examples of your work', 'Practice your introduction', 'Check meeting link or travel plans'];
const OFFER_FIELDS = [
  ['compensation', 'Total compensation', 'text'], ['benefits', 'Offer benefits', 'textarea'],
  ['responseDeadline', 'Response deadline', 'date'], ['priorities', 'Personal priorities', 'textarea'],
  ['negotiation', 'Negotiation notes', 'textarea'], ['decision', 'Decision notes', 'textarea']
];

function normalizeJobWorkspace(job) {
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const string = value => typeof value === 'string' ? value : '';
  const prep = object(job.interviewPrep);
  return {
    rounds: (Array.isArray(prep.rounds) ? prep.rounds : []).filter(r => r && typeof r === 'object').map(r => ({
      id: /^[a-z0-9_-]+$/i.test(string(r.id)) ? r.id : uid(), title: string(r.title), interviewer: string(r.interviewer),
      date: string(r.date), time: string(r.time), questions: string(r.questions), reflection: string(r.reflection)
    })),
    checks: PREP_CHECKS.map((_, i) => prep.checks?.[i] === true),
    offer: Object.fromEntries(OFFER_FIELDS.map(([key]) => {
      const worksheet = object(job.offerWorksheet);
      const fallback = key === 'compensation' ? job.offerMilestone?.salaryOffered : key === 'responseDeadline' ? job.offerMilestone?.responseDeadline : '';
      return [key, string(Object.hasOwn(worksheet, key) ? worksheet[key] : fallback)];
    }))
  };
}

function workspaceField(id, label, value, type = 'text') {
  return `<label class="job-tool-field" for="${id}"><span>${label}</span>${type === 'textarea'
    ? `<textarea id="${id}" class="text-area" rows="3">${escHtml(value || '')}</textarea>`
    : `<input id="${id}" class="text-input" type="${type}" value="${escHtml(value || '')}">`}</label>`;
}

function jobToolHeading(title, subtitle, icon) {
  const paths = {
    interview: '<rect x="4" y="5" width="16" height="13" rx="3"/><path d="m8 18-2 3v-3m3-8h6m-6 4h4"/>',
    offer: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6m-6 4h6m-6 4h3"/>',
    archive: '<path d="M5 8v12h14V8M3 4h18v4H3zM9 12h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h3"/>'
  };
  return `<summary><span class="job-tool-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[icon]}</svg></span><span class="job-tool-heading"><span class="job-tool-title">${title}</span><span class="job-tool-subtitle">${subtitle}</span></span><span class="job-tool-chevron" aria-hidden="true">⌄</span></summary>`;
}

function renderPrepRound(round) {
  const card = document.createElement('fieldset');
  card.className = 'prep-round';
  card.dataset.roundId = round.id;
  card.innerHTML = `<legend>Interview round</legend><div class="job-tool-grid">${
    [['title', 'Round name', 'text'], ['interviewer', 'Interviewer names', 'text'], ['date', 'Round date', 'date'], ['time', 'Round time', 'time'],
      ['questions', 'Questions to ask', 'textarea'], ['reflection', 'Post-interview reflection', 'textarea']]
      .map(([key, label, type]) => workspaceField(`prep-${round.id}-${key}`, label, round[key], type)).join('')
  }</div><div class="prep-round-footer"><span>Keep notes before and after your conversation.</span><button type="button" class="btn-ghost" data-remove-round>Remove round</button></div>`;
  card.querySelector('[data-remove-round]').onclick = () => {
    if (confirm('Remove this interview round? Save preparation to keep this change.')) {
      const root = card.closest('#job-workspace-tools');
      card.remove();
      if (root) updateJobPrepOverview(root);
    }
  };
  return card;
}

function updateJobPrepOverview(root) {
  const count = root.querySelectorAll('[data-prep-check]:checked').length;
  const progress = root.querySelector('#prep-progress');
  progress.value = count;
  root.querySelector('#prep-progress-label').textContent = `${count} of ${PREP_CHECKS.length} ready`;
  const rounds = root.querySelectorAll('.prep-round');
  rounds.forEach((card, i) => { card.querySelector('legend').textContent = `Round ${i + 1}`; });
  root.querySelector('#prep-empty').hidden = rounds.length > 0;
  root.querySelector('#prep-round-count').textContent = `${rounds.length} ${rounds.length === 1 ? 'round' : 'rounds'}`;
}

function renderJobWorkspace(job) {
  const root = document.getElementById('job-workspace-tools');
  if (!root) return;
  const data = normalizeJobWorkspace(job);
  root.innerHTML = `<div class="job-tools-intro"><span class="workspace-eyebrow">MAKE YOUR NEXT MOVE</span><h3>Your application toolkit</h3><p>Prepare for the conversation. Keep the details that matter.</p></div>
    <details class="job-tool job-tool--interview" ${['screening', 'interview'].includes(job.stage) ? 'open' : ''}>
    ${jobToolHeading('Interview preparation', 'A little preparation. A more confident conversation.', 'interview')}<div class="job-tool-body">
    <div class="prep-section-heading"><h4>Your prep checklist</h4><span id="prep-progress-label"></span></div><progress id="prep-progress" max="${PREP_CHECKS.length}" value="0" aria-label="Interview preparation checklist completion"></progress>
    <div class="prep-checklist">${PREP_CHECKS.map((text, i) => `<label><input type="checkbox" data-prep-check="${i}" ${data.checks[i] ? 'checked' : ''}><span>${text}</span></label>`).join('')}</div>
    <div class="prep-section-heading"><h4>Your conversations</h4><span id="prep-round-count"></span></div>
    <div id="prep-empty" class="job-tool-empty"><strong>Your next conversation starts here</strong><p>Add a round to keep interviewers, questions, and reflections together.</p></div>
    <div id="prep-rounds"></div><div class="job-tool-actions"><button type="button" class="btn-secondary" id="prep-add">＋ Add interview round</button><button type="button" class="btn-primary" id="prep-save">Save preparation</button></div>
    <p class="job-tool-save-hint">Save your changes before leaving or downloading calendar dates.</p><p id="prep-save-status" role="status"></p></div></details>
    <details class="job-tool job-tool--offer" ${job.stage === 'offer' ? 'open' : ''}>${jobToolHeading('Offer decision worksheet', 'See the full picture before your next chapter.', 'offer')}<div class="job-tool-body">
    <p class="job-tool-hint">Record the actual offer separately from the advertised salary. These details also appear in Compare Jobs.</p>
    <div class="job-tool-grid">${OFFER_FIELDS.map(([key, label, type]) => workspaceField('offer-' + key, label, data.offer[key], type)).join('')}</div>
    <div class="job-tool-actions"><button type="button" class="btn-primary" id="offer-save">Save offer worksheet</button></div><p id="offer-save-status" role="status"></p></div></details>
    <details class="job-tool">${jobToolHeading('Original posting archive', 'A saved reference, even after the listing disappears.', 'archive')}<div class="job-tool-body" id="posting-archive-content"></div></details>
    <details class="job-tool">${jobToolHeading('Calendar &amp; follow-up', 'Give your next step a place on the calendar.', 'calendar')}<div class="job-tool-body">
    <p class="job-tool-hint">Download saved rounds, screening/interview milestones, a follow-up, and the offer response deadline. Times use the local time of your calendar; entries without times are all-day events.</p>
    ${workspaceField('workspace-followup', 'Next follow-up date', job.nextFollowUp || job.followUpDate, 'date')}
    <div class="job-tool-actions"><button type="button" class="btn-primary" id="workspace-save-followup">Save follow-up date</button><button type="button" class="btn-secondary" id="workspace-export-calendar">Download calendar (.ics)</button></div><p id="followup-save-status" role="status"></p></div></details>`;
  const rounds = root.querySelector('#prep-rounds');
  data.rounds.forEach(round => rounds.append(renderPrepRound(round)));
  updateJobPrepOverview(root);
  root.querySelectorAll('[data-prep-check]').forEach(input => input.addEventListener('change', () => updateJobPrepOverview(root)));
  root.querySelector('#prep-add').onclick = () => {
    const card = renderPrepRound({ id: uid() });
    rounds.append(card);
    updateJobPrepOverview(root);
    card.querySelector('input').focus();
  };
  root.querySelector('#prep-save').onclick = () => {
    const cards = [...rounds.querySelectorAll('.prep-round')];
    if (!workspaceDatesValid(rounds)) return;
    job.interviewPrep = {
      checks: [...root.querySelectorAll('[data-prep-check]')].map(input => input.checked),
      rounds: cards.map(card => {
        const round = { id: card.dataset.roundId };
        ['title', 'interviewer', 'date', 'time', 'questions', 'reflection'].forEach(key => {
          round[key] = document.getElementById(`prep-${round.id}-${key}`).value.trim();
        });
        return round;
      })
    };
    save();
    root.querySelector('#prep-save-status').textContent = 'Preparation saved.';
  };
  root.querySelector('#offer-save').onclick = () => {
    if (!workspaceDatesValid(root.querySelector('#offer-responseDeadline').parentElement)) return;
    job.offerWorksheet = Object.fromEntries(OFFER_FIELDS.map(([key]) => [key, root.querySelector('#offer-' + key).value.trim()]));
    save();
    root.querySelector('#offer-save-status').textContent = 'Offer worksheet saved.';
  };
  root.querySelector('#workspace-save-followup').onclick = () => {
    const input = root.querySelector('#workspace-followup');
    if (!input.reportValidity()) return;
    job.nextFollowUp = input.value;
    job.followUpDate = input.value;
    save();
    renderView(state.activeView);
    root.querySelector('#followup-save-status').textContent = 'Follow-up date saved.';
  };
  root.querySelector('#workspace-export-calendar').onclick = () => {
    const calendar = buildJobCalendar(job);
    if (!calendar) return toast('Save an interview, follow-up, or offer response date first.', 'error');
    downloadWorkspaceFile(calendar, 'pipelinetrack-' + job.id.replace(/[^a-z0-9_-]/gi, '') + '.ics', 'text/calendar;charset=utf-8');
  };
  renderPostingArchive(job);
}

function workspaceDatesValid(root) {
  for (const input of root.querySelectorAll('input[type="date"], input[type="time"]')) {
    if (!input.reportValidity()) return false;
  }
  return true;
}

function renderPostingArchive(job) {
  const root = document.getElementById('posting-archive-content');
  const snapshot = job.postingSnapshot;
  const hasSnapshot = snapshot && typeof snapshot.text === 'string';
  root.innerHTML = hasSnapshot
    ? `<p class="job-tool-hint">Captured ${escHtml(new Date(snapshot.capturedAt).toLocaleString())}. This copy stays unchanged when you edit the description.</p><p class="posting-source"></p><pre class="posting-archive"></pre><button type="button" class="btn-secondary" id="posting-download">Download original posting</button>`
    : '<p class="job-tool-hint">No original copy has been captured. Save the current description as a dated reference.</p><button type="button" class="btn-secondary" id="posting-capture">Capture current posting</button>';
  if (hasSnapshot) {
    root.querySelector('.posting-source').textContent = snapshot.url || 'No source URL recorded';
    root.querySelector('pre').textContent = snapshot.text;
    root.querySelector('#posting-download').onclick = () => downloadWorkspaceFile(`${job.role} @ ${job.company}\nCaptured: ${snapshot.capturedAt}\nSource: ${snapshot.url || ''}\n\n${snapshot.text}`, 'original-posting.txt', 'text/plain;charset=utf-8');
  } else root.querySelector('#posting-capture').onclick = () => {
    if (!job.description?.trim()) return toast('Add a job description before capturing a copy.', 'error');
    job.postingSnapshot = { text: job.description, url: job.url || '', capturedAt: new Date().toISOString() };
    save();
    renderPostingArchive(job);
  };
}

function downloadWorkspaceFile(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function icsDateValue(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
  const date = new Date(value + 'T12:00:00');
  return Number.isFinite(date.getTime()) && date.getFullYear() === +value.slice(0, 4) && date.getMonth() + 1 === +value.slice(5, 7) && date.getDate() === +value.slice(8, 10) ? value.replace(/-/g, '') : '';
}

function icsEscape(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function foldCalendarLine(line) {
  const encoder = new TextEncoder();
  let result = '', count = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (count + size > 75) { result += '\r\n '; count = 1; }
    result += char;
    count += size;
  }
  return result;
}

function buildJobCalendar(job) {
  const data = normalizeJobWorkspace(job);
  const entries = data.rounds.map(round => ({ ...round, label: round.title || 'Interview', notes: [round.interviewer, round.questions].filter(Boolean).join('\n') }));
  ['screening', 'interview'].forEach(stage => {
    const milestone = job[stage + 'Milestone'];
    if (milestone && !entries.some(e => e.date === milestone.date && e.time === (milestone.time || ''))) {
      entries.push({ ...milestone, id: stage, label: stage === 'screening' ? 'Screening' : 'Interview' });
    }
  });
  entries.push({ id: 'followup', label: 'Follow-up', date: job.nextFollowUp || job.followUpDate });
  entries.push({ id: 'offer', label: 'Offer response due', date: data.offer.responseDeadline });
  const valid = entries.filter(entry => icsDateValue(entry.date));
  if (!valid.length) return '';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PipelineTrack//Job Calendar//EN', 'CALSCALE:GREGORIAN'];
  valid.forEach(entry => {
    const date = icsDateValue(entry.date);
    const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time || '') ? entry.time.replace(':', '') + '00' : '';
    lines.push('BEGIN:VEVENT', 'UID:' + icsEscape(job.id + '-' + entry.id) + '@pipelinetrack.local',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'),
      time ? 'DTSTART:' + date + 'T' + time : 'DTSTART;VALUE=DATE:' + date,
      'SUMMARY:' + icsEscape(`${entry.label}: ${job.role} @ ${job.company}`),
      'DESCRIPTION:' + icsEscape(entry.notes || ''), 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.map(foldCalendarLine).join('\r\n') + '\r\n';
}

function renderBackupHealth() {
  let root = document.getElementById('backup-health');
  const card = document.querySelector('[data-card="backup"]');
  if (!card) return;
  if (!root) {
    root = document.createElement('p');
    root.id = 'backup-health';
    root.className = 'job-tool-hint';
    root.setAttribute('role', 'status');
    card.insertBefore(root, card.querySelector('.backup-tiles'));
  }
  const last = localStorage.getItem('pt_last_backup');
  const date = new Date(last || '');
  const valid = Number.isFinite(date.getTime());
  const overdue = !valid || Date.now() - date.getTime() > 7 * 86400000;
  root.textContent = (valid ? `Last JSON export: ${date.toLocaleString()}. ` : 'No JSON backup exported from this browser yet. ') +
    (overdue ? 'Download a backup to keep a separate copy of your workspace.' : 'Keep the downloaded file somewhere safe.');
  let reminder = document.getElementById('workspace-backup-reminder');
  if (!reminder) {
    reminder = document.createElement('div');
    reminder.id = 'workspace-backup-reminder';
    reminder.className = 'job-tool job-tool-actions';
    document.getElementById('view-dashboard')?.append(reminder);
  }
  reminder.hidden = !overdue || !state.jobs.length;
  reminder.replaceChildren();
  const message = document.createElement('span');
  message.textContent = valid ? 'Your last workspace backup was over a week ago.' : 'Keep a separate copy of your workspace.';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-secondary';
  button.textContent = 'Download JSON backup';
  button.onclick = exportData;
  reminder.append(message, button);
}

const openJobDetailWithWorkspace = window.openJobDetail;
window.openJobDetail = function (id) {
  openJobDetailWithWorkspace(id);
  const job = state.jobs.find(item => item.id === id);
  if (job) renderJobWorkspace(job);
};

const compareWithOffers = window.renderComparisonGrid;
window.renderComparisonGrid = function (jobs) {
  compareWithOffers(jobs);
  document.querySelectorAll('#compare-result-grid .compare-col-body').forEach((column, i) => {
    const offer = normalizeJobWorkspace(jobs[i]).offer;
    const section = document.createElement('div');
    section.className = 'compare-row';
    section.innerHTML = '<div class="compare-row-label">Actual offer &amp; priorities</div>' + OFFER_FIELDS.map(([key, label]) => {
      const value = offer[key];
      return value ? `<p class="offer-comparison"><strong>${label}</strong><br>${escHtml(value)}</p>` : '';
    }).join('');
    if (!section.querySelector('p')) section.innerHTML += '<p>No offer worksheet recorded.</p>';
    column.append(section);
  });
};

const dashboardWithBackup = window.renderDashboard;
window.renderDashboard = function () {
  dashboardWithBackup();
  renderBackupHealth();
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('job-url')?.addEventListener('input', updateJobDuplicateNotice);
  ['job-role', 'job-company'].forEach(id => document.getElementById(id)?.addEventListener('input', updateJobDuplicateNotice));
  renderBackupHealth();
});

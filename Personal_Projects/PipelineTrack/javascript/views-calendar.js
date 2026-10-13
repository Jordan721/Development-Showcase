'use strict';

/* ══════════════════════════════════════════════════════════
   CALENDAR VIEW
   ══════════════════════════════════════════════════════════ */
let calMode = 'month';
let calOffset = 0;
let calEventFilter = 'all';
let calAnimDir = 'fade'; // 'fade' | 'left' | 'right'
let calDraggedEvent = null;
let calSuppressClickUntil = 0;
const CAL_STAGE_COLORS = {
  saved: 'var(--text-muted)',
  applied: 'var(--accent)',
  screening: 'var(--yellow)',
  interview: '#a78bfa',
  offer: 'var(--green)',
  declined: 'var(--red)',
  ghosted: 'var(--text-muted)',
  archived: 'var(--text-muted)'
};

function calendarDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const str = String(value).trim();
  const dateOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function buildCalendarEvents() {
  const events = [];
  state.jobs.forEach(j => {
    ['screening', 'interview'].forEach(stage => {
      const milestone = j[stage + 'Milestone'];
      const date = milestone && calendarDate(milestone.date);
      if (date) events.push({
        date,
        type: 'interview',
        label: `${stage === 'screening' ? 'Screening' : 'Interview'}: ${j.role} @ ${j.company}`,
        id: j.id,
        dateField: stage + 'Milestone',
        time: milestone.time || ''
      });
    });
    const jobDate = calendarDate(j.dateApplied || j.dateAdded);
    if (jobDate) {
      events.push({
        date: jobDate,
        type: 'job',
        dateField: j.dateApplied ? 'dateApplied' : 'dateAdded',
        label: j.role + ' @ ' + j.company,
        id: j.id
      });
    }
    if (j.deadline) {
      const deadlineDate = calendarDate(j.deadline);
      if (deadlineDate) {
        events.push({
          date: deadlineDate,
          type: 'deadline',
          dateField: 'deadline',
          label: 'Deadline: ' + j.role + ' @ ' + j.company,
          id: j.id
        });
      }
    }
  });
  (state.contacts || []).forEach(c => {
    if (!c.nextFollowUp) return;
    const followUpDate = calendarDate(c.nextFollowUp);
    if (!followUpDate) return;
    events.push({
      date: followUpDate,
      type: 'contact',
      dateField: 'nextFollowUp',
      label: 'Follow-up: ' + c.name,
      id: c.id
    });
  });
  (state.events || []).forEach(ev => {
    const eventDate = calendarDate(ev.date);
    if (!eventDate) return;
    events.push({
      date: eventDate,
      type: 'event',
      dateField: 'date',
      label: ev.title,
      id: ev.id,
      eventData: ev
    });
  });
  return events;
}

function getCalPeriodWindow(mode, offset) {
  const now = new Date();
  if (mode === 'month' || mode === 'agenda') {
    const y = now.getFullYear();
    const m = now.getMonth() + offset;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    end.setHours(23, 59, 59, 999);
    return {
      periodLabel: start.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric'
      }),
      periodStart: start,
      periodEnd: end
    };
  }
  if (mode === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + offset * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const label = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ' – ' + end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return {
      periodLabel: label,
      periodStart: start,
      periodEnd: end
    };
  }
  if (mode === 'year') {
    const y = now.getFullYear() + offset;
    return {
      periodLabel: String(y),
      periodStart: new Date(y, 0, 1),
      periodEnd: new Date(y, 11, 31, 23, 59, 59, 999)
    };
  }
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function buildEventsMap(events) {
  const map = {};
  events.forEach(ev => {
    const k = dateKey(ev.date);
    if (!map[k]) map[k] = [];
    map[k].push(ev);
  });
  return map;
}

function calendarEventTime(ev) {
  return ev.time || (ev.eventData && ev.eventData.time) || '';
}

function calendarDateTarget(ev) {
  const collection = ev.type === 'contact' ? state.contacts : ev.type === 'event' ? state.events : state.jobs;
  const item = (collection || []).find(item => item.id === ev.id);
  if (!item) return null;
  const allowed = {job: ['dateAdded', 'dateApplied'], deadline: ['deadline'], interview: ['screeningMilestone', 'interviewMilestone'], contact: ['nextFollowUp'], event: ['date']};
  if (!allowed[ev.type] || !allowed[ev.type].includes(ev.dateField)) return null;
  return ev.type === 'interview' ? (item[ev.dateField] ? {item: item[ev.dateField], field: 'date'} : null) : {item, field: ev.dateField};
}

function moveCalendarEvent(ev, newDate) {
  const date = calendarDate(newDate);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(newDate) || dateKey(date) !== newDate) return false;
  const target = calendarDateTarget(ev);
  if (!target) return false;
  const previous = target.item[target.field];
  if (previous === newDate) return false;
  target.item[target.field] = newDate;
  save();
  renderCalendarView();
  toast('Moved to ' + date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) + '.', 'success', {
    undo: () => {
      const current = calendarDateTarget(ev);
      if (!current || current.item[current.field] !== newDate) return;
      current.item[current.field] = previous;
      save();
      renderCalendarView();
    }
  });
  return true;
}

function wireCalendarDragging(body) {
  const clearTargets = () => body.querySelectorAll('.cal-drop-target').forEach(cell => cell.classList.remove('cal-drop-target'));
  body.querySelectorAll('.cal-full-event').forEach(card => {
    if (calMode !== 'month' && calMode !== 'week') return;
    card.draggable = true;
    card.addEventListener('dragstart', e => {
      calDraggedEvent = buildCalendarEvents().find(ev => ev.id === card.dataset.evId && ev.type === card.dataset.evType && ev.dateField === card.dataset.evDateField);
      if (!calDraggedEvent || !e.dataTransfer) { e.preventDefault(); return; }
      e.stopPropagation();
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', calDraggedEvent.label);
      card.classList.add('cal-dragging');
    });
    card.addEventListener('dragend', () => {
      calDraggedEvent = null;
      calSuppressClickUntil = Date.now() + 250;
      card.classList.remove('cal-dragging');
      clearTargets();
    });
  });
  body.querySelectorAll('[data-cell-date]').forEach(cell => {
    cell.addEventListener('dragover', e => {
      if (!calDraggedEvent) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearTargets();
      cell.classList.add('cal-drop-target');
    });
    cell.addEventListener('dragleave', e => {
      if (!cell.contains(e.relatedTarget)) cell.classList.remove('cal-drop-target');
    });
    cell.addEventListener('drop', e => {
      if (!calDraggedEvent) return;
      e.preventDefault();
      e.stopPropagation();
      const ev = calDraggedEvent;
      calDraggedEvent = null;
      calSuppressClickUntil = Date.now() + 250;
      clearTargets();
      moveCalendarEvent(ev, cell.dataset.cellDate);
    });
  });
}

function calendarCardHTML(ev) {
  const job = ['job', 'deadline', 'interview'].includes(ev.type) ? state.jobs.find(j => j.id === ev.id) : null;
  const tag = {
    job: 'Job added',
    deadline: 'Deadline',
    interview: 'Interview / screening',
    contact: 'Follow-up',
    event: 'Event'
  } [ev.type];
  const stage = job ? (STAGE_LABELS[job.stage] || job.stage || '') : '';
  const color = job ? (CAL_STAGE_COLORS[job.stage] || 'var(--accent)') : '';
  const time = calendarEventTime(ev);
  return `<button type="button" class="cal-full-event cal-compact-card ev-${ev.type}${job ? ' cal-type-' + calendarJobType(job) : ''}" data-ev-id="${escHtml(ev.id)}" data-ev-type="${ev.type}" data-ev-date-field="${escHtml(ev.dateField || '')}" title="${escHtml(ev.label)}${stage ? ' · ' + escHtml(stage) : ''}${(job && job.jobType) ? ' · ' + escHtml(job.jobType) : ''}"><span class="cal-card-title">${job ? jobDepartmentBadge(job, true) : ''}<span>${escHtml(job ? job.company : ev.label)}</span></span>${job ? `<span class="cal-card-role">${escHtml(job.role)}</span>` : ''}<span class="cal-card-meta">${job ? `<span class="cal-status-dot" style="background:${color}" aria-hidden="true"></span>` : ''}${escHtml(ev.type === 'job' && stage ? stage : tag)}${time ? ' · ' + escHtml(time) : ''}</span>${job ? `<span class="cal-card-type">${escHtml(job.jobType || 'Type not specified')}</span>` : ''}</button>`;
}

function calendarJobType(job) {
  const key = String(job.jobType || '').toLowerCase().replace(/\s+/g, '-');
  return ['full-time', 'part-time', 'contract', 'freelance', 'temporary', 'internship'].includes(key) ? key : 'unspecified';
}

function buildCalendarAgenda(events) {
  if (!events.length) return '<p class="empty-msg">No events this month. Try another month or event filter.</p>';
  const sorted = [...events].sort((a, b) => a.date - b.date || (calendarEventTime(a)).localeCompare(calendarEventTime(b)));
  const map = buildEventsMap(sorted);
  return `<div class="cal-agenda">${Object.entries(map).map(([key, items]) => `<section class="cal-agenda-day"><h3>${items[0].date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}<span>${items.length} item${items.length === 1 ? '' : 's'}</span></h3><div class="cal-agenda-events">${items.map(calendarCardHTML).join('')}</div></section>`).join('')}</div>`;
}

function buildFullMonthGrid(periodStart, events) {
  const map = buildEventsMap(events);
  const today = new Date();
  const year = periodStart.getFullYear();
  const month = periodStart.getMonth();
  const firstDow = periodStart.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let html = '<div class="cal-full-month-grid">';
  dows.forEach(d => {
    html += `<div class="cal-full-dow">${d}</div>`;
  });
  // leading empty cells
  for (let i = 0; i < firstDow; i++) html += '<div class="cal-full-cell cal-other-month"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const k = dateKey(cellDate);
    const dayEvents = map[k] || [];
    const isTodayCell = sameDay(cellDate, today);
    const dow = cellDate.getDay();
    const isWeekend = dow === 0 || dow === 6;
    html += `<div class="cal-full-cell${isTodayCell ? ' cal-today' : ''}${isWeekend ? ' cal-weekend' : ''}" data-cell-date="${k}">`;
    html += `<div class="cal-cell-day-num"><span class="cal-day-num-inner">${day}</span></div>`;
    const shown = dayEvents.slice(0, 2);
    shown.forEach(ev => {
      html += calendarCardHTML(ev);
    });
    if (dayEvents.length > 2) html += `<button type="button" class="cal-more-events" aria-label="View all ${dayEvents.length} events on ${k}">+${dayEvents.length - 2} more</button>`;
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function buildCalWeekStrip(periodStart, events) {
  const map = buildEventsMap(events);
  const today = new Date();
  let html = '<div class="cal-week-strip">';
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(periodStart);
    d.setDate(periodStart.getDate() + i);
    const k = dateKey(d);
    const dayEvents = map[k] || [];
    const isTodayCell = sameDay(d, today);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    html += `<div class="cal-week-day-cell${isTodayCell ? ' cal-today' : ''}${isWeekend ? ' cal-weekend' : ''}" data-cell-date="${k}">`;
    html += `<div class="cal-week-dow">${dows[d.getDay()]}</div>`;
    html += `<div class="cal-week-date"><span class="cal-day-num-inner">${d.getDate()}</span></div>`;
    dayEvents.forEach(ev => {
      html += calendarCardHTML(ev);
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function buildCalYearGrid(year, events) {
  const map = buildEventsMap(events);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let html = '<div class="cal-year-grid">';
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const monthEvents = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const k = `${year}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      if (map[k]) monthEvents.push(...map[k]);
    }
    html += `<div class="cal-year-month" data-year="${year}" data-month="${m}">`;
    html += `<div class="cal-year-month-name">${months[m]}${monthEvents.length > 0 ? `<span class="cal-year-event-count">${monthEvents.length}</span>` : ''}</div>`;
    if (monthEvents.length > 0) {
      html += '<div class="cal-year-event-dots">';
      const shown = monthEvents.slice(0, 20);
      shown.forEach(ev => {
        const colorCls = ev.type === 'job' ? 'cal-legend-job' : ev.type === 'deadline' ? 'cal-legend-deadline' : ev.type === 'event' ? 'cal-legend-event' : 'cal-legend-contact';
        html += `<div class="cal-year-dot ${colorCls}" title="${escHtml(ev.label)}"></div>`;
      });
      if (monthEvents.length > 20) html += `<div style="font-size:9px;color:var(--text-muted)">+${monthEvents.length - 20}</div>`;
      html += '</div>';
    } else {
      html += '<div style="font-size:11px;color:var(--border)">No events</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderCalendarUpcoming(allEvents) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() + 7);
  cutoff.setHours(23, 59, 59, 999);
  const upcoming = allEvents
    .filter(ev => ev.type !== 'job' && calendarEventMatchesFilter(ev) && ev.date >= now && ev.date <= cutoff)
    .sort((a, b) => a.date - b.date || (calendarEventTime(a)).localeCompare(calendarEventTime(b)));
  const list = document.getElementById('cal-upcoming-list');
  if (!list) return;
  if (upcoming.length === 0) {
    list.innerHTML = '<p class="empty-msg">No events in the next 7 days.</p>';
    return;
  }
  list.innerHTML = upcoming.map((ev, index) => {
    const dotCls = ev.type === 'interview' ? 'cal-legend-interview' : ev.type === 'job' ? 'cal-legend-job' : ev.type === 'deadline' ? 'cal-legend-deadline' : ev.type === 'event' ? 'cal-legend-event' : 'cal-legend-contact';
    const tag = ev.type === 'interview' ? 'Interview / screening' : ev.type === 'deadline' ? 'Deadline' : ev.type === 'contact' ? 'Follow-up' : ev.type === 'event' ? 'Event' : 'Job Added';
    const evData = ev.eventData;
    const linkBtn = evData && evData.link ?
      `<a class="cal-event-join-btn" href="${escHtml(evData.link)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Join</a>` :
      '';
    const formatBadge = evData ? `<span class="cal-event-format-badge cal-event-format-${evData.format}">${evData.format}</span>` : '';
    return `${index === 0 ? '<div class="cal-next-heading">NEXT UP</div>' : ''}<div class="cal-upcoming-item${index === 0 ? ' cal-upcoming-next' : ''}" tabindex="0" role="button" data-ev-id="${ev.id}" data-ev-type="${ev.type}">
      <span class="cal-upcoming-dot ${dotCls}"></span>
      <span class="cal-upcoming-date">${ev.date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
      <span class="cal-upcoming-label">${escHtml(ev.label)}</span>
      ${calendarEventTime(ev) ? `<span class="cal-upcoming-time">${escHtml(calendarEventTime(ev))}</span>` : ''}
      ${formatBadge}
      <span class="cal-upcoming-tag">${tag}</span>
      ${linkBtn}
    </div>`;
  }).join('');
  list.querySelectorAll('.cal-upcoming-item').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
    item.addEventListener('click', () => {
      const evType = item.dataset.evType;
      if (evType === 'contact') {
        navigate('contacts');
        return;
      }
      if (evType === 'event') {
        const ev = (state.events || []).find(e => e.id === item.dataset.evId);
        if (ev) openEventModal(ev);
        return;
      }
      openJobDetail(item.dataset.evId);
    });
  });
}

function wireCalendarControls() {
  document.querySelectorAll('.cal-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.cal-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const nextMode = btn.dataset.calMode;
      if (!['month', 'agenda'].includes(calMode) || !['month', 'agenda'].includes(nextMode)) calOffset = 0;
      calMode = nextMode;
      calAnimDir = 'fade';
      renderCalendarView();
    };
  });
  const prev = document.getElementById('cal-nav-prev');
  const next = document.getElementById('cal-nav-next');
  const todayBtn = document.getElementById('cal-today-btn');
  if (prev) prev.onclick = () => {
    calOffset--;
    calAnimDir = 'right';
    renderCalendarView();
  };
  if (next) next.onclick = () => {
    calOffset++;
    calAnimDir = 'left';
    renderCalendarView();
  };
  if (todayBtn) todayBtn.onclick = () => {
    calAnimDir = 'fade';
    calOffset = 0;
    renderCalendarView();
  };
  document.querySelectorAll('.cal-event-filter').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.cal-event-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calEventFilter = btn.dataset.eventType;
      renderCalendarView();
    };
  });
  // Wire cell clicks to open day modal
  const body = document.getElementById('cal-view-body');
  if (!body) return;
  wireCalendarDragging(body);
  body.querySelectorAll('.cal-full-event').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      if (Date.now() < calSuppressClickUntil) return;
      if (button.dataset.evType === 'contact') {
        openContactModal(button.dataset.evId);
      } else if (button.dataset.evType === 'event') {
        const ev = (state.events || []).find(ev => ev.id === button.dataset.evId);
        if (ev) openEventModal(ev);
      } else openJobDetail(button.dataset.evId);
    });
  });
  body.querySelectorAll('[data-cell-date]').forEach(cell => {
    cell.addEventListener('click', e => {
      if (Date.now() < calSuppressClickUntil) return;
      const eventEl = e.target.closest('.cal-full-event');
      if (eventEl) {
        const evType = eventEl.dataset.evType;
        const evId = eventEl.dataset.evId;
        if (evType === 'event') {
          const ev = (state.events || []).find(e => e.id === evId);
          if (ev) openEventModal(ev);
        } else if (evType !== 'contact') {
          openJobDetail(evId);
        }
        return;
      }
      const k = cell.dataset.cellDate;
      const allEvs = buildCalendarEvents();
      const dayEvs = allEvs.filter(ev => dateKey(ev.date) === k && calendarEventMatchesFilter(ev));
      openDayModal(k, dayEvs);
    });
  });
  // Year grid month clicks
  body.querySelectorAll('.cal-year-month').forEach(tile => {
    tile.addEventListener('click', () => {
      const m = parseInt(tile.dataset.month);
      const y = parseInt(tile.dataset.year);
      const now = new Date();
      calMode = 'month';
      calOffset = (y - now.getFullYear()) * 12 + (m - now.getMonth());
      calAnimDir = 'fade';
      document.querySelectorAll('.cal-tab').forEach(b => b.classList.toggle('active', b.dataset.calMode === 'month'));
      renderCalendarView();
    });
  });
}

function openDayModal(dateKey, events) {
  const label = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  document.getElementById('day-modal-title').textContent = label;
  const body = document.getElementById('day-modal-jobs');
  const ordered = [...events].sort((a, b) => (calendarEventTime(a)).localeCompare(calendarEventTime(b)));
  body.innerHTML = `<div class="cal-day-summary"><strong>${events.length} item${events.length === 1 ? '' : 's'} planned</strong><span>${events.filter(ev => ev.type === 'job').length} jobs · ${events.filter(ev => ev.type === 'interview').length} interviews · ${events.filter(ev => ev.type === 'contact').length} follow-ups</span></div>` + (events.length ? ordered.map(ev => {
    const dotCls = ev.type === 'interview' ? 'cal-legend-interview' : ev.type === 'job' ? 'cal-legend-job' : ev.type === 'deadline' ? 'cal-legend-deadline' : ev.type === 'event' ? 'cal-legend-event' : 'cal-legend-contact';
    const tag = ev.type === 'interview' ? 'Interview / screening' : ev.type === 'deadline' ? 'Deadline' : ev.type === 'contact' ? 'Follow-up' : ev.type === 'event' ? 'Event' : 'Job Added';
    const evData = ev.eventData;
    const job = ['job', 'deadline', 'interview'].includes(ev.type) ? state.jobs.find(j => j.id === ev.id) : null;
    const contact = ev.type === 'contact' ? (state.contacts || []).find(c => c.id === ev.id) : null;
    const extraInfo = evData ? [
      evData.format ? `<span class="cal-event-format-badge cal-event-format-${evData.format}">${evData.format}</span>` : '',
      evData.time ? `<span style="font-size:11px;color:var(--text-muted)">${escHtml(evData.time)}</span>` : '',
      evData.location ? `<span style="font-size:11px;color:var(--text-muted)">📍 ${escHtml(evData.location)}</span>` : '',
    ].filter(Boolean).join(' ') : '';
    const linkBtn = evData && evData.link ?
      `<a class="cal-event-join-btn" href="${escHtml(evData.link)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Join</a>` :
      '';
    const details = job ? [STAGE_LABELS[job.stage] || job.stage, job.jobType, job.workType, job.location] : contact ? [contact.company, contact.role] : [];
    return `<article class="day-modal-job cal-day-detail${job ? ' cal-type-' + calendarJobType(job) : ''}">
      <span class="cal-legend-dot ${dotCls}" style="flex-shrink:0"></span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px">${escHtml(ev.label)}</div>
        <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px">${tag}${extraInfo ? ' · ' + extraInfo : ''}</div>
        ${ev.time ? `<div class="cal-day-time">Scheduled for ${escHtml(ev.time)}</div>` : ''}
        ${job ? jobDepartmentBadge(job) : ''}
        ${details.filter(Boolean).length ? `<div class="cal-day-tags">${details.filter(Boolean).map(value => `<span>${escHtml(value)}</span>`).join('')}</div>` : ''}
        ${((contact && contact.notes) || (evData && evData.notes)) ? `<p class="cal-day-note">${escHtml((contact && contact.notes) || (evData && evData.notes))}</p>` : ''}
        <div class="cal-day-actions"><button type="button" class="btn-secondary cal-day-open" data-job-id="${escHtml(ev.id)}" data-ev-type="${ev.type}">${job ? 'View job' : contact ? 'Edit contact' : 'View event'}</button>${linkBtn}</div>
      </div>
    </article>`;
  }).join('') : '<p class="empty-msg">Nothing scheduled in this view. Add an event to plan your day.</p>');
  body.querySelectorAll('.cal-day-open').forEach(item => {
    item.addEventListener('click', () => {
      const evType = item.dataset.evType;
      if (evType === 'contact') {
        closeModal('modal-day');
        openContactModal(item.dataset.jobId);
        return;
      }
      if (evType === 'event') {
        const ev = (state.events || []).find(e => e.id === item.dataset.jobId);
        if (ev) {
          closeModal('modal-day');
          openEventModal(ev);
        }
        return;
      }
      closeModal('modal-day');
      openJobDetail(item.dataset.jobId);
    });
  });
  const addButton = document.getElementById('cal-day-add-event');
  if (addButton) addButton.onclick = () => {
    closeModal('modal-day');
    openEventModal(null);
    document.getElementById('event-date').value = dateKey;
  };
  openModal('modal-day');
}

function calendarEventMatchesFilter(ev) {
  const types = {
    jobs: 'job',
    deadlines: 'deadline',
    followups: 'contact',
    interviews: 'interview',
    events: 'event'
  };
  return !types[calEventFilter] || ev.type === types[calEventFilter];
}

function renderCalendarView() {
  const periodLabel = document.getElementById('cal-period-label');
  if (!periodLabel) return;
  const allEvents = buildCalendarEvents();
  const {
    periodLabel: label,
    periodStart,
    periodEnd
  } = getCalPeriodWindow(calMode, calOffset);
  periodLabel.textContent = label;
  const visibleEvents = allEvents.filter(ev => {
    if (ev.date < periodStart || ev.date > periodEnd) return false;
    return calendarEventMatchesFilter(ev);
  });
  const body = document.getElementById('cal-view-body');
  if (!body) return;
  if (calMode === 'month') body.innerHTML = buildFullMonthGrid(periodStart, visibleEvents);
  else if (calMode === 'week') body.innerHTML = buildCalWeekStrip(periodStart, visibleEvents);
  else if (calMode === 'year') body.innerHTML = buildCalYearGrid(periodStart.getFullYear(), visibleEvents);
  else if (calMode === 'agenda') body.innerHTML = buildCalendarAgenda(visibleEvents);

  // Animate the incoming content
  body.classList.remove('cal-anim-fade', 'cal-anim-from-left', 'cal-anim-from-right');
  void body.offsetWidth; // force reflow to restart animation
  if (calAnimDir === 'left') body.classList.add('cal-anim-from-right');
  else if (calAnimDir === 'right') body.classList.add('cal-anim-from-left');
  else body.classList.add('cal-anim-fade');
  calAnimDir = 'fade'; // reset

  wireCalendarControls();
  renderCalendarUpcoming(allEvents);
  renderCalendarRecentJobs();

  const addBtn = document.getElementById('cal-add-event-btn');
  if (addBtn) addBtn.onclick = () => openEventModal(null);
}

/* Five most recently added jobs, independent of the selected calendar period. */
function renderCalendarRecentJobs() {
  const el = document.getElementById('cal-recent-jobs');
  if (!el) return;
  const jobs = state.jobs.map((job, index) => ({
      job,
      index
    }))
    .sort((a, b) => {
      const aDate = calendarDate(a.job.dateAdded);
      const bDate = calendarDate(b.job.dateAdded);
      return (bDate ? bDate.getTime() : 0) - (aDate ? aDate.getTime() : 0) || b.index - a.index;
    }).slice(0, 5).map(entry => entry.job);
  el.innerHTML = jobs.length ? jobs.map(job => {
    const added = calendarDate(job.dateAdded);

    return `<button type="button" class="cal-recent-job cal-type-${calendarJobType(job)}" data-recent-job="${escHtml(job.id)}">${jobDepartmentBadge(job, true)}<span class="cal-recent-copy"><strong>${escHtml(job.company || 'Company not specified')}</strong><span>${escHtml(job.role || 'Untitled role')}</span><small>${escHtml(STAGE_LABELS[job.stage] || job.stage || 'Saved')}${added ? ' · Added ' + added.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : ''}</small></span><span class="cal-recent-arrow" aria-hidden="true">↗</span></button>`;
  }).join('') : '<p class="empty-msg">Your recently added jobs will appear here.</p>';
  el.querySelectorAll('[data-recent-job]').forEach(button => button.onclick = () => openJobDetail(button.dataset.recentJob));
}
/* ══════════════════════════════════════════════════════════
   EVENT MODAL (JOB FAIRS & EVENTS)
   ══════════════════════════════════════════════════════════ */
function openEventModal(ev) {
  const isEdit = !!ev;
  document.getElementById('event-modal-title').textContent = isEdit ? 'Edit Event' : 'Add Event';
  document.getElementById('event-edit-id').value = isEdit ? ev.id : '';
  document.getElementById('event-title').value = isEdit ? ev.title : '';
  document.getElementById('event-date').value = isEdit ? ev.date : '';
  document.getElementById('event-time').value = isEdit ? (ev.time || '') : '';
  document.getElementById('event-location').value = isEdit ? (ev.location || '') : '';
  document.getElementById('event-link').value = isEdit ? (ev.link || '') : '';
  document.getElementById('event-notes').value = isEdit ? (ev.notes || '') : '';

  const format = isEdit ? (ev.format || 'in-person') : 'in-person';
  document.querySelectorAll('input[name="event-format"]').forEach(r => {
    r.checked = r.value === format;
  });
  updateEventFormatFields(format);

  document.getElementById('event-delete-btn').style.display = isEdit ? '' : 'none';

  document.querySelectorAll('input[name="event-format"]').forEach(r => {
    r.onchange = () => updateEventFormatFields(r.value);
  });

  document.getElementById('event-save-btn').onclick = saveEvent;
  document.getElementById('event-delete-btn').onclick = () => {
    if (!confirm('Delete this event?')) return;
    const deleted = ev;
    state.events = state.events.filter(e => e.id !== ev.id);
    save();
    closeModal('modal-event');
    renderCalendarView();
    toast('Event deleted.', 'error', {
      undo: () => {
        state.events.push(deleted);
        save();
        renderCalendarView();
      }
    });
  };

  openModal('modal-event');
  document.getElementById('event-title').focus();
}

function updateEventFormatFields(format) {
  const locationGroup = document.getElementById('event-location-group');
  const linkGroup = document.getElementById('event-link-group');
  locationGroup.style.display = (format === 'online') ? 'none' : '';
  linkGroup.style.display = (format === 'in-person') ? 'none' : '';
}

function saveEvent() {
  const title = document.getElementById('event-title').value.trim();
  const date = document.getElementById('event-date').value;
  if (!title || !date) {
    toast('Please fill in a title and date.', 'error');
    return;
  }
  const format = document.querySelector('input[name="event-format"]:checked').value;
  const editId = document.getElementById('event-edit-id').value;
  const evObj = {
    id: editId || ('ev' + Date.now() + Math.random().toString(36).slice(2, 5)),
    title,
    date,
    time: document.getElementById('event-time').value || '',
    format,
    location: document.getElementById('event-location').value.trim(),
    link: document.getElementById('event-link').value.trim(),
    notes: document.getElementById('event-notes').value.trim(),
  };

  if (editId) {
    const idx = state.events.findIndex(e => e.id === editId);
    if (idx !== -1) state.events[idx] = evObj;
  } else {
    if (!state.events) state.events = [];
    state.events.push(evObj);
  }
  save();
  closeModal('modal-event');
  renderCalendarView();
  toast((editId ? 'Event updated.' : 'Event added.'), 'success');
}

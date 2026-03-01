'use strict';

/* ══════════════════════════════════════════════════════════
   CALENDAR VIEW
   ══════════════════════════════════════════════════════════ */
let calMode = 'month';
let calOffset = 0;
let calEventFilter = 'all';

function buildCalendarEvents() {
  const events = [];
  state.jobs.forEach(j => {
    events.push({
      date: new Date(j.dateAdded),
      type: 'job',
      label: j.role + ' @ ' + j.company,
      id: j.id
    });
    if (j.deadline) {
      events.push({
        date: new Date(j.deadline + 'T00:00:00'),
        type: 'deadline',
        label: 'Deadline: ' + j.role + ' @ ' + j.company,
        id: j.id
      });
    }
  });
  (state.contacts || []).forEach(c => {
    if (!c.nextFollowUp) return;
    events.push({
      date: new Date(c.nextFollowUp + 'T00:00:00'),
      type: 'contact',
      label: 'Follow-up: ' + c.name,
      id: c.id
    });
  });
  return events;
}

function getCalPeriodWindow(mode, offset) {
  const now = new Date();
  if (mode === 'month') {
    const y = now.getFullYear();
    const m = now.getMonth() + offset;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
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
      periodEnd: new Date(y, 11, 31, 23, 59, 59)
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
    html += `<div class="cal-full-cell${isTodayCell ? ' cal-today' : ''}" data-cell-date="${k}">`;
    html += `<div class="cal-cell-day-num">${day}</div>`;
    const shown = dayEvents.slice(0, 3);
    shown.forEach(ev => {
      html += `<span class="cal-full-event ev-${ev.type}" data-ev-id="${ev.id}" data-ev-type="${ev.type}" title="${escHtml(ev.label)}">${escHtml(ev.label)}</span>`;
    });
    if (dayEvents.length > 3) html += `<div class="cal-more-events">+${dayEvents.length - 3} more</div>`;
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
    html += `<div class="cal-week-day-cell${isTodayCell ? ' cal-today' : ''}" data-cell-date="${k}">`;
    html += `<div class="cal-week-dow">${dows[d.getDay()]}</div>`;
    html += `<div class="cal-week-date">${d.getDate()}</div>`;
    dayEvents.forEach(ev => {
      html += `<span class="cal-full-event ev-${ev.type}" data-ev-id="${ev.id}" data-ev-type="${ev.type}" title="${escHtml(ev.label)}">${escHtml(ev.label)}</span>`;
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
    html += `<div class="cal-year-month-name">${months[m]}</div>`;
    if (monthEvents.length > 0) {
      html += '<div class="cal-year-event-dots">';
      const shown = monthEvents.slice(0, 20);
      shown.forEach(ev => {
        const colorCls = ev.type === 'job' ? 'cal-legend-job' : ev.type === 'deadline' ? 'cal-legend-deadline' : 'cal-legend-contact';
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
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() + 7);
  cutoff.setHours(23, 59, 59, 999);
  const upcoming = allEvents
    .filter(ev => ev.date >= now && ev.date <= cutoff)
    .sort((a, b) => a.date - b.date);
  const list = document.getElementById('cal-upcoming-list');
  if (!list) return;
  if (upcoming.length === 0) {
    list.innerHTML = '<p class="empty-msg">No events in the next 7 days.</p>';
    return;
  }
  list.innerHTML = upcoming.map(ev => {
    const dotCls = ev.type === 'job' ? 'cal-legend-job' : ev.type === 'deadline' ? 'cal-legend-deadline' : 'cal-legend-contact';
    const tag = ev.type === 'deadline' ? 'Deadline' : ev.type === 'contact' ? 'Follow-up' : 'Job Added';
    return `<div class="cal-upcoming-item" data-ev-id="${ev.id}" data-ev-type="${ev.type}">
      <span class="cal-upcoming-dot ${dotCls}"></span>
      <span class="cal-upcoming-date">${ev.date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
      <span class="cal-upcoming-label">${escHtml(ev.label)}</span>
      <span class="cal-upcoming-tag">${tag}</span>
    </div>`;
  }).join('');
  list.querySelectorAll('.cal-upcoming-item').forEach(item => {
    item.addEventListener('click', () => {
      const {
        evId,
        evType
      } = item.dataset;
      if (evType === 'contact') return;
      openJobDetail(item.dataset.evId);
    });
  });
}

function wireCalendarControls() {
  document.querySelectorAll('.cal-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.cal-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calMode = btn.dataset.calMode;
      calOffset = 0;
      renderCalendarView();
    };
  });
  const prev = document.getElementById('cal-nav-prev');
  const next = document.getElementById('cal-nav-next');
  const todayBtn = document.getElementById('cal-today-btn');
  if (prev) prev.onclick = () => {
    calOffset--;
    renderCalendarView();
  };
  if (next) next.onclick = () => {
    calOffset++;
    renderCalendarView();
  };
  if (todayBtn) todayBtn.onclick = () => {
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
  body.querySelectorAll('[data-cell-date]').forEach(cell => {
    cell.addEventListener('click', e => {
      if (e.target.classList.contains('cal-full-event')) {
        const evType = e.target.dataset.evType;
        const evId = e.target.dataset.evId;
        if (evType !== 'contact') openJobDetail(evId);
        return;
      }
      const k = cell.dataset.cellDate;
      const allEvs = buildCalendarEvents();
      const dayEvs = allEvs.filter(ev => dateKey(ev.date) === k);
      if (dayEvs.length === 0) return;
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
  body.innerHTML = events.map(ev => {
    const dotCls = ev.type === 'job' ? 'cal-legend-job' : ev.type === 'deadline' ? 'cal-legend-deadline' : 'cal-legend-contact';
    const tag = ev.type === 'deadline' ? 'Deadline' : ev.type === 'contact' ? 'Follow-up' : 'Job Added';
    return `<div class="day-modal-job" data-job-id="${ev.id}" data-ev-type="${ev.type}" style="display:flex;align-items:center;gap:10px;padding:10px;cursor:${ev.type !== 'contact' ? 'pointer' : 'default'};border-radius:var(--radius-sm);transition:background .15s;" onmouseenter="this.style.background='var(--card)'" onmouseleave="this.style.background=''">
      <span class="cal-legend-dot ${dotCls}" style="flex-shrink:0"></span>
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px">${escHtml(ev.label)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${tag}</div>
      </div>
    </div>`;
  }).join('');
  body.querySelectorAll('.day-modal-job').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.evType === 'contact') return;
      closeModal('modal-day');
      openJobDetail(item.dataset.jobId);
    });
  });
  openModal('modal-day');
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
    if (calEventFilter === 'jobs') return ev.type === 'job';
    if (calEventFilter === 'deadlines') return ev.type === 'deadline';
    if (calEventFilter === 'followups') return ev.type === 'contact';
    return true;
  });
  const body = document.getElementById('cal-view-body');
  if (!body) return;
  if (calMode === 'month') body.innerHTML = buildFullMonthGrid(periodStart, visibleEvents);
  else if (calMode === 'week') body.innerHTML = buildCalWeekStrip(periodStart, visibleEvents);
  else if (calMode === 'year') body.innerHTML = buildCalYearGrid(periodStart.getFullYear(), visibleEvents);
  wireCalendarControls();
  renderCalendarUpcoming(allEvents);
  renderActivity();
}

/* ══════════════════════════════════════════════════════════
   JOB ACTIVITY COUNTS
   ══════════════════════════════════════════════════════════ */
function renderActivity() {
  const el = document.getElementById('cal-activity');
  if (!el) return;
  const now  = new Date();
  const jobs = state.jobs;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const count = (from) => jobs.filter(j => new Date(j.dateAdded) >= from).length;

  const periods = [
    { label: 'Today',      value: count(startOfDay)  },
    { label: 'This Week',  value: count(startOfWeek) },
    { label: 'This Month', value: count(startOfMonth)},
    { label: 'This Year',  value: count(startOfYear) },
    { label: 'All Time',   value: jobs.length         },
  ];

  el.innerHTML = `<div class="act-counts">${
    periods.map(p => `<div class="act-count-card">
      <div class="act-count-value">${p.value}</div>
      <div class="act-count-label">${p.label}</div>
    </div>`).join('')
  }</div>`;
}

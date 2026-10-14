'use strict';

/* ══════════════════════════════════════════════════════════
   GOALS VIEW
   ══════════════════════════════════════════════════════════ */
let goalPeriodFilter = 'week';

const GOAL_TYPE_LABELS = {
  applications: 'Applications Sent',
  interviews: 'Interviews Reached',
  offers: 'Offers Received',
  responses: 'Responses Received',
  screenings: 'Screenings Reached',
  saved: 'Jobs Researched',
  networking: 'Contacts Added',
};

function goalPeriodBounds(period, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), period === 'week' ? now.getDate() - now.getDay() : 1);
  const end = period === 'week' ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7) : new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return {
    start,
    end
  };
}

function goalLocalDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value + 'T00:00:00');
  return new Date(value);
}

function goalPace(goal, current, now = new Date()) {
  const {
    start,
    end
  } = goalPeriodBounds(goal.period, now);
  // Calendar days avoid daylight-saving changes affecting pace and days left.
  const dayNumber = date => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
  const totalDays = dayNumber(end) - dayNumber(start);
  const elapsedDays = dayNumber(now) - dayNumber(start);
  const daysLeft = Math.max(1, totalDays - elapsedDays);
  const remaining = Math.max(0, goal.target - current);
  return {
    daysLeft,
    remaining,
    daily: Math.ceil(remaining / daysLeft),
    behind: remaining > 0 && current < Math.floor(goal.target * elapsedDays / totalDays)
  };
}

function recordGoalProgress(persist = true) {
  let changed = false;
  (state.goals || []).forEach(goal => {
    const start = goalPeriodBounds(goal.period).start.toISOString();
    const current = computeGoalCurrent(goal);
    const history = goal.history || [];
    const entry = history.find(item => item.start === start && item.period === goal.period && item.type === goal.type);
    if (!entry || entry.current !== current || entry.target !== goal.target) {
      if (entry) Object.assign(entry, {
        current,
        target: goal.target
      });
      else history.push({
        start,
        current,
        target: goal.target,
        period: goal.period,
        type: goal.type
      });
      goal.history = history.slice(-24);
      changed = true;
    }
  });
  if (changed && persist) save();
}

function filterJobsByGoalPeriod(jobs, period) {
  const {
    start,
    end
  } = goalPeriodBounds(period);
  return jobs.filter(job => {
    const date = goalLocalDate(job.dateAdded);
    return date >= start && date < end;
  });
}

function computeGoalCurrent(goal) {
  const stagesByType = {applications: ['applied'], interviews: ['interview'], offers: ['offer'], responses: ['screening', 'interview', 'offer', 'declined'], screenings: ['screening']};
  if (stagesByType[goal.type]) {
    const {start, end} = goalPeriodBounds(goal.period);
    return state.jobs.filter(job => (job.stageHistory || []).some(entry => {
      const date = goalLocalDate(entry.at);
      return !entry.observed && stagesByType[goal.type].includes(entry.stage) && date >= start && date < end;
    })).length;
  }
  if (goal.type === 'saved') return filterJobsByGoalPeriod(state.jobs, goal.period).length;
  if (goal.type === 'networking') {
    return filterJobsByGoalPeriod(state.contacts || [], goal.period).length;
  }
  return 0;
}

function openGoalModal(id) {
  const isEdit = !!id;
  document.getElementById('modal-goal-title').textContent = isEdit ? 'Edit Goal' : 'Add Goal';
  document.getElementById('goal-edit-id').value = id || '';
  const g = isEdit ? state.goals.find(x => x.id === id) : null;
  document.getElementById('goal-type').value = g ? g.type : 'applications';
  document.getElementById('goal-period').value = g ? g.period : 'week';
  document.getElementById('goal-target').value = g ? g.target : '';
  openModal('modal-goal');
}

function saveGoal() {
  const type = document.getElementById('goal-type').value;
  const period = document.getElementById('goal-period').value;
  const target = parseInt(document.getElementById('goal-target').value);
  if (!target || target < 1) {
    toast('Target must be a positive number.', 'error');
    return;
  }
  const id = document.getElementById('goal-edit-id').value || uid();
  recordGoalProgress();
  const existing = state.goals.find(g => g.id === id);
  const goal = {
    ...existing,
    id,
    type,
    period,
    target
  };
  const idx = state.goals.findIndex(x => x.id === id);
  if (idx >= 0) state.goals[idx] = goal;
  else state.goals.push(goal);
  save();
  closeModal('modal-goal');
  toast(idx >= 0 ? 'Goal updated.' : 'Goal added.', 'success');
  if (state.activeView === 'goals') renderGoals();
}

function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  state.goals = state.goals.filter(g => g.id !== id);
  save();
  toast('Goal deleted.', '');
  renderGoals();
}

function goalCardHTML(g) {
  const current = computeGoalCurrent(g);
  const pct = Math.min(Math.round((current / g.target) * 100), 100);
  const done = current >= g.target;
  const pace = goalPace(g, current);
  const behind = pace.behind;
  const cardCls = done ? 'goal-complete' : behind ? 'goal-behind' : '';
  const fillCls = done ? 'fill-done' : behind ? 'fill-behind' : '';
  const statusCls = done ? 'goal-status-done' : behind ? 'goal-status-behind' : current > 0 ? 'goal-status-on-track' : 'goal-status-not-started';
  const statusText = done ? '✓ Complete!' : behind ? 'Behind pace' : current > 0 ? 'On track' : 'Not started';
  const badgeCls = g.period === 'week' ? 'badge-week' : 'badge-month';
  const periodLabel = g.period === 'week' ? 'Weekly' : 'Monthly';
  const currentColor = done ? 'var(--green)' : behind ? 'var(--red)' : 'var(--accent)';
  return `<div class="goal-card ${cardCls}" data-goal-id="${g.id}">
    <div class="goal-card-header">
      <div class="goal-title">${GOAL_TYPE_LABELS[g.type]}</div>
      <span class="goal-period-badge ${badgeCls}">${periodLabel}</span>
    </div>
    <div class="goal-progress-wrap">
      <div class="goal-progress-counts">
        <span class="goal-current" style="color:${currentColor}">${current}</span>
        <span class="goal-separator">/</span>
        <span class="goal-target">${g.target}</span>
      </div>
      <div class="goal-track"><div class="goal-fill ${fillCls}" style="width:${pct}%"></div></div>
      <div class="goal-status-label ${statusCls}">${statusText} · ${pct}% complete</div>
      <div class="goal-pace"><strong>${done ? 'Target reached' : `${pace.remaining} left · ${pace.daysLeft} day${pace.daysLeft === 1 ? '' : 's'} remaining`}</strong><span>${done ? 'You have met your goal for this period.' : `Aim for ${pace.daily} per day to finish this ${g.period}.`}</span></div>
    </div>
    <div class="goal-card-footer">
      <button type="button" class="btn-primary goal-action-btn" data-type="${g.type}">${g.type === 'networking' ? 'Add a contact' : g.type === 'saved' ? 'Research a job' : g.type === 'applications' ? 'Add an application' : 'Review pipeline'}</button>
      <button class="btn-secondary goal-edit-btn" data-id="${g.id}" style="font-size:12px;padding:5px 12px">Edit</button>
      <button class="btn-ghost goal-delete-btn" data-id="${g.id}" style="font-size:12px">Delete</button>
    </div>
  </div>`;
}

function renderGoalsSummary(goals) {
  const strip = document.getElementById('goals-summary-strip');
  if (!strip || goals.length === 0) {
    if (strip) strip.innerHTML = '';
    return;
  }
  const r = 22;
  const circ = 2 * Math.PI * r;
  strip.innerHTML = goals.map(g => {
    const current = computeGoalCurrent(g);
    const pct = Math.min(Math.round((current / g.target) * 100), 100);
    const done = pct >= 100;
    const behind = goalPace(g, current).behind;
    const offset = circ - (pct / 100) * circ;
    const fillCls = done ? 'ring-done' : behind ? 'ring-behind' : '';
    return `<div class="goals-summary-card">
      <svg class="goals-mini-ring" width="56" height="56" viewBox="0 0 56 56">
        <circle class="goals-mini-ring-bg" cx="28" cy="28" r="${r}"/>
        <circle class="goals-mini-ring-fill ${fillCls}" cx="28" cy="28" r="${r}" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
        <text x="28" y="33" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)" transform="rotate(90, 28, 28)">${pct}%</text>
      </svg>
      <div class="goals-summary-text">
        <div class="goals-summary-type">${GOAL_TYPE_LABELS[g.type]}</div>
        <div class="goals-summary-pct" style="color:${done?'var(--green)':behind?'var(--red)':'var(--accent)'}">${current} / ${g.target}</div>
        <div class="goals-summary-sub">${g.period === 'week' ? 'This week' : 'This month'}</div>
      </div>
    </div>`;
  }).join('');
}

const GOAL_PRESETS = [{
    period: 'week',
    type: 'applications',
    target: 10
  },
  {
    period: 'week',
    type: 'saved',
    target: 15
  },
  {
    period: 'week',
    type: 'networking',
    target: 3
  },
  {
    period: 'week',
    type: 'interviews',
    target: 2
  },
  {
    period: 'month',
    type: 'applications',
    target: 30
  },
  {
    period: 'month',
    type: 'screenings',
    target: 5
  },
  {
    period: 'month',
    type: 'responses',
    target: 5
  },
  {
    period: 'month',
    type: 'networking',
    target: 10
  },
  {
    period: 'month',
    type: 'offers',
    target: 1
  },
];

function renderGoalPresets() {
  const row = document.getElementById('goals-preset-row');
  if (!row) return;
  row.innerHTML = GOAL_PRESETS.map(p => {
    const label = `${p.target} ${GOAL_TYPE_LABELS[p.type].toLowerCase()}/${p.period}`;
    return `<button class="goals-preset-btn" data-preset='${JSON.stringify(p)}'>${label}</button>`;
  }).join('');
  row.querySelectorAll('.goals-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = JSON.parse(btn.dataset.preset);
      // Check if this exact goal already exists
      const exists = state.goals.find(g => g.type === preset.type && g.period === preset.period);
      if (exists) {
        toast('That goal already exists.', 'error');
        return;
      }
      state.goals.push({
        id: uid(),
        ...preset
      });
      save();
      toast('Goal added!', 'success');
      renderGoals();
    });
  });
}

function renderGoalHistory(goals) {
  const el = document.getElementById('goals-history');
  if (!el) return;
  const entries = goals.flatMap(goal => (goal.history || []).filter(entry => new Date(entry.start) < goalPeriodBounds(entry.period).start));
  entries.sort((a, b) => new Date(b.start) - new Date(a.start));
  el.innerHTML = entries.length ? entries.slice(0, 12).map(entry => {
    const date = new Date(entry.start).toLocaleDateString(undefined, entry.period === 'week' ? {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    } : {
      month: 'long',
      year: 'numeric'
    });
    const done = entry.current >= entry.target;
    return `<div class="goal-history-row"><div><strong>${escHtml(GOAL_TYPE_LABELS[entry.type] || entry.type)}</strong><span>${entry.period === 'week' ? 'Week of ' : ''}${escHtml(date)}</span></div><strong>${entry.current} / ${entry.target}</strong><span class="goal-history-status ${done ? 'goal-status-done' : ''}">${done ? 'Target met' : 'Below target'}</span></div>`;
  }).join('') : '<p class="empty-msg">Your history starts now. Completed weeks and months will appear here with their last recorded progress.</p>';
}

function renderGoalActivity() {
  const el = document.getElementById('goals-activity');
  if (!el) return;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const items = [...state.jobs, ...(state.contacts || [])];
  let activeDays = 0;
  const cells = Array.from({
    length: 28
  }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 27 + i);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const count = items.filter(item => {
      const added = goalLocalDate(item.dateAdded);
      return added >= date && added < end;
    }).length;
    if (count) activeDays++;
    const label = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${count} job${count === 1 ? '' : 's'} or contacts added`;
    return `<span class="goal-activity-day" data-level="${Math.min(count, 4)}" role="img" aria-label="${escHtml(label)}" title="${escHtml(label)}"><span>${date.getDate()}</span></span>`;
  }).join('');
  el.innerHTML = `<div class="goal-activity-summary"><strong>${activeDays} active days</strong><span>Last 28 days · Jobs and contacts added</span></div><div class="goal-activity-grid">${cells}</div><div class="goal-activity-legend"><span>Less</span>${[0, 1, 2, 3, 4].map(level => `<span class="goal-activity-day" data-level="${level}" aria-hidden="true"></span>`).join('')}<span>More</span></div>`;
}

function renderGoals() {
  recordGoalProgress();
  const goals = state.goals || [];
  const filtered = goalPeriodFilter === 'all' ? goals : goals.filter(g => g.period === goalPeriodFilter);
  renderGoalsSummary(filtered);
  const grid = document.getElementById('goals-grid');
  const emptyEl = document.getElementById('goals-empty');
  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = emptyStateHTML('🎯', 'No goals yet', 'Set a weekly or monthly target to track your progress');
    if (emptyEl) emptyEl.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    grid.innerHTML = filtered.map(g => goalCardHTML(g)).join('');
    if (typeof animateCompleteGoals === 'function') animateCompleteGoals();
    grid.querySelectorAll('.goal-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openGoalModal(btn.dataset.id));
    });
    grid.querySelectorAll('.goal-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteGoal(btn.dataset.id));
    });
    grid.querySelectorAll('.goal-action-btn').forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.type === 'networking') openContactModal();
        else if (['applications', 'saved'].includes(btn.dataset.type)) {
          openAddJobModal(null, {
            stage: btn.dataset.type === 'saved' ? 'saved' : 'applied'
          });
        } else navigate('board');
      };
    });
  }
  renderGoalPresets();
  renderGoalHistory(filtered);
  renderGoalActivity();
  // Wire period tabs
  document.querySelectorAll('.goal-period-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.goal-period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      goalPeriodFilter = btn.dataset.goalPeriod;
      renderGoals();
    };
  });
}

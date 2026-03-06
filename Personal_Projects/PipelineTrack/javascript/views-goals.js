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
};

function filterJobsByGoalPeriod(jobs, period) {
  const now = new Date();
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return jobs.filter(j => new Date(j.dateAdded) >= start);
  }
  if (period === 'month') {
    return jobs.filter(j => {
      const d = new Date(j.dateAdded);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }
  return jobs;
}

function computeGoalCurrent(goal) {
  const j = filterJobsByGoalPeriod(state.jobs, goal.period);
  if (goal.type === 'applications') return j.filter(x => x.stage !== 'saved').length;
  if (goal.type === 'interviews') return j.filter(x => ['interview', 'offer'].includes(x.stage)).length;
  if (goal.type === 'offers') return j.filter(x => x.stage === 'offer').length;
  if (goal.type === 'responses') return j.filter(x => ['screening', 'interview', 'offer'].includes(x.stage)).length;
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
  const goal = {
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
  const behind = !done && current > 0 && current < g.target / 2;
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
    </div>
    <div class="goal-card-footer">
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
    const behind = !done && current > 0 && pct < 50;
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
    type: 'responses',
    target: 5
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

function renderGoals() {
  const goals = state.goals || [];
  const filtered = goalPeriodFilter === 'all' ? goals : goals.filter(g => g.period === goalPeriodFilter);
  renderGoalsSummary(filtered);
  const grid = document.getElementById('goals-grid');
  const emptyEl = document.getElementById('goals-empty');
  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    renderGoalPresets();
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
  }
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
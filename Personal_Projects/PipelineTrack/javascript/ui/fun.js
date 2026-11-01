'use strict';

/* ════════════════════════════════════════════════════════════
   fun.js — celebrations, milestones, streak, nudge
   ════════════════════════════════════════════════════════════ */

/* ── CONFETTI ─────────────────────────────────────────────── */
function launchConfetti() {
  const colors = ['#00d4aa', '#a78bfa', '#fbbf24', '#f87171', '#4ade80', '#fb923c'];
  for (let i = 0; i < 72; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = [
      `left:${Math.random() * 100}vw`,
      `background:${colors[i % colors.length]}`,
      `animation-delay:${(Math.random() * 0.6).toFixed(2)}s`,
      `animation-duration:${(0.9 + Math.random() * 1.1).toFixed(2)}s`,
      `width:${6 + Math.floor(Math.random() * 7)}px`,
      `height:${6 + Math.floor(Math.random() * 7)}px`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '3px'}`,
    ].join(';');
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ── MILESTONE TOASTS ─────────────────────────────────────── */
const MILESTONE_MSGS = {
  1: '🎯 First job tracked! The search is on.',
  10: '📬 10 applications tracked. Building momentum!',
  25: '🔥 25 applications — you\'re putting in the work.',
  50: '👀 50 applications. That\'s commitment.',
  100: '💯 100 jobs tracked. Legendary.',
};

function checkMilestoneToast(count) {
  const msg = MILESTONE_MSGS[count];
  if (msg) setTimeout(() => toast(msg, 'success'), 350);
}

/* ── STREAK COUNTER ───────────────────────────────────────── */
function computeStreak(jobs) {
  if (!jobs.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = new Set(jobs.map(j => {
    const d = new Date(j.dateAdded);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }));
  // If nothing added today, allow starting from yesterday so importing
  // a backup doesn't wipe a streak before today's job is added
  const day = new Date(today);
  if (!dates.has(day.getTime())) {
    day.setDate(day.getDate() - 1);
    if (!dates.has(day.getTime())) return 0;
  }
  let streak = 0;
  while (dates.has(day.getTime())) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

/* ── GOAL COMPLETE POP ────────────────────────────────────── */
function animateCompleteGoals() {
  document.querySelectorAll('.goal-card.goal-complete').forEach(card => {
    card.classList.remove('goal-pop');
    void card.offsetWidth;
    card.classList.add('goal-pop');
  });
}

/* ── DASHBOARD NUDGE ──────────────────────────────────────── */
function getDashboardNudge(jobs) {
  const applied = jobs.filter(j => j.stage !== 'saved').length;
  const offers = jobs.filter(j => j.stage === 'offer').length;
  if (!jobs.length) return '✨ Add your first job to kick things off.';
  if (offers > 0) return `🎉 You have ${offers} offer${offers > 1 ? 's' : ''}! Keep pushing.`;
  if (applied >= 50) return '💪 50+ applications deep. Consistency is your superpower.';
  if (applied >= 20) return `📈 ${applied} applications and counting — great momentum!`;
  if (applied >= 5) return '🔥 Things are heating up. Keep the pace!';
  return '🌱 Good start! Apply consistently for the best results.';
}
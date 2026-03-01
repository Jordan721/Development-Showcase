'use strict';

/* ══════════════════════════════════════════════════════════
   animations.js — PipelineTrack animation helpers
   All functions are globals so app.js can call them without
   imports. Guards (typeof checks) in app.js make each call
   safe even if this file is ever removed.
   ══════════════════════════════════════════════════════════ */

/* ─── COUNT-UP ──────────────────────────────────────────────
   Ticks el.textContent from 0 → target over `duration` ms.
   suffix: string appended after the number (e.g. '%').
   Uses ease-out cubic so it starts fast and settles gently.
   ──────────────────────────────────────────────────────────── */
function animateCountUp(el, target, suffix, duration) {
  suffix = suffix || '';
  duration = duration || 700;
  if (target === null || isNaN(target)) return;

  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = Math.round(eased * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ─── DASHBOARD STATS ───────────────────────────────────────
   Called at the end of renderDashboard().
   Reads [data-count] and [data-suffix] set by the render
   function, then plays the reveal animation + count-up.
   ──────────────────────────────────────────────────────────── */
function animateDashboardStats() {
  document.querySelectorAll('.stat-value[data-count]').forEach(function (el, i) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';

    // Stagger each card slightly so they cascade in
    var delay = i * 60;
    setTimeout(function () {
      el.classList.remove('stat-reveal');
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add('stat-reveal');
      animateCountUp(el, target, suffix, 650);
    }, delay);
  });
}

/* ─── BOARD CARD STAGGER ────────────────────────────────────
   Called at the end of renderBoard().
   Adds .card-enter to every .job-card with a staggered delay
   so they cascade down the columns rather than all appearing
   at once.
   ──────────────────────────────────────────────────────────── */
function animateBoardCards() {
  document.querySelectorAll('.job-card').forEach(function (card, i) {
    card.classList.remove('card-enter');
    void card.offsetWidth;
    card.classList.add('card-enter');
    card.style.animationDelay = (i * 38) + 'ms';
  });
}

/* ─── BAR FILL ──────────────────────────────────────────────
   Resets matching bars to width 0, then in the next frame
   restores the target width so the CSS transition plays from
   zero. Works for both pipeline bars and coverage bars.
   ──────────────────────────────────────────────────────────── */
function animateBars(selector) {
  requestAnimationFrame(function () {
    document.querySelectorAll(selector).forEach(function (bar) {
      var target = bar.style.width;
      bar.style.transition = 'none';
      bar.style.width = '0';
      requestAnimationFrame(function () {
        bar.style.transition = '';
        bar.style.width = target;
      });
    });
  });
}

/* ─── SKILL TAG POP-IN ──────────────────────────────────────
   Animates the last `count` skill tags in the container.
   Called from addSkill() (count=1) and bulkAddSkills()
   (count = number of skills just added).
   ──────────────────────────────────────────────────────────── */
function animateNewSkillTags(count) {
  count = count || 1;
  var container = document.getElementById('skill-tags-container');
  if (!container) return;

  var tags = Array.from(container.querySelectorAll('.skill-tag'));
  tags.slice(-count).forEach(function (tag, i) {
    tag.classList.remove('skill-pop');
    void tag.offsetWidth;
    tag.style.animationDelay = (i * 55) + 'ms';
    tag.classList.add('skill-pop');
  });
}
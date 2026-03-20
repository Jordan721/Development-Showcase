'use strict';

/* ══════════════════════════════════════════════════════════
   ONBOARDING — first-run guide, reopenable via ? button
   ══════════════════════════════════════════════════════════ */

(function () {
  const STORAGE_KEY = 'pt-onboarded';
  const TOTAL_STEPS = 4;
  let currentStep = 1;

  function openOnboarding() {
    currentStep = 1;
    updateStep();
    document.getElementById('modal-onboarding').classList.add('open');
  }

  function closeOnboarding() {
    document.getElementById('modal-onboarding').classList.remove('open');
    localStorage.setItem(STORAGE_KEY, '1');
  }

  function updateStep() {
    document.querySelectorAll('.onboarding-step').forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.step) === currentStep);
    });
    document.querySelectorAll('.onboarding-dot').forEach(d => {
      d.classList.toggle('active', parseInt(d.dataset.dot) === currentStep);
    });

    document.getElementById('onboarding-prev').style.display = currentStep > 1 ? '' : 'none';

    const nextBtn = document.getElementById('onboarding-next');
    nextBtn.textContent = currentStep === TOTAL_STEPS ? 'Get Started' : 'Next';

    const fill = document.getElementById('onboarding-progress-fill');
    if (fill) fill.style.width = (currentStep / TOTAL_STEPS * 100) + '%';

    // Widen modal on step 4 to fit 2-col features grid
    const modal = document.querySelector('.onboarding-modal');
    if (modal) modal.classList.toggle('ob-step4-active', currentStep === TOTAL_STEPS);

    // Animate kbd keys on step 4
    if (currentStep === TOTAL_STEPS) {
      const keys = document.querySelectorAll('.onboarding-step[data-step="4"] kbd');
      keys.forEach((k, i) => {
        k.classList.remove('kbd-press');
        void k.offsetWidth;
        setTimeout(() => k.classList.add('kbd-press'), i * 120);
      });
    }

    // Sync arrow button disabled state
    const arrowPrev = document.getElementById('ob-arrow-prev');
    const arrowNext = document.getElementById('ob-arrow-next');
    if (arrowPrev) arrowPrev.disabled = currentStep === 1;
    if (arrowNext) arrowNext.disabled = currentStep === TOTAL_STEPS;
  }

  function goNext() {
    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      updateStep();
    } else {
      closeOnboarding();
    }
  }

  function goPrev() {
    if (currentStep > 1) {
      currentStep--;
      updateStep();
    }
  }

  document.getElementById('onboarding-next').addEventListener('click', goNext);
  document.getElementById('onboarding-prev').addEventListener('click', goPrev);
  document.getElementById('ob-arrow-prev').addEventListener('click', goPrev);
  document.getElementById('ob-arrow-next').addEventListener('click', goNext);

  document.getElementById('onboarding-skip').addEventListener('click', closeOnboarding);
  document.getElementById('onboarding-help-btn').addEventListener('click', openOnboarding);

  // Keyboard left/right navigation while onboarding is open
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('modal-onboarding').classList.contains('open')) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  });

  // Close on backdrop click
  document.getElementById('modal-onboarding').addEventListener('click', function (e) {
    if (e.target === this) closeOnboarding();
  });

  // Auto-show on first visit
  if (!localStorage.getItem(STORAGE_KEY)) {
    openOnboarding();
  }
})();
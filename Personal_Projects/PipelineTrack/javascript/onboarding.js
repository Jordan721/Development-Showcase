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
  }

  document.getElementById('onboarding-next').addEventListener('click', () => {
    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      updateStep();
    } else {
      closeOnboarding();
    }
  });

  document.getElementById('onboarding-prev').addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStep();
    }
  });

  document.getElementById('onboarding-skip').addEventListener('click', closeOnboarding);

  document.getElementById('onboarding-help-btn').addEventListener('click', openOnboarding);

  // Close on backdrop click
  document.getElementById('modal-onboarding').addEventListener('click', function (e) {
    if (e.target === this) closeOnboarding();
  });

  // Auto-show on first visit
  if (!localStorage.getItem(STORAGE_KEY)) {
    openOnboarding();
  }
})();
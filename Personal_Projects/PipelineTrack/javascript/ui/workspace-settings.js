(() => {
  'use strict';
  const dialog = document.getElementById('workspace-settings-dialog');
  const trigger = document.getElementById('workspace-settings-open');
  const preferences = [
    { id: 'workspace-system-theme', key: 'pt-system-theme', attribute: 'data-system-theme', values: ['off', 'on'], fallback: 'off' },
    { id: 'workspace-contrast', key: 'pt-contrast', attribute: 'data-contrast', values: ['off', 'on'], fallback: 'off' },
    { id: 'workspace-motion', key: 'pt-motion', attribute: 'data-motion', values: ['system', 'reduce'], fallback: 'system' },
    { id: 'workspace-text-size', key: 'pt-text-size', attribute: 'data-text-size', values: ['small', 'default', 'large'], fallback: 'default' },
    { id: 'workspace-spacing', key: 'pt-spacing', attribute: 'data-spacing', values: ['compact', 'comfortable', 'spacious'], fallback: 'comfortable' },
    { id: 'workspace-start-page', key: 'pt-start-page', attribute: 'data-start-page', values: ['dashboard', 'board', 'calendar'], fallback: 'dashboard' },
    { id: 'workspace-date-format', key: 'pt-date-format', attribute: 'data-date-format', values: ['default', 'mdy', 'dmy'], fallback: 'default' },
  ];
  preferences.forEach(({ id, key, attribute, values, fallback }) => {
    const control = document.getElementById(id);
    let saved;
    try { saved = localStorage.getItem(key); } catch { /* Use defaults if storage is unavailable. */ }
    control.value = values.includes(saved) ? saved : fallback;
    document.documentElement.setAttribute(attribute, control.value);
    control.addEventListener('change', () => {
      const value = values.includes(control.value) ? control.value : fallback;
      document.documentElement.setAttribute(attribute, value);
      try { localStorage.setItem(key, value); } catch { /* The current session still works. */ }
      if (id === 'workspace-system-theme' && value === 'on') {
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', { system: true });
      }
      if (id === 'workspace-date-format') {
        const view = document.querySelector('.nav-link.active')?.dataset.view;
        if (view) navigate(view);
      }
      document.getElementById('workspace-settings-status').textContent = id === 'workspace-start-page'
        ? 'Your starting page will open next time you load the app.' : 'Preference applied.';
    });
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (document.documentElement.getAttribute('data-system-theme') === 'on') {
      setTheme(event.matches ? 'dark' : 'light', { system: true });
    }
  });
  document.getElementById('workspace-reset-appearance').addEventListener('click', () => {
    preferences.filter(pref => !['pt-start-page', 'pt-date-format'].includes(pref.key)).forEach(pref => {
      document.getElementById(pref.id).value = pref.fallback;
      document.documentElement.setAttribute(pref.attribute, pref.fallback);
      try { localStorage.setItem(pref.key, pref.fallback); } catch { /* Session-only fallback. */ }
    });
    document.documentElement.classList.remove('colorblind');
    document.getElementById('btn-colorblind')?.classList.remove('active');
    document.getElementById('btn-colorblind')?.setAttribute('aria-pressed', 'false');
    try {
      localStorage.setItem('pt-colorblind', '0');
      localStorage.setItem('pt-theme-motion-enabled', '1');
    } catch { /* Session-only fallback. */ }
    syncThemeMotionButton();
    setTheme('dark', { animate: false });
    document.getElementById('workspace-settings-status').textContent = 'Appearance restored to defaults. Starting page, date format, and your records are unchanged.';
  });
  let previousFocus;
  function open() {
    if (dialog.open) return;
    previousFocus = document.activeElement;
    dialog.showModal();
  }
  trigger.addEventListener('click', open);
  document.getElementById('workspace-settings-close').addEventListener('click', () => dialog.close());
  // A click on the backdrop targets the dialog; clicks inside its bounds stay open.
  let backdropPress = false;
  function outside(event) {
    const rect = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  }
  dialog.addEventListener('pointerdown', event => { backdropPress = outside(event); });
  dialog.addEventListener('click', event => {
    if (backdropPress && outside(event)) dialog.close();
    backdropPress = false;
  });
  dialog.addEventListener('close', () => {
    backdropPress = false;
    if (previousFocus?.isConnected) previousFocus.focus();
  });
  document.addEventListener('keydown', event => {
    // Keep application shortcuts from opening other views behind the modal.
    if (dialog.open) {
      event.stopImmediatePropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
      }
      return;
    }
    const target = document.activeElement;
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.isComposing
      || target?.matches('input, textarea, select') || target?.isContentEditable
      || document.querySelector('.modal-overlay.open, dialog[open], .command-palette-overlay.open')) return;
    if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      event.stopImmediatePropagation();
      open();
    }
  }, true);
})();

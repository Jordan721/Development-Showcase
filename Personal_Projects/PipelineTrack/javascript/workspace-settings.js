(() => {
  'use strict';
  const dialog = document.getElementById('workspace-settings-dialog');
  const trigger = document.getElementById('workspace-settings-open');
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

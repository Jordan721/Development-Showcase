// Toolbar UI Controller
// Handles the new floating toolbar interactions

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const toolbar = document.getElementById('toolbar');
    const toggleToolbar = document.getElementById('toggleToolbar');
    const helpPanel = document.getElementById('helpPanel');
    const toggleHelp = document.getElementById('toggleHelp');
    const closeHelp = document.getElementById('closeHelp');

    // Hidden selects (for compatibility with existing sketch.js)
    const shapeSelect = document.getElementById('shapeType');
    const colorSelect = document.getElementById('colorScheme');

    // Dropdown menus
    const colorDropdown = document.getElementById('colorDropdown');
    const shapeDropdown = document.getElementById('shapeDropdown');

    // Modal
    const aboutModal = document.getElementById('aboutModal');
    const modalClose = document.querySelector('.modal-close');

    // ===== Toolbar Toggle =====
    if (toggleToolbar) {
        toggleToolbar.addEventListener('click', function() {
            toolbar.classList.remove('collapsed');
            toggleToolbar.classList.remove('visible');
        });
    }

    // Double-click to hide toolbar
    document.addEventListener('dblclick', function(e) {
        // Don't hide if clicking on UI elements
        if (e.target.closest('.floating-toolbar') ||
            e.target.closest('.floating-header') ||
            e.target.closest('.help-panel') ||
            e.target.closest('.modal')) {
            return;
        }

        toolbar.classList.add('collapsed');
        toggleToolbar.classList.add('visible');
    });

    // ===== Help Panel =====
    if (toggleHelp) {
        toggleHelp.addEventListener('click', function() {
            helpPanel.classList.toggle('visible');
            this.classList.toggle('active');
        });
    }

    if (closeHelp) {
        closeHelp.addEventListener('click', function() {
            helpPanel.classList.remove('visible');
            toggleHelp.classList.remove('active');
        });
    }

    // ===== Dropdown Menus =====
    // Color scheme dropdown
    if (colorDropdown) {
        colorDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                const value = this.dataset.value;

                // Update hidden select
                colorSelect.value = value;
                colorSelect.dispatchEvent(new Event('change'));

                // Update active state
                colorDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Shape mode dropdown
    if (shapeDropdown) {
        shapeDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                const value = this.dataset.value;

                // Update hidden select
                shapeSelect.value = value;
                shapeSelect.dispatchEvent(new Event('change'));

                // Update active state
                shapeDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // ===== Button State Updates =====
    // Update rotation button icon based on state
    const rotationBtn = document.getElementById('toggleRotation');
    if (rotationBtn) {
        const originalClick = rotationBtn.onclick;
        rotationBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-pause')) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                this.classList.add('active');
            } else {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                this.classList.remove('active');
            }
        });
    }

    // Explode button state
    const explodeBtn = document.getElementById('explodeShapes');
    if (explodeBtn) {
        explodeBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-expand-alt')) {
                icon.classList.remove('fa-expand-alt');
                icon.classList.add('fa-compress-alt');
                this.classList.add('active');
            } else {
                icon.classList.remove('fa-compress-alt');
                icon.classList.add('fa-expand-alt');
                this.classList.remove('active');
            }
        });
    }

    // Particles button state
    const particlesBtn = document.getElementById('toggleParticles');
    if (particlesBtn) {
        particlesBtn.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    // Music button state
    const musicBtn = document.getElementById('toggleMusic');
    if (musicBtn) {
        musicBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-music');
                this.classList.remove('active');
            } else {
                icon.classList.remove('fa-music');
                icon.classList.add('fa-volume-up');
                this.classList.add('active');
            }
        });
    }

    // === Sound Reactive button state ===
    const soundReactiveBtn = document.getElementById('toggleSoundReactive');
    if (soundReactiveBtn) {
        soundReactiveBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('fa-wave-square');
                icon.classList.add('fa-music');
            } else {
                icon.classList.remove('fa-music');
                icon.classList.add('fa-wave-square');
            }
        });
    }

    // === Bloom button state ===
    const bloomBtn = document.getElementById('toggleBloom');
    if (bloomBtn) {
        bloomBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-star');
            } else {
                icon.classList.remove('fa-star');
                icon.classList.add('fa-sun');
            }
        });
    }

    // ===== Modal =====
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            aboutModal.style.display = 'none';
        });
    }

    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // ===== Keyboard Shortcuts for Help Panel =====
    document.addEventListener('keydown', function(e) {
        // Press H or ? to toggle help
        if ((e.key === 'h' || e.key === 'H' || e.key === '?') && !e.ctrlKey && !e.metaKey) {
            // Don't trigger if typing in input
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            helpPanel.classList.toggle('visible');
            toggleHelp.classList.toggle('active');
        }

        // Escape to close panels
        if (e.key === 'Escape') {
            helpPanel.classList.remove('visible');
            toggleHelp.classList.remove('active');
            if (aboutModal) aboutModal.style.display = 'none';
        }
    });

    // ===== Sync dropdown active states with keyboard shortcuts =====
    // Listen for color scheme changes from keyboard (C key)
    if (colorSelect) {
        const observer = new MutationObserver(function() {
            const currentValue = colorSelect.value;
            colorDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.toggle('active', item.dataset.value === currentValue);
            });
        });

        colorSelect.addEventListener('change', function() {
            const currentValue = this.value;
            colorDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.toggle('active', item.dataset.value === currentValue);
            });
        });
    }

    // Listen for shape mode changes from keyboard (1-6 keys)
    if (shapeSelect) {
        shapeSelect.addEventListener('change', function() {
            const currentValue = this.value;
            shapeDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.toggle('active', item.dataset.value === currentValue);
            });
        });
    }

    console.log('Toolbar UI initialized');
});

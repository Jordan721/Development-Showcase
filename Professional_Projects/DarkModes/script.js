// =====================================================
// Dark Mode Technical Guide - Interactive JavaScript
// =====================================================

// State
let isDarkMode = false;
let toggleCount = 0;
let linesChanged = 0;

// Theme colors for code display
const lightColors = {
    background: '#ffffff',
    foreground: '#1a1a2e',
    primary: '#6366f1',
    card: '#f8fafc',
    border: '#e2e8f0'
};

const darkColors = {
    background: '#0f0f1a',
    foreground: '#f1f5f9',
    primary: '#818cf8',
    card: '#1e1e2e',
    border: '#2e2e3e'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeTabs();
    initializeToggles();
    initializeSystemPreference();
    updateAllDisplays();
});

// =====================================================
// Theme Initialization
// =====================================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('darkmode-guide-theme');

    if (savedTheme === 'dark') {
        setTheme(true, false);
    } else if (savedTheme === 'light') {
        setTheme(false, false);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark, false);
    }
}

function setTheme(dark, animate = true) {
    isDarkMode = dark;

    if (dark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    localStorage.setItem('darkmode-guide-theme', dark ? 'dark' : 'light');

    if (animate) {
        toggleCount++;
        linesChanged += 5;
        updateStats();
        animateCodeChanges();
    }

    updateAllDisplays();
    updateToggleStates();
}

function toggleTheme() {
    setTheme(!isDarkMode);
}

// =====================================================
// Tab Navigation
// =====================================================

function initializeTabs() {
    document.querySelectorAll('.code-tabs').forEach(tabContainer => {
        const tabs = tabContainer.querySelectorAll('.tab');
        const parent = tabContainer.closest('.code-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update visible code block
                parent.querySelectorAll('.code-block').forEach(block => {
                    block.classList.remove('active');
                });

                const targetBlock = parent.querySelector(`#${targetId}`);
                if (targetBlock) {
                    targetBlock.classList.add('active');
                }
            });
        });
    });
}

// =====================================================
// Toggle Buttons
// =====================================================

function initializeToggles() {
    // Nav toggle
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleTheme);
    }

    // Method 1 toggle (CSS Variables)
    const method1Toggle = document.getElementById('method1-toggle');
    if (method1Toggle) {
        method1Toggle.addEventListener('click', () => {
            method1Toggle.classList.toggle('active');
            toggleTheme();
        });
    }

    // Method 2 toggle (Class Toggle)
    const method2Toggle = document.getElementById('method2-toggle');
    if (method2Toggle) {
        method2Toggle.addEventListener('click', () => {
            method2Toggle.classList.toggle('active');
            toggleTheme();
        });
    }
}

function updateToggleStates() {
    const method1Toggle = document.getElementById('method1-toggle');
    const method2Toggle = document.getElementById('method2-toggle');

    if (method1Toggle) {
        method1Toggle.classList.toggle('active', isDarkMode);
    }

    if (method2Toggle) {
        method2Toggle.classList.toggle('active', isDarkMode);
    }
}

// =====================================================
// Update Displays
// =====================================================

function updateAllDisplays() {
    updateMethod1Display();
    updateMethod2Display();
    updateMethod3Display();
    updateHeroDisplay();
    updateInspector();
    updatePreviewPanels();
}

function updateStats() {
    const toggleCountEl = document.getElementById('toggle-count');
    const linesChangedEl = document.getElementById('lines-changed');

    if (toggleCountEl) {
        toggleCountEl.textContent = toggleCount;
        toggleCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            toggleCountEl.style.transform = 'scale(1)';
        }, 200);
    }

    if (linesChangedEl) {
        linesChangedEl.textContent = linesChanged;
        linesChangedEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            linesChangedEl.style.transform = 'scale(1)';
        }, 200);
    }
}

// Method 1: CSS Variables Display
function updateMethod1Display() {
    const colors = isDarkMode ? darkColors : lightColors;

    // Update animated values with flash effect
    const elements = {
        'm1-bg': colors.background,
        'm1-fg': colors.foreground,
        'm1-primary': colors.primary,
        'm1-card': colors.card,
        'm1-border': colors.border
    };

    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el && el.textContent !== value) {
            el.textContent = value;
            el.classList.add('changed');
            setTimeout(() => el.classList.remove('changed'), 500);
        }
    });

    // Update state display
    const stateEl = document.getElementById('m1-state');
    if (stateEl) {
        stateEl.textContent = `"${isDarkMode ? 'dark' : 'light'}"`;
    }
}

// Method 2: Class Toggle Display
function updateMethod2Display() {
    const className = isDarkMode ? 'dark-mode' : '';

    const classesEl = document.getElementById('m2-classes');
    if (classesEl) {
        classesEl.textContent = `"${className}"`;
    }

    const bodyClassEl = document.getElementById('m2-body-class');
    if (bodyClassEl) {
        bodyClassEl.textContent = `"${className}"`;
    }

    const inspectorEl = document.getElementById('m2-inspector');
    if (inspectorEl) {
        inspectorEl.textContent = `"${className}"`;
    }
}

// Method 3: System Preference Display
function updateMethod3Display() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const mediaStatusEl = document.getElementById('m3-media-status');
    if (mediaStatusEl) {
        mediaStatusEl.textContent = `prefers-color-scheme: ${prefersDark ? 'dark' : 'light'}`;
    }

    const matchesEl = document.getElementById('m3-matches');
    if (matchesEl) {
        matchesEl.textContent = prefersDark.toString();
    }

    const queryMatchesEl = document.getElementById('m3-query-matches');
    if (queryMatchesEl) {
        queryMatchesEl.textContent = prefersDark.toString();
    }

    const osPrefEl = document.getElementById('os-preference');
    if (osPrefEl) {
        osPrefEl.textContent = prefersDark ? 'Dark Mode' : 'Light Mode';
    }

    const systemPrefTextEl = document.getElementById('system-pref-text');
    if (systemPrefTextEl) {
        systemPrefTextEl.textContent = prefersDark ? 'Dark Detected' : 'Light Detected';
    }
}

// Hero Display
function updateHeroDisplay() {
    const colors = isDarkMode ? darkColors : lightColors;

    const heroBgEl = document.getElementById('hero-bg');
    if (heroBgEl) {
        heroBgEl.textContent = colors.background;
    }

    const heroTextEl = document.getElementById('hero-text');
    if (heroTextEl) {
        heroTextEl.textContent = colors.foreground;
    }
}

// Inspector Display
function updateInspector() {
    const theme = isDarkMode ? 'dark' : 'light';

    const htmlEl = document.getElementById('inspector-html');
    if (htmlEl) {
        const newValue = `<html data-theme="${theme}">`;
        if (htmlEl.textContent !== newValue) {
            htmlEl.textContent = newValue;
            htmlEl.classList.add('changed');
            setTimeout(() => htmlEl.classList.remove('changed'), 500);
        }
    }

    const bodyEl = document.getElementById('inspector-body');
    if (bodyEl) {
        const newValue = isDarkMode ? 'DOMTokenList ["dark-mode"]' : 'DOMTokenList []';
        if (bodyEl.textContent !== newValue) {
            bodyEl.textContent = newValue;
            bodyEl.classList.add('changed');
            setTimeout(() => bodyEl.classList.remove('changed'), 500);
        }
    }

    const colors = isDarkMode ? darkColors : lightColors;

    const bgEl = document.getElementById('inspector-bg');
    if (bgEl) {
        if (bgEl.textContent !== colors.background) {
            bgEl.textContent = colors.background;
            bgEl.classList.add('changed');
            setTimeout(() => bgEl.classList.remove('changed'), 500);
        }
    }

    const fgEl = document.getElementById('inspector-fg');
    if (fgEl) {
        if (fgEl.textContent !== colors.foreground) {
            fgEl.textContent = colors.foreground;
            fgEl.classList.add('changed');
            setTimeout(() => fgEl.classList.remove('changed'), 500);
        }
    }

    const storageEl = document.getElementById('inspector-storage');
    if (storageEl) {
        const newValue = `"${theme}"`;
        if (storageEl.textContent !== newValue) {
            storageEl.textContent = newValue;
            storageEl.classList.add('changed');
            setTimeout(() => storageEl.classList.remove('changed'), 500);
        }
    }
}

// Preview Panels
function updatePreviewPanels() {
    const preview1 = document.getElementById('preview1');
    const preview2 = document.getElementById('preview2');
    const preview3 = document.getElementById('preview3');

    [preview1, preview2, preview3].forEach(panel => {
        if (panel) {
            panel.classList.toggle('dark', isDarkMode);
        }
    });
}

// Animate code changes
function animateCodeChanges() {
    const animatedValues = document.querySelectorAll('.value.animated');
    animatedValues.forEach(el => {
        el.classList.add('changed');
        setTimeout(() => el.classList.remove('changed'), 500);
    });
}

// =====================================================
// System Preference Detection
// =====================================================

function initializeSystemPreference() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Update display immediately
    updateMethod3Display();

    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
        updateMethod3Display();

        // Optionally auto-switch (commented out to allow manual control)
        // setTheme(e.matches);
    });
}

// =====================================================
// Keyboard Shortcuts
// =====================================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + D to toggle
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
    }
});

// =====================================================
// Smooth Scroll for Navigation
// =====================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =====================================================
// Intersection Observer for Animations
// =====================================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe method sections
document.querySelectorAll('.method-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

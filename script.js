// Constellation Background Animation
const canvas = document.getElementById('constellationCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationId;
let isAnimating = true;

// Configuration
const config = {
    particleCount: 80,
    particleSize: 2,
    lineDistance: 150,
    particleSpeed: 0.3,
    primaryColor: 'rgba(168, 85, 247, ', // Purple
    secondaryColor: 'rgba(192, 132, 252, ', // Light purple
};

// Resize canvas to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * config.particleSpeed;
        this.vy = (Math.random() - 0.5) * config.particleSpeed;
        this.size = Math.random() * config.particleSize + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Pulse effect
        this.currentOpacity = this.opacity + Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.2;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = config.primaryColor + this.currentOpacity + ')';
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = config.primaryColor + (this.currentOpacity * 0.3) + ')';
        ctx.fill();
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
}

// Draw lines between nearby particles
function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.lineDistance) {
                const opacity = (1 - distance / config.lineDistance) * 0.4;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = config.secondaryColor + opacity + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    if (!isAnimating) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connecting lines
    drawLines();

    animationId = requestAnimationFrame(animate);
}

// Start animation
function startAnimation() {
    isAnimating = true;
    animate();
}

// Stop animation
function stopAnimation() {
    isAnimating = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Initialize
resizeCanvas();
initParticles();

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

// Animation toggle functionality
const animationToggle = document.getElementById('animationToggle');
const animatedBackground = document.getElementById('animatedBackground');
const toggleIcon = animationToggle.querySelector('i');

// Check localStorage for saved preference
const animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';

// Set initial state
if (!animationsEnabled) {
    animatedBackground.classList.add('paused');
    animationToggle.classList.add('paused');
    toggleIcon.classList.remove('fa-play');
    toggleIcon.classList.add('fa-pause');
    stopAnimation();
} else {
    startAnimation();
}

animationToggle.addEventListener('click', () => {
    const isPaused = animatedBackground.classList.contains('paused');

    if (isPaused) {
        animatedBackground.classList.remove('paused');
        animationToggle.classList.remove('paused');
        toggleIcon.classList.remove('fa-pause');
        toggleIcon.classList.add('fa-play');
        localStorage.setItem('animationsEnabled', 'true');
        startAnimation();
    } else {
        animatedBackground.classList.add('paused');
        animationToggle.classList.add('paused');
        toggleIcon.classList.remove('fa-play');
        toggleIcon.classList.add('fa-pause');
        localStorage.setItem('animationsEnabled', 'false');
        stopAnimation();
    }
});

// ===== THEME COLOR PICKER =====
const themeToggle = document.getElementById('themeToggle');
const themePanel = document.getElementById('themePanel');
const themePanelClose = document.getElementById('themePanelClose');
const colorPresets = document.querySelectorAll('.color-preset');
const hueSlider = document.getElementById('hueSlider');
const huePreview = document.getElementById('huePreview');
const resetThemeBtn = document.getElementById('resetTheme');

// Default hue (purple = 270)
const DEFAULT_HUE = 270;

// Convert HSL to hex for CSS variables
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Apply theme color based on hue
function applyThemeHue(hue) {
    const root = document.documentElement;

    // Generate colors from hue
    const primary = hslToHex(hue, 80, 65);
    const primaryDark = hslToHex(hue, 75, 55);
    const primaryLight = hslToHex(hue, 85, 75);
    const secondary = hslToHex(hue - 20, 75, 58);

    // Set CSS variables
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-dark', primaryDark);
    root.style.setProperty('--color-primary-light', primaryLight);
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-accent', primary);
    root.style.setProperty('--color-success', primary);

    // Update gradients
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`);
    root.style.setProperty('--gradient-secondary', `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 100%)`);
    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${primaryDark} 0%, ${primary} 100%)`);

    // Update shadow glow
    root.style.setProperty('--shadow-glow', `0 0 20px ${primary}66`);

    // Update constellation colors
    const rgbPrimary = hexToRgb(primary);
    const rgbLight = hexToRgb(primaryLight);
    if (rgbPrimary && rgbLight) {
        config.primaryColor = `rgba(${rgbPrimary.r}, ${rgbPrimary.g}, ${rgbPrimary.b}, `;
        config.secondaryColor = `rgba(${rgbLight.r}, ${rgbLight.g}, ${rgbLight.b}, `;
    }

    // Update hue preview
    if (huePreview) {
        huePreview.style.background = primary;
        huePreview.style.boxShadow = `0 0 15px ${primary}`;
    }

    // Save to localStorage
    localStorage.setItem('themeHue', hue);
}

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Toggle theme panel
themeToggle.addEventListener('click', () => {
    themePanel.classList.toggle('open');
});

// Close panel
themePanelClose.addEventListener('click', () => {
    themePanel.classList.remove('open');
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && !themeToggle.contains(e.target)) {
        themePanel.classList.remove('open');
    }
});

// Color preset buttons
colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        const hue = parseInt(preset.dataset.hue);

        // Update active state
        colorPresets.forEach(p => p.classList.remove('active'));
        preset.classList.add('active');

        // Update slider
        hueSlider.value = hue;

        // Apply theme
        applyThemeHue(hue);
    });
});

// Hue slider
hueSlider.addEventListener('input', (e) => {
    const hue = parseInt(e.target.value);

    // Remove active state from presets
    colorPresets.forEach(p => p.classList.remove('active'));

    // Check if slider matches a preset
    colorPresets.forEach(preset => {
        if (parseInt(preset.dataset.hue) === hue) {
            preset.classList.add('active');
        }
    });

    applyThemeHue(hue);
});

// Reset to default
resetThemeBtn.addEventListener('click', () => {
    // Reset slider
    hueSlider.value = DEFAULT_HUE;

    // Reset preset active state
    colorPresets.forEach(p => {
        p.classList.remove('active');
        if (parseInt(p.dataset.hue) === DEFAULT_HUE) {
            p.classList.add('active');
        }
    });

    // Apply default theme
    applyThemeHue(DEFAULT_HUE);
});

// Load saved theme on page load
const savedHue = localStorage.getItem('themeHue');
if (savedHue) {
    const hue = parseInt(savedHue);
    hueSlider.value = hue;

    // Update preset active state
    colorPresets.forEach(p => {
        p.classList.remove('active');
        if (parseInt(p.dataset.hue) === hue) {
            p.classList.add('active');
        }
    });

    applyThemeHue(hue);
}

// ===== STICKY NAVIGATION =====
const siteNav = document.getElementById('siteNav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navLinkElements = document.querySelectorAll('.nav-link');

// Hamburger toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
navLinkElements.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// Scroll Progress Bar
const scrollProgress = document.getElementById('scrollProgress');

// Sections for active nav tracking
const sections = document.querySelectorAll('.hero, .about-section, .project-section');

window.addEventListener('scroll', () => {
    // Sticky nav background
    if (window.scrollY > 50) {
        siteNav.classList.add('scrolled');
    } else {
        siteNav.classList.remove('scrolled');
    }

    // Scroll progress bar
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = scrollPercentage + '%';

    // Active nav link
    let current = 'home';
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY - 100;
        if (scrollTop >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinkElements.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
            link.classList.add('active');
        }
    });

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (scrollTop > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

// Back to top button click
document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== GITHUB COMMITS =====
const GITHUB_API_URL = 'https://api.github.com/repos/Jordan721/Development-Showcase/commits';
const COMMITS_LIMIT = 5;

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

// Create commit card HTML
function createCommitCard(commit) {
    const {
        sha,
        commit: commitData,
        author,
        html_url
    } = commit;
    const shortSha = sha.substring(0, 7);
    const message = commitData.message.split('\n')[0]; // First line only
    const authorName = commitData.author.name;
    const authorAvatar = (author && author.avatar_url) || 'https://github.com/identicons/default.png';
    const date = commitData.author.date;
    const relativeTime = formatRelativeTime(date);

    return `
        <div class="commit-card">
            <div class="commit-header">
                <img src="${authorAvatar}" alt="${authorName}" class="commit-avatar">
                <div class="commit-meta">
                    <div class="commit-author">
                        <strong>${authorName}</strong>
                        <a href="${html_url}" target="_blank" class="commit-sha" title="View commit on GitHub">
                            <i class="fab fa-github"></i>
                            ${shortSha}
                        </a>
                    </div>
                    <div class="commit-date">
                        <i class="fas fa-clock"></i>
                        ${relativeTime}
                    </div>
                </div>
            </div>
            <div class="commit-message">${message}</div>
        </div>
    `;
}

// Fetch and display commits
async function fetchCommits() {
    const commitsList = document.getElementById('commitsList');
    const refreshBtn = document.getElementById('refreshCommits');

    try {
        // Show loading state
        commitsList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading commits...</p>
            </div>
        `;

        // Add spinning class to refresh button
        refreshBtn.classList.add('spinning');

        const response = await fetch(`${GITHUB_API_URL}?per_page=${COMMITS_LIMIT}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const commits = await response.json();

        // Clear loading state
        commitsList.innerHTML = '';

        // Create commit cards
        commits.forEach(commit => {
            commitsList.innerHTML += createCommitCard(commit);
        });

    } catch (error) {
        console.error('Error fetching commits:', error);
        commitsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load commits. Please try again later.</p>
            </div>
        `;
    } finally {
        // Remove spinning class after a short delay
        setTimeout(() => {
            refreshBtn.classList.remove('spinning');
        }, 500);
    }
}

// Refresh button click handler
document.getElementById('refreshCommits').addEventListener('click', fetchCommits);

// Load commits on page load
window.addEventListener('load', fetchCommits);

// ===== TECH FILTER =====
(function initTechFilter() {
    const filterChips = document.getElementById('filterChips');
    const filterClear = document.getElementById('filterClear');
    if (!filterChips) return;

    // Gather all unique techs from project cards
    const allCards = document.querySelectorAll('.project-card');
    const techSet = new Set();
    allCards.forEach(card => {
        card.querySelectorAll('.card-tech span').forEach(span => {
            techSet.add(span.textContent.trim());
        });
    });

    // Sort and create chips
    [...techSet].sort().forEach(tech => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.dataset.tech = tech;
        btn.textContent = tech;
        filterChips.appendChild(btn);
    });

    // Filter logic
    function applyFilter(tech) {
        const isAll = tech === 'all';

        // Update chip active states
        filterChips.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.tech === tech);
        });

        // Show/hide clear button
        filterClear.classList.toggle('hidden', isAll);

        // Filter cards
        allCards.forEach(card => {
            if (isAll) {
                card.classList.remove('filter-hidden');
                return;
            }
            const cardTechs = [...card.querySelectorAll('.card-tech span')].map(s => s.textContent.trim());
            card.classList.toggle('filter-hidden', !cardTechs.includes(tech));
        });

        // Hide sections that have no visible cards
        document.querySelectorAll('.project-section').forEach(section => {
            const grid = section.querySelector('.card-grid');
            if (!grid) return;
            const visibleCards = grid.querySelectorAll('.project-card:not(.filter-hidden)');
            section.classList.toggle('filter-empty', visibleCards.length === 0);

            // Update count badge
            const countBadge = section.querySelector('.section-count');
            if (countBadge) {
                const totalCards = grid.querySelectorAll('.project-card').length;
                if (isAll) {
                    countBadge.textContent = totalCards;
                } else {
                    countBadge.textContent = visibleCards.length + '/' + totalCards;
                }
            }
        });
    }

    // Chip click handler
    filterChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        applyFilter(chip.dataset.tech);
    });

    // Clear button
    filterClear.addEventListener('click', () => {
        applyFilter('all');
    });
})();
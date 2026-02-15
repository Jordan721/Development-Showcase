// The Unfair Game - Landing Page

document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initTrustMeter();
    initScrollAnimations();
});

// Hero Canvas - 3D maze wireframe animation
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;
    let lines = [];

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        generateMaze();
    }

    function generateMaze() {
        const rect = canvas.getBoundingClientRect();
        lines = [];
        const cellSize = 60;
        const cols = Math.ceil(rect.width / cellSize) + 2;
        const rows = Math.ceil(rect.height / cellSize) + 2;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (Math.random() > 0.4) {
                    lines.push({
                        x1: x * cellSize,
                        y1: y * cellSize,
                        x2: (x + 1) * cellSize,
                        y2: y * cellSize,
                        opacity: Math.random() * 0.3 + 0.05,
                        speed: Math.random() * 0.002 + 0.001,
                        offset: Math.random() * Math.PI * 2
                    });
                }
                if (Math.random() > 0.4) {
                    lines.push({
                        x1: x * cellSize,
                        y1: y * cellSize,
                        x2: x * cellSize,
                        y2: (y + 1) * cellSize,
                        opacity: Math.random() * 0.3 + 0.05,
                        speed: Math.random() * 0.002 + 0.001,
                        offset: Math.random() * Math.PI * 2
                    });
                }
            }
        }
    }

    let dangerZones = [];
    for (let i = 0; i < 5; i++) {
        dangerZones.push({
            x: Math.random(),
            y: Math.random(),
            radius: Math.random() * 80 + 40,
            speed: Math.random() * 0.003 + 0.001,
            offset: Math.random() * Math.PI * 2
        });
    }

    function animate() {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);

        time++;

        // Draw maze lines
        lines.forEach(line => {
            const flicker = Math.sin(time * line.speed + line.offset);
            const alpha = line.opacity * (0.5 + flicker * 0.5);

            ctx.strokeStyle = `rgba(233, 69, 96, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        });

        // Draw invisible danger zones (pulsing)
        dangerZones.forEach(zone => {
            const pulse = Math.sin(time * 0.02 + zone.offset) * 0.5 + 0.5;
            const x = zone.x * w;
            const y = zone.y * h + Math.sin(time * zone.speed) * 20;
            const r = zone.radius * (0.8 + pulse * 0.4);

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, `rgba(233, 69, 96, ${0.08 * pulse})`);
            gradient.addColorStop(1, 'rgba(233, 69, 96, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Occasional glitch flash
        if (Math.random() < 0.003) {
            ctx.fillStyle = `rgba(233, 69, 96, ${Math.random() * 0.06})`;
            ctx.fillRect(0, Math.random() * h, w, Math.random() * 30 + 5);
        }

        requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);
}

// Trust Meter - animates and randomly changes
function initTrustMeter() {
    const fill = document.getElementById('trustFill');
    const value = document.getElementById('trustValue');
    if (!fill || !value) return;

    let trust = 0;
    let target = Math.random() * 15;

    function update() {
        trust += (target - trust) * 0.05;
        fill.style.width = trust + '%';
        value.textContent = Math.floor(trust) + '%';

        // Randomly change target (it never goes above ~20%)
        if (Math.random() < 0.02) {
            target = Math.random() * 20;
        }

        // Sometimes crash to 0
        if (Math.random() < 0.005) {
            target = 0;
        }

        requestAnimationFrame(update);
    }

    // Start when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                update();
                observer.disconnect();
            }
        });
    });
    observer.observe(fill);
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.warning-card, .deception-item, .info-card, .rule-item').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.textContent = `
        .warning-card.visible,
        .deception-item.visible,
        .info-card.visible,
        .rule-item.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
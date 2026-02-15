// THW - Landing Page

document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initDeathTicker();
    initScrollAnimations();
});

// Hero Canvas - Pixel art hallway animation
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let enemies = [];
    let time = 0;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }

    // Floating pixel particles
    class Particle {
        constructor(w, h) {
            this.reset(w, h);
        }
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.floor(Math.random() * 4 + 2);
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.life = Math.random() * 200 + 100;
            this.maxLife = this.life;
            const colors = ['#4ade80', '#e94560', '#00d4ff', '#fbbf24', '#a855f7'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update(w, h) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;
            if (this.life <= 0 || this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
                this.reset(w, h);
            }
        }
        draw(ctx) {
            const alpha = Math.min(1, this.life / this.maxLife * 2);
            ctx.globalAlpha = alpha * 0.6;
            ctx.fillStyle = this.color;
            ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
            ctx.globalAlpha = 1;
        }
    }

    // Floating enemy sprites
    class FloatingEnemy {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.floor(Math.random() * 8 + 6);
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = Math.sin(Math.random() * Math.PI * 2) * 0.2;
            this.offset = Math.random() * Math.PI * 2;
            this.type = Math.random() > 0.5 ? 'skull' : 'eye';
        }
        update(w, h, t) {
            this.x += this.speedX;
            this.y += Math.sin(t * 0.02 + this.offset) * 0.3;
            if (this.x < -20) this.x = w + 20;
            if (this.x > w + 20) this.x = -20;
        }
        draw(ctx) {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#e94560';
            const s = this.size;
            // Simple pixel skull
            ctx.fillRect(Math.floor(this.x), Math.floor(this.y), s, s);
            ctx.fillRect(Math.floor(this.x - s * 0.5), Math.floor(this.y + s * 0.3), s * 2, s * 0.6);
            ctx.globalAlpha = 1;
        }
    }

    function init() {
        const rect = canvas.getBoundingClientRect();
        particles = [];
        enemies = [];
        for (let i = 0; i < 60; i++) {
            particles.push(new Particle(rect.width, rect.height));
        }
        for (let i = 0; i < 8; i++) {
            enemies.push(new FloatingEnemy(rect.width, rect.height));
        }
    }

    function animate() {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        ctx.fillStyle = 'rgba(15, 15, 26, 0.15)';
        ctx.fillRect(0, 0, w, h);

        time++;

        // Draw grid
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.03)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Update and draw enemies
        enemies.forEach(e => {
            e.update(w, h, time);
            e.draw(ctx);
        });

        // Update and draw particles
        particles.forEach(p => {
            p.update(w, h);
            p.draw(ctx);
        });

        // Occasional screen flash effect
        if (Math.random() < 0.002) {
            ctx.fillStyle = 'rgba(233, 69, 96, 0.05)';
            ctx.fillRect(0, 0, w, h);
        }

        requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();
    window.addEventListener('resize', () => {
        resize();
        init();
    });
}

// Death counter ticker animation
function initDeathTicker() {
    const ticker = document.getElementById('deathTicker');
    if (!ticker) return;

    const target = Math.floor(Math.random() * 50000 + 100000);
    let current = 0;
    const duration = 2000;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.floor(eased * target);
        ticker.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
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
    observer.observe(ticker);
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

    document.querySelectorAll('.feature-card, .chaos-card, .info-card, .tip-item').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.textContent = `
        .feature-card.visible,
        .chaos-card.visible,
        .info-card.visible,
        .tip-item.visible {
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
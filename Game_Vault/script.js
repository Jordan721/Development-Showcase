// ========================================
// Sound Effects System
// ========================================

class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    }

    play(type) {
        if (!this.enabled) return;

        // Initialize on first interaction
        if (!this.initialized) {
            this.init();
        }

        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        switch (type) {
            case 'hover':
                // Short blip sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'click':
                // Satisfying click
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'success':
                // Ascending arpeggio
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, now); // C5
                oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
                oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
                gainNode.gain.setValueAtTime(0.12, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;

            case 'toggle':
                // Toggle switch sound
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(this.enabled ? 880 : 440, now);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'download':
                // Download whoosh
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        this.play('toggle');
        return this.enabled;
    }
}

const sfx = new SoundEffects();

// Sound Toggle Button
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');

if (soundToggle) {
    // Set initial state
    if (!sfx.enabled) {
        soundToggle.classList.add('muted');
        soundIcon.className = 'fas fa-volume-mute';
    }

    soundToggle.addEventListener('click', () => {
        const enabled = sfx.toggle();
        soundToggle.classList.toggle('muted', !enabled);
        soundIcon.className = enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    });
}

// Add sound effects to interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Game cards hover
    document.querySelectorAll('.game-card:not(.empty-slot)').forEach(card => {
        card.addEventListener('mouseenter', () => sfx.play('hover'));
        card.addEventListener('click', () => sfx.play('click'));
    });

    // Download cards
    document.querySelectorAll('.download-card').forEach(card => {
        card.addEventListener('mouseenter', () => sfx.play('hover'));
        card.addEventListener('click', () => sfx.play('download'));
    });

    // Buttons
    document.querySelectorAll('button, .back-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => sfx.play('hover'));
        btn.addEventListener('click', () => sfx.play('click'));
    });

    // Stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', () => sfx.play('hover'));
    });
});

// ========================================
// Background Canvas Animation
// ========================================

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Track mouse position
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Particle class
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = ['#e94560', '#00d4ff', '#a855f7', '#4ade80'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                this.x -= dx * force * 0.02;
                this.y -= dy * force * 0.02;
            }
        }

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

initParticles();
window.addEventListener('resize', initParticles);

// Draw connections between nearby particles
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(233, 69, 96, ${0.1 * (1 - distance / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    drawConnections();
    requestAnimationFrame(animate);
}

animate();

// ========================================
// Typing Animation
// ========================================

const phrases = [
    "Where games come to life...",
    "Built with code and passion",
    "Challenge yourself...",
    "Can you beat them all?",
    "More games coming soon..."
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

const typingElement = document.querySelector('.typing-text');

function typeText() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before next phrase
    }

    setTimeout(typeText, typingSpeed);
}

typeText();

// ========================================
// Number Counter Animation
// ========================================

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.getAttribute('data-count'));
                const duration = 2000;
                const start = 0;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = Math.floor(start + (count - start) * easeOutQuart);

                    target.textContent = current.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

animateCounters();

// ========================================
// Konami Code Easter Egg
// ========================================

const konamiCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;

        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    sfx.play('success');

    // Unlock konami achievement
    if (typeof unlockAchievement === 'function') {
        unlockAchievement('konami');
    }

    const overlay = document.getElementById('easterEgg');
    overlay.classList.add('active');

    // Add some extra flair
    document.body.style.animation = 'none';
    setTimeout(() => {
        document.body.style.animation = 'rainbowBg 2s linear infinite';
    }, 10);

    // Create confetti
    createConfetti();
}

function closeEasterEgg() {
    const overlay = document.getElementById('easterEgg');
    overlay.classList.remove('active');
    document.body.style.animation = 'none';
}

// Make closeEasterEgg available globally
window.closeEasterEgg = closeEasterEgg;

// Confetti effect
function createConfetti() {
    const colors = ['#e94560', '#00d4ff', '#a855f7', '#4ade80', '#facc15'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            z-index: 3000;
            pointer-events: none;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

// Add confetti animation to page
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    @keyframes rainbowBg {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(confettiStyle);

// ========================================
// Game Card Hover Sound Effect (Visual)
// ========================================

const gameCards = document.querySelectorAll('.game-card:not(.coming-soon):not(.empty-slot)');

gameCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        // Create a visual "click" indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            animation: ripple 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 100;
        `;
        card.style.position = 'relative';
        card.appendChild(indicator);

        setTimeout(() => indicator.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ========================================
// Smooth Scroll
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// ========================================
// Parallax Effect on Scroll
// ========================================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const titleSection = document.querySelector('.title-section');

    if (titleSection) {
        titleSection.style.transform = `translateY(${scrolled * 0.3}px)`;
        titleSection.style.opacity = 1 - (scrolled / 700);
    }
});

// ========================================
// Random Origin Quote
// ========================================

const originQuotes = [
    {
        text: "Every expert was once a beginner.",
        author: "Helen Hayes"
    },
    {
        text: "The secret of getting ahead is getting started.",
        author: "Mark Twain"
    },
    {
        text: "Small steps lead to big changes.",
        author: "Unknown"
    },
    {
        text: "You don't have to be great to start, but you have to start to be great.",
        author: "Zig Ziglar"
    },
    {
        text: "The journey of a thousand miles begins with a single step.",
        author: "Lao Tzu"
    },
    {
        text: "Great things are not done by impulse, but by a series of small things brought together.",
        author: "Vincent Van Gogh"
    },
    {
        text: "What you do today can improve all your tomorrows.",
        author: "Ralph Marston"
    },
    {
        text: "From small beginnings come great things.",
        author: "Proverb"
    }
];

function displayRandomQuote() {
    const quoteElement = document.getElementById('origin-quote');
    const authorElement = document.getElementById('quote-author');

    if (quoteElement && authorElement) {
        const randomQuote = originQuotes[Math.floor(Math.random() * originQuotes.length)];
        quoteElement.textContent = `"${randomQuote.text}"`;
        authorElement.textContent = `— ${randomQuote.author}`;
    }
}

displayRandomQuote();

// ========================================
// Cursor Trail Effect
// ========================================

const cursorCanvas = document.getElementById('cursorTrail');
const cursorCtx = cursorCanvas ? cursorCanvas.getContext('2d') : null;

if (cursorCanvas && cursorCtx) {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        cursorCanvas.width = window.innerWidth;
        cursorCanvas.height = window.innerHeight;
    });

    const trail = [];
    const maxTrailLength = 20;

    document.addEventListener('mousemove', (e) => {
        trail.push({
            x: e.clientX,
            y: e.clientY,
            alpha: 1
        });

        if (trail.length > maxTrailLength) {
            trail.shift();
        }
    });

    function animateCursorTrail() {
        cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

        for (let i = 0; i < trail.length; i++) {
            const point = trail[i];
            const size = (i / trail.length) * 8;
            const alpha = (i / trail.length) * 0.6;

            cursorCtx.beginPath();
            cursorCtx.arc(point.x, point.y, size, 0, Math.PI * 2);
            cursorCtx.fillStyle = `rgba(233, 69, 96, ${alpha})`;
            cursorCtx.fill();

            // Add glow
            cursorCtx.beginPath();
            cursorCtx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
            cursorCtx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.3})`;
            cursorCtx.fill();
        }

        requestAnimationFrame(animateCursorTrail);
    }

    animateCursorTrail();
}

// ========================================
// Achievement System
// ========================================

const achievements = {
    'first-visit': { name: 'Welcome!', unlocked: true },
    'konami': { name: 'Code Master', unlocked: false },
    'snake-10': { name: 'Hungry Snake', unlocked: false },
    'snake-25': { name: 'Snake Charmer', unlocked: false },
    'terminal': { name: 'Hacker', unlocked: false },
    'explorer': { name: 'Explorer', unlocked: false }
};

// Load achievements from localStorage
function loadAchievements() {
    const saved = localStorage.getItem('gameVaultAchievements');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => {
            if (achievements[key]) {
                achievements[key].unlocked = parsed[key].unlocked;
            }
        });
    }
    updateAchievementUI();
}

function saveAchievements() {
    localStorage.setItem('gameVaultAchievements', JSON.stringify(achievements));
}

function unlockAchievement(id) {
    if (achievements[id] && !achievements[id].unlocked) {
        achievements[id].unlocked = true;
        saveAchievements();
        updateAchievementUI(id);
        showAchievementToast(id);
        sfx.play('success');
    }
}

function updateAchievementUI(justUnlocked = null) {
    Object.keys(achievements).forEach(id => {
        const card = document.querySelector(`[data-achievement="${id}"]`);
        if (card) {
            if (achievements[id].unlocked) {
                card.classList.add('unlocked');
                card.querySelector('.achievement-status i').className = 'fas fa-check-circle';
            }
            if (id === justUnlocked) {
                card.classList.add('just-unlocked');
                setTimeout(() => card.classList.remove('just-unlocked'), 600);
            }
        }
    });
}

function showAchievementToast(id) {
    const achievement = achievements[id];
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <i class="fas fa-trophy"></i>
        <div class="toast-content">
            <span class="toast-title">Achievement Unlocked!</span>
            <span class="toast-desc">${achievement.name}</span>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

loadAchievements();

// Track download clicks for explorer achievement
document.querySelectorAll('.download-card').forEach(card => {
    card.addEventListener('click', () => unlockAchievement('explorer'));
});

// ========================================
// Snake Game
// ========================================

const snakeGameOverlay = document.getElementById('snakeGameOverlay');
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeCtx = snakeCanvas ? snakeCanvas.getContext('2d') : null;
const snakeOverlay = document.getElementById('snakeOverlay');
const snakeScoreEl = document.getElementById('snakeScore');
const snakeHighEl = document.getElementById('snakeHigh');

function openSnakeGame() {
    if (snakeGameOverlay) {
        snakeGameOverlay.classList.add('active');
        sfx.play('click');
    }
}

function closeSnakeGame() {
    if (snakeGameOverlay) {
        snakeGameOverlay.classList.remove('active');
        // Stop the game if running
        if (gameLoop) {
            clearInterval(gameLoop);
            gameRunning = false;
        }
    }
}

window.closeSnakeGame = closeSnakeGame;
window.openSnakeGame = openSnakeGame;

let gameRunning = false;
let gameLoop = null;

if (snakeCanvas && snakeCtx) {
    const gridSize = 15;
    const tileCount = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;

    snakeHighEl.textContent = highScore;

    function startGame() {
        snake = [{ x: 10, y: 10 }];
        dx = 1;
        dy = 0;
        score = 0;
        snakeScoreEl.textContent = score;
        placeFood();
        gameRunning = true;
        snakeOverlay.classList.add('hidden');
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, 100);
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        // Don't place on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                placeFood();
                return;
            }
        }
    }

    function gameStep() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // Self collision
        for (let segment of snake) {
            if (segment.x === head.x && segment.y === head.y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score++;
            snakeScoreEl.textContent = score;
            sfx.play('hover');
            placeFood();

            // Check achievements
            if (score >= 10) unlockAchievement('snake-10');
            if (score >= 25) unlockAchievement('snake-25');
        } else {
            snake.pop();
        }

        draw();
    }

    function draw() {
        // Clear
        snakeCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

        // Draw grid
        snakeCtx.strokeStyle = 'rgba(74, 222, 128, 0.1)';
        for (let i = 0; i <= tileCount; i++) {
            snakeCtx.beginPath();
            snakeCtx.moveTo(i * gridSize, 0);
            snakeCtx.lineTo(i * gridSize, snakeCanvas.height);
            snakeCtx.stroke();
            snakeCtx.beginPath();
            snakeCtx.moveTo(0, i * gridSize);
            snakeCtx.lineTo(snakeCanvas.width, i * gridSize);
            snakeCtx.stroke();
        }

        // Draw snake
        snake.forEach((segment, index) => {
            const alpha = 1 - (index / snake.length) * 0.5;
            snakeCtx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
            snakeCtx.fillRect(
                segment.x * gridSize + 1,
                segment.y * gridSize + 1,
                gridSize - 2,
                gridSize - 2
            );
        });

        // Draw food
        snakeCtx.fillStyle = '#e94560';
        snakeCtx.beginPath();
        snakeCtx.arc(
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        snakeCtx.fill();

        // Food glow
        snakeCtx.shadowColor = '#e94560';
        snakeCtx.shadowBlur = 10;
        snakeCtx.fill();
        snakeCtx.shadowBlur = 0;
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        sfx.play('click');

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            snakeHighEl.textContent = highScore;
        }

        snakeOverlay.innerHTML = `
            <i class="fas fa-redo"></i>
            <span>GAME OVER</span>
            <span style="font-size: 0.7rem; margin-top: 0.5rem;">Score: ${score}</span>
        `;
        snakeOverlay.classList.remove('hidden');
    }

    // Controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (dy !== 1) { dx = 0; dy = -1; }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (dy !== -1) { dx = 0; dy = 1; }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (dx !== 1) { dx = -1; dy = 0; }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (dx !== -1) { dx = 1; dy = 0; }
                break;
        }
    });

    snakeOverlay.addEventListener('click', startGame);

    // Initial draw
    draw();
}

// ========================================
// Interactive Terminal
// ========================================

const terminalOverlay = document.getElementById('terminalOverlay');
const terminalOutput = document.getElementById('terminalOutput');
const terminalInput = document.getElementById('terminalInput');

const terminalCommands = {
    help: () => `Available commands:
  help     - Show this help message
  about    - About the Game Vault
  games    - List available games
  stats    - Show dev stats
  snake    - Play Snake!
  secret   - ???
  clear    - Clear terminal
  exit     - Close terminal`,
    about: () => `GAME VAULT v1.0
Created by Jordan Alexis
A collection of games built with passion.
From humble FPS Creator beginnings to modern web games.`,
    games: () => `[01] The Unfair Game - PLAYABLE
[02] THW - IN DEVELOPMENT
[03] Snake - Type 'snake' to play!`,
    stats: () => `Games Created: 2
Lines of Code: 5000+
Energy Drinks: 99
Bugs Squashed: 404`,
    secret: () => {
        unlockAchievement('terminal');
        return `
 ██████╗  █████╗ ███╗   ███╗███████╗██████╗
██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔══██╗
██║  ███╗███████║██╔████╔██║█████╗  ██████╔╝
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ██╔══██╗
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝

Achievement Unlocked: Hacker!`;
    },
    clear: () => {
        terminalOutput.innerHTML = '';
        return null;
    },
    exit: () => {
        closeTerminal();
        return 'Goodbye!';
    },
    snake: () => {
        closeTerminal();
        openSnakeGame();
        return 'Launching Snake...';
    },
    konami: () => `The code is: ↑↑↓↓←→←→BA`,
    matrix: () => `Wake up, Neo...`,
    hello: () => `Hello, World!`,
    sudo: () => `Nice try. Permission denied.`,
    ls: () => `games/  assets/  scripts/  styles/  index.html`
};

function addTerminalLine(text, className = '') {
    const line = document.createElement('p');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
}

function processCommand(cmd) {
    const trimmed = cmd.trim().toLowerCase();
    addTerminalLine(`guest@vault:~$ ${cmd}`);

    if (!trimmed) return;

    if (terminalCommands[trimmed]) {
        const result = terminalCommands[trimmed]();
        if (result) {
            result.split('\n').forEach(line => addTerminalLine(line, 'system'));
        }
    } else {
        addTerminalLine(`Command not found: ${trimmed}. Type 'help' for available commands.`, 'error');
    }
}

if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            processCommand(terminalInput.value);
            terminalInput.value = '';
        }
    });
}

function openTerminal() {
    terminalOverlay.classList.add('active');
    terminalInput.focus();
    unlockAchievement('terminal');
}

function closeTerminal() {
    terminalOverlay.classList.remove('active');
}

window.closeTerminal = closeTerminal;

// Open terminal with ~ key
document.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        if (terminalOverlay.classList.contains('active')) {
            closeTerminal();
        } else {
            openTerminal();
        }
    }
    // Close with Escape
    if (e.key === 'Escape') {
        if (terminalOverlay.classList.contains('active')) {
            closeTerminal();
        }
        if (snakeGameOverlay && snakeGameOverlay.classList.contains('active')) {
            closeSnakeGame();
        }
    }
});

// ========================================
// Initialize
// ========================================

console.log('%c🎮 GAME VAULT LOADED', 'color: #e94560; font-size: 20px; font-weight: bold;');
console.log('%cTry the Konami Code: ↑↑↓↓←→←→BA', 'color: #00d4ff; font-size: 12px;');
console.log('%cPress ~ to open the secret terminal', 'color: #a855f7; font-size: 12px;');

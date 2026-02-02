// Game Making - Interactive Script

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Game Loop Demo
const phaseInput = document.getElementById('phaseInput');
const phaseUpdate = document.getElementById('phaseUpdate');
const phaseRender = document.getElementById('phaseRender');
const startLoopBtn = document.getElementById('startLoop');
const stopLoopBtn = document.getElementById('stopLoop');
const fpsCount = document.getElementById('fpsCount');

let gameLoopInterval = null;
let currentPhase = 0;
const phases = [phaseInput, phaseUpdate, phaseRender];
let frameCount = 0;
let lastFpsUpdate = Date.now();

function runGameLoop() {
    phases.forEach(p => p.classList.remove('active'));
    phases[currentPhase].classList.add('active');
    currentPhase = (currentPhase + 1) % 3;

    frameCount++;
    const now = Date.now();
    if (now - lastFpsUpdate >= 1000) {
        fpsCount.textContent = frameCount;
        frameCount = 0;
        lastFpsUpdate = now;
    }
}

startLoopBtn.addEventListener('click', () => {
    if (!gameLoopInterval) {
        gameLoopInterval = setInterval(runGameLoop, 200);
        startLoopBtn.style.opacity = '0.5';
    }
});

stopLoopBtn.addEventListener('click', () => {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
        phases.forEach(p => p.classList.remove('active'));
        startLoopBtn.style.opacity = '1';
        fpsCount.textContent = '0';
    }
});

// Collision Detection Demo
const collisionDemo = document.getElementById('collisionDemo');
const collisionBox = document.getElementById('collisionBox');
const collisionTarget = document.getElementById('collisionTarget');
const collisionStatus = document.getElementById('collisionStatus');

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

collisionBox.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = collisionBox.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    collisionBox.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const demoRect = collisionDemo.getBoundingClientRect();
    let newX = e.clientX - demoRect.left - dragOffsetX;
    let newY = e.clientY - demoRect.top - dragOffsetY;

    newX = Math.max(0, Math.min(newX, demoRect.width - collisionBox.offsetWidth));
    newY = Math.max(0, Math.min(newY, demoRect.height - collisionBox.offsetHeight - 40));

    collisionBox.style.left = newX + 'px';
    collisionBox.style.top = newY + 'px';

    checkCollision();
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    collisionBox.style.cursor = 'grab';
});

function checkCollision() {
    const boxRect = collisionBox.getBoundingClientRect();
    const targetRect = collisionTarget.getBoundingClientRect();

    const isColliding = !(
        boxRect.right < targetRect.left ||
        boxRect.left > targetRect.right ||
        boxRect.bottom < targetRect.top ||
        boxRect.top > targetRect.bottom
    );

    if (isColliding) {
        collisionBox.classList.add('colliding');
        collisionTarget.classList.add('hit');
        collisionStatus.classList.add('hit');
        collisionStatus.innerHTML = '<i class="fas fa-check-circle"></i> Collision!';
    } else {
        collisionBox.classList.remove('colliding');
        collisionTarget.classList.remove('hit');
        collisionStatus.classList.remove('hit');
        collisionStatus.innerHTML = '<i class="fas fa-times-circle"></i> No Collision';
    }
}

// Touch support for collision demo
collisionBox.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    const rect = collisionBox.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const demoRect = collisionDemo.getBoundingClientRect();
    let newX = touch.clientX - demoRect.left - dragOffsetX;
    let newY = touch.clientY - demoRect.top - dragOffsetY;

    newX = Math.max(0, Math.min(newX, demoRect.width - collisionBox.offsetWidth));
    newY = Math.max(0, Math.min(newY, demoRect.height - collisionBox.offsetHeight - 40));

    collisionBox.style.left = newX + 'px';
    collisionBox.style.top = newY + 'px';

    checkCollision();
});

document.addEventListener('touchend', () => {
    isDragging = false;
});

// Sprite Animation Demo
const spriteCharacter = document.getElementById('spriteCharacter');
const playSpriteBtn = document.getElementById('playSprite');
const stopSpriteBtn = document.getElementById('stopSprite');
const spriteSpeed = document.getElementById('spriteSpeed');
const spriteFrames = document.querySelectorAll('.sprite-frame');

let spriteInterval = null;
let currentFrame = 0;
const frameClasses = ['', 'frame-1', 'frame-2', 'frame-3'];

function animateSprite() {
    spriteFrames.forEach(f => f.classList.remove('active'));
    spriteFrames[currentFrame].classList.add('active');

    spriteCharacter.className = 'sprite-character';
    if (frameClasses[currentFrame]) {
        spriteCharacter.classList.add(frameClasses[currentFrame]);
    }

    currentFrame = (currentFrame + 1) % 4;
}

playSpriteBtn.addEventListener('click', () => {
    if (spriteInterval) clearInterval(spriteInterval);
    spriteInterval = setInterval(animateSprite, 600 - parseInt(spriteSpeed.value));
});

stopSpriteBtn.addEventListener('click', () => {
    if (spriteInterval) {
        clearInterval(spriteInterval);
        spriteInterval = null;
    }
    spriteFrames.forEach(f => f.classList.remove('active'));
    spriteCharacter.className = 'sprite-character';
    currentFrame = 0;
});

spriteSpeed.addEventListener('input', () => {
    if (spriteInterval) {
        clearInterval(spriteInterval);
        spriteInterval = setInterval(animateSprite, 600 - parseInt(spriteSpeed.value));
    }
});

// Mini Game
const gameArea = document.getElementById('gameArea');
const gamePlayer = document.getElementById('gamePlayer');
const gameInstructions = document.getElementById('gameInstructions');
const startGameBtn = document.getElementById('startGameBtn');
const restartBtn = document.getElementById('restartBtn');
const gameResult = document.getElementById('gameResult');
const gameScoreEl = document.getElementById('gameScore');
const gameTimeEl = document.getElementById('gameTime');
const finalScoreEl = document.getElementById('finalScore');

let gameActive = false;
let gameScore = 0;
let gameTime = 30;
let gameInterval = null;
let timerInterval = null;
let playerX = 285;
let playerY = 220;
const playerSpeed = 8;
const keys = { left: false, right: false, up: false, down: false };
let coins = [];

function startGame() {
    gameActive = true;
    gameScore = 0;
    gameTime = 30;
    playerX = 285;
    playerY = 220;
    coins = [];

    gameScoreEl.textContent = '0';
    gameTimeEl.textContent = '30';
    gameInstructions.style.display = 'none';
    gameResult.classList.remove('show');

    for (let i = 0; i < 5; i++) {
        spawnCoin();
    }

    gameInterval = setInterval(gameLoop, 1000 / 60);
    timerInterval = setInterval(() => {
        gameTime--;
        gameTimeEl.textContent = gameTime;
        if (gameTime <= 0) {
            endGame();
        }
    }, 1000);
}

function spawnCoin() {
    const coin = document.createElement('div');
    coin.className = 'game-coin-mini';
    coin.style.cssText = `
        width: 15px;
        height: 15px;
        background: #FFD23F;
        border-radius: 50%;
        position: absolute;
        left: ${Math.random() * (gameArea.offsetWidth - 30) + 10}px;
        top: ${Math.random() * (gameArea.offsetHeight - 60) + 10}px;
        animation: coinFloat 1.5s ease-in-out infinite;
    `;
    gameArea.appendChild(coin);
    coins.push(coin);
}

function gameLoop() {
    if (!gameActive) return;

    if (keys.left) playerX -= playerSpeed;
    if (keys.right) playerX += playerSpeed;
    if (keys.up) playerY -= playerSpeed;
    if (keys.down) playerY += playerSpeed;

    playerX = Math.max(0, Math.min(playerX, gameArea.offsetWidth - 30));
    playerY = Math.max(0, Math.min(playerY, gameArea.offsetHeight - 30));

    gamePlayer.style.left = playerX + 'px';
    gamePlayer.style.bottom = 'auto';
    gamePlayer.style.top = playerY + 'px';
    gamePlayer.style.transform = 'none';

    coins.forEach((coin, index) => {
        const playerRect = gamePlayer.getBoundingClientRect();
        const coinRect = coin.getBoundingClientRect();

        const isCollecting = !(
            playerRect.right < coinRect.left ||
            playerRect.left > coinRect.right ||
            playerRect.bottom < coinRect.top ||
            playerRect.top > coinRect.bottom
        );

        if (isCollecting) {
            coin.remove();
            coins.splice(index, 1);
            gameScore++;
            gameScoreEl.textContent = gameScore;
            spawnCoin();
        }
    });
}

function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);

    coins.forEach(coin => coin.remove());
    coins = [];

    finalScoreEl.textContent = gameScore;
    gameResult.classList.add('show');
}

startGameBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    gameResult.classList.remove('show');
    gameInstructions.style.display = 'block';
    gamePlayer.style.bottom = '50px';
    gamePlayer.style.left = '50%';
    gamePlayer.style.top = 'auto';
    gamePlayer.style.transform = 'translateX(-50%)';
});

document.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right = true;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            keys.up = true;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            keys.down = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            keys.right = false;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            keys.down = false;
            break;
    }
});

// Hero animation
const heroPlayer = document.getElementById('heroPlayer');
let heroDirection = 1;
let heroX = 50;

setInterval(() => {
    heroX += heroDirection * 2;
    if (heroX > 100 || heroX < 50) heroDirection *= -1;
    if (heroPlayer) heroPlayer.style.left = heroX + 'px';
}, 100);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

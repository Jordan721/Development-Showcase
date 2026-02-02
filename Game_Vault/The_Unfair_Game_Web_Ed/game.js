// Three.js 3D Game - The Unfair Game

let scene, camera, renderer;
let player, playerBody;
let floor, walls = [];
let dangerZones = [];
let safeZones = [];
let exitPlatform;
let particles = [];
let chaser = null;
let chaserActive = false;
let fakeExits = [];

// Unfair mechanics state
let controlsReversed = false;
let reverseTimer = 0;
let screenBlackout = false;
let blackoutTimer = 0;
let exitRunsAway = false;
let exitOriginalPos = { x: 0, z: 0 };
let lyingHealthBar = false;
let fakeHealthDisplay = 100;
let jumpDisabled = false;
let jumpDisableTimer = 0;
let betrayalZones = [];
let lastChaserTeleport = 0;

// Game state
let gameRunning = false;
let health = 100;
let maxHealth = 100;
let score = 0;
let level = 1;
let gameTime = 0;

// Player movement
let keys = {};
let velocity = { x: 0, y: 0, z: 0 };
let onGround = true;
const GRAVITY = 0.015;
const JUMP_FORCE = 0.35;
const MOVE_SPEED = 0.15;
const SPRINT_MULTIPLIER = 1.8;
const FRICTION = 0.85;

// Arena size
const ARENA_SIZE = 40;
const WALL_HEIGHT = 5;

// DOM elements
const overlay = document.getElementById('overlay');
const levelComplete = document.getElementById('levelComplete');
const healthFill = document.getElementById('healthFill');
const healthText = document.getElementById('healthText');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const damageFlash = document.getElementById('damageFlash');
const healFlash = document.getElementById('healFlash');
const levelIndicator = document.getElementById('levelIndicator');
const playBtn = document.getElementById('playBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const backToVault = document.querySelector('.back-to-vault');

// Initialize the game
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 20, 80);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 35);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('gameCanvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 40, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Add some point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xe94560, 0.5, 30);
    pointLight1.position.set(-15, 10, -15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ade80, 0.5, 30);
    pointLight2.position.set(15, 10, 15);
    scene.add(pointLight2);

    createFloor();
    createWalls();
    createPlayer();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') e.preventDefault();
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    playBtn.addEventListener('click', startGame);
    nextLevelBtn.addEventListener('click', nextLevel);

    // Start render loop
    animate();
}

function createFloor() {
    // Main floor
    const floorGeometry = new THREE.PlaneGeometry(ARENA_SIZE, ARENA_SIZE, 20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8,
        metalness: 0.2
    });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid lines
    const gridHelper = new THREE.GridHelper(ARENA_SIZE, 20, 0x2a2a4a, 0x2a2a4a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
}

function createWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d44,
        roughness: 0.7,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8
    });

    const wallPositions = [
        { x: 0, z: -ARENA_SIZE/2, rotY: 0 },
        { x: 0, z: ARENA_SIZE/2, rotY: 0 },
        { x: -ARENA_SIZE/2, z: 0, rotY: Math.PI/2 },
        { x: ARENA_SIZE/2, z: 0, rotY: Math.PI/2 }
    ];

    wallPositions.forEach(pos => {
        const wallGeometry = new THREE.BoxGeometry(ARENA_SIZE, WALL_HEIGHT, 0.5);
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(pos.x, WALL_HEIGHT/2, pos.z);
        wall.rotation.y = pos.rotY;
        wall.castShadow = true;
        wall.receiveShadow = true;
        walls.push(wall);
        scene.add(wall);
    });
}

function createPlayer() {
    // Player body (sphere)
    const geometry = new THREE.SphereGeometry(0.8, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.3
    });
    player = new THREE.Mesh(geometry, material);
    player.position.set(-ARENA_SIZE/2 + 3, 0.8, -ARENA_SIZE/2 + 3);
    player.castShadow = true;
    scene.add(player);

    // Player glow
    const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    player.add(glow);

    // Point light on player
    const playerLight = new THREE.PointLight(0x60a5fa, 0.8, 8);
    playerLight.position.set(0, 0, 0);
    player.add(playerLight);
}

function createDangerZone(x, z, width, depth) {
    const zone = {
        x: x,
        z: z,
        width: width,
        depth: depth,
        damage: 0.5 + level * 0.15,
        revealed: false,
        revealAmount: 0,
        mesh: null,
        particles: []
    };

    // Invisible zone mesh (becomes visible when player takes damage)
    const geometry = new THREE.BoxGeometry(width, 0.1, depth);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0
    });
    zone.mesh = new THREE.Mesh(geometry, material);
    zone.mesh.position.set(x, 0.05, z);
    scene.add(zone.mesh);

    dangerZones.push(zone);
    return zone;
}

function createSafeZone(x, z, size) {
    const zone = {
        x: x,
        z: z,
        size: size,
        heal: 0.3
    };

    // Visible green platform
    const geometry = new THREE.CylinderGeometry(size/2, size/2, 0.3, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
    });
    zone.mesh = new THREE.Mesh(geometry, material);
    zone.mesh.position.set(x, 0.15, z);
    scene.add(zone.mesh);

    // Glow ring
    const ringGeometry = new THREE.RingGeometry(size/2 - 0.1, size/2 + 0.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.02, z);
    scene.add(ring);
    zone.ring = ring;

    safeZones.push(zone);
    return zone;
}

function createExit(x, z) {
    // Exit platform
    const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.7
    });
    exitPlatform = new THREE.Mesh(geometry, material);
    exitPlatform.position.set(x, 0.25, z);
    exitPlatform.castShadow = true;
    scene.add(exitPlatform);

    // Glowing pillar
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const pillarMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.6
    });
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(x, 2, z);
    scene.add(pillar);

    // Exit light
    const exitLight = new THREE.PointLight(0x4ade80, 2, 15);
    exitLight.position.set(x, 3, z);
    scene.add(exitLight);

    exitPlatform.userData = { pillar, light: exitLight };
}

function createChaser() {
    // Main body - dark ominous sphere
    const geometry = new THREE.SphereGeometry(1.2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x1a0a0a,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0x660000,
        emissiveIntensity: 0.8
    });
    chaser = new THREE.Mesh(geometry, material);

    // Start from the opposite corner
    chaser.position.set(ARENA_SIZE/2 - 5, 1.2, -ARENA_SIZE/2 + 5);
    chaser.castShadow = true;
    scene.add(chaser);

    // Evil glowing eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.4, 0.3, 0.9);
    chaser.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.4, 0.3, 0.9);
    chaser.add(rightEye);

    // Spiky protrusions
    const spikeGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const spikeMaterial = new THREE.MeshStandardMaterial({
        color: 0x330000,
        emissive: 0x440000,
        emissiveIntensity: 0.5
    });

    for (let i = 0; i < 8; i++) {
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        const angle = (i / 8) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 1, 0, Math.sin(angle) * 1);
        spike.rotation.z = -Math.PI/2 - angle;
        chaser.add(spike);
    }

    // Ominous red glow
    const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    chaser.add(glow);

    // Chaser point light
    const chaserLight = new THREE.PointLight(0xff0000, 1.5, 12);
    chaserLight.position.set(0, 0, 0);
    chaser.add(chaserLight);

    chaser.userData = {
        speed: 0.06 + (level - 4) * 0.01, // Gets faster each level
        glow: glow
    };
}

function removeChaser() {
    if (chaser) {
        scene.remove(chaser);
        chaser = null;
    }
    chaserActive = false;
}

function updateChaser() {
    if (!chaser || !chaserActive) return;

    // Calculate direction to player
    const dx = player.position.x - chaser.position.x;
    const dz = player.position.z - chaser.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.1) {
        // Move toward player
        const speed = chaser.userData.speed;
        chaser.position.x += (dx / dist) * speed;
        chaser.position.z += (dz / dist) * speed;

        // Rotate to face player
        chaser.rotation.y = Math.atan2(dx, dz);
    }

    // Pulsing effect
    const pulse = Math.sin(gameTime * 0.1) * 0.1 + 1;
    chaser.scale.setScalar(pulse);

    // Glow intensity pulsing
    if (chaser.userData.glow) {
        chaser.userData.glow.material.opacity = 0.1 + Math.sin(gameTime * 0.15) * 0.1;
    }

    // Hovering motion
    chaser.position.y = 1.2 + Math.sin(gameTime * 0.08) * 0.3;

    // Check collision with player - INSTANT DEATH
    const collisionDist = Math.hypot(
        player.position.x - chaser.position.x,
        player.position.z - chaser.position.z
    );

    if (collisionDist < 2) {
        // Caught by the chaser!
        health = 0;
        chaserCaught();
    }
}

function chaserCaught() {
    gameRunning = false;
    overlay.innerHTML = `
        <div class="title" style="font-size: 56px; color: #ff0000;">CAUGHT!</div>
        <div class="subtitle" style="color: #ff6666;">The shadow consumed you...</div>
        <div style="color: white; font-size: 28px; margin: 20px 0;">
            Final Score: <span style="color: #feca57;">${score}</span><br>
            Level Reached: <span style="color: #4ade80;">${level}</span>
        </div>
        <button class="menu-btn" onclick="location.reload()">TRY AGAIN</button>
        <p style="color: #660000; margin-top: 30px;">You cannot outrun your fate...</p>
    `;
    overlay.classList.remove('hidden');
}

// ============ UNFAIR MECHANICS ============

function createFakeExit(x, z) {
    // Looks exactly like real exit but is a trap!
    const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.7
    });
    const fakeExit = new THREE.Mesh(geometry, material);
    fakeExit.position.set(x, 0.25, z);
    fakeExit.castShadow = true;
    scene.add(fakeExit);

    // Glowing pillar
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const pillarMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.6
    });
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(x, 2, z);
    scene.add(pillar);

    // Exit light
    const exitLight = new THREE.PointLight(0x4ade80, 2, 15);
    exitLight.position.set(x, 3, z);
    scene.add(exitLight);

    fakeExit.userData = { pillar, light: exitLight, isFake: true };
    fakeExits.push(fakeExit);
}

function removeFakeExits() {
    fakeExits.forEach(exit => {
        scene.remove(exit);
        if (exit.userData.pillar) scene.remove(exit.userData.pillar);
        if (exit.userData.light) scene.remove(exit.userData.light);
    });
    fakeExits = [];
}

function checkFakeExits() {
    for (let exit of fakeExits) {
        const dist = Math.hypot(
            player.position.x - exit.position.x,
            player.position.z - exit.position.z
        );
        if (dist < 2.5) {
            // GOTCHA! Teleport back to start and take damage
            triggerFakeExitTrap();
            return;
        }
    }
}

function triggerFakeExitTrap() {
    // Screen shake
    document.getElementById('gameCanvas').classList.add('shake');
    setTimeout(() => document.getElementById('gameCanvas').classList.remove('shake'), 500);

    // Teleport player back to start
    player.position.set(-ARENA_SIZE/2 + 3, 0.8, -ARENA_SIZE/2 + 3);
    velocity = { x: 0, y: 0, z: 0 };

    // Take significant damage
    health -= 30;
    damageFlash.style.opacity = '0.8';
    setTimeout(() => damageFlash.style.opacity = '0', 300);

    // Show message
    showUnfairMessage("FAKE EXIT! Back to start!");
}

function showUnfairMessage(text) {
    levelIndicator.textContent = text;
    levelIndicator.style.color = '#ff0000';
    levelIndicator.style.borderColor = '#ff0000';
    setTimeout(() => {
        updateLevelMessage();
        levelIndicator.style.color = 'white';
        levelIndicator.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }, 2000);
}

function triggerControlsReverse() {
    if (controlsReversed) return;
    controlsReversed = true;
    reverseTimer = 180 + Math.random() * 120; // 3-5 seconds at 60fps
    document.getElementById('reverseIndicator').classList.add('active');
}

function updateControlsReverse() {
    if (controlsReversed) {
        reverseTimer--;
        if (reverseTimer <= 0) {
            controlsReversed = false;
            document.getElementById('reverseIndicator').classList.remove('active');
        }
    }
}

function triggerScreenBlackout() {
    if (screenBlackout) return;
    screenBlackout = true;
    blackoutTimer = 90 + Math.random() * 90; // 1.5-3 seconds
    document.getElementById('blackoutOverlay').classList.add('active');
}

function updateScreenBlackout() {
    if (screenBlackout) {
        blackoutTimer--;
        if (blackoutTimer <= 0) {
            screenBlackout = false;
            document.getElementById('blackoutOverlay').classList.remove('active');
        }
    }
}

function updateExitRunAway() {
    if (!exitRunsAway || !exitPlatform) return;

    const dist = Math.hypot(
        player.position.x - exitPlatform.position.x,
        player.position.z - exitPlatform.position.z
    );

    // When player gets close, exit moves away
    if (dist < 8) {
        const dx = exitPlatform.position.x - player.position.x;
        const dz = exitPlatform.position.z - player.position.z;
        const moveSpeed = 0.15;

        let newX = exitPlatform.position.x + (dx / dist) * moveSpeed;
        let newZ = exitPlatform.position.z + (dz / dist) * moveSpeed;

        // Keep within arena bounds
        const bound = ARENA_SIZE / 2 - 4;
        newX = Math.max(-bound, Math.min(bound, newX));
        newZ = Math.max(-bound, Math.min(bound, newZ));

        exitPlatform.position.x = newX;
        exitPlatform.position.z = newZ;

        // Move pillar and light too
        if (exitPlatform.userData.pillar) {
            exitPlatform.userData.pillar.position.x = newX;
            exitPlatform.userData.pillar.position.z = newZ;
        }
        if (exitPlatform.userData.light) {
            exitPlatform.userData.light.position.x = newX;
            exitPlatform.userData.light.position.z = newZ;
        }
    }
}

function triggerJumpDisable() {
    if (jumpDisabled) return;
    jumpDisabled = true;
    jumpDisableTimer = 120 + Math.random() * 180; // 2-5 seconds
}

function updateJumpDisable() {
    if (jumpDisabled) {
        jumpDisableTimer--;
        if (jumpDisableTimer <= 0) {
            jumpDisabled = false;
        }
    }
}

function chaserTeleport() {
    if (!chaser || !chaserActive) return;

    // Teleport closer to player occasionally
    const dx = player.position.x - chaser.position.x;
    const dz = player.position.z - chaser.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 15) {
        // Teleport to a position closer to player
        const teleportDist = dist * 0.4;
        chaser.position.x = player.position.x - (dx / dist) * teleportDist;
        chaser.position.z = player.position.z - (dz / dist) * teleportDist;

        // Visual effect
        for (let i = 0; i < 10; i++) {
            createDamageParticle(chaser.position.x, chaser.position.y, chaser.position.z);
        }
    }
}

function createBetrayalZone(x, z, size) {
    // Looks like a safe zone but damages you!
    const zone = {
        x: x,
        z: z,
        size: size,
        damage: 0.8,
        betrayed: false
    };

    // Visible green platform (looks safe!)
    const geometry = new THREE.CylinderGeometry(size/2, size/2, 0.3, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
    });
    zone.mesh = new THREE.Mesh(geometry, material);
    zone.mesh.position.set(x, 0.15, z);
    scene.add(zone.mesh);

    // Glow ring
    const ringGeometry = new THREE.RingGeometry(size/2 - 0.1, size/2 + 0.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.02, z);
    scene.add(ring);
    zone.ring = ring;

    betrayalZones.push(zone);
    return zone;
}

function removeBetrayalZones() {
    betrayalZones.forEach(zone => {
        scene.remove(zone.mesh);
        if (zone.ring) scene.remove(zone.ring);
    });
    betrayalZones = [];
}

function checkBetrayalZones() {
    for (let zone of betrayalZones) {
        const dist = Math.hypot(player.position.x - zone.x, player.position.z - zone.z);
        if (dist < zone.size / 2) {
            // BETRAYAL! This "safe" zone damages you!
            health -= zone.damage;
            damageFlash.style.opacity = '0.4';

            if (!zone.betrayed) {
                zone.betrayed = true;
                // Change color to red to reveal the trap
                zone.mesh.material.color.setHex(0xff0000);
                zone.mesh.material.emissive.setHex(0x660000);
                zone.ring.material.color.setHex(0xff0000);
                showUnfairMessage("BETRAYAL! That wasn't safe!");
            }
        }
    }
}

function updateLyingHealthBar() {
    if (!lyingHealthBar) return;

    // Health bar shows random fluctuating values
    fakeHealthDisplay = Math.max(10, Math.min(100, fakeHealthDisplay + (Math.random() - 0.5) * 20));
}

function fakeLevelComplete() {
    // Show fake level complete screen then kill player
    gameRunning = false;
    levelComplete.classList.remove('hidden');
    document.getElementById('levelBonus').textContent = 100 * level;

    setTimeout(() => {
        levelComplete.classList.add('hidden');

        // PSYCHE! You're dead!
        health = 0;
        gameRunning = false;
        overlay.innerHTML = `
            <div class="title" style="font-size: 56px; color: #ff0000;">JUST KIDDING!</div>
            <div class="subtitle" style="color: #ff6666;">Did you really think you won?</div>
            <div style="color: white; font-size: 28px; margin: 20px 0;">
                Final Score: <span style="color: #feca57;">${score}</span><br>
                Level Reached: <span style="color: #4ade80;">${level}</span>
            </div>
            <button class="menu-btn" onclick="location.reload()">TRY AGAIN</button>
            <p style="color: #660000; margin-top: 30px;">Trust nothing...</p>
        `;
        overlay.classList.remove('hidden');
    }, 1500);
}

function triggerRandomUnfairEvent() {
    if (!gameRunning) return;

    const events = [];

    // Add events based on level
    if (level >= 2) events.push('reverse');
    if (level >= 3) events.push('blackout');
    if (level >= 4) events.push('jumpFail');
    if (level >= 5 && chaser) events.push('teleport');

    if (events.length === 0) return;

    const event = events[Math.floor(Math.random() * events.length)];

    switch (event) {
        case 'reverse':
            triggerControlsReverse();
            break;
        case 'blackout':
            triggerScreenBlackout();
            break;
        case 'jumpFail':
            triggerJumpDisable();
            break;
        case 'teleport':
            chaserTeleport();
            break;
    }
}

function clearLevel() {
    // Remove danger zones
    dangerZones.forEach(zone => {
        scene.remove(zone.mesh);
    });
    dangerZones = [];

    // Remove safe zones
    safeZones.forEach(zone => {
        scene.remove(zone.mesh);
        if (zone.ring) scene.remove(zone.ring);
    });
    safeZones = [];

    // Remove exit
    if (exitPlatform) {
        scene.remove(exitPlatform);
        if (exitPlatform.userData.pillar) scene.remove(exitPlatform.userData.pillar);
        if (exitPlatform.userData.light) scene.remove(exitPlatform.userData.light);
        exitPlatform = null;
    }

    // Remove chaser
    removeChaser();

    // Remove fake exits
    removeFakeExits();

    // Remove betrayal zones
    removeBetrayalZones();

    // Reset unfair states
    controlsReversed = false;
    screenBlackout = false;
    exitRunsAway = false;
    lyingHealthBar = false;
    jumpDisabled = false;
    document.getElementById('reverseIndicator').classList.remove('active');
    document.getElementById('blackoutOverlay').classList.remove('active');

    // Remove particles
    particles.forEach(p => scene.remove(p));
    particles = [];
}

function generateLevel() {
    clearLevel();

    // Reset player position
    player.position.set(-ARENA_SIZE/2 + 3, 0.8, -ARENA_SIZE/2 + 3);
    velocity = { x: 0, y: 0, z: 0 };
    health = maxHealth;

    // Create exit
    createExit(ARENA_SIZE/2 - 3, ARENA_SIZE/2 - 3);

    // Generate danger zones
    const numZones = Math.min(4 + level * 2, 18);
    for (let i = 0; i < numZones; i++) {
        let attempts = 0;
        let x, z, width, depth;

        do {
            width = 3 + Math.random() * (5 - level * 0.2);
            depth = 3 + Math.random() * (5 - level * 0.2);
            x = (Math.random() - 0.5) * (ARENA_SIZE - width - 6);
            z = (Math.random() - 0.5) * (ARENA_SIZE - depth - 6);
            attempts++;
        } while (attempts < 30 && (isNearStart(x, z, width, depth) || isNearExit(x, z, width, depth)));

        if (attempts < 30) {
            createDangerZone(x, z, width, depth);
        }
    }

    // Generate safe zones
    const numSafe = Math.max(1, 3 - Math.floor(level / 4));
    for (let i = 0; i < numSafe; i++) {
        let attempts = 0;
        let x, z;

        do {
            x = (Math.random() - 0.5) * (ARENA_SIZE - 8);
            z = (Math.random() - 0.5) * (ARENA_SIZE - 8);
            attempts++;
        } while (attempts < 20 && (isNearStart(x, z, 3, 3) || isNearExit(x, z, 3, 3)));

        if (attempts < 20) {
            createSafeZone(x, z, 2.5);
        }
    }

    // Create chaser after level 3
    if (level > 3) {
        createChaser();
        chaserActive = true;
    }

    // ============ UNFAIR ADDITIONS ============

    // Level 2+: Add fake exits
    if (level >= 2) {
        const numFakeExits = Math.min(level - 1, 3);
        for (let i = 0; i < numFakeExits; i++) {
            let x, z, attempts = 0;
            do {
                x = (Math.random() - 0.5) * (ARENA_SIZE - 10);
                z = (Math.random() - 0.5) * (ARENA_SIZE - 10);
                attempts++;
            } while (attempts < 20 && (isNearStart(x, z, 5, 5) || isNearExit(x, z, 5, 5)));

            if (attempts < 20) {
                createFakeExit(x, z);
            }
        }
    }

    // Level 3+: Add betrayal zones (fake safe zones)
    if (level >= 3) {
        const numBetrayal = Math.min(Math.floor((level - 2) / 2), 2);
        for (let i = 0; i < numBetrayal; i++) {
            let x, z, attempts = 0;
            do {
                x = (Math.random() - 0.5) * (ARENA_SIZE - 8);
                z = (Math.random() - 0.5) * (ARENA_SIZE - 8);
                attempts++;
            } while (attempts < 20 && (isNearStart(x, z, 4, 4) || isNearExit(x, z, 4, 4)));

            if (attempts < 20) {
                createBetrayalZone(x, z, 2.5);
            }
        }
    }

    // Level 5+: Exit runs away from player
    if (level >= 5) {
        exitRunsAway = true;
        exitOriginalPos = { x: exitPlatform.position.x, z: exitPlatform.position.z };
    }

    // Level 6+: Health bar lies to you
    if (level >= 6) {
        lyingHealthBar = true;
        fakeHealthDisplay = 100;
    }

    updateUI();
    updateLevelMessage();
}

function isNearStart(x, z, w, d) {
    const startX = -ARENA_SIZE/2 + 3;
    const startZ = -ARENA_SIZE/2 + 3;
    return Math.abs(x - startX) < w/2 + 5 && Math.abs(z - startZ) < d/2 + 5;
}

function isNearExit(x, z, w, d) {
    const exitX = ARENA_SIZE/2 - 3;
    const exitZ = ARENA_SIZE/2 - 3;
    return Math.abs(x - exitX) < w/2 + 4 && Math.abs(z - exitZ) < d/2 + 4;
}

function updateLevelMessage() {
    const messages = [
        "Find the green exit! Beware of invisible danger zones...",
        "Not all exits are real... Choose wisely!",
        "Safe zones? Are you sure about that?",
        "SOMETHING IS HUNTING YOU! RUN!",
        "The exit fears you... It runs away!",
        "Can you trust your own health bar?",
        "Reality itself betrays you now...",
        "Even victory might be a lie...",
        "Your controls betray you...",
        "Welcome to true unfairness!"
    ];
    levelIndicator.textContent = messages[Math.min(level - 1, messages.length - 1)];
}

function startGame() {
    overlay.classList.add('hidden');
    if (backToVault) backToVault.style.display = 'none';
    gameRunning = true;
    score = 0;
    level = 1;
    generateLevel();
}

function nextLevel() {
    levelComplete.classList.add('hidden');
    if (backToVault) backToVault.style.display = 'none';
    gameRunning = true;
    generateLevel();
}

function showLevelComplete() {
    gameRunning = false;
    if (backToVault) backToVault.style.display = 'flex';
    const bonus = 100 * level;
    score += bonus;
    document.getElementById('levelBonus').textContent = bonus;
    levelComplete.classList.remove('hidden');
    level++;
    updateUI();
}

function gameOver() {
    gameRunning = false;
    if (backToVault) backToVault.style.display = 'flex';
    overlay.innerHTML = `
        <div class="title" style="font-size: 56px;">GAME OVER</div>
        <div class="subtitle">The unfairness claimed you...</div>
        <div style="color: white; font-size: 28px; margin: 20px 0;">
            Final Score: <span style="color: #feca57;">${score}</span><br>
            Level Reached: <span style="color: #4ade80;">${level}</span>
        </div>
        <button class="menu-btn" onclick="location.reload()">TRY AGAIN</button>
        <p style="color: #666; margin-top: 30px;">Remember where it hurt...</p>
    `;
    overlay.classList.remove('hidden');
}

function update() {
    if (!gameRunning) return;

    gameTime++;

    // Random unfair events
    if (gameTime % 300 === 0 && Math.random() < 0.4 + level * 0.05) {
        triggerRandomUnfairEvent();
    }

    // Update unfair mechanics
    updateControlsReverse();
    updateScreenBlackout();
    updateJumpDisable();
    updateExitRunAway();
    updateLyingHealthBar();

    // Player movement
    let moveX = 0, moveZ = 0;
    const speed = keys['shift'] ? MOVE_SPEED * SPRINT_MULTIPLIER : MOVE_SPEED;

    // Check for reversed controls
    if (controlsReversed) {
        if (keys['w']) moveZ += speed;
        if (keys['s']) moveZ -= speed;
        if (keys['a']) moveX += speed;
        if (keys['d']) moveX -= speed;
    } else {
        if (keys['w']) moveZ -= speed;
        if (keys['s']) moveZ += speed;
        if (keys['a']) moveX -= speed;
        if (keys['d']) moveX += speed;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
        moveX *= 0.707;
        moveZ *= 0.707;
    }

    velocity.x += moveX;
    velocity.z += moveZ;

    // Apply friction
    velocity.x *= FRICTION;
    velocity.z *= FRICTION;

    // Jump (can be disabled by unfair mechanic)
    if (keys[' '] && onGround && !jumpDisabled) {
        velocity.y = JUMP_FORCE;
        onGround = false;
    }

    // Gravity
    velocity.y -= GRAVITY;

    // Update position
    player.position.x += velocity.x;
    player.position.z += velocity.z;
    player.position.y += velocity.y;

    // Ground collision
    if (player.position.y <= 0.8) {
        player.position.y = 0.8;
        velocity.y = 0;
        onGround = true;
    }

    // Wall collisions
    const halfArena = ARENA_SIZE / 2 - 1;
    player.position.x = Math.max(-halfArena, Math.min(halfArena, player.position.x));
    player.position.z = Math.max(-halfArena, Math.min(halfArena, player.position.z));

    // Rotate player based on movement
    if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.z) > 0.01) {
        player.rotation.x += velocity.z * 0.5;
        player.rotation.z -= velocity.x * 0.5;
    }

    // Check danger zones
    let inDanger = false;
    for (let zone of dangerZones) {
        if (playerInDangerZone(zone)) {
            inDanger = true;
            zone.revealed = true;
            zone.revealAmount = Math.min(zone.revealAmount + 0.03, 0.5);
            zone.mesh.material.opacity = zone.revealAmount;

            health -= zone.damage;
            damageFlash.style.opacity = '0.4';

            // Damage particles
            if (Math.random() < 0.3) {
                createDamageParticle(player.position.x, player.position.y, player.position.z);
            }
        } else {
            // Slowly fade revealed zones
            if (zone.revealAmount > 0) {
                zone.revealAmount = Math.max(0, zone.revealAmount - 0.003);
                zone.mesh.material.opacity = zone.revealAmount;
            }
        }
    }

    if (!inDanger) {
        damageFlash.style.opacity = '0';
    }

    // Check safe zones
    for (let zone of safeZones) {
        if (playerInSafeZone(zone)) {
            if (health < maxHealth) {
                health = Math.min(maxHealth, health + zone.heal);
                healFlash.style.opacity = '0.3';

                if (Math.random() < 0.2) {
                    createHealParticle(player.position.x, player.position.y, player.position.z);
                }
            }
        }
    }

    if (health >= maxHealth) {
        healFlash.style.opacity = '0';
    }

    // Check fake exits BEFORE real exit
    checkFakeExits();

    // Check betrayal zones
    checkBetrayalZones();

    // Check exit
    if (exitPlatform) {
        const dist = Math.hypot(
            player.position.x - exitPlatform.position.x,
            player.position.z - exitPlatform.position.z
        );
        if (dist < 2.5) {
            // Level 7+: Sometimes fake level complete
            if (level >= 7 && Math.random() < 0.3 && !exitPlatform.userData.reallyComplete) {
                exitPlatform.userData.reallyComplete = true; // Only trick once
                fakeLevelComplete();
                return;
            }
            showLevelComplete();
        }

        // Animate exit
        exitPlatform.rotation.y += 0.02;
        if (exitPlatform.userData.pillar) {
            exitPlatform.userData.pillar.rotation.y -= 0.01;
        }
    }

    // Animate fake exits
    fakeExits.forEach(exit => {
        exit.rotation.y += 0.02;
        if (exit.userData.pillar) {
            exit.userData.pillar.rotation.y -= 0.01;
        }
    });

    // Animate safe zones
    safeZones.forEach(zone => {
        zone.mesh.rotation.y += 0.01;
        if (zone.ring) {
            zone.ring.rotation.z += 0.02;
        }
    });

    // Animate betrayal zones (look just like safe zones!)
    betrayalZones.forEach(zone => {
        zone.mesh.rotation.y += 0.01;
        if (zone.ring) {
            zone.ring.rotation.z += 0.02;
        }
    });

    // Update particles
    updateParticles();

    // Update chaser
    updateChaser();

    // Check death
    if (health <= 0) {
        health = 0;
        updateUI();
        gameOver();
        return;
    }

    updateUI();

    // Camera follow
    camera.position.x += (player.position.x * 0.3 - camera.position.x) * 0.05;
    camera.position.z += (player.position.z * 0.3 + 35 - camera.position.z) * 0.05;
    camera.lookAt(player.position.x * 0.5, 0, player.position.z * 0.5);
}

function playerInDangerZone(zone) {
    return player.position.x > zone.x - zone.width/2 &&
           player.position.x < zone.x + zone.width/2 &&
           player.position.z > zone.z - zone.depth/2 &&
           player.position.z < zone.z + zone.depth/2;
}

function playerInSafeZone(zone) {
    const dist = Math.hypot(player.position.x - zone.x, player.position.z - zone.z);
    return dist < zone.size / 2;
}

function createDamageParticle(x, y, z) {
    const geometry = new THREE.SphereGeometry(0.15, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(
        x + (Math.random() - 0.5) * 1,
        y + Math.random() * 0.5,
        z + (Math.random() - 0.5) * 1
    );
    particle.userData = {
        velocity: {
            x: (Math.random() - 0.5) * 0.2,
            y: Math.random() * 0.15 + 0.1,
            z: (Math.random() - 0.5) * 0.2
        },
        life: 40
    };
    scene.add(particle);
    particles.push(particle);
}

function createHealParticle(x, y, z) {
    const geometry = new THREE.SphereGeometry(0.12, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(
        x + (Math.random() - 0.5) * 0.8,
        y - 0.5,
        z + (Math.random() - 0.5) * 0.8
    );
    particle.userData = {
        velocity: {
            x: (Math.random() - 0.5) * 0.05,
            y: 0.08,
            z: (Math.random() - 0.5) * 0.05
        },
        life: 50
    };
    scene.add(particle);
    particles.push(particle);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.x += p.userData.velocity.x;
        p.position.y += p.userData.velocity.y;
        p.position.z += p.userData.velocity.z;
        p.userData.velocity.y -= 0.005;
        p.userData.life--;

        const scale = p.userData.life / 50;
        p.scale.setScalar(scale);
        p.material.opacity = scale;

        if (p.userData.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }
}

function updateUI() {
    let displayHealth = health;
    let displayPercent = (health / maxHealth) * 100;

    // Lying health bar shows fake values
    if (lyingHealthBar) {
        displayHealth = fakeHealthDisplay;
        displayPercent = (fakeHealthDisplay / maxHealth) * 100;
    }

    healthFill.style.width = displayPercent + '%';
    healthText.textContent = Math.ceil(displayHealth);

    // Real health check for low warning (but show based on real health)
    if ((health / maxHealth) * 100 < 30) {
        healthFill.classList.add('low');
    } else {
        healthFill.classList.remove('low');
    }

    scoreEl.textContent = score;
    levelEl.textContent = level;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Start the game
init();

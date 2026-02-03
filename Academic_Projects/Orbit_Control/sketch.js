/*
Final Project - Interactive Orbit Control
Jordan Alexis
Enhanced with Sound Reactive Mode, More Shapes & Post-processing
*/

// Interactive control variables
var camX = 0;
var camY = 0;
var camZ = 200;
var targetCamX = 0;
var targetCamY = 0;
var targetCamZ = 200;
var rotationSpeedMultiplier = 1;
var isPaused = false;
var shapeMode = 'mixed';
var colorScheme = 'default';
var currentColorIndex = 0;
var backgroundMusic;
var isMusicPlaying = false;
var hoverColorEffect = true;
var mouseHue = 0;

// Mouse drag controls
var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;
var orbitAngleX = 0;
var orbitAngleY = 0;
var targetOrbitX = 0;
var targetOrbitY = 0;

// Zoom controls
var zoomLevel = 1;
var targetZoom = 1;
var minZoom = 0.3;
var maxZoom = 3;

// Particle system
var particles = [];
var maxParticles = 100;

// Shape interaction
var shapePositions = [];
var explosionAmount = 0;
var targetExplosion = 0;
var pulsePhase = 0;

// === NEW: Sound Reactive Mode ===
var audioContext;
var analyser;
var audioSource;
var frequencyData;
var soundReactiveMode = false;
var bassLevel = 0;
var midLevel = 0;
var highLevel = 0;
var smoothBass = 0;
var smoothMid = 0;
var smoothHigh = 0;
var audioInitialized = false;

// === NEW: Post-processing / Bloom ===
var bloomEnabled = false;
var bloomIntensity = 0.5;
var glowGraphics;

// Color schemes
var colorSchemes = {
    default: { color1: 'white', color2: 'teal' },
    neon: { color1: '#ff00ff', color2: '#00ffff' },
    rainbow: { color1: '#ff0080', color2: '#00ff80' },
    monochrome: { color1: '#ffffff', color2: '#888888' },
    fire: { color1: '#ff4500', color2: '#ffd700' },
    ocean: { color1: '#00bfff', color2: '#004080' },
    matrix: { color1: '#00ff00', color2: '#003300' },
    synthwave: { color1: '#ff00ff', color2: '#00ffff' },
    gold: { color1: '#ffd700', color2: '#b8860b' }
};

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    rectMode(CENTER);
    colorMode(HSB, 360, 100, 100, 100);

    // Initialize shape positions
    initShapePositions();

    setupEventListeners();
    setupMouseControls();

    // Initialize audio analyzer for sound reactive mode
    initAudioAnalyzer();
}

function initShapePositions() {
    shapePositions = [];
    var radius = width * 0.8;
    for (var i = 0; i <= 12; i++) {
        for (var j = 0; j <= 12; j++) {
            var a = (j / 12) * PI;
            var b = (i / 12) * PI;
            var x = sin(2 * a) * radius * sin(b);
            var y = cos(b) * radius / 2;
            var z = cos(2 * a) * radius * sin(b);
            shapePositions.push({ x: x, y: y, z: z, i: i, j: j, scale: 1, pulse: random(TWO_PI) });
        }
    }
}

// === NEW: Audio Analyzer for Sound Reactive Mode ===
function initAudioAnalyzer() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        audioInitialized = true;
    } catch (e) {
        console.log('Web Audio API not supported');
        audioInitialized = false;
    }
}

function connectAudioSource() {
    if (!audioInitialized || audioSource) return;

    try {
        var audioElement = document.getElementById('backgroundMusic');
        if (audioElement && audioContext) {
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audioSource = audioContext.createMediaElementSource(audioElement);
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
        }
    } catch (e) {
        console.log('Could not connect audio source:', e);
    }
}

function analyzeAudio() {
    if (!analyser || !frequencyData || !soundReactiveMode) return;

    analyser.getByteFrequencyData(frequencyData);

    // Split frequency data into bass, mid, and high
    var bassSum = 0;
    var midSum = 0;
    var highSum = 0;
    var bassCount = Math.floor(frequencyData.length * 0.15);
    var midCount = Math.floor(frequencyData.length * 0.5);

    for (var i = 0; i < frequencyData.length; i++) {
        if (i < bassCount) {
            bassSum += frequencyData[i];
        } else if (i < midCount) {
            midSum += frequencyData[i];
        } else {
            highSum += frequencyData[i];
        }
    }

    // Normalize and smooth
    bassLevel = bassSum / (bassCount * 255);
    midLevel = midSum / ((midCount - bassCount) * 255);
    highLevel = highSum / ((frequencyData.length - midCount) * 255);

    // Smooth the values for less jittery animation
    smoothBass = lerp(smoothBass, bassLevel, 0.3);
    smoothMid = lerp(smoothMid, midLevel, 0.25);
    smoothHigh = lerp(smoothHigh, highLevel, 0.2);
}

function setupMouseControls() {
    var canvasContainer = document.getElementById('canvas-container');

    // Mouse drag for orbit
    canvasContainer.addEventListener('mousedown', function(e) {
        if (e.button === 0) {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    window.addEventListener('mouseup', function() {
        isDragging = false;
    });

    window.addEventListener('mousemove', function(e) {
        if (isDragging) {
            var deltaX = e.clientX - lastMouseX;
            var deltaY = e.clientY - lastMouseY;
            targetOrbitX += deltaY * 0.005;
            targetOrbitY += deltaX * 0.005;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    // Scroll wheel for zoom
    canvasContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        var zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        targetZoom = constrain(targetZoom + zoomDelta, minZoom, maxZoom);
        updateZoomSlider();
    }, { passive: false });
}

function setupEventListeners() {
    // Get background music element
    backgroundMusic = document.getElementById('backgroundMusic');

    // About Project Modal
    var modal = document.getElementById('aboutModal');
    var aboutBtn = document.getElementById('aboutProject');
    var closeBtn = document.querySelector('.modal-close');

    if (aboutBtn) {
        aboutBtn.addEventListener('click', function () {
            modal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Toggle music button
    var musicBtn = document.getElementById('toggleMusic');
    if (musicBtn) {
        musicBtn.addEventListener('click', function () {
            if (isMusicPlaying) {
                backgroundMusic.pause();
                isMusicPlaying = false;
            } else {
                backgroundMusic.play();
                isMusicPlaying = true;
            }
        });
    }

    // Toggle rotation button
    var rotationBtn = document.getElementById('toggleRotation');
    if (rotationBtn) {
        rotationBtn.addEventListener('click', function () {
            isPaused = !isPaused;
        });
    }

    // Reset view button
    var resetBtn = document.getElementById('resetView');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            targetCamX = 0;
            targetCamY = 0;
            targetOrbitX = 0;
            targetOrbitY = 0;
            targetZoom = 1;
            targetExplosion = 0;
            rotationSpeedMultiplier = 1;
            document.getElementById('rotationSpeed').value = 2;
            document.getElementById('speedValue').textContent = '1x';
            updateZoomSlider();
        });
    }

    // Random colors button
    var randomColorsBtn = document.getElementById('randomColors');
    if (randomColorsBtn) {
        randomColorsBtn.addEventListener('click', function () {
            var schemes = Object.keys(colorSchemes);
            currentColorIndex = (currentColorIndex + 1) % schemes.length;
            colorScheme = schemes[currentColorIndex];
            document.getElementById('colorScheme').value = colorScheme;
            // Trigger change event for toolbar sync
            document.getElementById('colorScheme').dispatchEvent(new Event('change'));
        });
    }

    // Rotation speed slider
    var speedSlider = document.getElementById('rotationSpeed');
    if (speedSlider) {
        speedSlider.addEventListener('input', function () {
            rotationSpeedMultiplier = this.value / 2;
            document.getElementById('speedValue').textContent = rotationSpeedMultiplier + 'x';
        });
    }

    // Shape type selector
    var shapeSelect = document.getElementById('shapeType');
    if (shapeSelect) {
        shapeSelect.addEventListener('change', function () {
            shapeMode = this.value;
        });
    }

    // Color scheme selector
    var colorSelect = document.getElementById('colorScheme');
    if (colorSelect) {
        colorSelect.addEventListener('change', function () {
            colorScheme = this.value;
        });
    }

    // Zoom slider
    var zoomSlider = document.getElementById('zoomLevel');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', function () {
            targetZoom = parseFloat(this.value);
            document.getElementById('zoomValue').textContent = (targetZoom * 100).toFixed(0) + '%';
        });
    }

    // Explosion button
    var explodeBtn = document.getElementById('explodeShapes');
    if (explodeBtn) {
        explodeBtn.addEventListener('click', function () {
            targetExplosion = targetExplosion > 0 ? 0 : 1;
        });
    }

    // Particle toggle
    var particleBtn = document.getElementById('toggleParticles');
    if (particleBtn) {
        particleBtn.addEventListener('click', function () {
            maxParticles = maxParticles > 0 ? 0 : 100;
        });
    }

    // === NEW: Sound Reactive Mode toggle ===
    var soundReactiveBtn = document.getElementById('toggleSoundReactive');
    if (soundReactiveBtn) {
        soundReactiveBtn.addEventListener('click', function () {
            soundReactiveMode = !soundReactiveMode;
            if (soundReactiveMode && !audioSource) {
                connectAudioSource();
            }
        });
    }

    // === NEW: Bloom toggle ===
    var bloomBtn = document.getElementById('toggleBloom');
    if (bloomBtn) {
        bloomBtn.addEventListener('click', function () {
            bloomEnabled = !bloomEnabled;
        });
    }
}

function updateZoomSlider() {
    var zoomSlider = document.getElementById('zoomLevel');
    var zoomValue = document.getElementById('zoomValue');
    if (zoomSlider && zoomValue) {
        zoomSlider.value = targetZoom;
        zoomValue.textContent = (targetZoom * 100).toFixed(0) + '%';
    }
}

function draw() {
    // Background - bloom adds a slight purple tint
    colorMode(RGB, 255);
    if (bloomEnabled) {
        background(10, 5, 15);
    } else {
        background(0);
    }
    colorMode(HSB, 360, 100, 100, 100);

    // Analyze audio for sound reactive mode
    if (soundReactiveMode && isMusicPlaying) {
        analyzeAudio();
    }

    // Smooth interpolation for all controls
    orbitAngleX = lerp(orbitAngleX, targetOrbitX, 0.08);
    orbitAngleY = lerp(orbitAngleY, targetOrbitY, 0.08);
    zoomLevel = lerp(zoomLevel, targetZoom, 0.08);
    explosionAmount = lerp(explosionAmount, targetExplosion, 0.05);

    // Sound reactive pulse speed
    var pulseSpeed = 0.03;
    if (soundReactiveMode) {
        pulseSpeed = 0.03 + smoothBass * 0.1;
    }
    pulsePhase += pulseSpeed;

    // Update hover color based on mouse position
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        mouseHue = map(mouseX, 0, width, 0, 360);
        updateTextColors();
    }

    // Smooth camera position updates
    if (!isDragging && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        targetCamX = map(mouseX, 0, width, -100, 100);
        targetCamY = map(mouseY, 0, height, -100, 100);
    }
    camX = lerp(camX, targetCamX, 0.05);
    camY = lerp(camY, targetCamY, 0.05);

    // Apply orbit rotation and zoom to camera
    var camDist = 600 / zoomLevel;
    var camPosX = sin(orbitAngleY) * cos(orbitAngleX) * camDist;
    var camPosY = sin(orbitAngleX) * camDist;
    var camPosZ = cos(orbitAngleY) * cos(orbitAngleX) * camDist;

    camera(camPosX, camPosY, camPosZ, camX, camY, 0, 0, 1, 0);

    // Enhanced lighting
    var ambientIntensity = bloomEnabled ? 120 : 80;
    ambientLight(ambientIntensity);
    pointLight(255, 255, 255, camPosX, camPosY, camPosZ);

    // Dynamic colored lights based on mouse position
    var lightHue = mouseHue;
    colorMode(HSB, 360, 100, 100);

    // Sound reactive lighting
    var lightIntensity = 100;
    if (soundReactiveMode) {
        lightIntensity = 80 + smoothBass * 40;
    }

    // Bloom enhances light brightness
    if (bloomEnabled) {
        lightIntensity = min(100, lightIntensity + 20);
    }

    pointLight(color(lightHue, 80, lightIntensity), -300, -300, 300);
    pointLight(color((lightHue + 180) % 360, 80, lightIntensity), 300, 300, -300);

    // Draw particles
    updateAndDrawParticles();

    // Draw the 3D orbit structure
    translate(0, 0, -600);
    var radius = width * 0.8;

    for (var idx = 0; idx < shapePositions.length; idx++) {
        var shape = shapePositions[idx];
        push();

        // Calculate explosion offset
        var explosionOffset = explosionAmount * 200;
        var ex = shape.x + (shape.x / radius) * explosionOffset * radius;
        var ey = shape.y + (shape.y / (radius/2)) * explosionOffset * radius / 2;
        var ez = shape.z + (shape.z / radius) * explosionOffset * radius;

        translate(ex, ey, ez);

        // Pulsing scale effect
        var pulseScale = 1 + sin(pulsePhase + shape.pulse) * 0.15;
        scale(pulseScale);

        // Rotation animation
        if (!isPaused) {
            rotateZ(frameCount * 0.02 * rotationSpeedMultiplier);
            rotateX(frameCount * 0.02 * rotationSpeedMultiplier);
            rotateY(frameCount * 0.01 * rotationSpeedMultiplier);
        }

        // Get colors from current scheme
        var colors = colorSchemes[colorScheme];

        // Draw shapes based on mode with slight color variation
        drawShape(shape.j, shape.i, colors, pulseScale);

        pop();
    }
}

// Particle system
function updateAndDrawParticles() {
    // Add new particles
    if (particles.length < maxParticles && frameCount % 3 === 0) {
        particles.push({
            x: random(-400, 400),
            y: random(-400, 400),
            z: random(-800, -200),
            vx: random(-1, 1),
            vy: random(-1, 1),
            vz: random(2, 5),
            size: random(2, 6),
            hue: random(360),
            life: 255
        });
    }

    // Update and draw particles
    noStroke();
    for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.life -= 2;
        p.hue = (p.hue + 1) % 360;

        // Draw particle
        push();
        translate(p.x, p.y, p.z);
        fill(p.hue, 80, 100, p.life / 255 * 100);
        sphere(p.size);
        pop();

        // Remove dead particles
        if (p.life <= 0 || p.z > 200) {
            particles.splice(i, 1);
        }
    }
}

function drawShape(j, i, colors, pulseScale) {
    // Get the base color
    var baseColor = j % 2 === 0 ? colors.color1 : colors.color2;

    // Apply material
    ambientMaterial(baseColor);

    // Bloom adds a colored stroke glow
    if (bloomEnabled) {
        stroke(baseColor);
        strokeWeight(2);
    } else {
        noStroke();
    }

    // Sound reactive size modulation
    var soundScale = 1;
    if (soundReactiveMode) {
        // Different shapes react to different frequencies
        if (i % 3 === 0) {
            soundScale = 1 + smoothBass * 0.8;
        } else if (i % 3 === 1) {
            soundScale = 1 + smoothMid * 0.6;
        } else {
            soundScale = 1 + smoothHigh * 0.4;
        }
        scale(soundScale);
    }

    switch (shapeMode) {
        case 'mixed':
            if (j % 2 === 0) {
                cone(40, 60);
            } else {
                box(50, 30, 30);
            }
            break;
        case 'cones':
            cone(40, 60);
            break;
        case 'boxes':
            box(50, 30, 30);
            break;
        case 'spheres':
            sphere(30);
            break;
        case 'torus':
            torus(25, 10);
            break;
        case 'cylinders':
            cylinder(20, 50);
            break;
        // === NEW SHAPES ===
        case 'icosahedron':
            drawIcosahedron(30);
            break;
        case 'octahedron':
            drawOctahedron(35);
            break;
        case 'dodecahedron':
            drawDodecahedron(25);
            break;
        case 'pyramid':
            drawPyramid(40, 50);
            break;
        case 'gem':
            drawGem(30);
            break;
        case 'star':
            drawStar3D(35);
            break;
    }
}

// === NEW: Custom Shape Drawing Functions ===
function drawIcosahedron(size) {
    // Approximate icosahedron using sphere with low detail
    sphere(size, 4, 3);
}

function drawOctahedron(size) {
    // Octahedron = two cones tip-to-tip
    push();
    // Top cone pointing up
    translate(0, -size/2, 0);
    rotateX(PI);
    cone(size * 0.7, size);
    pop();

    push();
    // Bottom cone pointing down
    translate(0, size/2, 0);
    cone(size * 0.7, size);
    pop();
}

function drawDodecahedron(size) {
    // Approximate with sphere of medium detail
    sphere(size, 5, 4);
}

function drawPyramid(base, height) {
    // Use cone with 4 sides for pyramid look
    push();
    rotateX(PI);
    cone(base/2, height, 4);
    pop();
}

function drawGem(size) {
    // Diamond/gem shape - two cones, top one taller
    push();
    // Top part (longer)
    translate(0, -size * 0.3, 0);
    rotateX(PI);
    cone(size * 0.5, size * 0.8, 6);
    pop();

    push();
    // Bottom part (shorter point)
    translate(0, size * 0.4, 0);
    cone(size * 0.5, size * 0.5, 6);
    pop();
}

function drawStar3D(size) {
    // 3D star using three intersecting boxes
    box(size * 1.2, size * 0.3, size * 0.3);
    box(size * 0.3, size * 1.2, size * 0.3);
    box(size * 0.3, size * 0.3, size * 1.2);
}

// Keyboard controls
function keyPressed() {
    // Space to toggle rotation
    if (key === ' ') {
        isPaused = !isPaused;
        // Update button state via click simulation for icon toggle
        var rotationBtn = document.getElementById('toggleRotation');
        if (rotationBtn) {
            var icon = rotationBtn.querySelector('i');
            if (icon) {
                if (isPaused) {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                    rotationBtn.classList.add('active');
                } else {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                    rotationBtn.classList.remove('active');
                }
            }
        }
        return false; // Prevent page scroll
    }

    // R to reset view
    if (key === 'r' || key === 'R') {
        targetCamX = 0;
        targetCamY = 0;
        targetOrbitX = 0;
        targetOrbitY = 0;
        targetZoom = 1;
        targetExplosion = 0;
        rotationSpeedMultiplier = 1;
        document.getElementById('rotationSpeed').value = 2;
        document.getElementById('speedValue').textContent = '1x';
        updateZoomSlider();
        // Reset explode button state
        var explodeBtn = document.getElementById('explodeShapes');
        if (explodeBtn) {
            var icon = explodeBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-compress-alt');
                icon.classList.add('fa-expand-alt');
            }
            explodeBtn.classList.remove('active');
        }
    }

    // C to cycle colors
    if (key === 'c' || key === 'C') {
        var schemes = Object.keys(colorSchemes);
        currentColorIndex = (currentColorIndex + 1) % schemes.length;
        colorScheme = schemes[currentColorIndex];
        document.getElementById('colorScheme').value = colorScheme;
        // Trigger change event for toolbar sync
        document.getElementById('colorScheme').dispatchEvent(new Event('change'));
    }

    // WASD for camera orbit
    if (key === 'w' || key === 'W') {
        targetOrbitX -= 0.1;
    } else if (key === 's' || key === 'S') {
        targetOrbitX += 0.1;
    } else if (key === 'a' || key === 'A') {
        targetOrbitY -= 0.1;
    } else if (key === 'd' || key === 'D') {
        targetOrbitY += 0.1;
    }

    // Q/E for zoom
    if (key === 'q' || key === 'Q') {
        targetZoom = constrain(targetZoom - 0.1, minZoom, maxZoom);
        updateZoomSlider();
    } else if (key === 'e' || key === 'E') {
        targetZoom = constrain(targetZoom + 0.1, minZoom, maxZoom);
        updateZoomSlider();
    }

    // X to toggle explosion
    if (key === 'x' || key === 'X') {
        targetExplosion = targetExplosion > 0 ? 0 : 1;
        var explodeBtn = document.getElementById('explodeShapes');
        if (explodeBtn) {
            var icon = explodeBtn.querySelector('i');
            if (icon) {
                if (targetExplosion > 0) {
                    icon.classList.remove('fa-expand-alt');
                    icon.classList.add('fa-compress-alt');
                    explodeBtn.classList.add('active');
                } else {
                    icon.classList.remove('fa-compress-alt');
                    icon.classList.add('fa-expand-alt');
                    explodeBtn.classList.remove('active');
                }
            }
        }
    }

    // P to toggle particles
    if (key === 'p' || key === 'P') {
        maxParticles = maxParticles > 0 ? 0 : 100;
        var particleBtn = document.getElementById('toggleParticles');
        if (particleBtn) {
            particleBtn.classList.toggle('active');
        }
    }

    // === NEW: B to toggle bloom ===
    if (key === 'b' || key === 'B') {
        bloomEnabled = !bloomEnabled;
        var bloomBtn = document.getElementById('toggleBloom');
        if (bloomBtn) {
            bloomBtn.classList.toggle('active');
        }
    }

    // === NEW: M to toggle sound reactive mode ===
    if (key === 'm' || key === 'M') {
        soundReactiveMode = !soundReactiveMode;
        if (soundReactiveMode && !audioSource) {
            connectAudioSource();
        }
        var soundBtn = document.getElementById('toggleSoundReactive');
        if (soundBtn) {
            soundBtn.classList.toggle('active');
        }
    }

    // Number keys 1-9 for shape modes (expanded)
    var shapeSelect = document.getElementById('shapeType');
    if (key === '1') {
        shapeMode = 'mixed';
        if (shapeSelect) {
            shapeSelect.value = 'mixed';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '2') {
        shapeMode = 'cones';
        if (shapeSelect) {
            shapeSelect.value = 'cones';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '3') {
        shapeMode = 'boxes';
        if (shapeSelect) {
            shapeSelect.value = 'boxes';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '4') {
        shapeMode = 'spheres';
        if (shapeSelect) {
            shapeSelect.value = 'spheres';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '5') {
        shapeMode = 'torus';
        if (shapeSelect) {
            shapeSelect.value = 'torus';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '6') {
        shapeMode = 'cylinders';
        if (shapeSelect) {
            shapeSelect.value = 'cylinders';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '7') {
        shapeMode = 'icosahedron';
        if (shapeSelect) {
            shapeSelect.value = 'icosahedron';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '8') {
        shapeMode = 'octahedron';
        if (shapeSelect) {
            shapeSelect.value = 'octahedron';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '9') {
        shapeMode = 'pyramid';
        if (shapeSelect) {
            shapeSelect.value = 'pyramid';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    } else if (key === '0') {
        shapeMode = 'gem';
        if (shapeSelect) {
            shapeSelect.value = 'gem';
            shapeSelect.dispatchEvent(new Event('change'));
        }
    }

    // +/- for rotation speed
    if (key === '+' || key === '=') {
        rotationSpeedMultiplier = min(rotationSpeedMultiplier + 0.5, 5);
        document.getElementById('rotationSpeed').value = rotationSpeedMultiplier * 2;
        document.getElementById('speedValue').textContent = rotationSpeedMultiplier + 'x';
    } else if (key === '-' || key === '_') {
        rotationSpeedMultiplier = max(rotationSpeedMultiplier - 0.5, 0);
        document.getElementById('rotationSpeed').value = rotationSpeedMultiplier * 2;
        document.getElementById('speedValue').textContent = rotationSpeedMultiplier + 'x';
    }

    // Arrow keys for fine camera pan
    if (keyCode === LEFT_ARROW) {
        targetCamX -= 20;
    } else if (keyCode === RIGHT_ARROW) {
        targetCamX += 20;
    } else if (keyCode === UP_ARROW) {
        targetCamY -= 20;
        return false;
    } else if (keyCode === DOWN_ARROW) {
        targetCamY += 20;
        return false;
    }
}

// Update text colors based on mouse position
function updateTextColors() {
    // Calculate colors based on mouse position
    var hue1 = mouseHue;
    var hue2 = (mouseHue + 120) % 360;
    var hue3 = (mouseHue + 240) % 360;

    var saturation = map(mouseY, 0, height, 60, 100);
    var lightness = map(mouseX, 0, width, 50, 80);

    // Convert HSL to CSS format
    var color1 = 'hsl(' + hue1 + ', ' + saturation + '%, ' + lightness + '%)';
    var color2 = 'hsl(' + hue2 + ', ' + saturation + '%, ' + (lightness + 10) + '%)';
    var color3 = 'hsl(' + hue3 + ', ' + saturation + '%, ' + lightness + '%)';

    // Update text elements
    var h1 = document.querySelector('h1');
    var subtitle = document.querySelector('.subtitle');
    var infoText = document.querySelector('.info-text');
    var instructions = document.querySelectorAll('.instructions li');
    var labels = document.querySelectorAll('.control-group label');

    if (h1) h1.style.color = color1;
    if (subtitle) subtitle.style.color = color2;
    if (infoText) infoText.style.color = color3;

    // Update instruction items
    for (var i = 0; i < instructions.length; i++) {
        instructions[i].style.color = color3;
    }

    // Update labels
    for (var i = 0; i < labels.length; i++) {
        labels[i].style.color = color2;
    }
}

// Responsive canvas
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

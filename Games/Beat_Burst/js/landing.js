// Beat Burst - Landing Page

document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initBeatPad();
    initScrollAnimations();
});

// Hero Canvas Animation

function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let bars = [];

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Create bars
        const barCount = Math.floor(rect.width / 8);
        bars = [];
        for (let i = 0; i < barCount; i++) {
            bars.push({
                x: i * 8,
                height: 0,
                targetHeight: 0,
                speed: 0.05 + Math.random() * 0.05,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    function animate() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear with fade effect
        ctx.fillStyle = 'rgba(9, 9, 11, 0.3)';
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() * 0.001;

        bars.forEach((bar, i) => {
            // Calculate wave-based target height
            const wave1 = Math.sin(time * 2 + bar.offset) * 0.5 + 0.5;
            const wave2 = Math.sin(time * 1.5 + i * 0.1) * 0.5 + 0.5;
            const wave3 = Math.sin(time * 3 + i * 0.05) * 0.3 + 0.7;

            bar.targetHeight = (wave1 * wave2 * wave3) * height * 0.8;

            // Smooth interpolation
            bar.height += (bar.targetHeight - bar.height) * bar.speed;

            // Create gradient
            const gradient = ctx.createLinearGradient(0, height, 0, height - bar.height);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
            gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0.3)');

            ctx.fillStyle = gradient;
            ctx.fillRect(bar.x, height - bar.height, 6, bar.height);
        });

        animationId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);
}
// Beat Pad Synth

class BeatPadSynth {
    constructor() {
        this.audioContext = null;
        this.visualizerData = [];
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
    }

    init() {
        this.canvas = document.getElementById('beat-visualizer');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.isRunning = true;
        this.animate();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    playSound(type) {
        const ctx = this.ensureAudioContext();
        const now = ctx.currentTime;

        this.addVisualImpulse(type);

        switch (type) {
            case 'kick': this.playKick(ctx, now); break;
            case 'snare': this.playSnare(ctx, now); break;
            case 'hihat': this.playHihat(ctx, now); break;
            case 'clap': this.playClap(ctx, now); break;
            case 'bass': this.playBass(ctx, now); break;
            case 'synth1': this.playSynth(ctx, now, 440); break;
            case 'synth2': this.playSynth(ctx, now, 660); break;
            case 'fx': this.playFX(ctx, now); break;
        }
    }

    playKick(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    playSnare(ctx, time) {
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(time);
        noise.stop(time + 0.2);

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);

        oscGain.gain.setValueAtTime(0.7, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    playHihat(ctx, time) {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(time);
        noise.stop(time + 0.1);
    }

    playClap(ctx, time) {
        for (let i = 0; i < 3; i++) {
            const bufferSize = ctx.sampleRate * 0.1;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);

            for (let j = 0; j < bufferSize; j++) {
                output[j] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2000;

            const gain = ctx.createGain();
            const startTime = time + i * 0.01;
            gain.gain.setValueAtTime(0.6, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(startTime);
            noise.stop(startTime + 0.15);
        }
    }

    playBass(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, time);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.3);

        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.4);
    }

    playSynth(ctx, time, freq) {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, time);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(freq * 1.005, time);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(500, time + 0.3);
        filter.Q.value = 5;

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.3);
        osc2.stop(time + 0.3);
    }

    playFX(ctx, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.5);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    addVisualImpulse(type) {
        const colors = {
            kick: '#a855f7',
            snare: '#6366f1',
            hihat: '#f59e0b',
            clap: '#ec4899',
            bass: '#a855f7',
            synth1: '#10b981',
            synth2: '#06b6d4',
            fx: '#f59e0b'
        };

        this.visualizerData.push({
            type,
            color: colors[type] || '#6366f1',
            intensity: 1,
            x: Math.random() * 0.8 + 0.1,
            created: Date.now()
        });
    }

    animate() {
        if (!this.isRunning || !this.ctx || !this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear with subtle fade
        this.ctx.fillStyle = 'rgba(24, 24, 27, 0.2)';
        this.ctx.fillRect(0, 0, width, height);

        const time = Date.now() * 0.001;

        // Draw ambient wave
        const barCount = 48;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
            const wave = Math.sin(time * 2 + i * 0.2) * 0.5 + 0.5;
            let baseHeight = wave * 20 + 5;

            // Add impulse heights
            this.visualizerData.forEach(impulse => {
                const age = (Date.now() - impulse.created) / 1000;
                if (age < 0.5) {
                    const distance = Math.abs(impulse.x - i / barCount);
                    if (distance < 0.3) {
                        baseHeight += (1 - age * 2) * (1 - distance / 0.3) * 60;
                    }
                }
            });

            const gradient = this.ctx.createLinearGradient(0, height, 0, height - baseHeight);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
            gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0.3)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(
                i * barWidth + 1,
                height - baseHeight,
                barWidth - 2,
                baseHeight,
                2
            );
            this.ctx.fill();
        }

        // Draw ripples
        this.visualizerData.forEach(impulse => {
            const age = (Date.now() - impulse.created) / 1000;
            if (age < 0.6) {
                const x = impulse.x * width;
                const radius = age * 120;
                const alpha = (1 - age / 0.6) * 0.6;

                const hex = impulse.color;
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);

                this.ctx.beginPath();
                this.ctx.arc(x, height / 2, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });

        // Cleanup old impulses
        this.visualizerData = this.visualizerData.filter(
            impulse => Date.now() - impulse.created < 600
        );

        requestAnimationFrame(() => this.animate());
    }
}

function initBeatPad() {
    const pads = document.querySelectorAll('.beat-pad');
    if (pads.length === 0) return;

    const synth = new BeatPadSynth();
    synth.init();

    // Pad click events
    pads.forEach(pad => {
        const note = pad.dataset.note;

        pad.addEventListener('mousedown', (e) => {
            e.preventDefault();
            triggerPad(pad, note, synth);
        });

        pad.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerPad(pad, note, synth);
        });
    });

    // Keyboard events
    const keyMap = {
        'q': 'kick',
        'w': 'snare',
        'e': 'hihat',
        'r': 'clap',
        'a': 'bass',
        's': 'synth1',
        'd': 'synth2',
        'f': 'fx'
    };

    const activeKeys = new Set();

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (keyMap[key] && !activeKeys.has(key)) {
            activeKeys.add(key);
            const pad = document.querySelector(`[data-key="${key.toUpperCase()}"]`);
            if (pad) {
                triggerPad(pad, keyMap[key], synth);
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        activeKeys.delete(key);
    });
}

function triggerPad(pad, note, synth) {
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 150);
    synth.playSound(note);
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

    // Observe elements
    document.querySelectorAll('.feature-card, .step-card, .info-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .feature-card.visible,
        .step-card.visible,
        .info-card.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

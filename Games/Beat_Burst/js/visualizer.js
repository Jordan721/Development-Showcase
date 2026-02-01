// Music Visualizer Module

class Visualizer {
    constructor(canvas, audioAnalyzer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audio = audioAnalyzer;
        this.animationId = null;
        this.isRunning = false;

        // Visual settings
        this.particles = [];
        this.rings = [];
        this.beatScale = 1;
        this.hue = 180;
        this.lastBass = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        this.ctx.scale(dpr, dpr);

        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate() {
        if (!this.isRunning) return;

        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    draw() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(5, 5, 8, 0.15)';
        this.ctx.fillRect(0, 0, width, height);

        if (!this.audio.isPlaying) {
            this.drawIdleState();
            return;
        }

        const frequencyData = this.audio.getFrequencyData();
        const bass = this.audio.getBassLevel();
        const mid = this.audio.getMidLevel();
        const treble = this.audio.getTrebleLevel();

        // Detect beat
        if (bass > this.lastBass * 1.3 && bass > 150) {
            this.onBeat(bass);
        }
        this.lastBass = bass * 0.9 + this.lastBass * 0.1;

        // Update beat scale
        this.beatScale += (1 - this.beatScale) * 0.1;

        // Shift hue based on audio
        this.hue = (this.hue + mid * 0.01) % 360;

        // Draw visualizations
        this.drawCircularBars(frequencyData);
        this.drawCenterCircle(bass, mid, treble);
        this.drawParticles();
        this.drawRings();
        this.drawWaveform();
    }

    drawIdleState() {
        // Gentle pulsing circle
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * 2) * 0.1 + 1;

        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 100 * pulse
        );
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 229, 0.1)');
        gradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 100 * pulse, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Idle text
        this.ctx.font = '16px Orbitron';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press play to visualize', this.centerX, this.centerY + 150);
    }

    drawCircularBars(frequencyData) {
        const barCount = 64;
        const maxRadius = Math.min(this.centerX, this.centerY) * 0.8;
        const minRadius = 80 * this.beatScale;

        for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
            const freqIndex = Math.floor((i / barCount) * frequencyData.length * 0.5);
            const value = frequencyData[freqIndex] / 255;

            const barHeight = value * (maxRadius - minRadius);
            const x1 = this.centerX + Math.cos(angle) * minRadius;
            const y1 = this.centerY + Math.sin(angle) * minRadius;
            const x2 = this.centerX + Math.cos(angle) * (minRadius + barHeight);
            const y2 = this.centerY + Math.sin(angle) * (minRadius + barHeight);

            const hue = (this.hue + i * 3) % 360;
            this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.5 + value * 0.5})`;
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }

    drawCenterCircle(bass, mid, treble) {
        const radius = 60 * this.beatScale;

        // Outer glow
        const glowGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, radius * 0.5,
            this.centerX, this.centerY, radius * 2
        );
        glowGradient.addColorStop(0, `hsla(${this.hue}, 100%, 50%, 0.3)`);
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, radius * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();

        // Main circle
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, radius
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, 1)`);
        gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 100%, 50%, 0.8)`);
        gradient.addColorStop(1, `hsla(${(this.hue + 120) % 360}, 100%, 40%, 0.6)`);

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Inner highlight
        this.ctx.beginPath();
        this.ctx.arc(this.centerX - radius * 0.2, this.centerY - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
    }

    drawWaveform() {
        const timeData = this.audio.getTimeData();
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const sliceWidth = width / timeData.length;

        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);

        for (let i = 0; i < timeData.length; i++) {
            const v = timeData[i] / 128.0;
            const y = (v * height) / 4 + height / 2;
            const x = i * sliceWidth;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.strokeStyle = `hsla(${this.hue}, 100%, 60%, 0.2)`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.radius *= 0.98;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
            this.ctx.fill();
        }
    }

    drawRings() {
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const ring = this.rings[i];

            ring.radius += ring.speed;
            ring.life -= 0.02;

            if (ring.life <= 0) {
                this.rings.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, ring.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `hsla(${ring.hue}, 100%, 60%, ${ring.life * 0.5})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }

    onBeat(intensity) {
        this.beatScale = 1.2 + (intensity / 255) * 0.3;

        // Spawn particles
        const particleCount = Math.floor(intensity / 20);
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: this.centerX,
                y: this.centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 5,
                hue: this.hue + Math.random() * 60,
                life: 1
            });
        }

        // Spawn ring
        this.rings.push({
            radius: 70,
            speed: 3 + (intensity / 255) * 5,
            hue: this.hue,
            life: 1
        });

        // Trigger beat indicator
        const beatIndicator = document.getElementById('beat-indicator');
        if (beatIndicator) {
            beatIndicator.classList.add('pulse');
            setTimeout(() => beatIndicator.classList.remove('pulse'), 100);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
        this.rings = [];
    }
}

// Export for use in other modules
window.Visualizer = Visualizer;

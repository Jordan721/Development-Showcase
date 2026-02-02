// Rhythm Game Logic Module

class RhythmGame {
    constructor(canvas, audioAnalyzer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audio = audioAnalyzer;
        this.animationId = null;
        this.isRunning = false;

        // Game settings
        this.laneCount = 4;
        this.laneWidth = 80;
        this.laneGap = 10;
        this.noteHeight = 30;
        this.noteSpeed = 400; // pixels per second
        this.hitZoneY = 0;
        this.approachTime = 2; // seconds before note reaches hit zone

        // Key mappings
        this.keyMap = {
            'd': 0, 'D': 0,
            'f': 1, 'F': 1,
            'j': 2, 'J': 2,
            'k': 3, 'K': 3
        };

        // Timing windows (in ms)
        this.timingWindows = {
            perfect: 50,
            great: 100,
            good: 150
        };

        // Scoring
        this.scoreValues = {
            perfect: 300,
            great: 200,
            good: 100,
            miss: 0
        };

        // Game state
        this.notes = [];
        this.activeNotes = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.hits = { perfect: 0, great: 0, good: 0, miss: 0 };
        this.totalNotes = 0;
        this.isPaused = false;
        this.pauseTime = 0;

        // Callbacks
        this.onScoreUpdate = null;
        this.onComboUpdate = null;
        this.onGameEnd = null;
        this.onPause = null;
        this.onResume = null;

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        // Only resize if canvas has dimensions
        if (rect.width === 0 || rect.height === 0) return;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        // Calculate hit zone position (near bottom)
        this.hitZoneY = rect.height - 100;

        // Calculate lane positions
        const totalWidth = this.laneCount * this.laneWidth + (this.laneCount - 1) * this.laneGap;
        this.laneStartX = (rect.width - totalWidth) / 2;
    }

    loadBeats(beats) {
        this.notes = beats.map((beat, index) => ({
            id: index,
            time: beat.time,
            lane: beat.lane,
            y: -this.noteHeight,
            hit: false,
            missed: false
        }));
        this.totalNotes = this.notes.length;
    }

    start() {
        this.reset();
        this.isRunning = true;

        // Add keyboard listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Remove keyboard listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.hits = { perfect: 0, great: 0, good: 0, miss: 0 };
        this.activeNotes = [];
        this.isPaused = false;

        // Reset notes
        this.notes.forEach(note => {
            note.y = -this.noteHeight;
            note.hit = false;
            note.missed = false;
        });

        this.updateUI();
    }

    pause() {
        if (!this.isRunning || this.isPaused) return;

        this.isPaused = true;
        this.pauseTime = this.audio.getCurrentTime();

        // Pause the audio
        this.audio.pause();

        // Show pause overlay
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.classList.add('active');

        if (this.onPause) this.onPause();
    }

    resume() {
        if (!this.isPaused) return;

        this.isPaused = false;

        // Hide pause overlay
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.classList.remove('active');

        // Resume audio
        this.audio.resume();

        if (this.onResume) this.onResume();
    }

    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    animate() {
        if (!this.isRunning) return;

        if (!this.isPaused) {
            this.update();
        }
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    update() {
        const currentTime = this.audio.getCurrentTime();

        // Update active notes
        this.notes.forEach(note => {
            if (note.hit || note.missed) return;

            // Calculate note position based on time
            const timeToHit = note.time - currentTime;
            note.y = this.hitZoneY - (timeToHit * this.noteSpeed);

            // Check if note should be active
            if (timeToHit <= this.approachTime && timeToHit >= -0.5) {
                if (!this.activeNotes.includes(note)) {
                    this.activeNotes.push(note);
                }
            }

            // Check for miss (note passed hit zone without being hit)
            if (timeToHit < -this.timingWindows.good / 1000) {
                note.missed = true;
                this.registerHit('miss', note.lane);
                this.removeActiveNote(note);
            }
        });

        // Check if game ended
        if (currentTime >= this.audio.getDuration() - 0.5) {
            this.endGame();
        }
    }

    draw() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        this.ctx.fillStyle = 'rgba(5, 5, 8, 0.3)';
        this.ctx.fillRect(0, 0, width, height);

        // Draw lanes
        this.drawLanes(height);

        // Draw hit zone
        this.drawHitZone();

        // Draw notes
        this.drawNotes();

        // Draw visual effects
        this.drawEffects();
    }

    drawLanes(height) {
        const canvasHeight = height || this.canvas.getBoundingClientRect().height;

        for (let i = 0; i < this.laneCount; i++) {
            const x = this.laneStartX + i * (this.laneWidth + this.laneGap);

            // Lane background gradient - more subtle
            const gradient = this.ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.02)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.06)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, 0, this.laneWidth, canvasHeight);

            // Lane borders - subtle
            this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, canvasHeight);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.laneWidth, 0);
            this.ctx.lineTo(x + this.laneWidth, canvasHeight);
            this.ctx.stroke();
        }
    }

    drawHitZone() {
        const laneColors = ['#f43f5e', '#10b981', '#f59e0b', '#06b6d4'];

        for (let i = 0; i < this.laneCount; i++) {
            const x = this.laneStartX + i * (this.laneWidth + this.laneGap);
            const color = laneColors[i];

            // Hit zone glow
            const gradient = this.ctx.createRadialGradient(
                x + this.laneWidth / 2, this.hitZoneY,
                0,
                x + this.laneWidth / 2, this.hitZoneY,
                this.laneWidth
            );
            gradient.addColorStop(0, color + '30');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.hitZoneY - 40, this.laneWidth, 80);

            // Hit zone line
            this.ctx.beginPath();
            this.ctx.roundRect(x + 8, this.hitZoneY - 6, this.laneWidth - 16, 12, 6);
            this.ctx.fillStyle = color + '50';
            this.ctx.fill();
        }
    }

    drawNotes() {
        const laneColors = ['#f43f5e', '#10b981', '#f59e0b', '#06b6d4'];

        this.activeNotes.forEach(note => {
            if (note.hit || note.missed) return;

            const x = this.laneStartX + note.lane * (this.laneWidth + this.laneGap);
            const color = laneColors[note.lane];

            // Note glow
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 15;

            // Note body
            const gradient = this.ctx.createLinearGradient(x, note.y, x + this.laneWidth, note.y);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, this.lightenColor(color, 30));
            gradient.addColorStop(1, color);

            this.ctx.beginPath();
            this.ctx.roundRect(x + 5, note.y, this.laneWidth - 10, this.noteHeight, 8);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Note highlight
            this.ctx.beginPath();
            this.ctx.roundRect(x + 10, note.y + 3, this.laneWidth - 20, 8, 4);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.fill();

            this.ctx.shadowBlur = 0;
        });
    }

    drawEffects() {
        // Get audio data for visual effects
        if (this.audio.isPlaying) {
            const bass = this.audio.getBassLevel();

            // Pulse effect on strong bass
            if (bass > 180) {
                const rect = this.canvas.getBoundingClientRect();
                this.ctx.fillStyle = `rgba(99, 102, 241, ${(bass - 180) / 255 * 0.08})`;
                this.ctx.fillRect(0, 0, rect.width, rect.height);
            }
        }
    }

    handleKeyDown(e) {
        if (!this.isRunning) return;

        // Handle Escape for pause
        if (e.key === 'Escape') {
            e.preventDefault();
            this.togglePause();
            return;
        }

        // Don't process game keys while paused
        if (this.isPaused) return;

        const lane = this.keyMap[e.key];
        if (lane === undefined) return;

        e.preventDefault();

        // Activate lane visually
        const laneElement = document.querySelector(`.lane[data-key="${e.key.toLowerCase()}"]`);
        if (laneElement) {
            laneElement.classList.add('active');
        }

        // Check for note hit
        this.checkHit(lane);
    }

    handleKeyUp(e) {
        const lane = this.keyMap[e.key];
        if (lane === undefined) return;

        // Deactivate lane visually
        const laneElement = document.querySelector(`.lane[data-key="${e.key.toLowerCase()}"]`);
        if (laneElement) {
            laneElement.classList.remove('active');
        }
    }

    checkHit(lane) {
        const currentTime = this.audio.getCurrentTime();

        // Find closest note in this lane that hasn't been hit
        let closestNote = null;
        let closestDiff = Infinity;

        this.activeNotes.forEach(note => {
            if (note.lane !== lane || note.hit || note.missed) return;

            const diff = Math.abs(note.time - currentTime) * 1000; // Convert to ms
            if (diff < closestDiff && diff < this.timingWindows.good) {
                closestNote = note;
                closestDiff = diff;
            }
        });

        if (closestNote) {
            closestNote.hit = true;
            this.removeActiveNote(closestNote);

            // Determine hit quality
            let hitType;
            if (closestDiff <= this.timingWindows.perfect) {
                hitType = 'perfect';
            } else if (closestDiff <= this.timingWindows.great) {
                hitType = 'great';
            } else {
                hitType = 'good';
            }

            this.registerHit(hitType, lane);
        }
    }

    registerHit(type, lane) {
        this.hits[type]++;

        if (type === 'miss') {
            this.combo = 0;
        } else {
            this.score += this.scoreValues[type] * (1 + Math.floor(this.combo / 10) * 0.1);
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        }

        this.showFeedback(type);
        this.updateUI();
    }

    showFeedback(type) {
        const feedback = document.getElementById('hit-feedback');
        if (!feedback) return;

        feedback.textContent = type.toUpperCase();
        feedback.className = `hit-feedback show ${type}`;

        setTimeout(() => {
            feedback.classList.remove('show');
        }, 300);
    }

    removeActiveNote(note) {
        const index = this.activeNotes.indexOf(note);
        if (index > -1) {
            this.activeNotes.splice(index, 1);
        }
    }

    updateUI() {
        const scoreEl = document.getElementById('score-value');
        const comboEl = document.getElementById('combo-value');
        const accuracyEl = document.getElementById('accuracy-value');

        if (scoreEl) scoreEl.textContent = Math.floor(this.score);
        if (comboEl) comboEl.textContent = this.combo;
        if (accuracyEl) accuracyEl.textContent = this.getAccuracy() + '%';

        if (this.onScoreUpdate) this.onScoreUpdate(this.score);
        if (this.onComboUpdate) this.onComboUpdate(this.combo);
    }

    getAccuracy() {
        const total = this.hits.perfect + this.hits.great + this.hits.good + this.hits.miss;
        if (total === 0) return 100;

        const weighted = (this.hits.perfect * 100 + this.hits.great * 75 + this.hits.good * 50) / total;
        return Math.round(weighted);
    }

    endGame() {
        this.stop();

        if (this.onGameEnd) {
            this.onGameEnd({
                score: Math.floor(this.score),
                maxCombo: this.maxCombo,
                accuracy: this.getAccuracy(),
                hits: { ...this.hits }
            });
        }
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
}

// Export for use in other modules
window.RhythmGame = RhythmGame;

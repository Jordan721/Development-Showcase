// Audio Analysis and Beat Detection Module

class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.audioBuffer = null;
        this.audioElement = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.beats = [];
        this.bpm = 120;
        this.frequencyData = null;
        this.timeData = null;
        this.onBeat = null;
        this.onEnded = null;
    }

    async init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        const bufferLength = this.analyser.frequencyBinCount;
        this.frequencyData = new Uint8Array(bufferLength);
        this.timeData = new Uint8Array(bufferLength);
    }

    async loadFile(file) {
        if (!this.audioContext) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    this.audioBuffer = await this.audioContext.decodeAudioData(e.target.result);
                    resolve(this.audioBuffer);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async analyzeBeats() {
        if (!this.audioBuffer) return [];

        const channelData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;

        // Detect beats using energy-based algorithm
        const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
        const hopSize = Math.floor(windowSize / 2);
        const energies = [];

        // Calculate energy for each window
        for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
            let energy = 0;
            for (let j = 0; j < windowSize; j++) {
                energy += channelData[i + j] * channelData[i + j];
            }
            energies.push({
                time: i / sampleRate,
                energy: energy / windowSize
            });
        }

        // Find peaks (beats)
        const beats = [];
        const threshold = this.calculateThreshold(energies);
        const minBeatInterval = 0.15; // Minimum 150ms between beats
        let lastBeatTime = -1;

        for (let i = 1; i < energies.length - 1; i++) {
            const current = energies[i].energy;
            const prev = energies[i - 1].energy;
            const next = energies[i + 1].energy;

            // Check if it's a local maximum and above threshold
            if (current > prev && current > next && current > threshold) {
                const time = energies[i].time;

                if (time - lastBeatTime > minBeatInterval) {
                    // Determine beat intensity (1-4 lanes)
                    const intensity = Math.min(4, Math.max(1, Math.floor(current / threshold)));
                    beats.push({
                        time: time,
                        intensity: intensity,
                        lane: Math.floor(Math.random() * 4) // Random lane for now
                    });
                    lastBeatTime = time;
                }
            }
        }

        // Estimate BPM
        this.bpm = this.estimateBPM(beats);

        // Assign lanes based on patterns
        this.assignLanes(beats);

        this.beats = beats;
        return beats;
    }

    calculateThreshold(energies) {
        const sorted = [...energies].sort((a, b) => b.energy - a.energy);
        // Use top 15% as threshold basis
        const topIndex = Math.floor(sorted.length * 0.15);
        return sorted[topIndex].energy * 0.5;
    }

    estimateBPM(beats) {
        if (beats.length < 4) return 120;

        const intervals = [];
        for (let i = 1; i < Math.min(beats.length, 50); i++) {
            intervals.push(beats[i].time - beats[i - 1].time);
        }

        // Get median interval
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];

        let bpm = 60 / medianInterval;

        // Adjust to reasonable BPM range (60-200)
        while (bpm < 60) bpm *= 2;
        while (bpm > 200) bpm /= 2;

        return Math.round(bpm);
    }

    assignLanes(beats) {
        // Create patterns based on beat timing
        for (let i = 0; i < beats.length; i++) {
            const beat = beats[i];

            // Simple pattern: alternate lanes with some variation
            if (beat.intensity >= 3) {
                // Strong beats: use center lanes
                beat.lane = Math.random() > 0.5 ? 1 : 2;
            } else if (beat.intensity === 2) {
                // Medium beats: use any lane
                beat.lane = Math.floor(Math.random() * 4);
            } else {
                // Weak beats: prefer outer lanes
                beat.lane = Math.random() > 0.5 ? 0 : 3;
            }

            // Avoid too many consecutive same-lane notes
            if (i > 0 && beats[i - 1].lane === beat.lane && Math.random() > 0.3) {
                beat.lane = (beat.lane + 1 + Math.floor(Math.random() * 3)) % 4;
            }
        }
    }

    createSource() {
        if (this.source) {
            this.source.disconnect();
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.source.onended = () => {
            if (this.isPlaying) {
                this.isPlaying = false;
                if (this.onEnded) this.onEnded();
            }
        };
    }

    play(startFrom = 0) {
        if (!this.audioBuffer) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.createSource();
        this.source.start(0, startFrom);
        this.startTime = this.audioContext.currentTime - startFrom;
        this.isPlaying = true;
    }

    pause() {
        if (this.source && this.isPlaying) {
            this.source.stop();
            this.pauseTime = this.getCurrentTime();
            this.isPlaying = false;
        }
    }

    resume() {
        if (this.pauseTime > 0) {
            this.play(this.pauseTime);
        }
    }

    stop() {
        if (this.source) {
            this.source.stop();
            this.isPlaying = false;
            this.pauseTime = 0;
        }
    }

    restart() {
        this.stop();
        this.play(0);
    }

    getCurrentTime() {
        if (!this.isPlaying) return this.pauseTime;
        return this.audioContext.currentTime - this.startTime;
    }

    getDuration() {
        return this.audioBuffer ? this.audioBuffer.duration : 0;
    }

    getFrequencyData() {
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.frequencyData);
        }
        return this.frequencyData;
    }

    getTimeData() {
        if (this.analyser) {
            this.analyser.getByteTimeDomainData(this.timeData);
        }
        return this.timeData;
    }

    getAverageFrequency() {
        const data = this.getFrequencyData();
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        return sum / data.length;
    }

    getBassLevel() {
        const data = this.getFrequencyData();
        let sum = 0;
        const bassRange = Math.floor(data.length * 0.1); // Lower 10% of frequencies
        for (let i = 0; i < bassRange; i++) {
            sum += data[i];
        }
        return sum / bassRange;
    }

    getMidLevel() {
        const data = this.getFrequencyData();
        let sum = 0;
        const start = Math.floor(data.length * 0.1);
        const end = Math.floor(data.length * 0.5);
        for (let i = start; i < end; i++) {
            sum += data[i];
        }
        return sum / (end - start);
    }

    getTrebleLevel() {
        const data = this.getFrequencyData();
        let sum = 0;
        const start = Math.floor(data.length * 0.5);
        for (let i = start; i < data.length; i++) {
            sum += data[i];
        }
        return sum / (data.length - start);
    }

    seekTo(time) {
        const wasPlaying = this.isPlaying;
        if (wasPlaying) {
            this.stop();
        }
        this.pauseTime = time;
        if (wasPlaying) {
            this.play(time);
        }
    }
}

// Export for use in other modules
window.AudioAnalyzer = AudioAnalyzer;

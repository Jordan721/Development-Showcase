// Main Controller - Ties everything together

class BeatBurstApp {
    constructor() {
        this.audio = new AudioAnalyzer();
        this.visualizer = null;
        this.game = null;
        this.currentFile = null;
        this.beats = [];

        // Track metadata
        this.trackMetadata = {
            title: 'Unknown Track',
            artist: 'Unknown Artist',
            album: 'Unknown Album'
        };

        // Screen elements
        this.screens = {
            upload: document.getElementById('upload-screen'),
            visualizer: document.getElementById('visualizer-screen'),
            game: document.getElementById('game-screen'),
            results: document.getElementById('results-screen')
        };

        // Initialize
        this.setupUploadScreen();
        this.setupVisualizerScreen();
        this.setupGameScreen();
        this.setupResultsScreen();
    }

    // ==================== Screen Navigation ====================

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    showLoading(show, text = 'Analyzing beats...') {
        const overlay = document.getElementById('loading-overlay');
        const loaderText = overlay.querySelector('.loader-text');
        loaderText.textContent = text;
        overlay.classList.toggle('active', show);
    }

    // ==================== Upload Screen ====================

    setupUploadScreen() {
        const uploadZone = document.getElementById('upload-zone');
        const audioInput = document.getElementById('audio-input');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const clearFile = document.getElementById('clear-file');
        const analyzeButton = document.getElementById('analyze-button');

        // Click to upload
        uploadZone.addEventListener('click', () => audioInput.click());

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) {
                this.handleFileSelect(file);
            }
        });

        // File input change
        audioInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Clear file
        clearFile.addEventListener('click', () => {
            this.currentFile = null;
            fileInfo.classList.remove('visible');
            analyzeButton.disabled = true;
            audioInput.value = '';
        });

        // Analyze button
        analyzeButton.addEventListener('click', () => this.analyzeTrack());

        // Sample tracks
        this.setupSampleTracks();
    }

    setupSampleTracks() {
        const sampleTracks = document.querySelectorAll('.sample-track');
        sampleTracks.forEach(track => {
            track.addEventListener('click', () => this.loadSampleTrack(track));
        });
    }

    async loadSampleTrack(trackElement) {
        const trackPath = trackElement.dataset.track;
        const title = trackElement.dataset.title || 'Unknown Track';
        const artist = trackElement.dataset.artist || 'Unknown Artist';
        const album = trackElement.dataset.album || 'Unknown Album';

        // Store metadata
        this.trackMetadata = { title, artist, album };

        this.showLoading(true, 'Loading sample track...');

        try {
            // Fetch the sample track
            const response = await fetch(trackPath);
            if (!response.ok) throw new Error('Failed to load track');

            const blob = await response.blob();
            const file = new File([blob], `${title}.mp3`, { type: 'audio/mpeg' });

            this.currentFile = file;

            // Update file info display
            const fileInfo = document.getElementById('file-info');
            const fileName = document.getElementById('file-name');
            const analyzeButton = document.getElementById('analyze-button');

            fileName.textContent = `${title} - ${album}`;
            fileInfo.classList.add('visible');
            analyzeButton.disabled = false;

            this.showLoading(false);

            // Auto-analyze after loading
            this.analyzeTrack();
        } catch (error) {
            console.error('Error loading sample track:', error);
            this.showLoading(false);
            alert('Error loading sample track. Please try uploading your own file.');
        }
    }

    handleFileSelect(file) {
        this.currentFile = file;
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const analyzeButton = document.getElementById('analyze-button');

        // Parse filename for metadata
        const trackTitle = this.parseTrackTitle(file.name);
        this.trackMetadata = {
            title: trackTitle,
            artist: 'Unknown Artist',
            album: 'Uploaded Track'
        };

        fileName.textContent = file.name;
        fileInfo.classList.add('visible');
        analyzeButton.disabled = false;
    }

    parseTrackTitle(filename) {
        // Remove extension
        let title = filename.replace(/\.[^/.]+$/, '');

        // Remove common prefixes like "1-10. " or "45 "
        title = title.replace(/^\d+-?\d*\.?\s*/, '');

        return title || 'Unknown Track';
    }

    async analyzeTrack() {
        if (!this.currentFile) return;

        this.showLoading(true);

        try {
            // Load and analyze audio
            await this.audio.loadFile(this.currentFile);
            this.beats = await this.audio.analyzeBeats();

            // Update track title
            document.getElementById('track-title').textContent = this.trackMetadata.title;

            this.showLoading(false);
            this.showScreen('visualizer');

            // Initialize visualizer AFTER screen is visible (so canvas has dimensions)
            setTimeout(() => {
                const visualizerCanvas = document.getElementById('visualizer-canvas');
                this.visualizer = new Visualizer(visualizerCanvas, this.audio);
                this.visualizer.start();

                // Initialize game
                const gameCanvas = document.getElementById('game-canvas');
                this.game = new RhythmGame(gameCanvas, this.audio);
                this.game.loadBeats(this.beats);
            }, 50);

        } catch (error) {
            console.error('Error analyzing track:', error);
            this.showLoading(false);
            alert('Error loading audio file. Please try a different file.');
        }
    }

    // ==================== Visualizer Screen ====================

    setupVisualizerScreen() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const restartBtn = document.getElementById('restart-btn');
        const visualizeMode = document.getElementById('visualize-mode');
        const playMode = document.getElementById('play-mode');
        const progressContainer = document.querySelector('.vis-progress-container');
        const backToUpload = document.getElementById('back-to-upload');

        // Back to upload screen
        backToUpload.addEventListener('click', () => {
            this.audio.stop();
            if (this.visualizer) this.visualizer.stop();
            this.currentFile = null;
            document.getElementById('audio-input').value = '';
            document.getElementById('file-info').classList.remove('visible');
            document.getElementById('analyze-button').disabled = true;
            this.showScreen('upload');
            this.updatePlayButton(false);
        });

        // Play/Pause
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());

        // Restart
        restartBtn.addEventListener('click', () => {
            this.audio.restart();
            this.updatePlayButton(true);
        });

        // Mode switch
        visualizeMode.addEventListener('click', () => {
            visualizeMode.classList.add('active');
            playMode.classList.remove('active');
        });

        playMode.addEventListener('click', () => this.startGame());

        // Progress bar seek
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const seekTime = percent * this.audio.getDuration();
            this.audio.seekTo(seekTime);
        });

        // Audio end callback
        this.audio.onEnded = () => {
            this.updatePlayButton(false);
        };

        // Update progress
        this.startProgressUpdate();
    }

    togglePlayPause() {
        if (this.audio.isPlaying) {
            this.audio.pause();
            this.updatePlayButton(false);
        } else {
            if (this.audio.pauseTime > 0) {
                this.audio.resume();
            } else {
                this.audio.play();
            }
            this.updatePlayButton(true);
        }
    }

    updatePlayButton(isPlaying) {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');

        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
        } else {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
    }

    startProgressUpdate() {
        const update = () => {
            const progressBar = document.getElementById('progress-bar');
            const timeDisplay = document.getElementById('time-display');

            if (this.audio.audioBuffer) {
                const current = this.audio.getCurrentTime();
                const duration = this.audio.getDuration();
                const percent = (current / duration) * 100;

                progressBar.style.width = `${Math.min(100, percent)}%`;
                timeDisplay.textContent = `${this.formatTime(current)} / ${this.formatTime(duration)}`;
            }

            requestAnimationFrame(update);
        };
        update();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ==================== Game Screen ====================

    setupGameScreen() {
        const backToVisualizer = document.getElementById('back-to-visualizer');
        const restartGame = document.getElementById('restart-game');
        const pauseBtn = document.getElementById('pause-btn');
        const resumeBtn = document.getElementById('resume-btn');
        const pauseRestartBtn = document.getElementById('pause-restart-btn');
        const pauseQuitBtn = document.getElementById('pause-quit-btn');

        backToVisualizer.addEventListener('click', () => {
            this.game.stop();
            this.audio.stop();
            this.showScreen('visualizer');
            this.updatePlayButton(false);
        });

        restartGame.addEventListener('click', () => {
            this.audio.restart();
            this.game.reset();
            this.game.start();
        });

        // Pause button
        pauseBtn.addEventListener('click', () => {
            if (this.game) this.game.pause();
        });

        // Resume button
        resumeBtn.addEventListener('click', () => {
            if (this.game) this.game.resume();
        });

        // Restart from pause
        pauseRestartBtn.addEventListener('click', () => {
            const overlay = document.getElementById('pause-overlay');
            if (overlay) overlay.classList.remove('active');
            this.audio.restart();
            this.game.reset();
            this.game.start();
        });

        // Quit from pause (back to visualizer)
        pauseQuitBtn.addEventListener('click', () => {
            const overlay = document.getElementById('pause-overlay');
            if (overlay) overlay.classList.remove('active');
            this.game.stop();
            this.audio.stop();
            this.showScreen('visualizer');
            this.updatePlayButton(false);
        });
    }

    startGame() {
        // Stop visualizer
        this.audio.stop();
        this.visualizer.stop();
        this.updatePlayButton(false);

        // Switch to game screen
        this.showScreen('game');

        // Update Now Playing card
        this.updateNowPlaying();

        // Set up game end callback
        this.game.onGameEnd = (results) => this.showResults(results);

        // Start game and audio after a short delay (let screen render first)
        setTimeout(() => {
            // Resize game canvas now that screen is visible
            this.game.resize();
            this.audio.play();
            this.game.start();
        }, 100);
    }

    updateNowPlaying() {
        const titleEl = document.getElementById('np-title');
        const artistEl = document.getElementById('np-artist');
        const albumEl = document.getElementById('np-album');

        if (titleEl) titleEl.textContent = this.trackMetadata.title;
        if (artistEl) artistEl.textContent = this.trackMetadata.artist;
        if (albumEl) albumEl.textContent = this.trackMetadata.album;
    }

    // ==================== Results Screen ====================

    setupResultsScreen() {
        const playAgain = document.getElementById('play-again');
        const newTrack = document.getElementById('new-track');

        playAgain.addEventListener('click', () => {
            this.showScreen('game');
            setTimeout(() => {
                this.audio.restart();
                this.game.reset();
                this.game.start();
            }, 500);
        });

        newTrack.addEventListener('click', () => {
            this.audio.stop();
            this.currentFile = null;
            document.getElementById('audio-input').value = '';
            document.getElementById('file-info').classList.remove('visible');
            document.getElementById('analyze-button').disabled = true;
            this.showScreen('upload');
        });
    }

    showResults(results) {
        document.getElementById('final-score').textContent = results.score.toLocaleString();
        document.getElementById('max-combo').textContent = results.maxCombo;
        document.getElementById('final-accuracy').textContent = results.accuracy + '%';
        document.getElementById('perfect-count').textContent = results.hits.perfect;
        document.getElementById('great-count').textContent = results.hits.great;
        document.getElementById('good-count').textContent = results.hits.good;
        document.getElementById('miss-count').textContent = results.hits.miss;

        this.showScreen('results');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BeatBurstApp();
});

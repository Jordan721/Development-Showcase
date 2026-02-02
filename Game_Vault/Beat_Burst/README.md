# Beat Burst

<div align="center">

![Beat Burst Logo](https://media.giphy.com/media/tqfS3mgQU28ko/giphy.gif)

### Transform Any Song Into Your Rhythm Game

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-FF6B6B?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

</div>

---

## Features

**Upload Any Music** - Drop your favorite MP3, WAV, OGG, or FLAC file

**Sample Tracks Included** - Try the game instantly with pre-loaded Nintendo tracks

**Real-Time Visualizer** - Watch your music come alive with stunning circular visuals

**Rhythm Game Mode** - Hit the beats and rack up combos with 4-lane gameplay

**Now Playing Display** - See track title, artist, and album while you play

**Beat Detection** - Automatic beat analysis creates unique gameplay for every song

**Interactive Beat Pad** - Try out drum sounds on the landing page

**Pause & Resume** - Take a break anytime with ESC key

**Score System** - Perfect, Great, Good ratings with combo multipliers

---

## Sample Tracks

Beat Burst comes with 5 pre-loaded tracks so you can jump right in:

| Track | Game |
|-------|------|
| Space Junk Road | Super Mario Galaxy |
| Battle (Purple Streamer) | Paper Mario: The Origami King |
| Never Let Up! | Mario & Luigi: Dream Team |
| God-Shattering Star (Rain) | Fire Emblem: Three Houses |
| Staff Roll | Paper Mario: The Origami King |

---

## How It Works

<div align="center">

![Music Visualizer](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXZyY2o4d3U3dXBxbTRiY2g0M3RodzZrODd6ajdrbHN4ZjZocnZyeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f5K3wWq5Ik3VC/giphy.gif)

</div>

### 1. Choose Your Track
Upload any audio file or select from the sample tracks. Beat Burst analyzes the beats automatically.

### 2. Visualize the Beat
Watch the music visualizer react to your song in real-time with:
- Circular frequency bars
- Pulsing center orb
- Particle explosions on beats
- Expanding ring effects
- Dynamic color shifting

### 3. Play the Game
Switch to game mode and test your rhythm skills! The Now Playing card shows your current track info.

<div align="center">

![Rhythm Game](https://media.giphy.com/media/l46CyxkMBFwHlJ3kk/giphy.gif)

</div>

---

## Controls

| Key | Action |
|-----|--------|
| `D` | Lane 1 (Rose) |
| `F` | Lane 2 (Emerald) |
| `J` | Lane 3 (Amber) |
| `K` | Lane 4 (Cyan) |
| `ESC` | Pause/Resume |

### Landing Page Beat Pad

| Key | Sound |
|-----|-------|
| `Q` | Kick |
| `W` | Snare |
| `E` | Hi-Hat |
| `R` | Clap |
| `A` | Bass |
| `S` | Synth |
| `D` | FX 1 |
| `F` | FX 2 |

---

## Scoring

| Rating | Timing Window | Points |
|--------|---------------|--------|
| **PERFECT** | ±50ms | 300 pts |
| **GREAT** | ±100ms | 200 pts |
| **GOOD** | ±150ms | 100 pts |
| **MISS** | >150ms | 0 pts |

### Combo System
Build up your combo for bonus points! Every 10 hits increases your score multiplier by 10%.

---

## Tech Stack

```
Beat_Burst/
├── index.html          # Landing page with beat pad
├── game.html           # Main game application
├── css/
│   ├── styles.css      # Shared base styles
│   ├── landing.css     # Landing page styles
│   └── game.css        # Game & visualizer styles
├── js/
│   ├── audio.js        # Audio analysis & beat detection
│   ├── visualizer.js   # Music visualizer
│   ├── game.js         # Rhythm game logic
│   ├── main.js         # Main controller
│   └── landing.js      # Beat pad & landing effects
└── My_picks/           # Sample music tracks
```

---

## Visual Design

The game features a modern dark theme with:
- **Floating gradient orbs** - Animated purple/cyan blurred backgrounds
- **Glassmorphism** - Frosted glass effect on cards and buttons
- **Color-coded lanes** - Rose, Emerald, Amber, and Cyan
- **Animated elements** - Pulsing buttons, glowing effects, smooth transitions

### Color Palette
- Primary: Indigo (#6366f1)
- Purple: (#a855f7)
- Cyan: (#06b6d4)
- Emerald: (#10b981)
- Rose: (#f43f5e)
- Amber: (#f59e0b)

---

## Getting Started

1. Open `index.html` in a modern browser
2. Explore the interactive beat pad on the landing page
3. Click **Start Playing**
4. Choose a sample track or upload your own music
5. Preview in the visualizer, then click **Play Game**
6. Hit those beats!

---

## Tips

> **Pro Tip:** Songs with clear, strong beats work best for gameplay!

> **Keyboard Position:** Place your fingers on D-F and J-K for optimal play

> **Timing:** Watch the notes approach the hit zone at the bottom

> **Volume:** Make sure your audio is on to hear the music!

---

## Credits

<div align="center">

Created by **Jordan**

![Music GIF](https://media.giphy.com/media/4oMoIbIQrvCjm/giphy.gif)

*Made with vanilla JavaScript, Web Audio API, and Canvas*

</div>

---

<div align="center">

### Ready to burst some beats?

**[Play Beat Burst Now!](index.html)**

</div>

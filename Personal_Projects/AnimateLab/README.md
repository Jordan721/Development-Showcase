# AnimateLab

> **An interactive playground for discovering how animations work in the browser.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## Why I Built This

I wanted to show just how many different types of animation you can pull off with code - CSS transitions, keyframes, transforms, canvas rendering, SVG morphing, spring physics, elastic collisions, and more. There's a huge range of techniques out there, but most tutorials only cover one at a time and you never really get to *feel* the differences between them.

So I built a single interactive page where every technique gets its own full-width section. You can hover, click, drag, scroll, tweak sliders, change colors, and watch the animation respond instantly. The code panel updates in real time too, so you're not just seeing the animation - you're seeing exactly what makes it tick.

The whole point is to make animation feel less intimidating. Instead of reading through documentation and guessing what `cubic-bezier(0.68, -0.55, 0.27, 1.55)` actually looks like, you just drag a slider and see it happen. Every section is its own mini sandbox.

---

## What's Inside

### CSS Fundamentals
| Technique | What It Does | Interaction |
|-----------|-------------|-------------|
| **CSS Transitions** | Smooth property changes with customizable duration and easing | Hover to preview |
| **Keyframe Animations** | Multi-step bounce & spin with iteration and direction controls | Click to play |
| **CSS Transforms** | Rotate, scale, and skew with adjustable angles | Hover to preview |
| **Hover Effects** | Glow, lift, and color shift with intensity controls | Hover to preview |
| **Typing Effect** | Typewriter-style text animation with adjustable speed, text, and color | Click to replay |
| **3D Flip Card** | CSS 3D card flip with adjustable duration, axis, and front color | Hover to flip |

### Advanced CSS
| Technique | What It Does | Interaction |
|-----------|-------------|-------------|
| **CSS Variables Animation** | Dynamic theming with live hue, speed, and size controls | Auto-plays |
| **Scroll-Driven Animation** | Progress bar and reveal effects linked to scroll position | Scroll inside |
| **Gradient Animation** | Smoothly shifting background gradients with angle and color controls | Auto-plays |

### JavaScript & Canvas
| Technique | What It Does | Interaction |
|-----------|-------------|-------------|
| **requestAnimationFrame** | Smooth orbital motion with trail effects | Auto-plays |
| **Web Animations API** | Programmatic keyframes with duration and easing | Click to play |
| **Canvas Particles** | Particle system with connections, burst on click | Auto-plays + click to burst |
| **Spring Physics** | Drag-and-release spring simulation with stiffness and damping | Drag the ball |
| **Elastic Collision** | Bouncing balls with gravity, wall bounce, and ball-to-ball collision physics | Click to add balls |

### SVG & Advanced
| Technique | What It Does | Interaction |
|-----------|-------------|-------------|
| **SVG Morphing** | Shape interpolation between circle, star, square, and heart | Click to morph |
| **Parallax Layers** | Multi-layer depth effect that follows your mouse | Move mouse over |

---

## Design

- **Dark minimal theme** with a near-black background and soft violet accents
- **Full-width sections** - each animation gets its own horizontal row with preview and controls side by side
- **Animated canvas header** with a connected particle network
- **Stats panel** slides in from the left showing animation counts and breakdowns
- **Responsive** - stacks vertically on mobile

---

## How to Use

1. **Open** `index.html` in any modern browser
2. **Explore** each section - hover, click, drag, or scroll depending on the technique
3. **Tweak** the sliders, dropdowns, and color pickers to change the animation in real time
4. **Watch the code** - hit "Show Code" to see the live code update as you adjust controls
5. **Edit the code** - modify it directly in the textarea and hit "Apply" to see your changes
6. **Reset** any section back to defaults with the Reset button

---

## Tech Stack

- **Pure HTML, CSS, and JavaScript** - no frameworks, no dependencies, no build step
- **Canvas API** for particle effects, orbital motion, elastic collisions, and the header animation
- **SVG** for shape morphing
- **Web Animations API** for programmatic keyframes
- **CSS Custom Properties** for dynamic theming
- **CSS 3D Transforms** for flip card perspective

---

## Project Structure

```
AnimateLab/
├── index.html      Page structure & 16 animation sections
├── styles.css      Dark minimal theme & responsive layout
├── script.js       Animation logic, controls, canvas header & live code preview
├── favicon.svg     Site icon
└── README.md       You are here
```

---

## Features at a Glance

- **Live Controls** - sliders, dropdowns, and color pickers that update animations instantly
- **Real-Time Code Preview** - see the actual CSS/JS change as you experiment
- **Editable Code** - modify the code directly and apply your changes live
- **One Panel at a Time** - opening a code panel auto-closes any other open panel
- **Animated Header** - connected particle network on canvas
- **Stats Panel** - slide-out panel showing technique counts
- **Responsive** - works on desktop, tablet, and mobile
- **Interactive Physics** - drag spring balls, click to spawn collision balls
- **Zero Dependencies** - just open the HTML file and go

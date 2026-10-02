# Development Showcase

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-a855f7?style=for-the-badge)](https://jordan721.github.io/Development-Showcase/)
[![Portfolio](https://img.shields.io/badge/My-Portfolio-7c3aed?style=for-the-badge)](https://jordan721.github.io/Jordan_Alexis/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/jordan-alexis/)

**A collection of projects I've built over the years — from academic coursework to personal experiments — all in one place to showcase what I can do.**

</div>

---

## About

This is my **Development Showcase** — a dedicated landing page that links to every website and interactive project I've created over the years. Each project is organized into its own section with tech stack badges and platform indicators (Desktop/Mobile) so you can see at a glance what was used and where it runs.

The homepage is a **creative playground** with floating category portals, neon colors, animated orbit rings, a scrolling banner, and a different visual identity for each project section. Explore **25 projects and collections** across five worlds, built with HTML, CSS, and JavaScript.

---

## Features

- **Floating Portals** — Animated shapes in the hero jump to personal projects, professional work, coursework, games, and art.
- **Five Creative Worlds** — An experiment lab with tilted cards, a control room with window-style panels, a launchpad with curved cards, an arcade, and an abstract art space.
- **Project Search** — Search project names, descriptions, platform labels, and technologies without reloading the page.
- **Technology Filters** — Choose one technology at a time. Search and the selected technology work together to narrow the collection.
- **Live Result Counts** — Project counts update with filtering, and sections without matches are hidden.
- **No Results State** — Reset search and filters with “Show everything.”
- **Surprise Me** — Highlights and focuses a random project from the current results. If there are no results, it resets the filters before choosing a project.
- **Motion Controls** — Pause or resume the floating portals, orbit rings, and scrolling banner. The homepage respects the browser's reduced-motion preference; the manual toggle applies to the current page session.
- **Platform and Tech Badges** — Project cards show Desktop/Mobile compatibility and their technologies.
- **Accessible Navigation** — Skip-to-projects link, visible keyboard focus, labeled controls, and announced result counts.
- **Responsive Layouts** — Project grids and section layouts adapt to smaller screens.
- **Repository and Social Links** — Direct links to GitHub commit history, the portfolio, LinkedIn, and Linktree.

---

## Project Sections

### Personal Projects

**Experiment lab · 9 projects** — Independent projects and personal work:

| Project | Tech | Platform |
|---------|------|----------|
| Cash Compass | HTML, CSS, JS, Chart.js | Desktop, Mobile |
| Console Chronicles | SQL.js, Chart.js, JS | Desktop |
| Bagel Byte Academy | HTML, CSS, JS, Three.js | Desktop |
| Bagely Bytes Programming | HTML, CSS, JS | Desktop, Mobile |
| ThreatAware | HTML, CSS, JS | Desktop, Mobile |
| Algorithm Arena | HTML, CSS, JS, Chart.js | Desktop, Mobile |
| AnimateLab | HTML, CSS, JS, Canvas, SVG | Desktop, Mobile |
| Endpoint Explorer | HTML, CSS, JS, Fetch API | Desktop |
| PipelineTrack | HTML, CSS, JS, localStorage | Desktop |

### Professional Projects

**Workbench · 5 projects** — Internships, bootcamps, and professional experience:

| Project | Tech | Platform |
|---------|------|----------|
| Dark Mode Showcase | HTML, CSS, JS | Desktop, Mobile |
| One Heck Of A Sandwich | HTML, CSS, JS | Desktop, Mobile |
| The Midnight Archive | HTML, CSS, JS | Desktop, Mobile |
| Data Pipeline Engine | HTML, CSS, JS | Desktop |
| Year Up United Bootcamp | Full Stack, Java, Spring Boot | Desktop |

### Academic Projects

**Launchpad · 6 projects** — Coursework and class assignments:

| Project | Tech | Platform |
|---------|------|----------|
| Run Like A G.U.R.L | HTML, CSS, JS | Desktop, Mobile |
| Social Com's Final | HTML, CSS, JS | Desktop, Mobile |
| Orbit Control | p5.js, Arduino, JS | Desktop |
| Dimensional Playground | A-Frame, WebVR, Three.js, Web Audio | Desktop, Mobile |
| The One Day Triathlon | HTML, CSS, JS, Responsive Design | Desktop, Mobile |
| Prospect Park Project | Wix, Web Design | Desktop, Mobile |

### Game Vault

**Arcade · 1 collection** — Games, mockups, and interactive ideas remade for the web:

| Project | Tech | Platform |
|---------|------|----------|
| Game Vault (hub) | HTML, CSS, JS, Canvas | Desktop |

### Art & Design

**Creative studio · 4 projects** — Digital art, design projects, and creative work:

| Project | Tech | Platform |
|---------|------|----------|
| Art & Design Portfolio | HTML, CSS, JS, Graphic Design | Desktop, Mobile |
| Art History Montage | HTML, CSS, JS | Desktop, Mobile |
| Human Rights Poster | HTML, CSS, JS | Desktop, Mobile |
| Watt's Gaming Brand Guide | HTML, CSS, JS, InDesign | Desktop, Mobile |

---

## Built With

```
HTML5        — Structure & semantics
CSS3         — Responsive layouts, shapes, animations, CSS variables
JavaScript   — Search, technology filters, random discovery, motion controls
Google Fonts — DM Sans & Space Grotesk
```

No frameworks or build tools — vanilla web technologies only.

---

## Quick Start

```bash
git clone https://github.com/Jordan721/Development-Showcase.git
cd Development-Showcase

# Open index.html directly, or use a local server:
npx serve
# or
python -m http.server 8000
```

---

## Project Structure

```
Development-Showcase/
├── index.html                 # Creative playground homepage
├── showcase.css               # Active homepage styles and animations
├── showcase.js                # Search, filters, discovery, motion controls
├── styles.css                 # Previous homepage stylesheet (not loaded by index.html)
├── script.js                  # Previous homepage script (not loaded by index.html)
├── favicon.svg                # Site icon (JA initials)
├── Academic_Projects/
│   ├── RunLikeAG.U.R.L/
│   ├── Social_Com's_Final/
│   ├── Orbit_Control/
│   ├── Dimensional_Playground/
│   └── One_Day_Triathlon_Website/
├── Professional_Projects/
│   ├── DarkModes/
│   ├── One_Heck_Of_A_Sandwich_Web_Edition/
│   ├── Neighborhood-Library/
│   └── Data_Pipeline/
├── Personal_Projects/
│   ├── Cash-Compass/
│   ├── Console_Chronicles/
│   ├── Bagel_Byte_Academy/
│   ├── Bagely_Bytes_Programming/
│   ├── Threat_Aware/
│   ├── Algorithm_Arena/
│   ├── AnimateLab/
│   ├── Endpoint_Explorer/
│   └── PipelineTrack/
├── Game_Vault/
│   ├── index.html
│   ├── Beat_Burst/
│   ├── Idea_Space/
│   ├── RuinMaker/
│   ├── The_Unfair_Game_Web_Ed/
│   ├── THW/
│   └── TypeboundDungeon/
├── Art/
│   ├── index.html
│   ├── art-history.html
│   ├── art-history.css
│   ├── human-rights.html
│   ├── human-rights.css
│   ├── brand-guide.html
│   ├── brand-guide.css
│   └── Pics/
└── README.md
```

The Prospect Park project and Year Up United Bootcamp collection link to external sites; they are not local project folders.

---

## Connect

- **Portfolio**: [jordan721.github.io/Jordan_Alexis](https://jordan721.github.io/Jordan_Alexis/)
- **LinkedIn**: [linkedin.com/in/jordan-alexis](https://www.linkedin.com/in/jordan-alexis/)
- **Linktree**: [linktr.ee/Jordan_Alexis_](https://linktr.ee/Jordan_Alexis_)
- **GitHub**: [github.com/Jordan721](https://github.com/Jordan721)

---

<div align="center">

**Made by Jordan Alexis**

[![Star This Repo](https://img.shields.io/github/stars/Jordan721/Development-Showcase?style=social)](https://github.com/Jordan721/Development-Showcase)

</div>

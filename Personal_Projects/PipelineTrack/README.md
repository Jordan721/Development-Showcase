# PipelineTrack

A personal job search companion built to take the chaos out of hunting for work in tech. Track every application, see how well your skills match each role, polish your resume, and get pointed toward certifications and courses that close your gaps — all in one place, no account required.

> **Note:** PipelineTrack is built specifically for tech industry job searches (software engineering, data analytics, IT, etc.). Support for other industries may be added in the future.

---

## Why I Built This

Breaking into tech is overwhelming. Whether you're targeting data analytics, software engineering, IT support, or something in between, you end up juggling dozens of tabs, spreadsheets, and sticky notes just to remember where you applied and what happened next.

I built PipelineTrack to solve that for myself. I needed one tool that could:

- Keep tabs on every job I applied to without losing track of the details
- Tell me honestly how well my current skill set matches a job description
- Show me exactly what I'm missing and where I can learn it
- Help me put my best foot forward with a polished resume
- Work offline, right in my browser, with no sign-up or backend

If you're in a similar spot — searching for your first role or making a pivot in tech — this tool was built with you in mind too.

---

## Features

### Dashboard
A snapshot of your entire job search at a glance. See how many jobs you've tracked, how many applications are active, how many are in progress, and whether any offers are on the table. The dashboard surfaces your top skill gaps and your top matched skills — skills that appear in your tracked jobs show up green with a job count so you can see at a glance where you're already competitive.

### Job Board (Kanban)
A visual pipeline with six stages: **Saved, Applied, Screening, Interview, Offer,** and **Archived**. Each job card shows the role, company, and a color-coded fit score so you can see at a glance which opportunities are the strongest match. Archived jobs can be toggled on or off to keep your board clean. Each job can store a **salary/pay range** and **date posted** alongside the standard details.

**Drag and drop** — grab any card and drag it into a different column to instantly update its stage. The target column highlights as you hover over it. A red **×** button appears on each card when you hover to delete it immediately without opening the detail view.

### Fit Analysis
Paste a job description when adding a job and PipelineTrack will cross-reference it against the skills in your profile. You get a percentage score, a list of your matched skills (green), and the skills you're missing (red). The score updates automatically whenever you edit your profile. The job detail view also shows salary and date posted at a glance, with a quick link to [Cash Compass](https://jordan721.github.io/Development-Showcase/Personal_Projects/Cash-Compass/index.html) to check your financial runway alongside any offer.

### My Profile
Add your skills and tag each one as Beginner, Intermediate, or Expert. Track your **Certifications & Degrees** separately — certificates, associate's, bachelor's, master's, PhD, bootcamp completions, and licenses — each labeled by credential type. Write a short resume summary for your own reference. A skill coverage chart shows how frequently each of your skills appears across all the jobs you're tracking.

### Learning Hub
Built on your aggregate skill gaps across every tracked job, the Learning Hub recommends courses and certifications mapped to the skills you need most. Resources span platforms like Coursera, Google, AWS, LinkedIn Learning, Udemy, and more, with estimated time commitments included. Bookmark the ones you plan to pursue and filter to see only your saved picks.

### Resume Hub
A dedicated workspace for getting your resume and portfolio ready:

- **Resume Parser** — Upload your resume as a PDF, Word (.docx), or plain text file, or paste the text directly. The parser scans the content for recognized tech skills and cross-references them against your profile, showing what you already have and letting you import anything new in one click.
- **Portfolio / GitHub Scanner** — Paste a GitHub profile URL (`github.com/username`) or a GitHub Pages portfolio URL (`username.github.io/repo`) to scan your public repos for languages and topics. Skills detected across your repositories are shown the same way as the resume parser — matched, new, or already in your profile — and can be imported directly. When a specific repo URL is provided, PipelineTrack also pulls the full language breakdown for that project for more accurate results.
- **Writing Polish** — Run your resume text through a rule-based writing checker that flags passive voice, filler words, weak phrases, and vague language. Each issue comes with a suggestion and a quality score so you can see improvement over time.
- **Resources & AI Tools** — A curated collection of tools and platforms organized by category: AI writing assistants, resume builders, portfolio hosts, job & salary research, and financial planning. Includes a link to [Cash Compass](https://jordan721.github.io/Development-Showcase/Personal_Projects/Cash-Compass/index.html) for tracking your budget and financial runway during your search.

---

## Tech Stack

| Layer | Details |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, CSS Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Browser localStorage (no backend, no account) |
| PDF Parsing | PDF.js v3.11.174 (via CDN) |
| Word Parsing | Mammoth.js v1.6.0 (via CDN) |
| Portfolio Scanning | GitHub REST API (public, no auth required) |
| Fonts | Inter via Google Fonts |

No frameworks, no build tools, no server required. Open `index.html` in any modern browser and it works. The GitHub portfolio scanner uses the public GitHub API — no token needed for public profiles.

---

## Getting Started

1. Clone or download this folder
2. Open `index.html` in your browser
3. Go to **My Profile**, add your skills and any certifications or degrees you hold
4. Go to **Job Board**, click **+ Add Job**, paste a job description, and optionally add salary and date posted
5. Click any job card to see your fit score and skill breakdown
6. Check the **Learning Hub** to see what to learn next
7. Head to **Resume Hub** to upload your resume or scan your GitHub portfolio, check your writing, and explore tools

All data is saved to your browser's localStorage. Nothing is sent anywhere.

---

## Roadmap Ideas

- Export job list to CSV
- Application deadline reminders
- Notes timeline per job (log each touchpoint)
- Resume version tagging per application
- Support for non-tech industry job searches

---

*Built as part of a personal portfolio while actively searching for opportunities in tech.*

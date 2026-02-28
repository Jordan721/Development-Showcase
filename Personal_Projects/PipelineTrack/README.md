# PipelineTrack

A personal job search companion built to take the chaos out of hunting for work in tech. Track every application, measure your skill fit, polish your resume, and close your gaps — all in one place, no account required.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Site-%2300bfa5?style=for-the-badge)](https://jordan721.github.io/Development-Showcase/Personal_Projects/PipelineTrack/index.html)
![No Sign-up](https://img.shields.io/badge/No%20Sign--up-Required-4ade80?style=for-the-badge)
![Works Offline](https://img.shields.io/badge/Works-Offline-60a5fa?style=for-the-badge)
![100% Private](https://img.shields.io/badge/100%25-Private-a78bfa?style=for-the-badge)
![Light & Dark Mode](https://img.shields.io/badge/Light%20%26%20Dark-Mode-f59e0b?style=for-the-badge)

> **Note:** PipelineTrack is built for tech industry job searches (software engineering, data analytics, IT, etc.). Support for other industries may be added in the future.

---

## ⚡ At a Glance

| Feature | What it does |
|---|---|
| 📋 Job Board | Kanban pipeline to track every application by stage |
| 🎯 Fit Analysis | Scores your skill match against any job description |
| 🧠 Learning Hub | Course recommendations based on your skill gaps |
| 📄 Resume Hub | Parse your resume, scan GitHub, and polish your writing |
| 👤 My Profile | Skills, certifications, resume summary, and saved links |
| 💾 Data Backup | Export and import your data across devices |

---

## 💡 Why I Built This

Breaking into tech is overwhelming — dozens of tabs, spreadsheets, and sticky notes just to track where you applied and what happened next.

I built PipelineTrack to solve that. One tool to:

- Track every job without losing the details
- Show honestly how well your skills match a role
- Surface exactly what you're missing and where to learn it
- Help you put your best resume forward
- Work entirely in the browser — no sign-up, no backend
- Switch between light and dark mode to suit your preference

---

## 🔧 Features

### 📊 Dashboard
At-a-glance view of your entire job search.

- Six stat cards in a 2-row grid: **Total Tracked, Applied, In Progress, Offers, Declined, Avg Fit Score**
- Top skill gaps and top matched skills across all your jobs
- **Job Activity calendar** — visualize when you added jobs by Week, Month, Year, or All Time
- Click any day or month tile to see a popup of every job added in that period

---

### 📋 Job Board (Kanban)
A visual pipeline with seven stages: **Saved → Applied → Screening → Interview → Offer → Declined → Archived**

- **Declined** — for roles where the company said no; tracked separately from Archived so you can see your rejection rate in the dashboard
- **Archived** — for roles you chose to remove from your active view
- Color-coded fit score on every card
- Drag cards between columns to update their stage
- Hover a card to reveal a quick-delete **×** button
- Toggle Archived / Declined columns on or off to keep the board clean
- Filter by **This Week / This Month / This Year / All Time**

Each job stores:

| Field | Options |
|---|---|
| Seniority | Internship, Junior, Mid-Level, Senior, Lead, Staff |
| Job Type | Full-time, Part-time, Contract, Freelance, Internship, Temporary, Apprenticeship |
| Work Type | Remote, On-site, Hybrid |
| Other | Department, Salary, Date Posted, Benefits, Notes, Job URL |

Seniority, job type, and work type each appear as color-coded badges in the detail view. Benefits are automatically parsed into labeled chips — health insurance, 401k, PTO, equity, and more — rather than showing raw pasted text.

Clicking **Edit** on a job opens the edit form with a **← Back** button to return to the detail view without losing your place.

---

### 🎯 Fit Analysis
Paste a job description when adding a job and PipelineTrack scores your match automatically.

- **Fit score** — percentage based on your profile skills vs. the job description
- **Matched skills** — shown in green
- **Skill gaps** — shown in red
- Score recalculates whenever you update your profile
- Quick link to [Cash Compass](https://jordan721.github.io/Development-Showcase/Personal_Projects/Cash-Compass/index.html) to check your financial runway alongside any offer

---

### 👤 My Profile
Build the foundation for your fit scores and recommendations.

- **Skills** — add skills one at a time or paste a whole block (comma or newline-separated) using the **Bulk** button; each skill is tagged as Beginner, Intermediate, or Expert; click the level badge to cycle it in place without removing the skill; if you have more than 10, the list collapses with a **Show X more** toggle to keep the page tidy; **Clear all** removes every skill at once with a confirmation prompt; duplicates are automatically skipped whether adding one or many
- **Certifications & Degrees** — track certificates, degrees, bootcamps, and licenses by credential type
- **Resume Summary** — a short bio for your own reference
- **Skill Coverage chart** — see how often each of your skills appears across tracked jobs
- **Data Backup** — export all your data to a `.json` file and import it on any other device or browser; the filename and a confirmation message appear under the buttons after each action
- **Clear All Jobs** — wipe all tracked jobs in one click (with confirmation) to start fresh
- **Your Links** — save your LinkedIn, GitHub, and Portfolio URLs locally for quick access

---

### 🧠 Learning Hub
Course and certification recommendations built from your skill gaps.

- Pulls from Coursera, Google, AWS, LinkedIn Learning, Udemy, and more
- Each resource includes an estimated time commitment
- Bookmark picks and filter to see only your saved resources

---

### 📄 Resume Hub
A workspace for getting your resume and portfolio in shape.

- **Resume Parser** — upload a PDF, Word (.docx), or plain text file, or paste directly. Detected skills are cross-referenced with your profile and can be imported in one click.
- **GitHub / Portfolio Scanner** — paste a GitHub profile or GitHub Pages URL to scan public repos for languages and topics. Import detected skills the same way.
- **Writing Polish** — flags passive voice, filler words, weak phrases, and vague language with suggestions and a quality score.
- **Resources & AI Tools** — curated tools for writing, resume building, portfolio hosting, job research, and financial planning.

---

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![localStorage](https://img.shields.io/badge/Storage-localStorage-34d399?style=flat-square)
![PDF.js](https://img.shields.io/badge/PDF.js-v3.11.174-red?style=flat-square)
![Mammoth.js](https://img.shields.io/badge/Mammoth.js-v1.6.0-orange?style=flat-square)
![GitHub API](https://img.shields.io/badge/GitHub-REST%20API-181717?style=flat-square&logo=github&logoColor=white)
![Google Fonts](https://img.shields.io/badge/Font-Inter-4285F4?style=flat-square&logo=google&logoColor=white)

No frameworks, no build tools, no server. Open `index.html` in any modern browser and it works.

**File structure:**
```
PipelineTrack/
├── index.html
├── css/
│   ├── base.css        # variables, reset, layout, buttons, forms
│   ├── dashboard.css   # stat cards, calendar views
│   ├── board.css       # kanban columns, swimlane, job cards
│   ├── modals.css      # modals, profile, learning hub, resume hub
│   └── features.css    # deadline banner, notes timeline
└── javascript/
    ├── app.js          # core app logic
    └── features.js     # deadline reminders, notes timeline, resume tagging
```

---

## 🚀 Getting Started

1. Clone or download this folder
2. Open `index.html` in your browser
3. Go to **My Profile** — add your skills and any certifications
4. Go to **Job Board** → **+ Add Job** — paste a job description and fill in department, seniority, job type, work type, and other optional fields
5. Click any job card to see your fit score and skill breakdown
6. Check the **Learning Hub** to see what to learn next
7. Use **Resume Hub** to parse your resume, scan your GitHub, check your writing, and explore tools

All data is saved to your browser's localStorage. Nothing is sent anywhere. Use the ☀️ / 🌙 button in the top bar to switch between light and dark mode — your preference is remembered.

---

## 🗺️ Roadmap Ideas

- Export job list to CSV
- Support for non-tech industry job searches

---

*Built as part of a personal portfolio while actively searching for opportunities in tech.*

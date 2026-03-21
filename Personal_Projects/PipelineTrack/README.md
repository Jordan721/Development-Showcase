# PipelineTrack

A personal job search companion built to take the chaos out of hunting for work. Track every application, measure your skill fit, polish your resume, and close your gaps — all in one place, no account required.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Site-%2300bfa5?style=for-the-badge)](https://jordan721.github.io/Development-Showcase/Personal_Projects/PipelineTrack/index.html)
![No Sign-up](https://img.shields.io/badge/No%20Sign--up-Required-4ade80?style=for-the-badge)
![Works Offline](https://img.shields.io/badge/Works-Offline-60a5fa?style=for-the-badge)
![100% Private](https://img.shields.io/badge/100%25-Private-a78bfa?style=for-the-badge)
![Themes](https://img.shields.io/badge/5%20Themes-Dark%20%7C%20Light%20%7C%20Midnight%20%7C%20Sunset%20%7C%20Ocean-f59e0b?style=for-the-badge)

> **Supported industries:** Tech (Software Engineering, Data, IT) · Business (Business Operations, Financial Operations, Project Management) · Customer Experience (Banking, Customer Success)

---

## ⚡ At a Glance

| Feature | What it does |
|---|---|
| ◈ Dashboard | Stats, clickable streak timeline, pipeline health, conversion funnel, weekly velocity, upcoming deadlines, skill gaps, and weekly summary |
| 📋 Job Board | 8-stage kanban with columns, priority matrix, table, and timeline views — search and filter built in |
| 📅 Calendar & Activity | Month/week/year view of job events, deadlines, follow-ups, and job fairs |
| 🤝 Network | Track recruiters, hiring managers, and referrals with follow-up reminders |
| 🎯 Goals | Set weekly/monthly targets and track live progress against your job board data |
| 📊 Analytics | KPIs, funnel, response rates, skill gaps, fit distribution, and breakdowns |
| 👤 My Profile | Skills, certifications, email templates, skill coverage chart, and data backup |
| 📄 Resume Hub | Parse your resume, scan GitHub, polish your writing, and store resume versions in the vault |
| 🧠 Learning Hub | Course recommendations matched to your skill gaps |

---

## 💡 Why I Built This

Job searching is overwhelming — dozens of tabs, spreadsheets, and sticky notes just to track where you applied and what happened next.

I built PipelineTrack to solve that. One tool to track every job, score your skill fit honestly, surface what you're missing and where to learn it, and put your best resume forward — entirely in the browser, no sign-up, no backend.

---

## 🚀 Getting Started

1. Clone or download this folder and open `index.html` in any modern browser
2. Follow the **getting started guide** that opens automatically — navigate steps with `←` / `→` arrow keys or the `‹ ›` buttons beside the dots, or reopen it anytime with the **?** button
3. Go to **My Profile** and add your skills (this powers fit scoring)
4. Go to **Job Board → + Add Job** — click **⚡ Paste full listing** to auto-fill fields from the raw posting, or fill in manually; paste the description in Job Info for an instant fit score
5. Click any job card to see your fit score and skill breakdown
6. Check **Learning Hub** to see what to learn next, **Analytics** for charts, and **Goals** to set weekly targets

All data is saved to your browser's localStorage — nothing is sent anywhere. Use the ☀️ / 🌙 toggle to switch themes, **M / S / O** for Midnight, Sunset, or Ocean color themes, and **◑** for color-blind mode. Press `Ctrl+Shift+K` to open the command palette at any time.

---

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![localStorage](https://img.shields.io/badge/Storage-localStorage-34d399?style=flat-square)
![PDF.js](https://img.shields.io/badge/PDF.js-v3.11.174-red?style=flat-square)
![Mammoth.js](https://img.shields.io/badge/Mammoth.js-v1.6.0-orange?style=flat-square)
![Flatpickr](https://img.shields.io/badge/Flatpickr-Date%20Picker-f59e0b?style=flat-square)
![GitHub API](https://img.shields.io/badge/GitHub-REST%20API-181717?style=flat-square&logo=github&logoColor=white)
![Google Fonts](https://img.shields.io/badge/Font-Inter-4285F4?style=flat-square&logo=google&logoColor=white)

No frameworks, no build tools, no server. Open `index.html` in any modern browser and it works.

<details>
<summary>File structure</summary>

```
PipelineTrack/
├── index.html
├── css/
│   ├── base.css            # variables, reset, layout, buttons, forms
│   ├── dashboard.css       # stat cards, velocity chart, deadlines, pipeline health
│   ├── board.css           # kanban columns, priority matrix, table, timeline views, job cards
│   ├── modals.css          # modals, profile, learning hub, resume hub
│   ├── features.css        # deadline banner, notes timeline
│   ├── views.css           # calendar, contacts, analytics, goals views
│   ├── fun.css             # extra themes (Midnight, Sunset, Ocean), confetti, streak, card flair
│   ├── onboarding.css      # first-run onboarding modal styles
│   └── ux-enhancements.css # command palette, hover cards, tooltips, color-blind mode, print, empty states
└── javascript/
    ├── data.js             # static data: KNOWN_SKILLS, LEARNING, RESOURCES, WRITING_RULES (tech)
    ├── data-industries.js  # extends KNOWN_SKILLS & LEARNING for Business, Finance, PM, Banking, CX
    ├── state.js            # app state, localStorage save/load, export/import
    ├── utils.js            # shared helpers, fit analysis, navigation
    ├── views-dashboard.js  # dashboard stats, funnel, velocity, deadlines, time-in-stage
    ├── views-board.js      # kanban board, table, timeline views, job detail & add/edit modals
    ├── views-profile.js    # profile, skills, certifications, coverage chart
    ├── views-resume.js     # learning hub and resume hub
    ├── views-calendar.js   # calendar view (month/week/year)
    ├── views-contacts.js   # network & contacts view
    ├── views-analytics.js  # analytics view (KPIs, funnel, charts)
    ├── views-goals.js      # goals view (live-counted progress)
    ├── app.js              # event wiring and app init
    ├── features.js         # deadline reminders, notes timeline, resume versioning
    ├── animations.js       # UI animations and transitions
    ├── fun.js              # confetti, milestone toasts, streak counter, dashboard nudge
    ├── onboarding.js       # first-run guide, step navigation, reopen via ? button
    └── ux-enhancements.js  # command palette, keyboard shortcuts, hover preview, tooltips, color-blind mode, getting started checklist
```

</details>

---

## 📖 Full Feature Reference

<details>
<summary><strong>◈ Dashboard</strong></summary>

- **Stat cards** — Total Tracked (with `avg. X/wk · X/mo · X/yr` pace), Applied, In Progress, Offers, Not Selected, Avg Fit Score
- **Streak & nudge bar** — daily application streak pill; click it to open an animated timeline of every job you've applied to, grouped by date and color-coded by stage, that pans to your most recent application; a clickable **⚠ Pipeline Health** warning appears if any Applied/Screening/Interview jobs haven't moved in 14+ days
- **Conversion Funnel** — Applied → Screening → Interview → Offer with counts and % conversion from each previous stage
- **Weekly Velocity** — animated 6-week bar chart showing jobs added per week
- **Upcoming Deadlines** — jobs with deadlines in the next 7 days, color-coded by urgency (yellow ≤2 days, red = today); overdue banner if any have passed; click to open the job
- **Avg. Time in Stage** — average days since added per active stage, color-coded green/yellow/red
- **This Week summary** — jobs added, in-progress count, overdue follow-ups, and weekly goal progress
- **Top Skill Gaps** — click any tag to see jobs missing that skill
- **Top Skills** — matched skills show ✓ job count and are clickable
- **Pipeline Overview** — click any stage bar to see all jobs at that stage
- Recent applications list — click to open the full job detail

</details>

<details>
<summary><strong>📋 Job Board</strong></summary>

Nine stages: **Saved → Applied → Screening → Interview → Offer → Not Selected → Declined → Ghosted → Archived**

- **Not Selected** — company didn't pick you; date auto-stamped on the card and detail view
- **Declined** — you chose not to pursue; **Ghosted** — never heard back
- **Four layout modes:**
  - **Columns** — classic kanban with collapsible columns (state persists across refreshes); drag cards onto collapsed columns to move them — the column highlights with a dashed outline on hover to confirm the drop
  - **Priority Matrix** — 2×2 grid by fit score vs. urgency (Act Now 🔥, Plan Ahead ⭐, Quick Apply ⚡, Low Priority 📋); Act Now quadrant has a subtle green glow; long role names truncate cleanly
  - **Table** — sortable spreadsheet with sticky header, per-stage colored left-border accents, and color-coded stage dropdowns
  - **Timeline** — Gantt-style bars color-coded by stage with a stage legend and color dot per row label
- Drag cards between columns · hover to reveal quick-delete **×** and **📍 pin** buttons · toggle inactive stages on/off
- **Pinned jobs** — pin any job to keep it at the top of every view; pinned cards show a blue accent border
- **Deadline urgency glow** — cards with imminent deadlines get a color-coded border (yellow ≤7d, orange ≤2d, red = today/overdue)
- **Sticky filter bar** — search and filter controls stay fixed at the top while you scroll
- **☐ Select (Bulk Actions)** — toggle select mode to pick multiple cards (or hit **Select All** to grab every visible card at once), then move stage, assign a Resume Vault resume, export a CSV, or delete in one shot; deletions include a 5-second undo toast
- Filter by period · search by role/company/location · filter dropdowns for stage, work type (Remote / Hybrid / On-site / Remote–Hybrid / Hybrid–On-site / Flexible), seniority
- **⊜ Compare Jobs** — select 2–3 jobs to compare fit, salary, stage, skills, and benefits side by side

**Each job stores:** role, company, department, location, URL, salary (auto-formatted), seniority, job type, work type, date posted, date applied, application deadline, stage, resume used (linked to Resume Vault), benefits (parsed into chips), company notes, job description, cover letter, personal notes.

**Add/Edit form tabs:** Details · Job Info · Application

**⚡ Smart Paste** — click "Paste full listing" at the top of the Details tab and drop in the raw job posting. The parser extracts role, company, location, salary, work type, job type, and seniority; fills each field with a `✦ Auto-filled` tag so you know what was guessed; strips the metadata header from the description so the Job Info tab only shows the actual body of the listing. Fields are editable — the tag disappears the moment you change a value. *(Parsing is best-effort — it catches the most common formats but may miss things depending on how the listing is structured. Always review the filled fields before saving.)*

**Milestone logging** — moving to Screening, Interview, or Offer opens a modal to log date, time, type, round, and notes. Milestones appear as a color-coded Application Timeline strip in the job detail; each is editable via ✎.

**Fit Analysis** (in job detail):
- Fit score % based on profile skills vs. job description (certifications also factor in)
- Matched skills (green) and gaps (red) highlighted directly in the description text
- **+** on any skill gap instantly adds it to your profile (as Beginner) and moves it to matched — fit score updates live
- **−** on any matched skill moves it back to gaps — useful for correcting false positives
- × dismiss button on any tag to remove it entirely — score updates instantly
- Linked contacts from Network appear inline
- Quick link to Cash Compass to check financial runway alongside an offer

</details>

<details>
<summary><strong>📅 Calendar & Activity</strong></summary>

- Toggle **Month / Week / Year** layouts with prev/next navigation
- Four event types: job added (teal), deadline (red), contact follow-up (yellow), job fair (purple)
- **+ Add Event** — log job fairs with format, venue, meeting link, time, and notes; Join button appears on events with a link
- **Upcoming strip** — next 7 days of events at a glance
- **Job Activity** — counts for Today, This Week, This Month, This Year, All Time

</details>

<details>
<summary><strong>🤝 Network & Contacts</strong></summary>

- Add contacts with name, company, role, type, email, phone, LinkedIn, linked job, last contact date, next follow-up, and notes
- Stat strip showing totals, follow-ups due, and count by type
- Search, filter by type, sort by name/company/most recent
- Overdue follow-ups highlighted; dates appear in Calendar
- Linked contacts appear inside the job's detail modal

</details>

<details>
<summary><strong>🎯 Goals</strong></summary>

- Goal types: Applications Sent, Screenings, Interviews, Offers, Responses, Jobs Researched, Contacts Added
- Weekly or monthly period; live progress bar + status label (Complete / On Track / Behind / Not Started)
- Summary strip with mini progress rings · quick-add preset buttons

</details>

<details>
<summary><strong>📊 Analytics</strong></summary>

- **7 KPI cards** — Tracked, Applied, In Progress, Offers, Not Selected, Avg Fit, Response Rate (color-coded green/yellow/red)
- **Application Funnel** — conversion rates Applied → Offer; click any row to see those jobs
- **Response Rate by Stage** — stacked bar breakdown
- **Applications Over Time** — weekly (8 weeks) or monthly (12 months); click any column to drill in
- **Top Companies** · **Skill Gaps** · **Fit Score Distribution** · **Work Type / Job Type / Seniority** breakdowns
- All charts clickable, animated, and filterable by period

</details>

<details>
<summary><strong>👤 My Profile</strong></summary>

- **Skills** — add individually or bulk-paste; search bar filters your skills in real time — if the skill isn't found a prompt lets you add it instantly or jump to the Learning Hub; level badges (Expert / Intermediate / Beginner) cycle on click; duplicates auto-skipped; casing auto-corrected on save and on load (e.g. `javascript` → `JavaScript`); Skill Coverage chart shows frequency across tracked jobs
- **Certifications, Degrees & Licenses** — optional descriptions feed directly into fit scoring; inline edit via ✎
- **Email Templates** — Thank-You, Follow-Up, Withdrawal, Custom; load any template into a job's cover letter
- **Data Backup** — JSON export/import (merges by ID); CSV export/import (merges by role + company)
- **Your Links** — LinkedIn, GitHub, Portfolio with one-click open and copy

</details>

<details>
<summary><strong>📄 Resume Hub</strong></summary>

- **Resume Vault** — upload PDF, .docx, or .txt resumes; view in-browser, download, rename, or delete anytime; persists across sessions and included in JSON backups
- **Resume Parser** — PDF, .docx, plain text, or paste; detected skills importable in one click
- **GitHub / Portfolio Scanner** — scan public repos for languages and topics
- **Writing Polish** — flags passive voice, filler words, and weak language with a quality score
- **Resources & AI Tools** — curated links for writing, resume building, job research, and financial planning

</details>

<details>
<summary><strong>🧠 Learning Hub</strong></summary>

- Course and certification recommendations pulled from your skill gaps
- Sources: Coursera, Google, AWS, LinkedIn Learning, Udemy, and more
- Each resource shows estimated time commitment; bookmark picks and filter to saved only

</details>

<details>
<summary><strong>⌨ Keyboard Shortcuts & Command Palette</strong></summary>

| Key | Action |
|---|---|
| `Ctrl+Shift+K` | Open command palette |
| `N` | Open Add Job form |
| `E` | Open job picker — search by role, company, location, stage, seniority, job type, work type, or salary; click any result to edit |
| `/` | Focus the board search bar |
| `Escape` | Close any open modal |
| `1` / `2` / `3` | Switch tabs in Add / Edit Job modal |
| `←` / `→` | Navigate onboarding steps (while guide is open) |

**Command palette** — search views, trigger actions, or jump to any job by name or company. Navigate with `↑ ↓`, confirm with `Enter`.

</details>

<details>
<summary><strong>🤖 Smart Auto-fill</strong></summary>

**Seniority** — inferred from title keywords (`Senior`, `Lead`, `Jr.`), level codes (`L3–L7`, `SDE I/II/III`), years-of-experience phrases, and responsibility language. Never overwrites a value you set manually.

**Department** — detected across 13 departments (Engineering, Data, Design, Product, Marketing, Sales, Finance, HR, Legal, Operations, Customer Success, Security, Research) from the job title and description.

**Work Type** — Remote / Hybrid / On-site / Remote–Hybrid / Hybrid–On-site / Flexible detected from the description. Hybrid wins if the word appears anywhere.

All three show an amber **✦ Auto-filled** badge so you always know the app set it, not you. Clearing any field manually removes the badge instantly.

</details>

<details>
<summary><strong>🎨 Other Features</strong></summary>

- **Job Card Hover Preview** — float preview with salary, stage, work type, deadline, and skill counts after ~0.5s hover
- **Fit Score Tooltip** — hover any fit badge to see matched count and gap count
- **Keyword Highlight** — matched skills highlighted green, gaps red, directly in the job description; × on any tag to dismiss false positives
- **Undo Deletion** — 5-second undo toast after deleting a job or skill; bulk deletions also undoable
- **Weekly Recap Modal** — appears automatically on Monday mornings with last week's application count, avg fit score, and pipeline progress
- **Back to Top** — ↑ button fades in when you scroll past 300px; click to smooth-scroll back
- **Skeleton flash** — views pulse once on switch to signal they're loading
- **Empty state illustrations** — inline SVG art for all empty states (no jobs, no results, no timeline entries, etc.)
- **Custom Date Picker** — all date fields use Flatpickr for a styled calendar that matches the app theme; selected dates display as `Mar 20, 2025` and are stored as `YYYY-MM-DD`; "Pick a date" placeholder shown when empty
- **Custom Select Dropdowns** — all dropdowns use a custom chevron arrow, hover border, and consistent font — no browser default styling
- **Linked Contacts** — contacts tied to a job appear inline in the job detail modal
- **Thank-You Tracking** — check "Thank-you sent" in milestone modals; ✓ shows in the Application Timeline
- **Getting Started Checklist** — progress bar on first use: add skills → add job → get fit score → visit Learning Hub
- **Color-Blind Mode** — ◑ toggle switches red/green to orange/blue
- **Print Summary** — `Cmd/Ctrl+P` or command palette prints a clean Analytics page

</details>

---

## 🗺️ Roadmap Ideas

- Support for additional industries beyond current coverage

---

## 📄 License

© 2026 Jordan. All Rights Reserved.

This project is publicly viewable for portfolio purposes only. You may not copy, use, modify, or distribute any part of this code without explicit written permission from the author.

To request permission, open an issue or reach out via GitHub.

---

*Built as part of a personal portfolio while actively searching for opportunities in tech.*

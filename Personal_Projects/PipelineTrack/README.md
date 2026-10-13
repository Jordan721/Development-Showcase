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
| 📋 Job Board | 9-stage kanban with columns, action queue, table, timeline, and map views — search and filter built in |
| 📅 Calendar & Activity | Month/week/year and Agenda views, draggable dates, detailed day views, upcoming agenda, and five recent jobs |
| 🤝 Network | Contact cards, due follow-ups, and quick actions to record conversations |
| 🎯 Goals | Weekly/monthly targets with live progress, calendar-based pace, action buttons, recorded history, and a 28-day activity heatmap |
| 📊 Analytics | KPIs, pipeline and ranking bars, an activity area chart, and donut charts with clickable legends |
| 👤 My Profile | Skills, credential progress, email templates, skill coverage chart, and data backup |
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
3. Go to **My Profile** and add your skills, plus any certifications, degrees, licenses, diplomas, or bootcamps you have finished or are working toward
4. Go to **Job Board → + Add Job** — click **⚡ Paste full listing** to auto-fill fields from the raw posting, or fill in manually; paste the description in Job Info for an instant fit score
5. Click any job card to see your fit score and skill breakdown
6. Check **Learning Hub** to see what to learn next and **Analytics** to explore trends; click time periods or donut legends to see matching jobs
7. In **Goals**, set a weekly or monthly target, check days remaining and the suggested daily pace, and use the action button to add a job/contact or review your pipeline. History starts recording when you use the updated app; the activity heatmap shows jobs and contacts added over the last 28 days

All data is saved to your browser's localStorage — nothing is sent anywhere. Use the ☀️ / 🌙 toggle to switch light/dark themes, **M / S / O** for Midnight, Sunset, or Ocean color themes, **✦** to turn the theme-change animation on/off, and **◑** for color-blind mode. Press `Ctrl+Shift+K` to open the command palette at any time.

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

<details>
<summary>File structure</summary>

```
PipelineTrack/
├── index.html
├── css/
│   ├── base.css            # variables, reset, layout, buttons, forms
│   ├── dashboard.css       # stat cards, velocity chart, deadlines, pipeline health
│   ├── board.css           # kanban columns, action queue, table, timeline views, job cards
│   ├── modals.css          # modals, profile, learning hub, resume hub
│   ├── features.css        # deadline banner, notes timeline
│   ├── animations.css      # view, modal, card, calendar, compare, and theme transition effects
│   ├── views.css           # calendar, contacts, analytics, goals views
│   ├── calendar-details.css # calendar dragging, job type colors, shared department badges, recent jobs, day details
│   ├── fun.css             # extra themes (Midnight, Sunset, Ocean), confetti, streak, card flair
│   ├── onboarding.css      # first-run onboarding modal styles
│   └── ux-enhancements.css # command palette, hover cards, tooltips, motion toggle, color-blind mode, print, empty states
└── javascript/
    ├── data.js             # static data: KNOWN_SKILLS, LEARNING, RESOURCES, WRITING_RULES (tech)
    ├── data-industries.js  # extends KNOWN_SKILLS & LEARNING for Business, Finance, PM, Banking, CX
    ├── state.js            # app state, localStorage save/load, export/import
    ├── utils.js            # shared helpers, fit analysis, navigation
    ├── job-departments.js  # shared department icons, theme-aware accents, and role classification
    ├── views-dashboard.js  # dashboard stats, funnel, velocity, deadlines, time-in-stage
    ├── views-board.js      # kanban board, table, timeline views, job detail & add/edit modals
    ├── views-profile.js    # profile, skills, credential tracker, coverage chart
    ├── views-resume.js     # learning hub and resume hub
    ├── views-calendar.js   # month/week/year/agenda views, date dragging, day details, recent jobs
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
- **Five layout modes:**
  - **Columns** — classic kanban with collapsible columns (state persists across refreshes); drag cards onto collapsed columns to move them — the column highlights with a dashed outline on hover to confirm the drop
  - **Action Queue** — Apply next, Follow up, Prepare for interviews, and Review offers; closest dates first until you save a custom order by dragging. Pinned jobs stay first. Drag between groups to update the stage, with Undo; entering Prepare sets Screening, and entering Completed & on hold sets Archived. Existing screening/interview stages are preserved when reordering within Prepare. Applications without a follow-up date use a seven-day reminder.
  - **Table** — sortable spreadsheet with sticky header, per-stage colored left-border accents, and color-coded stage dropdowns
  - **Timeline** — Gantt-style bars color-coded by stage with a stage legend and color dot per row label
  - **Map** — interactive map (OpenStreetMap + Nominatim, no API key) with color-coded pins per stage; jobs with multiple locations separated by `;` or `,` get a pin for each city; coords cached after first geocode so future loads are instant; click any pin to open the job detail
- Drag cards between columns · hover to reveal quick-delete **×** and **📍 pin** buttons · toggle inactive stages on/off
- **Pinned jobs** — pin any job to keep it at the top of every view; pinned cards show a blue accent border
- **Deadline urgency glow** — cards with imminent deadlines get a color-coded border (yellow ≤7d, orange ≤2d, red = today/overdue)
- **Sticky filter bar** — search and filter controls stay fixed at the top while you scroll
- **☐ Select (Bulk Actions)** — toggle select mode to pick multiple cards (or hit **Select All** to grab every visible card at once), then move stage, assign a Resume Vault resume, export a CSV, or delete in one shot; deletions include a 5-second undo toast
- **Action Queue selection** — in Select mode, click cards or use Enter/Space to toggle checkmarks. Dragging is disabled until you exit selection; Move to stage applies to the selected jobs.
- Filter by period · search by role/company/location · filter dropdowns for stage, work type (Remote / Hybrid / On-site / Remote–Hybrid / Hybrid–On-site / Flexible), seniority
- **⊜ Compare Jobs** — select 2–3 jobs to compare fit, salary, stage, skills, and benefits side by side

**Each job stores:** role, company, department, location, URL, job source, salary (auto-formatted), seniority, job type, work type, date posted, date applied, application deadline, stage, resume used (linked to Resume Vault), benefits (parsed into chips), company notes, job description, cover letter, personal notes.

**Add/Edit form tabs:** Details · Job Info · Application

- **Details:** position, location, pay, seniority, job type, and work type. Only role and company are required.
- **Job Info:** description for fit analysis, plus collapsible benefits and company notes.
- **Application:** posting link, job source, stage, dates, resume used, notes, and a collapsible cover letter. Optional sections open automatically when editing existing content; Save and Cancel stay visible while the form scrolls.

**Job source detection** — posting links automatically identify LinkedIn (including `lnkd.in`), ZipRecruiter, Indeed, Glassdoor, Monster, Dice, Wellfound, Handshake, and USAJOBS. Unrecognized or invalid links show **Other**; an empty link leaves the source blank. Detection uses the link's domain, without opening the posting or following redirects. Existing jobs with no source are filled on the next app load, and imported jobs are checked too. You can override the source (for example, **Referral**); manual values are preserved. Automatically detected values update when the link changes. Job source appears in job details and is included in JSON backups and the main CSV export/import.

**Previous application notice** — entering the same company and title as another tracked job shows its status, application date when available, and a **View entry** button. Matching ignores capitalization and extra spaces, and editing excludes the current job. The notice distinguishes saved roles from previous applications and still lets you save a new opening with the same title.

**⚡ Smart Paste / Job Posting Analyzer** — click "Paste full listing" at the top of the Details tab and drop in the raw job posting. The parser extracts role, company, location, salary, work type, job type, seniority, hybrid days, and duration; fills each field with a `✦ Auto-filled` tag so you know what was guessed; strips the metadata header from the description so the Job Info tab only shows the actual body of the listing. It also scores posting quality, estimates application effort, surfaces required/preferred skills, logistics, benefits, culture signals, red flags, and resume tailoring prompts. Saved jobs keep role profile, Job Fit, Posting Quality, and red-flag data for detail views and exports. Fields are editable — the tag disappears the moment you change a value. *(Parsing is best-effort — it catches the most common formats but may miss things depending on how the listing is structured. Always review the filled fields before saving.)*

**Milestone logging** — moving to Screening, Interview, or Offer opens a modal to log date, time, type, round, and notes. Milestones appear as a color-coded Application Timeline strip in the job detail; each is editable via ✎.

**Fit Analysis** (in job detail):
- Role-specific Skill Fit % based on profile skills vs. job description, with different weights for Software Engineering, Data / Analytics, IT / Support, Project / Product, and Customer / Banking roles (certifications also factor in)
- Job Fit % combines skill fit, posting quality, and red-flag penalties
- Posting Quality % and red-flag chips flag missing salary, vague work model, schedule pressure, unpaid/equity-only wording, hype-heavy language, and unrealistic entry-level requirements
- Matched skills (green) and gaps (red) highlighted directly in the description text
- **+** on any skill gap instantly adds it to your profile (as Beginner) and moves it to matched — fit score updates live
- **−** on any matched skill moves it back to gaps — useful for correcting false positives
- × dismiss button on any tag to remove it entirely — score updates instantly
- Linked contacts from Network appear inline
- Quick link to Cash Compass to check financial runway alongside an offer

</details>

<details>
<summary><strong>📅 Calendar & Activity</strong></summary>

- Toggle **Month / Week / Year / Agenda** layouts with prev/next navigation
- Five event categories: jobs, deadlines, interviews/screenings, contact follow-ups, and custom events. Filter by category; job-related card colors identify employment type, with department icons and text labels for context.
- **+ Add Event** — log job fairs with format, venue, meeting link, time, and notes; Join button appears on events with a link
- **Upcoming strip** — next 7 days of events at a glance
- **Agenda view** — every matching item in the selected month, grouped by date; switching between Month and Agenda preserves the month and event filter.
- **Compact cards** — company, role, status, and employment type; month cells show two cards and a **+ more** button for the full day. Employment-type colors and department icons follow the active theme.
- **Drag dates** — in Month or Week, drag cards to another day to update the displayed date: application date (or date added if no application date), deadline, screening, interview, contact follow-up, or custom event. Times and stages stay unchanged; Undo restores the previous date.
- **Day details** — click a day to see its items, available times, job status/type/work arrangement/location, and contact or event notes. Open jobs, edit contacts, join linked events, or add an event with the day prefilled; empty days work too.
- **Recent Jobs sidebar** — the five most recently added jobs beside Upcoming Agenda; click to open details. On narrow screens the sidebar stacks below the calendar.

</details>

<details>
<summary><strong>🤝 Network & Contacts</strong></summary>

- Add contacts with name, company, role, type, email, phone, LinkedIn, linked job, last contact date, next follow-up, and notes
- Stat strip showing totals, follow-ups due, and count by type
- Search, filter by type, sort by name/company/most recent
- Overdue follow-ups highlighted; dates appear in Calendar
- **Needs attention** — due and overdue follow-ups appear together above the contact cards.
- **Mark contacted** — records today's local date and clears a follow-up if it is due; future follow-ups remain. Use Edit to set the next reminder.
- Initial avatars, improved contact cards, keyboard focus, and separate empty states for an empty network and searches with no matches
- Linked contacts appear inside the job's detail modal

</details>

<details>
<summary><strong>🎯 Goals</strong></summary>

- Goal types: Applications Sent, Screenings, Interviews, Offers, Responses, Jobs Researched, Contacts Added
- Weekly or monthly period; live progress bar + status label (Complete / On Track / Behind / Not Started)
- Summary strip with mini progress rings · quick-add preset buttons
- **Calendar-based pace** — status compares progress with elapsed calendar days, rather than a fixed percentage; cards show how much is left, days remaining (including today), and the daily pace needed to finish. Weeks start on Sunday
- **Next actions** — add an application, research a saved job, add a contact, or review the pipeline directly from a goal card
- **Goal History** — completed periods show their last recorded progress and target. Recording starts with the updated app; earlier periods are not reconstructed. Up to 24 snapshots are retained per goal, with the 12 most recent completed entries shown for the selected goals
- **Activity heatmap** — 28 days of jobs and contacts added, with daily counts on hover; this measures additions, not stage changes
- Progress uses each job's date added and current stage, or each contact's date added. History captures progress when data is saved or Goals is opened; it is not a log of the dates interviews or offers happened

</details>

<details>
<summary><strong>📊 Analytics</strong></summary>

- **7 KPI cards** — Tracked, Applied, Interviews, Offers, Not Selected, Avg Fit, Response Rate (color-coded green/yellow/red)
- **Current Pipeline** — stage counts from Applied through Offer; click a row to see its jobs
- **Response Rate by Stage** — separate comparison bars with percentages and job counts, based on all tracked jobs outside Saved; click a row to explore
- **Applications Over Time** — an area chart of opportunities added, weekly (8 weeks) or monthly (12 months); click a period button beneath the chart to see matching jobs
- **Top Companies** and **Skill Gaps** — ranking bars with clear labels and counts; skill gaps open matching jobs
- **Fit Score Distribution** and **Work Type / Job Type / Seniority** — donut charts with counts, percentages, and keyboard-accessible legends; click a legend item to explore its jobs
- Filter Analytics by All Time, This Year, This Month, or This Week; cards and chart content adapt to the available space

</details>

<details>
<summary><strong>👤 My Profile</strong></summary>

- **Skills** — add individually or bulk-paste; search bar filters your skills in real time — if the skill isn't found a prompt lets you add it instantly or jump to the Learning Hub; level badges (Expert / Intermediate / Beginner) cycle on click; duplicates auto-skipped; casing auto-corrected on save and on load (e.g. `javascript` → `JavaScript`); Skill Coverage chart shows frequency across tracked jobs
- **Credential Tracker** — track certifications, degrees, diplomas, bootcamps, and licenses by status (Planned / In Progress / Completed), school or issuer, start date, target or completed date, progress %, and notes; descriptions still feed into fit scoring
- **Email Templates** — Thank-You, Follow-Up, Withdrawal, Custom; load any template into a job's cover letter
- **Data Backup** — JSON export/import (merges by ID); CSV export/import (merges by role + company)
- **Your Links** — LinkedIn, GitHub, Portfolio with one-click open and copy

</details>

<details>
<summary><strong>📄 Resume Hub</strong></summary>

- **Resume Vault** — upload PDF, .docx, or .txt resumes; view in-browser, download, rename, or delete anytime; drag the ⠿ handle to reorder; persists across sessions and included in JSON backups
- **Resume Review** — click Review on any vaulted resume to get a scored analysis (0–100) across sections, writing quality, action verbs, quantifiable achievements, resume length, and skills gap vs. your tracked jobs; each finding has an "I'll fix it" button to track what you've addressed
- **Resume Parser** — PDF, .docx, plain text, or paste; detected skills importable in one click
- **GitHub / Portfolio Scanner** — scan public repos for languages and topics
- **Writing Polish** — flags passive voice, filler words, and weak language with a quality score
- **Resources & AI Tools** — curated links for writing, resume building, job research, and financial planning

</details>

<details>
<summary><strong>🧠 Learning Hub</strong></summary>

- Course and certification recommendations pulled from your skill gaps; save the ones you choose, then track progress toward the credential in My Profile
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

**Department** — detected across 14 departments (Engineering, Data, Design, Product, Marketing, Sales, Finance, HR / People, Legal, IT Operations, Operations, Customer Success, Security, Research) from the job title and description.

**Work Type** — Remote / Hybrid / On-site / Remote–Hybrid / Hybrid–On-site / Flexible detected from the description. Hybrid wins if the word appears anywhere.

All three show an amber **✦ Auto-filled** badge so you always know the app set it, not you. Clearing any field manually removes the badge instantly.

</details>

<details>
<summary><strong>🎨 Other Features</strong></summary>

- **Job Card Hover Preview** — float preview with salary, stage, work type, deadline, and skill counts after ~0.5s hover
- **Department icons** — shared colored SVG badges across board cards/tables, dashboard job lists, calendar, job details, comparisons, map results, job pickers, and hover previews. Software roles get a code icon; Data and Security take precedence over broad Engineering inference. Manually entered departments are respected; unknown departments keep their label with a general icon. Accents adapt to theme and color-blind palette changes.
- **Fit Score Tooltip** — hover any fit badge to see matched count and gap count
- **Keyword Highlight** — matched skills highlighted green, gaps red, directly in the job description; × on any tag to dismiss false positives
- **Undo Deletion** — 5-second undo toast after deleting a job or skill; bulk deletions also undoable
- **Weekly Recap Modal** — appears automatically on Monday mornings with last week's application count, avg fit score, and pipeline progress
- **Back to Top** — ↑ button fades in when you scroll past 300px; click to smooth-scroll back
- **Skeleton flash** — views pulse once on switch to signal they're loading
- **Theme Change Animation** — theme switches get a soft accent sweep; use **✦** to turn it off/on, and `prefers-reduced-motion` is respected
- **Empty state illustrations** — inline SVG art for all empty states (no jobs, no results, no timeline entries, etc.)
- **Custom Select Dropdowns** — all dropdowns use a custom chevron arrow, hover border, and consistent font — no browser default styling
- **Linked Contacts** — contacts tied to a job appear inline in the job detail modal
- **Thank-You Tracking** — check "Thank-you sent" in milestone modals; ✓ shows in the Application Timeline
- **Getting Started Checklist** — progress bar on first use: add profile skills/credentials → add job → get fit score → visit Learning Hub
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

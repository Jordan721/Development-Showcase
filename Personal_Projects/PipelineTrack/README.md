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
| ◈ Dashboard | At-a-glance stats, streak, skill gaps, pipeline overview, and this week's summary |
| 📋 Job Board | 8-stage kanban pipeline (including Ghosted) with columns, swimlane, table, and timeline views — search and filter built in |
| 📅 Calendar & Activity | Month/week/year view of job events, deadlines, follow-up dates, and job fairs — plus a job activity history |
| 🤝 Network | Track recruiters, hiring managers, and referrals with follow-up reminders |
| 🎯 Goals | Set weekly/monthly targets and track live progress against your job board data |
| 📊 Analytics | KPIs, application funnel, response rates, skill gaps, and breakdowns |
| 👤 My Profile | Skills, certifications, resume summary, email templates, and data backup |
| 📄 Resume Hub | Parse your resume, scan GitHub, and polish your writing |
| 🧠 Learning Hub | Course recommendations based on your skill gaps |

---

## 💡 Why I Built This

Job searching is overwhelming — dozens of tabs, spreadsheets, and sticky notes just to track where you applied and what happened next.

I built PipelineTrack to solve that. One tool to:

- Track every job without losing the details
- Show honestly how well your skills match a role
- Surface exactly what you're missing and where to learn it
- Help you put your best resume forward
- Work entirely in the browser — no sign-up, no backend
- Switch between light, dark, Midnight, Sunset, and Ocean themes to suit your preference
- Work across multiple fields — tech, business, finance, project management, banking, and customer success

---

## 🔧 Features

### 📊 Dashboard
At-a-glance view of your entire job search.

- Six stat cards in a 2-row grid: **Total Tracked, Applied, In Progress, Offers, Declined, Avg Fit Score**
- **Streak & nudge bar** — shows your current daily application streak and a contextual motivational message based on your progress
- **This Week summary** — jobs added, in-progress count, overdue follow-ups, and weekly goal progress at a glance
- **Top Skill Gaps** — click any gap tag to see which jobs are missing that skill
- **Top Skills** — matched skills (showing ✓ job count) are clickable to see the jobs they matched against
- **Pipeline Overview** — click any stage bar to see all jobs in that stage
- Recent applications list — click any entry to open the full job detail

---

### 📋 Job Board
A visual pipeline with eight stages: **Saved → Applied → Screening → Interview → Offer → Declined → Ghosted → Archived**

- **Declined** — for roles where the company said no; tracked separately so you can see your rejection rate
- **Ghosted** — for roles where you never heard back; distinct from Declined so you can track non-responses separately
- **Archived** — for roles you chose to remove from your active view
- Four layout modes: **Columns** (classic kanban), **Swimlane** (horizontal rows), **Table** (sortable spreadsheet view), **Timeline** (Gantt-style bars showing how long each job has been in your pipeline, color-coded by stage)
- Drag cards between columns to update their stage
- Hover a card to reveal a quick-delete **×** button
- Toggle Archived / Declined / Ghosted columns on or off to keep the board clean
- Filter by **This Week / This Month / This Year / All Time**
- **Search bar** — filter by role, company, or location in real time
- **Filter dropdowns** — narrow by stage, work type, and seniority
- **Table sort** — click any column header or use the sort dropdown to sort by role, company, fit score, or date added
- **⊜ Compare Jobs** — select 2–3 jobs to compare fit score, salary, stage, skills, and benefits side by side

Each job stores:

| Field | Options |
|---|---|
| Seniority | Internship, Junior, Mid-Level, Senior, Lead, Staff |
| Job Type | Full-time, Part-time, Contract, Freelance, Internship, Temporary, Apprenticeship |
| Work Type | Remote, On-site, Hybrid |
| Other | Department, Salary, Date Posted, Date Applied, Benefits, Company Notes, Notes, Job URL, Cover Letter |

Seniority, job type, and work type each appear as color-coded badges in the detail view. Benefits are automatically parsed into labeled chips — health insurance, 401k, PTO, equity, and more — rather than showing raw pasted text. **Company Notes** is a dedicated field for information about the company itself (culture, size, funding, tech stack) — separate from the job description and your personal notes. **Salary** is automatically formatted — type `80k`, `10k - 100k`, or `150000` and it displays as `$80,000`, `$10,000 – $100,000`, or `$150,000`.

The **Add / Edit Job** form is organized into three tabs to keep it compact:

- **Details** — role, company, department, location, URL, salary, date posted, date applied, stage, seniority, job type, and work type
- **Job Info** — job description (used for fit analysis), benefits, and company notes side by side
- **Application** — cover letter, personal notes, and a template loader to paste any saved email template

**Cover Letter** is stored per job so you can draft or paste a tailored letter directly alongside the listing without leaving the app.

Clicking **Edit** on a job opens the edit form with a **← Back** button to return to the detail view without losing your place.

When a job moves to **Screening**, **Interview**, or **Offer**, a milestone modal appears automatically to log the details:

| Stage | Fields |
|---|---|
| Screening | Date, time, type (Phone / Video / In-person), notes, thank-you sent checkbox |
| Interview | Date, time, round (1st–Final), type (Phone / Video / Panel / Technical / In-person), notes, thank-you sent checkbox |
| Offer | Salary offered, deadline to respond, notes, thank-you sent checkbox |

Logged milestones appear as a color-coded **Application Timeline** strip inside the job detail modal. Each milestone can be edited at any time via the ✎ button. The modal can be skipped — the stage change always sticks regardless.

The job detail also shows **Fit Analysis** inline:

- **Fit score** — percentage based on your profile skills vs. the job description; also factors in skills mentioned in your certification and license descriptions
- **Matched skills** (green) and **skill gaps** (red) — each tag has a **×** dismiss button to remove false positives; the fit score and highlights update instantly
- Matched/missing keywords are **highlighted directly in the job description** — green for matched, red for gaps
- **Linked contacts** — any Network contacts tied to this job appear inline without switching views
- Quick link to [Cash Compass](https://jordan721.github.io/Development-Showcase/Personal_Projects/Cash-Compass/index.html) to check your financial runway alongside any offer

---

### 📅 Calendar & Activity
A full calendar combined with your job activity history — all in one view.

- Toggle between **Month**, **Week**, and **Year** layouts with prev/next navigation
- Four event types: **job added** (teal), **application deadline** (red), **contact follow-up** (yellow), **job fair / event** (purple)
- Filter the calendar to show only one event type at a time
- **+ Add Event** button to log job fairs, career events, and networking sessions — with format (In-Person / Hybrid / Online), venue, meeting link (Zoom, Teams, etc.), time, and notes; a **Join** button appears on any event with a link
- **Upcoming strip** below the calendar shows the next 7 days of events at a glance, including format badges and Join links for events
- **Job Activity** section below the upcoming strip — at-a-glance counts of jobs added **Today**, **This Week**, **This Month**, **This Year**, and **All Time**

---

### 🤝 Network & Contacts
Track the people in your job search — recruiters, hiring managers, referrals, and connections.

- Add contacts with: name, company, role, type, email, phone, LinkedIn, linked job, last contact date, next follow-up date, and notes
- **Stat strip** shows total contacts, how many have a follow-up due today or earlier, and a count by type
- Search by name or company; filter by contact type; sort by name, company, or most recent
- Overdue follow-ups are highlighted; next follow-up dates appear in the Calendar view
- Contacts linked to a job appear directly inside that job's detail modal

---

### 🎯 Goals
Set targets and track your progress live using real job board data.

- Create goals for: **Applications**, **Interviews**, **Offers**, or **Responses**
- Set a **weekly** or **monthly** period
- Each goal card shows live current count vs. target with a progress bar and status label (Complete / On Track / Behind / Not Started)
- **Summary strip** with mini progress rings for all active goals
- Quick-add **preset buttons** when no goals exist yet
- Filter the goals view by week or month period

---

### 📊 Analytics
A data-driven overview of your entire job search.

- **7 KPI cards**: Tracked, Applied, In Progress, Offers, Declined, Avg Fit, Response Rate — numbers animate in with a count-up on load
- **Application Funnel** — conversion rates from Applied → Screening → Interview → Offer; click any stage row to see those jobs
- **Response Rate by Stage** — click any bar to see the jobs at that stage
- **Applications Over Time** — weekly (last 8 weeks) or monthly (last 12 months); click any bar column to see jobs added that period
- **Top Companies** by application count; click any row to see those jobs
- **Skill Gaps** bar chart — click any row to see jobs missing that skill
- **Fit Score Distribution** bucketed into four ranges — click any range to see matching jobs
- **Work Type, Job Type, Seniority** breakdowns — click any row to drill into those jobs
- All charts animate in with staggered entrance and bar-fill transitions on load
- Filter all charts by **This Week / This Month / This Year / All Time**

---

### 👤 My Profile
Build the foundation for your fit scores and recommendations.

- **Skills** — add skills one at a time or paste a whole block (comma or newline-separated) using the **Bulk** button; skills are grouped and color-coded by level — green for Expert, teal for Intermediate, gray for Beginner; click the level badge on any tag to cycle it in place; filter to a single level with the **All / Expert / Intermediate / Beginner** pill buttons; if you have more than 10, the list collapses with a **Show X more** toggle; **Clear all** removes everything at once with a confirmation prompt; duplicates are automatically skipped
- **Certifications, Degrees & Licenses** — track credentials by type (Certificate, Associate's, Bachelor's, Master's, PhD, Bootcamp, License); each entry supports an optional description (skills covered, technologies, field of study) which feeds directly into fit scoring; click the **✎** button on any card to edit the name, type, or description inline without removing and re-adding it
- **Resume Summary** — a short bio for your own reference
- **Skill Coverage chart** — see how often each of your skills appears across tracked jobs; grouped and color-coded by level with the same **All / Expert / Intermediate / Beginner** filter pills and a **Show X more** collapse when you have many skills
- **Email Templates** — save reusable thank-you, follow-up, withdrawal, and custom email templates; load any template directly into a job's cover letter from the Application tab
- **Data Backup** — export all your data to a `.json` file and import it on any other device or browser; the filename and a confirmation message appear under the buttons after each action
- **Export Jobs as CSV** — download your job list as a spreadsheet-ready `.csv` file (role, company, stage, fit score, matched skills, skill gaps, salary, notes, and more); **jobs only** — skills, contacts, goals, and events are not included in the CSV; use the JSON backup for a full restore
- **Clear All Jobs** — wipe all tracked jobs in one click (with confirmation) to start fresh
- **Delete All Data** — wipe everything (jobs, contacts, goals, events, profile, skills, and certifications) in one click (with confirmation)
- **Your Links** — save your LinkedIn, GitHub, and Portfolio URLs locally for quick access; each saved link has an **Open ↗** button and a **⎘ copy** button to copy the URL to clipboard instantly

---

### 📄 Resume Hub
A workspace for getting your resume and portfolio in shape.

- **Resume Parser** — upload a PDF, Word (.docx), or plain text file, or paste directly. Detected skills are cross-referenced with your profile and can be imported in one click.
- **GitHub / Portfolio Scanner** — paste a GitHub profile or GitHub Pages URL to scan public repos for languages and topics. Import detected skills the same way.
- **Writing Polish** — flags passive voice, filler words, weak phrases, and vague language with suggestions and a quality score.
- **Resources & AI Tools** — curated tools for writing, resume building, portfolio hosting, job research, and financial planning.

---

### 🧠 Learning Hub
Course and certification recommendations built from your skill gaps.

- Pulls from Coursera, Google, AWS, LinkedIn Learning, Udemy, and more
- Each resource includes an estimated time commitment
- Bookmark picks and filter to see only your saved resources

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
│   ├── base.css            # variables, reset, layout, buttons, forms
│   ├── dashboard.css       # stat cards, activity calendar
│   ├── board.css           # kanban columns, swimlane, table, timeline views, job cards
│   ├── modals.css          # modals, profile, learning hub, resume hub
│   ├── features.css        # deadline banner, notes timeline
│   ├── views.css           # calendar, contacts, analytics, goals views
│   ├── fun.css             # extra themes (Midnight, Sunset, Ocean), confetti, streak, card flair
│   └── onboarding.css      # first-run onboarding modal styles
└── javascript/
    ├── data.js             # static data: KNOWN_SKILLS, LEARNING, RESOURCES, WRITING_RULES (tech)
    ├── data-industries.js  # extends KNOWN_SKILLS & LEARNING for Business, Finance, PM, Banking, CX
    ├── state.js            # app state, localStorage save/load, export/import
    ├── utils.js            # shared helpers, fit analysis, navigation
    ├── views-dashboard.js  # dashboard stats and activity calendar
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
    └── onboarding.js       # first-run guide, step navigation, reopen via ? button
```

---

## 🚀 Getting Started

1. Clone or download this folder
2. Open `index.html` in your browser
3. Follow the **getting started guide** that opens automatically — or reopen it anytime with the **?** button in the top bar
4. Go to **My Profile** — add your skills and any certifications
5. Go to **Job Board** → **+ Add Job** — fill in the **Details** tab, paste the job description in **Job Info** for fit scoring, and optionally draft your cover letter in the **Application** tab
6. Click any job card to see your fit score and skill breakdown
7. Check the **Learning Hub** to see what to learn next
8. Use **Resume Hub** to parse your resume, scan your GitHub, check your writing, and explore tools
9. Head to **Network** to track recruiters and contacts — follow-up dates appear in the **Calendar**
10. Visit **Analytics** for KPIs and charts across your full job search
11. Use **Goals** to set weekly or monthly targets and watch them update as you track applications

All data is saved to your browser's localStorage. Nothing is sent anywhere. Use the ☀️ / 🌙 toggle in the top bar to switch between light and dark mode, or pick a color theme — **M** (Midnight), **S** (Sunset), or **O** (Ocean) — from the buttons beside it. Your preference is remembered.

---

---

### 🔍 Job Description Keyword Highlight
When viewing a job's description in the detail modal, matched skills are **highlighted green** and skill gaps are **highlighted red** directly in the text — no more hunting for keywords manually.

Each matched and missing skill tag has a **×** dismiss button. Click it to remove a false positive (e.g. "go" detected as the Go language when it's just the word "go") — the fit score recalculates instantly and the highlights update. The change is saved automatically.

---

### ⊜ Job Comparison View
Click **⊜ Compare Jobs** on the Job Board to select 2–3 jobs and compare them side by side:
- Fit score, salary, stage, seniority, work type
- Full matched skills and skill gaps lists
- Benefits chips
- Supports search filtering to find jobs quickly

---

### 📧 Email Templates
Save reusable email templates in **My Profile → Email Templates**:
- Types: **Thank-You**, **Follow-Up**, **Withdrawal**, **Custom**
- Load any saved template directly into a job's cover letter from the **Application** tab
- Edit template body inline without leaving the profile view

---

### ✓ Thank-You Sent checkbox
When logging Screening, Interview, or Offer milestone details, check **Thank-you note sent** to track it. A ✓ indicator appears in the Application Timeline strip on the job detail view.

---

### 📋 This Week Summary
The Dashboard now includes a **This Week** recap card showing: jobs added this week, currently in-progress count, overdue follow-ups, and live progress against all weekly goals.

---

### 👥 Linked Contacts in Job Detail
When opening a job that has contacts linked to it (via Network), those contacts now appear inline in the job detail modal — including their type, follow-up status, and overdue alerts — without needing to switch views.

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

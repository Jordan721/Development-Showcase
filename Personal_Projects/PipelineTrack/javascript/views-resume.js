'use strict';

/* ══════════════════════════════════════════════════════════
   LEARNING HUB
   ══════════════════════════════════════════════════════════ */
function renderLearning() {
  const showBookmarked = document.getElementById('show-bookmarked').checked;
  const grid = document.getElementById('learning-grid');

  // Aggregate skill gaps across all jobs
  const gapCount = {};
  state.jobs.forEach(j => (j.missing || []).forEach(skill => {
    gapCount[skill] = (gapCount[skill] || 0) + 1;
  }));

  // Find resources for gap skills
  let entries = Object.entries(gapCount)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count]) => ({
      skill,
      count,
      resource: LEARNING[skill] || null
    }))
    .filter(e => e.resource !== null);

  // Also include bookmarked skills even if not a current gap
  if (showBookmarked) {
    const bookmarkedNotInGaps = state.savedCourses
      .filter(skill => !entries.find(e => e.skill === skill))
      .map(skill => ({
        skill,
        count: 0,
        resource: LEARNING[skill] || null
      }))
      .filter(e => e.resource !== null);
    entries = [...entries, ...bookmarkedNotInGaps].filter(e => state.savedCourses.includes(e.skill));
  }

  if (entries.length === 0) {
    grid.innerHTML = `<p class="learning-empty">${
      showBookmarked
        ? 'No bookmarked courses yet.'
        : state.jobs.length === 0
          ? 'Add jobs with descriptions to get recommendations.'
          : 'No skill gaps detected — your profile matches your jobs well!'
    }</p>`;
    return;
  }

  grid.innerHTML = entries.map(({
    skill,
    count,
    resource
  }) => {
    const bookmarked = state.savedCourses.includes(skill);
    return `
      <div class="learning-card ${bookmarked ? 'bookmarked' : ''}" data-skill="${skill}">
        <div class="learning-card-top">
          <div class="learning-skill">${skill.charAt(0).toUpperCase()+skill.slice(1)}</div>
          <span class="learning-bookmark" data-bookmark="${skill}" title="Bookmark">${bookmarked ? '★' : '☆'}</span>
        </div>
        <div class="learning-course">${resource.course}</div>
        <div class="learning-provider">${resource.provider}</div>
        <div class="learning-meta">
          <span class="learning-tag">⏱ ${resource.time}</span>
          ${count > 0 ? `<span class="gap-count-badge">Missing in ${count} job${count!==1?'s':''}</span>` : ''}
        </div>
        <a class="btn-primary" href="${resource.url}" target="_blank" rel="noopener">View Course ↗</a>
      </div>`;
  }).join('');

  grid.querySelectorAll('.learning-bookmark').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.dataset.bookmark;
      const idx = state.savedCourses.indexOf(skill);
      if (idx === -1) state.savedCourses.push(skill);
      else state.savedCourses.splice(idx, 1);
      save();
      renderLearning();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   RESUME HUB
   ══════════════════════════════════════════════════════════ */
function renderResume() {
  renderResumeVault();
  renderResources();
}

/* ══════════════════════════════════════════════════════════
   RESUME VAULT
   ══════════════════════════════════════════════════════════ */
function renderResumeVault() {
  const list = document.getElementById('vault-list');
  const uploadBtn = document.getElementById('vault-upload-btn');
  const fileInput = document.getElementById('vault-file-input');
  if (!list || !uploadBtn || !fileInput) return;

  function renderList() {
    if (!state.resumes || state.resumes.length === 0) {
      list.innerHTML = '<div class="vault-empty">No resumes uploaded yet. Click <strong>+ Upload Resume</strong> to add one.</div>';
      return;
    }
    list.innerHTML = state.resumes.map(r => {
      const icon = r.fileType === 'pdf' ? '📄' : r.fileType === 'docx' ? '📝' : '📃';
      const kb = (r.size / 1024).toFixed(1);
      const date = new Date(r.uploadedAt).toLocaleDateString();
      return `
        <div class="vault-item">
          <div class="vault-item-icon">${icon}</div>
          <div class="vault-item-info">
            <div class="vault-item-name">${r.name}</div>
            <div class="vault-item-meta">${r.fileType.toUpperCase()} · ${kb} KB · ${date}</div>
          </div>
          <div class="vault-item-actions">
            <button class="btn-secondary vault-view-btn" data-id="${r.id}" style="font-size:12px;padding:5px 12px">View</button>
            <button class="btn-secondary vault-dl-btn" data-id="${r.id}" style="font-size:12px;padding:5px 12px">Download</button>
            <button class="btn-secondary vault-rename-btn" data-id="${r.id}" style="font-size:12px;padding:5px 12px">Rename</button>
            <button class="vault-del-btn" data-id="${r.id}" title="Delete">×</button>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.vault-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = state.resumes.find(x => x.id === btn.dataset.id);
        if (!r) return;
        const [meta, b64] = r.dataUrl.split(',');
        const mime = meta.match(/:(.*?);/)[1];
        const bytes = atob(b64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: mime });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
    });

    list.querySelectorAll('.vault-dl-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = state.resumes.find(x => x.id === btn.dataset.id);
        if (!r) return;
        const a = document.createElement('a');
        a.href = r.dataUrl;
        a.download = r.name;
        a.click();
      });
    });

    list.querySelectorAll('.vault-rename-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = state.resumes.find(x => x.id === btn.dataset.id);
        if (!r) return;
        const newName = prompt('Rename resume:', r.name);
        if (!newName || !newName.trim() || newName.trim() === r.name) return;
        r.name = newName.trim();
        save();
        renderList();
      });
    });

    list.querySelectorAll('.vault-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Remove this resume from the vault?')) return;
        state.resumes = state.resumes.filter(x => x.id !== btn.dataset.id);
        save();
        renderList();
        toast('Resume removed.', '');
      });
    });
  }

  uploadBtn.onclick = () => fileInput.click();

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const ext = file.name.split('.').pop().toLowerCase();
      state.resumes.unshift({
        id: Date.now().toString(),
        name: file.name,
        fileType: ext,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: e.target.result
      });
      save();
      renderList();
      toast('Resume saved to vault.', 'success');
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  };

  renderList();
}

/* ── File upload helpers ── */
function setDropZoneState(state, filename) {
  const zone = document.getElementById('resume-drop-zone');
  const icon = document.getElementById('file-drop-icon');
  const text = document.getElementById('file-drop-text');
  const hint = document.getElementById('file-drop-hint');
  if (state === 'loading') {
    zone.className = 'file-drop-zone';
    icon.textContent = '⏳';
    text.textContent = `Reading ${filename}…`;
    hint.textContent = 'Please wait';
  } else if (state === 'loaded') {
    zone.className = 'file-drop-zone loaded';
    icon.textContent = '✓';
    text.textContent = filename;
    hint.textContent = 'Text extracted — ready to scan';
  } else {
    zone.className = 'file-drop-zone';
    icon.textContent = '📄';
    text.textContent = 'Drop your resume here';
    hint.textContent = 'PDF, Word (.docx), or plain text (.txt)';
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readFilePDF(file) {
  if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js not loaded');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: buffer
  }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

async function readFileDOCX(file) {
  if (typeof mammoth === 'undefined') throw new Error('Mammoth not loaded');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({
    arrayBuffer: buffer
  });
  return result.value;
}

async function handleResumeFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  setDropZoneState('loading', file.name);
  try {
    let text = '';
    if (ext === 'txt') {
      text = await readFileAsText(file);
    } else if (ext === 'pdf') {
      text = await readFilePDF(file);
    } else if (ext === 'docx') {
      text = await readFileDOCX(file);
    } else {
      toast('Unsupported file type — use PDF, DOCX, or TXT.', 'error');
      setDropZoneState('idle');
      return;
    }
    document.getElementById('resume-text').value = text;
    setDropZoneState('loaded', file.name);
    toast('File loaded! Click "Scan for Skills" to analyze.', 'success');
  } catch {
    toast('Could not read file. Try pasting the text manually.', 'error');
    setDropZoneState('idle');
  }
}

function parseResume() {
  const text = document.getElementById('resume-text').value;
  if (!text.trim()) {
    toast('Paste your resume text first.', 'error');
    return;
  }

  const lower = text.toLowerCase();
  const found = [...KNOWN_SKILLS].filter(skill => lower.includes(skill));
  const container = document.getElementById('resume-parse-results');

  if (found.length === 0) {
    container.innerHTML = '<div class="parse-placeholder">No recognized tech skills found. Try including your skills section or more of your experience.</div>';
    return;
  }

  const alreadyHave = state.profile.skills.map(s => s.name.toLowerCase());
  const newSkills = found.filter(s => !alreadyHave.some(a => a.includes(s) || s.includes(a)));
  const existing = found.filter(s => alreadyHave.some(a => a.includes(s) || s.includes(a)));

  container.innerHTML = `
    <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">
      Found <strong style="color:var(--text)">${found.length}</strong> skills —
      <span style="color:var(--green)">${existing.length} already in profile</span>,
      <span style="color:var(--accent)">${newSkills.length} new</span>
    </div>
    ${found.map(skill => {
      const has = alreadyHave.some(a => a.includes(skill) || skill.includes(a));
      return `
        <div class="parsed-skill-row">
          <label style="display:flex;align-items:center;gap:8px;cursor:${has ? 'default' : 'pointer'}">
            <input type="checkbox" class="parse-skill-check" data-skill="${skill}"
              ${!has ? 'checked' : 'disabled'}
              style="accent-color:var(--accent);width:13px;height:13px;cursor:${has ? 'default' : 'pointer'}" />
            <span class="parsed-skill-name">${skill}</span>
          </label>
          ${has ? '<span class="parsed-already">✓ in profile</span>' : ''}
        </div>`;
    }).join('')}
    <div class="import-bar">
      <span class="import-count">${newSkills.length} new skill${newSkills.length !== 1 ? 's' : ''} ready to import</span>
      ${newSkills.length > 0 ? `<button class="btn-primary" id="import-skills-btn" style="font-size:12px;padding:6px 14px">Import Selected</button>` : ''}
    </div>`;

  const importBtn = document.getElementById('import-skills-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const checked = [...container.querySelectorAll('.parse-skill-check:not(:disabled):checked')];
      if (checked.length === 0) {
        toast('No new skills selected.', 'error');
        return;
      }
      checked.forEach(cb => {
        const name = cb.dataset.skill;
        if (!state.profile.skills.some(s => s.name.toLowerCase() === name)) {
          state.profile.skills.push({
            name,
            level: 'Intermediate'
          });
        }
      });
      save();
      reanalyzeAllJobs();
      toast(`${checked.length} skill${checked.length !== 1 ? 's' : ''} imported to your profile!`, 'success');
      parseResume();
    });
  }
}

async function scanPortfolio() {
  const raw = document.getElementById('portfolio-url').value.trim();
  if (!raw) {
    toast('Enter a GitHub or GitHub Pages URL first.', 'error');
    return;
  }

  let username = null;
  let specificRepo = null;

  try {
    const url = new URL(raw.startsWith('http') ? raw : 'https://' + raw);
    const host = url.hostname.toLowerCase();
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (host === 'github.com') {
      // https://github.com/username  or  https://github.com/username/repo
      username = pathParts[0] || null;
      specificRepo = pathParts[1] || null;
    } else if (host.endsWith('.github.io')) {
      // https://username.github.io  or  https://username.github.io/reponame/
      username = host.replace('.github.io', '');
      specificRepo = pathParts[0] || null;
    } else {
      toast('Only GitHub and GitHub Pages URLs are supported (github.com or username.github.io).', 'error');
      return;
    }
  } catch {
    toast('Invalid URL — paste a full GitHub or portfolio link.', 'error');
    return;
  }

  if (!username) {
    toast('Could not find a GitHub username in that URL.', 'error');
    return;
  }

  const resultsEl = document.getElementById('portfolio-results');
  resultsEl.innerHTML = '<div class="parse-placeholder">Fetching GitHub data…</div>';

  try {
    const termSet = new Set();

    // Fetch all user repos for languages + topics
    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=50&sort=updated`);
    if (reposRes.status === 404) {
      resultsEl.innerHTML = '<div class="parse-placeholder">GitHub user not found. Double-check the URL.</div>';
      return;
    }
    if (!reposRes.ok) throw new Error(`GitHub API ${reposRes.status}`);
    const repos = await reposRes.json();

    repos.forEach(repo => {
      if (repo.language) termSet.add(repo.language.toLowerCase());
      (repo.topics || []).forEach(t => termSet.add(t.toLowerCase()));
    });

    // If URL pointed at a specific repo, also fetch its full language breakdown
    if (specificRepo) {
      const langRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(specificRepo)}/languages`);
      if (langRes.ok) {
        const langs = await langRes.json();
        Object.keys(langs).forEach(l => termSet.add(l.toLowerCase()));
      }
    }

    const allTerms = [...termSet].join(' ');
    const found = [...KNOWN_SKILLS].filter(skill => allTerms.includes(skill));
    const sourceLabel = specificRepo ?
      `${repos.length} repos + "${specificRepo}" details` :
      `${repos.length} repos`;

    if (found.length === 0) {
      resultsEl.innerHTML = `<div class="parse-placeholder">No recognized tech skills found across ${sourceLabel}. Try the resume scanner instead.</div>`;
      return;
    }

    const alreadyHave = state.profile.skills.map(s => s.name.toLowerCase());
    const newSkills = found.filter(s => !alreadyHave.some(a => a.includes(s) || s.includes(a)));
    const existing = found.filter(s => alreadyHave.some(a => a.includes(s) || s.includes(a)));

    resultsEl.innerHTML = `
      <div style="margin-bottom:10px;font-size:12px;color:var(--text-muted)">
        Found <strong style="color:var(--text)">${found.length}</strong> skills from ${sourceLabel} —
        <span style="color:var(--green)">${existing.length} already in profile</span>,
        <span style="color:var(--accent)">${newSkills.length} new</span>
      </div>
      ${found.map(skill => {
        const has = alreadyHave.some(a => a.includes(skill) || skill.includes(a));
        return `
          <div class="parsed-skill-row">
            <label style="display:flex;align-items:center;gap:8px;cursor:${has ? 'default' : 'pointer'}">
              <input type="checkbox" class="portfolio-skill-check" data-skill="${skill}"
                ${!has ? 'checked' : 'disabled'}
                style="accent-color:var(--accent);width:13px;height:13px;cursor:${has ? 'default' : 'pointer'}" />
              <span class="parsed-skill-name">${skill}</span>
            </label>
            ${has ? '<span class="parsed-already">✓ in profile</span>' : ''}
          </div>`;
      }).join('')}
      ${newSkills.length > 0 ? `
        <div class="import-bar">
          <span class="import-count">${newSkills.length} new skill${newSkills.length !== 1 ? 's' : ''} ready to import</span>
          <button class="btn-primary" id="import-portfolio-btn" style="font-size:12px;padding:6px 14px">Import Selected</button>
        </div>` : ''}`;

    const importBtn = document.getElementById('import-portfolio-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const checked = [...resultsEl.querySelectorAll('.portfolio-skill-check:not(:disabled):checked')];
        if (checked.length === 0) {
          toast('No new skills selected.', 'error');
          return;
        }
        checked.forEach(cb => {
          const name = cb.dataset.skill;
          if (!state.profile.skills.some(s => s.name.toLowerCase() === name)) {
            state.profile.skills.push({
              name,
              level: 'Intermediate'
            });
          }
        });
        save();
        reanalyzeAllJobs();
        toast(`${checked.length} skill${checked.length !== 1 ? 's' : ''} imported to your profile!`, 'success');
        scanPortfolio();
      });
    }
  } catch {
    resultsEl.innerHTML = '<div class="parse-placeholder">Could not reach GitHub. Check your connection or try again.</div>';
  }
}

function checkWriting() {
  const text = document.getElementById('polish-text').value;
  if (!text.trim()) {
    toast('Paste some text to check first.', 'error');
    return;
  }

  const container = document.getElementById('polish-results');
  const issues = [];

  WRITING_RULES.forEach(rule => {
    const matches = text.match(rule.pattern);
    if (matches) {
      const unique = [...new Set(matches.map(m => m.toLowerCase()))];
      issues.push({
        ...rule,
        matches: unique
      });
    }
  });

  const lowerText = text.toLowerCase();
  const usedStrong = STRONG_VERBS.filter(v => lowerText.includes(v));
  const score = Math.max(0, 100 - (issues.length * 12));
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';

  container.innerHTML = `
    <div class="polish-score">
      <span class="polish-score-label">Writing Score</span>
      <span class="polish-score-val" style="color:${scoreColor}">${score}/100</span>
      <span style="font-size:12px;color:var(--text-muted);margin-left:auto">${issues.length} issue${issues.length !== 1 ? 's' : ''} found</span>
    </div>
    ${issues.length === 0
      ? `<div class="polish-issue green">
           <div class="polish-found">Looks clean!</div>
           <div class="polish-suggestion">No common issues detected. Run it through Grammarly or the Hemingway Editor for deeper analysis.</div>
         </div>`
      : issues.map(issue => `
          <div class="polish-issue ${issue.type}">
            <div class="polish-found">${issue.label} — <em>"${issue.matches.join('", "')}"</em></div>
            <div class="polish-suggestion">💡 ${issue.suggestion}</div>
          </div>`).join('')}
    <div class="polish-issue ${usedStrong.length > 0 ? 'green' : 'yellow'}" style="margin-top:10px">
      ${usedStrong.length > 0
        ? `<div class="polish-found">Strong action verbs detected ✓</div>
           <div class="polish-suggestion">Good use of: ${usedStrong.join(', ')}</div>`
        : `<div class="polish-found">No strong action verbs found</div>
           <div class="polish-suggestion">Consider leading with verbs like: Built, Developed, Led, Optimized, Launched, Automated, Engineered…</div>`}
    </div>`;
}

function renderResources() {
  const grid = document.getElementById('resources-grid');
  grid.innerHTML = RESOURCES.map(cat => `
    <div class="resource-category">
      <div class="resource-category-title">${cat.category}</div>
      <div class="resource-row">
        ${cat.items.map(item => `
          <a class="resource-card" href="${item.url}" target="_blank" rel="noopener">
            <div class="resource-card-top">
              <div class="resource-name">${item.name}</div>
              <span class="resource-tag">${item.tag}</span>
            </div>
            <div class="resource-desc">${item.desc}</div>
            <span class="resource-link">Open ↗</span>
          </a>`).join('')}
      </div>
    </div>`).join('');
}
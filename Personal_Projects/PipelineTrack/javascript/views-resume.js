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
  renderCoverLetterVault();
  renderResources();
}

function vaultCountLabel(count, singular) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

function vaultEmptyMarkup(kind, actionLabel) {
  return `<div class="vault-empty">
    <div class="vault-empty-icon">+</div>
    <div class="vault-empty-title">No ${kind}s saved yet</div>
    <div class="vault-empty-copy">Upload or drag in a ${kind} to start building your reusable application library.</div>
    <div class="vault-empty-action">${actionLabel}</div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   RESUME VAULT
   ══════════════════════════════════════════════════════════ */
function renderResumeVault() {
  const list = document.getElementById('vault-list');
  const uploadBtn = document.getElementById('vault-upload-btn');
  const clearBtn = document.getElementById('vault-clear-all-btn');
  const fileInput = document.getElementById('vault-file-input');
  const countEl = document.getElementById('resume-vault-count');
  if (!list || !uploadBtn || !fileInput) return;

  function renderList() {
    const count = state.resumes ? state.resumes.length : 0;
    if (countEl) countEl.textContent = vaultCountLabel(count, 'file');
    if (clearBtn) clearBtn.disabled = count === 0;
    if (count === 0) {
      list.innerHTML = vaultEmptyMarkup('resume', 'Upload Resume');
      return;
    }
    list.innerHTML = state.resumes.map(r => {
      const icon = r.fileType === 'pdf' ? '📄' : r.fileType === 'docx' ? '📝' : '📃';
      const kb = (r.size / 1024).toFixed(1);
      const date = new Date(r.uploadedAt).toLocaleDateString();
      return `
        <div class="vault-item" draggable="true" data-id="${r.id}" data-file-type="${r.fileType}">
          <div class="vault-drag-handle" title="Drag to reorder">::</div>
          <div class="vault-item-icon">${icon}</div>
          <div class="vault-item-info">
            <div class="vault-item-name">${escHtml(r.name)}</div>
            <div class="vault-item-meta">
              <span>${r.fileType.toUpperCase()}</span>
              <span>${kb} KB</span>
              <span>Uploaded ${date}</span>
            </div>
          </div>
          <div class="vault-item-actions">
            <button class="btn-secondary vault-action-btn vault-review-btn" data-id="${r.id}">Review</button>
            <button class="btn-secondary vault-action-btn vault-view-btn" data-id="${r.id}">View</button>
            <button class="btn-secondary vault-action-btn vault-dl-btn" data-id="${r.id}">Download</button>
            <button class="btn-secondary vault-action-btn vault-rename-btn" data-id="${r.id}">Rename</button>
            <button class="btn-secondary vault-action-btn vault-delete-btn" data-id="${r.id}">Delete</button>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.vault-review-btn').forEach(btn => {
      btn.addEventListener('click', () => openResumeReview(btn.dataset.id));
    });

    list.querySelectorAll('.vault-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = state.resumes.find(x => x.id === btn.dataset.id);
        if (!r) return;
        const [meta, b64] = r.dataUrl.split(',');
        const mime = meta.match(/:(.*?);/)[1];
        const bytes = atob(b64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], {
          type: mime
        });
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

    list.querySelectorAll('.vault-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = state.resumes.findIndex(x => x.id === btn.dataset.id);
        if (idx === -1) return;
        const resume = state.resumes[idx];
        if (!confirm(`Delete resume "${resume.name}" from the vault?`)) return;
        state.resumes.splice(idx, 1);
        state.jobs.forEach(job => {
          if (job.resumeVaultId === resume.id) job.resumeVaultId = '';
        });
        save();
        renderList();
        toast('Resume deleted.', '');
      });
    });

    // Drag-to-reorder
    let dragId = null;
    list.querySelectorAll('.vault-item').forEach(item => {
      item.addEventListener('dragstart', e => {
        dragId = item.dataset.id;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        list.querySelectorAll('.vault-item').forEach(i => i.classList.remove('drag-over'));
      });
      item.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.querySelectorAll('.vault-item').forEach(i => i.classList.remove('drag-over'));
        if (item.dataset.id !== dragId) item.classList.add('drag-over');
      });
      item.addEventListener('drop', e => {
        e.preventDefault();
        const targetId = item.dataset.id;
        if (!dragId || dragId === targetId) return;
        const fromIdx = state.resumes.findIndex(r => r.id === dragId);
        const toIdx = state.resumes.findIndex(r => r.id === targetId);
        if (fromIdx === -1 || toIdx === -1) return;
        const [moved] = state.resumes.splice(fromIdx, 1);
        state.resumes.splice(toIdx, 0, moved);
        save();
        renderList();
      });
    });
  }

  uploadBtn.onclick = () => fileInput.click();
  if (clearBtn) {
    clearBtn.onclick = () => {
      const count = state.resumes ? state.resumes.length : 0;
      if (count === 0) return;
      if (!confirm(`Clear all ${count} resume${count !== 1 ? 's' : ''} from the vault?`)) return;
      state.resumes = [];
      state.jobs.forEach(job => {
        if (job.resumeVaultId) job.resumeVaultId = '';
      });
      save();
      renderList();
      toast('Resume Vault cleared.', '');
    };
  }

  function addResumeFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      toast(`"${file.name}" — unsupported type. Use PDF, DOCX, or TXT.`, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
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
      toast(`"${file.name}" saved to Resume Vault.`, 'success');
    };
    reader.readAsDataURL(file);
  }

  fileInput.onchange = () => {
    if (fileInput.files[0]) addResumeFile(fileInput.files[0]);
    fileInput.value = '';
  };

  const dropZone = document.getElementById('vault-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');
      [...e.dataTransfer.files].forEach(file => addResumeFile(file));
    });
  }

  renderList();
}

/* ══════════════════════════════════════════════════════════
   COVER LETTER VAULT
   ══════════════════════════════════════════════════════════ */
function renderCoverLetterVault() {
  const list = document.getElementById('cover-vault-list');
  const uploadBtn = document.getElementById('cover-vault-upload-btn');
  const clearBtn = document.getElementById('cover-vault-clear-all-btn');
  const fileInput = document.getElementById('cover-vault-file-input');
  const countEl = document.getElementById('cover-vault-count');
  if (!list || !uploadBtn || !fileInput) return;

  function renderList() {
    const count = state.coverLetters ? state.coverLetters.length : 0;
    if (countEl) countEl.textContent = vaultCountLabel(count, 'file');
    if (clearBtn) clearBtn.disabled = count === 0;
    if (count === 0) {
      list.innerHTML = vaultEmptyMarkup('cover letter', 'Upload Letter');
      return;
    }
    list.innerHTML = state.coverLetters.map(r => {
      const icon = r.fileType === 'pdf' ? '📄' : r.fileType === 'docx' ? '📝' : '📃';
      const kb = (r.size / 1024).toFixed(1);
      const date = new Date(r.uploadedAt).toLocaleDateString();
      return `
        <div class="vault-item" draggable="true" data-id="${r.id}" data-file-type="${r.fileType}">
          <div class="vault-drag-handle" title="Drag to reorder">::</div>
          <div class="vault-item-icon">${icon}</div>
          <div class="vault-item-info">
            <div class="vault-item-name">${escHtml(r.name)}</div>
            <div class="vault-item-meta">
              <span>${r.fileType.toUpperCase()}</span>
              <span>${kb} KB</span>
              <span>Uploaded ${date}</span>
            </div>
          </div>
          <div class="vault-item-actions">
            <button class="btn-secondary vault-action-btn cover-vault-view-btn" data-id="${r.id}">View</button>
            <button class="btn-secondary vault-action-btn cover-vault-dl-btn" data-id="${r.id}">Download</button>
            <button class="btn-secondary vault-action-btn cover-vault-rename-btn" data-id="${r.id}">Rename</button>
            <button class="btn-secondary vault-action-btn cover-vault-delete-btn" data-id="${r.id}">Delete</button>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.cover-vault-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = state.coverLetters.find(x => x.id === btn.dataset.id);
        if (!r) return;
        const [meta, b64] = r.dataUrl.split(',');
        const mime = meta.match(/:(.*?);/)[1];
        const bytes = atob(b64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], {
          type: mime
        });
        window.open(URL.createObjectURL(blob), '_blank');
      });
    });

    list.querySelectorAll('.cover-vault-dl-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = state.coverLetters.find(x => x.id === btn.dataset.id);
        if (!r) return;
        const a = document.createElement('a');
        a.href = r.dataUrl;
        a.download = r.name;
        a.click();
      });
    });

    list.querySelectorAll('.cover-vault-rename-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = state.coverLetters.find(x => x.id === btn.dataset.id);
        if (!r) return;
        const newName = prompt('Rename cover letter:', r.name);
        if (!newName || !newName.trim() || newName.trim() === r.name) return;
        r.name = newName.trim();
        save();
        renderList();
      });
    });

    list.querySelectorAll('.cover-vault-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = state.coverLetters.findIndex(x => x.id === btn.dataset.id);
        if (idx === -1) return;
        const letter = state.coverLetters[idx];
        if (!confirm(`Delete cover letter "${letter.name}" from the vault?`)) return;
        state.coverLetters.splice(idx, 1);
        save();
        renderList();
        toast('Cover letter deleted.', '');
      });
    });

    // Drag-to-reorder
    let dragId = null;
    list.querySelectorAll('.vault-item').forEach(item => {
      item.addEventListener('dragstart', e => {
        dragId = item.dataset.id;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        list.querySelectorAll('.vault-item').forEach(i => i.classList.remove('drag-over'));
      });
      item.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.querySelectorAll('.vault-item').forEach(i => i.classList.remove('drag-over'));
        if (item.dataset.id !== dragId) item.classList.add('drag-over');
      });
      item.addEventListener('drop', e => {
        e.preventDefault();
        const targetId = item.dataset.id;
        if (!dragId || dragId === targetId) return;
        const fromIdx = state.coverLetters.findIndex(r => r.id === dragId);
        const toIdx = state.coverLetters.findIndex(r => r.id === targetId);
        if (fromIdx === -1 || toIdx === -1) return;
        const [moved] = state.coverLetters.splice(fromIdx, 1);
        state.coverLetters.splice(toIdx, 0, moved);
        save();
        renderList();
      });
    });
  }

  uploadBtn.onclick = () => fileInput.click();
  if (clearBtn) {
    clearBtn.onclick = () => {
      const count = state.coverLetters ? state.coverLetters.length : 0;
      if (count === 0) return;
      if (!confirm(`Clear all ${count} cover letter${count !== 1 ? 's' : ''} from the vault?`)) return;
      state.coverLetters = [];
      save();
      renderList();
      toast('Cover Letter Vault cleared.', '');
    };
  }

  function addCoverLetterFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      toast(`"${file.name}" — unsupported type. Use PDF, DOCX, or TXT.`, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      state.coverLetters.unshift({
        id: Date.now().toString(),
        name: file.name,
        fileType: ext,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: e.target.result
      });
      save();
      renderList();
      toast(`"${file.name}" saved to Cover Letter Vault.`, 'success');
    };
    reader.readAsDataURL(file);
  }

  fileInput.onchange = () => {
    if (fileInput.files[0]) addCoverLetterFile(fileInput.files[0]);
    fileInput.value = '';
  };

  const dropZone = document.getElementById('cover-vault-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');
      [...e.dataTransfer.files].forEach(file => addCoverLetterFile(file));
    });
  }

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

/* ══════════════════════════════════════════════════════════
   RESUME REVIEW
   ══════════════════════════════════════════════════════════ */
function buildFitRow(j, pct, hits, total, weak) {
  const color = weak ? 'var(--red)' : pct >= 70 ? 'var(--green)' : pct >= 45 ? 'var(--yellow)' : 'var(--red)';
  const opacity = weak ? ' style="opacity:.75"' : '';
  return '<div class="review-job-fit-row"' + opacity + '>' +
    '<div class="review-job-fit-info">' +
    '<div class="review-job-fit-name">' + escHtml(j.role) +
    ' <span style="font-weight:400;color:var(--text-muted)">@ ' + escHtml(j.company) + '</span></div>' +
    '<div class="review-job-fit-bar-wrap"><div class="review-job-fit-bar" style="width:' + pct + '%;background:' + color + '"></div></div>' +
    '</div>' +
    '<span class="review-job-fit-pct" style="color:' + color + '">' + pct + '%</span>' +
    '<span class="review-job-fit-detail">' + hits + '/' + total + ' skills</span>' +
    '</div>';
}

function buildWeakerMatchesHtml(badFits, goodFits) {
  if (!badFits.length || badFits[0] === goodFits[goodFits.length - 1]) return '';
  return '<div style="font-size:11px;font-weight:600;color:var(--text-muted);margin:10px 0 6px;text-transform:uppercase;letter-spacing:.05em">Weaker matches</div>' +
    badFits.map(function (f) {
      return buildFitRow(f.j, f.pct, f.hits, f.total, true);
    }).join('');
}

async function openResumeReview(resumeId) {
  const r = state.resumes.find(x => x.id === resumeId);
  if (!r) return;

  document.getElementById('review-modal-title').textContent = r.name;
  const body = document.getElementById('review-modal-body');
  body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">Reading resume…</div>';
  openModal('modal-resume-review');

  let text = '';
  try {
    const [meta, b64] = r.dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)[1];
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], {
      type: mime
    });
    const file = new File([blob], r.name, {
      type: mime
    });
    if (r.fileType === 'pdf') text = await readFilePDF(file);
    else if (r.fileType === 'docx') text = await readFileDOCX(file);
    else text = await readFileAsText(file);
  } catch {
    body.innerHTML = '<div class="parse-placeholder">Could not read this file for review.</div>';
    return;
  }

  const lower = text.toLowerCase();

  // ── 1. Section checklist ──────────────────────────────────
  const sections = [{
      label: 'Contact info (email or phone)',
      ok: /[\w.+-]+@[\w-]+\.\w+/.test(text) || /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.test(text),
      fix: 'Add your email address and phone number at the top.'
    },
    {
      label: 'Summary or Objective',
      ok: /\b(summary|objective|about me|professional profile|overview)\b/i.test(text),
      fix: 'Add a 2–3 sentence summary highlighting your experience and goals.'
    },
    {
      label: 'Work Experience',
      ok: /\b(experience|work history|employment|positions?\s+held)\b/i.test(text),
      fix: 'Include a Work Experience section with your past roles.'
    },
    {
      label: 'Education',
      ok: /\b(education|degree|university|college|bachelor|master|b\.s\.|m\.s\.|phd|diploma|graduated)\b/i.test(text),
      fix: 'Add an Education section with your degrees and institutions.'
    },
    {
      label: 'Skills section',
      ok: /\b(skills|technologies|tools|competencies|technical proficiency)\b/i.test(text),
      fix: 'Add a Skills section listing your key tools and technologies.'
    },
  ];

  // ── 2. Writing quality ────────────────────────────────────
  const writingIssues = [];
  WRITING_RULES.forEach(rule => {
    const matches = text.match(rule.pattern);
    if (matches) {
      const unique = [...new Set(matches.map(m => m.toLowerCase()))];
      writingIssues.push({
        label: rule.label,
        matches: unique,
        suggestion: rule.suggestion
      });
    }
  });
  const usedStrong = STRONG_VERBS.filter(v => lower.includes(v));

  // ── 3. Quantifiable achievements ─────────────────────────
  const hasMetrics = /\d+\s*%|\$[\d,]+|\d+\+?\s*(people|users|clients|team members|engineers|projects|products)|increased|decreased|reduced|improved|grew|saved|generated/i.test(text);

  // ── 4. Length ─────────────────────────────────────────────
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const lengthOk = wordCount >= 300 && wordCount <= 900;
  const lengthMsg = wordCount < 300 ? 'Too short — aim for at least 300 words for a full resume.' :
    wordCount > 900 ? 'Might be too long — consider trimming to under 900 words for a 1-page resume.' :
    `${wordCount} words — good length.`;

  // ── 5. Skills alignment vs. tracked jobs ─────────────────
  const resumeSkills = [...KNOWN_SKILLS].filter(s => lower.includes(s));
  const missingFromJobs = new Set();
  state.jobs.forEach(j => (j.missing || []).forEach(s => missingFromJobs.add(s)));
  const missingFromResume = [...missingFromJobs].filter(s => !lower.includes(s)).slice(0, 10);

  // ── 6. Per-job fit ────────────────────────────────────────
  const jobFits = state.jobs
    .map(j => {
      const required = [...new Set([...(j.matched || []), ...(j.missing || [])])];
      if (required.length === 0) return null;
      const hits = required.filter(s => resumeSkills.includes(s));
      return {
        j,
        pct: Math.round(hits.length / required.length * 100),
        hits: hits.length,
        total: required.length
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.pct - a.pct);
  const goodFits = jobFits.slice(0, 3);
  const badFits = jobFits.slice(-3).reverse().filter(x => x.pct < 60);

  // ── Score ─────────────────────────────────────────────────
  let score = 100;
  sections.forEach(s => {
    if (!s.ok) score -= 10;
  });
  score -= writingIssues.length * 8;
  if (!hasMetrics) score -= 10;
  if (!lengthOk) score -= 5;
  if (usedStrong.length === 0) score -= 7;
  score = Math.max(0, Math.min(100, score));
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 55 ? 'var(--yellow)' : 'var(--red)';

  // ── Render ────────────────────────────────────────────────
  body.innerHTML = `
    <div class="review-score-bar">
      <div>
        <div class="review-score-num" style="color:${scoreColor}">${score}<span style="font-size:14px;font-weight:500">/100</span></div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Resume Score</div>
      </div>
      <div class="review-score-pills">
        <span class="review-pill ${sections.filter(s=>s.ok).length===sections.length?'green':'yellow'}">${sections.filter(s=>s.ok).length}/${sections.length} sections</span>
        <span class="review-pill ${usedStrong.length>0?'green':'red'}">${usedStrong.length} action verbs</span>
        <span class="review-pill ${hasMetrics?'green':'yellow'}">${hasMetrics?'Has metrics':'No metrics'}</span>
        <span class="review-pill ${lengthOk?'green':'yellow'}">${wordCount} words</span>
      </div>
    </div>

    <div class="review-section-label">Sections</div>
    ${sections.map((s, i) => `
      <div class="review-finding ${s.ok ? 'ok' : 'warn'}" id="rv-s-${i}">
        <span class="review-finding-icon">${s.ok ? '✓' : '!'}</span>
        <div class="review-finding-body">
          <div class="review-finding-title">${s.label}</div>
          ${!s.ok ? `<div class="review-finding-hint">${s.fix}</div>` : ''}
        </div>
        ${!s.ok ? `<button class="review-ack-btn" data-target="rv-s-${i}">I'll add it</button>` : ''}
      </div>`).join('')}

    <div class="review-section-label">Writing Quality</div>
    ${writingIssues.length === 0
      ? `<div class="review-finding ok"><span class="review-finding-icon">✓</span><div class="review-finding-body"><div class="review-finding-title">No weak phrases detected</div></div></div>`
      : writingIssues.map((issue, i) => `
        <div class="review-finding warn" id="rv-w-${i}">
          <span class="review-finding-icon">!</span>
          <div class="review-finding-body">
            <div class="review-finding-title">${issue.label}: <em>"${issue.matches.join('", "')}"</em></div>
            <div class="review-finding-hint">${issue.suggestion}</div>
          </div>
          <button class="review-ack-btn" data-target="rv-w-${i}">I'll fix it</button>
        </div>`).join('')}

    <div class="review-section-label">Action Verbs</div>
    <div class="review-finding ${usedStrong.length > 0 ? 'ok' : 'warn'}" id="rv-verbs">
      <span class="review-finding-icon">${usedStrong.length > 0 ? '✓' : '!'}</span>
      <div class="review-finding-body">
        ${usedStrong.length > 0
          ? `<div class="review-finding-title">Strong verbs found</div><div class="review-finding-hint">${usedStrong.slice(0, 8).join(', ')}${usedStrong.length > 8 ? '…' : ''}</div>`
          : `<div class="review-finding-title">No strong action verbs found</div><div class="review-finding-hint">Start bullet points with verbs like: Built, Developed, Led, Optimized, Launched, Automated…</div>`}
      </div>
      ${usedStrong.length === 0 ? `<button class="review-ack-btn" data-target="rv-verbs">I'll add them</button>` : ''}
    </div>

    <div class="review-section-label">Quantifiable Achievements</div>
    <div class="review-finding ${hasMetrics ? 'ok' : 'warn'}" id="rv-metrics">
      <span class="review-finding-icon">${hasMetrics ? '✓' : '!'}</span>
      <div class="review-finding-body">
        <div class="review-finding-title">${hasMetrics ? 'Metrics detected' : 'No numbers or metrics found'}</div>
        ${!hasMetrics ? `<div class="review-finding-hint">Add measurable results — e.g. "Reduced load time by 40%", "Managed a team of 6", "Grew revenue by $50K".</div>` : ''}
      </div>
      ${!hasMetrics ? `<button class="review-ack-btn" data-target="rv-metrics">I'll add some</button>` : ''}
    </div>

    <div class="review-section-label">Resume Length</div>
    <div class="review-finding ${lengthOk ? 'ok' : 'warn'}">
      <span class="review-finding-icon">${lengthOk ? '✓' : '!'}</span>
      <div class="review-finding-body">
        <div class="review-finding-title">${lengthMsg}</div>
      </div>
    </div>

    ${missingFromResume.length > 0 ? `
    <div class="review-section-label">Skills Gap (from your tracked jobs)</div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">These skills appear in job descriptions you've saved but aren't found in this resume:</div>
    ${missingFromResume.map((skill, i) => `
      <div class="review-finding warn" id="rv-skill-${i}">
        <span class="review-finding-icon">!</span>
        <div class="review-finding-body">
          <div class="review-finding-title">${skill}</div>
          <div class="review-finding-hint">Missing from this resume — consider adding it if you have experience with it.</div>
        </div>
        <button class="review-ack-btn" data-target="rv-skill-${i}">I'll add it</button>
      </div>`).join('')}` : ''}

    ${jobFits.length > 0 ? `
    <div class="review-section-label">Job Fit</div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">How well this resume's skills match each tracked job's requirements:</div>
    ${goodFits.map(({j, pct, hits, total}) => buildFitRow(j, pct, hits, total, false)).join('')}
    ${buildWeakerMatchesHtml(badFits, goodFits)}
    ` : ''}
    <div style="height:12px"></div>
  `;

  // Wire acknowledge buttons
  body.querySelectorAll('.review-ack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = document.getElementById(btn.dataset.target);
      if (!card) return;
      card.classList.add('review-finding--done');
      btn.textContent = 'Done ✓';
      btn.disabled = true;
    });
  });
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

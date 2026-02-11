// ── DOM References ──
const methodSelect = document.getElementById('method-select');
const urlInput = document.getElementById('url-input');
const sendBtn = document.getElementById('send-btn');
const requestTabs = document.getElementById('request-tabs');
const responseTabs = document.getElementById('response-tabs');
const responseMeta = document.getElementById('response-meta');
const responseBody = document.getElementById('response-body');
const responsePlaceholder = document.getElementById('response-placeholder');
const responseLoading = document.getElementById('response-loading');
const respHeadersPlaceholder = document.getElementById('resp-headers-placeholder');
const responseHeadersTable = document.getElementById('response-headers-table');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const bodyEditor = document.getElementById('body-editor');
const bodyEditorWrap = document.getElementById('body-editor-wrap');
const bodyFormWrap = document.getElementById('body-form-wrap');
const authType = document.getElementById('auth-type');

let history = JSON.parse(localStorage.getItem('ee_history') || '[]');

// ── Tabs ──
function setupTabs(container, prefix) {
    container.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;
        container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetId = tab.dataset.tab;
        const parent = container.closest('section') || container.parentElement;
        parent.querySelectorAll('.tab-content, .response-content').forEach(tc => {
            tc.style.display = 'none';
        });
        const target = document.getElementById(targetId);
        if (target) target.style.display = 'block';
    });
}

setupTabs(requestTabs, 'tab-');
setupTabs(responseTabs, 'resp-');

// ── Method color ──
function updateMethodColor() {
    const method = methodSelect.value;
    methodSelect.className = '';
    const colors = {
        GET: '#3fb950',
        POST: '#d29922',
        PUT: '#58a6ff',
        PATCH: '#bc8cff',
        DELETE: '#f85149',
        HEAD: '#8b949e',
        OPTIONS: '#8b949e'
    };
    methodSelect.style.color = colors[method] || '#e6edf3';
}
methodSelect.addEventListener('change', updateMethodColor);
updateMethodColor();

// ── Add / Remove KV Rows ──
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-row-btn')) {
        const target = e.target.dataset.target;
        const list = document.getElementById(target + '-list');
        if (!list) return;
        const row = document.createElement('div');
        row.className = 'kv-row';
        row.innerHTML = `
            <input type="checkbox" checked>
            <input type="text" placeholder="Key" class="kv-key">
            <input type="text" placeholder="Value" class="kv-value">
            <button class="remove-row-btn" title="Remove">&times;</button>
        `;
        list.appendChild(row);
    }

    if (e.target.classList.contains('remove-row-btn')) {
        const row = e.target.closest('.kv-row');
        const list = row.parentElement;
        if (list.children.length > 1) {
            row.remove();
        } else {
            row.querySelector('.kv-key').value = '';
            row.querySelector('.kv-value').value = '';
        }
    }
});

// ── Body Type Toggle ──
document.querySelectorAll('input[name="body-type"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const val = radio.value;
        bodyEditorWrap.classList.toggle('hidden', val !== 'json' && val !== 'text');
        bodyFormWrap.classList.toggle('hidden', val !== 'form');
        if (val === 'json') bodyEditor.placeholder = '{ "key": "value" }';
        if (val === 'text') bodyEditor.placeholder = 'Enter plain text...';
    });
});

// ── Auth Type Toggle ──
authType.addEventListener('change', () => {
    document.querySelectorAll('.auth-fields').forEach(f => f.classList.add('hidden'));
    const val = authType.value;
    if (val !== 'none') {
        document.getElementById('auth-' + val).classList.remove('hidden');
    }
});

// ── Collect KV pairs ──
function collectKV(listId) {
    const pairs = {};
    const rows = document.querySelectorAll(`#${listId} .kv-row`);
    rows.forEach(row => {
        const enabled = row.querySelector('input[type="checkbox"]').checked;
        const key = row.querySelector('.kv-key').value.trim();
        const value = row.querySelector('.kv-value').value.trim();
        if (enabled && key) pairs[key] = value;
    });
    return pairs;
}

// ── Build URL with params ──
function buildUrl(base) {
    const params = collectKV('params-list');
    if (Object.keys(params).length === 0) return base;
    const url = new URL(base);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
}

// ── Build Headers ──
function buildHeaders() {
    const headers = collectKV('headers-list');

    // Auth
    const auth = authType.value;
    if (auth === 'bearer') {
        const token = document.getElementById('bearer-token').value.trim();
        if (token) headers['Authorization'] = 'Bearer ' + token;
    } else if (auth === 'basic') {
        const user = document.getElementById('basic-user').value;
        const pass = document.getElementById('basic-pass').value;
        if (user) headers['Authorization'] = 'Basic ' + btoa(user + ':' + pass);
    } else if (auth === 'apikey') {
        const name = document.getElementById('apikey-name').value.trim() || 'X-API-Key';
        const val = document.getElementById('apikey-value').value.trim();
        if (val) headers[name] = val;
    }

    return headers;
}

// ── Build Body ──
function buildBody() {
    const method = methodSelect.value;
    if (method === 'GET' || method === 'HEAD') return undefined;

    const type = document.querySelector('input[name="body-type"]:checked').value;
    if (type === 'none') return undefined;
    if (type === 'json' || type === 'text') return bodyEditor.value || undefined;
    if (type === 'form') {
        const data = new URLSearchParams();
        const pairs = collectKV('form-list');
        Object.entries(pairs).forEach(([k, v]) => data.append(k, v));
        return data.toString() || undefined;
    }
    return undefined;
}

// ── JSON Syntax Highlighting ──
function highlightJSON(json) {
    if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
    return json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:/g, match =>
            `<span class="json-key">${match.slice(0, -1)}</span>:`)
        .replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"/g, match =>
            `<span class="json-string">${match}</span>`)
        .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g,
            `<span class="json-number">$1</span>`)
        .replace(/\b(true|false)\b/g,
            `<span class="json-bool">$1</span>`)
        .replace(/\bnull\b/g,
            `<span class="json-null">null</span>`);
}

// ── Format file size ──
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// ── Show Response ──
function showResponse(data) {
    responsePlaceholder.classList.add('hidden');
    responseLoading.classList.add('hidden');
    responseBody.classList.remove('hidden');

    const {
        status,
        statusText,
        headers,
        body,
        time,
        size
    } = data;

    // Meta badges
    const statusClass = status < 300 ? 'status-2xx' : status < 400 ? 'status-3xx' : status < 500 ? 'status-4xx' : 'status-5xx';
    responseMeta.innerHTML = `
        <span class="meta-badge ${statusClass}">${status} ${statusText}</span>
        <span class="meta-badge time">${time} ms</span>
        <span class="meta-badge size">${formatSize(size)}</span>
    `;

    // Body
    let isJSON = false;
    try {
        const parsed = JSON.parse(body);
        responseBody.querySelector('code').innerHTML = highlightJSON(JSON.stringify(parsed, null, 2));
        isJSON = true;
    } catch {
        responseBody.querySelector('code').textContent = body;
    }

    // Response headers
    const tbody = responseHeadersTable.querySelector('tbody');
    tbody.innerHTML = '';
    if (headers && Object.keys(headers).length > 0) {
        respHeadersPlaceholder.classList.add('hidden');
        responseHeadersTable.classList.remove('hidden');
        Object.entries(headers).forEach(([key, value]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td>`;
            tbody.appendChild(tr);
        });
    }
}

function showError(err) {
    responsePlaceholder.classList.add('hidden');
    responseLoading.classList.add('hidden');
    responseBody.classList.remove('hidden');
    responseMeta.innerHTML = `<span class="meta-badge status-5xx">Error</span>`;
    responseBody.querySelector('code').innerHTML = `<div class="error-msg"><span class="error-title">Request Failed</span><span class="error-detail">${escapeHtml(err.message || String(err))}</span></div>`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Send Request ──
async function sendRequest() {
    let url = urlInput.value.trim();
    if (!url) {
        urlInput.focus();
        return;
    }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const method = methodSelect.value;

    try {
        const fullUrl = buildUrl(url);
        const headers = buildHeaders();
        const body = buildBody();

        // Show loading
        responsePlaceholder.classList.add('hidden');
        responseBody.classList.add('hidden');
        responseLoading.classList.remove('hidden');
        responseMeta.innerHTML = '';
        sendBtn.classList.add('loading');
        sendBtn.textContent = '...';

        const start = performance.now();

        const fetchOptions = {
            method,
            headers
        };
        if (body !== undefined) fetchOptions.body = body;

        const res = await fetch(fullUrl, fetchOptions);
        const elapsed = Math.round(performance.now() - start);
        const text = await res.text();

        // Collect response headers
        const resHeaders = {};
        res.headers.forEach((value, key) => {
            resHeaders[key] = value;
        });

        const responseData = {
            status: res.status,
            statusText: res.statusText,
            headers: resHeaders,
            body: text,
            time: elapsed,
            size: new Blob([text]).size
        };

        showResponse(responseData);
        addToHistory(method, fullUrl, res.status);

    } catch (err) {
        showError(err);
        addToHistory(method, url, 'ERR');
    } finally {
        sendBtn.classList.remove('loading');
        sendBtn.textContent = 'Send';
    }
}

sendBtn.addEventListener('click', sendRequest);
urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendRequest();
});

// ── History ──
function addToHistory(method, url, status) {
    history.unshift({
        method,
        url,
        status,
        time: Date.now()
    });
    if (history.length > 50) history.pop();
    localStorage.setItem('ee_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<li class="history-empty">No requests yet</li>';
        return;
    }

    historyList.innerHTML = history.map((item, i) => `
        <li class="history-item" data-index="${i}">
            <div class="history-item-top">
                <span class="history-method method-${item.method}">${item.method}</span>
                <span class="history-status">${item.status}</span>
            </div>
            <div class="history-url">${escapeHtml(item.url)}</div>
        </li>
    `).join('');
}

historyList.addEventListener('click', (e) => {
    const item = e.target.closest('.history-item');
    if (!item) return;
    const idx = parseInt(item.dataset.index);
    const entry = history[idx];
    if (!entry) return;
    methodSelect.value = entry.method;
    updateMethodColor();
    urlInput.value = entry.url;
});

clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('ee_history');
    renderHistory();
});

// ── Tab indent in body editor ──
bodyEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = bodyEditor.selectionStart;
        const end = bodyEditor.selectionEnd;
        bodyEditor.value = bodyEditor.value.substring(0, start) + '  ' + bodyEditor.value.substring(end);
        bodyEditor.selectionStart = bodyEditor.selectionEnd = start + 2;
    }
});

// ── Example Chips ──
document.querySelectorAll('.example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const method = chip.dataset.method;
        const url = chip.dataset.url;
        const body = chip.dataset.body;

        methodSelect.value = method;
        updateMethodColor();
        urlInput.value = url;

        if (body) {
            document.querySelector('input[name="body-type"][value="json"]').checked = true;
            document.querySelector('input[name="body-type"][value="json"]').dispatchEvent(new Event('change'));
            bodyEditor.value = JSON.stringify(JSON.parse(body), null, 2);

            // Switch to body tab
            requestTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const bodyTab = requestTabs.querySelector('[data-tab="body"]');
            bodyTab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
            document.getElementById('tab-body').style.display = 'block';
        }

        sendRequest();
    });
});

// ── Init ──
renderHistory();
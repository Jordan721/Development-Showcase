/* Export only selected job/pay fields; full workspace backups stay separate. */
document.addEventListener('DOMContentLoaded', () => {
    const openButton = document.getElementById('cash-compass-export-btn');
    const dialog = document.getElementById('cash-compass-export-dialog');
    const list = document.getElementById('cash-compass-export-list');
    const status = document.getElementById('cash-compass-export-status');
    const download = document.getElementById('cash-compass-download');
    const search = document.getElementById('cash-compass-export-search');
    const noMatches = document.getElementById('cash-compass-no-matches');
    let selectable = [];
    let rows = [];
    const selected = () => [...list.querySelectorAll('input:checked')].map(input => selectable[Number(input.value)]);
    function updateCount() {
        const count = selected().length;
        const visible = rows.filter(row => !row.label.hidden).length;
        const hiddenSelected = rows.filter(row => row.label.hidden && row.checkbox.checked).length;
        status.textContent = `${visible} of ${rows.length} jobs shown. ${count} selected${hiddenSelected ? ` (${hiddenSelected} outside this search)` : ''}. Download includes all selected jobs. Maximum 500.`;
        download.disabled = count === 0 || count > 500;
    }
    function applySearch() {
        const terms = search.value.trim().toLowerCase().replaceAll(',', '').split(/\s+/).filter(Boolean);
        rows.forEach(row => { row.label.hidden = !terms.every(term => row.searchText.includes(term)); });
        noMatches.hidden = rows.length === 0 || rows.some(row => !row.label.hidden);
        updateCount();
    }
    search.addEventListener('input', applySearch);
    openButton.addEventListener('click', () => {
        selectable = state.jobs.filter(job => typeof job.id === 'string' && job.id.trim());
        search.value = '';
        rows = [];
        list.replaceChildren();
        selectable.forEach((job, index) => {
            const label = document.createElement('label');
            label.className = 'cash-export-job';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = index;
            checkbox.checked = false;
            checkbox.addEventListener('change', updateCount);
            const details = document.createElement('span');
            const title = document.createElement('strong');
            title.textContent = `${job.role || 'Untitled role'} · ${job.company || 'Unknown company'}`;
            const meta = document.createElement('small');
            meta.textContent = `${STAGE_LABELS[job.stage] || job.stage}${job.location ? ' · ' + job.location : ''} · Advertised: ${job.salary || 'Not recorded'}${job.offerMilestone?.salaryOffered ? ' · Offer: ' + job.offerMilestone.salaryOffered : ''}`;
            details.append(title, meta);
            label.append(checkbox, details);
            list.append(label);
            rows.push({ label, checkbox, searchText: [job.role, job.company, job.location, STAGE_LABELS[job.stage], job.stage, job.salary, job.offerMilestone?.salaryOffered, job.offerWorksheet?.compensation].filter(Boolean).join(' ').toLowerCase().replaceAll(',', '') });
        });
        if (!selectable.length) list.textContent = 'Add a job to PipelineTrack before exporting pay planning details.';
        applySearch();
        dialog.showModal();
        search.focus();
    });
    document.getElementById('cash-compass-export-close').addEventListener('click', () => dialog.close());
    document.getElementById('cash-compass-select-all').addEventListener('click', () => {
        rows.filter(row => !row.label.hidden).forEach(row => { row.checkbox.checked = true; });
        updateCount();
    });
    document.getElementById('cash-compass-select-none').addEventListener('click', () => {
        list.querySelectorAll('input').forEach(input => { input.checked = false; });
        updateCount();
    });
    download.addEventListener('click', () => {
        const jobs = selected();
        if (!jobs.length || jobs.length > 500) return;
        const data = CashCompassTransfer.exportJobs(jobs);
        try { CashCompassTransfer.validate(data); } catch (error) { status.textContent = error.message; return; }
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `pipelinetrack-cash-compass-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = 'Export downloaded. In Cash Compass, open Career & Pay → Import jobs, review the file, then import.';
    });
});

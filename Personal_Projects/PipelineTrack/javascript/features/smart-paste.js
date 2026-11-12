'use strict';

const SMART_PASTE_FIELDS = [
  ['role', 'Job title', 'job-role', 'job\\s*title|position|role|title'],
  ['company', 'Company', 'job-company', 'company|employer|organization'],
  ['location', 'Location', 'job-location', 'location|office|based in'],
  ['salary', 'Salary', 'job-salary', 'salary|pay range|compensation|pay|rate'],
  ['workType', 'Work arrangement', 'job-work-type', 'work arrangement|work model|work setting'],
  ['jobType', 'Employment type', 'job-type', 'employment type|job type'],
  ['seniority', 'Seniority', 'job-seniority', 'seniority|career level|experience level'],
  ['deadline', 'Apply-by deadline', 'job-deadline', 'apply by|application deadline|closing date|deadline'],
  ['datePosted', 'Posting date', 'job-date-posted', 'date posted|posted|listing date'],
  ['url', 'Posting link', 'job-url', 'job url|posting url|job link|apply link'],
  ['benefits', 'Benefits', 'job-benefits', 'benefits|perks']
];

function buildSmartPasteReview(text) {
  const raw = text.trim();
  const parsed = parseJobListing(raw);
  return SMART_PASTE_FIELDS.map(([key, label, id, pattern]) => {
    const matches = [...raw.matchAll(new RegExp('^[\\t ]*(?:' + pattern + ')[\\t ]*[:\\u2013\\u2014-][\\t ]*([^\\r\\n]+)$', 'gim'))]
      .filter(match => match[1].trim());
    const explicit = matches.length === 1;
    const evidence = matches.map(match => match[0].trim()).join(' / ');
    let value = explicit ? matches[0][1].trim() : '';
    if (['salary', 'workType', 'jobType', 'seniority'].includes(key)) {
      // Parse only the labeled line: unrelated prose must not influence this field.
      value = explicit ? (parseJobListing(evidence)[key] || '') : (parsed[key] || '');
    } else if (!matches.length && ['role', 'company', 'location'].includes(key)) value = parsed[key] || '';
    if (key === 'benefits') value = explicit ? value : '';
    let valid = !!value;
    if (key === 'deadline' || key === 'datePosted') {
      const date = value ? parseJobDate(value) : null;
      valid = !!(date && date.date && (key !== 'deadline' || !date.approximate)
        && (key !== 'datePosted' || date.date <= jobDateISO(new Date())));
      if (valid) value = `${date.approximate ? 'On or before ' : ''}${date.date}`;
    }
    if (key === 'url' && value) {
      try {
        valid = ['http:', 'https:'].includes(new URL(value).protocol);
      } catch {
        valid = false;
      }
    }
    // Conflicting labels are never selected automatically.
    if (matches.length > 1) value = '';
    const exactChoice = !['workType', 'jobType', 'seniority'].includes(key) ||
      (explicit && matches[0][1].trim().toLowerCase().replace(/[\s-]+/g, '') === value.toLowerCase().replace(/[\s-]+/g, ''));
    return {
      key,
      label,
      id,
      value,
      evidence,
      confident: explicit && valid && exactChoice,
      valid
    };
  });
}

function resetSmartPasteReview() {
  const review = document.getElementById('smart-paste-review');
  review.hidden = true;
  review.replaceChildren();
}

function reviewSmartPaste() {
  const text = document.getElementById('smart-paste-input').value.trim();
  if (!text) {
    document.getElementById('smart-paste-input').focus();
    return;
  }
  const candidates = buildSmartPasteReview(text);
  const review = document.getElementById('smart-paste-review');
  review.hidden = false;
  review.innerHTML = `<h3>Review before filling</h3><p>Only checked details will be added. Existing fields stay as you entered them. Unclear suggestions need your confirmation.</p><div class="smart-review-fields">${candidates.map((field, index) => {
    const current = document.getElementById(field.id).value.trim();
    const control = document.getElementById(field.id);
    const options = control.tagName === 'SELECT' ? [...control.options].filter(option => option.value) : null;
    const input = options ? `<select id="smart-value-${index}" class="select-input" ${current ? 'disabled' : ''}><option value="">Choose a value</option>${options.map(option => `<option value="${escHtml(option.value)}" ${option.value === field.value ? 'selected' : ''}>${escHtml(option.textContent)}</option>`).join('')}</select>` : `<input id="smart-value-${index}" class="text-input" value="${escHtml(current || field.value)}" placeholder="Not clear — enter if known" ${current ? 'disabled' : ''}>`;
    return `<div class="smart-review-field"><label class="smart-review-label"><input type="checkbox" data-smart-field="${index}" ${current ? 'disabled' : field.confident ? 'checked' : ''}>${field.label}<span>${current ? 'Keep existing' : field.confident ? 'Found in posting' : 'Needs review'}</span></label><label class="sr-only" for="smart-value-${index}">${field.label} to add</label>${input}<small>${escHtml(current ? `Keeping: ${current}` : field.evidence || 'No clearly labeled value found. Leave unchecked if unsure.')}</small></div>`;
  }).join('')}</div><p>The entire original posting will be kept. An empty description will receive the full text.</p><button type="button" class="btn-primary" id="smart-paste-apply">Apply checked details</button><p id="smart-paste-review-status" role="status" aria-live="polite"></p>`;
  review.querySelectorAll('[id^="smart-value-"]').forEach((input, index) => {
    input.addEventListener('input', () => {
      const checkbox = review.querySelector(`[data-smart-field="${index}"]`);
      if (!checkbox.disabled) checkbox.checked = !!input.value.trim();
    });
  });
  document.getElementById('smart-paste-apply').addEventListener('click', () => {
    const values = {};
    const errors = [];
    candidates.forEach((field, index) => {
      const selected = review.querySelector(`[data-smart-field="${index}"]`);
      if (!selected.checked || selected.disabled || document.getElementById(field.id).value.trim()) return;
      const value = document.getElementById(`smart-value-${index}`).value.trim();
      if (!value) {
        errors.push(`Enter ${field.label.toLowerCase()} or uncheck it.`);
        return;
      }
      if (field.key === 'deadline' || field.key === 'datePosted') {
        const date = parseJobDate(value);
        if (!date || !date.date || (field.key === 'deadline' && date.approximate) || (field.key === 'datePosted' && date.date > jobDateISO(new Date()))) {
          errors.push(`Review the ${field.label.toLowerCase()}. Use a specific date for deadlines.`);
          return;
        }
      }
      if (field.key === 'url') {
        try {
          if (!['http:', 'https:'].includes(new URL(value).protocol)) throw new Error();
        } catch {
          errors.push('The posting link must start with https:// or http://.');
          return;
        }
      }
      values[field.key] = value;
    });
    const status = document.getElementById('smart-paste-review-status');
    if (errors.length) {
      status.textContent = errors.join(' ');
      return;
    }
    const count = applySmartPasteValues(values, text);
    resetSmartPasteReview();
    document.getElementById('smart-paste-panel').classList.remove('open');
    toast(`Added ${count} detail${count === 1 ? '' : 's'}. Review the form before saving.`, 'success');
  });
}

function applySmartPasteValues(values, original) {
  let count = 0;
  SMART_PASTE_FIELDS.forEach(([key, , id]) => {
    const control = document.getElementById(id);
    if (!values[key] || control.value.trim()) return;
    if (key === 'salary') {
      const parts = splitSalaryAndPayPeriod(values[key]);
      control.value = parts.salary;
      const period = document.getElementById('job-pay-period');
      if (period.dataset.manual !== 'true') period.value = parts.payPeriod;
      updateSalaryPreview();
    } else control.value = values[key];
    if (key === 'deadline' || key === 'datePosted') previewJobDate(id);
    count++;
  });
  const description = document.getElementById('job-description');
  if (!description.value.trim()) description.value = original;
  document.getElementById('job-smart-paste-original').value = original;
  if (values.url) updateJobSourceFromUrl();
  updateHybridDaysVisibility(false);
  updateJobDurationVisibility(false);
  updateJobDuplicateNotice();
  return count;
}

/* Versioned, data-only contract shared by PipelineTrack and Cash Compass. */
(function (root) {
    'use strict';
    const kind = 'pipelinetrack-cash-compass';
    const stages = ['saved', 'applied', 'screening', 'interview', 'offer', 'declined', 'withdrew', 'ghosted', 'archived'];
    const periods = { year: 1 / 12, month: 1, biweekly: 26 / 12, week: 52 / 12, day: 260 / 12, hour: 2080 / 12 };
    const text = (value, max = 1000) => typeof value === 'string' ? value.trim().slice(0, max) : '';

    function exportJobs(jobs) {
        return {
            kind, version: 1, exportedAt: new Date().toISOString(),
            jobs: jobs.map(job => ({
                sourceJobId: text(job.id, 200), company: text(job.company, 200), role: text(job.role, 200),
                stage: stages.includes(job.stage) ? job.stage : 'saved',
                advertisedPay: text(job.salary), offerPay: text(job.offerMilestone?.salaryOffered),
                totalCompensation: text(job.offerWorksheet?.compensation),
                payPeriodInferred: job.salaryPayPeriodInferred === true
            }))
        };
    }

    function validate(data) {
        if (!data || data.kind !== kind || data.version !== 1 || !Array.isArray(data.jobs) || !data.jobs.length || data.jobs.length > 500) {
            throw new Error('Choose a Cash Compass pay-planning export from PipelineTrack (up to 500 jobs).');
        }
        const seen = new Set();
        return data.jobs.map(job => {
            if (!job || typeof job !== 'object' || typeof job.sourceJobId !== 'string' || !job.sourceJobId.trim() || job.sourceJobId.length > 200 || seen.has(job.sourceJobId.trim())) {
                throw new Error('The export has missing or duplicate job IDs. Export it again from PipelineTrack.');
            }
            for (const field of ['company', 'role', 'advertisedPay', 'offerPay', 'totalCompensation']) {
                if (typeof job[field] !== 'string' || job[field].length > 1000) throw new Error('The export contains invalid job details.');
            }
            if (!stages.includes(job.stage)) throw new Error('The export contains an unknown application stage.');
            const normalized = {
                sourceJobId: job.sourceJobId.trim(), company: text(job.company, 200) || 'Unknown company',
                role: text(job.role, 200) || 'Untitled role', stage: job.stage,
                advertisedPay: text(job.advertisedPay), offerPay: text(job.offerPay),
                totalCompensation: text(job.totalCompensation), payPeriodInferred: job.payPeriodInferred === true
            };
            seen.add(normalized.sourceJobId);
            return normalized;
        });
    }

    // Only simple, explicitly USD, single amounts or ranges are prefilled.
    // Compound compensation, other currencies and ambiguous periods need review.
    function parsePay(raw, inferred = false) {
        const fallback = { low: '', high: '', period: '' };
        if (typeof raw !== 'string' || !/(?:\$|\bUSD\b)/i.test(raw) || /\b(?:CAD|AUD|NZD|SGD|HKD|EUR|GBP|INR|CNY|JPY|bonus|equity|stock|OTE|total)\b|[€£₹¥+%]/i.test(raw) || /(?:CA|AU|NZ|SG|HK|C)\s*\$/i.test(raw)) return fallback;
        let period = '';
        const patterns = [
            ['biweekly', /\b(?:biweekly|bi-weekly|every\s+(?:2|two)\s+weeks)\b/gi],
            ['hour', /(?:\/\s*(?:h|hr|hrs|hour)|\b(?:per\s+)?(?:hour|hourly|hr|hrs))\b/gi],
            ['day', /(?:\/\s*(?:d|day)|\b(?:per\s+)?(?:day|daily))\b/gi],
            ['week', /(?:\/\s*(?:w|wk|week)|\b(?:per\s+)?(?:week|weekly))\b/gi],
            ['month', /(?:\/\s*(?:mo|month)|\b(?:per\s+)?(?:month|monthly))\b/gi],
            ['year', /(?:\/\s*(?:y|yr|year)|\b(?:per\s+)?(?:year|yearly|annual|annually|annum))\b/gi]
        ];
        let amount = raw;
        for (const [name, pattern] of patterns) {
            if (pattern.test(amount)) {
                if (period) return fallback;
                period = name;
                amount = amount.replace(pattern, '');
            }
        }
        amount = amount.replace(/USD|\$/gi, '').trim();
        const match = /^(\d+(?:,\d{3})*(?:\.\d+)?)\s*([kK]?)\s*(?:[-–—]\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*([kK]?))?$/.exec(amount);
        if (!match) return fallback;
        const low = Number(match[1].replaceAll(',', '')) * (match[2] || match[4] ? 1000 : 1);
        const high = match[3] ? Number(match[3].replaceAll(',', '')) * (match[4] ? 1000 : 1) : low;
        if (!(low > 0 && high >= low && high <= 1e9)) return fallback;
        return { low, high, period: inferred ? '' : period };
    }

    function fingerprint(job) {
        return JSON.stringify([job.advertisedPay, job.offerPay, job.payPeriodInferred]);
    }

    function merge(existing, incoming) {
        const map = new Map(existing.map(job => [job.sourceJobId, job]));
        incoming.forEach(job => {
            const previous = map.get(job.sourceJobId);
            map.set(job.sourceJobId, {
                ...job,
                // Changed source pay invalidates an old reviewed estimate.
                estimate: previous && fingerprint(previous) === fingerprint(job) ? previous.estimate : null
            });
        });
        return [...map.values()];
    }

    function monthly(low, high, period, deductions) {
        if (!Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low || high > 1e9 || !Object.hasOwn(periods, period) || !Number.isFinite(deductions) || deductions < 0 || deductions > 100) return null;
        return [low, high].map(amount => amount * periods[period] * (1 - deductions / 100));
    }

    const api = { exportJobs, validate, parsePay, merge, monthly, periods };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CashCompassTransfer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

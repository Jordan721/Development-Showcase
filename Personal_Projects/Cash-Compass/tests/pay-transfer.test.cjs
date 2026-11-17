const test = require('node:test');
const assert = require('node:assert/strict');
const transfer = require('../pay-transfer.js');
const job = (id = 'job-1') => ({ id, role: 'Engineer', company: 'Example', stage: 'applied', salary: '$80k – $100k / year', notes: 'Private', resume: 'Private', offerMilestone: { salaryOffered: '$95,000 / year' }, offerWorksheet: { compensation: '$110,000 including equity', negotiation: 'Private' } });

test('export validates and includes only selected identity and pay details', () => {
    const exported = transfer.exportJobs([job()]);
    const [item] = transfer.validate(exported);
    assert.equal(item.sourceJobId, 'job-1');
    assert.equal(item.offerPay, '$95,000 / year');
    assert.equal(item.totalCompensation, '$110,000 including equity');
    assert.equal(exported.jobs.length, 1);
    for (const value of ['notes', 'resume', 'negotiation']) assert(!JSON.stringify(exported).includes(value));
});

test('simple ranges retain their low/high values and explicit periods', () => {
    assert.deepEqual(transfer.parsePay('$80k – $100k / year'), { low: 80000, high: 100000, period: 'year' });
    assert.deepEqual(transfer.parsePay('USD 25-30 hourly'), { low: 25, high: 30, period: 'hour' });
    assert.deepEqual(transfer.parsePay('$2,000 biweekly'), { low: 2000, high: 2000, period: 'biweekly' });
    assert.equal(transfer.parsePay('$95,000 / year', true).period, '');
    assert.equal(transfer.parsePay('$95,000').period, '');
});

test('foreign currencies, compound compensation and vague salaries need manual review', () => {
    for (const input of ['CAD $80,000 / year', 'C$80000/year', '€80,000 / year', '$80k + $10k bonus', '$100k OTE', '$80,000-$90,000 / year / month', 'competitive', '90000', '$100k-80k/year']) {
        assert.deepEqual(transfer.parsePay(input), { low: '', high: '', period: '' }, input);
    }
});

test('monthly ranges apply pay period and user deductions without treating applications as income', () => {
    assert.deepEqual(transfer.monthly(60000, 90000, 'year', 20), [4000, 6000]);
    assert.deepEqual(transfer.monthly(2000, 2000, 'biweekly', 0), [2000 * 26 / 12, 2000 * 26 / 12]);
    assert(Math.abs(transfer.monthly(25, 25, 'hour', 0)[0] - 25 * 2080 / 12) < 1e-8);
    assert(Math.abs(transfer.monthly(250, 250, 'day', 0)[0] - 250 * 260 / 12) < 1e-8);
    for (const args of [[100, 50, 'month', 0], [100, 100, '', 0], [100, 100, 'month', -1], [100, 100, 'month', 101], [NaN, 100, 'month', 0], [0, 0, 'year', 0]]) assert.equal(transfer.monthly(...args), null);
});

test('imports update by ID, preserve other jobs, and reset reviewed pay only when source pay changes', () => {
    const first = transfer.validate(transfer.exportJobs([job(), job('job-2')]));
    first[0].estimate = { low: 95000, high: 95000, period: 'year', confirmed: true };
    const updated = { ...first[0], stage: 'offer' };
    let merged = transfer.merge(first, [updated]);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].stage, 'offer');
    assert.equal(merged[0].estimate.confirmed, true);
    merged = transfer.merge(merged, [{ ...updated, offerPay: '$105,000/year' }]);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].estimate, null);
    assert.equal(transfer.merge(merged, [merged[0]]).length, 2);
});

test('invalid, duplicate, unknown-version and oversized imports fail without mutation', () => {
    const good = transfer.exportJobs([job()]);
    const snapshot = JSON.stringify(good);
    for (const bad of [null, {}, { ...good, version: 2 }, { ...good, jobs: [] }, { ...good, jobs: [good.jobs[0], good.jobs[0]] }, { ...good, jobs: [{ ...good.jobs[0], sourceJobId: '' }] }, { ...good, jobs: [{ ...good.jobs[0], stage: 'unknown' }] }, { ...good, jobs: [{ ...good.jobs[0], advertisedPay: {} }] }, { ...good, jobs: Array(501).fill(good.jobs[0]) }]) assert.throws(() => transfer.validate(bad));
    assert.equal(JSON.stringify(good), snapshot);
});

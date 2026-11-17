# Cash Compass

A browser-local personal finance workspace. Built with HTML, CSS, and JavaScript; no build step, bank login, external chart library, or server is required.

Open `index.html` through the repository's static server or GitHub Pages. Currency is USD.

## What it does

- **Overview:** select a reporting month to see recorded income, expenses, surplus, savings rate, six-month cash-flow bars, spending categories, recent transactions, and upcoming bill occurrences. Exact chart figures are available in a table.
- **Transactions:** add and edit income/expenses, search by description/category/amount/date, filter by type/category/month, switch to all dates, select matching results across pages, bulk delete with confirmation, and export matching transactions as CSV. Selections outside the filters are counted explicitly.
- **Budgets:** set category limits that repeat each month and compare them with spending in the selected reporting month. A zero limit means unbudgeted. Unbudgeted expenses still count in the overview.
- **Bills & Goals:** track monthly recurring bill dates. Marking a bill paid explicitly creates one expense and advances one occurrence. Month-end dates stay anchored (January 31 → February 28/29 → March 31). Savings goals track manually entered progress without creating transactions.
- **Career & Pay:** plan savings runway, gross pay, estimated deductions, monthly take-home, and money left after living costs. Import and compare PipelineTrack jobs, review USD base pay and period, and load a low estimate into the planner. Save the plan separately.
- **Data Settings:** export a complete JSON backup, preview and restore a backup, remove selected data groups, or explore a separate temporary demo workspace.

## PipelineTrack connection

1. In PipelineTrack, open **My Profile → Data Backup → Export to Cash Compass**.
2. Search by company, role, location, stage, or pay. Select the jobs to export (up to 500); hidden selections remain counted. Download the pay-planning JSON.
3. In Cash Compass, open **Career & Pay → Import jobs**. Review the preview and import.
4. Review each comparison's USD base-pay range and pay period. Foreign currencies and complex compensation require manual entry. Total compensation is reference only and is never automatically treated as base pay.
5. Enter living costs and estimated deductions in the plan above. Reviewed comparisons show monthly pay and money left after those costs. **Use low estimate** fills the plan; **Save plan** persists it.

Applications and offers are potential income, not received pay. No job import, estimate, or plan creates a paycheck transaction. This is a manual file transfer, not automatic sync. Repeat imports update jobs by PipelineTrack job ID and preserve absent jobs; changed source pay resets its reviewed estimate. Up to 1,000 comparisons are supported. Removing comparisons never changes the original PipelineTrack jobs. Older `#planning` links still open Career & Pay.

## Delete data

For individual or selected records, use **Transactions** or **Career & Pay**. **Select results** selects every matching record, including other pages. Check the count before deleting; selections persist across filters.

For whole groups, open **Data Settings → Manage / delete data**. Select transactions, budgets, bills, goals, the plan, and/or job comparisons; read the summary and confirm. Nothing is selected by default. Unselected groups stay. Deleting bill schedules preserves recorded payments; deleting payment transactions does not rewind bill schedules. Export a backup first to keep a copy.

## Data and recovery

The rebuilt app uses one versioned local-storage record, `cashCompass.workspace.v2`. Changes are validated and written atomically before the in-memory workspace updates. Conflicting writes from another tab are rejected; reload before saving. Storage errors preserve the last saved workspace.

The app migrates the previous `transactions`, `budgets`, `cashCompass.plan`, and `cashCompass.jobComparisons.v1` records on first successful load. Legacy copies are removed only after the complete new workspace is successfully saved, so deleting records does not leave old copies behind. Failed migration preserves the originals. If browser storage prevents legacy cleanup, a warning appears after saving; the versioned workspace still takes precedence.

JSON backups include all groups and support complete restore after a preview. Earlier Cash Compass JSON backups containing transactions and budgets are also supported; groups absent from an older backup restore as empty. PipelineTrack pay-planning exports are not full backups. **Download raw recovery copy** preserves raw local-storage values for manual recovery if a workspace cannot be opened. Corrupted saved data is never silently replaced.

**Explore demo workspace** uses fictional records in memory only. It never overwrites or mixes with personal records. Changes and imports made in demo mode are temporary; **Return to my data** reloads saved records. Demo backups are labeled in their filename.

## Financial definitions

Monthly surplus means recorded income minus recorded expenses; it is not a bank balance. Savings rate can be negative when spending exceeds income and is unavailable when no income is recorded. Runway assumes no income and equals available savings divided by expected monthly living costs. Goals are planning balances, not bank-linked accounts.

Deductions are user estimates, not calculated taxes. Hourly pay assumes 40 hours/week; daily pay assumes 5 days/week; both use 52 weeks/year. Biweekly means 26 payments/year. All comparisons are USD; there is no currency conversion.

## Files and checks

- `index.html`: application shell, navigation, accessible icon symbols, and dialog.
- `styles.css`: responsive layout and light/dark themes.
- `script.js`: screens, forms, charts, import previews, and interactions.
- `model.js`: validation, storage, migration, financial operations, CSV and backup formats.
- `pay-transfer.js`: shared versioned contract also used by PipelineTrack.
- `tests/`: Node tests for finance operations, storage, migration, transfer validation, and app structure.

Run `node --test tests/*.test.cjs` from this directory. The application has no runtime package dependencies.

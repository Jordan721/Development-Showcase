/* Cash Compass application. Every saved change passes through the versioned model. */
document.addEventListener('DOMContentLoaded', () => {
 'use strict';
 const M = CashCompassModel, T = CashCompassTransfer;
 const $ = id => document.getElementById(id);
 const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
 const cash = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:2 }).format(value);
 const compactCash = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', notation:'compact', maximumFractionDigits:1 }).format(value);
 const dateLabel = date => new Date(date+'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
 const monthLabel = month => new Date(month+'-15T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'});
 const periods = { year:'Yearly', month:'Monthly', biweekly:'Every 2 weeks', week:'Weekly', day:'Daily · 5 days/week', hour:'Hourly · 40h/week' };
 const colors = ['#4478ed','#63c9b3','#b3a1e8','#f0b56e','#e78da9','#7caccd','#8fc1a0','#c3a27e','#9ca8e1','#ce9bc5','#87babb'];
 const pages = {
  overview:['Overview','YOUR FINANCIAL PULSE','Your money, in focus','A clear view of today. A confident plan for what’s next.'],
  transactions:['Transactions','THE EVERYDAY DETAILS','Every transaction, accounted for','Add, find, edit, and remove the records that tell your money story.'],
  budgets:['Budgets','SPEND WITH INTENTION','Give every category a little direction','Monthly category limits repeat each month. Track actual spending against them.'],
  bills:['Bills & Goals','BUILD YOUR MOMENTUM','Make room for the things that matter','Stay ahead of recurring payments and keep your savings goals in sight.'],
  career:['Career & Pay','YOUR NEXT CHAPTER','Put your next opportunity in perspective','Connect potential pay to real living costs, without mixing it with received income.'],
  settings:['Data Settings','YOUR WORKSPACE, YOUR CONTROL','Keep it safe. Keep it yours','Export, restore, and manage the data stored in this browser.']
 };
 let store, state = M.empty(), demo = false, view='overview', month=M.today().slice(0,7), toastTimer, modalVersion=0, planDirty=false;
 let txPage=1, jobPage=1;
 const selectedTransactions = new Set(), selectedJobs = new Set();
 try { store = new M.Store(localStorage); const loaded=store.load(); state=loaded.state; if(loaded.migrated) notify('Your previous Cash Compass records are ready in the new workspace.'); }
 catch(error) { $('recoveryBanner').hidden=false; $('recoveryBanner').textContent=error.message; }
 try { document.documentElement.dataset.theme=localStorage.getItem('cashCompass.theme') || (localStorage.getItem('darkMode')==='true'?'dark':'light'); } catch(_) { document.documentElement.dataset.theme='light'; }
 $('reportMonth').value=month;
 $('transactionCategoryFilter').innerHTML='<option value="all">All categories</option>'+[...M.categories.income,...M.categories.expense].map(name=>`<option>${esc(name)}</option>`).join('');
 $('jobStageFilter').innerHTML='<option value="all">All stages</option>'+Object.entries(M.stages).map(([key,name])=>`<option value="${key}">${name}</option>`).join('');
 $('payPlanForm').elements.period.innerHTML=Object.entries(periods).map(([key,name])=>`<option value="${key}">${name}</option>`).join('');
 function notify(message,error=false) { clearTimeout(toastTimer); $('toast').textContent=message; $('toast').className='toast'+(error?' error':''); $('toast').hidden=false; toastTimer=setTimeout(()=>{$('toast').hidden=true;},5500); }
 function commit(next,message='Changes saved in this browser.',force=false) {
  const saved=demo?M.normalize(next):store.save(next,force);
  state=saved;
  for(const id of selectedTransactions) if(!state.transactions.some(row=>row.id===id)) selectedTransactions.delete(id);
  for(const id of selectedJobs) if(!state.jobs.some(row=>row.sourceJobId===id)) selectedJobs.delete(id);
  if(!demo) { $('recoveryBanner').hidden=true; $('savedLabel').innerHTML=icon('check')+' Saved in this browser'; }
  render(); if(message) notify(demo?message+' Demo changes are temporary.':store.cleanupWarning?message+' Browser storage could not remove some legacy copies.':message,!!store?.cleanupWarning&&!demo);
 }
 function empty(title,description,action='',label='',symbol='wallet',small=false) {
  return `<div class="empty${small?' inline':''}">${icon(symbol)}<h3>${esc(title)}</h3><p>${esc(description)}</p>${action?`<button class="button secondary compact" data-action="${action}">${icon('plus')}${esc(label)}</button>`:''}</div>`;
 }
 function closeModal() { modalVersion++; $('editor').close(); }
 function modal(title,body,onSubmit,label='Save',danger=false) {
  if($('editor').open) closeModal();
  const version=++modalVersion;
  $('dialogTitle').textContent=title; $('dialogBody').onchange=null; $('dialogBody').innerHTML=body; $('dialogError').hidden=true;
  $('dialogSubmit').textContent=label; $('dialogSubmit').className='button '+(danger?'danger':'primary'); $('dialogSubmit').disabled=false;
  let busy=false;
  $('dialogForm').onsubmit=async event=>{
   event.preventDefault(); if(busy || !$('dialogForm').reportValidity()) return; busy=true; $('dialogSubmit').disabled=true;
   try { await onSubmit(new FormData($('dialogForm'))); if(version===modalVersion) closeModal(); }
   catch(error) { if(version===modalVersion) { $('dialogError').textContent=error.message; $('dialogError').hidden=false; } }
   finally { busy=false; if(version===modalVersion) $('dialogSubmit').disabled=false; }
  };
  $('editor').showModal(); return version;
 }
 function confirmAction(title,description,onSubmit,label='Delete') { modal(title,`<p class="dialog-copy">${esc(description)}</p>`,onSubmit,label,true); }
 function field(label,name,value='',type='text',extra='') { return `<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`; }
 function select(label,name,items,value) { return `<label>${esc(label)}<select name="${name}">${Object.entries(items).map(([key,name])=>`<option value="${esc(key)}"${key===value?' selected':''}>${esc(name)}</option>`).join('')}</select></label>`; }
 function amountField(label,name,value=0,positive=false) { return field(label,name,value,'number',`min="${positive?'0.01':'0'}" max="1000000000" step="0.01" required`); }
 function download(content,name,type='application/json') { const url=URL.createObjectURL(new Blob([content],{type})); const link=document.createElement('a'); link.href=url; link.download=name; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
 function exportBackup() { if(!demo&&store?.blocked)throw new Error('Saved data could not be opened. Download a raw recovery copy in Data Settings instead.'); download(JSON.stringify(M.backup(state),null,2),`cash-compass-${demo?'demo-':''}backup-${M.today()}.json`); notify('JSON backup downloaded.'); }
 function route() {
  const hash=location.hash.slice(1); const aliases={planning:'career',budget:'budgets',analytics:'overview',entry:'transactions'};
  view=aliases[hash] || (Object.hasOwn(pages,hash)?hash:'overview');
  document.querySelectorAll('[data-page]').forEach(node=>{node.hidden=node.dataset.page!==view;});
  document.querySelectorAll('[data-route]').forEach(node=>{const active=node.dataset.route===view; node.classList.toggle('active',active); if(active)node.setAttribute('aria-current','page');else node.removeAttribute('aria-current');});
  const [name,eyebrow,title,description]=pages[view]; $('pageName').textContent=name; $('pageEyebrow').textContent=eyebrow; $('pageTitle').innerHTML=esc(title)+'<span>.</span>'; $('pageDescription').textContent=description;
  $('periodControl').hidden=!['overview','transactions','budgets'].includes(view); document.title=name+' · Cash Compass';
  closeSidebar(); render(); window.scrollTo({top:0,behavior:'instant'});
 }
 function closeSidebar() { $('sidebar').classList.remove('open'); $('sidebarScrim').hidden=true; $('menuToggle').setAttribute('aria-expanded','false'); }
 function render() { if(view==='overview')renderOverview(); if(view==='transactions')renderTransactions(); if(view==='budgets')renderBudgets(); if(view==='bills')renderBills(); if(view==='career')renderCareer(); if(view==='settings')renderSettings(); }
 function previousMonth() { const d=new Date(month+'-15T12:00:00');d.setMonth(d.getMonth()-1);return M.today(d).slice(0,7); }
 function changeBadge(current,previous,expense=false) {
  if(!previous)return '<span>No prior-month baseline</span>';
  const change=(current-previous)/previous*100;const good=expense?change<=0:change>=0;
  return `<span class="trend-badge${good?'':' negative'}">${change>0?'+':''}${change.toFixed(1)}%</span><span>vs previous month</span>`;
 }
 function recentTable(rows,selectable=false) {
  if(!rows.length)return empty('No transactions here yet','Add your first income or expense, or try the separate demo workspace.','add-transaction','Add transaction');
  return `<div class="table-wrap"><table><thead><tr>${selectable?'<th scope="col">Select</th>':''}<th scope="col">Transaction</th><th scope="col">Date</th><th scope="col">Amount</th><th scope="col">Actions</th></tr></thead><tbody>${rows.map(row=>`<tr>${selectable?`<td><input type="checkbox" data-select-transaction="${esc(row.id)}" aria-label="Select ${esc(row.description)}"${selectedTransactions.has(row.id)?' checked':''}></td>`:''}<td><div class="table-description"><span class="transaction-symbol ${row.type}">${icon(row.type==='income'?'down':'wallet')}</span><div><strong>${esc(row.description)}</strong><small>${esc(row.category)}${row.billId?' · Bill payment':''}</small></div></div></td><td>${esc(dateLabel(row.date))}</td><td class="amount ${row.type==='income'?'income-text':''}">${row.type==='income'?'+':'−'}${cash(row.amount)}</td><td><div class="row-actions"><button class="icon-button" data-action="edit-transaction" data-id="${esc(row.id)}" aria-label="Edit ${esc(row.description)}">${icon('edit')}</button><button class="icon-button" data-action="delete-transaction" data-id="${esc(row.id)}" aria-label="Delete ${esc(row.description)}">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>`;
 }
 function trendChart() {
  const rows=M.trend(state,month);
  if(!rows.some(row=>row.count))return empty('Your cash flow, visualized','Record transactions to see six months of income and spending.','','','budget',true);
  const max=Math.max(1,...rows.flatMap(row=>[row.income,row.expenses])); const ceiling=Math.ceil(max/100)*100;
  const grid=[0,1,2,3].map(i=>{const y=24+i*54;return `<line class="chart-line" x1="52" x2="572" y1="${y}" y2="${y}"/><text class="chart-text" x="0" y="${y+3}">${esc(compactCash(ceiling*(3-i)/3))}</text>`;}).join('');
  const bars=rows.map((row,i)=>{const x=66+i*85;const income=row.income/ceiling*162,expense=row.expenses/ceiling*162;return `<g><rect x="${x}" y="${186-income}" width="20" height="${income}" rx="4" fill="#4478ed"><title>${esc(monthLabel(row.month))}: income ${cash(row.income)}</title></rect><rect x="${x+25}" y="${186-expense}" width="20" height="${expense}" rx="4" fill="#63c9b3"><title>${esc(monthLabel(row.month))}: expenses ${cash(row.expenses)}</title></rect><text class="chart-text" text-anchor="middle" x="${x+22}" y="211">${new Date(row.month+'-15T12:00:00').toLocaleDateString('en-US',{month:'short'})}</text></g>`;}).join('');
  return `<svg class="trend-chart" viewBox="0 0 590 225" role="img" aria-label="Six-month income and expense comparison; exact values in the table below">${grid}${bars}</svg><details class="chart-access"><summary>View exact monthly figures</summary><table><thead><tr><th>Month</th><th>Income</th><th>Expenses</th></tr></thead><tbody>${rows.map(row=>`<tr><td>${monthLabel(row.month)}</td><td>${cash(row.income)}</td><td>${cash(row.expenses)}</td></tr>`).join('')}</tbody></table></details>`;
 }
 function categoryChart() {
  const rows=M.spending(state,month),total=M.sum(rows);
  if(!total)return empty('Where does your money go?','Expense categories appear here as you record spending.','','','budget',true);
  let offset=0;const gradient=rows.map((row,i)=>{const start=offset;offset+=row.amount/total*100;return `${colors[i%colors.length]} ${start}% ${offset}%`;}).join(',');
  return `<div class="donut-layout"><div class="donut" style="background:conic-gradient(${gradient})" role="img" aria-label="Expense breakdown listed below"><div><small>Total spent</small><strong>${compactCash(total)}</strong></div></div><div class="category-legend">${rows.map((row,i)=>`<div><span class="legend-dot" style="background:${colors[i%colors.length]}"></span><span>${esc(row.category)}</span><strong>${cash(row.amount)}</strong><small>${(row.amount/total*100).toFixed(0)}%</small></div>`).join('')}</div></div>`;
 }
 function renderOverview() {
  const totals=M.totals(state,month),previous=M.totals(state,previousMonth());
  const recent=state.transactions.filter(row=>row.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)).slice(0,5);
  const bills=state.bills.slice().sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3);
  const spending=new Map(M.spending(state,month).map(row=>[row.category,row.amount]));
  const over=Object.entries(state.budgets).filter(([name,limit])=>limit>0&&(spending.get(name)||0)>limit);
  $('overviewContent').innerHTML=`<div class="summary-grid"><article class="balance-card"><div class="metric-label">Monthly surplus ${icon('wallet')}</div><div><div class="metric-value">${cash(totals.surplus)}</div><div class="balance-foot"><span>Recorded income minus expenses</span><strong class="${totals.savingsRate!==null&&totals.savingsRate<0?'negative':''}">${totals.savingsRate===null?'No income yet':totals.savingsRate.toFixed(1)+'% savings rate'}</strong></div></div></article><article class="metric-card"><div class="metric-label">Income received<span class="metric-icon">${icon('down')}</span></div><div class="metric-value">${cash(totals.income)}</div><div class="metric-meta">${changeBadge(totals.income,previous.income)}</div></article><article class="metric-card"><div class="metric-label">Money spent<span class="metric-icon rose">${icon('up')}</span></div><div class="metric-value">${cash(totals.expenses)}</div><div class="metric-meta">${changeBadge(totals.expenses,previous.expenses,true)}</div></article></div>
  <div class="overview-grid"><div class="overview-stack"><article class="panel"><div class="panel-heading"><div><h2>Cash flow</h2><p>Income and expenses · six months ending ${esc(monthLabel(month))}</p></div><div class="chart-legend"><span class="legend-item"><i class="legend-dot"></i>Income</span><span class="legend-item"><i class="legend-dot teal"></i>Expenses</span></div></div>${trendChart()}</article><article class="panel"><div class="panel-heading"><div><h2>Recent activity</h2><p>${totals.count} records in ${esc(monthLabel(month))}</p></div><a class="text-button" href="#transactions">View all ${icon('arrow')}</a></div>${recentTable(recent)}</article></div><div class="overview-stack"><article class="panel"><div class="panel-heading"><div><h2>Spending breakdown</h2><p>See what takes the biggest share.</p></div>${icon('budget')}</div>${categoryChart()}</article><article class="panel"><div class="panel-heading"><div><h2>Upcoming bills</h2><p>Next unpaid occurrences · all dates</p></div><a class="text-button" href="#bills">View all ${icon('arrow')}</a></div>${bills.length?`<div class="quick-list">${bills.map(bill=>`<div class="quick-item"><span class="date-tile"><strong>${Number(bill.due.slice(-2))}</strong><small>${new Date(bill.due+'T12:00:00').toLocaleDateString('en-US',{month:'short'})}</small></span><div class="item-copy"><strong>${esc(bill.name)}</strong><small>${bill.due<M.today()?'Overdue · ':''}${dateLabel(bill.due)}</small></div><span class="amount">${cash(bill.amount)}</span></div>`).join('')}</div>`:empty('Stay a step ahead','Add recurring bills to see the next payments here.','add-bill','Add a bill','calendar',true)}</article><div class="checkin"><strong>${over.length?over.length+' categories over budget':totals.count?'Keep your next move in focus':'Start with your first transaction'}</strong><p>${over.length?'Review your category limits and adjust your spending plan.':totals.count?'Compare a salary or job offer against your actual monthly costs.':'Add income or spending to build your overview. You can also explore a separate demo workspace.'}</p><a class="text-button" href="#${over.length?'budgets':totals.count?'career':'transactions'}">${over.length?'Review budgets':totals.count?'Explore career & pay':'Open transactions'} ${icon('arrow')}</a></div></div></div>`;
 }
 function filteredTransactions() {
  const query=$('transactionSearch').value.trim().toLowerCase().replaceAll(',','');
  return state.transactions.filter(row=>($('allDates').checked||row.date.startsWith(month))&&($('transactionTypeFilter').value==='all'||row.type===$('transactionTypeFilter').value)&&($('transactionCategoryFilter').value==='all'||row.category===$('transactionCategoryFilter').value)&&[row.description,row.category,row.amount,row.date].join(' ').toLowerCase().replaceAll(',','').includes(query)).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
 }
 function pagination(total,page,size,kind) { const pages=Math.max(1,Math.ceil(total/size));return total?`<span>Page ${page} of ${pages} · ${total} records</span><div><button class="button secondary compact" data-action="${kind}-prev"${page<=1?' disabled':''}>Previous</button><button class="button secondary compact" data-action="${kind}-next"${page>=pages?' disabled':''}>Next</button></div>`:''; }
 function renderTransactions() {
  const rows=filteredTransactions();txPage=Math.min(txPage,Math.max(1,Math.ceil(rows.length/20)));
  $('transactionTable').innerHTML=rows.length?recentTable(rows.slice((txPage-1)*20,txPage*20),true):empty('No matching transactions','Try another filter, switch on All dates, or add a transaction.','add-transaction','Add transaction');
  updateTransactionSelection(rows);
  $('transactionPagination').innerHTML=pagination(rows.length,txPage,20,'tx');
 }
 function updateTransactionSelection(rows=filteredTransactions()) {
  const hidden=[...selectedTransactions].filter(id=>!rows.some(row=>row.id===id)).length;
  $('transactionCount').textContent=`${rows.length} matching · ${selectedTransactions.size} selected${hidden?' ('+hidden+' outside filters)':''}`;
  $('deleteSelectedTransactions').disabled=!selectedTransactions.size;
 }
 function editTransaction(id) {
  const row=id?state.transactions.find(row=>row.id===id):{type:'expense',category:'Other Expense',amount:'',description:'',date:M.today()};if(!row)throw new Error('Transaction not found.');
  const body=`<div class="form-grid">${select('Type','type',{expense:'Expense',income:'Income'},row.type)}${amountField('Amount ($)','amount',row.amount,true)}${field('Description','description',row.description,'text','maxlength="500" required')}${field('Date','date',row.date,'date','min="1900-01-01" max="2200-12-31" required')}${select('Category','category',Object.fromEntries(M.categories[row.type].map(name=>[name,name])),row.category)}</div>${row.billId?'<p class="fine-print">This record is a bill payment. Editing it does not change the recurring bill schedule.</p>':''}`;
  modal(id?'Edit transaction':'Add a transaction',body,data=>commit(M.upsertTransaction(state,{...(id?{id}:{}),type:data.get('type'),category:data.get('category'),amount:Number(data.get('amount')),description:data.get('description'),date:data.get('date')}),'Transaction saved.'));
  $('dialogForm').elements.type.addEventListener('change',event=>{const category=$('dialogForm').elements.category;category.innerHTML=M.categories[event.target.value].map(name=>`<option>${esc(name)}</option>`).join('');});
 }
 function renderBudgets() {
  const spent=new Map(M.spending(state,month).map(row=>[row.category,row.amount]));const limits=Object.values(state.budgets).reduce((total,value)=>total+value,0),used=Object.keys(state.budgets).reduce((total,name)=>total+(spent.get(name)||0),0);
  $('budgetContent').innerHTML=`<div class="mini-metrics"><div class="mini-metric"><span>Total monthly limits</span><strong>${cash(limits)}</strong></div><div class="mini-metric"><span>Spent in budgeted categories</span><strong>${cash(used)}</strong></div><div class="mini-metric"><span>Remaining across these categories</span><strong class="${used>limits?'expense-text':''}">${cash(limits-used)}</strong></div></div><div class="section-heading"><div><h2>Your monthly category limits</h2><p>Limits repeat each month; unbudgeted spending is still included in your overview.</p></div><button class="button primary" data-action="edit-budgets">${icon('edit')} Edit limits</button></div><div class="card-grid">${M.categories.expense.map(name=>{const amount=spent.get(name)||0,limit=state.budgets[name]||0,percent=limit?amount/limit*100:0;return `<article class="panel budget-card"><div class="budget-top"><h3>${esc(name)}</h3><span class="tag${limit&&amount>limit?' rose':''}">${limit?Math.round(percent)+'% used':'No limit'}</span></div><div class="budget-value">${cash(amount)} <small>${limit?'of '+cash(limit):'spent this month'}</small></div><div class="progress" aria-label="${esc(name)}: ${limit?Math.round(percent)+' percent of budget':'no limit set'}"><span class="${amount>limit?'over':''}" style="width:${Math.min(100,percent)}%"></span></div><div class="budget-bottom"><span class="${limit&&amount>limit?'over':''}">${limit?cash(Math.abs(limit-amount))+(amount>limit?' over budget':' available'):'Set a limit to track progress'}</span><button class="text-button" data-action="edit-budgets" aria-label="Edit ${esc(name)} limit">Edit</button></div></article>`;}).join('')}</div>`;
 }
 function editBudgets() { modal('Set monthly category limits',`<p class="dialog-copy">Limits repeat each month. Enter 0 to remove a category limit.</p><div class="form-grid">${M.categories.expense.map((name,index)=>amountField(name,'budget'+index,state.budgets[name]||0)).join('')}</div>`,data=>{const budgets={};M.categories.expense.forEach((name,index)=>{const value=Number(data.get('budget'+index));if(value>0)budgets[name]=value;});commit({...state,budgets},'Monthly budget limits saved.');}); }
 function renderBills() {
  const bills=state.bills.slice().sort((a,b)=>a.due.localeCompare(b.due));const recurring=M.sum(bills);
  $('billsContent').innerHTML=`<div class="mini-metrics"><div class="mini-metric"><span>Monthly recurring bills</span><strong>${cash(recurring)}</strong></div><div class="mini-metric"><span>Overdue occurrences</span><strong>${bills.filter(bill=>bill.due<M.today()).length}</strong></div><div class="mini-metric"><span>Tracked savings goals</span><strong>${state.goals.length}</strong></div></div><div class="section-heading"><div><h2>Keep payments on your radar</h2><p>Mark paid only after payment. This records an expense and advances one monthly occurrence.</p></div><button class="button primary compact" data-action="add-bill">${icon('plus')} Add bill</button></div>${bills.length?`<div class="card-grid">${bills.map(bill=>`<article class="panel bill-card"><div class="bill-card-header"><span class="date-tile"><strong>${Number(bill.due.slice(-2))}</strong><small>${new Date(bill.due+'T12:00:00').toLocaleDateString('en-US',{month:'short'})}</small></span><div><h3>${esc(bill.name)}</h3><p>${esc(bill.category)}</p></div><span class="tag ${bill.due<M.today()?'rose':''}">${bill.due<M.today()?'Overdue':'Monthly'}</span></div><div class="metric-value">${cash(bill.amount)}</div><p class="fine-print">Next due ${dateLabel(bill.due)}</p><div class="card-actions"><button class="button primary compact" data-action="pay-bill" data-id="${esc(bill.id)}">${icon('check')} Mark paid</button><button class="icon-button" data-action="edit-bill" data-id="${esc(bill.id)}" aria-label="Edit ${esc(bill.name)}">${icon('edit')}</button><button class="icon-button" data-action="delete-bill" data-id="${esc(bill.id)}" aria-label="Delete ${esc(bill.name)}">${icon('trash')}</button></div></article>`).join('')}</div>`:`<div class="panel">${empty('Bills without the surprise','Add subscriptions, rent, or other monthly payments. Nothing is charged automatically.','add-bill','Add recurring bill','calendar')}</div>`}<div class="section-heading"><div><h2>Something worth saving for</h2><p>Manually tracked progress. Goal balances do not add or subtract transactions.</p></div><button class="button primary compact" data-action="add-goal">${icon('plus')} Add goal</button></div>${state.goals.length?`<div class="card-grid">${state.goals.map(goal=>{const percent=goal.saved/goal.target*100;return `<article class="panel goal-card"><div class="panel-heading"><h3>${esc(goal.name)}</h3><span class="metric-icon blue">${icon('target')}</span></div><div class="metric-value">${cash(goal.saved)}</div><p>of ${cash(goal.target)} target</p><div class="progress"><span class="goal" style="width:${Math.min(100,percent)}%"></span></div><div class="budget-bottom"><span>${percent.toFixed(0)}% of goal</span><span>${cash(Math.max(0,goal.target-goal.saved))} to go</span></div><div class="card-actions"><button class="button secondary compact" data-action="edit-goal" data-id="${esc(goal.id)}">Update progress</button><button class="icon-button" data-action="delete-goal" data-id="${esc(goal.id)}" aria-label="Delete ${esc(goal.name)}">${icon('trash')}</button></div></article>`;}).join('')}</div>`:`<div class="panel">${empty('Give your savings a purpose','Track an emergency fund, a certification, or your next big move.','add-goal','Create a goal','target')}</div>`}`;
 }
 function editBill(id) {
  const bill=id?state.bills.find(row=>row.id===id):{name:'',amount:'',category:'Utilities',due:M.today()};if(!bill)throw new Error('Bill not found.');
  modal(id?'Edit recurring bill':'Add a recurring bill',`<p class="dialog-copy">A monthly reminder, not an automatic charge. Marking an occurrence paid creates one expense transaction.</p><div class="form-grid">${field('Bill name','name',bill.name,'text','maxlength="500" required')}${amountField('Amount ($)','amount',bill.amount,true)}${field('Next due date','due',bill.due,'date','min="1900-01-01" max="2200-11-30" required')}${select('Category','category',Object.fromEntries(M.categories.expense.map(name=>[name,name])),bill.category)}</div>`,data=>{const next=M.clone(state),due=data.get('due');const record={id:id||M.uid(),name:data.get('name'),amount:Number(data.get('amount')),category:data.get('category'),due,day:id&&bill.due===due?bill.day:Number(due.slice(-2))};const index=next.bills.findIndex(row=>row.id===id);if(id&&index===-1)throw new Error('This bill was removed.');if(index===-1)next.bills.push(record);else next.bills[index]=record;commit(next,'Recurring bill saved.');});
 }
 function payBill(id) {
  const bill=state.bills.find(row=>row.id===id);if(!bill)throw new Error('Bill not found.');
  modal('Record bill payment',`<p class="dialog-copy">Record <strong>${cash(bill.amount)}</strong> for ${esc(bill.name)}, due ${dateLabel(bill.due)}. This adds an expense and moves the next due date to ${dateLabel(M.nextDue(bill.due,bill.day))}.</p><div class="form-grid">${field('Payment date','paidOn',M.today(),'date','min="1900-01-01" max="2200-12-31" required')}</div>`,data=>{if(state.bills.find(row=>row.id===id)?.due!==bill.due)throw new Error('This bill occurrence changed. Reopen the payment dialog.');commit(M.payBill(state,id,data.get('paidOn')),'Payment recorded and bill advanced one month.');},'Record payment');
 }
 function editGoal(id) {
  const goal=id?state.goals.find(row=>row.id===id):{name:'',target:'',saved:0};if(!goal)throw new Error('Goal not found.');
  modal(id?'Update savings goal':'Create a savings goal',`<p class="dialog-copy">Track progress manually. This planning balance does not move money or create transactions.</p><div class="form-grid">${field('Goal name','name',goal.name,'text','maxlength="500" required')}${amountField('Target ($)','target',goal.target,true)}${amountField('Saved so far ($)','saved',goal.saved)}</div>`,data=>{const next=M.clone(state),record={id:id||M.uid(),name:data.get('name'),target:Number(data.get('target')),saved:Number(data.get('saved'))};const index=next.goals.findIndex(row=>row.id===id);if(id&&index===-1)throw new Error('This goal was removed.');if(index===-1)next.goals.push(record);else next.goals[index]=record;commit(next,'Savings goal updated.');});
 }
 function syncPlan() { if(planDirty)return;for(const [key,value] of Object.entries(state.plan))$('payPlanForm').elements[key].value=value; }
 function draftPlan() {
  const form=$('payPlanForm'); const plan={savings:Number(form.elements.savings.value),costs:Number(form.elements.costs.value),pay:Number(form.elements.pay.value),period:form.elements.period.value,deductions:Number(form.elements.deductions.value)};
  return form.checkValidity()&&Object.hasOwn(periods,plan.period)?plan:null;
 }
 function renderPlan() {
  const plan=draftPlan(),monthly=plan&&plan.pay>0?T.monthly(plan.pay,plan.pay,plan.period,plan.deductions)?.[0]:null;
  const left=monthly!==null&&plan.costs>0?monthly-plan.costs:null;
  $('planResults').innerHTML=`<div class="plan-result"><span>Estimated monthly take-home</span><strong>${monthly===null?'Enter gross pay':cash(monthly)}</strong><small>After your estimated deductions</small></div><div class="plan-result${left!==null&&left<0?' negative':''}"><span>Left after living costs / month</span><strong>${left===null?'Add pay & costs':cash(left)}</strong><small>Potential pay minus expected living costs</small></div><div class="plan-result"><span>Savings runway · no income</span><strong>${plan&&plan.costs>0?(plan.savings/plan.costs).toFixed(1)+' months':'Add living costs'}</strong><small>Available savings divided by monthly costs</small></div><p class="fine-print">Planning estimates only. Your monthly surplus on Overview comes exclusively from recorded transactions.</p>`;
 }
 function filteredJobs() {
  const terms=$('jobSearch').value.trim().toLowerCase().replaceAll(',','').split(/\s+/).filter(Boolean),stage=$('jobStageFilter').value;
  return state.jobs.filter(job=>(stage==='all'||job.stage===stage)&&terms.every(term=>[job.company,job.role,M.stages[job.stage],job.advertisedPay,job.offerPay,job.totalCompensation].join(' ').toLowerCase().replaceAll(',','').includes(term)));
 }
 const range=values=>Math.abs(values[0]-values[1])<.005?cash(values[0]):`${cash(values[0])} – ${cash(values[1])}`;
 function renderJobs() {
  const rows=filteredJobs();jobPage=Math.min(jobPage,Math.max(1,Math.ceil(rows.length/12)));const plan=draftPlan();
  updateJobSelection(rows);
  $('jobCards').innerHTML=rows.length?rows.slice((jobPage-1)*12,jobPage*12).map(job=>{
   const estimate=job.estimate;const amounts=estimate&&plan?T.monthly(estimate.low,estimate.high,estimate.period,plan.deductions):null;
   return `<article class="job-card"><div class="job-heading"><input type="checkbox" data-select-job="${esc(job.sourceJobId)}" aria-label="Select ${esc(job.company+' '+job.role)}"${selectedJobs.has(job.sourceJobId)?' checked':''}><div class="job-title"><h3>${esc(job.role)}</h3><p>${esc(job.company)}</p></div><span class="tag${job.stage==='offer'?' green':''}">${M.stages[job.stage]}</span></div><div class="potential-label">POTENTIAL INCOME · NOT A PAYCHECK</div><dl class="job-pay-details"><dt>Advertised pay</dt><dd>${esc(job.advertisedPay||'Not recorded')}</dd><dt>Offer pay</dt><dd>${esc(job.offerPay||'Not recorded')}</dd><dt>Total compensation<br>(reference only)</dt><dd>${esc(job.totalCompensation||'Not recorded')}</dd></dl><div class="job-estimate">${amounts?`<strong>${range(amounts)} / month</strong><small>After your estimated deductions · reviewed USD base pay</small>${plan.costs>0?`<small class="${amounts[0]<plan.costs?'negative':''}">${range(amounts.map(value=>value-plan.costs))} left after living costs</small>`:'<small>Enter living costs above to compare affordability.</small>'}`:`<p>${estimate?'Complete the pay-plan inputs above to see estimates.':'Review USD base pay and pay period before calculating. Total compensation may include bonuses or equity.'}</p>`}</div><div class="card-actions"><button class="button secondary compact" data-action="review-job" data-id="${esc(job.sourceJobId)}">${icon('edit')} ${estimate?'Edit estimate':'Review pay'}</button>${amounts?`<button class="button primary compact" data-action="use-job" data-id="${esc(job.sourceJobId)}">Use low estimate</button>`:''}<button class="icon-button" data-action="delete-job" data-id="${esc(job.sourceJobId)}" aria-label="Remove ${esc(job.company+' '+job.role)}">${icon('trash')}</button></div></article>`;
  }).join(''):empty(state.jobs.length?'No matching opportunities':'Your next opportunities belong here',state.jobs.length?'Try another search or stage filter.':'Export selected jobs from PipelineTrack, import the file, and review their pay estimates.','import-jobs','Import jobs','briefcase');
  $('jobPagination').innerHTML=pagination(rows.length,jobPage,12,'job');
 }
 function updateJobSelection(rows=filteredJobs()) {
  const hidden=[...selectedJobs].filter(id=>!rows.some(row=>row.sourceJobId===id)).length;
  $('jobCount').textContent=`${rows.length} matching · ${selectedJobs.size} selected${hidden?' ('+hidden+' outside filters)':''}`; $('deleteSelectedJobs').disabled=!selectedJobs.size;
 }
 function renderCareer() { syncPlan();renderPlan();renderJobs(); }
 function reviewJob(id) {
  const job=state.jobs.find(row=>row.sourceJobId===id);if(!job)throw new Error('Job comparison not found.');
  const estimate=job.estimate||T.parsePay(job.offerPay||job.advertisedPay,!job.offerPay&&job.payPeriodInferred);
  modal('Review job pay',`<p class="dialog-copy"><strong>${esc(job.company)} · ${esc(job.role)}</strong><br>Advertised: ${esc(job.advertisedPay||'Not recorded')}<br>Offer: ${esc(job.offerPay||'Not recorded')}<br>Total compensation (reference only): ${esc(job.totalCompensation||'Not recorded')}</p><div class="form-grid">${amountField('Low / single USD base pay ($)','low',estimate.low,true)}${field('High base pay ($) · optional','high',estimate.high,'number','min="0.01" max="1000000000" step="0.01"')}${select('Pay period','period',{'':'Choose a period',...periods},estimate.period)}<label class="check-label wide"><input name="confirmed" type="checkbox" required${estimate.confirmed?' checked':''}> I reviewed these figures as USD base pay, excluding bonuses and equity.</label></div><p class="fine-print">Unclear or inferred periods require your review. Daily pay assumes 5 days/week and hourly pay 40h/week, using 52 weeks/year. A reviewed estimate is potential income only.</p>`,data=>{const low=Number(data.get('low')),high=data.get('high')?Number(data.get('high')):low,period=data.get('period');if(!data.get('confirmed')||!T.monthly(low,high,period,0))throw new Error('Choose a pay period and a valid range with high pay at least as large as low pay.');const next=M.clone(state);const current=next.jobs.find(row=>row.sourceJobId===id);if(!current)throw new Error('This comparison was removed.');current.estimate={low,high,period,confirmed:true};commit(next,'Reviewed pay estimate saved. No income transaction was created.');},'Save reviewed estimate');
 }
 function useJob(id) {
  const job=state.jobs.find(row=>row.sourceJobId===id);if(!job?.estimate)throw new Error('Review this job’s pay first.');
  $('payPlanForm').elements.pay.value=job.estimate.low;$('payPlanForm').elements.period.value=job.estimate.period;planDirty=true;renderPlan();renderJobs();
  $('planStatus').textContent=`Loaded ${job.company} · ${job.role} (low base-pay estimate). Save the plan to keep it. No paycheck transaction was created.`;
  $('payPlanForm').scrollIntoView({behavior:'smooth',block:'center'});$('payPlanForm').elements.pay.focus({preventScroll:true});
 }
 function importFile(kind) {
  let pending=null;
  const restore=kind==='backup';
  const version=modal(restore?'Restore a Cash Compass backup':'Import PipelineTrack jobs',`<p class="dialog-copy">${restore?'Restore replaces all Cash Compass data in this workspace with the contents of a backup. Export your current data first if you want to keep it. Previous Cash Compass JSON backups are supported.':'Choose the pay-planning JSON exported from PipelineTrack. You will see a preview before anything is saved. Existing jobs update by ID; jobs absent from the file stay.'}</p><label class="dialog-copy">${restore?'Cash Compass backup':'PipelineTrack pay-planning file'}<input id="importFile" type="file" accept=".json,application/json" required></label><div id="importPreview" class="import-preview" role="status">Choose a file to preview.</div>`,()=>{if(!pending)throw new Error('Choose and review a valid file first.');if(restore){const next=M.fromBackup(pending);planDirty=false;commit(next,'Backup restored.',!!store?.blocked);selectedTransactions.clear();selectedJobs.clear();}else commit(M.importJobs(state,pending),'Job comparisons imported. Review base pay and period before using estimates.');},restore?'Replace workspace with backup':'Import these jobs',restore);
  $('dialogSubmit').disabled=true;
  let readVersion=0;
  $('importFile').addEventListener('change',async event=>{
   const generation=++readVersion;pending=null;$('dialogSubmit').disabled=true;$('dialogError').hidden=true;const file=event.target.files[0];if(!file)return;
   try {
    if(file.size>(restore?20:1)*1024*1024)throw new Error(restore?'Choose a backup under 20 MB.':'Choose a pay-planning export under 1 MB.');
    const parsed=JSON.parse(await file.text());if(version!==modalVersion||generation!==readVersion)return;
    if(restore){const next=M.fromBackup(parsed);$('importPreview').innerHTML=`<strong>Ready to replace this workspace:</strong><ul>${Object.entries({transactions:next.transactions.length,'category budgets':Object.keys(next.budgets).length,'recurring bills':next.bills.length,'savings goals':next.goals.length,'job comparisons':next.jobs.length}).map(([name,count])=>`<li>${count} ${name}</li>`).join('')}<li>Pay & runway plan included</li></ul><p class="fine-print">This replaces every group, including any groups that are empty in the backup.</p>`;}
    else {const incoming=T.validate(parsed),ids=new Set(state.jobs.map(job=>job.sourceJobId)),added=incoming.filter(job=>!ids.has(job.sourceJobId)).length;M.importJobs(state,parsed);$('importPreview').innerHTML=`<strong>${incoming.length} jobs: ${added} new, ${incoming.length-added} existing to update</strong><ul>${incoming.map(job=>`<li>${esc(job.company)} · ${esc(job.role)} · ${M.stages[job.stage]}</li>`).join('')}</ul><p class="fine-print">Changed source pay resets its reviewed estimate. These jobs stay potential income.</p>`;}
    pending=parsed;$('dialogSubmit').disabled=false;
   }catch(error){if(version!==modalVersion||generation!==readVersion)return;$('importPreview').textContent=error instanceof SyntaxError?'This file is not valid JSON. Please choose the correct export.':error.message;}
  });
 }
 function renderSettings() {
  $('settingsContent').innerHTML=`<div class="settings-grid"><article class="panel settings-card full"><span class="metric-icon blue">${icon('lock')}</span><h2>${demo?'Demo workspace · temporary data':'Your personal finance workspace'}</h2><p>Your financial records are saved in this browser, not a bank account or cloud service. Clearing browser data removes them. Keep regular JSON backups if you want a copy you can restore.</p><div class="data-counts">${Object.entries({Transactions:state.transactions.length,Budgets:Object.keys(state.budgets).length,Bills:state.bills.length,Goals:state.goals.length,Jobs:state.jobs.length}).map(([name,count])=>`<div><strong>${count}</strong><span>${name}</span></div>`).join('')}</div></article><article class="panel settings-card"><span class="metric-icon blue">${icon('download')}</span><h2>A backup for peace of mind</h2><p>Export every transaction, budget, bill, goal, pay plan, and imported job comparison to a JSON file. Restore this file here on the same or another browser.</p><div class="card-actions"><button class="button primary compact" data-action="backup">${icon('download')} Export full backup</button><button class="button secondary compact" data-action="restore">${icon('upload')} Restore backup</button></div></article><article class="panel settings-card"><span class="metric-icon rose">${icon('trash')}</span><h2>A clear way to start fresh</h2><p>Remove selected data groups or clear the whole Cash Compass workspace. Deletion never removes the original jobs in PipelineTrack. A preview shows exactly what will be removed.</p><div class="card-actions"><button class="button danger compact" data-action="manage-data">${icon('trash')} Manage / delete data</button></div></article><article class="panel settings-card"><span class="metric-icon">${icon('overview')}</span><h2>Take it for a test drive</h2><p>Explore a fictional workspace with populated charts, budgets, bills, goals, and a job comparison. Demo changes stay temporary and never replace your saved records.</p><div class="card-actions"><button class="button secondary compact" data-action="${demo?'exit-demo':'demo'}">${demo?'Return to my data':'Open demo workspace'}</button></div></article><article class="panel settings-card"><span class="metric-icon blue">${icon('info')}</span><h2>What your numbers mean</h2><p>Monthly surplus is recorded income minus expenses, not a bank balance. Goals are manually tracked planning balances. Imported jobs are potential income. Recurring bills become expenses only when you mark them paid. Currency is USD throughout.</p><div class="card-actions"><button class="text-button" data-action="recovery-copy">Download raw recovery copy ${icon('download')}</button></div></article></div>`;
 }
 function manageData() {
  const groups={transactions:['All transactions',state.transactions.length+' recorded transactions'],budgets:['All category budgets',Object.keys(state.budgets).length+' limits'],bills:['All recurring bills',state.bills.length+' bill schedules; recorded payments stay unless transactions are also selected'],goals:['All savings goals',state.goals.length+' goals'],plan:['Pay & runway plan','Savings, costs, pay, period, and deductions'],jobs:['All imported job comparisons',state.jobs.length+' comparisons; original PipelineTrack jobs stay']};
  modal('Choose what to delete',`<p class="dialog-copy">Select one or more groups. Unselected data stays. Nothing is preselected. Deletion cannot be undone in the app, so export a backup first if you want to keep a copy.</p><button type="button" class="button secondary compact" data-action="backup">${icon('download')} Export backup first</button><div class="card-actions"><button type="button" class="text-button" data-action="select-all-data">Select every group</button><button type="button" class="text-button" data-action="clear-data-selection">Clear selection</button></div><div class="scope-list">${Object.entries(groups).map(([key,[label,description]])=>`<label><input type="checkbox" name="scope" value="${key}"><span><strong>${label}</strong><small>${description}</small></span></label>`).join('')}</div><p class="fine-print" id="deletionSummary">Choose at least one group to see the deletion summary.</p>`,data=>{const selected=data.getAll('scope');if(!selected.length)throw new Error('Select at least one data group.');if(selected.includes('plan'))planDirty=false;commit(M.clearGroups(state,selected),'Deleted selected data groups. Unselected data and PipelineTrack jobs stay.');},'Delete selected data',true);
  $('dialogSubmit').disabled=true;
  const update=()=>{const inputs=[...$('dialogForm').querySelectorAll('[name=scope]:checked')];$('dialogSubmit').disabled=!inputs.length;$('deletionSummary').textContent=inputs.length?'Will permanently delete: '+inputs.map(input=>groups[input.value][0]).join(', ')+'.':'Choose at least one group to see the deletion summary.';};
  $('dialogBody').onchange=update;
 }
 function beginDemo() { if(demo){location.hash='overview';return;}demo=true;state=M.demo();planDirty=false;selectedTransactions.clear();selectedJobs.clear();$('demoBanner').hidden=false;$('savedLabel').innerHTML=icon('info')+' Temporary demo';route();notify('You are exploring fictional demo data. Your saved records are untouched.'); }
 function endDemo() {
  let errorMessage='';
  try { state=store.load().state; } catch(error) { state=M.empty();errorMessage=error.message;$('recoveryBanner').hidden=false;$('recoveryBanner').textContent=error.message; }
  demo=false;planDirty=false;selectedTransactions.clear();selectedJobs.clear();$('demoBanner').hidden=true;$('savedLabel').innerHTML=icon('lock')+' Browser-local data';route();notify(errorMessage||'Back to your saved workspace.',!!errorMessage);
 }
 const actions={
  'add-transaction':()=>editTransaction(), 'edit-transaction':id=>editTransaction(id),
  'delete-transaction':id=>confirmAction('Delete this transaction?','Only this transaction will be deleted. If it was a bill payment, the recurring schedule will not be rewound.',()=>commit(M.remove(state,'transactions',[id]),'Transaction deleted.')),
  'select-transactions':()=>{filteredTransactions().forEach(row=>selectedTransactions.add(row.id));renderTransactions();},
  'clear-transaction-selection':()=>{selectedTransactions.clear();renderTransactions();},
  'delete-transactions':()=>{const ids=[...selectedTransactions];if(!ids.length)return;confirmAction('Delete selected transactions?',`Permanently delete ${ids.length} selected transactions, including any outside the current filters. Budgets, bills, goals, pay plans, and imported jobs stay. Bill schedules will not be rewound.`,()=>commit(M.remove(state,'transactions',ids),'Selected transactions deleted.'));},
  'csv':()=>{const rows=filteredTransactions();if(!rows.length)throw new Error('No matching transactions to export.');download(M.csv(rows),`cash-compass-transactions-${M.today()}.csv`,'text/csv;charset=utf-8');notify('Matching transactions exported as CSV.');},
  'tx-prev':()=>{txPage--;renderTransactions();},'tx-next':()=>{txPage++;renderTransactions();},'job-prev':()=>{jobPage--;renderJobs();},'job-next':()=>{jobPage++;renderJobs();},
  'edit-budgets':editBudgets,'add-bill':()=>editBill(),'edit-bill':id=>editBill(id),'pay-bill':payBill,
  'delete-bill':id=>confirmAction('Remove recurring bill?','The schedule will be removed. Previously recorded expense transactions will stay.',()=>commit(M.remove(state,'bills',[id]),'Recurring bill removed.')),
  'add-goal':()=>editGoal(),'edit-goal':id=>editGoal(id),'delete-goal':id=>confirmAction('Delete savings goal?','This removes only the planning goal. It does not change transactions or your pay plan.',()=>commit(M.remove(state,'goals',[id]),'Goal removed.')),
  'import-jobs':()=>importFile('jobs'),'review-job':reviewJob,'use-job':useJob,
  'delete-job':id=>confirmAction('Remove job comparison?','This removes the comparison in Cash Compass. The original PipelineTrack job stays.',()=>commit(M.remove(state,'jobs',[id]),'Job comparison removed.')),
  'select-jobs':()=>{filteredJobs().forEach(job=>selectedJobs.add(job.sourceJobId));renderJobs();},'clear-job-selection':()=>{selectedJobs.clear();renderJobs();},
  'delete-jobs':()=>{const ids=[...selectedJobs];if(!ids.length)return;confirmAction('Remove selected comparisons?',`Remove ${ids.length} selected comparisons, including any outside the current filters. Original PipelineTrack jobs and your saved pay plan stay.`,()=>commit(M.remove(state,'jobs',ids),'Selected comparisons removed.'));},
  'use-expenses':()=>{const amount=M.totals(state,month).expenses;$('payPlanForm').elements.costs.value=amount;planDirty=true;renderPlan();renderJobs();$('planStatus').textContent=`Loaded ${monthLabel(month)} spending as expected costs. Review whether this is a complete month, then save your plan.`;},
  'backup':exportBackup,'restore':()=>importFile('backup'),'manage-data':manageData,
  'select-all-data':()=>{$('dialogForm').querySelectorAll('[name=scope]').forEach(input=>{input.checked=true;});$('dialogBody').dispatchEvent(new Event('change'));},
  'clear-data-selection':()=>{$('dialogForm').querySelectorAll('[name=scope]').forEach(input=>{input.checked=false;});$('dialogBody').dispatchEvent(new Event('change'));},
  'recovery-copy':()=>{if(demo)throw new Error('Return to your data before downloading a raw recovery copy.');const keys=[M.KEY,'transactions','budgets','cashCompass.plan','cashCompass.jobComparisons.v1'];download(JSON.stringify(Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),null,2),`cash-compass-recovery-${M.today()}.json`);notify('Raw recovery copy downloaded. This file is for manual recovery, not automatic restore.');},
  'demo':beginDemo,'exit-demo':endDemo,'close-dialog':closeModal
 };
 document.addEventListener('click',event=>{const control=event.target.closest('[data-action]');if(!control||control.disabled)return;const action=actions[control.dataset.action];if(!action)return;event.preventDefault();try{action(control.dataset.id);}catch(error){notify(error.message,true);}});
 document.addEventListener('change',event=>{const input=event.target;if(input.matches('[data-select-transaction]')){const id=input.dataset.selectTransaction;input.checked?selectedTransactions.add(id):selectedTransactions.delete(id);updateTransactionSelection();}if(input.matches('[data-select-job]')){const id=input.dataset.selectJob;input.checked?selectedJobs.add(id):selectedJobs.delete(id);updateJobSelection();}});
 $('reportMonth').addEventListener('change',()=>{const value=$('reportMonth').value;if(!/^\d{4}-\d{2}$/.test(value)||!M.validDate(value+'-01')){$('reportMonth').value=month;return;}month=value;txPage=1;render();});
 for(const id of ['transactionSearch','transactionTypeFilter','transactionCategoryFilter','allDates'])$(id).addEventListener(id==='transactionSearch'?'input':'change',()=>{txPage=1;renderTransactions();});
 for(const id of ['jobSearch','jobStageFilter'])$(id).addEventListener(id==='jobSearch'?'input':'change',()=>{jobPage=1;renderJobs();});
 $('payPlanForm').addEventListener('input',()=>{planDirty=true;$('planStatus').textContent='Unsaved plan changes. Comparisons below use these inputs.';renderPlan();renderJobs();});
 $('payPlanForm').addEventListener('submit',event=>{event.preventDefault();try{const plan=draftPlan();if(!plan)throw new Error('Complete the pay plan with valid amounts and deductions.');commit({...state,plan},'Pay plan saved.');planDirty=false;$('planStatus').textContent='Pay plan saved in this workspace.';}catch(error){notify(error.message,true);}});
 $('themeToggle').addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('cashCompass.theme',theme);}catch(_){} $('themeToggle').innerHTML=icon(theme==='dark'?'sun':'moon');});
 $('menuToggle').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('sidebarScrim').hidden=!open;$('menuToggle').setAttribute('aria-expanded',String(open));});
 $('sidebarScrim').addEventListener('click',closeSidebar);document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSidebar();});
 $('editor').addEventListener('cancel',()=>{modalVersion++;});
 window.addEventListener('hashchange',route);
 window.addEventListener('storage',event=>{if(event.key===M.KEY&&!demo){$('recoveryBanner').hidden=false;$('recoveryBanner').textContent='Your records changed in another tab. Reload this page before saving. Unsaved fields on this page have been kept.';}});
 $('themeToggle').innerHTML=icon(document.documentElement.dataset.theme==='dark'?'sun':'moon');
 route();
});

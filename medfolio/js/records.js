function renderRecords(filter){
  const f = filter || AppState.currentFilter || 'all';
  AppState.currentFilter = f;
  const list = document.getElementById('records-list');
  const pills = document.getElementById('filter-pills');
  const categories = ['all','financial','events','research','teaching'];
  pills.innerHTML = categories.map(c=>`<button onclick="renderRecords('${c}')" class="pill ${AppState.currentFilter===c? 'active':''}">${c.charAt(0).toUpperCase()+c.slice(1)}</button>`).join('');

  let items = [];
  if(f==='all') items = [...AppState.practiceRecords, ...AppState.events];
  else if(f==='financial') items = AppState.practiceRecords.filter(r=> r.income !== undefined);
  else if(f==='events') items = AppState.events.filter(r=> r.type==='events' || r.type==='other');
  else if(f==='research') items = AppState.events.filter(r=> r.type==='research');
  else if(f==='teaching') items = AppState.events.filter(r=> r.type==='teaching');

  // sort by date desc
  items.sort((a,b)=> (b.date||0) > (a.date||0) ? 1 : -1);
  if(items.length===0){ list.innerHTML = '<div class="record-empty">No records yet<br>Start by adding a practice session or professional event.</div>'; document.getElementById('revenue-card').innerHTML=''; return }

  list.innerHTML = items.map(it=>{
    if(it.type==='financial'){
      return `<div class="record-card"><div><strong>${it.location||'Location'} — ${it.name||'Session'}</strong></div><div>${getTodayShort.call({}) ? it.date : it.date} · ${it.patients||0} patients <span style="float:right">${formatCurrency(it.net)}</span></div></div>`;
    }
    return `<div class="record-card"><div><strong>${it.title}</strong></div><div>${it.date} · ${it.venue||''}</div></div>`;
  }).join('');

  // revenue card for current month
  const now = new Date(); const m = now.getMonth(); const y = now.getFullYear();
  const monthTotal = AppState.practiceRecords.filter(r=>{ const d = new Date(r.date); return d.getMonth()===m && d.getFullYear()===y }).reduce((s,r)=>s+(r.net||0),0);
  const monthCount = AppState.practiceRecords.filter(r=>{ const d=new Date(r.date); return d.getMonth()===m && d.getFullYear()===y }).length;
  document.getElementById('revenue-card').innerHTML = `<div class="revenue-card"><div>Total Revenue — ${now.toLocaleString('en-GB',{month:'long', year:'numeric'})}</div><div style="font-weight:800;font-size:20px">${formatCurrency(monthTotal)}</div><div>${monthCount} records this month</div></div>`;
  // home stats update
  const revenueEl = document.getElementById('stat-revenue'); if(revenueEl) revenueEl.textContent = formatCurrency(monthTotal);
  const eventsEl = document.getElementById('stat-events'); if(eventsEl) eventsEl.textContent = AppState.events.length;
}

function initHome(){
  const g = document.getElementById('greeting-text'); if(g) g.textContent = getGreeting();
  renderRecords();
}

document.addEventListener('DOMContentLoaded', ()=>{ renderRecords(); });

let analyticsInitialised = false;
let charts = {};
function initAnalytics(){
  if(analyticsInitialised) return; analyticsInitialised = true;
  // stats
  const now = new Date(); const year = now.getFullYear();
  const annual = AppState.practiceRecords.filter(r=> new Date(r.date).getFullYear()===year).reduce((s,r)=>s+(r.net||0),0);
  const pubs = AppState.events.filter(e=> e.category==='Research & Publications' || e.type==='research').length;
  const teachingHours = (AppState.events.filter(e=> e.type==='teaching').length) * 2;
  const confs = AppState.events.filter(e=> e.category==='Conferences & Workshops').length;
  document.getElementById('analytics-stats').innerHTML = `
    <div class="revenue-card">Annual Revenue<div style="font-weight:800">${formatCurrency(annual)}</div></div>
    <div class="revenue-card">Publications<div style="font-weight:800">${pubs}</div></div>
    <div class="revenue-card">Teaching Hours<div style="font-weight:800">${teachingHours}</div></div>
    <div class="revenue-card">Conferences<div style="font-weight:800">${confs}</div></div>
  `;

  // monthly revenue last 6 months
  const months = [];
  for(let i=5;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); months.push({ m: d.toLocaleString('en-GB',{month:'short'}), key: `${d.getFullYear()}-${d.getMonth()}` }); }
  const monthlyData = months.map(mm=> AppState.practiceRecords.filter(r=>{ const d=new Date(r.date); return `${d.getFullYear()}-${d.getMonth()}`===mm.key }).reduce((s,r)=>s+(r.net||0),0));

  const ctx1 = document.getElementById('chart-monthly').getContext('2d');
  charts.monthly = new Chart(ctx1,{ type:'bar', data:{ labels: months.map(m=>m.m), datasets:[{ label:'Revenue', data: monthlyData, backgroundColor:'rgba(45,90,61,0.8)'}] }, options:{ animation:false, plugins:{ legend:{ display:false } }, scales:{ y:{ ticks:{ callback: v => 'LKR '+(v/1000)+'k' } } } } });

  // distribution
  const cats = ['Teaching','Research','Conferences','Presentations','Clinical','Other'];
  const catCounts = cats.map(c=> AppState.events.filter(e=> e.category.includes(c) || (c==='Teaching' && e.type==='teaching')).length);
  const ctx2 = document.getElementById('chart-distribution').getContext('2d');
  charts.dist = new Chart(ctx2,{ type:'doughnut', data:{ labels:cats, datasets:[{ data:catCounts, backgroundColor:['#2d5a3d','#b8860b','#1a4a6e','#5b48cc','#c0392b','#a09b94'] }] }, options:{ animation:false } });

  // revenue by location
  const locs = {}; AppState.practiceRecords.forEach(r=>{ locs[r.location] = (locs[r.location]||0) + (r.net||0); });
  const labels = Object.keys(locs); const data = labels.map(l=> locs[l]);
  const ctx3 = document.getElementById('chart-location').getContext('2d');
  charts.loc = new Chart(ctx3,{ type:'bar', data:{ labels, datasets:[{ data, backgroundColor:'rgba(45,90,61,0.7)'}] }, options:{ indexAxis:'y', animation:false, plugins:{ legend:{ display:false } } } });
}

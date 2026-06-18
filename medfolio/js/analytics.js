let analyticsInitialised = false;
let charts = {};

function initAnalytics() {
  if (analyticsInitialised) return;
  analyticsInitialised = true;

  const now = new Date();
  const year = now.getFullYear();

  const annual = AppState.practiceRecords
    .filter(r => new Date(r.date).getFullYear() === year)
    .reduce((s, r) => s + (r.net || 0), 0);

  const pubs = AppState.events.filter(e =>
    e.category === 'Research & Publications' || e.type === 'research').length;

  const teachingHours = AppState.events.filter(e => e.type === 'teaching').length * 2;
  const confs = AppState.events.filter(e => e.category === 'Conferences & Workshops').length;

  document.getElementById('analytics-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-label">Annual Revenue</div>
      <div class="stat-card-value">${formatCurrency(annual)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">Publications</div>
      <div class="stat-card-value">${pubs}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">Teaching Hrs</div>
      <div class="stat-card-value">${teachingHours}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">Conferences</div>
      <div class="stat-card-value">${confs}</div>
    </div>`;

  // Monthly revenue — last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ m: d.toLocaleString('en-GB', { month: 'short' }), key: `${d.getFullYear()}-${d.getMonth()}` });
  }
  const monthlyData = months.map(mm =>
    AppState.practiceRecords
      .filter(r => { const d = new Date(r.date); return `${d.getFullYear()}-${d.getMonth()}` === mm.key; })
      .reduce((s, r) => s + (r.net || 0), 0)
  );

  const chartDefaults = {
    font: { family: 'DM Sans, sans-serif', size: 12 },
    color: '#5A6A7A'
  };
  Chart.defaults.font = chartDefaults.font;
  Chart.defaults.color = chartDefaults.color;

  const ctx1 = document.getElementById('chart-monthly').getContext('2d');
  charts.monthly = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: months.map(m => m.m),
      datasets: [{ label: 'Revenue', data: monthlyData, backgroundColor: '#2EC4B6', borderRadius: 6, borderSkipped: false }]
    },
    options: {
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: v => 'LKR ' + (v / 1000) + 'k' }, grid: { color: 'rgba(13,27,42,0.06)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Activity distribution
  const cats   = ['Teaching', 'Research', 'Conferences', 'Presentations', 'Clinical', 'Other'];
  const colors = ['#2EC4B6', '#3A82F6', '#8B5CF6', '#F59E0B', '#10B981', '#6B7A8D'];
  const catCounts = cats.map(c =>
    AppState.events.filter(e => e.category.includes(c) || (c === 'Teaching' && e.type === 'teaching')).length
  );

  const ctx2 = document.getElementById('chart-distribution').getContext('2d');
  charts.dist = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: catCounts, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      animation: false,
      cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { padding: 12, boxWidth: 12 } } }
    }
  });

  // Revenue by location
  const locs = {};
  AppState.practiceRecords.forEach(r => { locs[r.location] = (locs[r.location] || 0) + (r.net || 0); });
  const locLabels = Object.keys(locs);
  const locData   = locLabels.map(l => locs[l]);

  const ctx3 = document.getElementById('chart-location').getContext('2d');
  charts.loc = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: locLabels,
      datasets: [{ data: locData, backgroundColor: '#0D1B2A', borderRadius: 4, borderSkipped: false }]
    },
    options: {
      indexAxis: 'y',
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { callback: v => 'LKR ' + (v / 1000) + 'k' }, grid: { color: 'rgba(13,27,42,0.06)' } },
        y: { grid: { display: false } }
      }
    }
  });
}

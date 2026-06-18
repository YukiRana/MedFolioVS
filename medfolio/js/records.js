function renderRecords(filter) {
  const f = filter || AppState.currentFilter || 'all';
  AppState.currentFilter = f;

  const list   = document.getElementById('records-list');
  const pills  = document.getElementById('filter-pills');
  if (!list || !pills) return;

  const categories = ['all', 'financial', 'events', 'research', 'teaching'];
  pills.innerHTML = categories.map(c =>
    `<button onclick="renderRecords('${c}')" class="pill ${AppState.currentFilter === c ? 'active' : ''}">${c.charAt(0).toUpperCase() + c.slice(1)}</button>`
  ).join('');

  let items = [];
  if (f === 'all')       items = [...AppState.practiceRecords, ...AppState.events];
  else if (f === 'financial') items = AppState.practiceRecords.filter(r => r.income !== undefined);
  else if (f === 'events')   items = AppState.events.filter(r => r.type === 'events' || r.type === 'other');
  else if (f === 'research') items = AppState.events.filter(r => r.type === 'research');
  else if (f === 'teaching') items = AppState.events.filter(r => r.type === 'teaching');

  items.sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1));

  if (items.length === 0) {
    list.innerHTML = '<div class="record-empty">No records yet.<br>Start by adding a practice session or event.</div>';
    document.getElementById('revenue-card').innerHTML = '';
    return;
  }

  list.innerHTML = items.map(it => {
    if (it.income !== undefined) {
      return `<div class="record-card">
        <strong><i class="ti ti-stethoscope" style="color:var(--icon-teal-fg);margin-right:6px"></i>${it.location || 'Session'}</strong>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>${it.date} · ${it.patients || 0} patients</span>
          <span style="font-weight:700;color:var(--navy)">${formatCurrency(it.net)}</span>
        </div>
      </div>`;
    }
    const iconMap = { teaching: 'ti-school', research: 'ti-microscope', events: 'ti-calendar-event' };
    const icon = iconMap[it.type] || 'ti-star';
    return `<div class="record-card">
      <strong><i class="ti ${icon}" style="color:var(--icon-blue-fg);margin-right:6px"></i>${it.title}</strong>
      <div>${it.date}${it.venue ? ' · ' + it.venue : ''}</div>
    </div>`;
  }).join('');

  // Revenue summary card
  const now = new Date();
  const m = now.getMonth(), y = now.getFullYear();
  const monthRecs = AppState.practiceRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const monthTotal = monthRecs.reduce((s, r) => s + (r.net || 0), 0);
  const monthCount = monthRecs.length;

  document.getElementById('revenue-card').innerHTML = `
    <div class="revenue-card">
      <div>Total Revenue — ${now.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</div>
      <div class="rv-amount">${formatCurrency(monthTotal)}</div>
      <div class="rv-sub">${monthCount} record${monthCount !== 1 ? 's' : ''} this month</div>
    </div>`;

  // update home stats
  const revenueEl = document.getElementById('stat-revenue');
  if (revenueEl) revenueEl.textContent = formatCurrency(monthTotal);
  const eventsEl = document.getElementById('stat-events');
  if (eventsEl) eventsEl.textContent = AppState.events.length;
}

function initHome() {
  const g = document.getElementById('greeting-text');
  if (g) g.textContent = getGreeting();
  renderRecords();
}

document.addEventListener('DOMContentLoaded', () => { renderRecords(); });

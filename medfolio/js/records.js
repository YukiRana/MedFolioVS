/* ─── Records screen ─── */

let selectMode = false;
let checkedIds  = new Set();

/* ── Helpers ── */
function getItemId(it) {
  // Use a stable key: for practiceRecords use date+location, for events use title+date
  return it.income !== undefined
    ? `pr::${it.date}::${it.location}`
    : `ev::${it.date}::${it.title}`;
}

function deleteItem(id) {
  AppState.practiceRecords = AppState.practiceRecords.filter(r => getItemId(r) !== id);
  AppState.events           = AppState.events.filter(r => getItemId(r) !== id);
  AppState.save();
}

/* ── Toolbar ── */
function renderToolbar() {
  let tb = document.getElementById('records-toolbar');
  if (!tb) return;

  const count = checkedIds.size;
  tb.querySelector('.select-btn').textContent = selectMode ? 'Done' : 'Select';

  const delBtn = tb.querySelector('.delete-selected-btn');
  if (selectMode && count > 0) {
    delBtn.classList.add('visible');
    delBtn.innerHTML = `<i class="ti ti-trash"></i> Delete ${count}`;
  } else {
    delBtn.classList.remove('visible');
  }
}

function toggleSelectMode() {
  selectMode = !selectMode;
  checkedIds.clear();
  document.body.classList.toggle('select-mode', selectMode);

  // Close any swiped cards
  document.querySelectorAll('.record-swipe-wrapper.swiped')
    .forEach(w => w.classList.remove('swiped'));

  renderToolbar();
}

function deleteSelected() {
  const wrappers = document.querySelectorAll('.record-swipe-wrapper.checked');
  wrappers.forEach(w => {
    const id = w.dataset.id;
    w.classList.add('deleting');
    setTimeout(() => { deleteItem(id); }, 280);
  });
  setTimeout(() => {
    checkedIds.clear();
    selectMode = false;
    document.body.classList.remove('select-mode');
    renderRecords();
  }, 320);
  showToast(`${wrappers.length} record${wrappers.length !== 1 ? 's' : ''} deleted`);
}

/* ── Swipe logic ── */
function attachSwipe(wrapper) {
  let startX = 0, startY = 0, dragging = false, isDrag = false;
  const card = wrapper.querySelector('.record-card');

  const onStart = (e) => {
    if (selectMode) return;
    const t = e.touches ? e.touches[0] : e;
    startX = t.clientX;
    startY = t.clientY;
    dragging = true;
    isDrag = false;
    card.style.transition = 'none';
  };

  const onMove = (e) => {
    if (!dragging || selectMode) return;
    const t = e.touches ? e.touches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (!isDrag && Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
    if (!isDrag && Math.abs(dx) > 5) isDrag = true;
    if (!isDrag) return;

    e.preventDefault();
    const already = wrapper.classList.contains('swiped') ? -80 : 0;
    const x = Math.min(0, Math.max(-80, already + dx));
    card.style.transform = `translateX(${x}px)`;
  };

  const onEnd = (e) => {
    if (!dragging) return;
    dragging = false;
    card.style.transition = '';
    if (!isDrag) return;

    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - startX;
    const already = wrapper.classList.contains('swiped');

    if (already ? dx > 30 : dx < -30) {
      wrapper.classList.toggle('swiped', !already);
    }
    card.style.transform = '';
  };

  card.addEventListener('touchstart', onStart, { passive: true });
  card.addEventListener('touchmove',  onMove,  { passive: false });
  card.addEventListener('touchend',   onEnd);

  // Mouse fallback for desktop testing
  card.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
}

/* ── Checkbox tap (select mode) ── */
function attachSelectTap(wrapper) {
  wrapper.addEventListener('click', (e) => {
    if (!selectMode) return;
    e.stopPropagation();
    const id = wrapper.dataset.id;
    if (checkedIds.has(id)) {
      checkedIds.delete(id);
      wrapper.classList.remove('checked');
    } else {
      checkedIds.add(id);
      wrapper.classList.add('checked');
    }
    renderToolbar();
  });
}

/* ── Single-delete button (swipe reveal) ── */
function attachDeleteBtn(wrapper) {
  const btn = wrapper.querySelector('.record-delete-bg');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = wrapper.dataset.id;
    wrapper.classList.add('deleting');
    setTimeout(() => {
      deleteItem(id);
      renderRecords();
      showToast('Record deleted');
    }, 280);
  });
}

/* ── Render ── */
function renderRecords(filter) {
  const f = filter || AppState.currentFilter || 'all';
  AppState.currentFilter = f;

  const list  = document.getElementById('records-list');
  const pills = document.getElementById('filter-pills');
  if (!list || !pills) return;

  /* Filter pills */
  const categories = ['all', 'financial', 'events', 'research', 'teaching'];
  pills.innerHTML = categories.map(c =>
    `<button onclick="renderRecords('${c}')" class="pill ${AppState.currentFilter === c ? 'active' : ''}">
      ${c.charAt(0).toUpperCase() + c.slice(1)}
    </button>`
  ).join('');

  /* Toolbar (insert once) */
  if (!document.getElementById('records-toolbar')) {
    const tb = document.createElement('div');
    tb.id = 'records-toolbar';
    tb.className = 'records-toolbar';
    tb.innerHTML = `
      <button class="select-btn" onclick="toggleSelectMode()">Select</button>
      <button class="delete-selected-btn" onclick="deleteSelected()">
        <i class="ti ti-trash"></i> Delete
      </button>`;
    list.parentElement.insertBefore(tb, list);
  }

  /* Build items */
  let items = [];
  if (f === 'all')        items = [...AppState.practiceRecords, ...AppState.events];
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
    const id = getItemId(it);
    if (it.income !== undefined) {
      return `
      <div class="record-swipe-wrapper" data-id="${id}">
        <button class="record-delete-bg"><i class="ti ti-trash"></i>Delete</button>
        <div class="record-checkbox"><i class="ti ti-check"></i></div>
        <div class="record-card">
          <strong><i class="ti ti-stethoscope" style="color:var(--icon-teal-fg);margin-right:6px"></i>${it.location || 'Session'}</strong>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span>${it.date} · ${it.patients || 0} patients</span>
            <span style="font-weight:700;color:var(--navy)">${formatCurrency(it.net)}</span>
          </div>
        </div>
      </div>`;
    }
    const iconMap = { teaching: 'ti-school', research: 'ti-microscope', events: 'ti-calendar-event' };
    const icon = iconMap[it.type] || 'ti-star';
    return `
    <div class="record-swipe-wrapper" data-id="${id}">
      <button class="record-delete-bg"><i class="ti ti-trash"></i>Delete</button>
      <div class="record-checkbox"><i class="ti ti-check"></i></div>
      <div class="record-card">
        <strong><i class="ti ${icon}" style="color:var(--icon-blue-fg);margin-right:6px"></i>${it.title}</strong>
        <div>${it.date}${it.venue ? ' · ' + it.venue : ''}</div>
      </div>
    </div>`;
  }).join('');

  /* Attach interactions */
  document.querySelectorAll('.record-swipe-wrapper').forEach(w => {
    attachSwipe(w);
    attachSelectTap(w);
    attachDeleteBtn(w);
    // restore checked state
    if (checkedIds.has(w.dataset.id)) w.classList.add('checked');
  });

  /* Restore select mode visual */
  document.body.classList.toggle('select-mode', selectMode);
  renderToolbar();

  /* Revenue summary card */
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

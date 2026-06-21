function startPractice() {
  AppState.currentDate = getTodayISO();
  document.getElementById('practice-date').textContent = getTodayFriendly();
  populateHospitals();
  navigateTo('screen-practice-hospital');
}

function populateHospitals() {
  const hospitals = ['Asiri', 'Suwasewana', 'Lakeside', 'Madawala', 'Digana', 'Manikhinna'];
  const grid = document.getElementById('hospital-grid');
  grid.innerHTML = hospitals.map(h =>
    `<button type="button" onclick="selectHospital('${h}', this)">${h}</button>`
  ).join('');
}

function selectHospital(name, btn) {
  AppState.selectedHospital = name;
  document.querySelectorAll('#hospital-grid button').forEach(b =>
    b.classList.toggle('selected', b === btn)
  );
}

function goToStep2() {
  if (!AppState.selectedHospital) { showToast('Select a hospital first'); return; }
  navigateTo('screen-practice-mode');
}

function goToStep3(mode) {
  AppState.entryMode = mode;
  if (mode === 'bulk') {
    navigateTo('screen-practice-bulk');
  } else {
    AppState.individualPatients = [];
    renderPatientList();
    navigateTo('screen-practice-individual');
  }
}

// ── Bulk ──
function initBulk() {
  const sel = document.getElementById('bulk-count');
  if (!sel) return;
  sel.innerHTML = Array.from({ length: 20 }, (_, i) =>
    `<option value="${i + 1}">${i + 1}</option>`
  ).join('');

  document.querySelectorAll('#bulk-form input, #bulk-form select').forEach(i =>
    i.addEventListener('input', calcBulk)
  );
  document.querySelectorAll('input[name="income-method"]').forEach(r =>
    r.addEventListener('change', () => {
      const label = document.getElementById('bulk-amount-label');
      label.textContent = document.querySelector('input[name="income-method"]:checked').value === 'per'
        ? 'Rate per Patient (LKR)'
        : 'Total Amount (LKR)';
      calcBulk();
    })
  );
}

function calcBulk() {
  const count  = Number(document.getElementById('bulk-count').value || 1);
  const method = document.querySelector('input[name="income-method"]:checked').value;
  let total = 0;
  if (method === 'per') {
    total = Number(document.getElementById('bulk-amount').value || 0) * count;
  } else {
    total = Number(document.getElementById('bulk-amount').value || 0);
  }
  const surgery    = Number(document.getElementById('bulk-surgery').value || 0);
  const additional = Number(document.getElementById('bulk-additional').value || 0);
  const expenses   = Number(document.getElementById('bulk-expenses').value || 0);
  const net = total + surgery + additional - expenses;
  document.getElementById('bulk-net').textContent = formatCurrency(net);
}

function saveBulkRecord() {
  const count  = Number(document.getElementById('bulk-count').value || 1);
  const method = document.querySelector('input[name="income-method"]:checked').value;
  const raw    = Number(document.getElementById('bulk-amount').value || 0);
  const total  = method === 'per' ? raw * count : raw;
  const surgery    = Number(document.getElementById('bulk-surgery').value || 0);
  const additional = Number(document.getElementById('bulk-additional').value || 0);
  const expenses   = Number(document.getElementById('bulk-expenses').value || 0);
  const notes = document.getElementById('bulk-notes').value || '';
  const net   = total + surgery + additional - expenses;

  const rec = {
    pid: 'S-' + Date.now(),
    name: 'Session',
    bht: '',
    date: AppState.currentDate,
    location: AppState.selectedHospital,
    patients: count,
    income: total,
    net,
    type: 'financial',
    notes
  };
  AppState.practiceRecords.unshift(rec);
  AppState.save();
  showToast('Session saved ✓');
  navTo('screen-records');
  renderRecords();
}

// ── Individual ──
function addPatient() {
  const bht    = document.getElementById('p-bht').value.trim();
  const name   = document.getElementById('p-name').value.trim();
  const pid    = document.getElementById('p-pid').value.trim();
  const charge = Number(document.getElementById('p-charge').value || 0);
  if (!name && !bht) { showToast('Enter patient name or BHT'); return; }
  AppState.individualPatients.push({ bht, name, pid, cost: charge });
  document.getElementById('p-bht').value = '';
  document.getElementById('p-name').value = '';
  document.getElementById('p-pid').value = '';
  document.getElementById('p-charge').value = '';
  document.getElementById('p-bht').focus();
  renderPatientList();
}

function renderPatientList() {
  const list = document.getElementById('patient-list');
  if (!list) return;
  if (AppState.individualPatients.length === 0) {
    list.innerHTML = '<div class="record-empty" style="padding:20px 0">No patients added yet</div>';
    document.getElementById('patient-summary').style.display = 'none';
    return;
  }
  list.innerHTML = AppState.individualPatients.map((p, i) => `
    <div class="patient-row">
      <div>
        <div style="font-weight:600;font-size:14px">${p.name || p.bht}</div>
        <div style="font-size:12px;color:var(--text-sec)">${p.pid || ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-weight:700">${formatCurrency(p.cost)}</span>
        <button class="del" onclick="delPatient(${i})">×</button>
      </div>
    </div>`).join('');

  const total   = AppState.individualPatients.reduce((s, p) => s + p.cost, 0);
  const summary = document.getElementById('patient-summary');
  summary.style.display = 'block';
  summary.innerHTML = `${formatCurrency(total)} · ${AppState.individualPatients.length} patient${AppState.individualPatients.length !== 1 ? 's' : ''}`;
}

function delPatient(i) {
  AppState.individualPatients.splice(i, 1);
  renderPatientList();
}

function finaliseIndividual() {
  if (AppState.individualPatients.length === 0) { showToast('No patients to save'); return; }
  const totalIncome = AppState.individualPatients.reduce((s, p) => s + p.cost, 0);
  const rec = {
    pid: 'S-' + Date.now(),
    name: 'Session',
    bht: '',
    date: AppState.currentDate,
    location: AppState.selectedHospital,
    patients: AppState.individualPatients.length,
    income: totalIncome,
    net: totalIncome,
    type: 'financial',
    notes: 'Per-patient session',
    patientsList: AppState.individualPatients
  };
  AppState.practiceRecords.unshift(rec);
  AppState.save();
  AppState.individualPatients = [];
  showToast('Session saved ✓');
  renderRecords();
  navTo('screen-records');
}

document.addEventListener('DOMContentLoaded', () => { initBulk(); });

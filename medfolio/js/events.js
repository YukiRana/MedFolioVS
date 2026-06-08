const EVENT_CATEGORIES = [
  'Teaching Activities','Research & Publications','Conferences & Workshops','Presentations','Examiner Roles','Postgraduate Training','Clinical Appointments','Innovation & AI','Awards & Recognition','Student Supervision','Curriculum Development'
];
let selectedChip = '';
function initEvents(){
  const chips = document.getElementById('events-chips');
  chips.innerHTML = EVENT_CATEGORIES.map(c=>`<button type="button" onclick="selectChip('${c}')">${c}</button>`).join('');
  document.getElementById('ev-date').value = getTodayISO();
  document.getElementById('file-zone').addEventListener('click', ()=> document.getElementById('ev-file').click());
  document.getElementById('ev-file').addEventListener('change', (e)=>{ const f=e.target.files[0]; if(f) document.getElementById('file-zone').textContent = f.name });
}

function selectChip(name){ selectedChip = name; document.querySelectorAll('#events-chips button').forEach(b=> b.classList.toggle('selected', b.textContent===name)); }

function saveEvent(){
  const title = document.getElementById('ev-title').value.trim();
  const date = document.getElementById('ev-date').value;
  if(!title || !selectedChip){ showToast('Title and category required'); return }
  let type='events';
  const lc = title.toLowerCase();
  if(lc.includes('teach')) type='teaching';
  if(lc.includes('research')||lc.includes('publication')||selectedChip.includes('Research')) type='research';
  const ev = { title, category:selectedChip, date, venue:document.getElementById('ev-venue').value, role:document.getElementById('ev-role').value, desc:document.getElementById('ev-desc').value, collaborators:document.getElementById('ev-collab').value, filename: (document.getElementById('ev-file').files[0]||{}).name || '', type };
  AppState.events.unshift(ev);
  AppState.save();
  // reset
  document.getElementById('ev-title').value=''; document.getElementById('ev-date').value=getTodayISO(); document.getElementById('ev-role').value=''; document.getElementById('ev-venue').value=''; document.getElementById('ev-desc').value=''; document.getElementById('ev-collab').value=''; document.getElementById('file-zone').textContent='Tap to attach certificate, photo, or PDF'; selectedChip=''; document.querySelectorAll('#events-chips button').forEach(b=> b.classList.remove('selected'));
  showToast('Event added to portfolio ✓');
  showScreen('screen-records'); renderRecords();
}

document.addEventListener('DOMContentLoaded', initEvents);

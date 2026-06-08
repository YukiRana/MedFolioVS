function renderCV(){
  const container = document.getElementById('cv-sections');
  const sections = [
    { key:'Teaching Activities', icon:'ti-school', colour:'badge-green' },
    { key:'Research & Publications', icon:'ti-microscope', colour:'badge-gold' },
    { key:'Presentations & Awards', icon:'ti-award', colour:'badge-purple' },
    { key:'Examiner Roles', icon:'ti-clipboard-check', colour:'badge-blue' },
    { key:'Innovation & AI', icon:'ti-cpu', colour:'badge-red' },
  ];
  container.innerHTML = sections.map(s=>{
    const items = AppState.events.filter(e=> e.category===s.key || (s.key.includes('Research') && e.type==='research'));
    const list = items.length? items.map(it=>`<div class="cv-entry"><strong>${it.title}</strong><div>${it.date} · ${it.venue||''}</div></div>`).join('') : '<div class="cv-entry">No entries yet — add via Events module</div>';
    return `<div class="cv-section"><h4>${s.key} <button onclick="toggleSection(this)" class="topbar-btn"><i class="ti ti-chevron-down"></i></button></h4><div class="cv-list">${list}</div></div>`;
  }).join('');
}

function toggleSection(btn){ const section = btn.closest('.cv-section'); const list = section.querySelector('.cv-list'); if(list.style.display==='none'){ list.style.display='block'; btn.innerHTML='<i class="ti ti-chevron-up"></i>' } else { list.style.display='none'; btn.innerHTML='<i class="ti ti-chevron-down"></i>' } }

document.addEventListener('DOMContentLoaded', ()=>{ renderCV(); });

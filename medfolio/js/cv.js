function renderCV() {
  const container = document.getElementById('cv-sections');
  if (!container) return;

  const sections = [
    { key: 'Teaching Activities',       icon: 'ti-school',          color: 'var(--icon-teal-fg)' },
    { key: 'Research & Publications',   icon: 'ti-microscope',      color: 'var(--icon-amber-fg)' },
    { key: 'Conferences & Workshops',   icon: 'ti-calendar-event',  color: 'var(--icon-blue-fg)' },
    { key: 'Examiner Roles',            icon: 'ti-clipboard-check', color: 'var(--icon-blue-fg)' },
    { key: 'Innovation & AI',           icon: 'ti-cpu',             color: 'var(--icon-purple-fg)' },
    { key: 'Awards & Recognition',      icon: 'ti-award',           color: 'var(--icon-amber-fg)' },
  ];

  container.innerHTML = sections.map(s => {
    const items = AppState.events.filter(e =>
      e.category === s.key || (s.key.includes('Research') && e.type === 'research')
    );
    const list = items.length
      ? items.map(it => `
          <div class="cv-entry">
            <strong>${it.title}</strong>
            <div>${it.date}${it.venue ? ' · ' + it.venue : ''}${it.role ? ' · ' + it.role : ''}</div>
          </div>`).join('')
      : '<div class="cv-entry" style="color:var(--text-hint);font-size:13px;">No entries yet — add via Events module</div>';

    return `
      <div class="cv-section">
        <h4>
          <span><i class="ti ${s.icon}" style="color:${s.color};margin-right:7px"></i>${s.key}</span>
          <button onclick="toggleSection(this)" class="topbar-btn" style="font-size:16px"><i class="ti ti-chevron-down"></i></button>
        </h4>
        <div class="cv-list">${list}</div>
      </div>`;
  }).join('');
}

function toggleSection(btn) {
  const section = btn.closest('.cv-section');
  const listEl  = section.querySelector('.cv-list');
  const isHidden = listEl.style.display === 'none';
  listEl.style.display = isHidden ? 'block' : 'none';
  btn.innerHTML = isHidden ? '<i class="ti ti-chevron-up"></i>' : '<i class="ti ti-chevron-down"></i>';
}

document.addEventListener('DOMContentLoaded', () => { renderCV(); });

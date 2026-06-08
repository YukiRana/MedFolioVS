const screenHistory = [];
function getCurrentScreen(){ const s = document.querySelector('.screen.active'); return s && s.id ? s.id : 'screen-home'; }

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>{ s.classList.remove('active'); s.style.display='none' });
  const el = document.getElementById(id);
  if(!el) return;
  // bottom nav visibility
  const bottom = document.getElementById('bottom-nav');
  if(id.startsWith('screen-practice')) bottom.classList.add('hide-nav'); else bottom.classList.remove('hide-nav');
  el.style.display = 'block';
  void el.offsetHeight;
  el.classList.add('active');
  // nav active
  document.querySelectorAll('.nav-btn').forEach(b=> b.classList.toggle('active', b.dataset.screen===id));
  // lazy analytics init
  if(id==='screen-analytics' && typeof initAnalytics === 'function') initAnalytics();
  window.scrollTo(0,0);
}

function navigateTo(id){ screenHistory.push(getCurrentScreen()); showScreen(id); }
function goBack(){ const prev = screenHistory.pop(); if(prev) showScreen(prev); else showScreen('screen-home'); }

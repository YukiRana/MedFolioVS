const screenHistory = [];

function getCurrentScreen() {
  const s = document.querySelector('.screen.active');
  return s && s.id ? s.id : 'screen-home';
}

function navTo(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (!el) return;

  el.style.display = 'block';
  void el.offsetHeight;
  el.classList.add('active');

  // push to browser history so phone back button is intercepted
  history.pushState({ screen: id }, '', '');

  // sync nav active state
  document.querySelectorAll('.nav-item[data-screen]').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === id);
    if (b.classList.contains('nav-home')) {
      b.classList.toggle('active', id === 'screen-home');
    }
  });

  if (id === 'screen-analytics' && typeof initAnalytics === 'function') initAnalytics();
  window.scrollTo(0, 0);
}

function showScreen(id) { navTo(id); }

function navigateTo(id) {
  screenHistory.push(getCurrentScreen());
  navTo(id);
}

function goBack() {
  const prev = screenHistory.pop();
  if (prev) navTo(prev);
  else navTo('screen-home');
}

// phone/browser back button
window.addEventListener('popstate', () => {
  const prev = screenHistory.pop();
  if (prev) navTo(prev);
  else navTo('screen-home');
});

function setActive(btn) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// push an initial state on load so the very first back press is caught
history.pushState({ screen: 'screen-home' }, '', '');
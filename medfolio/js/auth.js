const VALID_EMAIL = 'admin@user.com';
const VALID_PASSWORD = 'KalharaJ@multi123';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function initLogin() {
  const form     = document.getElementById('login-form');
  const pwToggle = document.getElementById('pw-toggle');
  const pwInput  = document.getElementById('password');
  const err      = document.getElementById('login-error');

  pwToggle.addEventListener('click', () => {
    if (pwInput.type === 'password') {
      pwInput.type = 'text';
      pwToggle.textContent = '🙈';
    } else {
      pwInput.type = 'password';
      pwToggle.textContent = '👁️';
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    err.hidden = true;
    const email = document.getElementById('email').value.trim();
    const pw    = document.getElementById('password').value;
    if (email.toLowerCase() === VALID_EMAIL && pw === VALID_PASSWORD) {
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('loginTime', String(Date.now()));
      window.location.href = 'app.html';
    } else {
      err.textContent = 'Incorrect email or password.';
      err.hidden = false;
    }
  });
}

function checkSession() {
  const logged = sessionStorage.getItem('loggedIn');
  const t      = Number(sessionStorage.getItem('loginTime') || 0);
  if (!logged || !t || (Date.now() - t) > SESSION_DURATION_MS) {
    sessionStorage.clear();
    const path = location.pathname;
    if (path.endsWith('app.html')) {
      window.location.href = 'index.html';
    }
    return false;
  }
  return true;
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

function showToast(message, duration = 2500){
  let t = document.getElementById('toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.textContent = message;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), duration);
}

function formatCurrency(amount){
  return 'LKR ' + Number(amount || 0).toLocaleString('en-LK');
}

function getGreeting(){
  const h = new Date().getHours();
  if(h < 12) return 'Good Morning,';
  if(h < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

function getTodayISO(){ return new Date().toISOString().split('T')[0]; }
function getTodayFriendly(){ return new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) }
function getTodayShort(){ return new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) }

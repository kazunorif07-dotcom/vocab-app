import { signIn, signOut, onAuthChange } from './auth.js';

// ===== 画面の切り替え（URL の #review / #add / #list に合わせて表示を変える） =====

const VIEWS = ['review', 'add', 'list'];

function showView() {
  const name = location.hash.slice(1);
  const current = VIEWS.includes(name) ? name : 'review';

  for (const view of VIEWS) {
    document.getElementById(`view-${view}`).hidden = view !== current;
  }
  for (const tab of document.querySelectorAll('.tabbar a')) {
    tab.classList.toggle('active', tab.dataset.view === current);
  }
}

window.addEventListener('hashchange', showView);
showView();

// ===== ログイン =====

const loading = document.getElementById('loading');
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const logoutButton = document.getElementById('logout-button');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// ログインしているかどうかで、ログイン画面とアプリ本体を切り替える
onAuthChange((user) => {
  loading.hidden = true;
  loginScreen.hidden = !!user;
  appScreen.hidden = !user;
  logoutButton.hidden = !user;
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // ページの再読み込みを止める
  const button = loginForm.querySelector('button');
  button.disabled = true;
  loginError.hidden = true;

  try {
    await signIn(loginForm.email.value.trim(), loginForm.password.value);
    loginForm.reset();
  } catch (error) {
    loginError.textContent = toJapaneseMessage(error);
    loginError.hidden = false;
  } finally {
    button.disabled = false;
  }
});

logoutButton.addEventListener('click', async () => {
  try {
    await signOut();
  } catch (error) {
    alert(`ログアウトできませんでした：${error.message}`);
  }
});

function toJapaneseMessage(error) {
  if (error.message === 'Invalid login credentials') {
    return 'メールアドレスかパスワードが違います';
  }
  if (error.message === 'Email not confirmed') {
    return 'メールアドレスの確認が済んでいません';
  }
  if (error.message?.includes('fetch')) {
    return 'インターネットに接続できません';
  }
  return `ログインできませんでした：${error.message}`;
}

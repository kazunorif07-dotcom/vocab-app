import { signIn, signOut, onAuthChange } from './auth.js';
import { addCard } from './cards.js';

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

// ===== 単語の追加 =====

const addForm = document.getElementById('add-form');
const addMessage = document.getElementById('add-message');
const copyButton = document.getElementById('copy-prompt-button');
const copyMessage = document.getElementById('copy-message');

// メッセージを表示する（type は 'success' か 'error'）。成功メッセージは数秒で消す
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
  element.hidden = false;
  clearTimeout(element.timer);
  if (type === 'success') {
    element.timer = setTimeout(() => { element.hidden = true; }, 4000);
  }
}

copyButton.addEventListener('click', async () => {
  const word = addForm.word.value.trim();
  if (!word) {
    showMessage(copyMessage, '先に英単語を入力してください', 'error');
    addForm.word.focus();
    return;
  }
  const text = `${word}を使った自然な英語の例文と和訳を1つ作って`;
  try {
    await copyText(text);
    showMessage(copyMessage, 'コピーしました。AI のチャットに貼り付けてください', 'success');
  } catch {
    showMessage(copyMessage, 'コピーできませんでした', 'error');
  }
});

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 古いブラウザ向けの予備の方法
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    if (!ok) throw new Error('copy failed');
  }
}

addForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const card = {
    word: addForm.word.value.trim(),
    meaning: addForm.meaning.value.trim(),
    example: addForm.example.value.trim(),
    example_ja: addForm.example_ja.value.trim(),
  };
  if (!card.word || !card.meaning) {
    showMessage(addMessage, '英単語と意味は必ず入力してください', 'error');
    return;
  }

  const button = addForm.querySelector('button[type=submit]');
  button.disabled = true;
  try {
    await addCard(card);
    addForm.reset();
    copyMessage.hidden = true;
    showMessage(addMessage, `「${card.word}」を追加しました`, 'success');
    addForm.word.focus();
  } catch (error) {
    showMessage(addMessage, `追加できませんでした：${error.message}`, 'error');
  } finally {
    button.disabled = false;
  }
});

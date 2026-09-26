// 画面の切り替え（URL の #review / #add / #list に合わせて表示を変える）

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

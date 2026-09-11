// app.js — 图书收藏管理应用（含三个独立研究任务）
const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const storageTip = document.querySelector('#storage-tip');
const searchInput = document.querySelector('#search-input');
const exportBtn = document.querySelector('#export-btn');
const list = document.querySelector('#book-list');

// 存储容错：try/catch 包裹 localStorage 恢复
let books;
try {
  books = JSON.parse(localStorage.getItem('books') || '[]');
} catch (e) {
  books = [];
  storageTip.textContent = '存档数据损坏，已重置为空列表';
}
let keyword = '';

// 存储容错：try/catch 包裹保存
const save = () => {
  try {
    localStorage.setItem('books', JSON.stringify(books));
    storageTip.textContent = '';
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      storageTip.textContent = '本地存储空间已满，请删除一些图书或导出后清空';
    } else {
      storageTip.textContent = '保存失败：' + e.message;
    }
  }
};

// 生成唯一ID，用于事件委托定位
let nextId = books.length > 0
  ? Math.max(...books.map(b => b.id || 0)) + 1
  : 1;

const render = () => {
  list.innerHTML = '';
  const shown = books.filter(b => {
    if (keyword === '') return true;
    return b.title.includes(keyword) || b.author.includes(keyword);
  });
  if (shown.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-tip';
    p.textContent = keyword ? '没有匹配的图书' : '暂无图书，添加一本吧';
    list.appendChild(p);
    return;
  }
  shown.forEach(book => {
    const item = document.createElement('div');
    item.className = 'book-item';
    item.dataset.id = book.id; // 用 data-id 标记，事件委托靠它定位

    const info = document.createElement('div');
    info.className = 'info';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = book.title;
    const authorSpan = document.createElement('span');
    authorSpan.className = 'author';
    authorSpan.textContent = ' — ' + book.author;
    const ratingSpan = document.createElement('span');
    ratingSpan.className = 'rating';
    ratingSpan.textContent = ' ' + book.rating + '分';
    info.appendChild(titleSpan);
    info.appendChild(authorSpan);
    info.appendChild(ratingSpan);
    item.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '编辑';
    editBtn.dataset.action = 'edit'; // 用 data-action 标记
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.dataset.action = 'delete';
    actions.appendChild(delBtn);

    item.appendChild(actions);
    list.appendChild(item);
  });
};

// ========== 研究任务1：事件委托重构 ==========
// 原来每个按钮绑一个 addEventListener，现在只在父元素 list 上绑一个
list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return; // 没点到编辑/删除按钮就不管

  const item = btn.closest('.book-item');
  if (!item) return;
  const id = Number(item.dataset.id);
  const book = books.find(b => b.id === id);
  if (!book) return;

  const action = btn.dataset.action;
  if (action === 'delete') {
    books = books.filter(b => b.id !== id);
    save();
    render();
  } else if (action === 'edit') {
    startEdit(book);
  }
});
// 重构前：每渲染一本都要对编辑和删除各绑一次监听器 → N本 = 2N个监听器
// 重构后：list 上只有 1 个监听器，无论多少本都不变
// 原理：利用事件冒泡，子元素的 click 会冒泡到父元素，父元素用 e.target 判断点的是谁

// 编辑模式
const startEdit = (book) => {
  list.innerHTML = '';
  const item = document.createElement('div');
  item.className = 'book-item';
  item.dataset.id = book.id;

  const editForm = document.createElement('div');
  editForm.className = 'edit-form';

  const titleEdit = document.createElement('input');
  titleEdit.type = 'text';
  titleEdit.value = book.title;

  const authorEdit = document.createElement('input');
  authorEdit.type = 'text';
  authorEdit.value = book.author;

  const ratingEdit = document.createElement('select');
  for (let i = 5; i >= 1; i--) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i + '分';
    if (i == book.rating) opt.selected = true;
    ratingEdit.appendChild(opt);
  }

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '保存';
  saveBtn.dataset.action = 'save-edit';
  saveBtn.addEventListener('click', () => {
    const newTitle = titleEdit.value.trim();
    if (newTitle === '') {
      tip.textContent = '书名不能为空';
      return;
    }
    tip.textContent = '';
    book.title = newTitle;
    book.author = authorEdit.value.trim();
    book.rating = ratingEdit.value;
    save();
    render();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '取消';
  cancelBtn.dataset.action = 'cancel-edit';
  cancelBtn.addEventListener('click', () => render());

  editForm.appendChild(titleEdit);
  editForm.appendChild(authorEdit);
  editForm.appendChild(ratingEdit);
  editForm.appendChild(saveBtn);
  editForm.appendChild(cancelBtn);
  item.appendChild(editForm);
  list.appendChild(item);
};

// 添加图书
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const rating = ratingInput.value;
  if (title === '') {
    tip.textContent = '书名不能为空';
    return;
  }
  if (rating === '') {
    tip.textContent = '请选择评分';
    return;
  }
  tip.textContent = '';
  books.push({ id: nextId++, title: title, author: author, rating: rating });
  save();
  titleInput.value = '';
  authorInput.value = '';
  ratingInput.value = '';
  render();
});

searchInput.addEventListener('input', () => {
  keyword = searchInput.value.trim();
  render();
});

// ========== 研究任务2：数据导出 ==========
exportBtn.addEventListener('click', () => {
  const jsonStr = JSON.stringify(books, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'books-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // 释放内存
});
// 步骤：1.把数据转JSON字符串 → 2.用Blob包装成文件对象 → 3.URL.createObjectURL生成临时下载地址
// → 4.创建隐藏a标签设download属性 → 5.模拟点击触发下载 → 6.释放临时URL

render();

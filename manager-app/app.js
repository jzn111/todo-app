// app.js — 图书收藏管理应用（第三步：编辑与本地存储）
const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const searchInput = document.querySelector('#search-input');
const list = document.querySelector('#book-list');

// 从localStorage恢复，没有就空数组
let books = JSON.parse(localStorage.getItem('books') || '[]');
let keyword = '';

const save = () => localStorage.setItem('books', JSON.stringify(books));

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

    // 编辑按钮
    const editBtn = document.createElement('button');
    editBtn.textContent = '编辑';
    editBtn.addEventListener('click', () => startEdit(book));
    actions.appendChild(editBtn);

    // 删除按钮
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', () => {
      books = books.filter(b => b !== book);
      save();
      render();
    });
    actions.appendChild(delBtn);
    item.appendChild(actions);

    list.appendChild(item);
  });
};

// 编辑模式：把文字变成输入框
const startEdit = (book) => {
  list.innerHTML = '';
  const item = document.createElement('div');
  item.className = 'book-item';

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
  cancelBtn.addEventListener('click', () => render());

  editForm.appendChild(titleEdit);
  editForm.appendChild(authorEdit);
  editForm.appendChild(ratingEdit);
  editForm.appendChild(saveBtn);
  editForm.appendChild(cancelBtn);
  item.appendChild(editForm);
  list.appendChild(item);
};

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
  books.push({ title: title, author: author, rating: rating });
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

render();

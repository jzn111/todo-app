// app.js — 图书收藏管理应用（第二步：删除与搜索）
const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const searchInput = document.querySelector('#search-input');
const list = document.querySelector('#book-list');

let books = [];
let keyword = '';

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
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', () => {
      books = books.filter(b => b !== book);
      render();
    });
    actions.appendChild(delBtn);
    item.appendChild(actions);

    list.appendChild(item);
  });
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

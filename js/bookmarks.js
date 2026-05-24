const BOOKMARK_KEY = 'espacios360_bookmarks';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; }
  catch { return []; }
}

function isBookmarked(id) {
  return getBookmarks().includes(String(id));
}

function toggleBookmark(id) {
  const saved = getBookmarks();
  const sid = String(id);
  const idx = saved.indexOf(sid);
  if (idx === -1) saved.push(sid);
  else saved.splice(idx, 1);
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(saved));
}

function updateBookmarkCount() {
  const count = getBookmarks().length;
  document.querySelectorAll('.bookmark-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

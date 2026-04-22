const els = {
  loginView: document.getElementById("loginView"),
  bookView: document.getElementById("bookView"),
  answerView: document.getElementById("answerView"),
  bookCodeInput: document.getElementById("bookCodeInput"),
  openBookBtn: document.getElementById("openBookBtn"),
  loginMsg: document.getElementById("loginMsg"),
  bookTitle: document.getElementById("bookTitle"),
  searchInput: document.getElementById("searchInput"),
  grid: document.getElementById("grid"),
  backBtn: document.getElementById("backBtn"),
  answerTitle: document.getElementById("answerTitle"),
  answerImg: document.getElementById("answerImg"),
};

let currentBook = null;
let allItems = [];

const BOOK_MAP = {
  "TEST-BOOK-01": "assets/demo-book.json"
};

els.openBookBtn.addEventListener("click", openBook);
els.searchInput.addEventListener("input", renderFilteredGrid);
els.backBtn.addEventListener("click", () => {
  els.answerView.classList.add("hidden");
  els.bookView.classList.remove("hidden");
});

async function openBook() {
  const code = els.bookCodeInput.value.trim();
  const file = BOOK_MAP[code];

  if (!file) {
    els.loginMsg.textContent = "Invalid book code.";
    return;
  }

  try {
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error("Cannot load data");

    currentBook = await res.json();
    allItems = currentBook.items || [];

    els.bookTitle.textContent = currentBook.bookTitle || "Book Answers";
    els.loginView.classList.add("hidden");
    els.answerView.classList.add("hidden");
    els.bookView.classList.remove("hidden");
    renderFilteredGrid();
  } catch (err) {
    els.loginMsg.textContent = "Failed to load book data.";
  }
}

function renderFilteredGrid() {
  const q = els.searchInput.value.trim().toLowerCase();
  const filtered = allItems.filter(item => {
    return String(item.n).includes(q) || String(item.code).toLowerCase().includes(q);
  });

  els.grid.innerHTML = "";

  for (const item of filtered) {
    const btn = document.createElement("button");
    btn.className = "puzzle-btn";
    btn.textContent = item.n;
    btn.title = item.code || "";
    btn.addEventListener("click", () => showAnswer(item));
    els.grid.appendChild(btn);
  }
}

function showAnswer(item) {
  els.answerTitle.textContent = `Puzzle ${item.n}${item.code ? " - " + item.code : ""}`;
  els.answerImg.src = item.img;
  els.bookView.classList.add("hidden");
  els.answerView.classList.remove("hidden");
}

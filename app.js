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
  answerMsg: document.getElementById("answerMsg")
};

let booksIndex = [];
let currentBook = null;
let allItems = [];

init();

async function init() {
  try {
    const res = await fetch("assets/books.json", { cache: "no-store" });
    const data = await res.json();
    booksIndex = data.books || [];
  } catch (err) {
    els.loginMsg.textContent = "Failed to load book list.";
  }
}

els.openBookBtn.addEventListener("click", openBook);

els.bookCodeInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    openBook();
  }
});

els.searchInput.addEventListener("input", renderFilteredGrid);

els.backBtn.addEventListener("click", () => {
  els.answerView.classList.add("hidden");
  els.bookView.classList.remove("hidden");
  els.answerMsg.classList.add("hidden");
  els.answerMsg.textContent = "";
  els.answerImg.style.display = "block";
});

async function sha256(text) {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", enc.encode(text));
  const bytes = Array.from(new Uint8Array(buffer));
  return bytes.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function openBook() {
  const code = els.bookCodeInput.value.trim().toUpperCase();

  if (!code) {
    els.loginMsg.textContent = "Please enter your book code.";
    return;
  }

  els.loginMsg.textContent = "";

  try {
    const codeHash = await sha256(code);

    const bookMeta = booksIndex.find(
      b => String(b.codeHash).trim().toLowerCase() === codeHash.toLowerCase()
    );

    if (!bookMeta) {
      els.loginMsg.textContent = "Invalid book code.";
      return;
    }

    const res = await fetch(bookMeta.data, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Cannot load book data.");
    }

    currentBook = await res.json();
    allItems = [];

    const start = Number(currentBook.start || 1);
    const end = Number(currentBook.end || 0);
    const folder = currentBook.folder || "";
    const ext = currentBook.ext || "svg";

    for (let i = start; i <= end; i++) {
      allItems.push({
        n: i,
        code: String(i),
        img: `${folder}/${i}.${ext}`
      });
    }

    els.bookTitle.textContent = currentBook.bookTitle || bookMeta.title || "Book Answers";
    els.searchInput.value = "";

    els.loginView.classList.add("hidden");
    els.answerView.classList.add("hidden");
    els.bookView.classList.remove("hidden");

    renderFilteredGrid();
  } catch (err) {
    els.loginMsg.textContent = "Failed to open this book.";
  }
}

function renderFilteredGrid() {
  const q = els.searchInput.value.trim();

  let filtered = allItems;

  if (q !== "") {
    filtered = allItems.filter(item => {
      return String(item.n) === q || String(item.code) === q;
    });
  }

  els.grid.innerHTML = "";

  if (filtered.length === 0) {
    const div = document.createElement("div");
    div.textContent = "No puzzle found.";
    els.grid.appendChild(div);
    return;
  }

  for (const item of filtered) {
    const btn = document.createElement("button");
    btn.className = "puzzle-btn";
    btn.textContent = item.n;
    btn.title = item.code;
    btn.addEventListener("click", () => showAnswer(item));
    els.grid.appendChild(btn);
  }
}

  for (const item of filtered) {
    const btn = document.createElement("button");
    btn.className = "puzzle-btn";
    btn.textContent = item.n;
    btn.title = item.code;
    btn.addEventListener("click", () => showAnswer(item));
    els.grid.appendChild(btn);
  }
}

function showAnswer(item) {
  els.answerTitle.textContent = `Puzzle ${item.n}`;
  els.answerMsg.classList.add("hidden");
  els.answerMsg.textContent = "";
  els.answerImg.style.display = "block";

  els.answerImg.onload = function() {
    els.answerMsg.classList.add("hidden");
    els.answerMsg.textContent = "";
    els.answerImg.style.display = "block";
  };

  els.answerImg.onerror = function() {
    els.answerImg.style.display = "none";
    els.answerMsg.textContent = `Cannot load image: ${item.img}`;
    els.answerMsg.classList.remove("hidden");
  };

  els.answerImg.src = item.img;

  els.bookView.classList.add("hidden");
  els.answerView.classList.remove("hidden");
}

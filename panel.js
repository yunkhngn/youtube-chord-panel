const SOURCES = {
  hac: {
    home: "https://hopamchuan.com/",
    search: (q) => `https://hopamchuan.com/search?q=${encodeURIComponent(q)}`,
  },
  ug: {
    home: "https://www.ultimate-guitar.com/",
    search: (q) =>
      `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(q)}`,
  },
};

const YOUTUBE_WATCH_URLS = [
  "https://www.youtube.com/watch*",
  "https://music.youtube.com/watch*",
];

const frame = document.getElementById("frame");
const form = document.getElementById("search-form");
const input = document.getElementById("query");
const statusEl = document.getElementById("status");
const sourceButtons = [...document.querySelectorAll("#sources button")];

let state = { source: "hac", query: "" };
let currentUrl = "";

function setStatus(message) {
  statusEl.textContent = message;
}

function persist() {
  chrome.storage.local.set({ source: state.source, query: state.query });
}

function renderSource() {
  for (const button of sourceButtons) {
    button.setAttribute("aria-selected", String(button.dataset.source === state.source));
  }
}

function navigate() {
  const source = SOURCES[state.source];
  currentUrl = state.query ? source.search(state.query) : source.home;
  frame.src = currentUrl;
}

function submitSearch(query) {
  state.query = query.trim();
  input.value = state.query;
  persist();
  setStatus("");
  navigate();
}

function cleanVideoTitle(raw) {
  return raw
    .replace(/^\(\d+\)\s*/, "") // "(3) " = số thông báo của YouTube
    .replace(/\s*-\s*YouTube( Music)?$/i, "")
    .replace(/[(\[【].*?[)\]】]/g, " ")
    .replace(/\b(official|music video|video|mv|lyrics?|audio|visualizer|hd|4k)\b/gi, " ")
    .replace(/\s[-–—|]\s/g, " ") // dấu phân tách tên bài / ca sĩ làm từ khóa tìm kém chính xác
    .replace(/\s+/g, " ")
    .trim();
}

async function getYouTubeQuery() {
  const tabs = await chrome.tabs.query({ url: YOUTUBE_WATCH_URLS, lastFocusedWindow: true });
  const tab = tabs.find((t) => t.active) ?? tabs[0];
  return tab?.title ? cleanVideoTitle(tab.title) : "";
}

async function searchFromYouTube() {
  const query = await getYouTubeQuery();
  if (!query) {
    setStatus("Không thấy tab YouTube đang phát video trong cửa sổ này.");
    return;
  }
  submitSearch(query);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitSearch(input.value);
});

document.getElementById("from-youtube").addEventListener("click", searchFromYouTube);

document.getElementById("open-tab").addEventListener("click", () => {
  if (currentUrl) chrome.tabs.create({ url: currentUrl });
});

for (const button of sourceButtons) {
  button.addEventListener("click", () => {
    state.source = button.dataset.source;
    state.query = input.value.trim();
    persist();
    renderSource();
    navigate();
  });
}

async function init() {
  const saved = await chrome.storage.local.get({ source: "hac", query: "" });
  state = { source: SOURCES[saved.source] ? saved.source : "hac", query: saved.query };
  input.value = state.query;
  renderSource();

  // Panel mở lúc đang xem YouTube và chưa có từ khóa cũ -> tự tìm theo tên video.
  if (!state.query) {
    const query = await getYouTubeQuery();
    if (query) {
      submitSearch(query);
      return;
    }
  }
  navigate();
}

init();

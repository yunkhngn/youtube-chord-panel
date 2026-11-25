// Chord Side Panel - Main Controller

const SOURCES = {
  hac: {
    home: "https://hopamchuan.com/",
    search: (q) => `https://hopamchuan.com/search?q=${encodeURIComponent(q)}`,
  },
};

const YOUTUBE_WATCH_URLS = [
  "https://www.youtube.com/watch*",
  "https://youtube.com/watch*",
  "https://music.youtube.com/watch*",
  "https://www.youtube.com/shorts/*",
];

// DOM Elements
const frame = document.getElementById("frame");
const form = document.getElementById("search-form");
const input = document.getElementById("query");
const statusEl = document.getElementById("status");

// Control elements
const btnScrollToggle = document.getElementById("btn-scroll-toggle");
const scrollPlayIcon = document.getElementById("scroll-play-icon");
const scrollPauseIcon = document.getElementById("scroll-pause-icon");
const scrollBtnLabel = document.getElementById("scroll-btn-label");
const speedButtons = [...document.querySelectorAll(".speed-btn")];

const btnSplitToggle = document.getElementById("btn-split-toggle");
const btnAutoSync = document.getElementById("btn-auto-sync");

const historyToggle = document.getElementById("history-toggle");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const historyClear = document.getElementById("history-clear");
const btnOpenTab = document.getElementById("open-tab");

const aboutToggle = document.getElementById("about-toggle");
const aboutPanel = document.getElementById("about-panel");
const aboutClose = document.getElementById("about-close");

// State
let state = {
  source: "hac",
  query: "",
  url: "",
  isScrolling: false,
  scrollSpeed: 1,
  isSplit50: true,
  autoSync: false,
  history: [],
};

let currentUrl = "";
let statusTimer = null;
let pendingSearchQuery = "";
let lastAutoSyncQuery = "";
let activeYoutubeVideoId = "";
let videoSongMap = {};
let navigationSeq = 0;
let frameRulesEnsured = false;

function isValidHopAmChuanOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "hopamchuan.com" || parsed.hostname.endsWith(".hopamchuan.com"))
    );
  } catch {
    return false;
  }
}

function isValidHopAmChuanUrl(url) {
  return Boolean(url) && isValidHopAmChuanOrigin(url);
}

async function ensureFrameRules() {
  if (frameRulesEnsured) return;
  try {
    const res = await chrome.runtime.sendMessage({ type: "ENSURE_FRAME_RULES" });
    if (res?.ok) frameRulesEnsured = true;
  } catch {
    // Ignore if background service worker isn't reachable
  }
}

function setStatus(message, duration = 3000) {
  if (statusTimer) clearTimeout(statusTimer);
  statusEl.textContent = message;
  if (duration > 0 && message) {
    statusTimer = setTimeout(() => {
      statusEl.textContent = "";
    }, duration);
  }
}

function getCachedVideoMapping(videoId) {
  if (!videoId) return null;
  const scoped = videoSongMap[`hac:${videoId}`] || videoSongMap[videoId];
  return scoped && isValidHopAmChuanUrl(scoped.url) ? scoped : null;
}

function saveVideoSongMapping(videoId, url, title) {
  if (!videoId || !isValidHopAmChuanUrl(url)) return;
  delete videoSongMap[videoId];
  videoSongMap[videoId] = { url, title: title || "" };

  const keys = Object.keys(videoSongMap);
  if (keys.length > 100) {
    for (const oldKey of keys.slice(0, keys.length - 100)) {
      delete videoSongMap[oldKey];
    }
  }
}

function persistState() {
  chrome.storage.local.set({
    source: state.source,
    query: state.query,
    url: state.url,
    lastYtQuery: lastAutoSyncQuery,
    videoSongMap,
    scrollSpeed: state.scrollSpeed,
    isSplit50: state.isSplit50,
    autoSync: state.autoSync,
    history: state.history.slice(0, 20),
  });
}

function renderSource() {
  // HopAmChuan only
}

function renderControls() {
  if (state.isScrolling) {
    btnScrollToggle.classList.add("active");
    scrollPlayIcon.classList.add("hidden");
    scrollPauseIcon.classList.remove("hidden");
    scrollBtnLabel.textContent = "Dừng";
  } else {
    btnScrollToggle.classList.remove("active");
    scrollPlayIcon.classList.remove("hidden");
    scrollPauseIcon.classList.add("hidden");
    scrollBtnLabel.textContent = "Cuộn";
  }

  for (const btn of speedButtons) {
    btn.classList.toggle("active", Number(btn.dataset.speed) === state.scrollSpeed);
  }

  btnSplitToggle.setAttribute("aria-pressed", String(state.isSplit50));
  btnSplitToggle.classList.toggle("active", state.isSplit50);

  btnAutoSync.setAttribute("aria-pressed", String(state.autoSync));
  btnAutoSync.classList.toggle("active", state.autoSync);
}

function buildSearchCandidates(rawQuery) {
  const query = (rawQuery || "").trim();
  if (!query) return [];

  const candidates = [];
  const dashIdx = query.indexOf(" - ");
  if (dashIdx !== -1) {
    const left = query.slice(0, dashIdx).trim();
    const right = query.slice(dashIdx + 3).trim();
    if (left && right) {
      candidates.push(`${right} ${left}`, `${left} ${right}`, right);
    }
  }
  candidates.push(query);

  return [...new Set(candidates.filter(Boolean))];
}

async function fetchFirstSongResult(searchQuery) {
  const response = await fetch(SOURCES.hac.search(searchQuery), { credentials: "omit" });
  if (!response.ok) return null;

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const item = doc.querySelector(".song-item");
  const link =
    item?.querySelector('a.song-title[href*="/song/"]') ||
    doc.querySelector('a.song-title[href*="/song/"]');
  if (!link) return null;

  const rawHref = link.getAttribute("href");
  if (!rawHref) return null;

  const resolvedUrl = new URL(rawHref, "https://hopamchuan.com");
  if (!/^\/song\/\d+(\/|$)/.test(resolvedUrl.pathname)) return null;
  resolvedUrl.searchParams.delete("s");
  const cleanUrl = resolvedUrl.toString();
  if (!isValidHopAmChuanUrl(cleanUrl)) return null;

  const songName = link.textContent.replace(/\s+/g, " ").trim();
  const singers = [...(item?.querySelectorAll(".song-singers .author-item") || [])]
    .map((el) => el.textContent.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const title = singers.length > 0 ? `${songName} - ${singers.join(", ")}` : songName;

  return { url: cleanUrl, title };
}

async function resolveFirstSongFromSearch(query) {
  const candidates = buildSearchCandidates(query);
  for (const candidate of candidates) {
    const result = await fetchFirstSongResult(candidate);
    if (result) return result;
  }
  return null;
}

async function resolveAndOpenSong(query, { videoId = "", fallbackStatus = "" } = {}) {
  const cleanQuery = (query || "").trim();
  if (!cleanQuery) return false;

  const seq = ++navigationSeq;
  activeYoutubeVideoId = videoId || "";

  const cached = getCachedVideoMapping(videoId);
  if (cached) {
    openSong(cached.url, cached.title || cleanQuery);
    return true;
  }

  setStatus("Đang mở bài hát…", 0);
  try {
    const resolved = await resolveFirstSongFromSearch(cleanQuery);
    if (seq !== navigationSeq) return false;
    if (resolved) {
      state.history = state.history.filter(
        (h) => !(!h.url && h.query === cleanQuery && h.source === state.source)
      );
      if (videoId) {
        saveVideoSongMapping(videoId, resolved.url, resolved.title || cleanQuery);
      }
      openSong(resolved.url, resolved.title || cleanQuery);
      return true;
    }
  } catch (err) {
    console.warn("Could not resolve song:", err);
  }

  if (seq !== navigationSeq) return false;
  submitSearch(cleanQuery);
  if (fallbackStatus) {
    setStatus(fallbackStatus);
  }
  return false;
}

async function openHistoryItem(item) {
  activeYoutubeVideoId = "";
  const hasSongUrl = Boolean(item.url && isValidHopAmChuanUrl(item.url));
  const label = item.title || item.query || item.url;
  if (hasSongUrl) {
    openSong(item.url, label);
    return;
  }

  await resolveAndOpenSong(item.query, {
    fallbackStatus: "Không tìm thấy bài trực tiếp, đang hiển thị kết quả tìm kiếm.",
  });
}

function renderHistory() {
  if (!state.history || state.history.length === 0) {
    historyList.innerHTML = '<li class="history-empty">Chưa có bài nào trong lịch sử</li>';
    return;
  }

  historyList.innerHTML = "";
  for (const item of state.history) {
    const hasSongUrl = Boolean(item.url && isValidHopAmChuanUrl(item.url));
    const label = item.title || item.query || item.url;
    const badgeText = hasSongUrl ? "Bài hát" : "Mở bài";

    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <span class="history-item-title">${escapeHtml(label)}</span>
      <span class="history-item-src${hasSongUrl ? " is-song" : ""}">${badgeText}</span>
    `;
    li.addEventListener("click", () => {
      state.source = "hac";
      renderSource();
      setPopoverState("none");
      openHistoryItem(item);
    });
    historyList.appendChild(li);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addToHistory(query, source, url = "", title = "") {
  if (!query && !url) return;
  state.history = state.history.filter((h) => {
    if (url && h.url) return h.url !== url;
    return !(h.query === query && h.source === source && !h.url);
  });
  state.history.unshift({
    query: query || title,
    title: title || undefined,
    url: url || undefined,
    source,
    timestamp: Date.now(),
  });
  state.history = state.history.slice(0, 20);
  renderHistory();
  persistState();
}

function recordOpenedSong(title, url) {
  if (!isValidHopAmChuanUrl(url)) return;
  const label = (title || state.query || "").trim();

  if (pendingSearchQuery) {
    const pendingIdx = state.history.findIndex(
      (h) => !h.url && h.query === pendingSearchQuery && h.source === state.source
    );
    if (pendingIdx !== -1) {
      state.history.splice(pendingIdx, 1);
    }
    pendingSearchQuery = "";
  }

  addToHistory(label, state.source, url, label);
}

function navigate() {
  const source = SOURCES[state.source];
  if (state.url && isValidHopAmChuanUrl(state.url)) {
    currentUrl = state.url;
  } else {
    currentUrl = state.query ? source.search(state.query) : source.home;
  }
  frame.src = currentUrl;

  if (state.isScrolling) {
    state.isScrolling = false;
    renderControls();
  }
}

function submitSearch(query) {
  navigationSeq++;
  state.query = query.trim();
  state.url = "";
  pendingSearchQuery = state.query;
  input.value = state.query;
  if (state.query) {
    addToHistory(state.query, state.source);
  }
  persistState();
  setStatus("");
  navigate();
}

function openSong(url, title) {
  if (!isValidHopAmChuanUrl(url)) return;
  navigationSeq++;
  pendingSearchQuery = "";
  state.url = url;
  if (title) {
    state.query = title;
    input.value = title;
  }
  addToHistory(title || state.query, state.source, url, title);
  persistState();
  setStatus("");
  navigate();
}

/**
 * Clean song title from YouTube tab title.
 */
function cleanVideoTitle(raw) {
  if (!raw) return "";

  let title = raw;

  title = title
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#039;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ");

  title = title.replace(/^\(\d+\)\s*/, "");
  title = title.replace(/\s*[-–—|]\s*YouTube( Music)?$/i, "");
  title = title.replace(/[(\[【].*?[)\]】]/g, " ");
  title = title.replace(/\s*\b(ft|feat|featuring)\b\.?.*$/gi, "");
  title = title.replace(
    /\b(official|music video|video|mv|m\/v|lyrics?|audio|visualizer|hd|4k|live|performance|karaoke|beat|tone nam|tone nữ|guitar cover|cover)\b/gi,
    " "
  );
  title = title.replace(/["'“”‘’«»`]/g, " ");
  title = title.replace(/\s+[-–—|]\s+/g, " - ");
  title = title.replace(/(^[\s.\-–—|]+|[\s.\-–—|]+$)/g, "");
  title = title.replace(/\s+/g, " ").trim();
  title = title.replace(/\s*-\s*-\s*/g, " - ");

  return title;
}

function getYouTubeVideoId(rawUrl) {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] || "";
    }
    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

async function getActiveYouTubeTab() {
  const tabs = await chrome.tabs.query({
    url: YOUTUBE_WATCH_URLS,
    active: true,
    lastFocusedWindow: true,
  });
  return tabs[0] || null;
}

async function getYouTubeTab() {
  const tabs = await chrome.tabs.query({ url: YOUTUBE_WATCH_URLS, lastFocusedWindow: true });
  if (tabs && tabs.length > 0) {
    return tabs.find((t) => t.active) ?? tabs[0];
  }
  const allTabs = await chrome.tabs.query({ url: YOUTUBE_WATCH_URLS });
  return allTabs[0] || null;
}

async function openFromYouTubeTab(tab, statusPrefix = "Đã nhận diện") {
  const query = tab?.title ? cleanVideoTitle(tab.title) : "";
  if (!query) return false;

  const videoId = getYouTubeVideoId(tab.url);
  lastAutoSyncQuery = query;
  const openedDirectly = await resolveAndOpenSong(query, {
    videoId,
    fallbackStatus: `${statusPrefix}: ${query}`,
  });
  if (openedDirectly) {
    setStatus(`${statusPrefix}: ${query}`);
  }
  return true;
}

async function searchFromYouTube() {
  setStatus("Đang kiểm tra tab YouTube…");
  const tab = await getYouTubeTab();
  if (!tab || !tab.title) {
    setStatus("Không tìm thấy tab YouTube đang phát video.");
    return;
  }
  const ok = await openFromYouTubeTab(tab, "Đã nhận diện");
  if (!ok) {
    setStatus("Không trích xuất được tên bài từ tiêu đề YouTube.");
  }
}

function postToFrame(message) {
  try {
    frame.contentWindow?.postMessage(message, "*");
  } catch (err) {
    console.warn("Could not post message to frame:", err);
  }
}

function toggleScroll() {
  state.isScrolling = !state.isScrolling;
  renderControls();
  if (state.isScrolling) {
    postToFrame({ type: "CHORD_START_SCROLL", speed: state.scrollSpeed });
    setStatus(`Đang cuộn tự động (${state.scrollSpeed}x)`);
  } else {
    postToFrame({ type: "CHORD_STOP_SCROLL" });
    setStatus("Đã dừng cuộn");
  }
}

function setSpeed(speed) {
  state.scrollSpeed = speed;
  persistState();
  renderControls();
  if (state.isScrolling) {
    postToFrame({ type: "CHORD_START_SCROLL", speed: state.scrollSpeed });
    setStatus(`Tốc độ cuộn: ${state.scrollSpeed}x`);
  }
}

function toggleSplit50() {
  state.isSplit50 = !state.isSplit50;
  persistState();
  renderControls();
  postToFrame({ type: "CHORD_SET_SPLIT_50", enabled: state.isSplit50 });
  setStatus(state.isSplit50 ? "Đã bật chia cột 50 | 50" : "Đã tắt chia cột");
}

function toggleAutoSync() {
  state.autoSync = !state.autoSync;
  persistState();
  renderControls();
  setStatus(
    state.autoSync
      ? "Bật tự động bắt bài khi YouTube chuyển video"
      : "Đã tắt tự động bắt bài"
  );
}

// Listen to HopAmChuan page messages inside iframe
window.addEventListener("message", (event) => {
  if (event.source !== frame.contentWindow) return;
  if (!isValidHopAmChuanOrigin(event.origin)) return;

  const data = event.data;
  if (!data || typeof data !== "object" || data.type !== "CHORD_PAGE_LOADED") return;
  if (!isValidHopAmChuanUrl(data.url)) return;

  currentUrl = data.url;
  if (data.isSong) {
    state.url = data.url;
    const songTitle = typeof data.title === "string" ? data.title.trim() : "";
    if (songTitle) {
      state.query = songTitle;
      input.value = songTitle;
    }
    if (activeYoutubeVideoId) {
      saveVideoSongMapping(activeYoutubeVideoId, data.url, songTitle);
    }
    recordOpenedSong(songTitle, data.url);
  } else {
    state.url = "";
    persistState();
  }
});

frame.addEventListener("load", () => {
  postToFrame({ type: "CHORD_SET_SPLIT_50", enabled: state.isSplit50 });
  if (state.isScrolling) {
    postToFrame({ type: "CHORD_START_SCROLL", speed: state.scrollSpeed });
  }
});

// Event Listeners
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value;
  const activeYtTab = await getActiveYouTubeTab();
  activeYoutubeVideoId = getYouTubeVideoId(activeYtTab?.url);
  submitSearch(query);
});

document.getElementById("from-youtube").addEventListener("click", searchFromYouTube);

btnScrollToggle.addEventListener("click", toggleScroll);

for (const btn of speedButtons) {
  btn.addEventListener("click", () => setSpeed(Number(btn.dataset.speed)));
}

btnSplitToggle.addEventListener("click", toggleSplit50);
btnAutoSync.addEventListener("click", toggleAutoSync);

btnOpenTab.addEventListener("click", () => {
  if (currentUrl) chrome.tabs.create({ url: currentUrl });
});

function setPopoverState(openPanel) {
  const showHistory = openPanel === "history";
  const showAbout = openPanel === "about";
  historyPanel.classList.toggle("hidden", !showHistory);
  aboutPanel.classList.toggle("hidden", !showAbout);
  historyToggle.classList.toggle("active", showHistory);
  aboutToggle.classList.toggle("active", showAbout);
  historyToggle.setAttribute("aria-expanded", String(showHistory));
  aboutToggle.setAttribute("aria-expanded", String(showAbout));
}

historyToggle.addEventListener("click", () => {
  const isOpen = !historyPanel.classList.contains("hidden");
  setPopoverState(isOpen ? "none" : "history");
});

historyClear.addEventListener("click", () => {
  state.history = [];
  pendingSearchQuery = "";
  persistState();
  renderHistory();
  setStatus("Đã xóa lịch sử.");
});

document.addEventListener("click", (e) => {
  if (!historyPanel.contains(e.target) && !historyToggle.contains(e.target)) {
    historyPanel.classList.add("hidden");
    historyToggle.classList.remove("active");
    historyToggle.setAttribute("aria-expanded", "false");
  }
  if (!aboutPanel.contains(e.target) && !aboutToggle.contains(e.target)) {
    aboutPanel.classList.add("hidden");
    aboutToggle.classList.remove("active");
    aboutToggle.setAttribute("aria-expanded", "false");
  }
});

aboutToggle.addEventListener("click", () => {
  const isOpen = !aboutPanel.classList.contains("hidden");
  setPopoverState(isOpen ? "none" : "about");
});

aboutClose.addEventListener("click", () => {
  setPopoverState("none");
});

document.querySelectorAll(".about-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (link.href) {
      chrome.tabs.create({ url: link.href });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!state.autoSync) return;
  if (!changeInfo.title) return;
  if (!tab.url || !YOUTUBE_WATCH_URLS.some((pattern) => tab.url.includes("watch") || tab.url.includes("shorts"))) {
    return;
  }

  const newQuery = cleanVideoTitle(changeInfo.title);
  if (newQuery && newQuery !== lastAutoSyncQuery) {
    openFromYouTubeTab(tab, "Tự động chuyển bài");
  }
});

async function init() {
  await ensureFrameRules();

  const saved = await chrome.storage.local.get({
    source: "hac",
    query: "",
    url: "",
    lastYtQuery: "",
    videoSongMap: {},
    scrollSpeed: 1,
    isSplit50: true,
    autoSync: false,
    history: [],
  });

  state.source = "hac";
  state.query = saved.query || "";
  state.url = isValidHopAmChuanUrl(saved.url) ? saved.url : "";
  lastAutoSyncQuery = saved.lastYtQuery || "";
  videoSongMap =
    saved.videoSongMap && typeof saved.videoSongMap === "object" && !Array.isArray(saved.videoSongMap)
      ? saved.videoSongMap
      : {};
  state.scrollSpeed = Number(saved.scrollSpeed) || 1;
  state.isSplit50 = saved.isSplit50 !== undefined ? Boolean(saved.isSplit50) : true;
  state.autoSync = Boolean(saved.autoSync);
  state.history = Array.isArray(saved.history) ? saved.history : [];

  input.value = state.query;
  renderSource();
  renderControls();
  renderHistory();

  const activeYtTab = await getActiveYouTubeTab();
  const activeYtQuery = activeYtTab?.title ? cleanVideoTitle(activeYtTab.title) : "";
  if (activeYtQuery) {
    activeYoutubeVideoId = getYouTubeVideoId(activeYtTab.url);
    if (activeYtQuery !== lastAutoSyncQuery || (!state.query && !state.url)) {
      await openFromYouTubeTab(activeYtTab, "Đã nhận diện");
      return;
    }
  }

  if (!state.query && !state.url) {
    const ytTab = await getYouTubeTab();
    if (ytTab && (await openFromYouTubeTab(ytTab, "Đã nhận diện"))) {
      return;
    }
  }

  navigate();
}

init();

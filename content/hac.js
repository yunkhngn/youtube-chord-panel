// Content script injected into HopAmChuan iframe in side panel
(() => {
  // Chỉ thực thi nếu đang nằm trong iframe (side panel)
  if (window.self === window.top) return;

  function getCleanUrl() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("s");
      return url.toString();
    } catch {
      return window.location.href;
    }
  }

  function extractSongTitle() {
    const titleEl = document.querySelector("#song-title > span") || document.querySelector("#song-title");
    const songTitle = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
    const singerEls = [...document.querySelectorAll("#song-author .perform-singer-list .author-item")];
    const singers = [...new Set(singerEls.map((el) => el.textContent.replace(/\s+/g, " ").trim()).filter(Boolean))];

    if (songTitle && singers.length > 0) {
      return `${songTitle} - ${singers.join(", ")}`;
    }
    if (songTitle) {
      return songTitle;
    }

    return document.title
      .replace(/^Hợp âm\s+/i, "")
      .replace(/\s*-\s*Hợp Âm Chuẩn$/i, "")
      .trim();
  }

  function notifyParentPageLoaded() {
    if (window.parent !== window.top) return;
    const isSong = /^\/song\/\d+(\/|$)/.test(window.location.pathname);
    window.parent.postMessage(
      {
        type: "CHORD_PAGE_LOADED",
        url: getCleanUrl(),
        title: isSong ? extractSongTitle() : "",
        isSong,
      },
      "*"
    );
  }

  function disableNativeColumnSplitOnLoad() {
    const toggle = document.getElementById("tool-box-column-toggle");
    if (!toggle) return;

    let done = false;
    let observer = null;
    let stopTimer = null;

    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (stopTimer) {
        clearTimeout(stopTimer);
        stopTimer = null;
      }
    };

    const uncheckIfOn = () => {
      if (done) return true;
      if (toggle.classList.contains("on")) {
        done = true;
        cleanup();
        toggle.click();
        return true;
      }
      return false;
    };

    if (uncheckIfOn()) return;

    observer = new MutationObserver(() => {
      uncheckIfOn();
    });
    observer.observe(toggle, { attributes: true, attributeFilter: ["class"] });

    requestAnimationFrame(() => uncheckIfOn());
    stopTimer = setTimeout(cleanup, 3000);
  }

  function init() {
    if (!document.body) return;
    document.body.classList.add("chord-panel-embedded");
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    // Mặc định tự động bật chế độ 50 | 50 nếu khung rộng từ 480px trở lên
    const isWideEnough = window.innerWidth >= 480;
    setSplit50(isWideEnough);

    // Xóa bớt khoảng trống thừa ở đầu trang để hợp âm hiện ngay lập tức
    const topOffset = document.querySelector("#song-detail, .song-detail, .song-content");
    if (topOffset && window.scrollY < 20) {
      topOffset.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    disableNativeColumnSplitOnLoad();
    notifyParentPageLoaded();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      notifyParentPageLoaded();
    }
  });

  // Quản lý trạng thái Chia cột 50 | 50
  function setSplit50(enable) {
    if (!document.body) return;
    if (enable) {
      document.body.classList.add("split-50-enabled");
    } else {
      document.body.classList.remove("split-50-enabled");
    }
  }

  // Smooth auto-scroll controller
  const BASE_SCROLL_PX_PER_SEC = 12;
  let scrollActive = false;
  let scrollSpeed = 1; // 1x = 12px/sec
  let lastTimestamp = 0;
  let scrollAccumulator = 0;

  function scrollLoop(timestamp) {
    if (!scrollActive) return;
    if (lastTimestamp) {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      scrollAccumulator += dt * (scrollSpeed * BASE_SCROLL_PX_PER_SEC);
      if (scrollAccumulator >= 1) {
        const step = Math.floor(scrollAccumulator);
        window.scrollBy({ top: step, behavior: "auto" });
        scrollAccumulator -= step;
      }
    }
    lastTimestamp = timestamp;
    requestAnimationFrame(scrollLoop);
  }

  function startScroll(speed) {
    scrollSpeed = Math.max(0.2, speed || 1);
    if (!scrollActive) {
      scrollActive = true;
      lastTimestamp = 0;
      scrollAccumulator = 0;
      requestAnimationFrame(scrollLoop);
    }
  }

  function stopScroll() {
    scrollActive = false;
    lastTimestamp = 0;
  }

  // Lắng nghe lệnh từ panel.js gửi qua window.postMessage
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    switch (data.type) {
      case "CHORD_SET_SPLIT_50":
        setSplit50(Boolean(data.enabled));
        break;
      case "CHORD_START_SCROLL":
        startScroll(Number(data.speed) || 1);
        break;
      case "CHORD_STOP_SCROLL":
        stopScroll();
        break;
      case "CHORD_SCROLL_TO_TOP":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
    }
  });
})();

// Content script injected into HopAmChuan iframe in side panel
(() => {
  // Chỉ thực thi nếu đang nằm trong iframe (side panel)
  if (window.self === window.top) return;

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Quản lý trạng thái Chia cột 50 | 50
  function setSplit50(enable) {
    if (!document.body) return;
    if (enable) {
      document.body.classList.add("split-50-enabled");
    } else {
      document.body.classList.remove("split-50-enabled");
    }
  }

  // Quản lý Cuộn tự động (Auto-scroll mượt mà)
  let scrollActive = false;
  let scrollSpeed = 1; // 1 = 30px/sec
  let lastTimestamp = 0;
  let scrollAccumulator = 0;

  function scrollLoop(timestamp) {
    if (!scrollActive) return;
    if (lastTimestamp) {
      const dt = (timestamp - lastTimestamp) / 1000;
      // 30px/giây ở tốc độ 1x
      scrollAccumulator += dt * (scrollSpeed * 32);
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

# Chord Side Panel - Hợp âm bên cạnh YouTube

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Chrome-116%2B-brightgreen.svg)](https://www.google.com/chrome/)

Tiện ích mở rộng Google Chrome tận dụng tính năng Chrome Side Panel để hiển thị bảng hợp âm từ Hợp Âm Chuẩn ngay bên cạnh video YouTube / YouTube Music. Bạn không cần phải chia đôi cửa sổ trình duyệt thủ công hay nhìn vào điện thoại khi đang tập đàn.

---

## Tính năng nổi bật

* **Tự động nhận diện bài hát thông minh:**
  * Lấy tên bài hát từ tab YouTube đang xem chỉ với 1 click.
  * Tự động làm sạch tiêu đề: giải mã HTML entities (`&quot;`), xóa dấu nháy kép, bỏ nội dung trong ngoặc `(Official MV)`, `[Lyrics]`, cắt bỏ phần nghệ sĩ phụ `ft.` để tìm chính xác bài hát gốc.
  * Giữ nguyên dấu gạch ngang phân tách chuẩn "Ca sĩ - Tên bài" (ví dụ: `Tùng - Chuồn Chuồn`).
* **Bố cục Chia cột 50 | 50 (Clean 2-Column Reader):**
  * Tối ưu hiển thị cho Side Panel hẹp: triệt tiêu hoàn toàn lỗi tràn mép ngang (overflow) hoặc mất chữ đầu câu.
  * Tự động chia hợp âm thành 2 cột song song đều đặn, vừa vặn khung nhìn.
* **Cuộn tự động (Auto-Scroll) rảnh tay:**
  * Tự động cuộn trang mượt mà với 4 mức tốc độ (`0.5x`, `1x`, `1.5x`, `2x`).
  * Người chơi guitar, ukulele, piano rảnh cả hai tay để bấm phím và gảy đàn mà không cần với tay chạm chuột.
* **Tự động đồng bộ bài mới (Auto-Sync):**
  * Tự động nhận diện và cập nhật hợp âm khi YouTube chuyển sang video tiếp theo trong playlist.
* **Chế độ đọc sạch sẽ (Ad-free & Clutter-free):**
  * Ẩn thanh menu, banner, quảng cáo chiếm diện tích của trang gốc để dành 100% không gian cho hợp âm.
* **Lịch sử bài đã xem:** Lưu lại 20 bài gần nhất để mở lại tức thì.
* **Phím tắt tiện lợi:** Nhấn `Alt + C` (hoặc `Option + C` trên macOS) để mở hoặc đóng nhanh Side Panel.

---

## Hướng dẫn cài đặt

### Cách 1: Cài đặt từ thư mục mã nguồn (Developer Mode)
1. Clone hoặc tải mã nguồn dự án về máy:
   ```bash
   git clone https://github.com/yunkhngn/youtube-chord-panel.git
   ```
2. Mở trình duyệt Chrome và truy cập: `chrome://extensions/`
3. Bật công tắc **Developer mode** (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
4. Nhấn nút **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục dự án vừa tải về.
5. Ghim biểu tượng tiện ích lên thanh công cụ của Chrome.

### Cách 2: Cài đặt từ Chrome Web Store
*(Đang cập nhật link sau khi Google hoàn tất xét duyệt)*

---

## Hướng dẫn phát triển (Development)

Dự án sử dụng JavaScript thuần (Vanilla JS), không yêu cầu build tools phức tạp hay thư viện ngoài.

```bash
# Đóng gói tiện ích ra file zip để tải lên Store
npm run build

# Tạo lại bộ Icon từ vector generator nếu có cập nhật thiết kế
npm run generate-icons
```

---

## Cấu trúc thư mục

```text
├── manifest.json         # Cấu hình Manifest V3 của Extension
├── background.js         # Service worker & quy tắc declarativeNetRequest
├── panel.html            # Giao diện chính của Side Panel
├── panel.css             # Định dạng giao diện (Light/Dark mode)
├── panel.js              # Logic điều khiển, nhận diện YouTube & Auto-scroll
├── content/              # Content scripts inject vào iframe
│   ├── hac.css           # CSS tối ưu hiển thị, chia 2 cột & ẩn quảng cáo HAC
│   └── hac.js            # JS điều khiển cuộn mượt và kích thước 50|50
├── icons/                # Bộ icon 16x16, 32x32, 48x48, 128x128
├── docs/                 # Landing Page & Privacy Policy cho GitHub Pages
├── scripts/              # Scripts tạo icon và đóng gói release
├── STORE_LISTING.md      # Bản soạn thảo nộp Chrome Web Store & giải trình quyền
├── PRIVACY_POLICY.md     # Chính sách quyền riêng tư
└── CHANGELOG.md          # Nhật ký thay đổi phiên bản
```

---

## Tác giả & Đóng góp (Author & Credits)

Phát triển bởi **@yunkhngn**

- GitHub: [https://github.com/yunkhngn](https://github.com/yunkhngn)
- Facebook: [https://www.facebook.com/yun.khngn/](https://www.facebook.com/yun.khngn/)
- Buy Me a Coffee: [https://buymeacoffee.com/yunkhngn](https://buymeacoffee.com/yunkhngn)

---

## Chính sách Quyền riêng tư (Privacy)

Tiện ích hoạt động 100% tại máy của bạn (Client-side), không thu thập, không theo dõi và không lưu trữ bất kỳ dữ liệu cá nhân hay lịch sử duyệt web nào. Chi tiết xem tại [docs/privacy.html](docs/privacy.html).

---

## Giấy phép (License)

Phát hành dưới giấy phép [MIT License](LICENSE).

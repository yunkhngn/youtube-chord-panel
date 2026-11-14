# Nhật ký thay đổi (Changelog)

Tài liệu này lưu trữ lịch sử cập nhật của Chord Side Panel. Bạn có thể sao chép trực tiếp các đoạn nội dung bên dưới để dán vào ô "Mô tả phiên bản / What's new in this version" trên Chrome Web Store hoặc mục ghi chú phát hành (Release Notes) trên GitHub.

---

## Phiên bản 0.2.0 (Bản phát hành chính thức - Khuyên dùng copy lên Store)

### Đoạn ngắn gọn (Dán nhanh vào Chrome Web Store):
```text
Phiên bản 0.2.0 - Trải nghiệm hoàn toàn mới:
- Tự động nhận diện bài hát: Lọc sạch từ khóa thừa (MV, Lyrics, ft. ca sĩ, dấu nháy kép, &quot;) để tìm chính xác bài hát trên Hợp Âm Chuẩn. Giữ nguyên dấu gạch ngang phân tách chuẩn "Ca sĩ - Tên bài".
- Bố cục Chia cột 50 | 50: Triệt tiêu hoàn toàn lỗi tràn mép ngang, tự động chia 2 cột đều đặn, không bị lẹm chữ.
- Cuộn tự động (Auto-Scroll): Rảnh tay đánh đàn với 4 mức tốc độ (0.5x, 1x, 1.5x, 2x).
- Tự động đồng bộ: Tự nhận diện và cập nhật hợp âm khi video YouTube chuyển bài trong playlist.
- Giao diện sạch sẽ: Tự động ẩn banner, quảng cáo chiếm diện tích của trang gốc.
- Thêm lịch sử bài hát và phím tắt Alt + C mở nhanh.
- Tác giả: @yunkhngn (https://github.com/yunkhngn).
```

---

### Chi tiết thay đổi đầy đủ (Dành cho GitHub Release Notes):

#### Tính năng mới (Features)
* **Auto-Scroll (Cuộn trang tự động):**
  * Tích hợp thanh điều khiển cuộn trang mượt mà ngay trên toolbar của Side Panel.
  * Tùy chọn 4 mức tốc độ linh hoạt: 0.5x (chậm), 1x (vừa), 1.5x (nhanh), 2x (rất nhanh).
* **Bố cục 50 | 50 (2-Column Clean Reader):**
  * Khắc phục triệt để lỗi tràn mép ngang (horizontal overflow) và lỗi mất chữ đầu dòng do lề âm của Bootstrap.
  * Hợp âm được chia 2 cột song song đều đặn, tối ưu cho kích thước Side Panel hẹp.
* **Auto-Sync Playlist:**
  * Bổ sung nút gạt tự động bắt bài mới khi video YouTube chuyển bài tiếp theo trong danh sách phát.
* **Lịch sử bài hát (Recent History):**
  * Lưu trữ 20 bài gần nhất vào chrome.storage.local, mở lại tức thì không cần gõ lại.
* **Thông tin tác giả & Ủng hộ:**
  * Tích hợp nút thông tin tác giả @yunkhngn kèm liên kết GitHub, Facebook và Buy Me a Coffee ngay trong tiện ích.
* **Phím tắt:**
  * Hỗ trợ phím tắt Alt + C (hoặc Option + C trên macOS) để mở hoặc đóng Side Panel nhanh.
* **Landing Page & Privacy Policy:**
  * Bổ sung thư mục /docs phục vụ triển khai GitHub Pages và cung cấp link chính sách bảo mật cho việc xét duyệt Store.

#### Sửa lỗi & Tối ưu hóa (Fixes & Improvements)
* **Làm sạch tiêu đề YouTube thông minh:**
  * Giải mã toàn bộ HTML entities (&quot;, &#39;, &amp;).
  * Loại bỏ các dấu nháy kép, nháy đơn trang trí quanh tên bài.
  * Cắt bỏ phần nghệ sĩ phụ ft. / feat. để tìm đúng bài hát gốc trên Hợp Âm Chuẩn.
  * Giữ nguyên dấu gạch ngang phân tách chuẩn Ca sĩ - Tên bài (ví dụ Tùng - Chuồn Chuồn).
* **Làm sạch giao diện iframe:**
  * Inject content script ẩn toàn bộ header, footer, quảng cáo và banner rác của Hợp Âm Chuẩn, tăng tối đa diện tích đọc hợp âm.
* **Tinh gọn quyền hạn:**
  * Tạm thời lược bỏ Ultimate Guitar để giảm phạm vi xin quyền, giúp Google duyệt nhanh hơn.

---

## Phiên bản 0.1.0 (MVP)
* Phiên bản thử nghiệm đầu tiên.
* Hỗ trợ gỡ X-Frame-Options/CSP bằng declarativeNetRequest để nhúng Hợp Âm Chuẩn trong iframe Side Panel.
* Tìm kiếm bài hát cơ bản từ tab YouTube đang mở.

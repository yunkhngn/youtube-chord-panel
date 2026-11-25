# Nhật ký thay đổi (Changelog)

Tài liệu này lưu trữ lịch sử cập nhật của Chord Side Panel. Bạn có thể sao chép trực tiếp các đoạn nội dung bên dưới để dán vào ô "Mô tả phiên bản / What's new in this version" trên Chrome Web Store hoặc mục ghi chú phát hành (Release Notes) trên GitHub.

---

## Phiên bản 0.3.0 (Bản phát hành mới - Khuyên dùng copy lên Store)

### Đoạn ngắn gọn (Dán nhanh vào Chrome Web Store):
```text
Phiên bản 0.3.0 - Mở thẳng bài hát & tinh chỉnh giao diện:
- Tự mở thẳng bài hát: Khi bật Side Panel trên video YouTube, bấm nút YouTube hoặc bấm vào mục Lịch sử, tiện ích tự tìm và nhảy thẳng vào trang hợp âm (hỗ trợ cả truy vấn dạng Ca sĩ - Bài hát).
- Ghi nhớ bài theo video YouTube: Nếu bạn chọn lại bản hợp âm khác trên trang tìm kiếm, tiện ích tự cập nhật ghi nhớ cho lần mở sau.
- Tối ưu đọc hợp âm trên Hợp Âm Chuẩn: Tự động bỏ tick mục "Chia cột" ngang mặc định khi mới mở bài để tránh xung đột với cuộn dọc và bố cục 50 | 50.
- Tối ưu tốc độ cuộn: Điều chỉnh tốc độ cuộn gốc xuống 12 px/giây (mức 1x) giúp rảnh tay đệm đàn vừa nhịp hơn.
- Làm mới giao diện & bộ icon: Chuyển toàn bộ icon sang dạng filled đồng bộ, căn chỉnh spacing lưới 4px và làm mới bộ icon cùng ảnh Chrome Web Store.
```

---

### Chi tiết thay đổi đầy đủ (Dành cho GitHub Release Notes):

#### Tính năng mới (Features)
* **Nhảy thẳng vào bài hát (Direct Song Jump):**
  * Tự động phân giải kết quả bài hát đầu tiên trên Hợp Âm Chuẩn (thử đảo cụm `Bài hát Ca sĩ` / `Ca sĩ Bài hát`) để nhảy thẳng vào trang `/song/...` khi mở panel trên video YouTube, bấm nút YouTube, Auto-Sync hoặc bấm vào Lịch sử.
  * Nâng cấp cả các mục lịch sử cũ chưa có URL trực tiếp và tự gắn nhãn `Bài hát` / `Mở bài`.
  * Ghi nhớ ánh xạ `videoId -> URL bài hát` vào `chrome.storage.local`; khi người dùng tìm tay lại và chọn một bài khác, mapping tự động được cập nhật theo lựa chọn mới.
* **Tự động tắt "Chia cột" ngang mặc định trên Hợp Âm Chuẩn:**
  * Content script tự bỏ tick `#tool-box-column-toggle` khi trang bài hát khởi tạo để giữ cuộn dọc mượt mà và tương thích với bố cục 50 | 50 của panel.

#### Sửa lỗi & Cải thiện (Fixes & Improvements)
* **Hiệu chỉnh tốc độ Auto-Scroll:** Giảm tốc độ cơ sở từ 32 px/s xuống 12 px/s ở mức `1x` (các mức `0.5x / 1x / 1.5x / 2x` tương ứng `6 / 12 / 18 / 24` px/s) và giới hạn `dt` tối đa 0.1s để tránh nhảy dòng khi chuyển focus.
* **Làm mới UI & bộ Icon:** Chuyển icon giao diện sang SVG filled, chuẩn hóa spacing trên lưới 4px, cân lại bảng màu sáng/tối, làm mới bộ icon (khử răng cưa `4x4`, sửa hướng nút Play quay phải) và cập nhật lại toàn bộ ảnh `store-assets` cho Chrome Web Store.
* **Đảm bảo rule `declarativeNetRequest`:** Bổ sung `ENSURE_FRAME_RULES` trong `background.js` để rule gỡ `X-Frame-Options` / `CSP` luôn sẵn sàng trước khi iframe điều hướng.

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

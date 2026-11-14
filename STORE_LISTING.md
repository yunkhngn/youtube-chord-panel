# Chrome Web Store Listing & Submission Guide

Tài liệu này chứa toàn bộ nội dung cần điền khi đưa **Chord Side Panel** lên **Chrome Web Store Developer Dashboard**.

---

## 1. Thông tin cơ bản (Basic Information)

### Tên Extension (Extension Name)
```text
Chord Side Panel - Hợp âm bên cạnh YouTube
```
*(Hoặc tên tiếng Anh: `Chord Side Panel for YouTube`)*

### Mô tả ngắn (Summary / Short Description - Tối đa 132 ký tự)
```text
Mở Hợp Âm Chuẩn & Ultimate Guitar trong side panel cạnh video YouTube, tự động bắt tên bài, cuộn tự động và chia 2 cột.
```

---

## 2. Mô tả chi tiết (Detailed Description)

```text
🎸 Chord Side Panel – Giải pháp xem hợp âm hoàn hảo nhất khi xem YouTube trên Chrome!

Bạn vừa xem backing track, MV hay video hướng dẫn guitar trên YouTube vừa muốn nhìn hợp âm bên cạnh mà không phải chia đôi cửa sổ thủ công hay cầm điện thoại? Chord Side Panel sẽ tận dụng tính năng Chrome Side Panel để hiển thị bảng hợp âm ngay bên hông video YouTube của bạn!

✨ CÁC TÍNH NĂNG NỔI BẬT:

1. ⚡ Tự động nhận diện bài hát thông minh:
- Tự động lấy tên bài hát từ tab YouTube / YouTube Music đang phát chỉ với 1 click.
- Tự động lọc sạch các từ khóa thừa như (Official MV), (Lyrics), (Audio), dấu ngoặc kép, nghệ sĩ ft.,... để tìm ra bản hợp âm chính xác nhất.
- Chế độ "Auto Sync": Tự động cập nhật hợp âm mới khi bạn chuyển bài trong playlist YouTube!

2. 📜 Tự động cuộn trang (Auto-Scroll) rảnh tay đánh đàn:
- Bật/tắt cuộn mượt mà với nhiều mức tốc độ (0.5x, 1x, 1.5x, 2x).
- Bạn hoàn toàn rảnh cả hai tay để bấm phím và gảy đàn mà không cần với tay chạm chuột.

3. ☷ Bố cục Chia cột 50 | 50 (Clean 2-Column View):
- Tối ưu hóa giao diện cho khung Side Panel hẹp: triệt tiêu hoàn toàn tình trạng tràn ngang (horizontal overflow) hoặc lẹm mất chữ đầu dòng.
- Tự động chia hợp âm thành 2 cột song song đều đặn, nhìn được toàn bộ bài hát mà không bị che khuất.

4. 🧹 Giao diện sạch sẽ (Ad-free & Clutter-free Reader Mode):
- Tự động ẩn bớt các thanh menu cồng kềnh, banner quảng cáo, thông báo rác của trang hợp âm để dành tối đa diện tích cho phần lời và thế bấm.

5. 🎶 Hỗ trợ cả 2 nguồn hợp âm lớn nhất:
- Hợp Âm Chuẩn (Thư viện hợp âm bài hát Việt Nam lớn nhất).
- Ultimate Guitar (Kho hợp âm & tabs quốc tế lớn nhất thế giới).

6. 🕒 Lịch sử bài đã xem:
- Lưu lại các bài đã tìm gần nhất để bạn mở lại tức thì bất cứ lúc nào.

7. ⌨️ Phím tắt tiện lợi:
- Nhấn Alt + C (hoặc Option + C trên macOS) để mở hoặc đóng nhanh Side Panel.

🔒 BẢO MẬT & QUYỀN RIÊNG TƯ:
- Tiện ích hoạt động 100% tại máy của bạn (Client-side).
- Không thu thập, không theo dõi và không lưu trữ bất kỳ dữ liệu cá nhân nào của người dùng.
- Mã nguồn mở và hoàn toàn miễn phí.
```

---

## 3. Bản giải trình quyền cho Google Reviewers (Permissions Justification)

Khi nộp extension lên Chrome Web Store, tại mục **Privacy > Justification for permissions**, bạn hãy sao chép các đoạn văn bản tiếng Anh chuẩn dưới đây dán vào từng ô tương ứng:

### 1. `sidePanel`
> **Justification:**  
> The `sidePanel` permission is required to display the chord viewer UI directly alongside the user's active browser tabs and YouTube videos, providing a seamless side-by-side practicing experience without forcing the user to switch windows or tabs.

### 2. `declarativeNetRequest`
> **Justification:**  
> The `declarativeNetRequest` permission is used strictly to remove framing restrictions (`x-frame-options` and `content-security-policy`) on HTTP response headers exclusively for sub_frame requests originating from this extension to the supported chord providers (`hopamchuan.com` and `ultimate-guitar.com`). This allows embedding chord sheets within the extension's side panel iframe while strictly scoping the rule to prevent any interference with normal top-level web browsing.

### 3. `storage`
> **Justification:**  
> The `storage` permission is used exclusively with `chrome.storage.local` to persist the user's preferences (selected chord provider, auto-scroll speed preference, 50|50 split column layout preference, and the local list of recently searched song titles). No data is transmitted externally.

### 4. `host_permissions`
> **Justification:**  
> - `https://*.youtube.com/*` & `https://music.youtube.com/*`: Used solely to query the current active video title from the user's open YouTube tab to automatically identify the song name for chord lookup without requiring full browser-wide `<all_urls>` permission.  
> - `https://*.hopamchuan.com/*` & `https://*.ultimate-guitar.com/*`: Used to load and cleanly format chord sheets within the side panel iframe and inject lightweight reader mode styles.

---

## 4. Privacy Practices Tab (Khai báo dữ liệu người dùng)

- **Single Purpose Description:**  
  *Displaying musical chords and guitar tabs in the Chrome Side Panel alongside YouTube videos.*
- **Host permissions justification:**  
  *See section 3 above.*
- **Data Usage:**
  - Chọn **"I do not collect or use any user data"**.
  - Tích chọn tất cả các cam kết:
    - [x] Does not sell user data to third parties.
    - [x] Does not use or transfer user data for purposes unrelated to the item's core functionality.
    - [x] Does not use or transfer user data to determine creditworthiness or for lending purposes.

---

## 5. Quy trình nộp lên Chrome Web Store (Checklist)

1. **Chuẩn bị tài khoản:**
   - Truy cập: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Nếu chưa có tài khoản developer, thanh toán phí đăng ký 1 lần là **$5 USD** qua Google Pay.
2. **Upload Package:**
   - Nhấn **New Item** (Mục mới).
   - Kéo thả file `chord-side-panel-v0.2.0.zip` đã được đóng gói sẵn.
3. **Điền thông tin Listing:**
   - Copy tiêu đề, mô tả ngắn, mô tả chi tiết từ mục 1 và 2 ở trên.
   - Thêm ít nhất 1 ảnh chụp màn hình (1280x800 hoặc 640x400) chụp màn hình YouTube bên trái và Side panel bên phải.
   - Chọn Category: **Fun** (hoặc **Productivity / Tools**).
4. **Điền Privacy:**
   - Dán URL Privacy Policy (ví dụ đưa file `PRIVACY_POLICY.md` lên GitHub Pages hoặc gist công khai).
   - Dán các đoạn giải trình ở mục 3 vào các ô quyền tương ứng.
5. **Nhấn "Submit for Review":**
   - Thông thường Google sẽ duyệt trong vòng 24 - 48 giờ.

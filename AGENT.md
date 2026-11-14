# Hướng dẫn Phát triển Dự án dành cho AI Agent (AGENT.md)

Tài liệu này là bộ quy chuẩn và chỉ dẫn hành động bắt buộc dành cho bất kỳ AI Agent nào tham gia phát triển, bảo trì hoặc phát hành phiên bản mới cho dự án Chord Side Panel.

---

## 1. Triết lý kiến trúc dự án

* **Nền tảng:** Google Chrome Extension Manifest V3.
* **Công nghệ:** JavaScript thuần (Vanilla JS), CSS thuần, không dùng bundler (Webpack/Vite/Rollup) hay framework nặng nề nhằm đảm bảo tốc độ khởi động tức thì trong Chrome Side Panel.
* **Nguyên tắc quyền hạn tối thiểu (Least Privilege):** 
  * Chỉ sử dụng quyền thật sự cần thiết (sidePanel, declarativeNetRequest, storage).
  * host_permissions chỉ giới hạn cho hopamchuan.com và youtube.com.
  * Tuyệt đối không thêm <all_urls> hoặc xin quyền tabs rộng nếu không có yêu cầu đặc biệt.

---

## 2. Quy tắc bắt buộc (Golden Rules)

### QUY TẮC 1: XIN PHÉP USER TRƯỚC KHI TẠO GITHUB RELEASE BẰNG CLI
> **NGHIÊM CẤM:** AI Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý** chạy lệnh `gh release create` khi chưa có sự xác nhận / đồng ý rõ ràng từ User.
>
> **Quy trình chuẩn:**
> 1. Khi hoàn thành các thay đổi, Agent phải tóm tắt các tính năng/sửa lỗi đã làm.
> 2. Đưa ra số phiên bản dự kiến (ví dụ: v0.2.0).
> 3. Hỏi User: "Tôi đã chuẩn bị xong phiên bản v0.2.0 và file zip. Bạn có đồng ý chốt phiên bản này để tôi tạo GitHub Release qua CLI không?"
> 4. **CHỈ KHI** User phản hồi đồng ý (ví dụ: "Ok", "Tạo đi", "Chốt đi"), Agent mới được thực thi lệnh `gh release create`.

### QUY TẮC 2: LUÔN BUILD RA FILE ZIP SAU KHI CẬP NHẬT PHIÊN BẢN
* Mỗi khi có thay đổi liên quan đến phiên bản mới (bump version), Agent **bắt buộc** phải chạy lệnh build gói zip:
  ```bash
  npm run build
  # hoặc
  node scripts/package.js
  ```
* File zip được sinh ra sẽ có tên theo định dạng: chord-side-panel-v{version}.zip (ví dụ: chord-side-panel-v0.2.0.zip).
* **Kiểm tra độ sạch của file zip:** Đảm bảo file zip chỉ chứa các file chạy extension (manifest.json, background.js, panel.html, panel.css, panel.js, content/, icons/). Tuyệt đối **không được chứa** .git, .DS_Store, thư mục /docs, /scripts, file markdown *.md.

### QUY TẮC 3: CẬP NHẬT CHANGELOG.MD
* Mọi phiên bản mới đều phải được ghi nhận vào file CHANGELOG.md.
* Cấu trúc trong CHANGELOG.md phải có:
  1. **Đoạn tóm tắt ngắn gọn:** Để User chỉ cần copy & paste ngay vào ô mô tả của Chrome Web Store.
  2. **Chi tiết thay đổi đầy đủ:** Bao gồm các mục Features (Tính năng mới) và Fixes (Sửa lỗi) để làm Release Notes trên GitHub.

### QUY TẮC 4: TUYỆT ĐỐI KHÔNG SỬ DỤNG EMOJI
* Trong toàn bộ mã nguồn, commit message, changelog, documentation và câu trả lời với người dùng: **KHÔNG ĐƯỢC SỬ DỤNG BẤT KỲ EMOJI NÀO**. Viết tiếng Việt có dấu đầy đủ, chuẩn ngữ pháp, nghiêm túc và chuyên nghiệp.

---

## 3. Quy trình từng bước khi cập nhật phiên bản mới (Release Workflow)

Khi User yêu cầu nâng cấp tính năng, sửa lỗi hoặc phát hành phiên bản mới, Agent hãy tuân thủ quy trình 7 bước sau:

### Bước 1: Triển khai Code & Kiểm tra
* Chỉnh sửa các file mã nguồn liên quan.
* Đảm bảo tính năng không làm phá vỡ logic cũ:
  * Không làm tràn lề ngang (overflow) trên giao diện Side Panel.
  * Giữ nguyên logic làm sạch tiêu đề cleanVideoTitle() (giữ dấu gạch " - " giữa ca sĩ và bài hát, giải mã entities, bỏ ft., bỏ nháy kép).

### Bước 2: Tăng số Version (Version Bump)
* Cập nhật "version" trong manifest.json (theo chuẩn SemVer: x.y.z).
* Đồng bộ "version" trong package.json.

### Bước 3: Cập nhật tài liệu
* Thêm thông tin phiên bản mới vào đầu file CHANGELOG.md.
* Nếu có thay đổi quyền hạn hoặc tính năng lớn, cập nhật STORE_LISTING.md và thư mục docs/.

### Bước 4: Đóng gói bản Release
* Chạy script build:
  ```bash
  npm run build
  ```
* Kiểm tra kích thước và danh sách file trong file zip vừa tạo:
  ```bash
  unzip -l chord-side-panel-v*.zip
  ```

### Bước 5: Commit Git
* Commit các thay đổi với message rõ ràng:
  ```bash
  git add .
  git commit -m "chore(release): bump version to vX.Y.Z"
  git push origin main
  ```

### Bước 6: Xin xác nhận từ User
* Báo cáo cho User các nội dung đã hoàn thành.
* Cung cấp đoạn changelog ngắn để User chuẩn bị cập nhật trên Chrome Web Store Developer Dashboard.
* **Hỏi xin phép xác nhận để tạo GitHub Release.**

### Bước 7: Tạo GitHub Release (Sau khi User đồng ý)
* Chạy lệnh CLI để tạo release và đính kèm file zip:
  ```bash
  gh release create vX.Y.Z chord-side-panel-vX.Y.Z.zip --title "vX.Y.Z" --notes "Release vX.Y.Z"
  ```

---

## 4. Các lệnh CLI thường dùng

| Tác vụ | Lệnh |
| :--- | :--- |
| Đóng gói tiện ích ra file ZIP | `npm run build` |
| Tạo lại bộ Icon từ vector generator | `npm run generate-icons` |
| Kiểm tra cú pháp JavaScript | `node -c panel.js` |
| Kiểm tra trạng thái Git | `git status` |
| Xem danh sách file trong ZIP | `unzip -l chord-side-panel-v*.zip` |
| Kiểm tra trạng thái đăng nhập GitHub CLI | `gh auth status` |
| Tạo GitHub Release (chỉ khi user duyệt) | `gh release create vX.Y.Z chord-side-panel-vX.Y.Z.zip --title "vX.Y.Z" --notes "..."` |

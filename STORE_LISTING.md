# Chrome Web Store Listing & Submission Guide

Tai lieu nay chua toan bo noi dung can dien khi dua Chord Side Panel len Chrome Web Store Developer Dashboard.

---

## 1. Thong tin co ban (Basic Information)

### Ten Extension (Extension Name)
```text
Chord Side Panel - Hop am ben canh YouTube
```

### Mo ta ngan (Summary / Short Description - Toi da 132 ky tu)
```text
Mo Hop Am Chuan trong side panel canh video YouTube, tu dong bat ten bai, cuon tu dong va chia 2 cot.
```

---

## 2. Mo ta chi tiet (Detailed Description)

```text
Chord Side Panel - Giai phap xem hop am toi uu khi xem YouTube tren Chrome.

Ban vua xem backing track, MV hay video huong dan guitar tren YouTube vua muon nhin hop am ben canh ma khong phai chia doi cua so thu cong hay cam dien thoai? Chord Side Panel se tan dung tinh nang Chrome Side Panel de hien thi bang hop am ngay ben hong video YouTube cua ban.

CAC TINH NANG NOI BAT:

1. Tu dong nhan dien bai hat thong minh:
- Tu dong lay ten bai hat tu tab YouTube / YouTube Music dang phat chi voi 1 click.
- Tu dong loc sach cac tu khoa thua nhu (Official MV), (Lyrics), (Audio), dau ngoac kep, nghe si ft.,... de tim ra ban hop am chinh xac nhat.
- Giu nguyen dau gach ngang phan tach chuan "Ca si - Ten bai" (vi du: Tung - Chuon Chuon).
- Che do "Auto Sync": Tu dong cap nhat hop am moi khi ban chuyen bai trong playlist YouTube.

2. Tu dong cuon trang (Auto-Scroll) ranh tay danh dan:
- Bat/tat cuon muot ma voi nhieu muc toc do (0.5x, 1x, 1.5x, 2x).
- Ban hoan toan ranh ca hai tay de bam phim va gay dan ma khong can voi tay cham chuot.

3. Bo cuc Chia cot 50 | 50 (Clean 2-Column View):
- Toi uu hoa giao dien cho khung Side Panel hep: triet tieu hoan toan tinh trang tran ngang (horizontal overflow) hoac lem mat chu dau dong.
- Tu dong chia hop am thanh 2 cot song song deu dan, nhin duoc toan bo bai hat ma khong bi che khuat.

4. Giao dien sach se (Ad-free & Clutter-free Reader Mode):
- Tu dong an bot cac thanh menu cong kenh, banner quang cao, thong bao rac cua trang hop am de danh toi da dien tich cho phan loi va the bam.

5. Toi uu rieng cho Hop Am Chuan:
- Tuong thich hoan hao voi Hop Am Chuan (thu vien hop am bai hat Viet lon nhat).
- Day du tone, dieu bai hat va the bam hop am chuan xac.

6. Lich su bai da xem:
- Luu lai cac bai da tim gan nhat de ban mo lai tuc thi bat cu luc nao.

7. Phim tat tien loi:
- Nhan Alt + C (hoac Option + C tren macOS) de mo hoac dong nhanh Side Panel.

BAO MAT & QUYEN RIENG TU:
- Tien ich hoat dong 100% tai may cua ban (Client-side).
- Khong thu thap, khong theo doi va khong luu tru bat ky du lieu ca nhan nao cua nguoi dung.
- Ma nguon mo va hoan toan mien phi.

TAC GIA & LIEN HE:
- Phat trien boi: @yunkhngn
- GitHub: https://github.com/yunkhngn
- Facebook: https://www.facebook.com/yun.khngn/
- Ung ho tac gia: https://buymeacoffee.com/yunkhngn
```

---

## 3. Ban giai trinh quyen cho Google Reviewers (Permissions Justification)

Khi nop extension len Chrome Web Store, tai muc Privacy > Justification for permissions, ban hay sao chep cac doan van ban tieng Anh chuan duoi day dan vao tung o tuong ung:

### 1. `sidePanel`
> **Justification:**  
> The `sidePanel` permission is required to display the chord viewer UI directly alongside the user's active browser tabs and YouTube videos, providing a seamless side-by-side practicing experience without forcing the user to switch windows or tabs.

### 2. `declarativeNetRequest`
> **Justification:**  
> The `declarativeNetRequest` permission is used strictly to remove framing restrictions (`x-frame-options` and `content-security-policy`) on HTTP response headers exclusively for sub_frame requests originating from this extension to `hopamchuan.com`. This allows embedding chord sheets within the extension's side panel iframe while strictly scoping the rule to prevent any interference with normal top-level web browsing.

### 3. `storage`
> **Justification:**  
> The `storage` permission is used exclusively with `chrome.storage.local` to persist the user's preferences (auto-scroll speed preference, 50|50 split column layout preference, and the local list of recently searched song titles). No data is transmitted externally.

### 4. `host_permissions`
> **Justification:**  
> - `https://*.youtube.com/*` & `https://music.youtube.com/*`: Used solely to query the current active video title from the user's open YouTube tab to automatically identify the song name for chord lookup without requiring full browser-wide `<all_urls>` permission.  
> - `https://*.hopamchuan.com/*`: Used to load and cleanly format chord sheets within the side panel iframe and inject lightweight reader mode styles.

---

## 4. Privacy Practices Tab (Khai bao du lieu nguoi dung)

- **Single Purpose Description:**  
  *Displaying musical chords in the Chrome Side Panel alongside YouTube videos.*
- **Host permissions justification:**  
  *See section 3 above.*
- **Data Usage:**
  - Chon "I do not collect or use any user data".
  - Tich chon tat ca cac cam ket:
    - [x] Does not sell user data to third parties.
    - [x] Does not use or transfer user data for purposes unrelated to the item's core functionality.
    - [x] Does not use or transfer user data to determine creditworthiness or for lending purposes.

---

## 5. Quy trinh nop len Chrome Web Store (Checklist)

1. **Chuan bi tai khoan:**
   - Truy cap: Chrome Web Store Developer Dashboard (https://chrome.google.com/webstore/devconsole)
   - Neu chua co tai khoan developer, thanh toan phi dang ky 1 lan la $5 USD qua Google Pay.
2. **Upload Package:**
   - Nhan New Item (Muc moi).
   - Keo tha file chord-side-panel-v0.2.0.zip da duoc dong goi san.
3. **Dien thong tin Listing:**
   - Copy tieu de, mo ta ngan, mo ta chi tiet tu muc 1 va 2 o tren.
   - Them it nhat 1 anh chup man hinh (1280x800 hoac 640x400) chup man hinh YouTube ben trai va Side panel ben phai.
   - Chon Category: Fun (hoac Productivity / Tools).
4. **Dien Privacy:**
   - Bat GitHub Pages cho repo: Vao Settings > Pages > Build and deployment > Branch: main /docs -> Bam Save.
   - URL Privacy Policy cua ban se la: https://yunkhngn.github.io/youtube-chord-panel/privacy.html (dien link nay vao o Privacy Policy).
   - Dan cac doan giai trinh o muc 3 vao cac o quyen tuong ung.
5. **Nhan "Submit for Review":**
   - Thong thuong Google se duyet trong vong 24 - 48 gio.

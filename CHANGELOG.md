# Nhat ky thay doi (Changelog)

Tai lieu nay luu tru lich su cap nhat cua Chord Side Panel. Ban co the sao chep truc tiep cac doan noi dung ben duoi de dan vao o "Mo ta phien ban / What's new in this version" tren Chrome Web Store hoac muc ghi chu phat hanh (Release Notes) tren GitHub.

---

## Phien ban 0.2.0 (Ban phat hanh chinh thuc - Khuyen dung copy len Store)

### Doan ngan gon (Dan nhanh vao Chrome Web Store):
```text
Phien ban 0.2.0 - Trai nghiem hoan toan moi:
- Tu dong nhan dien bai hat: Loc sach tu khoa thua (MV, Lyrics, ft. ca si, dau nhay kep, &quot;) de tim chinh xac bai hat tren Hop Am Chuan. Giu nguyen dau gach ngang phan tach chuan "Ca si - Ten bai".
- Bo cuc Chia cot 50 | 50: Triet tieu hoan toan loi tran mep ngang, tu dong chia 2 cot deu dan, khong bi lem chu.
- Cuon tu dong (Auto-Scroll): Ranh tay danh dan voi 4 muc toc do (0.5x, 1x, 1.5x, 2x).
- Tu dong dong bo: Tu nhan dien va cap nhat hop am khi video YouTube chuyen bai trong playlist.
- Giao dien sach se: Tu dong an banner, quang cao chiem dien tich cua trang goc.
- Them lich su bai hat va phim tat Alt + C mo nhanh.
```

---

### Chi tiet thay doi day du (Danh cho GitHub Release Notes):

#### Tinh nang moi (Features)
* **Auto-Scroll (Cuon trang tu dong):**
  * Tich hop thanh dieu khien cuon trang muot ma ngay tren toolbar cua Side Panel.
  * Tuy chon 4 muc toc do linh hoat: 0.5x (cham), 1x (vua), 1.5x (nhanh), 2x (rat nhanh).
* **Bo cuc 50 | 50 (2-Column Clean Reader):**
  * Khac phuc triet de loi tran mep ngang (horizontal overflow) va loi mat chu dau dong do le am cua Bootstrap.
  * Hop am duoc chia 2 cot song song deu dan, toi uu cho kich thuoc Side Panel hep.
* **Auto-Sync Playlist:**
  * Bo sung nut gat tu dong bat bai moi khi video YouTube chuyen bai tiep theo trong danh sach phat.
* **Lich su bai hat (Recent History):**
  * Luu tru 20 bai gan nhat vao chrome.storage.local, mo lai tuc thi khong can go lai.
* **Phim tat:**
  * Ho tro phim tat Alt + C (hoac Option + C tren macOS) de mo/dong Side Panel nhanh.
* **Landing Page & Privacy Policy:**
  * Bo sung thu muc /docs phuc vu trien khai GitHub Pages va cung cap link chinh sach bao mat cho viec xet duyet Store.

#### Sua loi & Toi uu hoa (Fixes & Improvements)
* **Lam sach tieu de YouTube thong minh:**
  * Giai ma toan bo HTML entities (&quot;, &#39;, &amp;).
  * Loai bo cac dau nhay kep, nhay don trang tri quanh ten bai.
  * Cat bo phan nghe si phu ft. / feat. de tim dung bai hat goc tren Hop Am Chuan.
  * Giu nguyen dau gach ngang phan tach chuan Ca si - Ten bai (vi du Tung - Chuon Chuon).
* **Lam sach giao dien iframe:**
  * Inject content script an toan bo header, footer, quang cao va banner rac cua Hop Am Chuan, tang toi da dien tich doc hop am.
* **Tinh gon quyen han:**
  * Tam thoi luoc bo Ultimate Guitar de giam pham vi xin quyen, giup Google duyet nhanh hon.

---

## Phien ban 0.1.0 (MVP)
* Phien ban thu nghiem dau tien.
* Ho tro go X-Frame-Options/CSP bang declarativeNetRequest de nhung Hop Am Chuan trong iframe Side Panel.
* Tim kiem bai hat co ban tu tab YouTube dang mo.

# Huong dan Phat trien Du an danh cho AI Agent (AGENT.md)

Tai lieu nay la bo quy chuan va chi dan hanh dong bat buoc danh cho bat ky AI Agent nao tham gia phat trien, bao tri hoac phat hanh phien ban moi cho du an Chord Side Panel.

---

## 1. Triet ly kien truc du an

* **Nen tang:** Google Chrome Extension Manifest V3.
* **Cong nghe:** JavaScript thuan (Vanilla JS), CSS thuan, khong dung bundler (Webpack/Vite/Rollup) hay framework nang ne nham dam bao toc do khoi dong tuc thi trong Chrome Side Panel.
* **Nguyen tac quyen han toi thieu (Least Privilege):** 
  * Chi su dung quyen that su can thiet (sidePanel, declarativeNetRequest, storage).
  * host_permissions chi gioi han cho hopamchuan.com va youtube.com.
  * Tuyet doi khong them <all_urls> hoac xin quyen tabs rong neu khong co yeu cau dac biet.

---

## 2. Quy tac bat buoc (Golden Rules)

### QUY TAC 1: XIN PHEP USER TRUOC KHI TAO GITHUB RELEASE BANG CLI
> **NGHIEM CAM:** AI Agent **TUYET DOI KHONG DUOC TU Y** chay lenh `gh release create` khi chua co su xac nhan / dong y ro rang tu User.
>
> **Quy trinh chuan:**
> 1. Khi hoan thanh cac thay doi, Agent phai tom tat cac tinh nang/sua loi da lam.
> 2. Dua ra so phien ban du kien (vi du: v0.2.0).
> 3. Hoi User: "Toi da chuan bi xong phien ban v0.2.0 va file zip. Ban co dong y chot phien ban nay de toi tao GitHub Release qua CLI khong?"
> 4. **CHI KHI** User phan hoi dong y (vi du: "Ok", "Tao di", "Chot di"), Agent moi duoc thuc thi lenh `gh release create`.

### QUY TAC 2: LUON BUILD RA FILE ZIP SAU KHI CAP NHAT PHIEN BAN
* Moi khi co thay doi lien quan den phien ban moi (bump version), Agent **bat buoc** phai chay lenh build goi zip:
  ```bash
  npm run build
  # hoac
  node scripts/package.js
  ```
* File zip duoc sinh ra se co ten theo dinh dang: chord-side-panel-v{version}.zip (vi du: chord-side-panel-v0.2.0.zip).
* **Kiem tra do sach cua file zip:** Dam bao file zip chi chua cac file chay extension (manifest.json, background.js, panel.html, panel.css, panel.js, content/, icons/). Tuyet doi **khong duoc chua** .git, .DS_Store, thu muc /docs, /scripts, file markdown *.md.

### QUY TAC 3: CAP NHAT CHANGELOG.MD
* Moi phien ban moi deu phai duoc ghi nhan vao file CHANGELOG.md.
* Cau truc trong CHANGELOG.md phai co:
  1. **Doan tom tat ngan gon:** De User chi can copy & paste ngay vao o mo ta cua Chrome Web Store.
  2. **Chi tiet thay doi day du:** Bao gom cac muc Features (Tinh nang moi) va Fixes (Sua loi) de lam Release Notes tren GitHub.

### QUY TAC 4: TUYET DOI KHONG SU DUNG EMOJI
* Trong toan bo ma nguon, commit message, changelog, documentation va cau tra loi voi nguoi dung: **KHONG DUOC SU DUNG BAT KY EMOJI NAO**.

---

## 3. Quy trinh tung buoc khi cap nhat phien ban moi (Release Workflow)

Khi User yeu cau nang cap tinh nang, sua loi hoac phat hanh phien ban moi, Agent hay tuan thu quy trinh 7 buoc sau:

### Buoc 1: Trien khai Code & Kiem tra
* Chinh sua cac file ma nguon lien quan.
* Dam bao tinh nang khong lam pha vo logic cu:
  * Khong lam tran le ngang (overflow) tren giao dien Side Panel.
  * Giu nguyen logic lam sach tieu de cleanVideoTitle() (giu dau gach " - " giua ca si va bai hat, giai ma entities, bo ft., bo nhay kep).

### Buoc 2: Tang so Version (Version Bump)
* Cap nhat "version" trong manifest.json (theo chuan SemVer: x.y.z).
* Dong bo "version" trong package.json.

### Buoc 3: Cap nhat tai lieu
* Them thong tin phien ban moi vao dau file CHANGELOG.md.
* Neu co thay doi quyen han hoac tinh nang lon, cap nhat STORE_LISTING.md va thu muc docs/.

### Buoc 4: Dong goi ban Release
* Chay script build:
  ```bash
  npm run build
  ```
* Kiem tra kich thuoc va danh sach file trong file zip vua tao:
  ```bash
  unzip -l chord-side-panel-v*.zip
  ```

### Buoc 5: Commit Git
* Commit cac thay doi voi message ro rang:
  ```bash
  git add .
  git commit -m "chore(release): bump version to vX.Y.Z"
  git push origin main
  ```

### Buoc 6: Xin xac nhan tu User
* Bao cao cho User cac noi dung da hoan thanh.
* Cung cap doan changelog ngan de User chuan bi cap nhat tren Chrome Web Store Developer Dashboard.
* **Hoi xin phep xac nhan de tao GitHub Release.**

### Buoc 7: Tao GitHub Release (Sau khi User dong y)
* Chay lenh CLI de tao release va dinh kem file zip:
  ```bash
  gh release create vX.Y.Z chord-side-panel-vX.Y.Z.zip --title "vX.Y.Z" --notes "Release vX.Y.Z"
  ```

---

## 4. Cac lenh CLI thuong dung

| Tac vu | Lenh |
| :--- | :--- |
| Dong goi tien ich ra file ZIP | `npm run build` |
| Tao lai bo Icon tu vector generator | `npm run generate-icons` |
| Kiem tra cu phap JavaScript | `node -c panel.js` |
| Kiem tra trang thai Git | `git status` |
| Xem danh sach file trong ZIP | `unzip -l chord-side-panel-v*.zip` |
| Kiem tra trang thai dang nhap GitHub CLI | `gh auth status` |
| Tao GitHub Release (chi khi user duyet) | `gh release create vX.Y.Z chord-side-panel-vX.Y.Z.zip --title "vX.Y.Z" --notes "..."` |

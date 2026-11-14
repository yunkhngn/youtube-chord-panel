import os
import sys
from PIL import Image, ImageDraw, ImageFont

# Thu muc xuat anh
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../store-assets"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Tim font chu he thong
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

if not os.path.exists(FONT_REGULAR):
    FONT_REGULAR = "/System/Library/Fonts/Helvetica.ttc"
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = FONT_REGULAR

def get_font(size, bold=False):
    path = FONT_BOLD if bold else FONT_REGULAR
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def save_dual(img, base_name):
    """Luu ca file PNG 24-bit (khong alpha) va JPEG vao store-assets"""
    rgb_img = img.convert("RGB")
    png_path = os.path.join(OUTPUT_DIR, f"{base_name}.png")
    jpg_path = os.path.join(OUTPUT_DIR, f"{base_name}.jpg")
    
    rgb_img.save(png_path, "PNG", optimize=True)
    rgb_img.save(jpg_path, "JPEG", quality=95)
    print(f"Da tao: {base_name}.png & {base_name}.jpg ({img.width}x{img.height})")

# ==============================================================================
# 1. BIEU TUONG CUA HANG (STORE ICON 128x128)
# ==============================================================================
def generate_store_icon():
    w, h = 128, 128
    img = Image.new("RGB", (w, h), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Gradient nen tu xanh duong den tim
    for y in range(h):
        t = y / h
        r = int(37 * (1 - t) + 124 * t)
        g = int(99 * (1 - t) + 58 * t)
        b = int(235 * (1 - t) + 237 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Khung trai: YouTube Player nho (slate 900)
    draw.rounded_rectangle([18, 28, 58, 100], radius=8, fill=(15, 23, 42))
    # Nut play do
    draw.polygon([(34, 56), (34, 72), (47, 64)], fill=(239, 68, 68))

    # Khung phai: Side panel hop am (trang sang)
    draw.rounded_rectangle([66, 28, 110, 100], radius=8, fill=(255, 255, 255))
    # Huy hieu hop am C
    draw.rounded_rectangle([72, 38, 92, 48], radius=3, fill=(37, 99, 235))
    # Cac dong hop am mo phong
    draw.line([(72, 58), (104, 58)], fill=(100, 116, 139), width=3)
    draw.line([(72, 70), (104, 70)], fill=(148, 163, 184), width=2)
    draw.line([(72, 82), (98, 82)], fill=(148, 163, 184), width=2)

    save_dual(img, "store-icon-128x128")

# ==============================================================================
# 2. ANH CHUP MAN HINH 1 (SCREENSHOT 1280x800) - YOUTUBE + CHORD SIDE PANEL 50|50
# ==============================================================================
def generate_screenshot_1():
    w, h = 1280, 800
    img = Image.new("RGB", (w, h), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # 1. Thanh Window Header cua Trinh duyet (Chieu cao: 52px)
    draw.rectangle([0, 0, w, 52], fill=(30, 41, 59))
    draw.line([(0, 52), (w, 52)], fill=(51, 65, 85), width=1)

    # 3 nut macOS (do, vang, xanh)
    draw.ellipse([16, 20, 28, 32], fill=(239, 68, 68))
    draw.ellipse([34, 20, 46, 32], fill=(245, 158, 11))
    draw.ellipse([52, 20, 64, 32], fill=(16, 185, 129))

    # Thanh dia chi URL (Omnibox)
    draw.rounded_rectangle([180, 12, 1080, 42], radius=6, fill=(15, 23, 42))
    font_url = get_font(13)
    draw.text((196, 18), "https://www.youtube.com/watch?v=2Vv-BfVoq4g", fill=(148, 163, 184), font=font_url)

    # Bieu tuong tien ich Side Panel dang bat
    draw.rounded_rectangle([1100, 12, 1250, 42], radius=6, fill=(37, 99, 235))
    font_badge = get_font(12, bold=True)
    draw.text((1115, 18), "Chord Side Panel", fill=(255, 255, 255), font=font_badge)

    # Chia man hinh 50 | 50 (Cot trai: x 0..640, Cot phai: x 640..1280)
    split_x = 640

    # --------------------------------------------------------------------------
    # COT TRAI: GIAO DIEN YOUTUBE (x: 0 .. 640, y: 53 .. 800)
    # --------------------------------------------------------------------------
    draw.rectangle([0, 53, split_x, h], fill=(15, 15, 15))

    # Video Player (16:9)
    vid_w = 580
    vid_h = 326
    vid_x = 30
    vid_y = 80
    draw.rounded_rectangle([vid_x, vid_y, vid_x + vid_w, vid_y + vid_h], radius=8, fill=(24, 24, 27))
    
    # Man hinh video mo phong
    draw.rectangle([vid_x + 2, vid_y + 2, vid_x + vid_w - 2, vid_y + vid_h - 2], fill=(30, 30, 36))
    # Nut Play giua video
    play_cx, play_cy = vid_x + vid_w // 2, vid_y + vid_h // 2
    draw.ellipse([play_cx - 32, play_cy - 32, play_cx + 32, play_cy + 32], fill=(239, 68, 68))
    draw.polygon([(play_cx - 8, play_cy - 14), (play_cx - 8, play_cy + 14), (play_cx + 12, play_cy)], fill=(255, 255, 255))

    # Thanh progress bar YouTube mau do
    draw.rectangle([vid_x, vid_y + vid_h - 6, vid_x + vid_w, vid_y + vid_h], fill=(80, 80, 80))
    draw.rectangle([vid_x, vid_y + vid_h - 6, vid_x + 260, vid_y + vid_h], fill=(239, 68, 68))

    # Tieu de video YouTube
    font_vtitle = get_font(18, bold=True)
    draw.text((vid_x, vid_y + vid_h + 20), "Ed Sheeran - Perfect (Official Music Video)", fill=(241, 245, 249), font=font_vtitle)

    # Thong tin kenh & luot xem
    font_channel = get_font(14)
    draw.ellipse([vid_x, vid_y + vid_h + 56, vid_x + 40, vid_y + vid_h + 96], fill=(59, 130, 246))
    draw.text((vid_x + 50, vid_y + vid_h + 58), "Ed Sheeran", fill=(255, 255, 255), font=get_font(15, bold=True))
    draw.text((vid_x + 50, vid_y + vid_h + 78), "3,7 tỷ lượt xem • 7 năm trước", fill=(148, 163, 184), font=font_channel)

    # Cac nut tuong tac (Thich, Chia se)
    draw.rounded_rectangle([vid_x + 380, vid_y + vid_h + 58, vid_x + 460, vid_y + vid_h + 94], radius=18, fill=(39, 39, 42))
    draw.text((vid_x + 400, vid_y + vid_h + 68), "Thích", fill=(244, 244, 245), font=get_font(13))
    draw.rounded_rectangle([vid_x + 470, vid_y + vid_h + 58, vid_x + 560, vid_y + vid_h + 94], radius=18, fill=(39, 39, 42))
    draw.text((vid_x + 488, vid_y + vid_h + 68), "Chia sẻ", fill=(244, 244, 245), font=get_font(13))

    # Phan mo ta video mo phong
    draw.rounded_rectangle([vid_x, vid_y + vid_h + 115, vid_x + vid_w, vid_y + vid_h + 220], radius=10, fill=(39, 39, 42))
    draw.text((vid_x + 16, vid_y + vid_h + 130), "Bài hát chính thức 'Perfect' của Ed Sheeran trong album 'Divide'...", fill=(212, 212, 216), font=font_channel)
    draw.text((vid_x + 16, vid_y + vid_h + 155), "Hợp âm chuẩn: G - Em - C - D (Tone G, Điệu Ballad)", fill=(161, 161, 170), font=font_channel)

    # Duong phan chia Side Panel
    draw.line([(split_x, 53), (split_x, h)], fill=(51, 65, 85), width=2)

    # --------------------------------------------------------------------------
    # COT PHAI: CHORD SIDE PANEL (x: 641 .. 1280, y: 53 .. 800)
    # --------------------------------------------------------------------------
    panel_x = split_x + 1
    panel_w = w - panel_x

    # Nen Toolbar Side Panel
    draw.rectangle([panel_x, 53, w, 155], fill=(248, 250, 252))
    draw.line([(panel_x, 155), (w, 155)], fill=(226, 232, 240), width=1)

    # Row 1: Brand badge & Header actions
    draw.rounded_rectangle([panel_x + 16, 65, panel_x + 50, 85], radius=4, fill=(37, 99, 235))
    draw.text((panel_x + 22, 68), "HAC", fill=(255, 255, 255), font=get_font(11, bold=True))
    draw.text((panel_x + 58, 67), "Hợp Âm Chuẩn", fill=(15, 23, 42), font=get_font(13, bold=True))

    # Cac nut icon: About, History, Open Tab
    draw.rounded_rectangle([w - 110, 63, w - 82, 89], radius=6, fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((w - 100, 67), "i", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.rounded_rectangle([w - 76, 63, w - 48, 89], radius=6, fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((w - 68, 67), "H", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.rounded_rectangle([w - 42, 63, w - 14, 89], radius=6, fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((w - 34, 67), "↗", fill=(100, 116, 139), font=get_font(13, bold=True))

    # Row 2: Thanh tim kiem (Search input)
    draw.rounded_rectangle([panel_x + 16, 95, panel_x + 440, 123], radius=6, fill=(255, 255, 255), outline=(59, 130, 246), width=2)
    draw.text((panel_x + 26, 100), "Ed Sheeran - Perfect", fill=(15, 23, 42), font=get_font(13))

    draw.rounded_rectangle([panel_x + 448, 95, panel_x + 510, 123], radius=6, fill=(37, 99, 235))
    draw.text((panel_x + 465, 100), "Tìm", fill=(255, 255, 255), font=get_font(12, bold=True))

    draw.rounded_rectangle([panel_x + 516, 95, w - 16, 123], radius=6, fill=(255, 255, 255), outline=(239, 68, 68))
    draw.text((panel_x + 532, 100), "YouTube", fill=(239, 68, 68), font=get_font(12, bold=True))

    # Row 3: Thanh dieu khien cuon & 50|50 (Controls bar)
    # Nut cuon tu dong
    draw.rounded_rectangle([panel_x + 16, 128, panel_x + 110, 150], radius=5, fill=(239, 246, 255), outline=(59, 130, 246))
    draw.text((panel_x + 26, 132), "Cuộn: 1x", fill=(37, 99, 235), font=get_font(11, bold=True))

    # Speed selector pills
    speeds = ["0.5x", "1x", "1.5x", "2x"]
    sx = panel_x + 120
    for sp in speeds:
        active = (sp == "1x")
        bg = (37, 99, 235) if active else (255, 255, 255)
        tc = (255, 255, 255) if active else (100, 116, 139)
        draw.rounded_rectangle([sx, 128, sx + 36, 150], radius=4, fill=bg, outline=(203, 213, 225))
        draw.text((sx + 6, 132), sp, fill=tc, font=get_font(10, bold=active))
        sx += 40

    # Nut 50 | 50 (Active)
    draw.rounded_rectangle([panel_x + 300, 128, panel_x + 380, 150], radius=5, fill=(239, 246, 255), outline=(59, 130, 246), width=1)
    draw.text((panel_x + 312, 132), "50 | 50", fill=(37, 99, 235), font=get_font(11, bold=True))

    # Nut Auto-Sync (Active)
    draw.rounded_rectangle([panel_x + 388, 128, panel_x + 460, 150], radius=5, fill=(239, 246, 255), outline=(59, 130, 246))
    draw.text((panel_x + 402, 132), "Auto", fill=(37, 99, 235), font=get_font(11, bold=True))

    # Status text
    draw.text((panel_x + 472, 132), "Đã bật chia cột 50 | 50", fill=(16, 185, 129), font=get_font(11))

    # --------------------------------------------------------------------------
    # NOI DUNG HOP AM CHUAN (2 COT 50|50 KHONG TRAN MEP)
    # --------------------------------------------------------------------------
    draw.rectangle([panel_x, 156, w, h], fill=(255, 255, 255))

    # Thong tin bai hat tren HAC
    font_stitle = get_font(17, bold=True)
    draw.text((panel_x + 24, 175), "Perfect - Ed Sheeran", fill=(15, 23, 42), font=font_stitle)
    draw.text((panel_x + 24, 202), "Điệu: Ballad • Tone: G • Capo: 1", fill=(100, 116, 139), font=get_font(12))

    draw.line([(panel_x + 24, 225), (w - 24, 225)], fill=(241, 245, 249), width=1)

    # 2 Cot hop am (x: panel_x + 24 .. w - 24)
    col1_x = panel_x + 24
    col2_x = panel_x + 330
    line_y = 240
    step_y = 38

    font_chord = get_font(13, bold=True)
    font_lyric = get_font(13)

    # Du lieu Cot 1
    col1_lines = [
        [("I found a ", False), ("[G]", True), (" love, for ", False), ("[Em]", True), (" me", False)],
        [("Darling, just ", False), ("[C]", True), (" dive right in", False)],
        [("and follow my ", False), ("[D]", True), (" lead", False)],
        [("Well, I found a ", False), ("[G]", True), (" girl, beautiful and ", False), ("[Em]", True), (" sweet", False)],
        [("Oh, I never ", False), ("[C]", True), (" knew you were the someone", False)],
        [("waiting for ", False), ("[D]", True), (" me", False)],
        [("'Cause we were just kids", False)],
        [("when we ", False), ("[Em]", True), (" fell in love", False)],
        [("Not knowing ", False), ("[C]", True), (" what it was", False)],
        [("I will not ", False), ("[G]", True), (" give you up this ", False), ("[D]", True), (" time", False)],
    ]

    # Du lieu Cot 2
    col2_lines = [
        [("But darling, just ", False), ("[Em]", True), (" kiss me slow", False)],
        [("Your heart is ", False), ("[C]", True), (" all I own", False)],
        [("And in your ", False), ("[G]", True), (" eyes,", False)],
        [("you're holding ", False), ("[D]", True), (" mine", False)],
        [("Baby, ", False), ("[Em]", True), (" I'm dancing in the ", False), ("[C]", True), (" dark", False)],
        [("With ", False), ("[G]", True), (" you between my ", False), ("[D]", True), (" arms", False)],
        [("Barefoot on the ", False), ("[Em]", True), (" grass,", False)],
        [("listening to our ", False), ("[C]", True), (" favorite song", False)],
        [("When you said you looked a ", False), ("[G]", True), (" mess", False)],
        [("I whispered underneath my ", False), ("[D]", True), (" breath...", False)],
    ]

    for line in col1_lines:
        cur_x = col1_x
        for txt, is_chord in line:
            color = (37, 99, 235) if is_chord else (30, 41, 59)
            fn = font_chord if is_chord else font_lyric
            draw.text((cur_x, line_y), txt, fill=color, font=fn)
            cur_x += int(draw.textlength(txt, font=fn))
        line_y += step_y

    line_y = 240
    for line in col2_lines:
        cur_x = col2_x
        for txt, is_chord in line:
            color = (37, 99, 235) if is_chord else (30, 41, 59)
            fn = font_chord if is_chord else font_lyric
            draw.text((cur_x, line_y), txt, fill=color, font=fn)
            cur_x += int(draw.textlength(txt, font=fn))
        line_y += step_y

    save_dual(img, "screenshot-1-1280x800")

# ==============================================================================
# 3. ANH CHUP MAN HINH 2 (SCREENSHOT 2 1280x800) - AUTO-SCROLL & LICH SU MO RONG
# ==============================================================================
def generate_screenshot_2():
    w, h = 1280, 800
    img = Image.new("RGB", (w, h), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Window header
    draw.rectangle([0, 0, w, 52], fill=(30, 41, 59))
    draw.line([(0, 52), (w, 52)], fill=(51, 65, 85), width=1)
    draw.ellipse([16, 20, 28, 32], fill=(239, 68, 68))
    draw.ellipse([34, 20, 46, 32], fill=(245, 158, 11))
    draw.ellipse([52, 20, 64, 32], fill=(16, 185, 129))

    draw.rounded_rectangle([180, 12, 1080, 42], radius=6, fill=(15, 23, 42))
    draw.text((196, 18), "https://www.youtube.com/watch?v=tong-hop-acoustic", fill=(148, 163, 184), font=get_font(13))

    split_x = 640
    # Left YouTube side
    draw.rectangle([0, 53, split_x, h], fill=(15, 15, 15))
    vid_w, vid_h = 580, 326
    vid_x, vid_y = 30, 80
    draw.rounded_rectangle([vid_x, vid_y, vid_x + vid_w, vid_y + vid_h], radius=8, fill=(24, 24, 27))
    draw.rectangle([vid_x + 2, vid_y + 2, vid_x + vid_w - 2, vid_y + vid_h - 2], fill=(35, 30, 45))
    play_cx, play_cy = vid_x + vid_w // 2, vid_y + vid_h // 2
    draw.ellipse([play_cx - 32, play_cy - 32, play_cx + 32, play_cy + 32], fill=(239, 68, 68))
    draw.polygon([(play_cx - 8, play_cy - 14), (play_cx - 8, play_cy + 14), (play_cx + 12, play_cy)], fill=(255, 255, 255))

    draw.text((vid_x, vid_y + vid_h + 20), "Tùng - Chuồn Chuồn (Official Lyric Video)", fill=(241, 245, 249), font=get_font(18, bold=True))
    draw.text((vid_x + 50, vid_y + vid_h + 60), "Tùng • 520N lượt xem", fill=(148, 163, 184), font=get_font(14))

    # Right Side panel
    panel_x = split_x + 1
    panel_w = w - panel_x
    draw.rectangle([panel_x, 53, w, 155], fill=(248, 250, 252))
    draw.line([(panel_x, 155), (w, 155)], fill=(226, 232, 240), width=1)

    draw.rounded_rectangle([panel_x + 16, 65, panel_x + 50, 85], radius=4, fill=(37, 99, 235))
    draw.text((panel_x + 22, 68), "HAC", fill=(255, 255, 255), font=get_font(11, bold=True))
    draw.text((panel_x + 58, 67), "Hợp Âm Chuẩn", fill=(15, 23, 42), font=get_font(13, bold=True))

    draw.rounded_rectangle([panel_x + 16, 95, panel_x + 440, 123], radius=6, fill=(255, 255, 255), outline=(59, 130, 246), width=2)
    draw.text((panel_x + 26, 100), "Tùng - Chuồn Chuồn", fill=(15, 23, 42), font=get_font(13))

    # Auto scroll dang bat: Cuon: 1.5x (Dang cuon)
    draw.rounded_rectangle([panel_x + 16, 128, panel_x + 120, 150], radius=5, fill=(220, 38, 38))
    draw.text((panel_x + 26, 132), "Dừng cuộn", fill=(255, 255, 255), font=get_font(11, bold=True))

    draw.text((panel_x + 135, 132), "Đang tự động cuộn (1.5x)...", fill=(37, 99, 235), font=get_font(11, bold=True))

    # Hop thoai Lich su mo ra (History Drawer)
    draw.rectangle([panel_x, 156, w, h], fill=(255, 255, 255))

    # Panel Lich su noi bat o giua
    hist_x = panel_x + 20
    hist_y = 170
    hist_w = panel_w - 40
    hist_h = 320
    draw.rounded_rectangle([hist_x, hist_y, hist_x + hist_w, hist_y + hist_h], radius=10, fill=(255, 255, 255), outline=(203, 213, 225), width=2)

    draw.text((hist_x + 20, hist_y + 16), "Bài đã xem gần đây (Lịch sử tìm kiếm)", fill=(15, 23, 42), font=get_font(14, bold=True))
    draw.text((hist_x + hist_w - 90, hist_y + 16), "Xóa hết", fill=(37, 99, 235), font=get_font(12, bold=True))
    draw.line([(hist_x, hist_y + 44), (hist_x + hist_w, hist_y + 44)], fill=(241, 245, 249), width=1)

    history_items = [
        ("Tùng - Chuồn Chuồn", "Vừa mở"),
        ("Ed Sheeran - Perfect", "10 phút trước"),
        ("Sơn Tùng M-TP - Đừng Làm Trái Tim Anh Đau", "1 giờ trước"),
        ("Vũ. - Bước Qua Mùa Cô Đơn", "Hôm qua"),
        ("Đen - Trốn Tìm", "3 ngày trước")
    ]

    iy = hist_y + 54
    for title, time_ago in history_items:
        draw.rounded_rectangle([hist_x + 10, iy, hist_x + hist_w - 10, iy + 44], radius=6, fill=(248, 250, 252))
        draw.text((hist_x + 24, iy + 12), title, fill=(30, 41, 59), font=get_font(13, bold=True))
        draw.text((hist_x + hist_w - 120, iy + 14), time_ago, fill=(148, 163, 184), font=get_font(11))
        iy += 50

    save_dual(img, "screenshot-2-1280x800")

# ==============================================================================
# 4. O QUANG CAO NHO (SMALL PROMO TILE 440x280)
# ==============================================================================
def generate_promo_small():
    w, h = 440, 280
    img = Image.new("RGB", (w, h), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Gradient nen hien dai tu navy den indigo dam
    for y in range(h):
        t = y / h
        r = int(10 * (1 - t) + 30 * t)
        g = int(15 * (1 - t) + 27 * t)
        b = int(30 * (1 - t) + 75 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Icon thuong hieu o goc tren trai (52x52)
    draw.rounded_rectangle([28, 28, 80, 80], radius=12, fill=(37, 99, 235))
    draw.rounded_rectangle([36, 36, 52, 72], radius=4, fill=(15, 23, 42))
    draw.polygon([(41, 48), (41, 60), (49, 54)], fill=(239, 68, 68))
    draw.rounded_rectangle([56, 36, 72, 72], radius=4, fill=(255, 255, 255))
    draw.rounded_rectangle([59, 41, 69, 47], radius=2, fill=(37, 99, 235))

    # Tieu de extension
    draw.text((94, 32), "Chord Side Panel", fill=(255, 255, 255), font=get_font(21, bold=True))
    draw.text((94, 60), "Hợp âm cạnh video YouTube", fill=(96, 165, 250), font=get_font(13, bold=True))

    # Duong gach ngang tinh te
    draw.line([(28, 98), (w - 28, 98)], fill=(51, 65, 85), width=1)

    # 3 tinh nang noi bat (dang the badge)
    features = [
        "Chia đôi 50 | 50 không tràn mép",
        "Cuộn tự động rảnh tay đánh đàn",
        "1-Click nhận diện bài từ YouTube"
    ]

    by = 116
    for f in features:
        draw.rounded_rectangle([28, by, w - 28, by + 34], radius=6, fill=(30, 41, 59), outline=(51, 65, 85))
        # Dau tich xanh
        draw.ellipse([40, by + 10, 54, by + 24], fill=(16, 185, 129))
        draw.text((64, by + 8), f, fill=(241, 245, 249), font=get_font(12, bold=True))
        by += 44

    # Footer nho
    draw.text((28, 252), "Tối ưu cho Hợp Âm Chuẩn • Manifest V3 • Free", fill=(148, 163, 184), font=get_font(10))

    save_dual(img, "promo-small-440x280")

# ==============================================================================
# 5. O QUANG CAO MARQUEE (MARQUEE PROMO TILE 1400x560)
# ==============================================================================
def generate_promo_marquee():
    w, h = 1400, 560
    img = Image.new("RGB", (w, h), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Gradient nen rong
    for y in range(h):
        t = y / h
        r = int(9 * (1 - t) + 20 * t)
        g = int(13 * (1 - t) + 30 * t)
        b = int(24 * (1 - t) + 65 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Ben trai: Typography & Tinh nang (x: 80 .. 680)
    # Badge nho
    draw.rounded_rectangle([80, 70, 360, 102], radius=16, fill=(30, 58, 138), outline=(59, 130, 246))
    draw.text((100, 78), "Tiện ích Chrome • Manifest V3", fill=(96, 165, 250), font=get_font(14, bold=True))

    # Tieu de lon
    draw.text((80, 120), "Chord Side Panel", fill=(255, 255, 255), font=get_font(48, bold=True))
    draw.text((80, 186), "Hợp âm Hợp Âm Chuẩn bên cạnh video YouTube", fill=(147, 197, 253), font=get_font(22, bold=True))

    draw.text((80, 230), "Vừa xem video hướng dẫn vừa nhìn hợp âm song song,", fill=(203, 213, 225), font=get_font(16))
    draw.text((80, 256), "hoàn toàn rảnh tay đánh đàn không cần chia tab thủ công.", fill=(203, 213, 225), font=get_font(16))

    # 4 bullet points tinh nang
    f_list = [
        "Tự động nhận diện bài hát từ YouTube (lọc sạch MV, lyrics, ft.)",
        "Bố cục chia đôi 50 | 50 triệt tiêu hoàn toàn tràn mép hay lẹm chữ",
        "Cuộn trang tự động (Auto-Scroll) rảnh tay với 4 mức tốc độ",
        "Tự động đồng bộ bài mới khi YouTube chuyển bài trong playlist"
    ]

    fy = 310
    for f in f_list:
        draw.ellipse([82, fy + 4, 96, fy + 18], fill=(16, 185, 129))
        draw.text((108, fy), f, fill=(241, 245, 249), font=get_font(15, bold=True))
        fy += 42

    # Ben phai: Mockup thu nho thu vi (x: 720 .. 1320, y: 70 .. 490)
    mock_x = 720
    mock_y = 70
    mock_w = 600
    mock_h = 420

    # Khung cua so mockup
    draw.rounded_rectangle([mock_x, mock_y, mock_x + mock_w, mock_y + mock_h], radius=14, fill=(30, 41, 59), outline=(71, 85, 105), width=2)
    # Header mockup
    draw.rectangle([mock_x, mock_y, mock_x + mock_w, mock_y + 36], fill=(51, 65, 85))
    draw.ellipse([mock_x + 12, mock_y + 12, mock_x + 22, mock_y + 22], fill=(239, 68, 68))
    draw.ellipse([mock_x + 28, mock_y + 12, mock_x + 38, mock_y + 22], fill=(245, 158, 11))
    draw.ellipse([mock_x + 44, mock_y + 12, mock_x + 54, mock_y + 22], fill=(16, 185, 129))
    draw.text((mock_x + 80, mock_y + 10), "youtube.com/watch • side-panel", fill=(203, 213, 225), font=get_font(11))

    # Ben trong chia 50|50: Trai YouTube, Phai Hop am
    m_split = mock_x + 300
    draw.rectangle([mock_x + 2, mock_y + 37, m_split, mock_y + mock_h - 2], fill=(15, 15, 15))
    draw.rectangle([m_split + 1, mock_y + 37, mock_x + mock_w - 2, mock_y + mock_h - 2], fill=(255, 255, 255))

    # Ben trai: Video preview
    draw.rounded_rectangle([mock_x + 20, mock_y + 60, m_split - 20, mock_y + 220], radius=8, fill=(35, 35, 45))
    draw.ellipse([mock_x + 140, mock_y + 120, mock_x + 180, mock_y + 160], fill=(239, 68, 68))
    draw.polygon([(mock_x + 155, mock_y + 130), (mock_x + 155, mock_y + 150), (mock_x + 170, mock_y + 140)], fill=(255, 255, 255))
    draw.text((mock_x + 20, mock_y + 240), "Ed Sheeran - Perfect", fill=(255, 255, 255), font=get_font(14, bold=True))
    draw.text((mock_x + 20, mock_y + 266), "Official Music Video", fill=(148, 163, 184), font=get_font(12))

    # Ben phai: Hop am 2 cot
    draw.text((m_split + 20, mock_y + 50), "Hợp Âm Chuẩn", fill=(37, 99, 235), font=get_font(14, bold=True))
    draw.text((m_split + 20, mock_y + 76), "Perfect - Tone G", fill=(15, 23, 42), font=get_font(13, bold=True))
    draw.line([(m_split + 20, mock_y + 98), (mock_x + mock_w - 20, mock_y + 98)], fill=(226, 232, 240), width=1)

    c_lines = [
        "I found a [G] love, for [Em] me",
        "Darling, just [C] dive right in",
        "and follow my [D] lead",
        "Well, I found a [G] girl [Em] sweet",
        "Oh, I never [C] knew [D] me",
        "'Cause we were just kids [Em]",
        "when we fell in love [C]",
        "I will not [G] give you up [D]",
        "Baby, [Em] dancing in the [C] dark"
    ]
    cy = mock_y + 112
    for cl in c_lines:
        draw.text((m_split + 20, cy), cl, fill=(30, 41, 59), font=get_font(11))
        cy += 28

    save_dual(img, "promo-marquee-1400x560")

# ==============================================================================
# MAIN RUNNER
# ==============================================================================
if __name__ == "__main__":
    print("Bat dau tao cac tai san hinh anh cho Chrome Web Store...")
    generate_store_icon()
    generate_screenshot_1()
    generate_screenshot_2()
    generate_promo_small()
    generate_promo_marquee()
    print("\nHoan tat toan bo! Tat ca anh da duoc luu tai: " + OUTPUT_DIR)

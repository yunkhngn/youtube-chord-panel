import os
from PIL import Image, ImageDraw, ImageFont

# Output folder for Chrome Web Store assets
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_DIR = os.path.join(ROOT_DIR, "store-assets")
ICON_128_PATH = os.path.join(ROOT_DIR, "icons", "icon128.png")
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
    """Save both 24-bit RGB PNG (no alpha) and JPEG into store-assets."""
    rgb_img = img.convert("RGB")
    png_path = os.path.join(OUTPUT_DIR, f"{base_name}.png")
    jpg_path = os.path.join(OUTPUT_DIR, f"{base_name}.jpg")

    rgb_img.save(png_path, "PNG", optimize=True)
    rgb_img.save(jpg_path, "JPEG", quality=95)
    print(f"Generated: {base_name}.png & {base_name}.jpg ({img.width}x{img.height})")


def paste_brand_icon(img, x, y, size):
    """Composite the antialiased extension icon onto an RGB canvas."""
    if os.path.exists(ICON_128_PATH):
        icon = Image.open(ICON_128_PATH).convert("RGBA")
        if icon.size != (size, size):
            icon = icon.resize((size, size), Image.Resampling.LANCZOS)
        img.paste(icon, (x, y), icon)
        return True
    return False


# ==============================================================================
# 1. STORE ICON (128x128)
# ==============================================================================
def generate_store_icon():
    w, h = 128, 128
    img = Image.new("RGB", (w, h), (24, 26, 31))
    if not paste_brand_icon(img, 0, 0, 128):
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([18, 28, 58, 100], radius=8, fill=(36, 40, 50))
        draw.polygon([(34, 54), (34, 74), (49, 64)], fill=(239, 68, 68))
        draw.rounded_rectangle([66, 28, 110, 100], radius=8, fill=(250, 251, 253))
        draw.rounded_rectangle([72, 38, 98, 50], radius=3, fill=(37, 99, 235))
    save_dual(img, "store-icon-128x128")


def draw_browser_header(draw, w, url_text):
    draw.rectangle([0, 0, w, 52], fill=(24, 26, 31))
    draw.line([(0, 52), (w, 52)], fill=(40, 44, 52), width=1)

    # macOS traffic lights
    draw.ellipse([16, 20, 28, 32], fill=(239, 68, 68))
    draw.ellipse([34, 20, 46, 32], fill=(245, 158, 11))
    draw.ellipse([52, 20, 64, 32], fill=(16, 185, 129))

    # Omnibox
    draw.rounded_rectangle([180, 11, 1076, 41], radius=8, fill=(17, 18, 21), outline=(45, 49, 58))
    draw.text((196, 18), url_text, fill=(139, 146, 161), font=get_font(13))

    # Active extension pill
    draw.rounded_rectangle([1096, 11, 1252, 41], radius=8, fill=(37, 99, 235))
    draw.text((1114, 18), "Chord Side Panel", fill=(255, 255, 255), font=get_font(12, bold=True))


def draw_panel_toolbar(draw, panel_x, w, query_text, status_text, scroll_active=False, history_open=False):
    # Toolbar background (matching panel.css light palette)
    draw.rectangle([panel_x, 53, w, 174], fill=(246, 247, 249))
    draw.line([(panel_x, 174), (w, 174)], fill=(225, 228, 234), width=1)

    # Row 1: HAC badge + title + filled icon buttons
    draw.rounded_rectangle([panel_x + 14, 65, panel_x + 48, 85], radius=5, fill=(37, 99, 235))
    draw.text((panel_x + 19, 68), "HAC", fill=(255, 255, 255), font=get_font(10, bold=True))
    draw.text((panel_x + 56, 67), "Hợp Âm Chuẩn", fill=(17, 24, 39), font=get_font(13, bold=True))

    # About icon button
    draw.rounded_rectangle([w - 104, 61, w - 76, 89], radius=8, fill=(255, 255, 255), outline=(218, 222, 230))
    draw.ellipse([w - 97, 68, w - 83, 82], fill=(107, 114, 128))
    draw.text((w - 92, 69), "i", fill=(255, 255, 255), font=get_font(11, bold=True))

    # History icon button
    h_bg = (229, 237, 255) if history_open else (255, 255, 255)
    h_outline = (37, 99, 235) if history_open else (218, 222, 230)
    h_fg = (37, 99, 235) if history_open else (107, 114, 128)
    draw.rounded_rectangle([w - 72, 61, w - 44, 89], radius=8, fill=h_bg, outline=h_outline)
    draw.ellipse([w - 65, 68, w - 51, 82], fill=h_fg)
    draw.line([(w - 58, 72), (w - 58, 76), (w - 54, 78)], fill=(255, 255, 255), width=2)

    # Open tab icon button
    draw.rounded_rectangle([w - 40, 61, w - 12, 89], radius=8, fill=(255, 255, 255), outline=(218, 222, 230))
    draw.text((w - 32, 67), "↗", fill=(107, 114, 128), font=get_font(13, bold=True))

    # Row 2: Search input + Primary Tìm + YouTube
    draw.rounded_rectangle([panel_x + 14, 96, panel_x + 448, 128], radius=8, fill=(255, 255, 255), outline=(37, 99, 235), width=2)
    draw.text((panel_x + 24, 104), query_text, fill=(17, 24, 39), font=get_font(13))

    draw.rounded_rectangle([panel_x + 454, 96, panel_x + 518, 128], radius=8, fill=(37, 99, 235))
    draw.text((panel_x + 474, 104), "Tìm", fill=(255, 255, 255), font=get_font(12, bold=True))

    draw.rounded_rectangle([panel_x + 524, 96, w - 14, 128], radius=8, fill=(255, 255, 255), outline=(220, 38, 38))
    draw.text((panel_x + 542, 104), "YouTube", fill=(220, 38, 38), font=get_font(12, bold=True))

    # Row 3: Controls (Cuộn + 0.5x/1x/1.5x/2x + 50|50 + Auto)
    s_bg = (229, 237, 255) if scroll_active else (255, 255, 255)
    s_outline = (37, 99, 235) if scroll_active else (218, 222, 230)
    s_fg = (37, 99, 235) if scroll_active else (75, 85, 99)
    draw.rounded_rectangle([panel_x + 14, 134, panel_x + 86, 160], radius=7, fill=s_bg, outline=s_outline)
    draw.text((panel_x + 28, 140), "Dừng" if scroll_active else "Cuộn", fill=s_fg, font=get_font(11, bold=True))

    # Speed container
    draw.rounded_rectangle([panel_x + 92, 134, panel_x + 256, 160], radius=7, fill=(255, 255, 255), outline=(218, 222, 230))
    speeds = ["0.5x", "1x", "1.5x", "2x"]
    sx = panel_x + 95
    active_speed = "1.5x" if scroll_active else "1x"
    for sp in speeds:
        is_act = sp == active_speed
        if is_act:
            draw.rounded_rectangle([sx, 137, sx + 38, 157], radius=5, fill=(37, 99, 235))
        draw.text((sx + 7, 141), sp, fill=(255, 255, 255) if is_act else (107, 114, 128), font=get_font(10, bold=is_act))
        sx += 40

    # 50|50 + Auto
    draw.rounded_rectangle([w - 156, 134, w - 82, 160], radius=7, fill=(229, 237, 255), outline=(37, 99, 235))
    draw.text((w - 140, 140), "50 | 50", fill=(37, 99, 235), font=get_font(11, bold=True))

    draw.rounded_rectangle([w - 76, 134, w - 14, 160], radius=7, fill=(229, 237, 255), outline=(37, 99, 235))
    draw.text((w - 58, 140), "Auto", fill=(37, 99, 235), font=get_font(11, bold=True))

    # Status line
    if status_text:
        draw.text((panel_x + 14, 162), status_text, fill=(107, 114, 128), font=get_font(10))


# ==============================================================================
# 2. SCREENSHOT 1 (1280x800) - YOUTUBE + CHORD SIDE PANEL 50|50
# ==============================================================================
def generate_screenshot_1():
    w, h = 1280, 800
    img = Image.new("RGB", (w, h), (17, 18, 21))
    draw = ImageDraw.Draw(img)

    draw_browser_header(draw, w, "https://www.youtube.com/watch?v=2Vv-BfVoq4g")

    split_x = 640
    # Left YouTube pane
    draw.rectangle([0, 53, split_x, h], fill=(15, 15, 15))
    vid_w, vid_h, vid_x, vid_y = 580, 326, 30, 78
    draw.rounded_rectangle([vid_x, vid_y, vid_x + vid_w, vid_y + vid_h], radius=10, fill=(28, 30, 36))
    play_cx, play_cy = vid_x + vid_w // 2, vid_y + vid_h // 2
    draw.ellipse([play_cx - 32, play_cy - 32, play_cx + 32, play_cy + 32], fill=(239, 68, 68))
    draw.polygon([(play_cx - 8, play_cy - 14), (play_cx - 8, play_cy + 14), (play_cx + 12, play_cy)], fill=(255, 255, 255))

    draw.rectangle([vid_x, vid_y + vid_h - 5, vid_x + vid_w, vid_y + vid_h], fill=(75, 78, 86))
    draw.rectangle([vid_x, vid_y + vid_h - 5, vid_x + 260, vid_y + vid_h], fill=(239, 68, 68))

    draw.text((vid_x, vid_y + vid_h + 20), "Ed Sheeran - Perfect (Official Music Video)", fill=(243, 244, 246), font=get_font(18, bold=True))
    draw.ellipse([vid_x, vid_y + vid_h + 56, vid_x + 40, vid_y + vid_h + 96], fill=(37, 99, 235))
    draw.text((vid_x + 52, vid_y + vid_h + 58), "Ed Sheeran", fill=(255, 255, 255), font=get_font(15, bold=True))
    draw.text((vid_x + 52, vid_y + vid_h + 78), "3,7 tỷ lượt xem • Official Video", fill=(139, 146, 161), font=get_font(13))

    draw.rounded_rectangle([vid_x, vid_y + vid_h + 118, vid_x + vid_w, vid_y + vid_h + 220], radius=10, fill=(28, 30, 36))
    draw.text((vid_x + 16, vid_y + vid_h + 136), "Tự động nhận diện bài hát và nhảy thẳng vào trang hợp âm.", fill=(212, 214, 220), font=get_font(13))
    draw.text((vid_x + 16, vid_y + vid_h + 162), "Ghi nhớ phiên bản đã chọn theo từng video YouTube.", fill=(139, 146, 161), font=get_font(13))

    draw.line([(split_x, 53), (split_x, h)], fill=(45, 49, 58), width=2)

    # Right Side Panel
    panel_x = split_x + 1
    draw_panel_toolbar(draw, panel_x, w, "Perfect - Ed Sheeran", "Đã nhận diện: Ed Sheeran - Perfect")

    draw.rectangle([panel_x, 175, w, h], fill=(255, 255, 255))
    draw.text((panel_x + 24, 194), "Perfect - Ed Sheeran", fill=(17, 24, 39), font=get_font(17, bold=True))
    draw.text((panel_x + 24, 222), "Điệu: Ballad • Tone: G • Capo: 1", fill=(107, 114, 128), font=get_font(12))
    draw.line([(panel_x + 24, 246), (w - 24, 246)], fill=(235, 238, 244), width=1)

    col1_x, col2_x = panel_x + 24, panel_x + 332
    font_chord = get_font(13, bold=True)
    font_lyric = get_font(13)

    col1_lines = [
        [("I found a ", False), ("[G]", True), (" love, for ", False), ("[Em]", True), (" me", False)],
        [("Darling, just ", False), ("[C]", True), (" dive right in", False)],
        [("and follow my ", False), ("[D]", True), (" lead", False)],
        [("Well, I found a ", False), ("[G]", True), (" girl, ", False), ("[Em]", True), (" sweet", False)],
        [("Oh, I never ", False), ("[C]", True), (" knew you were", False)],
        [("waiting for ", False), ("[D]", True), (" me", False)],
        [("'Cause we were just kids", False)],
        [("when we ", False), ("[Em]", True), (" fell in love", False)],
        [("Not knowing ", False), ("[C]", True), (" what it was", False)],
        [("I will not ", False), ("[G]", True), (" give you up ", False), ("[D]", True), (" now", False)],
    ]
    col2_lines = [
        [("But darling, just ", False), ("[Em]", True), (" kiss me slow", False)],
        [("Your heart is ", False), ("[C]", True), (" all I own", False)],
        [("And in your ", False), ("[G]", True), (" eyes,", False)],
        [("you're holding ", False), ("[D]", True), (" mine", False)],
        [("Baby, ", False), ("[Em]", True), (" dancing in the ", False), ("[C]", True), (" dark", False)],
        [("With ", False), ("[G]", True), (" you in my ", False), ("[D]", True), (" arms", False)],
        [("Barefoot on the ", False), ("[Em]", True), (" grass,", False)],
        [("listening to our ", False), ("[C]", True), (" song", False)],
        [("When you said you looked a ", False), ("[G]", True), (" mess", False)],
        [("I whispered under my ", False), ("[D]", True), (" breath", False)],
    ]

    for col_x, lines in ((col1_x, col1_lines), (col2_x, col2_lines)):
        ly = 264
        for line in lines:
            cx = col_x
            for txt, is_chord in line:
                color = (37, 99, 235) if is_chord else (31, 41, 55)
                fn = font_chord if is_chord else font_lyric
                draw.text((cx, ly), txt, fill=color, font=fn)
                cx += int(draw.textlength(txt, font=fn))
            ly += 38

    save_dual(img, "screenshot-1-1280x800")


# ==============================================================================
# 3. SCREENSHOT 2 (1280x800) - DIRECT HISTORY JUMP & SMOOTH AUTO-SCROLL
# ==============================================================================
def generate_screenshot_2():
    w, h = 1280, 800
    img = Image.new("RGB", (w, h), (17, 18, 21))
    draw = ImageDraw.Draw(img)

    draw_browser_header(draw, w, "https://www.youtube.com/watch?v=wW3xlRjGsDE")

    split_x = 640
    draw.rectangle([0, 53, split_x, h], fill=(15, 15, 15))
    vid_w, vid_h, vid_x, vid_y = 580, 326, 30, 78
    draw.rounded_rectangle([vid_x, vid_y, vid_x + vid_w, vid_y + vid_h], radius=10, fill=(28, 30, 36))
    play_cx, play_cy = vid_x + vid_w // 2, vid_y + vid_h // 2
    draw.ellipse([play_cx - 32, play_cy - 32, play_cx + 32, play_cy + 32], fill=(239, 68, 68))
    draw.polygon([(play_cx - 8, play_cy - 14), (play_cx - 8, play_cy + 14), (play_cx + 12, play_cy)], fill=(255, 255, 255))

    draw.text((vid_x, vid_y + vid_h + 20), "Tùng - Chuồn Chuồn (Official Lyric Video)", fill=(243, 244, 246), font=get_font(18, bold=True))
    draw.text((vid_x, vid_y + vid_h + 54), "Tùng • Danh sách phát Acoustic", fill=(139, 146, 161), font=get_font(14))

    draw.line([(split_x, 53), (split_x, h)], fill=(45, 49, 58), width=2)

    panel_x = split_x + 1
    panel_w = w - panel_x
    draw_panel_toolbar(
        draw,
        panel_x,
        w,
        "Chuồn Chuồn - Tùng",
        "Đang cuộn tự động (1.5x)",
        scroll_active=True,
        history_open=True,
    )

    draw.rectangle([panel_x, 175, w, h], fill=(255, 255, 255))

    # History popover (matching panel.css 12px outer radius, 8px row radius)
    hist_x, hist_y = panel_x + 14, 180
    hist_w, hist_h = panel_w - 28, 306
    draw.rounded_rectangle([hist_x, hist_y, hist_x + hist_w, hist_y + hist_h], radius=12, fill=(255, 255, 255), outline=(218, 222, 230), width=1)
    draw.text((hist_x + 14, hist_y + 12), "Bài đã xem gần đây", fill=(75, 85, 99), font=get_font(12, bold=True))
    draw.text((hist_x + hist_w - 66, hist_y + 12), "Xóa hết", fill=(37, 99, 235), font=get_font(12, bold=True))
    draw.line([(hist_x + 10, hist_y + 38), (hist_x + hist_w - 10, hist_y + 38)], fill=(235, 238, 244), width=1)

    history_items = [
        ("Chuồn Chuồn - Tùng", True),
        ("About You - The 1975", True),
        ("Nàng Thơ - Nguyễn Hoàng Dũng", True),
        ("Lối Nhỏ - Đen", True),
        ("Mấy khi - The Flob", True),
    ]

    iy = hist_y + 48
    for title, is_song in history_items:
        draw.rounded_rectangle([hist_x + 10, iy, hist_x + hist_w - 10, iy + 40], radius=8, fill=(246, 247, 249))
        draw.text((hist_x + 22, iy + 12), title, fill=(17, 24, 39), font=get_font(13, bold=True))
        badge_x = hist_x + hist_w - 76
        draw.rounded_rectangle([badge_x, iy + 9, hist_x + hist_w - 18, iy + 31], radius=5, fill=(229, 237, 255))
        draw.text((badge_x + 10, iy + 13), "Bài hát" if is_song else "Mở bài", fill=(37, 99, 235), font=get_font(11, bold=True))
        iy += 46

    save_dual(img, "screenshot-2-1280x800")


# ==============================================================================
# 4. SMALL PROMO TILE (440x280)
# ==============================================================================
def generate_promo_small():
    w, h = 440, 280
    img = Image.new("RGB", (w, h), (17, 18, 21))
    draw = ImageDraw.Draw(img)

    for y in range(h):
        t = y / h
        c_r = int(24 * (1 - t) + 17 * t)
        c_g = int(26 * (1 - t) + 18 * t)
        c_b = int(31 * (1 - t) + 21 * t)
        draw.line([(0, y), (w, y)], fill=(c_r, c_g, c_b))

    paste_brand_icon(img, 28, 24, 56)

    draw.text((98, 28), "Chord Side Panel", fill=(243, 244, 246), font=get_font(21, bold=True))
    draw.text((98, 56), "Hợp âm cạnh video YouTube", fill=(96, 165, 250), font=get_font(13, bold=True))

    draw.line([(28, 96), (w - 28, 96)], fill=(40, 44, 52), width=1)

    features = [
        "Tự động mở thẳng bài hát từ YouTube & Lịch sử",
        "Chia đôi 50 | 50 gọn gàng, không tràn mép",
        "Cuộn tự động êm ái rảnh tay đệm đàn",
    ]

    by = 114
    for feat in features:
        draw.rounded_rectangle([28, by, w - 28, by + 36], radius=8, fill=(28, 30, 36), outline=(45, 49, 58))
        draw.ellipse([40, by + 12, 52, by + 24], fill=(37, 99, 235))
        draw.text((62, by + 10), feat, fill=(243, 244, 246), font=get_font(12, bold=True))
        by += 44

    draw.text((28, 252), "Tối ưu cho Hợp Âm Chuẩn • Manifest V3 • Free", fill=(139, 146, 161), font=get_font(10))
    save_dual(img, "promo-small-440x280")


# ==============================================================================
# 5. MARQUEE PROMO TILE (1400x560)
# ==============================================================================
def generate_promo_marquee():
    w, h = 1400, 560
    img = Image.new("RGB", (w, h), (17, 18, 21))
    draw = ImageDraw.Draw(img)

    for y in range(h):
        t = y / h
        c_r = int(24 * (1 - t) + 17 * t)
        c_g = int(26 * (1 - t) + 18 * t)
        c_b = int(31 * (1 - t) + 21 * t)
        draw.line([(0, y), (w, y)], fill=(c_r, c_g, c_b))

    paste_brand_icon(img, 80, 62, 48)
    draw.rounded_rectangle([142, 70, 384, 102], radius=8, fill=(28, 34, 48), outline=(37, 99, 235))
    draw.text((160, 78), "Chrome Extension • Manifest V3", fill=(96, 165, 250), font=get_font(13, bold=True))

    draw.text((80, 128), "Chord Side Panel", fill=(243, 244, 246), font=get_font(46, bold=True))
    draw.text((80, 188), "Hợp Âm Chuẩn ngay bên cạnh video YouTube", fill=(96, 165, 250), font=get_font(21, bold=True))

    draw.text((80, 232), "Mở thẳng bảng hợp âm từ video đang xem hoặc lịch sử gần đây,", fill=(180, 185, 196), font=get_font(16))
    draw.text((80, 258), "rảnh tay đệm đàn với cuộn tự động êm và bố cục 2 cột sạch sẽ.", fill=(180, 185, 196), font=get_font(16))

    f_list = [
        "Nhận diện bài hát từ tab YouTube và mở thẳng trang hợp âm",
        "Lưu bài đã xem trong lịch sử để nhảy thẳng vào bài chỉ 1 click",
        "Chia đôi 50 | 50 không tràn mép, tự tắt chia cột ngang mặc định",
        "Cuộn trang tự động (0.5x – 2x) vừa nhịp đệm guitar và piano",
    ]

    fy = 316
    for feat in f_list:
        draw.ellipse([82, fy + 4, 94, fy + 16], fill=(37, 99, 235))
        draw.text((106, fy), feat, fill=(243, 244, 246), font=get_font(15, bold=True))
        fy += 42

    # Mockup window on the right
    mock_x, mock_y, mock_w, mock_h = 720, 70, 600, 420
    draw.rounded_rectangle([mock_x, mock_y, mock_x + mock_w, mock_y + mock_h], radius=14, fill=(24, 26, 31), outline=(55, 60, 70), width=2)
    draw.rectangle([mock_x + 2, mock_y + 2, mock_x + mock_w - 2, mock_y + 38], fill=(32, 35, 42))
    draw.ellipse([mock_x + 14, mock_y + 14, mock_x + 24, mock_y + 24], fill=(239, 68, 68))
    draw.ellipse([mock_x + 30, mock_y + 14, mock_x + 40, mock_y + 24], fill=(245, 158, 11))
    draw.ellipse([mock_x + 46, mock_y + 14, mock_x + 56, mock_y + 24], fill=(16, 185, 129))
    draw.text((mock_x + 76, mock_y + 12), "youtube.com/watch • side-panel", fill=(180, 185, 196), font=get_font(11))

    m_split = mock_x + 296
    draw.rectangle([mock_x + 2, mock_y + 39, m_split, mock_y + mock_h - 2], fill=(15, 15, 15))
    draw.rectangle([m_split + 1, mock_y + 39, mock_x + mock_w - 2, mock_y + mock_h - 2], fill=(255, 255, 255))

    draw.rounded_rectangle([mock_x + 20, mock_y + 62, m_split - 20, mock_y + 222], radius=8, fill=(28, 30, 36))
    draw.ellipse([mock_x + 138, mock_y + 122, mock_x + 178, mock_y + 162], fill=(239, 68, 68))
    draw.polygon([(mock_x + 153, mock_y + 132), (mock_x + 153, mock_y + 152), (mock_x + 168, mock_y + 142)], fill=(255, 255, 255))
    draw.text((mock_x + 20, mock_y + 242), "Ed Sheeran - Perfect", fill=(243, 244, 246), font=get_font(14, bold=True))
    draw.text((mock_x + 20, mock_y + 266), "Official Music Video", fill=(139, 146, 161), font=get_font(12))

    draw.text((m_split + 20, mock_y + 52), "Hợp Âm Chuẩn", fill=(37, 99, 235), font=get_font(14, bold=True))
    draw.text((m_split + 20, mock_y + 78), "Perfect - Tone G", fill=(17, 24, 39), font=get_font(13, bold=True))
    draw.line([(m_split + 20, mock_y + 100), (mock_x + mock_w - 20, mock_y + 100)], fill=(229, 232, 238), width=1)

    c_lines = [
        "I found a [G] love, for [Em] me",
        "Darling, just [C] dive right in",
        "and follow my [D] lead",
        "Well, I found a [G] girl [Em] sweet",
        "Oh, I never [C] knew [D] me",
        "'Cause we were just kids [Em]",
        "when we fell in love [C]",
        "I will not [G] give you up [D]",
        "Baby, [Em] dancing in the [C] dark",
    ]
    cy = mock_y + 114
    for cl in c_lines:
        draw.text((m_split + 20, cy), cl, fill=(31, 41, 55), font=get_font(11))
        cy += 28

    save_dual(img, "promo-marquee-1400x560")


if __name__ == "__main__":
    print("Generating Chrome Web Store assets...")
    generate_store_icon()
    generate_screenshot_1()
    generate_screenshot_2()
    generate_promo_small()
    generate_promo_marquee()
    print("Done! Saved to:", OUTPUT_DIR)

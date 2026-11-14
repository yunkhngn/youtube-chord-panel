const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPng(width, height, pixelFn) {
  const stride = width * 4;
  const rawData = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[pixelOffset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const deflated = zlib.deflateSync(rawData);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "binary");
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", deflated),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

// Distance to rounded rectangle
function sdRoundRect(px, py, rx, ry, rw, rh, radius) {
  const dx = Math.max(Math.abs(px - (rx + rw / 2)) - (rw / 2 - radius), 0);
  const dy = Math.max(Math.abs(py - (ry + rh / 2)) - (rh / 2 - radius), 0);
  return Math.sqrt(dx * dx + dy * dy) - radius;
}

// Distance to circle
function sdCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy) - r;
}

// Distance to line segment
function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.sqrt(dx * dx + dy * dy);
}

function renderIcon(x, y, size) {
  // Normalize coordinates to 0..1
  const nx = x / size;
  const ny = y / size;

  // Background rounded rectangle
  const pad = 0.06;
  const cornerR = 0.22;
  const bgDist = sdRoundRect(nx, ny, pad, pad, 1 - 2 * pad, 1 - 2 * pad, cornerR);
  
  if (bgDist > 0.02) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Antialias factor
  const pixelSize = 1 / size;
  const bgAlpha = Math.max(0, Math.min(1, 0.5 - bgDist / pixelSize));

  // Gradient background: Vibrant blue #2563eb (37, 99, 235) to purple #7c3aed (124, 58, 237)
  const gradT = (nx + ny) / 2;
  let bgR = 37 + gradT * (124 - 37);
  let bgG = 99 + gradT * (58 - 99);
  let bgB = 235 + gradT * (237 - 235);

  // Side Panel Layout Graphic:
  // Left: Video screen with play icon (nx: 0.16 to 0.46)
  // Right: Chord sheet with lines (nx: 0.54 to 0.84)
  // Divider in between: nx = 0.50

  // 1. Left container (YouTube screen mockup): 0.16 to 0.48, 0.24 to 0.76
  const leftDist = sdRoundRect(nx, ny, 0.16, 0.24, 0.32, 0.52, 0.08);
  const leftAlpha = Math.max(0, Math.min(1, 0.5 - leftDist / pixelSize));

  // 2. Right container (Side Panel mockup): 0.52 to 0.84, 0.24 to 0.76
  const rightDist = sdRoundRect(nx, ny, 0.52, 0.24, 0.32, 0.52, 0.08);
  const rightAlpha = Math.max(0, Math.min(1, 0.5 - rightDist / pixelSize));

  // Base background
  let r = bgR, g = bgG, b = bgB, a = bgAlpha * 255;

  // Draw Left container (Dark translucent video player)
  if (leftAlpha > 0) {
    const lr = 15, lg = 23, lb = 42; // Slate 900
    const la = leftAlpha * 0.75;
    r = r * (1 - la) + lr * la;
    g = g * (1 - la) + lg * la;
    b = b * (1 - la) + lb * la;
  }

  // Draw Play triangle on left screen: center (0.32, 0.50)
  // Triangle vertices: (0.28, 0.41), (0.28, 0.59), (0.39, 0.50)
  const px = nx, py = ny;
  const inPlay = (px >= 0.27 && px <= 0.39 &&
    py >= 0.50 - (px - 0.27) * 0.85 &&
    py <= 0.50 + (px - 0.27) * 0.85);
  if (inPlay) {
    const playAlpha = Math.min(1, leftAlpha);
    r = r * (1 - playAlpha) + 239 * playAlpha; // Red/coral #ef4444
    g = g * (1 - playAlpha) + 68 * playAlpha;
    b = b * (1 - playAlpha) + 68 * playAlpha;
  }

  // Draw Right container (White translucent side panel with chord lines)
  if (rightAlpha > 0) {
    const wr = 255, wg = 255, wb = 255;
    const wa = rightAlpha * 0.92;
    r = r * (1 - wa) + wr * wa;
    g = g * (1 - wa) + wg * wa;
    b = b * (1 - wa) + wb * wa;

    // Draw chord badges/lines on the right panel
    // Top badge "C" / "Am": 0.57 to 0.70, 0.32 to 0.40
    const badgeDist = sdRoundRect(nx, ny, 0.56, 0.31, 0.24, 0.10, 0.03);
    if (badgeDist < 0) {
      // Blue chord badge
      r = 37; g = 99; b = 235;
    }

    // Chord line 1
    const line1Dist = sdSegment(nx, ny, 0.56, 0.47, 0.80, 0.47) - 0.02;
    if (line1Dist < 0) {
      r = 100; g = 116; b = 139; // Slate 500
    }

    // Chord line 2 (with chord dot)
    const line2Dist = sdSegment(nx, ny, 0.56, 0.56, 0.80, 0.56) - 0.02;
    if (line2Dist < 0) {
      r = 148; g = 163; b = 184; // Slate 400
    }

    // Chord dot on line 2 (e.g. musical accent)
    const dotDist = sdCircle(nx, ny, 0.63, 0.56, 0.035);
    if (dotDist < 0) {
      r = 234; g = 88; b = 12; // Orange accent
    }

    // Chord line 3
    const line3Dist = sdSegment(nx, ny, 0.56, 0.65, 0.74, 0.65) - 0.02;
    if (line3Dist < 0) {
      r = 148; g = 163; b = 184;
    }
  }

  return [r, g, b, a];
}

const sizes = [16, 32, 48, 128];
const iconsDir = path.resolve(__dirname, "../icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

for (const s of sizes) {
  const png = createPng(s, s, (x, y) => renderIcon(x, y, s));
  const filePath = path.join(iconsDir, `icon${s}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Generated ${filePath} (${s}x${s}, ${png.length} bytes)`);
}

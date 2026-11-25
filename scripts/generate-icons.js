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
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
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
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

function sdRoundRect(px, py, rx, ry, rw, rh, radius) {
  const dx = Math.max(Math.abs(px - (rx + rw / 2)) - (rw / 2 - radius), 0);
  const dy = Math.max(Math.abs(py - (ry + rh / 2)) - (rh / 2 - radius), 0);
  return Math.sqrt(dx * dx + dy * dy) - radius;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.sqrt(dx * dx + dy * dy);
}

function sdTriangle(px, py, p0x, p0y, p1x, p1y, p2x, p2y) {
  const e0x = p1x - p0x, e0y = p1y - p0y;
  const e1x = p2x - p1x, e1y = p2y - p1y;
  const e2x = p0x - p2x, e2y = p0y - p2y;

  const v0x = px - p0x, v0y = py - p0y;
  const v1x = px - p1x, v1y = py - p1y;
  const v2x = px - p2x, v2y = py - p2y;

  const t0 = Math.max(0, Math.min(1, (v0x * e0x + v0y * e0y) / (e0x * e0x + e0y * e0y)));
  const t1 = Math.max(0, Math.min(1, (v1x * e1x + v1y * e1y) / (e1x * e1x + e1y * e1y)));
  const t2 = Math.max(0, Math.min(1, (v2x * e2x + v2y * e2y) / (e2x * e2x + e2y * e2y)));

  const pq0x = v0x - e0x * t0, pq0y = v0y - e0y * t0;
  const pq1x = v1x - e1x * t1, pq1y = v1y - e1y * t1;
  const pq2x = v2x - e2x * t2, pq2y = v2y - e2y * t2;

  const s = Math.sign(e0x * e2y - e0y * e2x);
  const d0 = pq0x * pq0x + pq0y * pq0y;
  const d1 = pq1x * pq1x + pq1y * pq1y;
  const d2 = pq2x * pq2x + pq2y * pq2y;

  const c0 = s * (v0x * e0y - v0y * e0x);
  const c1 = s * (v1x * e1y - v1y * e1x);
  const c2 = s * (v2x * e2y - v2y * e2x);

  const minD = Math.min(d0, d1, d2);
  const minC = Math.min(c0, c1, c2);
  return -Math.sqrt(minD) * Math.sign(minC);
}

function blendOver(base, fg, alpha) {
  return [
    base[0] * (1 - alpha) + fg[0] * alpha,
    base[1] * (1 - alpha) + fg[1] * alpha,
    base[2] * (1 - alpha) + fg[2] * alpha,
  ];
}

function cov(dist, pxSize) {
  return Math.max(0, Math.min(1, 0.5 - dist / pxSize));
}

function sampleIcon(nx, ny, size) {
  const pxSize = 1 / size;

  // Outer squircle matching panel dark graphite theme (#181a1f -> #111215)
  const pad = 0.05;
  const cornerR = 0.22;
  const bgDist = sdRoundRect(nx, ny, pad, pad, 1 - 2 * pad, 1 - 2 * pad, cornerR);
  const bgAlpha = cov(bgDist, pxSize);
  if (bgAlpha <= 0) {
    return [0, 0, 0, 0];
  }

  const gradT = Math.max(0, Math.min(1, ny));
  let rgb = [
    26 - gradT * 9, // 26 -> 17
    29 - gradT * 11, // 29 -> 18
    36 - gradT * 15, // 36 -> 21
  ];

  // Subtle top/edge hairline highlight inside squircle
  const borderDist = Math.abs(bgDist + pxSize * 0.8) - pxSize * 0.7;
  const borderCov = cov(borderDist, pxSize) * (ny < 0.5 ? 0.16 : 0.08);
  if (borderCov > 0) {
    rgb = blendOver(rgb, [243, 244, 246], borderCov);
  }

  // Left pane: YouTube video player card (#242832)
  const leftDist = sdRoundRect(nx, ny, 0.145, 0.22, 0.325, 0.56, 0.085);
  const leftCov = cov(leftDist, pxSize);
  if (leftCov > 0) {
    rgb = blendOver(rgb, [36, 40, 50], leftCov);
    // Subtle hairline on left card
    const leftEdge = cov(Math.abs(leftDist) - pxSize * 0.5, pxSize) * 0.12;
    if (leftEdge > 0) {
      rgb = blendOver(rgb, [255, 255, 255], leftEdge);
    }

    // Right-pointing YouTube play badge (#ef4444)
    const playDist = sdTriangle(nx, ny, 0.255, 0.39, 0.255, 0.61, 0.385, 0.50) - 0.012;
    const playCov = cov(playDist, pxSize) * leftCov;
    if (playCov > 0) {
      rgb = blendOver(rgb, [239, 68, 68], playCov);
    }
  }

  // Right pane: Clean Chord Side Panel card (#ffffff)
  const rightDist = sdRoundRect(nx, ny, 0.52, 0.22, 0.335, 0.56, 0.085);
  const rightCov = cov(rightDist, pxSize);
  if (rightCov > 0) {
    rgb = blendOver(rgb, [250, 251, 253], rightCov);

    // Top cobalt brand/chord pill (#2563eb)
    const pillDist = sdRoundRect(nx, ny, 0.565, 0.285, 0.245, 0.105, 0.032);
    const pillCov = cov(pillDist, pxSize) * rightCov;
    if (pillCov > 0) {
      rgb = blendOver(rgb, [37, 99, 235], pillCov);
    }

    // Line 1: chord tag + lyric bar
    const tag1Dist = sdRoundRect(nx, ny, 0.565, 0.445, 0.075, 0.042, 0.016);
    const tag1Cov = cov(tag1Dist, pxSize) * rightCov;
    if (tag1Cov > 0) {
      rgb = blendOver(rgb, [59, 130, 246], tag1Cov);
    }
    const line1Dist = sdSegment(nx, ny, 0.665, 0.466, 0.80, 0.466) - 0.019;
    const line1Cov = cov(line1Dist, pxSize) * rightCov;
    if (line1Cov > 0) {
      rgb = blendOver(rgb, [75, 85, 99], line1Cov);
    }

    // Line 2: lyric bar
    const line2Dist = sdSegment(nx, ny, 0.565, 0.568, 0.80, 0.568) - 0.019;
    const line2Cov = cov(line2Dist, pxSize) * rightCov;
    if (line2Cov > 0) {
      rgb = blendOver(rgb, [156, 163, 175], line2Cov);
    }

    // Line 3: chord tag + shorter lyric bar
    const tag3Dist = sdRoundRect(nx, ny, 0.565, 0.65, 0.09, 0.042, 0.016);
    const tag3Cov = cov(tag3Dist, pxSize) * rightCov;
    if (tag3Cov > 0) {
      rgb = blendOver(rgb, [59, 130, 246], tag3Cov);
    }
    const line3Dist = sdSegment(nx, ny, 0.68, 0.671, 0.775, 0.671) - 0.019;
    const line3Cov = cov(line3Dist, pxSize) * rightCov;
    if (line3Cov > 0) {
      rgb = blendOver(rgb, [156, 163, 175], line3Cov);
    }
  }

  return [rgb[0], rgb[1], rgb[2], bgAlpha * 255];
}

function renderIcon(x, y, size) {
  // 4x4 supersampling for crisp edges at 16px..128px
  const samples = 4;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let aSum = 0;

  for (let sy = 0; sy < samples; sy++) {
    for (let sx = 0; sx < samples; sx++) {
      const nx = (x + (sx + 0.5) / samples) / size;
      const ny = (y + (sy + 0.5) / samples) / size;
      const [r, g, b, a] = sampleIcon(nx, ny, size);
      const w = a / 255;
      rSum += r * w;
      gSum += g * w;
      bSum += b * w;
      aSum += a;
    }
  }

  const n = samples * samples;
  const avgA = aSum / n;
  if (avgA <= 0) return [0, 0, 0, 0];
  const invW = 255 / aSum;
  return [rSum * invW, gSum * invW, bSum * invW, avgA];
}

const sizes = [16, 32, 48, 128];
const outputDirs = [
  path.resolve(__dirname, "../icons"),
  path.resolve(__dirname, "../docs/icons"),
];

for (const dir of outputDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

for (const s of sizes) {
  const png = createPng(s, s, (x, y) => renderIcon(x, y, s));
  for (const dir of outputDirs) {
    const filePath = path.join(dir, `icon${s}.png`);
    fs.writeFileSync(filePath, png);
    console.log(`Generated ${filePath} (${s}x${s}, ${png.length} bytes)`);
  }
}

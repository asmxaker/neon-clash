// Генерация PNG-иконок без внешних зависимостей.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'www', 'icons');
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : clamp01(((px - ax) * dx + (py - ay) * dy) / len2);
  const x = ax + dx * t, y = ay + dy * t;
  return Math.hypot(px - x, py - y);
}

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const N = size;
  const slashes = [
    { ax: 0.235, ay: 0.235, bx: 0.765, by: 0.765, col: [53, 240, 255] },
    { ax: 0.765, ay: 0.235, bx: 0.235, by: 0.765, col: [255, 62, 165] }
  ];
  const sigma = N * 0.052;
  const core = N * 0.017;

  const stars = [];
  let s = 1234567;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = 0; i < 70; i++) stars.push([rnd(), rnd() * 0.62, 0.5 + rnd() * 1.4, rnd() * 0.5]);

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / N, v = y / N;
      const cx = u - 0.5, cy = v - 0.5;
      const d = Math.hypot(cx, cy);

      // фон
      let r = 7 + v * 15;
      let g = 3 + v * 7;
      let b = 20 + v * 34;

      // радиальное свечение
      const glow = Math.exp(-d * d / 0.16);
      r += 12 * glow; g += 4 * glow; b += 30 * glow;

      // звёзды
      for (const st of stars) {
        const sd = Math.hypot(u - st[0], v - st[1]) * N;
        if (sd < st[2] * 2.2) {
          const a = (1 - sd / (st[2] * 2.2)) * (0.3 + st[3]);
          r += 150 * a; g += 180 * a; b += 220 * a;
        }
      }

      // сетка
      if (Math.abs(((u * 10) % 1) - 0.5) > 0.487 || Math.abs(((v * 10) % 1) - 0.5) > 0.487) {
        r += 5; g += 6; b += 14;
      }

      // неоновые клинки
      for (const sl of slashes) {
        const dd = distToSegment(u, v, sl.ax, sl.ay, sl.bx, sl.by);
        const halo = Math.exp(-(dd * dd * N * N) / (2 * sigma * sigma));
        const coreA = 1 - smooth(core, core * 1.7, dd * N);
        r += sl.col[0] * (halo * 0.55 + coreA * 0.7);
        g += sl.col[1] * (halo * 0.55 + coreA * 0.7);
        b += sl.col[2] * (halo * 0.55 + coreA * 0.7);
        if (coreA > 0) {
          const w = coreA * 0.65;
          r += 255 * w; g += 255 * w; b += 255 * w;
        }
      }

      // виньетка
      const vig = smooth(0.34, 0.82, d);
      r *= 1 - vig * 0.55;
      g *= 1 - vig * 0.55;
      b *= 1 - vig * 0.55;

      const i = (y * N + x) * 4;
      rgba[i] = Math.min(255, Math.round(r));
      rgba[i + 1] = Math.min(255, Math.round(g));
      rgba[i + 2] = Math.min(255, Math.round(b));
      rgba[i + 3] = 255;
    }
  }

  return encodePNG(N, N, rgba);
}

for (const size of [192, 512, 1024]) {
  const file = join(outDir, `icon-${size}.png`);
  writeFileSync(file, drawIcon(size));
  console.log('wrote', file);
}

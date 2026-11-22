// Игровой цикл, раунды, HUD и вся сцена (неоновый город на крыше).

import { Fighter, drawFighter, GROUND_Y, ARENA, ATTACKS } from './fighter.js';
import { otherCharacter } from './characters.js';

const ATTACK_BY_KIND = Object.values(ATTACKS).reduce((map, a) => {
  map[a.kind] = a;
  return map;
}, {});
import { FX } from './fx.js';
import { audio } from './audio.js';

const W = 1280;
const H = 720;
const ROUND_TIME = 60;
const WINS_NEEDED = 2;
const TAU = Math.PI * 2;

const CYAN = '#35f0ff';
const CYAN_A = '#c9fbff';
const PINK = '#ff3ea5';
const PINK_A = '#ffd0e9';
const YELLOW = '#ffd23f';

function hexA(hex, a) {
  if (!hex || !hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

// Гость рендерит не последний снапшот, а точку между двумя последними.
// Это убирает рывки при неравномерной доставке пакетов (jitter buffer).
function blendSnapshots(a, b, alpha) {
  if (!a || !b || a === b) return b;
  if (a.rd !== b.rd || a.ph !== b.ph) return b;
  const out = { ...b };
  if (Array.isArray(a.f) && Array.isArray(b.f)) {
    out.f = b.f.map((d, i) => {
      const p = a.f[i];
      if (!p) return d;
      return { ...d, x: p.x + (d.x - p.x) * alpha, y: p.y + (d.y - p.y) * alpha };
    });
  }
  if (Array.isArray(a.p) && Array.isArray(b.p) && a.p.length === b.p.length) {
    out.p = b.p.map((d, i) => {
      const p = a.p[i];
      if (!p || p.k !== d.k || p.o !== d.o) return d;
      return { ...d, x: p.x + (d.x - p.x) * alpha, y: p.y + (d.y - p.y) * alpha };
    });
  }
  return out;
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rngSeed(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Фон: звёзды и три слоя города
// ---------------------------------------------------------------------------

const starRng = rngSeed(0xBADA55);
const STARS = Array.from({ length: 130 }, () => ({
  x: starRng() * W,
  y: starRng() * 430,
  r: 0.4 + starRng() * 1.5,
  a: 0.18 + starRng() * 0.6,
  p: starRng() * TAU
}));

function makeCity(seed, minW, maxW, minH, maxH, fill, winColor, signColors) {
  const r = rngSeed(seed);
  const list = [];
  let x = -70;
  while (x < W + 80) {
    const w = minW + r() * (maxW - minW);
    const h = minH + r() * (maxH - minH);
    const by = GROUND_Y - h;
    const windows = [];
    const cols = Math.max(1, Math.floor((w - 12) / 14));
    const rows = Math.max(1, Math.floor((h - 20) / 18));
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        if (r() < 0.24) {
          windows.push([x + 8 + cx * 14, by + 12 + cy * 18, 4.5, 6.5]);
        }
      }
    }
    let sign = null;
    if (signColors && r() < 0.16) {
      sign = {
        x: x + w * (0.18 + r() * 0.6),
        y: by + 24 + r() * Math.max(20, h * 0.45),
        w: 5 + r() * 7,
        h: 22 + r() * 58,
        color: signColors[(r() * signColors.length) | 0],
        phase: r() * TAU
      };
    }
    const antenna = r() < 0.22 ? { x: x + w * (0.2 + r() * 0.6), h: 12 + r() * 40 } : null;
    list.push({ x, y: by, w, h, windows, sign, antenna });
    x += w + 3 + r() * 17;
  }
  return { list, fill, winColor };
}

const CITY_FAR = makeCity(0x1111, 46, 110, 110, 280, '#180b34', 'rgba(83,190,255,0.30)', null);
const CITY_MID = makeCity(0x2222, 56, 126, 140, 340, '#100726', 'rgba(255,110,190,0.28)', null);
const CITY_NEAR = makeCity(0x3333, 66, 150, 160, 390, '#090417', 'rgba(255,210,110,0.30)', [CYAN, PINK, '#ffd23f', '#8b7bff']);

function drawCity(ctx, city) {
  ctx.fillStyle = city.fill;
  for (const b of city.list) ctx.fillRect(b.x, b.y, b.w, b.h);

  // крыши
  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  for (const b of city.list) ctx.fillRect(b.x, b.y, b.w, 1.5);

  // антенны
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (const b of city.list) {
    if (!b.antenna) continue;
    ctx.beginPath();
    ctx.moveTo(b.antenna.x, b.y);
    ctx.lineTo(b.antenna.x, b.y - b.antenna.h);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,90,120,0.7)';
    ctx.fillRect(b.antenna.x - 1.2, b.y - b.antenna.h - 2, 2.4, 2.4);
  }

  // окна
  ctx.fillStyle = city.winColor;
  for (const b of city.list) {
    for (const w of b.windows) ctx.fillRect(w[0], w[1], w[2], w[3]);
  }

  // неоновые вывески
  for (const b of city.list) {
    if (!b.sign) continue;
    const s = b.sign;
    const pulse = 0.65 + Math.sin(performance.now() / 900 + s.phase) * 0.15;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = hexA(s.color, 0.75 * pulse);
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillRect(s.x + s.w * 0.35, s.y + 3, Math.max(1, s.w * 0.3), s.h - 6);
    ctx.restore();
  }
}

function drawBackground(ctx, t) {
  // небо
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#04010a');
  sky.addColorStop(0.42, '#12062a');
  sky.addColorStop(0.78, '#2a0a3e');
  sky.addColorStop(1, '#3a0d44');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // звёзды
  for (const s of STARS) {
    const tw = 0.55 + Math.sin(t * 1.6 + s.p) * 0.45;
    ctx.fillStyle = `rgba(205,230,255,${s.a * tw})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, TAU);
    ctx.fill();
  }

  // планета
  const px = 1052;
  const py = 142;
  const pr = 66;
  ctx.save();
  const halo = ctx.createRadialGradient(px, py, pr * 0.7, px, py, pr * 2.4);
  halo.addColorStop(0, 'rgba(255,110,190,0.22)');
  halo.addColorStop(0.5, 'rgba(120,60,220,0.10)');
  halo.addColorStop(1, 'rgba(120,60,220,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(px - pr * 2.4, py - pr * 2.4, pr * 4.8, pr * 4.8);
  const body = ctx.createLinearGradient(px - pr, py - pr, px + pr, py + pr);
  body.addColorStop(0, '#2c1148');
  body.addColorStop(0.55, '#1a0a2f');
  body.addColorStop(1, '#3d1550');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,120,200,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // серп света
  ctx.beginPath();
  ctx.arc(px, py, pr - 2, -2.5, -0.15);
  ctx.strokeStyle = 'rgba(255,200,235,0.65)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // кольцо
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.35);
  ctx.beginPath();
  ctx.ellipse(0, 0, pr * 1.55, pr * 0.32, 0, 0, TAU);
  ctx.strokeStyle = 'rgba(53,240,255,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // город
  drawCity(ctx, CITY_FAR);
  drawCity(ctx, CITY_MID);

  // дымка
  const haze = ctx.createLinearGradient(0, 300, 0, GROUND_Y);
  haze.addColorStop(0, 'rgba(70,20,110,0)');
  haze.addColorStop(1, 'rgba(120,40,160,0.20)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 300, W, GROUND_Y - 300);

  drawCity(ctx, CITY_NEAR);

  // дождь (позади бойцов)
  ctx.save();
  ctx.strokeStyle = 'rgba(150,205,255,0.14)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const s = (i * 0.6180339887) % 1;
    const speed = 430 + s * 320;
    const y = ((t * speed + s * 900) % 760) - 60;
    const x = ((s * 1380 - t * 46) % 1380 + 1380) % 1380 - 60;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3.5, y + 16);
    ctx.stroke();
  }
  ctx.restore();

  // крыша
  const ground = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  ground.addColorStop(0, '#100826');
  ground.addColorStop(0.35, '#080318');
  ground.addColorStop(1, '#04010a');
  ctx.fillStyle = ground;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // перспективная сетка пола
  ctx.save();
  ctx.strokeStyle = 'rgba(120,140,255,0.075)';
  ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(640 + i * 170, GROUND_Y);
    ctx.lineTo(640 + i * 360, H);
    ctx.stroke();
  }
  const rows = [618, 640, 668, 702];
  for (const y of rows) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();

  // неоновая кромка крыши
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const edge = ctx.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, hexA(CYAN, 0.75));
  edge.addColorStop(0.5, '#b06bff');
  edge.addColorStop(1, hexA(PINK, 0.75));
  ctx.fillStyle = edge;
  ctx.fillRect(0, GROUND_Y - 1, W, 2);
  ctx.globalAlpha = 0.28;
  ctx.fillRect(0, GROUND_Y - 4, W, 7);
  ctx.globalAlpha = 1;
  ctx.restore();

  // блики на полу
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow1 = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  glow1.addColorStop(0, 'rgba(255,62,165,0.10)');
  glow1.addColorStop(1, 'rgba(255,62,165,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(760, GROUND_Y, 420, 116);
  const glow2 = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  glow2.addColorStop(0, 'rgba(53,240,255,0.10)');
  glow2.addColorStop(1, 'rgba(53,240,255,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(100, GROUND_Y, 420, 116);
  ctx.restore();
}

function drawEmbers(ctx, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const s = (i * 0.754877666) % 1;
    const speed = 14 + s * 26;
    const y = GROUND_Y + 60 - ((t * speed + s * 700) % 720);
    const x = (s * W + Math.sin(t * 0.8 + i) * 18) % W;
    const a = (0.16 + s * 0.25) * clamp((y - 80) / 560, 0, 1);
    const col = i % 3 === 0 ? PINK : i % 3 === 1 ? CYAN : '#c9a2ff';
    ctx.fillStyle = hexA(col, a);
    ctx.beginPath();
    ctx.arc(x, y, 1 + s * 1.8, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// HUD и текст
// ---------------------------------------------------------------------------

function setFont(ctx, size, italic = true) {
  ctx.font = `${italic ? 'italic ' : ''}900 ${size}px "Arial Black", "Segoe UI", system-ui, sans-serif`;
}

function banner(ctx, text, x, y, size, color, alpha, scale = 1, spacing = 0) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setFont(ctx, size);
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.shadowColor = color;
  ctx.shadowBlur = 34;
  ctx.fillStyle = color;
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function hexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + i * TAU / 6;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawHUD(ctx, game) {
  const [p1, p2] = game.fighters;
  if (!p1 || !p2) return;

  // ---- здоровье ----
  const barW = 452;
  const barH = 27;
  const y = 22;
  const left = 96;
  const right = W - 96;

  drawHealth(ctx, p1, left, y, barW, barH, false, p1.color, p1.accent);
  drawHealth(ctx, p2, right - barW, y, barW, barH, true, p2.color, p2.accent);

  // ---- энергия ----
  drawMeter(ctx, p1, left, y + barH + 6, barW, p1.color);
  drawMeter(ctx, p2, right - barW, y + barH + 6, barW, p2.color);

  // ---- имена ----
  ctx.save();
  ctx.textBaseline = 'middle';
  setFont(ctx, 16, false);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
  ctx.fillStyle = p1.color;
  ctx.shadowColor = p1.color;
  ctx.shadowBlur = 12;
  ctx.textAlign = 'left';
  ctx.fillText(p1.name, left + 2, 87);
  ctx.fillStyle = p2.color;
  ctx.shadowColor = p2.color;
  ctx.textAlign = 'right';
  ctx.fillText(p2.name, right - 2, 87);
  ctx.restore();

  // ---- раунды ----
  drawPips(ctx, left + 2, 104, game.wins[0], p1.color, false);
  drawPips(ctx, right - 2, 104, game.wins[1], p2.color, true);

  // ---- таймер ----
  const cx = W / 2;
  const cy = 44;
  const low = game.timer <= 10 && game.phase === 'fight';
  const pulse = low ? 0.65 + Math.sin(game.time * 12) * 0.35 : 1;

  ctx.save();
  hexPath(ctx, cx, cy, 45);
  ctx.fillStyle = 'rgba(4,1,10,0.9)';
  ctx.fill();
  ctx.strokeStyle = low ? `rgba(255,80,110,${0.55 + pulse * 0.4})` : 'rgba(210,230,255,0.32)';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  hexPath(ctx, cx, cy, 38);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const tsec = Math.ceil(game.timer);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setFont(ctx, 40);
  ctx.shadowColor = low ? '#ff4d6d' : '#9fd8ff';
  ctx.shadowBlur = 18;
  ctx.fillStyle = low ? '#ffd7df' : '#f2fbff';
  ctx.fillText(String(tsec).padStart(2, '0'), cx, cy + 2);
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setFont(ctx, 10, false);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ctx.fillStyle = 'rgba(190,205,245,0.55)';
  ctx.fillText(`РАУНД ${game.round}`, cx, 101);
  ctx.restore();

  // ---- серии ----
  drawCombo(ctx, p1, 300, 196, 'left');
  drawCombo(ctx, p2, 980, 196, 'right');
}

function drawHealth(ctx, f, x, y, w, h, flip, color, accent) {
  const skew = 14;
  const path = new Path2D();
  if (!flip) {
    path.moveTo(x, y);
    path.lineTo(x + w, y);
    path.lineTo(x + w - skew, y + h);
    path.lineTo(x, y + h);
  } else {
    path.moveTo(x + skew, y);
    path.lineTo(x + w, y);
    path.lineTo(x + w, y + h);
    path.lineTo(x, y + h);
  }
  path.closePath();

  ctx.save();
  ctx.fillStyle = 'rgba(3,1,9,0.82)';
  ctx.fill(path);

  ctx.save();
  ctx.clip(path);

  const frac = clamp(f.health / f.maxHealth, 0, 1);
  const ghost = clamp(f.displayHealth / f.maxHealth, 0, 1);

  // «призрак» урона
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  if (!flip) ctx.fillRect(x, y, w * ghost, h);
  else ctx.fillRect(x + w * (1 - ghost), y, w * ghost, h);

  // полоска здоровья
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, accent);
  g.addColorStop(0.42, color);
  g.addColorStop(1, hexA(color, 0.6));
  ctx.fillStyle = g;
  if (!flip) ctx.fillRect(x, y, w * frac, h);
  else ctx.fillRect(x + w * (1 - frac), y, w * frac, h);

  // блик
  const gloss = ctx.createLinearGradient(x, y, x, y + h * 0.55);
  gloss.addColorStop(0, 'rgba(255,255,255,0.35)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gloss;
  ctx.fillRect(x, y, w, h * 0.55);

  // «трещины» на низком здоровье
  if (frac < 0.3) {
    const a = 0.18 + Math.sin(performance.now() / 160) * 0.1;
    ctx.fillStyle = `rgba(255,50,80,${a})`;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();

  // рамка
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 5;
  ctx.stroke(path);
  ctx.strokeStyle = hexA(color, 0.65);
  ctx.lineWidth = 1.6;
  ctx.stroke(path);

  // сегменты
  ctx.strokeStyle = 'rgba(3,1,9,0.35)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 10; i++) {
    const sx = x + (w / 10) * i;
    ctx.beginPath();
    ctx.moveTo(sx, y + 1);
    ctx.lineTo(sx - skew * 0.35, y + h - 1);
    ctx.stroke();
  }
  ctx.restore();

  // свечение «спец готов»
  if (f.meter >= 50) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.5 + Math.sin(performance.now() / 260) * 0.5;
    ctx.fillStyle = hexA(YELLOW, 0.08 + pulse * 0.06);
    ctx.fillRect(flip ? x + w - 74 : x, y + h + 2, 74, 5);
    ctx.restore();
  }
}

function drawMeter(ctx, f, x, y, w, color) {
  const h = 6;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x, y, w, h);
  const frac = clamp(f.meter / 100, 0, 1);
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, hexA(color, 0.45));
  g.addColorStop(0.65, color);
  g.addColorStop(1, f.meter >= 50 ? YELLOW : color);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w * frac, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

  if (f.meter >= 50) {
    const pulse = 0.5 + Math.sin(performance.now() / 220) * 0.5;
    ctx.fillStyle = `rgba(255,210,63,${0.25 + pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(x + w * frac + 3, y + h / 2, 3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawPips(ctx, x, y, wins, color, flip) {
  ctx.save();
  for (let i = 0; i < WINS_NEEDED; i++) {
    const px = flip ? x - i * 20 : x + i * 20;
    const filled = i < wins;
    ctx.beginPath();
    ctx.moveTo(px, y - 5);
    ctx.lineTo(px + 5, y);
    ctx.lineTo(px, y + 5);
    ctx.lineTo(px - 5, y);
    ctx.closePath();
    if (filled) {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCombo(ctx, f, x, y, align) {
  if (f.combo < 2 || f.comboTimer <= 0) return;
  const a = clamp(f.comboTimer / 0.35, 0, 1);
  const grow = 1 + Math.max(0, 1.35 - f.comboTimer) * 0.35;
  const n = f.combo;
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word = (mod10 === 1 && mod100 !== 11) ? 'ХИТ'
    : (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) ? 'ХИТА'
    : 'ХИТОВ';
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y);
  ctx.scale(grow, grow);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  setFont(ctx, 30);
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = f.accent;
  ctx.fillText(`${n} ${word}`, 0, 0);
  ctx.shadowBlur = 0;
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(220,230,255,0.6)';
  ctx.fillText('СЕРИЯ', 0, 24);
  if (f.comboLabel && f.comboLabelT > 0) {
    ctx.font = '900 13px "Arial Black", system-ui, sans-serif';
    ctx.fillStyle = f.accent;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 10;
    ctx.fillText(`КОМБО «${f.comboLabel}»`, 0, 43);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Игра
// ---------------------------------------------------------------------------

export class Game {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.p1 = opts.p1;
    this.p2 = opts.p2;
    this.ai = opts.ai;
    this.onMatchEnd = opts.onMatchEnd || (() => {});

    this.fx = new FX();
    this.screen = 'menu';
    this.mode = '1p';
    this.phase = 'idle';
    this.phaseT = 0;
    this.round = 1;
    this.wins = [0, 0];
    this.timer = ROUND_TIME;
    this.time = 0;
    this.paused = false;
    this.slowmo = 0;
    this.projectiles = [];
    this.fighters = [];
    this.matchEnded = false;
    this.roundSounded = false;
    this.fightSounded = false;
    this.netGuest = false;
    this.netHost = false;
    this._snap = null;
    this._snapBuf = [];
    this._snapGap = 0.033;
    this.snapDelay = 0.12;
    this._netPrev = null;
    this.last = performance.now();
    this.dpr = 1;

    this.vignette = document.createElement('canvas');
    this.vignette.width = W;
    this.vignette.height = H;
    const vg = this.vignette.getContext('2d');
    const grad = vg.createRadialGradient(W / 2, H * 0.48, H * 0.28, W / 2, H * 0.48, H * 0.9);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0.62)');
    vg.fillStyle = grad;
    vg.fillRect(0, 0, W, H);

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    window.addEventListener('orientationchange', this.resize);
    this.resize();

    this.enterMenu();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = rect.width || window.innerWidth || W;
    const device = Math.min(2, window.devicePixelRatio || 1);
    // Не рендерим больше, чем нужно для чёткости на экране телефона.
    const scale = clamp((cssW * device) / W, 0.75, 1.6);
    this.dpr = scale;
    const w = Math.round(W * scale);
    const h = Math.round(H * scale);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      if (this.ctx) {
        this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
      }
    }
  }

  enterMenu() {
    this.screen = 'menu';
    this.phase = 'idle';
    this.paused = false;
    this.slowmo = 0;
    this.netGuest = false;
    this.netHost = false;
    this._snap = null;
    this._snapBuf = [];
    this._netPrev = null;
    this.projectiles = [];
    this.fx.clear();
    this.fighters = [
      new Fighter({ x: 388, facing: 1, charId: 'volt', index: 0 }),
      new Fighter({ x: 892, facing: -1, charId: 'blaze', index: 1 })
    ];
    this.fighters.forEach(f => { f.locked = true; f.animT = Math.random() * 8; });
  }

  startMatch(mode = '1p', p1CharId = 'volt', p2CharId = null) {
    this.mode = mode;
    this.netGuest = false;
    this.netHost = false;
    this._snap = null;
    this._snapBuf = [];
    this._netPrev = null;
    this.p1CharId = p1CharId;
    this.p2CharId = p2CharId || otherCharacter(p1CharId).id;
    this.screen = 'match';
    this.paused = false;
    this.matchEnded = false;
    this.wins = [0, 0];
    this.round = 1;
    this.projectiles = [];
    this.fx.clear();
    this.ai?.reset?.();
    const ctrl2 = mode === '1p' ? this.ai : this.p2;
    const mirror = this.p1CharId === this.p2CharId;
    this.fighters = [
      new Fighter({
        x: 408, facing: 1, charId: this.p1CharId, variant: 0,
        controller: this.p1, index: 0
      }),
      new Fighter({
        x: 872, facing: -1, charId: this.p2CharId, variant: mirror ? 1 : 0,
        controller: ctrl2, index: 1
      })
    ];
    this.startRound(true);
  }

  startGuestMatch(hostChar, guestChar) {
    const mirror = hostChar === guestChar;
    this.mode = 'link';
    this.netGuest = true;
    this.netHost = false;
    this.screen = 'match';
    this.paused = false;
    this.matchEnded = false;
    this.round = 1;
    this.wins = [0, 0];
    this.timer = ROUND_TIME;
    this.phase = 'intro';
    this.phaseT = 0;
    this.roundWinner = -1;
    this.roundReason = '';
    this.matchWinner = -1;
    this.slowmo = 0;
    this.projectiles = [];
    this.fx.clear();
    this._snap = null;
    this._snapBuf = [];
    this._snapGap = 0.033;
    this.snapDelay = 0.12;
    this._netPrev = null;
    this.p1CharId = hostChar;
    this.p2CharId = guestChar;
    this.fighters = [
      new Fighter({ x: 408, facing: 1, charId: hostChar, index: 0 }),
      new Fighter({ x: 872, facing: -1, charId: guestChar, variant: mirror ? 1 : 0, index: 1 })
    ];
    this.fighters.forEach(f => { f.locked = true; f.controller = null; });
  }

  receiveSnapshot(snap) {
    if (!this.netGuest || !snap || !Array.isArray(snap.f)) return;
    const now = performance.now();
    const buf = this._snapBuf;
    const last = buf[buf.length - 1];
    if (last) {
      const gap = clamp((now - last.t) / 1000, 0.008, 0.2);
      this._snapGap += (gap - this._snapGap) * 0.15;
      // Держим в буфере ~2.4 интервала доставки: этого хватает на дрожание сети,
      // но задержка остаётся небольшой.
      this.snapDelay = clamp(this._snapGap * 2.4, 0.09, 0.2);
    }
    buf.push({ s: snap, t: now });
    if (buf.length > 40) buf.shift();
    this._snap = snap;
  }

  applyNetSnapshot(s) {
    if (!s || !Array.isArray(s.f) || s.f.length < 2) return;
    const prev = this._netPrev;
    for (let i = 0; i < 2; i++) {
      const d = s.f[i];
      const f = this.fighters[i];
      if (!d || !f) continue;
      f.x = d.x;
      f.y = d.y;
      f.vy = d.vy;
      f.facing = d.fc;
      f.health = d.hp;
      f.maxHealth = d.mh;
      f.displayHealth = d.dh;
      f.meter = d.m;
      f.state = d.st;
      f.stateTime = d.stt;
      if (d.at) {
        const base = ATTACK_BY_KIND[d.at] || ATTACKS.punch;
        f.attack = {
          ...base,
          kind: d.at,
          startup: d.as || base.startup,
          active: d.aa || base.active,
          recovery: d.ar || base.recovery
        };
      } else {
        f.attack = null;
      }
      f.attackT = d.atT || 0;
      f.hitstun = d.hs || 0;
      f.blockstun = d.bs || 0;
      f.combo = d.c || 0;
      f.comboTimer = d.ct || 0;
      f.flash = d.fl || 0;
      f.koTime = d.kt || 0;
      f.winTime = d.wt || 0;
      f.comboLabel = d.cl || '';
      f.comboLabelT = d.clt || 0;
      f.wins = this.wins[i] || 0;
      f.locked = s.ph !== 'fight';
    }
    this.phase = s.ph;
    this.phaseT = s.pt || 0;
    this.timer = s.tm;
    this.round = s.rd;
    if (Array.isArray(s.w)) this.wins = s.w;
    this.roundWinner = s.rw;
    this.roundReason = s.rr;
    this.matchWinner = s.mw;

    this.projectiles = (s.p || []).map((p) => ({
      kind: p.k,
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      r: p.r,
      hitW: p.hw,
      hitH: p.hh,
      owner: p.o,
      life: p.life,
      delay: p.dl,
      struck: !!p.sk,
      strikeT: p.st,
      color: p.color,
      hitDir: p.hd,
      unblockable: !!p.ub
    }));

    if (prev) {
      for (let i = 0; i < 2; i++) {
        const f = this.fighters[i];
        const old = prev[i];
        if (old == null) continue;
        const drop = old - f.health;
        if (drop > 0.05) {
          const atk = this.fighters[1 - i];
          const y = GROUND_Y - f.y - f.getHurtHeight() * 0.6;
          if (f.state === 'block' || f.blockstun > 0) {
            this.fx.blockSpark(f.x, y, f.color);
            audio.block();
          } else {
            this.fx.hitSpark(f.x, y, atk.color, atk.facing, Math.min(1.6, 0.7 + drop / 12));
            this.fx.popup(f.x, GROUND_Y - f.y - f.getHurtHeight() - 14, `−${Math.round(drop)}`, atk.accent, 24 + Math.min(10, drop));
            this.fx.shakeIt(4 + drop * 0.5);
            audio.hit(0.7 + drop / 22);
          }
          if (old > 0 && f.health <= 0) {
            this.fx.screenFlash('#ff4de0', 0.4);
            this.fx.shakeIt(18);
            this.fx.dust(f.x, GROUND_Y, 16, f.color);
            audio.ko();
          }
        }
      }
    }
    this._netPrev = this.fighters.map((f) => f.health);

    if (this.phase === 'matchEnd' && !this.matchEnded) {
      this.matchEnded = true;
      this.onMatchEnd(this.matchWinner, 'link');
    }
  }

  startRound(resetMeter = false) {
    this.phase = 'intro';
    this.phaseT = 0;
    this.timer = ROUND_TIME;
    this.slowmo = 0;
    this.roundSounded = false;
    this.fightSounded = false;
    this.projectiles = [];
    this.fx.hitstop = 0;
    const pos = [
      [408, 1],
      [872, -1]
    ];
    this.fighters.forEach((f, i) => {
      f.resetForRound(pos[i][0], pos[i][1]);
      if (resetMeter) f.resetMeter();
      f.wins = this.wins[i];
      f.locked = true;
    });
    this.p1?.clearPresses?.();
    this.p2?.clearPresses?.();
    this.ai?.reset?.();
  }

  rematch() {
    this.startMatch(this.mode, this.p1CharId, this.p2CharId);
  }

  toMenu() {
    this.enterMenu();
  }

  setPaused(v) {
    if (this.screen !== 'match') return;
    this.paused = !!v;
    if (!this.paused) this.last = performance.now();
  }

  togglePause() {
    this.setPaused(!this.paused);
    return this.paused;
  }

  get inMatch() {
    return this.screen === 'match';
  }

  loop(now) {
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (!Number.isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 0.05);
    this.update(dt);
    this.render(now / 1000);
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (this.paused) {
      this.fx.update(dt * 0.1);
      return;
    }

    if (this.netGuest) {
      this.time += dt;
      this.fx.update(dt);
      for (const f of this.fighters) f.animT += dt;
      const buf = this._snapBuf;
      const now = performance.now();
      // Выбрасываем то, что уже никогда не понадобится для отрисовки.
      while (buf.length > 2 && now - buf[1].t > 600) buf.shift();
      if (!buf.length) return;
      const renderT = now - this.snapDelay * 1000;
      let i = buf.length - 1;
      while (i > 0 && buf[i].t > renderT) i--;
      const a = buf[i];
      const b = buf[Math.min(i + 1, buf.length - 1)];
      let snap = b.s;
      if (a !== b && b.t > a.t) {
        const alpha = clamp((renderT - a.t) / (b.t - a.t), 0, 1);
        snap = blendSnapshots(a.s, b.s, alpha);
      }
      this.applyNetSnapshot(snap);
      return;
    }

    this.time += dt;

    if (this.screen === 'menu') {
      for (const f of this.fighters) {
        f.animT += dt;
        f.stateTime += dt;
      }
      this.fx.update(dt);
      return;
    }

    if (this.fx.hitstop > 0) {
      this.fx.hitstop = Math.max(0, this.fx.hitstop - dt);
      this.fx.update(dt * 0.18);
      return;
    }

    this.fx.update(dt);
    this.phaseT += dt;

    const scale = this.slowmo > 0 ? 0.3 : 1;
    if (this.slowmo > 0) this.slowmo = Math.max(0, this.slowmo - dt);

    if (this.phase === 'intro') {
      if (!this.roundSounded && this.phaseT > 0.03) {
        this.roundSounded = true;
        audio.round();
      }
      if (!this.fightSounded && this.phaseT > 1.05) {
        this.fightSounded = true;
        audio.fight();
      }
      if (this.phaseT > 1.65) {
        this.phase = 'fight';
        this.phaseT = 0;
        this.fighters.forEach(f => { f.locked = false; });
        this.p1?.reset?.();
        this.p2?.reset?.();
      }
    } else if (this.phase === 'fight') {
      this.timer = Math.max(0, this.timer - dt);
      if (this.timer <= 0) this.timeUp();
    } else if (this.phase === 'roundEnd') {
      if (this.phaseT > 2.9) this.continueAfterRound();
    } else if (this.phase === 'matchEnd') {
      for (const f of this.fighters) f.update(dt * 0.5, this.fighters[1 - f.index], this);
      return;
    }

    const locked = this.phase !== 'fight';
    for (const f of this.fighters) f.locked = locked;

    this.updateFighters(dt * scale);
    if (this.phase === 'fight') {
      this.updateProjectiles(dt * scale);
      this.checkHits();
    } else {
      // снаряды тают, если раунд закончился
      this.projectiles.length = 0;
    }
  }

  updateFighters(dt) {
    const [a, b] = this.fighters;
    for (const f of this.fighters) {
      const foe = f.index === 0 ? b : a;
      f.update(dt, foe, this);
      if (f.landed) {
        f.landed = false;
        this.fx.dust(f.x, GROUND_Y, 7, f.color);
      }
      if (f.jumpDustArmed && f.y > 0.01) {
        f.jumpDustArmed = false;
        this.fx.dust(f.x, GROUND_Y, 8, f.color);
      }
    }

    // не даём бойцам полностью слипнуться (и разруливаем угол арены)
    if (a && b && a.state !== 'ko' && b.state !== 'ko' && Math.abs(a.y - b.y) < 120) {
      const dx = b.x - a.x;
      const adx = Math.abs(dx);
      const minGap = 66;
      if (adx < minGap) {
        const need = minGap - adx;
        const s = dx === 0 ? 1 : Math.sign(dx);
        a.x = clamp(a.x - need / 2 * s, ARENA.left, ARENA.right);
        b.x = clamp(b.x + need / 2 * s, ARENA.left, ARENA.right);

        const gap = Math.abs(b.x - a.x);
        if (gap < minGap) {
          const extra = minGap - gap;
          if (a.x <= ARENA.left + 1) {
            b.x = clamp(b.x + extra, ARENA.left, ARENA.right);
          } else if (b.x >= ARENA.right - 1) {
            a.x = clamp(a.x - extra, ARENA.left, ARENA.right);
          }
        }
      }
    }
  }

  hurtbox(f) {
    const h = f.getHurtHeight();
    return { x: f.x - 32, y: GROUND_Y - f.y - h, w: 64, h };
  }

  checkHits() {
    if (this.phase !== 'fight') return;
    for (let i = 0; i < 2; i++) {
      const atk = this.fighters[i];
      const def = this.fighters[1 - i];
      if (!atk || !def || def.health <= 0 || atk.state === 'ko') continue;
      if (atk.attackHit) continue;
      const box = atk.getAttackBox();
      if (!box) continue;
      if (overlap(box, this.hurtbox(def))) {
        atk.attackHit = true;
        this.resolveHit(atk, def, atk.attack);
        if (this.phase !== 'fight') return;
      }
    }
  }

  spawnProjectile(f) {
    const dir = f.facing;
    const attack = f.attack || ATTACKS.special;

    if (f.special === 'wave') {
      const x = f.x + dir * 74;
      const y = GROUND_Y - 52;
      this.projectiles.push({
        kind: 'wave',
        x, y,
        vx: dir * 640,
        r: 30,
        hitW: 80,
        hitH: 46,
        owner: f.index,
        life: 2.2,
        trailT: 0,
        born: this.time,
        color: f.color,
        attack
      });
      audio.shockwave();
      this.fx.ring(x, GROUND_Y - 10, f.color, 8, 100, 0.32, 5);
      this.fx.dust(x - dir * 20, GROUND_Y, 14, f.color);
      this.fx.shakeIt(8);
      return;
    }

    if (f.special === 'fan') {
      const x = f.x + dir * 58;
      const y = GROUND_Y - f.y - 126;
      for (const spread of [-1, 0, 1]) {
        this.projectiles.push({
          kind: 'shard',
          x, y,
          vx: dir * 760,
          vy: spread * 175,
          r: 11,
          hitW: 14,
          hitH: 16,
          owner: f.index,
          life: 1.8,
          trailT: 0,
          born: this.time,
          color: f.color,
          attack
        });
      }
      audio.shard();
      this.fx.ring(x, y, f.color, 6, 50, 0.24, 3);
      this.fx.shakeIt(3);
      return;
    }

    if (f.special === 'lightning') {
      const foe = this.fighters[1 - f.index];
      const x = clamp(foe ? foe.x : f.x + dir * 220, ARENA.left, ARENA.right);
      this.projectiles.push({
        kind: 'lightning',
        x,
        y: GROUND_Y - 160,
        vx: 0,
        vy: 0,
        r: 20,
        hitW: 46,
        hitH: 200,
        owner: f.index,
        life: 1.6,
        delay: 0.5,
        struck: false,
        strikeT: 0,
        hitDone: false,
        hitDir: x >= f.x ? 1 : -1,
        unblockable: true,
        born: this.time,
        color: f.color,
        attack
      });
      audio.specialCharge();
      this.fx.ring(x, GROUND_Y - 6, f.color, 8, 90, 0.35, 4);
      this.fx.dust(x, GROUND_Y, 6, f.color);
      this.fx.shakeIt(3);
      return;
    }

    const x = f.x + dir * 64;
    const y = GROUND_Y - f.y - 128;
    this.projectiles.push({
      kind: 'plasma',
      x, y,
      vx: dir * 780,
      vy: 0,
      r: 21,
      hitW: 16,
      hitH: 22,
      owner: f.index,
      life: 2.4,
      trailT: 0,
      born: this.time,
      color: f.color,
      attack
    });
    audio.fire();
    this.fx.ring(x, y, f.color, 8, 54, 0.25, 3);
    this.fx.shakeIt(4);
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (p.kind === 'lightning') {
        p.life -= dt;
        const def = this.fighters[1 - p.owner];
        if (!p.struck) {
          p.delay -= dt;
          if (Math.random() < 0.4) {
            this.fx.trail(p.x + (Math.random() * 2 - 1) * 44, GROUND_Y - Math.random() * 26, p.color);
          }
          if (p.delay <= 0) {
            p.struck = true;
            p.strikeT = 0;
            audio.thunder();
            this.fx.shakeIt(13);
            this.fx.screenFlash(p.color, 0.42);
            this.fx.ring(p.x, GROUND_Y - 4, p.color, 8, 150, 0.38, 6);
            this.fx.dust(p.x, GROUND_Y, 18, p.color);
          }
        } else {
          p.strikeT += dt;
          if (!p.hitDone && p.strikeT < 0.22 && def && def.health > 0 && def.state !== 'ko') {
            const hb = this.hurtbox(def);
            const hw = p.hitW;
            const hh = p.hitH;
            if (p.x + hw > hb.x && p.x - hw < hb.x + hb.w &&
                p.y + hh > hb.y && p.y - hh < hb.y + hb.h) {
              p.hitDone = true;
              this.resolveHit(this.fighters[p.owner], def, p.attack, p);
              if (this.phase !== 'fight') {
                this.projectiles.length = 0;
                return;
              }
            }
          }
        }
        if (p.life <= 0 || (p.struck && p.strikeT > 0.5)) {
          this.projectiles.splice(i, 1);
        }
        continue;
      }

      p.x += p.vx * dt;
      if (p.vy) p.y += p.vy * dt;
      p.life -= dt;
      p.trailT += dt;

      if (p.kind === 'wave') {
        if (p.trailT > 0.03) {
          p.trailT = 0;
          this.fx.trail(p.x - Math.sign(p.vx) * (20 + Math.random() * 20), GROUND_Y - 10 - Math.random() * 34, p.color);
        }
        this.fx.dust(p.x - Math.sign(p.vx) * 24, GROUND_Y, 1, p.color);
      } else if (p.kind === 'shard') {
        if (p.trailT > 0.035) {
          p.trailT = 0;
          this.fx.trail(p.x - Math.sign(p.vx) * 10, p.y + (Math.random() * 2 - 1) * 6, p.color);
        }
      } else if (p.trailT > 0.016) {
        p.trailT = 0;
        this.fx.trail(p.x - Math.sign(p.vx) * 12, p.y + (Math.random() * 2 - 1) * 8, p.color);
      }

      const owner = this.fighters[p.owner];
      const def = this.fighters[1 - p.owner];
      let remove = false;

      if (def && def.health > 0 && def.state !== 'ko') {
        const hb = this.hurtbox(def);
        const hw = p.hitW ?? p.r * 0.8;
        const hh = p.hitH ?? p.r;
        if (p.x + hw > hb.x && p.x - hw < hb.x + hb.w &&
            p.y + hh > hb.y && p.y - hh < hb.y + hb.h) {
          this.fx.ring(p.x, p.y, p.color || (owner ? owner.color : PINK), 10, p.kind === 'wave' ? 110 : 76, 0.3, 4);
          if (p.kind === 'wave') this.fx.dust(p.x, GROUND_Y, 12, p.color);
          if (p.kind === 'shard') this.fx.blockSpark(p.x, p.y, p.color);
          this.resolveHit(owner, def, p.attack || ATTACKS.special, p);
          remove = true;
          if (this.phase !== 'fight') {
            this.projectiles.length = 0;
            return;
          }
        }
      }

      if (remove || p.life <= 0 || p.x < -100 || p.x > W + 100 || p.y < -140 || p.y > H + 140) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  resolveHit(atk, def, a, projectile = null) {
    if (!atk || !def || def.health <= 0 || this.phase !== 'fight') return;

    const dir = projectile
      ? (projectile.hitDir ?? (Math.sign(projectile.vx) || 1))
      : (def.x >= atk.x ? 1 : -1);
    const facingThreat = projectile ? -dir : (atk.x >= def.x ? 1 : -1);
    const blocked = !(projectile && projectile.unblockable) && def.isBlocking() && def.facing === facingThreat;

    const cx = projectile ? projectile.x : (atk.x + def.x) / 2;
    const cy = projectile ? projectile.y : GROUND_Y - def.y - def.getHurtHeight() * 0.58;

    if (blocked) {
      const chip = Math.max(1, Math.round(a.damage * 0.12));
      def.health = Math.max(0, def.health - chip);
      def.blockstun = Math.max(def.blockstun, a.blockstun);
      def.kb = dir * a.kb * 0.32;
      def.setState('block');
      def.addMeter(4);
      atk.addMeter(3);
      atk.comboReady = false;
      atk.chain = [];
      atk.chainT = 0;
      this.fx.blockSpark(cx, cy, def.color);
      this.fx.shakeIt(3.5);
      this.fx.hitstop = 0.028;
      audio.block();
      if (def.health <= 0) this.ko(def, atk);
      return;
    }

    atk.combo = (atk.combo || 0) + 1;
    atk.comboTimer = 1.35;
    const scale = Math.max(0.55, 1 - (atk.combo - 1) * 0.085);
    const dmg = Math.max(1, Math.round(a.damage * scale));

    def.health = Math.max(0, def.health - dmg);
    def.flash = 1;
    def.attack = null;
    def.blockstun = 0;
    def.hitstun = a.hitstun;
    def.setState('hit');
    // Джаб почти не отталкивает — так проще попасть вторым ударом комбо.
    def.kb = dir * a.kb * (a.kind === 'punch' ? 0.78 : 1);
    def.addMeter(6);
    atk.addMeter(a.meterGain ?? 8);
    def.comboReady = false;
    def.chain = [];
    def.chainT = 0;
    def.attackBuffer = null;

    if (!projectile && (a.kind === 'punch' || a.kind === 'kick')) {
      atk.comboReady = true;
      atk.chainT = Math.max(atk.chainT, 0.7);
    }
    if (a.comboName) {
      atk.comboLabel = a.comboName;
      atk.comboLabelT = 1.5;
    }

    this.fx.hitSpark(cx, cy, atk.accent, dir, Math.min(1.7, 0.7 + dmg / 12));
    this.fx.popup(def.x, GROUND_Y - def.y - def.getHurtHeight() - 14, `−${dmg}`, atk.accent, 26 + Math.min(12, dmg));
    this.fx.shakeIt(5 + dmg * 0.7);
    this.fx.hitstop = 0.04 + dmg * 0.004;
    audio.hit(0.65 + dmg / 22);

    if (def.health <= 0) this.ko(def, atk);
  }

  ko(def, atk) {
    if (this.phase !== 'fight') return;
    def.health = 0;
    def.setState('ko');
    def.koTime = 0;
    def.attack = null;
    def.hitstun = 0;
    def.blockstun = 0;
    def.kb = (atk ? atk.facing : def.facing) * 560;
    def.vy = 430;
    def.y = Math.max(def.y, 1);
    this.fx.shakeIt(24);
    this.fx.screenFlash('#ff4de0', 0.45);
    this.fx.ring(def.x, GROUND_Y - 120, def.color, 20, 190, 0.5, 6);
    this.fx.dust(def.x, GROUND_Y, 22, def.color);
    this.slowmo = 0.8;
    audio.ko();
    this.endRound(atk ? atk.index : -1, 'ko');
  }

  timeUp() {
    if (this.phase !== 'fight') return;
    audio.timeout();
    const [a, b] = this.fighters;
    let winner = -1;
    if (a.health > b.health) winner = 0;
    else if (b.health > a.health) winner = 1;
    if (winner >= 0) {
      this.fighters[winner].setState('win');
    }
    this.endRound(winner, 'time');
  }

  endRound(winner, reason) {
    if (this.phase !== 'fight') return;
    this.phase = 'roundEnd';
    this.phaseT = 0;
    this.roundWinner = winner;
    this.roundReason = reason;
    this.projectiles.length = 0;
    if (winner >= 0) {
      this.wins[winner]++;
      this.fighters[winner].wins = this.wins[winner];
      this.fighters[winner].setState('win');
    }
  }

  continueAfterRound() {
    if (this.wins[0] >= WINS_NEEDED || this.wins[1] >= WINS_NEEDED) {
      this.phase = 'matchEnd';
      this.phaseT = 0;
      this.matchWinner = this.wins[0] >= WINS_NEEDED ? 0 : 1;
      if (!this.matchEnded) {
        this.matchEnded = true;
        audio.win();
        this.onMatchEnd(this.matchWinner, this.mode);
      }
    } else {
      this.round++;
      this.startRound(false);
    }
  }

  // -------------------------------------------------------------------------
  // Отрисовка
  // -------------------------------------------------------------------------

  render(now) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const t = this.time;

    ctx.save();
    ctx.translate(this.fx.shakeX, this.fx.shakeY);

    drawBackground(ctx, t);

    // отражения бойцов
    for (const f of this.fighters) drawReflection(ctx, f);

    const sorted = [...this.fighters].sort((a, b) => (a.state === 'ko' ? -1 : 1) - (b.state === 'ko' ? -1 : 1));
    for (const f of sorted) drawFighter(ctx, f);

    for (const p of this.projectiles) this.drawProjectile(ctx, p);

    this.fx.render(ctx);
    drawEmbers(ctx, t);

    ctx.restore();

    if (this.screen === 'match' && this.fighters.length === 2) {
      drawHUD(ctx, this);
      this.drawBanners(ctx);
    }

    drawLowHealth(ctx, this);
    ctx.drawImage(this.vignette, 0, 0, W, H);
    this.fx.renderFlash(ctx, W, H);
  }

  drawProjectile(ctx, p) {
    const owner = this.fighters[p.owner];
    const col = p.color || (owner ? owner.color : PINK);

    if (p.kind === 'shard') {
      const ang = Math.atan2(p.vy || 0, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-4, -7);
      ctx.lineTo(16, 0);
      ctx.lineTo(-4, 7);
      ctx.closePath();
      ctx.fillStyle = hexA(col, 0.16);
      ctx.fill();
      ctx.strokeStyle = hexA(col, 0.9);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(12, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(-14, 0);
      ctx.strokeStyle = hexA(col, 0.35);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (p.kind === 'lightning') {
      const strikeA = p.struck ? Math.max(0, 1 - p.strikeT / 0.5) : 0;
      const telegraph = p.struck ? 1 : clamp(1 - p.delay / 0.5, 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // руна на земле
      const runeR = 34 + telegraph * 10;
      ctx.beginPath();
      ctx.ellipse(p.x, GROUND_Y, runeR, runeR * 0.22, 0, 0, TAU);
      ctx.strokeStyle = hexA(col, 0.3 + telegraph * 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(p.x, GROUND_Y, runeR * 0.55, runeR * 0.13, 0, 0, TAU);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const a = this.time * 2 + i * TAU / 3;
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(a) * runeR, GROUND_Y + Math.sin(a) * runeR * 0.22);
        ctx.lineTo(p.x + Math.cos(a) * (runeR - 9), GROUND_Y + Math.sin(a) * (runeR - 9) * 0.22);
        ctx.strokeStyle = hexA(col, 0.4 + telegraph * 0.4);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (!p.struck) {
        // предупреждающий луч
        const beam = ctx.createLinearGradient(0, 120, 0, GROUND_Y);
        beam.addColorStop(0, hexA(col, 0));
        beam.addColorStop(1, hexA(col, 0.10 + telegraph * 0.12));
        ctx.fillStyle = beam;
        ctx.fillRect(p.x - 26, 120, 52, GROUND_Y - 120);
      } else {
        // вспышка и молния
        const boltTop = 70;
        const boltBottom = GROUND_Y - 4;
        const width = 12 * strikeA + 3;
        const segs = 7;
        const seed = Math.floor(this.time * 30);
        const pts = [];
        for (let i = 0; i <= segs; i++) {
          const y = boltTop + (boltBottom - boltTop) * (i / segs);
          const jitter = i === 0 || i === segs ? 0 : Math.sin(seed + i * 2.3) * (18 - i * 1.5);
          pts.push([p.x + jitter, y]);
        }
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.strokeStyle = hexA(col, 0.22 * strikeA);
        ctx.lineWidth = width * 4;
        ctx.stroke();
        ctx.strokeStyle = hexA(col, 0.8 * strikeA);
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.9 * strikeA})`;
        ctx.lineWidth = Math.max(1.5, width * 0.3);
        ctx.stroke();

        // ветви
        for (let i = 1; i < segs; i += 2) {
          const [x, y] = pts[i];
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 22 * Math.sin(seed + i), y + 26);
          ctx.strokeStyle = hexA(col, 0.55 * strikeA);
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // световой столб
        const beam = ctx.createLinearGradient(0, 60, 0, GROUND_Y);
        beam.addColorStop(0, hexA(col, 0));
        beam.addColorStop(0.5, hexA(col, 0.12 * strikeA));
        beam.addColorStop(1, hexA(col, 0.28 * strikeA));
        ctx.fillStyle = beam;
        ctx.fillRect(p.x - 40, 60, 80, GROUND_Y - 60);
      }
      ctx.restore();
      return;
    }

    if (p.kind === 'wave') {
      const dir = Math.sign(p.vx) || 1;
      const t = this.time;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(dir, 1);
      ctx.globalCompositeOperation = 'lighter';

      const g = ctx.createRadialGradient(0, 20, 2, 0, 20, 100);
      g.addColorStop(0, hexA(col, 0.45));
      g.addColorStop(0.5, hexA(col, 0.14));
      g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 26, 95, 52, 0, 0, TAU);
      ctx.fill();

      // гребень волны
      const crest = (offset, scale, alpha) => {
        ctx.beginPath();
        ctx.moveTo(-58 * scale, 48);
        ctx.quadraticCurveTo(-34 * scale, -8 * scale, -6 * scale, -50 * scale + offset);
        ctx.quadraticCurveTo(18 * scale, -18 * scale, 34 * scale, 6 * scale);
        ctx.quadraticCurveTo(48 * scale, 28 * scale, 58 * scale, 48);
        ctx.strokeStyle = hexA(col, alpha * 0.22);
        ctx.lineWidth = 18;
        ctx.stroke();
        ctx.strokeStyle = hexA(col, alpha);
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.7})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      };
      crest(0, 1, 0.9);
      crest(Math.sin(t * 18) * 6 - 8, 0.72, 0.45);

      // яркий фронт
      ctx.beginPath();
      ctx.moveTo(28, -6);
      ctx.quadraticCurveTo(48, 22, 58, 48);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // линия земли и камни
      ctx.beginPath();
      ctx.moveTo(-62, 48);
      ctx.lineTo(62, 48);
      ctx.strokeStyle = hexA(col, 0.5);
      ctx.lineWidth = 4;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const rx = -45 + i * 22 + Math.sin(t * 14 + i) * 5;
        const ry = 40 - Math.abs(Math.sin(t * 12 + i * 1.7)) * 22;
        ctx.beginPath();
        ctx.arc(rx, ry, 1.6 + (i % 2), 0, TAU);
        ctx.fillStyle = hexA(col, 0.5);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    const pulse = 1 + Math.sin((this.time - p.born) * 24) * 0.12;
    const r = p.r * pulse;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.8);
    g.addColorStop(0, 'rgba(255,255,255,0.98)');
    g.addColorStop(0.22, hexA(col, 0.95));
    g.addColorStop(0.55, hexA(col, 0.35));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 2.8, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 0.55, 0, TAU);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 4, 0, TAU);
    ctx.strokeStyle = hexA(col, 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();

    // хвост
    for (let i = 1; i <= 4; i++) {
      const tx = p.x - Math.sign(p.vx) * i * 15;
      ctx.beginPath();
      ctx.arc(tx, p.y + Math.sin(this.time * 24 + i) * 3, r * (0.6 - i * 0.11), 0, TAU);
      ctx.fillStyle = hexA(col, 0.24 - i * 0.045);
      ctx.fill();
    }
    ctx.restore();
  }

  drawBanners(ctx) {
    if (this.phase === 'intro') {
      const t = this.phaseT;
      if (t < 1.02) {
        const a = clamp(t / 0.18, 0, 1) * clamp((1.02 - t) / 0.2, 0, 1);
        const sc = 1.12 - clamp(t / 1.02, 0, 1) * 0.08;
        banner(ctx, `РАУНД ${this.round}`, W / 2, 298, 56, '#e9fbff', a, sc, 5);
      } else {
        const tt = t - 1.02;
        const a = clamp(tt / 0.08, 0, 1);
        banner(ctx, 'БОЙ!', W / 2, 300, 104, YELLOW, a, 1 + Math.sin(tt * 30) * 0.03, 4);
      }
    } else if (this.phase === 'fight' && this.phaseT < 0.38) {
      const a = 1 - this.phaseT / 0.38;
      banner(ctx, 'БОЙ!', W / 2, 300, 104, YELLOW, a, 1.08 - this.phaseT * 0.2, 4);
    } else if (this.phase === 'roundEnd') {
      const t = this.phaseT;
      if (t < 0.95) {
        const a = clamp(t / 0.12, 0, 1) * clamp((0.95 - t) / 0.25, 0, 1);
        if (this.roundReason === 'ko') {
          const glitch = Math.sin(t * 70) * 3;
          ctx.save();
          ctx.globalAlpha = a * 0.75;
          banner(ctx, 'K.O.', W / 2 + glitch, 300, 126, CYAN, 0.8, 1, 6);
          banner(ctx, 'K.O.', W / 2 - glitch, 300, 126, PINK, 0.8, 1, 6);
          ctx.restore();
          banner(ctx, 'K.O.', W / 2, 300, 126, '#ffffff', a, 1.06, 6);
        } else {
          banner(ctx, 'ВРЕМЯ', W / 2, 300, 84, YELLOW, a, 1, 6);
        }
      } else {
        const tt = t - 0.95;
        const a = clamp(tt / 0.2, 0, 1);
        if (this.roundWinner >= 0) {
          const f = this.fighters[this.roundWinner];
          banner(ctx, `${f.name} ПОБЕЖДАЕТ`, W / 2, 292, 46, f.accent, a, 1, 2);
          banner(ctx, 'РАУНД ВЫИГРАН', W / 2, 342, 18, f.color, a * 0.8, 1, 5);
        } else {
          banner(ctx, 'НИЧЬЯ', W / 2, 298, 64, '#cfd8ff', a, 1, 6);
        }
      }
    } else if (this.phase === 'matchEnd') {
      const w = this.fighters[this.matchWinner];
      const col = w ? w.accent : '#ffffff';
      const name = w ? w.name : '';
      banner(ctx, 'ПОБЕДА', W / 2, 270, 76 + Math.min(20, this.phaseT * 30), col, clamp(this.phaseT / 0.25, 0, 1), 1, 6);
      banner(ctx, name, W / 2, 344, 30, w ? w.color : '#ffffff', clamp((this.phaseT - 0.15) / 0.25, 0, 1), 1, 3);
    }
  }
}

function drawReflection(ctx, f) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(f.x, GROUND_Y + 8);
  ctx.scale(1, 0.22);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 96);
  g.addColorStop(0, hexA(f.color, 0.26));
  g.addColorStop(0.5, hexA(f.color, 0.08));
  g.addColorStop(1, hexA(f.color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawLowHealth(ctx, game) {
  if (game.screen !== 'match' || game.phase !== 'fight') return;
  const low = game.fighters.some(f => f.health > 0 && f.health < f.maxHealth * 0.25);
  if (!low) return;
  const pulse = 0.1 + (Math.sin(game.time * 7) * 0.5 + 0.5) * 0.14;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.82);
  g.addColorStop(0, 'rgba(255,0,50,0)');
  g.addColorStop(1, `rgba(255,20,60,${pulse})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

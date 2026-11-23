// Финальная сцена истории: герой уезжает на кабриолете в ретровейв-закат.

import { audio } from './audio.js';
import { t } from './i18n.js';

const W = 1280;
const H = 720;
const HORIZON = 462;

let active = null;

function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const starRng = makeRng(0x0CAB1E);
const STARS = Array.from({ length: 120 }, () => ({
  x: starRng() * W,
  y: starRng() * 360,
  r: 0.5 + starRng() * 1.6,
  a: 0.2 + starRng() * 0.6,
  p: starRng() * Math.PI * 2
}));

function drawSun(ctx, t) {
  const x = 962;
  const y = 328;
  const r = 148;

  ctx.save();
  const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.6);
  halo.addColorStop(0, 'rgba(255,110,150,0.42)');
  halo.addColorStop(0.45, 'rgba(255,80,150,0.16)');
  halo.addColorStop(1, 'rgba(255,80,150,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - r * 2.6, y - r * 2.6, r * 5.2, r * 5.2);

  const body = ctx.createLinearGradient(x, y - r, x, y + r);
  body.addColorStop(0, '#fff1a6');
  body.addColorStop(0.42, '#ffd35e');
  body.addColorStop(0.74, '#ff7a76');
  body.addColorStop(1, '#ff3f8e');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // ретровейв-полосы на солнце
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(43,8,58,0.62)';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(x - r, y + 34 + i * 17, r * 2, 4 + i * 0.5);
  }
  ctx.restore();
  ctx.restore();
}

function drawSky(ctx, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, '#080114');
  sky.addColorStop(0.42, '#2c0a44');
  sky.addColorStop(0.72, '#76195b');
  sky.addColorStop(0.9, '#d4476f');
  sky.addColorStop(1, '#ff9b68');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON);

  for (const s of STARS) {
    const tw = 0.55 + Math.sin(t * 1.8 + s.p) * 0.45;
    ctx.fillStyle = `rgba(255,220,255,${s.a * tw})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSun(ctx, t);

  // дальние горы
  ctx.beginPath();
  ctx.moveTo(0, HORIZON);
  const peaks = [[0, 438], [115, 392], [240, 430], [380, 376], [510, 428], [650, 390], [790, 430], [940, 382], [1080, 425], [1200, 398], [1280, 430]];
  for (const [x, y] of peaks) ctx.lineTo(x, y);
  ctx.lineTo(W, HORIZON);
  ctx.closePath();
  ctx.fillStyle = 'rgba(52,12,62,0.78)';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, HORIZON);
  const peaks2 = [[0, 452], [150, 430], [300, 454], [460, 426], [620, 452], [790, 430], [960, 456], [1130, 432], [1280, 454]];
  for (const [x, y] of peaks2) ctx.lineTo(x, y);
  ctx.lineTo(W, HORIZON);
  ctx.closePath();
  ctx.fillStyle = 'rgba(27,6,39,0.94)';
  ctx.fill();
}

function drawGrid(ctx, t) {
  const ground = ctx.createLinearGradient(0, HORIZON, 0, H);
  ground.addColorStop(0, '#2a0b3e');
  ground.addColorStop(0.35, '#12051f');
  ground.addColorStop(1, '#040108');
  ctx.fillStyle = ground;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  // дорога
  ctx.beginPath();
  ctx.moveTo(500, HORIZON);
  ctx.lineTo(780, HORIZON);
  ctx.lineTo(1020, H);
  ctx.lineTo(260, H);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8, 4, 16, 0.45)';
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // вертикальная сетка
  ctx.strokeStyle = 'rgba(255,70,190,0.18)';
  ctx.lineWidth = 1;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(640 + i * 18, HORIZON);
    ctx.lineTo(640 + i * 176, H);
    ctx.stroke();
  }

  // горизонтальная сетка, бегущая навстречу
  const phase = (t * 0.55) % 1;
  for (let i = 0; i < 20; i++) {
    const f = (i + phase) / 20;
    const y = HORIZON + Math.pow(f, 2.35) * (H - HORIZON);
    ctx.strokeStyle = `rgba(125,225,255,${0.05 + f * 0.18})`;
    ctx.lineWidth = 0.8 + f * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // светящаяся кромка горизонта
  const edge = ctx.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, 'rgba(53,240,255,0.5)');
  edge.addColorStop(0.5, 'rgba(255,70,190,0.8)');
  edge.addColorStop(1, 'rgba(255,180,90,0.5)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, HORIZON - 1, W, 2);
  ctx.globalAlpha = 0.25;
  ctx.fillRect(0, HORIZON - 5, W, 9);
  ctx.restore();
}

function drawPalm(ctx, x, baseY, scale, color) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -70, 8, -132);
  ctx.stroke();

  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i / 6) * Math.PI;
    const len = 48 + (i % 3) * 12;
    const ex = 8 + Math.cos(a) * len;
    const ey = -132 + Math.sin(a) * len * 0.45 - 6;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(8, -132);
    ctx.quadraticCurveTo(8 + Math.cos(a) * len * 0.5, -148 + Math.sin(a) * len * 0.25, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPalmLayers(ctx, t) {
  const scroll = t * 28;
  for (let i = 0; i < 5; i++) {
    const base = (i * 330 - scroll * (0.7 + i * 0.1)) % (W + 300);
    const x = ((base + W + 300) % (W + 300)) - 150;
    drawPalm(ctx, x, HORIZON + 18, 0.75 + (i % 2) * 0.18, 'rgba(23,4,34,0.94)');
  }
  for (let i = 0; i < 3; i++) {
    const x = 145 + i * 520 - ((t * 42) % (W + 500));
    const xx = ((x + W + 500) % (W + 500)) - 200;
    drawPalm(ctx, xx, HORIZON + 80, 1.55, 'rgba(12,2,22,0.98)');
  }
}

function drawWheel(ctx, x, y, r, spin, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#06030a';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.rotate(spin);
  ctx.strokeStyle = hex(color, 0.72);
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.72, 0);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
  ctx.strokeStyle = hex(color, 0.9);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function hex(color, alpha) {
  if (!color || !color.startsWith('#')) return color;
  const n = parseInt(color.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function drawHero(ctx, t, opts) {
  const color = opts.color || '#35f0ff';
  const accent = opts.accent || '#d8fbff';
  const longHair = opts.charId === 'mira' || opts.charId === 'nyx';

  // торс
  ctx.beginPath();
  ctx.moveTo(-34, -42);
  ctx.quadraticCurveTo(-40, -78, -20, -90);
  ctx.quadraticCurveTo(0, -98, 16, -88);
  ctx.quadraticCurveTo(30, -74, 26, -42);
  ctx.closePath();
  ctx.fillStyle = '#090512';
  ctx.fill();
  ctx.strokeStyle = hex(color, 0.72);
  ctx.lineWidth = 2;
  ctx.stroke();

  // рука к рулю
  ctx.beginPath();
  ctx.moveTo(14, -76);
  ctx.quadraticCurveTo(36, -68, 58, -54);
  ctx.strokeStyle = hex(accent, 0.75);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // голова
  const hx = -8;
  const hy = -112;
  ctx.beginPath();
  ctx.arc(hx, hy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#08040d';
  ctx.fill();
  ctx.strokeStyle = hex(color, 0.85);
  ctx.lineWidth = 2;
  ctx.stroke();
  // визор
  ctx.beginPath();
  ctx.moveTo(hx + 1, hy);
  ctx.lineTo(hx + 12, hy - 1);
  ctx.strokeStyle = hex(accent, 0.95);
  ctx.lineWidth = 3;
  ctx.stroke();

  // волосы/шарф, летящие назад
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < (longHair ? 7 : 4); i++) {
    const sway = Math.sin(t * 5.5 + i * 0.8) * 4;
    const len = (longHair ? 60 : 32) + i * 8;
    ctx.beginPath();
    ctx.moveTo(hx - 8, hy - 6 + i * 3);
    ctx.quadraticCurveTo(hx - 38 - i * 5, hy - 22 + sway, hx - len, hy - 6 + i * 4 + sway);
    ctx.strokeStyle = hex(i % 2 ? accent : color, 0.34 - i * 0.035);
    ctx.lineWidth = 5.5 - i * 0.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  // развевающийся шарф
  ctx.beginPath();
  ctx.moveTo(-18, -80);
  ctx.quadraticCurveTo(-50, -96 + Math.sin(t * 4) * 5, -92, -72 + Math.sin(t * 4 + 1) * 7);
  ctx.strokeStyle = hex(accent, 0.5);
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

function drawCar(ctx, t, opts) {
  const color = opts.color || '#35f0ff';
  const accent = opts.accent || '#d8fbff';
  const bob = Math.sin(t * 4.2) * 1.4;
  const x = 525 + Math.sin(t * 0.32) * 7;
  const y = H - 92 + bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.16, 1.16);

  // тень
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(0, 14, 190, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // неон под днищем
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(0, 6, 8, 0, 6, 150);
  glow.addColorStop(0, hex(color, 0.34));
  glow.addColorStop(1, hex(color, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 8, 160, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // скоростные линии позади
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const yy = -18 - i * 13;
    const len = 60 + i * 24 + Math.sin(t * 9 + i) * 12;
    ctx.beginPath();
    ctx.moveTo(-160 - len, yy);
    ctx.lineTo(-160, yy);
    ctx.strokeStyle = hex(accent, 0.1 + i * 0.025);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();

  // заднее колесо
  drawWheel(ctx, -92, 4, 29, t * 8.5, accent);
  // переднее колесо
  drawWheel(ctx, 96, 4, 29, t * 8.5 + 0.7, accent);

  // кузов
  ctx.beginPath();
  ctx.moveTo(-156, 0);
  ctx.lineTo(-156, -31);
  ctx.quadraticCurveTo(-142, -45, -108, -47);
  ctx.lineTo(-54, -49);
  ctx.lineTo(-24, -42);
  ctx.lineTo(22, -46);
  ctx.lineTo(54, -40);
  ctx.lineTo(138, -34);
  ctx.quadraticCurveTo(164, -26, 160, 0);
  ctx.closePath();
  ctx.fillStyle = '#0a0612';
  ctx.fill();
  ctx.strokeStyle = hex(color, 0.78);
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // неоновая полоса по кузову
  ctx.beginPath();
  ctx.moveTo(-148, -31);
  ctx.quadraticCurveTo(-110, -41, -62, -42);
  ctx.moveTo(56, -35);
  ctx.quadraticCurveTo(110, -32, 148, -24);
  ctx.strokeStyle = hex(accent, 0.75);
  ctx.lineWidth = 2;
  ctx.stroke();

  // салон
  ctx.beginPath();
  ctx.moveTo(-52, -47);
  ctx.lineTo(-24, -42);
  ctx.lineTo(12, -45);
  ctx.lineTo(24, -43);
  ctx.lineTo(44, -42);
  ctx.lineTo(28, -70);
  ctx.lineTo(-20, -72);
  ctx.closePath();
  ctx.fillStyle = '#05030a';
  ctx.fill();

  // герой в кабриолете
  ctx.save();
  ctx.translate(0, -42);
  drawHero(ctx, t, opts);
  ctx.restore();

  // лобовое стекло
  ctx.beginPath();
  ctx.moveTo(30, -43);
  ctx.lineTo(48, -82);
  ctx.strokeStyle = hex(accent, 0.8);
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(34, -47);
  ctx.lineTo(48, -78);
  ctx.lineTo(58, -74);
  ctx.lineTo(47, -44);
  ctx.closePath();
  ctx.fillStyle = hex(accent, 0.08);
  ctx.fill();

  // сиденье
  ctx.beginPath();
  ctx.moveTo(-42, -45);
  ctx.quadraticCurveTo(-44, -66, -26, -70);
  ctx.strokeStyle = hex(color, 0.35);
  ctx.lineWidth = 3;
  ctx.stroke();

  // фары
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const beam = ctx.createLinearGradient(146, -24, 310, -8);
  beam.addColorStop(0, 'rgba(255,245,190,0.38)');
  beam.addColorStop(1, 'rgba(255,225,130,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(145, -28);
  ctx.lineTo(330, -12);
  ctx.lineTo(330, 14);
  ctx.lineTo(145, -10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(146, -24, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff4c3';
  ctx.fill();
  ctx.restore();

  // задний фонарь
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = '#ff2050';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ff3564';
  ctx.fillRect(-158, -26, 5, 8);
  ctx.restore();

  ctx.restore();
}

function drawSpeedStreaks(ctx, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const s = (i * 0.6180339887) % 1;
    const y = 90 + s * 500;
    const speed = 380 + s * 520;
    const x = ((W + 200 - ((t * speed + s * 900) % (W + 400))) % (W + 400)) - 200;
    ctx.strokeStyle = `rgba(255,205,235,${0.035 + s * 0.07})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 40 + s * 60, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawScene(ctx, time, opts) {
  const t = time;
  drawSky(ctx, t);
  drawSpeedStreaks(ctx, t);
  drawPalmLayers(ctx, t);
  drawGrid(ctx, t);
  drawCar(ctx, t, opts);
}

function draw(ctx, elapsed, duration, opts) {
  const t = elapsed;
  ctx.clearRect(0, 0, W, H);
  drawScene(ctx, t, opts);

  if (t < 0.7) {
    ctx.fillStyle = `rgba(2,0,8,${1 - t / 0.7})`;
    ctx.fillRect(0, 0, W, H);
  }
  const outStart = duration / 1000 - 1.5;
  if (t > outStart) {
    ctx.fillStyle = `rgba(2,0,8,${Math.min(1, (t - outStart) / 1.5)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

export function playEnding(opts = {}) {
  if (active) active.finish();
  return new Promise((resolve) => {
    const overlay = document.getElementById('ending');
    const canvas = document.getElementById('endingCanvas');
    if (!overlay || !canvas) { resolve(); return; }
    const ctx = canvas.getContext('2d');
    const sub = document.getElementById('endingSub');
    const skip = document.getElementById('endingSkip');
    const duration = opts.duration || 9000;

    if (sub) sub.textContent = t('ending.sub', { name: opts.charName || '' });
    overlay.classList.remove('hidden', 'show-copy');
    overlay.setAttribute('aria-hidden', 'false');
    audio.setMusic('ending');

    const start = performance.now();
    let raf = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      overlay.classList.add('hidden');
      overlay.classList.remove('show-copy');
      overlay.setAttribute('aria-hidden', 'true');
      if (skip) skip.onclick = null;
      if (active && active.finish === finish) active = null;
      resolve();
    };

    active = { finish };
    if (skip) skip.onclick = finish;

    const loop = (now) => {
      if (done) return;
      const elapsed = (now - start) / 1000;
      draw(ctx, elapsed, duration, opts);
      if (elapsed > 0.7) overlay.classList.add('show-copy');
      if (elapsed * 1000 >= duration) {
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  });
}

// Частицы, кольца, всплывающий урон, тряска экрана и хитстоп.

const TAU = Math.PI * 2;

function rgba(hex, a) {
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }
  return hex;
}

export class FX {
  constructor() {
    this.parts = [];
    this.rings = [];
    this.popups = [];
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.flash = 0;
    this.flashColor = '#ffffff';
    this.hitstop = 0;
    this.time = 0;
  }

  clear() {
    this.parts.length = 0;
    this.rings.length = 0;
    this.popups.length = 0;
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.flash = 0;
    this.hitstop = 0;
  }

  shakeIt(amount) {
    this.shake = Math.min(34, Math.max(this.shake, amount));
  }

  screenFlash(color = '#ffffff', amount = 0.6) {
    this.flashColor = color;
    this.flash = Math.max(this.flash, amount);
  }

  hitSpark(x, y, color, dir = 1, power = 1) {
    const count = Math.floor(14 + power * 10);
    for (let i = 0; i < count; i++) {
      const a = (Math.random() * 2 - 1) * 1.1 + (dir > 0 ? 0 : Math.PI);
      const sp = 180 + Math.random() * 520 * power;
      const life = 0.16 + Math.random() * 0.3;
      this.parts.push({
        type: 'spark',
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 80,
        life, max: life,
        len: 8 + Math.random() * 18,
        color,
        grav: 900,
        drag: 2.4,
        w: 1.5 + Math.random() * 2.2
      });
    }
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * TAU;
      const sp = 60 + Math.random() * 200;
      const life = 0.35 + Math.random() * 0.3;
      this.parts.push({
        type: 'dot',
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life, max: life,
        r: 2 + Math.random() * 4,
        color,
        grav: 120,
        drag: 3.2
      });
    }
    this.ring(x, y, color, 8, 62 + power * 26, 0.26, 4);
    this.ring(x, y, '#ffffff', 2, 32 + power * 12, 0.16, 2.5);
  }

  blockSpark(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.5;
      const sp = 120 + Math.random() * 260;
      const life = 0.14 + Math.random() * 0.22;
      this.parts.push({
        type: 'spark',
        x, y,
        vx: Math.cos(a) * sp * (Math.random() < 0.5 ? 1 : -1),
        vy: Math.sin(a) * sp,
        life, max: life,
        len: 6 + Math.random() * 14,
        color,
        grav: 500,
        drag: 2.6,
        w: 1.2 + Math.random() * 1.6
      });
    }
    this.ring(x, y, color, 6, 48, 0.22, 3);
  }

  dust(x, y, count = 8, color = '#8b7bff') {
    for (let i = 0; i < count; i++) {
      const a = Math.PI + (Math.random() * 2 - 1) * 1.2;
      const sp = 40 + Math.random() * 190;
      const life = 0.3 + Math.random() * 0.4;
      this.parts.push({
        type: 'dot',
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp * 0.4 - 40,
        life, max: life,
        r: 2 + Math.random() * 6,
        color,
        grav: -30,
        drag: 2.2
      });
    }
  }

  trail(x, y, color) {
    this.parts.push({
      type: 'dot',
      x, y,
      vx: (Math.random() * 2 - 1) * 40,
      vy: (Math.random() * 2 - 1) * 40,
      life: 0.2 + Math.random() * 0.2,
      max: 0.4,
      r: 2 + Math.random() * 3,
      color,
      grav: 0,
      drag: 1.5
    });
  }

  ring(x, y, color, r0, r1, life, width = 3) {
    this.rings.push({ x, y, color, r0, r1, life, max: life, w: width });
  }

  popup(x, y, text, color, size = 30) {
    this.popups.push({ x, y, text, color, size, life: 0.8, max: 0.8, vy: -95, vx: (Math.random() * 2 - 1) * 20 });
  }

  update(dt) {
    this.time += dt;

    if (this.hitstop > 0) this.hitstop = Math.max(0, this.hitstop - dt);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.6);
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 46);
      this.shakeX = (Math.random() * 2 - 1) * this.shake;
      this.shakeY = (Math.random() * 2 - 1) * this.shake * 0.7;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    const ps = this.parts;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt;
      if (p.life <= 0) { ps.splice(i, 1); continue; }
      const d = Math.exp(-(p.drag || 0) * dt);
      p.vx *= d;
      p.vy *= d;
      p.vy += (p.grav || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === 'spark' && p.y > 604) { p.y = 604; p.vy *= -0.35; p.vx *= 0.6; }
    }
    if (ps.length > 420) ps.splice(0, ps.length - 420);

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) this.rings.splice(i, 1);
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt;
      if (p.life <= 0) { this.popups.splice(i, 1); continue; }
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      p.vy *= Math.exp(-1.8 * dt);
    }
  }

  render(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const r of this.rings) {
      const t = 1 - r.life / r.max;
      const rad = r.r0 + (r.r1 - r.r0) * (1 - Math.pow(1 - t, 2.4));
      const a = (1 - t) * 0.8;
      ctx.beginPath();
      ctx.arc(r.x, r.y, rad, 0, TAU);
      ctx.strokeStyle = rgba(r.color, a * 0.32);
      ctx.lineWidth = r.w * 3;
      ctx.stroke();
      ctx.strokeStyle = rgba(r.color, a);
      ctx.lineWidth = r.w;
      ctx.stroke();
      ctx.strokeStyle = rgba('#ffffff', a * 0.75);
      ctx.lineWidth = Math.max(1, r.w * 0.38);
      ctx.stroke();
    }

    for (const p of this.parts) {
      const a = Math.min(1, p.life / p.max);
      if (p.type === 'spark') {
        const k = p.len / (Math.hypot(p.vx, p.vy) + 1);
        const x2 = p.x - p.vx * k;
        const y2 = p.y - p.vy * k;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = rgba(p.color, a * 0.35);
        ctx.lineWidth = p.w * 2.8;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.strokeStyle = rgba(p.color, a * 0.95);
        ctx.lineWidth = p.w;
        ctx.stroke();
        ctx.strokeStyle = rgba('#ffffff', a * 0.8);
        ctx.lineWidth = Math.max(0.7, p.w * 0.35);
        ctx.stroke();
      } else {
        const r = p.r * (0.6 + a * 0.7);
        ctx.fillStyle = rgba(p.color, a * 0.14);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.6, 0, TAU);
        ctx.fill();
        ctx.fillStyle = rgba(p.color, a * 0.6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 1.25, 0, TAU);
        ctx.fill();
        ctx.fillStyle = rgba('#ffffff', a * 0.85);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.7, r * 0.4), 0, TAU);
        ctx.fill();
      }
    }

    ctx.restore();

    for (const p of this.popups) {
      const a = Math.min(1, p.life / p.max * 1.8);
      const scale = 1 + Math.max(0, (1 - p.life / p.max) * 0.15);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(scale, scale);
      ctx.font = `900 italic ${p.size}px "Arial Black", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = rgba('#05020c', a * 0.9);
      ctx.strokeText(p.text, 0, 0);
      ctx.fillStyle = rgba(p.color, a);
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
  }

  renderFlash(ctx, w, h) {
    if (this.flash <= 0) return;
    ctx.save();
    ctx.fillStyle = rgba(this.flashColor, Math.min(0.75, this.flash));
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

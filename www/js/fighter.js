// Боец: физика, состояния, удары и процедурная неоновая отрисовка.

import { audio } from './audio.js';

export const GROUND_Y = 604;
export const ARENA = { left: 112, right: 1168 };

const GRAVITY = 3150;
const WALK_SPEED = 330;
const AIR_SPEED = 245;
const JUMP_V = 1140;
const BODY_HALF = 32;
const STAND_H = 196;
const CROUCH_H = 120;
const TAU = Math.PI * 2;

export const ATTACKS = {
  punch: {
    kind: 'punch', startup: 0.07, active: 0.06, recovery: 0.16,
    damage: 7, reach: 102, y0: 128, y1: 192, kb: 300,
    hitstun: 0.24, blockstun: 0.15, meterGain: 8
  },
  kick: {
    kind: 'kick', startup: 0.13, active: 0.08, recovery: 0.27,
    damage: 12, reach: 142, y0: 38, y1: 118, kb: 450,
    hitstun: 0.36, blockstun: 0.22, meterGain: 11
  },
  airkick: {
    kind: 'airkick', startup: 0.055, active: 0.14, recovery: 0.07,
    damage: 9, reach: 112, y0: -12, y1: 118, kb: 340,
    hitstun: 0.3, blockstun: 0.17, meterGain: 9, air: true
  },
  special: {
    kind: 'special', startup: 0.23, active: 0.06, recovery: 0.36,
    projectile: true, cost: 50, damage: 15, y0: 96, y1: 160, kb: 460,
    hitstun: 0.38, blockstun: 0.26, meterGain: 0
  }
};

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

function hexA(hex, a) {
  if (!hex || !hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export class Fighter {
  constructor({ x = 380, facing = 1, color = '#35f0ff', accent = '#bffaff', name = 'БОЕЦ', controller = null, index = 0 } = {}) {
    this.index = index;
    this.color = color;
    this.accent = accent;
    this.name = name;
    this.controller = controller;
    this.phase = Math.random() * TAU;
    this.animT = Math.random() * 10;
    this.meter = 0;
    this.wins = 0;
    this.x = x;
    this.facing = facing;
    this.locked = true;
    this.health = 100;
    this.displayHealth = 100;
    this.state = 'idle';
    this.stateTime = 0;
    this.attack = null;
    this.attackT = 0;
    this.attackHit = false;
    this.fired = false;
    this.hitstun = 0;
    this.blockstun = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.flash = 0;
    this.y = 0;
    this.vy = 0;
    this.kb = 0;
    this.walkPhase = 0;
    this.walkDir = 1;
    this.airAttackUsed = false;
    this.koTime = 0;
    this.winTime = 0;
    this.landed = false;
    this.jumpDustArmed = false;
  }

  resetForRound(x, facing) {
    this.x = x;
    this.facing = facing;
    this.health = 100;
    this.displayHealth = 100;
    this.y = 0;
    this.vy = 0;
    this.kb = 0;
    this.state = 'idle';
    this.stateTime = 0;
    this.attack = null;
    this.attackT = 0;
    this.attackHit = false;
    this.fired = false;
    this.hitstun = 0;
    this.blockstun = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.flash = 0;
    this.airAttackUsed = false;
    this.koTime = 0;
    this.winTime = 0;
    this.landed = false;
    this.locked = true;
  }

  resetMeter() {
    this.meter = 0;
  }

  setState(s) {
    if (this.state === s) return;
    this.state = s;
    this.stateTime = 0;
  }

  addMeter(v) {
    this.meter = clamp(this.meter + v, 0, 100);
  }

  isBlocking() {
    return this.state === 'block' && this.y <= 0;
  }

  isCrouching() {
    return this.state === 'crouch';
  }

  getHurtHeight() {
    return this.isCrouching() ? CROUCH_H : STAND_H;
  }

  getAttackBox() {
    const a = this.attack;
    if (!a || a.projectile) return null;
    if (this.attackT < a.startup - 1e-6) return null;
    if (this.attackT > a.startup + a.active + 1e-6) return null;
    const from = this.x + this.facing * 12;
    const to = this.x + this.facing * (12 + a.reach);
    const top = GROUND_Y - this.y - a.y1;
    return {
      x: Math.min(from, to),
      y: top,
      w: Math.abs(to - from),
      h: a.y1 - a.y0
    };
  }

  startAttack(kind) {
    const a = ATTACKS[kind];
    if (!a) return false;
    if (a.projectile) {
      if (this.meter < a.cost) return false;
      this.meter -= a.cost;
    }
    this.attack = a;
    this.attackT = 0;
    this.attackHit = false;
    this.fired = false;
    this.setState('attack');
    if (a.air) this.airAttackUsed = true;
    this.kb *= 0.35;
    if (kind === 'special') audio.specialCharge();
    else audio.whiff();
    return true;
  }

  update(dt, foe, game) {
    this.animT += dt;
    this.stateTime += dt;
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer <= 0) this.combo = 0;
    this.flash = Math.max(0, this.flash - dt * 5);
    this.displayHealth += (this.health - this.displayHealth) * Math.min(1, dt * 7);
    if (Math.abs(this.displayHealth - this.health) < 0.03) this.displayHealth = this.health;

    if (this.controller?.updateAI) {
      this.controller.updateAI(dt, this, foe, game);
    }

    if (this.state === 'ko') {
      this.koTime += dt;
      this.applyPhysics(dt);
      return;
    }
    if (this.state === 'win') {
      this.winTime += dt;
      this.applyPhysics(dt);
      return;
    }

    if (this.hitstun > 0) {
      this.hitstun -= dt;
      this.applyPhysics(dt);
      if (this.hitstun <= 0 && this.y <= 0 && this.state === 'hit') this.setState('idle');
      return;
    }

    if (this.blockstun > 0) {
      this.blockstun -= dt;
      this.applyPhysics(dt);
      if (this.blockstun <= 0) this.setState('idle');
      return;
    }

    if (this.attack) {
      const a = this.attack;
      const prev = this.attackT;
      this.attackT += dt;
      if (a.projectile && !this.fired && prev < a.startup && this.attackT >= a.startup) {
        this.fired = true;
        if (game?.spawnProjectile) game.spawnProjectile(this);
      }
      const total = a.startup + a.active + a.recovery;
      this.applyPhysics(dt);
      if (this.attackT >= total) {
        this.attack = null;
        this.setState(this.y > 0 ? 'jump' : 'idle');
      }
      return;
    }

    const c = this.controller;
    if (!c || this.locked) {
      this.setState(this.y > 0 ? 'jump' : 'idle');
      this.applyPhysics(dt);
      return;
    }

    if (this.y <= 0) {
      if (c.isDown('block')) {
        this.setState('block');
        this.faceFoe(foe);
        this.applyPhysics(dt);
        return;
      }

      const dir = (c.isDown('right') ? 1 : 0) - (c.isDown('left') ? 1 : 0);
      if (c.isDown('down')) {
        this.setState('crouch');
      } else if (dir) {
        this.walkDir = dir;
        this.walkPhase += dt * 10.5;
        this.x += dir * WALK_SPEED * dt;
        this.setState('walk');
      } else {
        this.setState('idle');
      }

      if (c.consume('up')) {
        this.vy = JUMP_V;
        this.y = 0.01;
        this.airAttackUsed = false;
        this.jumpDustArmed = true;
        this.setState('jump');
        audio.jump();
      }
    } else {
      const dir = (c.isDown('right') ? 1 : 0) - (c.isDown('left') ? 1 : 0);
      if (dir) this.x += dir * AIR_SPEED * dt;
      if (this.state !== 'jump') this.setState('jump');
    }

    this.faceFoe(foe);

    const punch = c.consume('punch');
    const kick = c.consume('kick');
    const special = c.consume('special');

    if (special && this.y <= 0 && this.meter >= ATTACKS.special.cost) {
      this.startAttack('special');
    } else if (this.y > 0) {
      if ((punch || kick) && !this.airAttackUsed) this.startAttack('airkick');
    } else if (kick) {
      this.startAttack('kick');
    } else if (punch) {
      this.startAttack('punch');
    }

    this.applyPhysics(dt);
    this.x = clamp(this.x, ARENA.left, ARENA.right);
  }

  faceFoe(foe) {
    if (!foe) return;
    if (this.y <= 0 && !this.attack) {
      const dir = foe.x >= this.x ? 1 : -1;
      if (dir !== this.facing) this.facing = dir;
    }
  }

  applyPhysics(dt) {
    const wasAir = this.y > 0.5;
    if (this.y > 0 || this.vy !== 0) {
      this.vy -= GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        if (wasAir) this.landed = true;
        if (this.attack?.air) {
          this.attack = null;
          this.setState('idle');
        } else if (this.state === 'jump') {
          this.setState('idle');
        }
      }
    }

    if (this.kb !== 0) {
      this.x += this.kb * dt;
      this.kb *= Math.exp(-7.2 * dt);
      if (Math.abs(this.kb) < 4) this.kb = 0;
    }
    this.x = clamp(this.x, ARENA.left, ARENA.right);
  }
}

// ---------------------------------------------------------------------------
// Отрисовка
// ---------------------------------------------------------------------------

function limb(ctx, pts, color, width, alpha = 1) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = hexA(color, 0.10 * alpha);
  ctx.lineWidth = width * 3;
  ctx.stroke();
  ctx.strokeStyle = hexA(color, 0.4 * alpha);
  ctx.lineWidth = width * 1.75;
  ctx.stroke();
  ctx.strokeStyle = hexA(color, 0.98 * alpha);
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.strokeStyle = `rgba(255,255,255,${0.5 * alpha})`;
  ctx.lineWidth = Math.max(1, width * 0.3);
  ctx.stroke();
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerp2(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }

function buildPose(f) {
  const t = f.animT;
  const breath = Math.sin(t * 2.7 + f.phase) * 2.2;

  const p = {
    hip: [0, -94],
    chest: [0, -142],
    neck: [0, -160],
    head: [0, -181],
    shF: [8, -146],
    shB: [-8, -146],
    elF: [32, -128],
    haF: [30, -156],
    elB: [-32, -128],
    haB: [-16, -150],
    hipF: [9, -92],
    hipB: [-9, -92],
    knF: [22, -50],
    ftF: [26, -2],
    knB: [-20, -50],
    ftB: [-26, -2]
  };

  const upper = (dx, dy) => {
    p.chest[0] += dx; p.chest[1] += dy;
    p.neck[0] += dx; p.neck[1] += dy;
    p.head[0] += dx; p.head[1] += dy;
    p.shF[0] += dx; p.shF[1] += dy;
    p.shB[0] += dx; p.shB[1] += dy;
    p.elF[0] += dx; p.elF[1] += dy;
    p.haF[0] += dx; p.haF[1] += dy;
    p.elB[0] += dx; p.elB[1] += dy;
    p.haB[0] += dx; p.haB[1] += dy;
  };

  upper(0, breath * 0.55);
  p.haF[1] += Math.sin(t * 3.4 + f.phase) * 1.4;

  const st = f.state;

  if (st === 'walk') {
    const sw = Math.sin(f.walkPhase);
    const bob = Math.abs(Math.cos(f.walkPhase)) * 2.4;
    upper(0, -bob);
    p.ftF = [26 + sw * 17, -Math.max(0, sw) * 17];
    p.ftB = [-26 - sw * 17, -Math.max(0, -sw) * 17];
    p.knF = [(p.hipF[0] + p.ftF[0]) / 2 + 7, -50 + Math.min(0, sw) * 4];
    p.knB = [(p.hipB[0] + p.ftB[0]) / 2 - 7, -50 - Math.max(0, sw) * 4];
    p.elF[1] += sw * 4;
    p.haF[1] += sw * 5;
    p.elB[1] -= sw * 4;
    p.haB[1] -= sw * 5;
  } else if (st === 'crouch') {
    p.hip = [0, -60];
    p.chest = [2, -104];
    p.neck = [2, -122];
    p.head = [3, -143];
    p.shF = [10, -108];
    p.shB = [-6, -108];
    p.elF = [32, -96];
    p.haF = [30, -120];
    p.elB = [-30, -96];
    p.haB = [-16, -116];
    p.hipF = [10, -58];
    p.hipB = [-10, -58];
    p.knF = [34, -28];
    p.ftF = [40, -2];
    p.knB = [-34, -28];
    p.ftB = [-42, -2];
  } else if (st === 'jump') {
    const rising = f.vy > 0;
    p.hip = [0, -96];
    p.chest = [2, -146];
    p.neck = [2, -164];
    p.head = [2, -185];
    p.shF = [8, -150];
    p.shB = [-8, -150];
    p.elF = [34, -136];
    p.haF = [38, -164];
    p.elB = [-34, -136];
    p.haB = [-38, -160];
    p.hipF = [10, -94];
    p.hipB = [-10, -94];
    p.knF = [32, -66];
    p.ftF = [28, -28];
    p.knB = [-30, -60];
    p.ftB = [-24, -20];
    upper(rising ? -2 : 2, 0);
  } else if (st === 'block') {
    p.elF = [34, -136];
    p.haF = [30, -164];
    p.elB = [8, -130];
    p.haB = [16, -158];
    p.knF = [26, -48];
    p.ftF = [32, -2];
    p.knB = [-26, -48];
    p.ftB = [-34, -2];
    upper(-3, 0);
  } else if (st === 'hit') {
    const shake = Math.sin(f.stateTime * 55) * 2.5;
    upper(-13 + shake, 2);
    p.head = [-24 + shake, -176];
    p.neck = [-16 + shake, -158];
    p.elF = [34 + shake, -132];
    p.haF = [26 + shake, -170];
    p.elB = [-38 + shake, -126];
    p.haB = [-34 + shake, -154];
    p.ftF = [30, -2];
    p.ftB = [-34, -2];
    p.knF = [30, -48];
    p.knB = [-32, -48];
  } else if (st === 'win') {
    const bob = Math.sin(f.winTime * 4.5) * 4;
    upper(0, bob * 0.4);
    p.elF = [30, -174 + bob * 0.5];
    p.haF = [26, -208 + bob];
    p.elB = [-30, -170 + bob * 0.5];
    p.haB = [-24, -204 + bob];
    p.head = [2, -184 + bob * 0.3];
  }

  if (f.state === 'attack' && f.attack) {
    const a = f.attack;
    const total = a.startup + a.active + a.recovery;
    let e;
    if (f.attackT < a.startup) e = smooth(f.attackT / a.startup) * 0.9;
    else if (f.attackT < a.startup + a.active) e = 1;
    else e = 1 - smooth((f.attackT - a.startup - a.active) / a.recovery);

    if (a.kind === 'punch') {
      upper(5 * e, 0);
      p.shF[0] += 5 * e;
      p.elF = lerp2([32, -128], [58, -149], e);
      p.haF = lerp2([30, -156], [104, -150], e);
      p.elB = lerp2([-32, -128], [-40, -124], e);
      p.haB = lerp2([-16, -150], [-26, -140], e);
      p.ftF = [26 + 10 * e, -2];
      p.knF = [22 + 8 * e, -50];
      p.ftB = [-26 - 8 * e, -2];
      p.knB = [-20 - 6 * e, -50];
    } else if (a.kind === 'kick') {
      upper(-9 * e, -2 * e);
      p.hip = [-4 * e, -94];
      p.hipF = [9 - 4 * e, -92];
      p.knF = lerp2([22, -50], [60, -74], e);
      p.ftF = lerp2([26, -2], [130, -86], e);
      p.ftB = [-30, -2];
      p.knB = [-24, -50];
      p.elF = lerp2([32, -128], [24, -166], e);
      p.haF = lerp2([30, -156], [30, -190], e);
      p.elB = lerp2([-32, -128], [-42, -142], e);
      p.haB = lerp2([-16, -150], [-44, -162], e);
    } else if (a.kind === 'airkick') {
      upper(-5 * e, 0);
      p.knF = lerp2([32, -66], [56, -82], e);
      p.ftF = lerp2([28, -28], [108, -74], e);
      p.knB = [-30, -60];
      p.ftB = [-26, -24];
      p.elF = lerp2([34, -136], [24, -164], e);
      p.haF = lerp2([38, -164], [26, -190], e);
      p.elB = lerp2([-34, -136], [-40, -150], e);
      p.haB = lerp2([-38, -160], [-44, -172], e);
    } else if (a.kind === 'special') {
      const charge = clamp(f.attackT / a.startup, 0, 1);
      upper(4 * charge, 0);
      p.shF[0] += 5 * charge;
      p.elF = lerp2([32, -128], [42, -130], charge);
      p.haF = lerp2([30, -156], [50, -134], charge);
      p.elB = lerp2([-32, -128], [26, -126], charge);
      p.haB = lerp2([-16, -150], [40, -128], charge);
      p.ftF = [28, -2];
      p.ftB = [-30, -2];
      p.knF = [24, -50];
      p.knB = [-24, -50];
    }
  }

  return p;
}

function drawScarf(ctx, f, color) {
  const t = f.animT;
  const speed = Math.min(1, Math.abs(f.kb) / 500 + (f.y > 0 ? 0.5 : 0));
  const n = 6;
  let prev = [-2, -156];
  for (let i = 1; i <= n; i++) {
    const x = -2 - i * (11 + speed * 5);
    const y = -156 + Math.sin(t * 5.5 + i * 0.9) * (4 + i * 0.9) + i * 1.4;
    const width = 8.2 - i * 1.2;
    ctx.beginPath();
    ctx.moveTo(prev[0], prev[1]);
    ctx.lineTo(x, y);
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(color, 0.13 * (1 - i / (n + 2)));
    ctx.lineWidth = width * 3.4;
    ctx.stroke();
    ctx.strokeStyle = hexA(color, 0.62 * (1 - i / (n + 1)));
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - i / (n + 1))})`;
    ctx.lineWidth = Math.max(0.8, width * 0.3);
    ctx.stroke();
    prev = [x, y];
  }
}

function drawTorso(ctx, f, col, p) {
  const a = 0.95;
  ctx.beginPath();
  ctx.moveTo(p.shB[0] - 5, p.shB[1] + 5);
  ctx.lineTo(p.shF[0] + 5, p.shF[1] + 5);
  ctx.lineTo(p.chest[0] + 19, p.chest[1] + 19);
  ctx.lineTo(p.hip[0] + 13, p.hip[1] + 4);
  ctx.lineTo(p.hip[0] - 13, p.hip[1] + 4);
  ctx.lineTo(p.chest[0] - 19, p.chest[1] + 19);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8,5,18,0.92)';
  ctx.fill();
  ctx.strokeStyle = hexA(col, 0.12 * a);
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.strokeStyle = hexA(col, 0.9 * a);
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // наплечники
  limb(ctx, [p.shB, [p.shB[0] - 9, p.shB[1] - 5]], col, 5.5, 0.75);
  limb(ctx, [p.shF, [p.shF[0] + 9, p.shF[1] - 5]], col, 5.5, 0.9);

  // энергетическая линия по центру
  ctx.beginPath();
  ctx.moveTo(p.neck[0], p.neck[1] + 4);
  ctx.lineTo(p.chest[0] + 3, p.chest[1] + 22);
  ctx.lineTo(p.hip[0], p.hip[1] - 2);
  ctx.strokeStyle = hexA(col, 0.55);
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // рёбра / броня
  ctx.beginPath();
  ctx.moveTo(p.shF[0] + 3, p.shF[1] + 7);
  ctx.lineTo(p.chest[0] + 12, p.chest[1] + 21);
  ctx.strokeStyle = hexA(col, 0.38);
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // ядро на груди
  const ex = p.chest[0];
  const ey = p.chest[1] + 22;
  ctx.beginPath();
  ctx.moveTo(ex, ey - 6);
  ctx.lineTo(ex + 5, ey);
  ctx.lineTo(ex, ey + 6);
  ctx.lineTo(ex - 5, ey);
  ctx.closePath();
  ctx.fillStyle = hexA(col, 0.18);
  ctx.fill();
  ctx.strokeStyle = hexA(col, 0.85);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ex, ey, 1.8, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fill();
}

function drawHead(ctx, f, col, accent, p) {
  const [hx, hy] = p.head;
  const r = 18;

  // короткий гребень-плавник
  ctx.beginPath();
  ctx.moveTo(hx - 6, hy - r + 4);
  ctx.lineTo(hx - 16, hy - r - 2);
  ctx.lineCap = 'round';
  ctx.strokeStyle = hexA(col, 0.7);
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(hx, hy, r, 0, TAU);
  ctx.fillStyle = 'rgba(7,4,15,0.96)';
  ctx.fill();
  ctx.strokeStyle = hexA(col, 0.12);
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.strokeStyle = hexA(col, 0.95);
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // визор
  const vy = hy + 1;
  ctx.beginPath();
  ctx.moveTo(hx - 5, vy);
  ctx.lineTo(hx + 9, vy - 1);
  ctx.lineCap = 'round';
  ctx.strokeStyle = hexA(accent, 0.25);
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.strokeStyle = hexA(accent, 0.95);
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // бровь / маска
  ctx.beginPath();
  ctx.moveTo(hx - 7, hy - 7);
  ctx.lineTo(hx + 8, hy - 8);
  ctx.strokeStyle = hexA(col, 0.55);
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // затылочный огонёк
  ctx.beginPath();
  ctx.arc(hx - 12, hy + 3, 2, 0, TAU);
  ctx.fillStyle = hexA(accent, 0.8);
  ctx.fill();
}

function drawExtremities(ctx, f, col, accent, p) {
  // кулаки
  const hands = [
    { pt: p.haB, r: 4.4, a: 0.62 },
    { pt: p.haF, r: 5.2, a: 1 }
  ];
  for (const h of hands) {
    ctx.beginPath();
    ctx.arc(h.pt[0], h.pt[1], h.r + 3.5, 0, TAU);
    ctx.fillStyle = hexA(col, 0.13 * h.a);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(h.pt[0], h.pt[1], h.r, 0, TAU);
    ctx.fillStyle = hexA(col, 0.85 * h.a);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(h.pt[0], h.pt[1], h.r * 0.42, 0, TAU);
    ctx.fillStyle = `rgba(255,255,255,${0.9 * h.a})`;
    ctx.fill();
  }

  // ботинки
  const feet = [
    { pt: p.ftB, a: 0.55 },
    { pt: p.ftF, a: 0.95 }
  ];
  for (const ft of feet) {
    ctx.beginPath();
    ctx.moveTo(ft.pt[0] - 8, ft.pt[1] - 2);
    ctx.lineTo(ft.pt[0] + 11, ft.pt[1] - 2);
    ctx.strokeStyle = hexA(col, 0.12 * ft.a);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.95 * ft.a);
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * ft.a})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
}

function drawShield(ctx, f, col) {
  const pulse = 0.72 + Math.sin(f.animT * 10) * 0.08 + (f.blockstun > 0 ? 0.25 : 0);
  ctx.save();
  ctx.translate(28, -128);
  ctx.scale(1, 1.02);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 52 + i * 7, -1.05, 1.05);
    ctx.strokeStyle = hexA(i === 0 ? '#ffffff' : col, (0.55 - i * 0.14) * pulse);
    ctx.lineWidth = 3.5 - i * 0.7;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 60, -0.85, 0.85);
  ctx.strokeStyle = hexA(col, 0.18 * pulse);
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.restore();
}

function drawSpecialOrb(ctx, f, col) {
  if (!f.attack || f.attack.kind !== 'special') return;
  const t = f.attackT;
  const st = f.attack.startup;
  if (t > st + 0.04) return;
  const charge = clamp(t / st, 0, 1);
  const r = 5 + charge * 22 + Math.sin(f.animT * 22) * 2;
  const x = 46;
  const y = -132;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.3, hexA(col, 0.9));
  g.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.6, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 32 + charge * 16, 0, TAU);
  ctx.strokeStyle = hexA(col, 0.4 * charge);
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawAttackTrail(ctx, f, col) {
  if (!f.attack) return;
  const a = f.attack;
  if (f.attackT < a.startup || f.attackT > a.startup + a.active) return;
  let x = 0, y = 0, r = 30;
  if (a.kind === 'punch') { x = 100; y = -150; r = 34; }
  else if (a.kind === 'kick') { x = 124; y = -86; r = 44; }
  else if (a.kind === 'airkick') { x = 102; y = -74; r = 40; }
  else return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  ctx.arc(x, y, r, -1.15, 1.15);
  ctx.strokeStyle = hexA(col, 0.5);
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, -1.05, 1.05);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // скоростные линии
  for (let i = 0; i < 3; i++) {
    const yy = y - 24 + i * 24;
    ctx.beginPath();
    ctx.moveTo(x - 52, yy);
    ctx.lineTo(x - 16, yy);
    ctx.strokeStyle = hexA(col, 0.22);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFighter(ctx, f) {
  const shadowScale = 1 - Math.min(0.62, f.y / 360);
  ctx.save();
  ctx.globalAlpha = 0.5 * shadowScale;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(f.x, GROUND_Y + 5, 44 * shadowScale + 10, 10 * shadowScale + 2, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  const col = f.flash > 0.42 ? '#ffffff' : f.color;
  const accent = f.flash > 0.42 ? '#ffffff' : f.accent;

  ctx.save();
  ctx.translate(f.x, GROUND_Y - f.y);
  if (f.state === 'ko') {
    const e = easeOut(Math.min(1, f.koTime * 1.5));
    ctx.translate(-14 * e, -2 * e);
    ctx.rotate(-1.5 * e);
  }
  ctx.scale(f.facing, 1);

  const p = buildPose(f);

  // аура при готовой супер-атаке
  if (f.meter >= 50 && f.state !== 'ko') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.5 + Math.sin(f.animT * 4) * 0.2;
    const g = ctx.createRadialGradient(0, -100, 8, 0, -100, 92);
    g.addColorStop(0, hexA(col, 0.10 * pulse));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -100, 66, 106, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawScarf(ctx, f, col);

  // задняя нога
  limb(ctx, [p.hipB, p.knB, p.ftB], col, 10.5, 0.62);
  // задняя рука
  limb(ctx, [p.shB, p.elB, p.haB], col, 9, 0.62);
  // передняя нога
  limb(ctx, [p.hipF, p.knF, p.ftF], col, 12, 0.95);
  // торс
  drawTorso(ctx, f, col, p);
  // голова
  drawHead(ctx, f, col, accent, p);
  // передняя рука
  limb(ctx, [p.shF, p.elF, p.haF], col, 10.5, 1);
  // кулаки и ботинки
  drawExtremities(ctx, f, col, accent, p);

  if (f.state === 'block') drawShield(ctx, f, col);
  drawSpecialOrb(ctx, f, col);
  drawAttackTrail(ctx, f, col);

  ctx.restore();
}

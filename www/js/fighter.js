// Боец: физика, состояния, удары и процедурная неоновая отрисовка.

import { audio } from './audio.js';
import { getCharacter } from './characters.js';
import { t } from './i18n.js';
import { getSpriteFrame } from './sprites.js';

export const GROUND_Y = 604;
export const ARENA = { left: 112, right: 1168 };

const GRAVITY = 3150;
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
  },
  shockwave: {
    kind: 'shockwave', startup: 0.29, active: 0.06, recovery: 0.46,
    projectile: true, cost: 50, damage: 16, y0: 0, y1: 100, kb: 520,
    hitstun: 0.42, blockstun: 0.28, meterGain: 0
  },
  dashStrike: {
    kind: 'dash', startup: 0.12, active: 0.18, recovery: 0.34,
    projectile: false, cost: 50, damage: 20, reach: 96, y0: 20, y1: 180,
    kb: 560, hitstun: 0.46, blockstun: 0.32, meterGain: 0,
    dash: true, dashSpeed: 900
  },
  fan: {
    kind: 'fan', startup: 0.24, active: 0.06, recovery: 0.4,
    projectile: true, cost: 50, damage: 8, y0: 0, y1: 100, kb: 260,
    hitstun: 0.26, blockstun: 0.18, meterGain: 0
  },
  lightning: {
    kind: 'lightning', startup: 0.32, active: 0.06, recovery: 0.5,
    projectile: true, cost: 50, damage: 22, y0: 0, y1: 100, kb: 420,
    hitstun: 0.5, blockstun: 0.32, meterGain: 0
  }
};

const COMBOS = [
  { seq: ['punch', 'punch', 'kick'], name: 'flurry', damage: 1.55, kb: 1.45, hitstun: 1.2, startup: 0.88, recovery: 1.0 },
  { seq: ['kick', 'punch', 'kick'], name: 'reversal', damage: 1.5, kb: 1.35, hitstun: 1.15, startup: 0.95, recovery: 1.05 },
  { seq: ['punch', 'punch', 'punch'], name: 'triple', damage: 1.4, kb: 1.2, startup: 0.9, recovery: 0.95 },
  { seq: ['kick', 'punch'], name: 'switch', damage: 1.35, startup: 0.9, recovery: 0.95 },
  { seq: ['punch', 'kick'], name: 'hook', damage: 1.3, kb: 1.15, startup: 0.95 },
  { seq: ['kick', 'kick'], name: 'doubleKick', damage: 1.3, kb: 1.1, startup: 0.95, recovery: 0.98 },
  { seq: ['punch', 'punch'], name: 'double', damage: 1.28, startup: 0.9, recovery: 0.92 }
];

const COMMAND_MOVES = {
  rush: {
    key: 'rush', base: 'punch', damage: 1.75, reach: 1.2, kb: 0.9,
    hitstun: 1.1, startup: 0.8, recovery: 0.9, dash: true, dashSpeed: 700
  },
  charge: {
    key: 'charge', base: 'kick', damage: 1.9, reach: 1.2, kb: 1.25,
    hitstun: 1.25, startup: 1.0, recovery: 1.15, dash: true, dashSpeed: 780
  },
  uppercut: {
    key: 'uppercut', base: 'punch', damage: 2.05, reach: 1.05, kb: 0.55,
    hitstun: 1.45, y0: 45, y1: 228, launch: 560, startup: 1.05, recovery: 1.25
  },
  sweep: {
    key: 'sweep', base: 'kick', damage: 1.35, reach: 1.25, y0: 0, y1: 62,
    kb: 1.05, hitstun: 1.3, launch: 240, startup: 1.05, recovery: 1.1
  },
  breakerPunch: {
    key: 'breakerPunch', base: 'kick', damage: 2.5, reach: 1.15, kb: 1.45,
    hitstun: 1.5, unblockable: true, startup: 1.3, recovery: 1.25
  },
  breakerKick: {
    key: 'breakerKick', base: 'kick', damage: 2.25, reach: 1.25, kb: 1.4,
    hitstun: 1.5, launch: 520, startup: 1.25, recovery: 1.3
  }
};

function findCombo(chain) {
  const key = chain.join('>');
  return COMBOS.find((c) => c.seq.join('>') === key) || null;
}

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

function hexA(hex, a) {
  if (!hex || !hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export class Fighter {
  constructor({ x = 380, facing = 1, charId = 'volt', variant = 0, controller = null, index = 0 } = {}) {
    const char = getCharacter(charId);
    this.index = index;
    this.char = char;
    this.charId = char.id;
    this.variant = variant;
    this.style = char.style;
    this.gear = char.gear || char.style;
    this.isBoss = !!char.boss;
    this.scale = char.scale || 1;
    this.special = char.special;
    this.color = variant === 1 && char.altColor ? char.altColor : char.color;
    this.accent = variant === 1 && char.altAccent ? char.altAccent : char.accent;
    this.name = t(`char.${char.id}.name`);
    this.maxHealth = char.hp;
    this.walkSpeed = char.walkSpeed;
    this.airSpeed = char.airSpeed;
    this.jumpV = char.jumpV;
    this.damageMul = char.damageMul;
    this.startupMul = char.startupMul;
    this.recoveryMul = char.recoveryMul;
    this.reachMul = char.reachMul;
    this.controller = controller;
    this.phase = Math.random() * TAU;
    this.animT = Math.random() * 10;
    this.meter = 0;
    this.wins = 0;
    this.x = x;
    this.facing = facing;
    this.locked = true;
    this.health = this.maxHealth;
    this.displayHealth = this.maxHealth;
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
    this.chain = [];
    this.chainT = 0;
    this.comboReady = false;
    this.attackBuffer = null;
    this.comboLabel = '';
    this.comboLabelT = 0;
    this.motion = [];
    this.landSquash = 0;
  }

  resetForRound(x, facing) {
    this.x = x;
    this.facing = facing;
    this.health = this.maxHealth;
    this.displayHealth = this.maxHealth;
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
    this.chain = [];
    this.chainT = 0;
    this.comboReady = false;
    this.attackBuffer = null;
    this.comboLabel = '';
    this.comboLabelT = 0;
    this.motion = [];
    this.landSquash = 0;
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

  getSpecialDef() {
    switch (this.special) {
      case 'wave': return ATTACKS.shockwave;
      case 'dash': return ATTACKS.dashStrike;
      case 'fan': return ATTACKS.fan;
      case 'lightning': return ATTACKS.lightning;
      default: return ATTACKS.special;
    }
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
    const base = kind === 'special' ? this.getSpecialDef() : ATTACKS[kind];
    if (!base) return false;
    this.attackBuffer = null;
    this.motion = [];
    if (base.projectile) {
      if (this.meter < base.cost) return false;
      this.meter -= base.cost;
    }

    let combo = null;
    if (kind === 'punch' || kind === 'kick') {
      if (this.comboReady && this.chainT > 0) combo = findCombo([...this.chain, kind]);
      this.chain = (combo ? [...this.chain, kind] : [kind]).slice(-3);
      this.chainT = 0.95;
      this.comboReady = false;
    } else {
      this.chain = [];
      this.chainT = 0;
      this.comboReady = false;
    }

    const a = {
      ...base,
      startup: base.startup * this.startupMul,
      recovery: base.recovery * this.recoveryMul,
      damage: base.damage * this.damageMul,
      reach: (base.reach || 0) * this.reachMul
    };
    if (combo) {
      a.damage *= combo.damage;
      a.kb *= combo.kb || 1;
      a.hitstun *= combo.hitstun || 1;
      a.startup *= combo.startup || 1;
      a.recovery *= combo.recovery || 1;
      a.reach *= 1.12;
      a.comboName = combo.name;
    }
    this.attack = a;
    this.attackT = 0;
    this.attackHit = false;
    this.fired = false;
    this.comboLabel = '';
    this.comboLabelT = 0;
    this.setState('attack');
    if (a.air) this.airAttackUsed = true;
    this.kb *= 0.35;
    if (combo) {
      audio.combo(combo.seq.length);
    } else if (kind === 'special') {
      if (this.special === 'dash') audio.dash();
      else audio.specialCharge();
    } else {
      audio.whiff();
    }
    return true;
  }

  recordMotion(dir) {
    const now = performance.now();
    this.motion.push({ dir, t: now });
    this.motion = this.motion.filter((m) => now - m.t <= 1100).slice(-8);
  }

  recordDirections() {
    const c = this.controller;
    if (!c || this.locked) return;
    if (c.consume('right')) this.recordMotion(this.facing > 0 ? 'forward' : 'back');
    if (c.consume('left')) this.recordMotion(this.facing < 0 ? 'forward' : 'back');
    if (c.consume('down')) this.recordMotion('down');
  }

  detectCommand(button) {
    const seq = this.motion.map((m) => m.dir);
    const ends = (pattern) => {
      if (seq.length < pattern.length) return false;
      const off = seq.length - pattern.length;
      return pattern.every((d, i) => seq[off + i] === d);
    };
    if (ends(['forward', 'down', 'back'])) {
      return button === 'kick' ? COMMAND_MOVES.breakerKick : COMMAND_MOVES.breakerPunch;
    }
    if (ends(['down', 'back']) && button === 'kick') return COMMAND_MOVES.sweep;
    if (ends(['down', 'forward']) && button === 'punch') return COMMAND_MOVES.uppercut;
    if (ends(['forward', 'forward'])) {
      return button === 'kick' ? COMMAND_MOVES.charge : COMMAND_MOVES.rush;
    }
    return null;
  }

  startCommand(def) {
    this.chain = [];
    this.comboReady = false;
    if (!this.startAttack(def.base)) return false;
    const a = this.attack;
    a.damage *= def.damage;
    a.kb *= def.kb || 1;
    a.hitstun *= def.hitstun || 1;
    a.startup *= def.startup || 1;
    a.recovery *= def.recovery || 1;
    a.reach *= def.reach || 1;
    if (def.y0 != null) a.y0 = def.y0;
    if (def.y1 != null) a.y1 = def.y1;
    if (def.dash) {
      a.dash = true;
      a.dashSpeed = def.dashSpeed || 700;
    }
    a.unblockable = !!def.unblockable;
    a.launch = def.launch || 0;
    a.commandKey = def.key;
    a.comboName = def.key;
    this.motion = [];
    audio.command?.(def.key);
    return true;
  }

  pollAttackBuffer() {
    const c = this.controller;
    if (!c || this.locked) return;
    if (c.consume('punch')) this.attackBuffer = { kind: 'punch', t: performance.now() };
    else if (c.consume('kick')) this.attackBuffer = { kind: 'kick', t: performance.now() };
  }

  freshAttackBuffer() {
    if (!this.attackBuffer) return null;
    if (performance.now() - this.attackBuffer.t > 420) {
      this.attackBuffer = null;
      return null;
    }
    return this.attackBuffer.kind;
  }

  tryComboCancel(a, dt) {
    if (!this.comboReady || this.attackT < a.startup + Math.max(0, a.active - 0.02)) return false;
    const next = this.freshAttackBuffer();
    if (!next) return false;
    this.attackBuffer = null;
    this.startAttack(next);
    this.applyPhysics(dt);
    return true;
  }

  update(dt, foe, game) {
    this.animT += dt;
    this.stateTime += dt;
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer <= 0) this.combo = 0;
    this.chainT = Math.max(0, this.chainT - dt);
    if (this.chainT <= 0) {
      this.chain = [];
      this.comboReady = false;
    }
    this.comboLabelT = Math.max(0, this.comboLabelT - dt);
    if (this.attackBuffer && performance.now() - this.attackBuffer.t > 420) this.attackBuffer = null;
    this.landSquash = Math.max(0, this.landSquash - dt * 6);
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
      this.pollAttackBuffer();
      const prev = this.attackT;
      this.attackT += dt;
      if (a.projectile && !this.fired && prev < a.startup && this.attackT >= a.startup) {
        this.fired = true;
        if (game?.spawnProjectile) game.spawnProjectile(this);
      }
      if (a.dash && !this.attackHit && this.attackT <= a.startup + a.active) {
        this.x = clamp(this.x + this.facing * a.dashSpeed * dt, ARENA.left, ARENA.right);
        if (game?.fx && Math.random() < 0.65) {
          game.fx.trail(this.x - this.facing * (12 + Math.random() * 24), GROUND_Y - this.y - 40 - Math.random() * 90, this.color);
        }
      }
      if (this.tryComboCancel(a, dt)) return;
      const total = a.startup + a.active + a.recovery;
      this.applyPhysics(dt);
      if (this.attackT >= total) {
        this.attack = null;
        this.setState(this.y > 0 ? 'jump' : 'idle');
        const next = this.freshAttackBuffer();
        if (this.comboReady && next && this.y <= 0) {
          this.attackBuffer = null;
          this.startAttack(next);
        }
      }
      return;
    }

    const c = this.controller;
    if (!c || this.locked) {
      this.setState(this.y > 0 ? 'jump' : 'idle');
      this.applyPhysics(dt);
      return;
    }

    this.recordDirections();

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
        this.x += dir * this.walkSpeed * dt;
        this.setState('walk');
      } else {
        this.setState('idle');
      }

      if (c.consume('up')) {
        this.vy = this.jumpV;
        this.y = 0.01;
        this.airAttackUsed = false;
        this.jumpDustArmed = true;
        this.setState('jump');
        audio.jump();
      }
    } else {
      const dir = (c.isDown('right') ? 1 : 0) - (c.isDown('left') ? 1 : 0);
      if (dir) this.x += dir * this.airSpeed * dt;
      if (this.state !== 'jump') this.setState('jump');
    }

    this.faceFoe(foe);

    const punch = c.consume('punch');
    const kick = c.consume('kick');
    const special = c.consume('special');
    const specialCost = this.getSpecialDef().cost;
    const button = kick ? 'kick' : punch ? 'punch' : null;
    const command = button && this.y <= 0 ? this.detectCommand(button) : null;

    if (special && this.y <= 0 && this.meter >= specialCost) {
      this.startAttack('special');
    } else if (this.y > 0) {
      if ((punch || kick) && !this.airAttackUsed) this.startAttack('airkick');
    } else if (command && this.startCommand(command)) {
      if (game?.fx) {
        game.fx.ring(this.x + this.facing * 24, GROUND_Y - this.y - 104, this.accent, 10, 88, 0.26, 4);
        game.fx.dust(this.x, GROUND_Y, 7, this.color);
      }
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
        if (wasAir) {
          this.landed = true;
          this.landSquash = 1;
        }
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
  const sway = Math.sin(t * 2.2 + f.phase);

  if (st === 'idle') {
    upper(sway * 1.2, breath * 0.25);
    p.hip[0] += sway * 1.6;
    p.hip[1] += Math.abs(sway) * 1.1;
    p.hipF[0] += sway * 0.9;
    p.hipB[0] += sway * 0.9;
    p.knF[0] += sway * 0.55;
    p.knB[0] -= sway * 0.35;
    p.head[1] += Math.sin(t * 3.9 + f.phase) * 0.9;
    p.haF[1] += Math.sin(t * 3.2 + 0.8) * 1.8;
    p.haB[1] += Math.sin(t * 3.2 + 2.2) * 1.3;
    p.shF[1] += Math.sin(t * 2.6) * 0.6;
  } else if (st === 'walk') {
    const sw = Math.sin(f.walkPhase);
    const bob = Math.abs(Math.cos(f.walkPhase)) * 2.4;
    upper(0, -bob);
    p.chest[0] += sw * 1.8;
    p.head[0] += sw * 1.4;
    p.hip[0] += sw * 0.8;
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
    const guard = Math.sin(f.stateTime * 8) * 0.8;
    upper(-3, guard * 0.5);
    p.haF[1] += guard;
    p.haB[1] += guard * 0.7;
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
    p.chest[0] += Math.sin(f.stateTime * 28) * 2.2;
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

    const ck = a.commandKey;
    if (a.kind === 'punch' && ck === 'uppercut') {
      upper(4 * e, -4 * e);
      p.shF[0] += 7 * e;
      p.elF = lerp2([32, -128], [48, -182], e);
      p.haF = lerp2([30, -156], [54, -232], e);
      p.elB = lerp2([-32, -128], [-40, -136], e);
      p.haB = lerp2([-16, -150], [-30, -168], e);
      p.chest[1] -= 3 * e;
      p.head[1] -= 2 * e;
      p.ftF = [28, -2];
      p.ftB = [-34, -2];
      p.knF = [24, -50];
      p.knB = [-26, -50];
    } else if (a.kind === 'punch') {
      const lean = ck === 'rush' ? 9 : 5;
      upper(lean * e, 0);
      p.shF[0] += lean * e;
      p.elF = lerp2([32, -128], [58 + lean * e, -149], e);
      p.haF = lerp2([30, -156], [104 + lean * 2 * e, -150], e);
      p.elB = lerp2([-32, -128], [-40 - lean * e, -124], e);
      p.haB = lerp2([-16, -150], [-26 - lean * e, -140], e);
      p.ftF = [26 + 10 * e, -2];
      p.knF = [22 + 8 * e, -50];
      p.ftB = [-26 - 8 * e, -2];
      p.knB = [-20 - 6 * e, -50];
    } else if (a.kind === 'kick' && ck === 'sweep') {
      upper(-8 * e, 7 * e);
      p.hip = [-4 * e, -78];
      p.chest = [4 * e, -124];
      p.head[1] += 4 * e;
      p.knF = lerp2([22, -50], [58, -34], e);
      p.ftF = lerp2([26, -2], [136, -16], e);
      p.ftB = [-32, -2];
      p.knB = [-30, -40];
      p.elF = lerp2([32, -128], [28, -156], e);
      p.haF = lerp2([30, -156], [34, -184], e);
      p.elB = lerp2([-32, -128], [-38, -138], e);
      p.haB = lerp2([-16, -150], [-38, -158], e);
    } else if (a.kind === 'kick') {
      const brake = ck === 'breakerPunch' || ck === 'breakerKick';
      upper((-9 - (brake ? 6 : 0)) * e, (-2 - (brake ? 2 : 0)) * e);
      p.hip = [-4 * e, -94];
      p.hipF = [9 - 4 * e, -92];
      p.knF = lerp2([22, -50], [60 + (brake ? 5 : 0), -74], e);
      p.ftF = lerp2([26, -2], [130 + (brake ? 8 : 0), -86], e);
      p.ftB = [-30, -2];
      p.knB = [-24, -50];
      p.elF = lerp2([32, -128], [24, -166], e);
      p.haF = lerp2([30, -156], [30, -190], e);
      p.elB = lerp2([-32, -128], [-42, -142], e);
      p.haB = lerp2([-16, -150], [-44, -162], e);
      if (brake) {
        p.chest[0] += 5 * e;
        p.head[0] += 4 * e;
      }
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
    } else if (a.kind === 'shockwave') {
      const st = a.startup;
      if (f.attackT < st) {
        const charge = clamp(f.attackT / st, 0, 1);
        upper(-4 * charge, -2 * charge);
        p.elF = lerp2([32, -128], [38, -160], charge);
        p.haF = lerp2([30, -156], [46, -198], charge);
        p.elB = lerp2([-32, -128], [-10, -158], charge);
        p.haB = lerp2([-16, -150], [20, -194], charge);
        p.knF = [30, -48];
        p.knB = [-30, -48];
        p.ftF = [34, -2];
        p.ftB = [-38, -2];
      } else {
        const slam = smooth(clamp((f.attackT - st) / 0.1, 0, 1));
        upper(12 * slam, 4 * slam);
        p.hip[1] += 6 * slam;
        p.chest[1] += 6 * slam;
        p.elF = lerp2([38, -160], [50, -112], slam);
        p.haF = lerp2([46, -198], [66, -62], slam);
        p.elB = lerp2([-10, -158], [28, -116], slam);
        p.haB = lerp2([20, -194], [44, -66], slam);
        p.knF = [30, -44];
        p.knB = [-30, -44];
        p.ftF = [38, -2];
        p.ftB = [-42, -2];
      }
    } else if (a.kind === 'dash') {
      const rush = smooth(clamp(f.attackT / (a.startup + a.active), 0, 1));
      upper(9 * rush, 3 * rush);
      p.hip[1] += 5 * rush;
      p.chest[1] += 5 * rush;
      p.elF = lerp2([32, -128], [54, -136], rush);
      p.haF = lerp2([30, -156], [96, -132], rush);
      p.elB = lerp2([-32, -128], [-44, -120], rush);
      p.haB = lerp2([-16, -150], [-42, -126], rush);
      p.knF = [36, -44];
      p.ftF = [50, -2];
      p.knB = [-34, -42];
      p.ftB = [-54, -2];
    } else if (a.kind === 'fan') {
      const charge = clamp(f.attackT / a.startup, 0, 1);
      upper(2 * charge, 0);
      p.elF = lerp2([32, -128], [48, -140], charge);
      p.haF = lerp2([30, -156], [64, -142], charge);
      p.elB = lerp2([-32, -128], [22, -134], charge);
      p.haB = lerp2([-16, -150], [46, -132], charge);
      p.knF = [26, -48];
      p.knB = [-26, -48];
      p.ftF = [32, -2];
      p.ftB = [-34, -2];
    } else if (a.kind === 'lightning') {
      const st = a.startup;
      if (f.attackT < st) {
        const charge = clamp(f.attackT / st, 0, 1);
        upper(-2 * charge, -4 * charge);
        p.elF = lerp2([32, -128], [38, -170], charge);
        p.haF = lerp2([30, -156], [42, -206], charge);
        p.elB = lerp2([-32, -128], [-30, -168], charge);
        p.haB = lerp2([-16, -150], [-24, -202], charge);
        p.ftF = [30, -2];
        p.ftB = [-34, -2];
      } else {
        const strike = smooth(clamp((f.attackT - st) / 0.12, 0, 1));
        upper(6 * strike, 2 * strike);
        p.elF = lerp2([38, -170], [52, -150], strike);
        p.haF = lerp2([42, -206], [70, -160], strike);
        p.elB = lerp2([-30, -168], [-20, -150], strike);
        p.haB = lerp2([-24, -202], [-8, -164], strike);
        p.knF = [28, -48];
        p.knB = [-28, -48];
        p.ftF = [34, -2];
        p.ftB = [-38, -2];
      }
    }
  }

  if (f.style === 'heavy') {
    if (f.state !== 'attack') {
      p.ftF[0] += 4;
      p.ftB[0] -= 4;
      p.knF[0] += 2;
      p.knB[0] -= 2;
    }
    p.shF[0] += 3;
    p.shB[0] -= 3;
    p.chest[1] += 1;
    p.hip[1] += 1;
  }

  return p;
}

function drawScarf(ctx, f, color) {
  const t = f.animT;
  const speed = Math.min(1, Math.abs(f.kb) / 500 + (f.y > 0 ? 0.5 : 0));

  if (f.style === 'nyx') {
    // две угловатые ленты
    for (let strand = 0; strand < 2; strand++) {
      let prev = [-3, -158 + strand * 7];
      for (let i = 1; i <= 4; i++) {
        const x = -3 - i * (13 + speed * 4);
        const y = -158 + strand * 7 + Math.sin(t * 6 + i * 1.2 + strand) * 2.5 + i * 2.6 + (i % 2 ? -5 : 4);
        const width = (4.6 - strand * 0.8) - i * 0.55;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(x, y);
        ctx.lineCap = 'round';
        ctx.strokeStyle = hexA(color, 0.12 * (1 - i / 6));
        ctx.lineWidth = width * 3;
        ctx.stroke();
        ctx.strokeStyle = hexA(color, 0.66 * (1 - i / 5.4));
        ctx.lineWidth = Math.max(1, width);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - i / 5)})`;
        ctx.lineWidth = Math.max(0.6, width * 0.28);
        ctx.stroke();
        prev = [x, y];
      }
    }
    return;
  }

  if (f.style === 'mira') {
    // плотная ледяная вуаль
    let prev = [-4, -156];
    for (let i = 1; i <= 7; i++) {
      const x = -4 - i * (12 + speed * 5);
      const y = -156 + Math.sin(t * 4.4 + i * 0.7) * (3 + i * 1.35) + i * 1.1;
      const width = 10 - i * 1.05;
      ctx.beginPath();
      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(x, y);
      ctx.lineCap = 'round';
      ctx.strokeStyle = hexA(color, 0.09 * (1 - i / 9));
      ctx.lineWidth = width * 3.8;
      ctx.stroke();
      ctx.strokeStyle = hexA(color, 0.5 * (1 - i / 8));
      ctx.lineWidth = Math.max(1, width);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.32 * (1 - i / 8)})`;
      ctx.lineWidth = Math.max(0.7, width * 0.25);
      ctx.stroke();
      prev = [x, y];
    }
    return;
  }

  if (f.style === 'storm') {
    // молниевая лента + раздвоенный «хвост плаща»
    let prev = [-3, -156];
    for (let i = 1; i <= 5; i++) {
      const x = -3 - i * (12 + speed * 4);
      const y = -156 + (i % 2 ? -9 : 8) + Math.sin(t * 8 + i) * 2 + i * 1.5;
      const width = 5 - i * 0.55;
      ctx.beginPath();
      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(x, y);
      ctx.lineCap = 'round';
      ctx.strokeStyle = hexA(color, 0.12 * (1 - i / 6));
      ctx.lineWidth = width * 3.4;
      ctx.stroke();
      ctx.strokeStyle = hexA(color, 0.72 * (1 - i / 6));
      ctx.lineWidth = Math.max(1, width);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.45 * (1 - i / 6)})`;
      ctx.lineWidth = Math.max(0.6, width * 0.28);
      ctx.stroke();
      prev = [x, y];
    }
    // длинный раздвоенный плащ
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(-4, -96);
      ctx.quadraticCurveTo(-34 - Math.abs(s) * 8, -70, -58 - speed * 14, -18 + s * 8);
      ctx.strokeStyle = hexA(color, 0.1);
      ctx.lineWidth = 16;
      ctx.stroke();
      ctx.strokeStyle = hexA(color, 0.45);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    return;
  }

  const n = f.style === 'heavy' ? 4 : 6;
  let prev = [-2, -156];
  for (let i = 1; i <= n; i++) {
    const x = -2 - i * ((f.style === 'heavy' ? 8 : 11) + speed * 5);
    const y = -156 + Math.sin(t * 5.5 + i * 0.9) * (4 + i * 0.9) + i * 1.4;
    const width = (f.style === 'heavy' ? 10 : 8.2) - i * (f.style === 'heavy' ? 2 : 1.2);
    ctx.beginPath();
    ctx.moveTo(prev[0], prev[1]);
    ctx.lineTo(x, y);
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(color, 0.15 * (1 - i / (n + 2)));
    ctx.lineWidth = width * 3.4;
    ctx.stroke();
    ctx.strokeStyle = hexA(color, 0.7 * (1 - i / (n + 1)));
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.4 * (1 - i / (n + 1))})`;
    ctx.lineWidth = Math.max(0.8, width * 0.3);
    ctx.stroke();
    prev = [x, y];
  }
}

function drawTorso(ctx, f, col, p) {
  const a = 0.95;
  const heavy = f.style === 'heavy';
  const nyx = f.style === 'nyx';
  const mira = f.style === 'mira';
  const storm = f.style === 'storm';
  const chestW = heavy ? 22 : nyx ? 17 : mira ? 20 : 19;
  const hipW = heavy ? 15 : nyx ? 12 : mira ? 14 : 13;
  const shOut = heavy ? 7 : nyx ? 5 : mira ? 6 : storm ? 7 : 5;
  ctx.beginPath();
  ctx.moveTo(p.shB[0] - shOut, p.shB[1] + 5);
  ctx.lineTo(p.shF[0] + shOut, p.shF[1] + 5);
  ctx.lineTo(p.chest[0] + chestW, p.chest[1] + 19);
  ctx.lineTo(p.hip[0] + hipW, p.hip[1] + 4);
  ctx.lineTo(p.hip[0] - hipW, p.hip[1] + 4);
  ctx.lineTo(p.chest[0] - chestW, p.chest[1] + 19);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8,5,18,0.92)';
  ctx.fill();
  ctx.strokeStyle = hexA(col, 0.12 * a);
  ctx.lineWidth = heavy ? 9 : 7;
  ctx.stroke();
  ctx.strokeStyle = hexA(col, 0.9 * a);
  ctx.lineWidth = heavy ? 3.2 : nyx ? 2.2 : 2.6;
  ctx.stroke();

  if (nyx) {
    // острые наплечники-клинки
    for (const s of [-1, 1]) {
      const sh = s > 0 ? p.shF : p.shB;
      ctx.beginPath();
      ctx.moveTo(sh[0], sh[1] + 3);
      ctx.lineTo(sh[0] + s * 17, sh[1] - 13);
      ctx.strokeStyle = hexA(col, 0.14);
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.strokeStyle = hexA(col, 0.9);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (mira) {
    // кристаллы на плечах
    for (const s of [-1, 1]) {
      const sh = s > 0 ? p.shF : p.shB;
      const cx = sh[0] + s * 7;
      const cy = sh[1] - 7;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 7);
      ctx.lineTo(cx + 4, cy);
      ctx.lineTo(cx, cy + 7);
      ctx.lineTo(cx - 4, cy);
      ctx.closePath();
      ctx.fillStyle = hexA(col, 0.25);
      ctx.fill();
      ctx.strokeStyle = hexA(col, 0.85);
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  } else if (storm) {
    // высокий воротник и разряд на плече
    ctx.beginPath();
    ctx.moveTo(p.shB[0] - 2, p.shB[1] + 2);
    ctx.lineTo(p.shB[0] - 12, p.shB[1] - 16);
    ctx.lineTo(p.shB[0] + 4, p.shB[1] - 6);
    ctx.strokeStyle = hexA(col, 0.7);
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.shF[0] + 2, p.shF[1] + 2);
    ctx.lineTo(p.shF[0] + 12, p.shF[1] - 14);
    ctx.strokeStyle = hexA(col, 0.75);
    ctx.lineWidth = 2.2;
    ctx.stroke();
  } else {
    // наплечники
    limb(ctx, [p.shB, [p.shB[0] - (heavy ? 13 : 9), p.shB[1] - (heavy ? 8 : 5)]], col, heavy ? 8 : 5.5, 0.75);
    limb(ctx, [p.shF, [p.shF[0] + (heavy ? 13 : 9), p.shF[1] - (heavy ? 8 : 5)]], col, heavy ? 8 : 5.5, 0.9);
  }

  // энергетическая линия по центру
  ctx.beginPath();
  ctx.moveTo(p.neck[0], p.neck[1] + 4);
  ctx.lineTo(p.chest[0] + 3, p.chest[1] + 22);
  ctx.lineTo(p.hip[0], p.hip[1] - 2);
  ctx.strokeStyle = hexA(col, 0.55);
  ctx.lineWidth = heavy ? 2.4 : 1.8;
  ctx.stroke();

  // рёбра / броня
  ctx.beginPath();
  ctx.moveTo(p.shF[0] + 3, p.shF[1] + 7);
  ctx.lineTo(p.chest[0] + (heavy ? 15 : 12), p.chest[1] + 21);
  ctx.strokeStyle = hexA(col, 0.38);
  ctx.lineWidth = heavy ? 2 : 1.4;
  ctx.stroke();

  // ядро на груди
  const ex = p.chest[0];
  const ey = p.chest[1] + 22;
  const er = heavy ? 8 : 6;
  ctx.beginPath();
  ctx.moveTo(ex, ey - er);
  ctx.lineTo(ex + er * 0.8, ey);
  ctx.lineTo(ex, ey + er);
  ctx.lineTo(ex - er * 0.8, ey);
  ctx.closePath();
  ctx.fillStyle = hexA(col, heavy ? 0.28 : 0.18);
  ctx.fill();
  ctx.strokeStyle = hexA(col, 0.85);
  ctx.lineWidth = heavy ? 2 : 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ex, ey, heavy ? 2.5 : 1.8, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fill();

  if (nyx) {
    ctx.beginPath();
    ctx.moveTo(ex - 6, ey);
    ctx.lineTo(ex + 6, ey);
    ctx.strokeStyle = hexA(col, 0.8);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, 2.2, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
  } else if (mira) {
    ctx.strokeStyle = hexA(col, 0.7);
    ctx.lineWidth = 1;
    for (const ang of [-0.6, 0.6, 1.9]) {
      ctx.beginPath();
      ctx.moveTo(ex - Math.cos(ang) * 7, ey - Math.sin(ang) * 7);
      ctx.lineTo(ex + Math.cos(ang) * 7, ey + Math.sin(ang) * 7);
      ctx.stroke();
    }
  } else if (storm) {
    ctx.beginPath();
    ctx.moveTo(ex - 4, ey - 6);
    ctx.lineTo(ex + 1, ey - 1);
    ctx.lineTo(ex - 2, ey + 1);
    ctx.lineTo(ex + 5, ey + 7);
    ctx.strokeStyle = hexA(col, 0.95);
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
}

function drawHead(ctx, f, col, accent, p) {
  const [hx, hy] = p.head;
  const style = f.style;
  const heavy = style === 'heavy';
  const r = heavy ? 19 : 18;

  if (heavy) {
    // рога
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx - 9, hy - r + 3);
    ctx.lineTo(hx - 17, hy - r - 10);
    ctx.strokeStyle = hexA(col, 0.85);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx + 8, hy - r + 3);
    ctx.lineTo(hx + 15, hy - r - 8);
    ctx.strokeStyle = hexA(col, 0.85);
    ctx.lineWidth = 4;
    ctx.stroke();
  } else if (style === 'nyx') {
    // капюшон с острым верхом
    ctx.beginPath();
    ctx.moveTo(hx - 18, hy + 10);
    ctx.quadraticCurveTo(hx - 16, hy - r - 8, hx - 1, hy - r - 16);
    ctx.quadraticCurveTo(hx + 15, hy - r - 7, hx + 17, hy + 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(9,4,20,0.96)';
    ctx.fill();
    ctx.strokeStyle = hexA(col, 0.18);
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
    // маленький шип на капюшоне
    ctx.beginPath();
    ctx.moveTo(hx + 4, hy - r - 14);
    ctx.lineTo(hx + 14, hy - r - 24);
    ctx.strokeStyle = hexA(col, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (style === 'mira') {
    // мягкий капюшон и кристалл
    ctx.beginPath();
    ctx.moveTo(hx - 19, hy + 10);
    ctx.quadraticCurveTo(hx - 15, hy - r - 5, hx, hy - r - 13);
    ctx.quadraticCurveTo(hx + 15, hy - r - 5, hx + 18, hy + 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,15,18,0.95)';
    ctx.fill();
    ctx.strokeStyle = hexA(col, 0.2);
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.75);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx, hy - r - 20);
    ctx.lineTo(hx + 5, hy - r - 12);
    ctx.lineTo(hx, hy - r - 5);
    ctx.lineTo(hx - 5, hy - r - 12);
    ctx.closePath();
    ctx.fillStyle = hexA(accent, 0.35);
    ctx.fill();
    ctx.strokeStyle = hexA(accent, 0.9);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  } else if (style === 'storm') {
    // молниевый гребень и полукольцо
    ctx.beginPath();
    ctx.moveTo(hx - 7, hy - r + 2);
    ctx.lineTo(hx - 1, hy - r - 12);
    ctx.lineTo(hx + 2, hy - r - 1);
    ctx.lineTo(hx + 9, hy - r - 15);
    ctx.strokeStyle = hexA(col, 0.2);
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.95);
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx, hy, r + 7, -2.5, -0.65);
    ctx.strokeStyle = hexA(accent, 0.4);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // короткий гребень-плавник
    ctx.beginPath();
    ctx.moveTo(hx - 6, hy - r + 4);
    ctx.lineTo(hx - 16, hy - r - 2);
    ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(col, 0.7);
    ctx.lineWidth = 2.4;
    ctx.stroke();
  }

  if (f.isBoss) {
    // рогатая корона и злые глаза
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(hx + s * 13, hy - r + 3);
      ctx.quadraticCurveTo(hx + s * 32, hy - r - 4, hx + s * 28, hy - r - 17);
      ctx.strokeStyle = hexA(col, 0.95);
      ctx.lineWidth = 3.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx + s * 8, hy - r + 1);
      ctx.lineTo(hx + s * 20, hy - r - 9);
      ctx.strokeStyle = hexA(accent, 0.65);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx + s * 22, hy - r - 10);
      ctx.lineTo(hx + s * 30, hy - r - 14);
      ctx.strokeStyle = hexA(col, 0.8);
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(hx - 7, hy + 1, 2.2, 0, TAU);
    ctx.arc(hx + 3, hy + 1, 2.2, 0, TAU);
    ctx.fillStyle = hexA(accent, 0.95);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(hx, hy, r, 0, TAU);
  ctx.fillStyle = 'rgba(7,4,15,0.96)';
  ctx.fill();
  ctx.strokeStyle = hexA(col, 0.12);
  ctx.lineWidth = heavy ? 10 : 8;
  ctx.stroke();
  ctx.strokeStyle = hexA(col, 0.95);
  ctx.lineWidth = heavy ? 3.2 : style === 'nyx' ? 2.2 : 2.6;
  ctx.stroke();

  // визор
  const vy = hy + 1;
  const vL = heavy ? 7 : style === 'nyx' ? 4 : style === 'storm' ? 7 : 5;
  const vR = heavy ? 11 : style === 'nyx' ? 10 : style === 'storm' ? 11 : 9;
  ctx.beginPath();
  ctx.moveTo(hx - vL, vy);
  ctx.lineTo(hx + vR, vy - 1);
  ctx.lineCap = 'round';
  ctx.strokeStyle = hexA(accent, 0.25);
  ctx.lineWidth = heavy ? 12 : style === 'nyx' ? 7 : 9;
  ctx.stroke();
  ctx.strokeStyle = hexA(accent, 0.95);
  ctx.lineWidth = heavy ? 5 : style === 'nyx' ? 3 : 4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  if (heavy) {
    // маска-респиратор
    ctx.beginPath();
    ctx.moveTo(hx - 8, hy + 9);
    ctx.lineTo(hx + 6, hy + 10);
    ctx.strokeStyle = hexA(col, 0.6);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx - 1, hy + 13, 2, 0, TAU);
    ctx.fillStyle = hexA(accent, 0.9);
    ctx.fill();
  } else if (style === 'nyx') {
    // закрытая маска
    ctx.beginPath();
    ctx.moveTo(hx - 13, hy + 8);
    ctx.lineTo(hx + 9, hy + 9);
    ctx.strokeStyle = hexA(col, 0.7);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx - 12, hy - 2, 1.8, 0, TAU);
    ctx.fillStyle = hexA(accent, 0.9);
    ctx.fill();
  } else if (style === 'mira') {
    // осколок на лбу
    ctx.beginPath();
    ctx.moveTo(hx + 2, hy - 8);
    ctx.lineTo(hx + 6, hy - 3);
    ctx.lineTo(hx + 2, hy + 2);
    ctx.lineTo(hx - 2, hy - 3);
    ctx.closePath();
    ctx.strokeStyle = hexA(accent, 0.8);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else if (style === 'storm') {
    // искра у виска
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy + 5);
    ctx.lineTo(hx - 8, hy + 8);
    ctx.lineTo(hx - 11, hy + 11);
    ctx.strokeStyle = hexA(accent, 0.85);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  } else {
    // бровь / маска
    ctx.beginPath();
    ctx.moveTo(hx - 7, hy - 7);
    ctx.lineTo(hx + 8, hy - 8);
    ctx.strokeStyle = hexA(col, 0.55);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  if (f.isBoss) {
    // три горящих глаза поверх маски
    for (const [ex, ey2, rr] of [[-7, 1, 2.4], [4, 1, 2.4], [-1, 8, 1.6]]) {
      ctx.beginPath();
      ctx.arc(hx + ex, hy + ey2, rr, 0, TAU);
      ctx.fillStyle = '#fff4f4';
      ctx.shadowColor = hexA(accent, 1);
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // затылочный огонёк
  ctx.beginPath();
  ctx.arc(hx - (heavy ? 13 : 12), hy + 3, heavy ? 2.6 : 2, 0, TAU);
  ctx.fillStyle = hexA(accent, 0.8);
  ctx.fill();
}

function drawExtremities(ctx, f, col, accent, p) {
  const style = f.style;
  const heavy = style === 'heavy';
  const nyx = style === 'nyx';
  const mira = style === 'mira';
  const storm = style === 'storm';

  if (nyx) {
    // клинки от кистей
    const blades = [
      { pt: p.haB, len: 14, a: 0.6 },
      { pt: p.haF, len: 22, a: 1 }
    ];
    for (const b of blades) {
      ctx.beginPath();
      ctx.moveTo(b.pt[0], b.pt[1]);
      ctx.lineTo(b.pt[0] + b.len, b.pt[1] - 3);
      ctx.strokeStyle = hexA(col, 0.16 * b.a);
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.strokeStyle = hexA(col, 0.9 * b.a);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * b.a})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.pt[0], b.pt[1], 3.4, 0, TAU);
      ctx.fillStyle = hexA(col, 0.8 * b.a);
      ctx.fill();
    }
  } else if (mira) {
    // кристаллы в ладонях
    const hands = [
      { pt: p.haB, a: 0.6, r: 4.4 },
      { pt: p.haF, a: 1, r: 5.4 }
    ];
    for (const h of hands) {
      ctx.beginPath();
      ctx.arc(h.pt[0], h.pt[1], h.r + 4, 0, TAU);
      ctx.fillStyle = hexA(col, 0.12 * h.a);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(h.pt[0], h.pt[1] - h.r);
      ctx.lineTo(h.pt[0] + h.r * 0.7, h.pt[1]);
      ctx.lineTo(h.pt[0], h.pt[1] + h.r);
      ctx.lineTo(h.pt[0] - h.r * 0.7, h.pt[1]);
      ctx.closePath();
      ctx.fillStyle = hexA(col, 0.25 * h.a);
      ctx.fill();
      ctx.strokeStyle = hexA(col, 0.9 * h.a);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(h.pt[0], h.pt[1], 1.8, 0, TAU);
      ctx.fillStyle = `rgba(255,255,255,${0.9 * h.a})`;
      ctx.fill();
    }
  } else {
    // кулаки
    const hands = [
      { pt: p.haB, r: heavy ? 6 : 4.4, a: 0.62 },
      { pt: p.haF, r: heavy ? 7 : 5.2, a: 1 }
    ];
    for (const h of hands) {
      ctx.beginPath();
      ctx.arc(h.pt[0], h.pt[1], h.r + (heavy ? 5 : 3.5), 0, TAU);
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
    if (storm) {
      for (const h of hands) {
        ctx.beginPath();
        ctx.moveTo(h.pt[0] - 7, h.pt[1] - 8);
        ctx.lineTo(h.pt[0] - 2, h.pt[1] - 3);
        ctx.lineTo(h.pt[0] - 5, h.pt[1] + 1);
        ctx.strokeStyle = hexA(accent, 0.75);
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
    }
  }

  // ботинки
  const shoeW = heavy ? 15 : nyx ? 10 : mira ? 10 : 12;
  const shoeCore = heavy ? 8 : nyx ? 4.5 : mira ? 5 : 6;
  const feet = [
    { pt: p.ftB, a: 0.55 },
    { pt: p.ftF, a: 0.95 }
  ];
  for (const ft of feet) {
    ctx.beginPath();
    ctx.moveTo(ft.pt[0] - (heavy ? 10 : 8), ft.pt[1] - 2);
    ctx.lineTo(ft.pt[0] + (heavy ? 13 : 11), ft.pt[1] - 2);
    ctx.strokeStyle = hexA(col, 0.12 * ft.a);
    ctx.lineWidth = shoeW;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.95 * ft.a);
    ctx.lineWidth = shoeCore;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * ft.a})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
}

function drawShield(ctx, f, col) {
  const pulse = 0.72 + Math.sin(f.animT * 10) * 0.08 + (f.blockstun > 0 ? 0.25 : 0);
  const heavy = f.style === 'heavy';
  const base = heavy ? 58 : 52;
  ctx.save();
  ctx.translate(28, -128);
  ctx.scale(1, 1.02);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, base + i * 7, -1.05, 1.05);
    ctx.strokeStyle = hexA(i === 0 ? '#ffffff' : col, (0.55 - i * 0.14) * pulse);
    ctx.lineWidth = (heavy ? 4.2 : 3.5) - i * 0.7;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, base + 8, -0.85, 0.85);
  ctx.strokeStyle = hexA(col, 0.18 * pulse);
  ctx.lineWidth = heavy ? 20 : 16;
  ctx.stroke();
  ctx.restore();
}

function drawStyleCharge(ctx, f, col, accent) {
  const a = f.attack;
  if (!a) return;
  if (f.attackT > a.startup + 0.04) return;
  const charge = clamp(f.attackT / a.startup, 0, 1);
  if (a.kind === 'fan') {
    const x = 54;
    const y = -140;
    const r = 4 + charge * 8;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.4, hexA(col, 0.8));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.6, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.7, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * 0.7, y);
    ctx.closePath();
    ctx.strokeStyle = hexA(accent, 0.9);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  } else if (a.kind === 'lightning') {
    const x = 38;
    const y = -196;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = 3 + charge * 6;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.35, hexA(col, 0.9));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const ang = f.animT * 9 + i * 2.1;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang) * 5, y + Math.sin(ang) * 5);
      ctx.lineTo(x + Math.cos(ang) * (12 + charge * 8), y + Math.sin(ang) * (12 + charge * 8));
      ctx.strokeStyle = hexA(accent, 0.7);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  } else if (a.kind === 'dash') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= 3; i++) {
      const y = -60 - i * 26;
      ctx.beginPath();
      ctx.moveTo(18, y);
      ctx.lineTo(58 + i * 10, y + 4);
      ctx.strokeStyle = hexA(col, 0.22 - i * 0.04);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }
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

const PIXEL_VIEW_W = 420;
const PIXEL_VIEW_H = 400;
const PIXEL_ORIGIN_X = 210;
const PIXEL_ORIGIN_Y = 360;
const PIXEL_RES = 0.43;
let pixelCanvas = null;
let pixelCtx = null;

function getPixelCanvas() {
  if (!pixelCanvas) {
    pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = Math.ceil(PIXEL_VIEW_W * PIXEL_RES);
    pixelCanvas.height = Math.ceil(PIXEL_VIEW_H * PIXEL_RES);
    pixelCtx = pixelCanvas.getContext('2d');
  }
  return pixelCtx;
}

function polygon(ctx, pts, fill, stroke, width = 2) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function drawHeadGear(ctx, f, hx, hy, col, accent) {
  const gear = f.gear || f.style;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (f.isBoss) {
    for (const s of [-1, 0, 1]) {
      polygon(ctx, [
        [hx + s * 9 - 3, hy - 14],
        [hx + s * 15, hy - 38 - Math.abs(s) * 4],
        [hx + s * 9 + 3, hy - 14]
      ], 'rgba(20,2,8,0.98)', hexA(col, 0.9), 1.6);
    }
  } else if (gear === 'bunny') {
    for (const s of [-1, 1]) {
      polygon(ctx, [
        [hx + s * 6, hy - 13],
        [hx + s * 9, hy - 53],
        [hx + s * 16, hy - 15]
      ], 'rgba(7,10,26,0.96)', hexA(col, 0.9), 2);
      ctx.beginPath();
      ctx.moveTo(hx + s * 9, hy - 22);
      ctx.lineTo(hx + s * 11, hy - 43);
      ctx.strokeStyle = hexA(accent, 0.65);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  } else if (gear === 'cat') {
    for (const s of [-1, 1]) {
      polygon(ctx, [
        [hx + s * 5, hy - 14], [hx + s * 13, hy - 35], [hx + s * 17, hy - 15]
      ], 'rgba(5,18,10,0.96)', hexA(col, 0.9), 2);
      ctx.beginPath();
      ctx.moveTo(hx + s * 9, hy - 20);
      ctx.lineTo(hx + s * 13, hy - 30);
      ctx.strokeStyle = hexA(accent, 0.7);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  } else if (gear === 'cyber') {
    // кибер-гребень и визор
    for (const s of [-1, 1]) {
      polygon(ctx, [
        [hx + s * 9, hy - 14], [hx + s * 18, hy - 28], [hx + s * 20, hy - 8]
      ], 'rgba(14,4,24,0.98)', hexA(col, 0.85), 1.8);
    }
    ctx.beginPath();
    ctx.moveTo(hx - 15, hy - 2);
    ctx.lineTo(hx + 16, hy - 3);
    ctx.strokeStyle = hexA(accent, 0.95);
    ctx.lineWidth = 4;
    ctx.stroke();
  } else if (gear === 'orc') {
    for (const s of [-1, 1]) {
      polygon(ctx, [
        [hx + s * 8, hy - 13], [hx + s * 25, hy - 25], [hx + s * 20, hy - 5]
      ], 'rgba(24,4,4,0.98)', hexA(col, 0.9), 1.8);
      ctx.beginPath();
      ctx.moveTo(hx + s * 8, hy + 7);
      ctx.lineTo(hx + s * 14, hy + 19);
      ctx.strokeStyle = hexA(accent, 0.9);
      ctx.lineWidth = 2.6;
      ctx.stroke();
    }
  } else if (gear === 'rogue') {
    for (const s of [-1, 1]) {
      polygon(ctx, [
        [hx + s * 7, hy - 14], [hx + s * 16, hy - 35], [hx + s * 18, hy - 12]
      ], 'rgba(20,4,20,0.97)', hexA(col, 0.9), 1.8);
    }
  } else if (gear === 'mira') {
    polygon(ctx, [[hx, hy - 40], [hx + 6, hy - 26], [hx, hy - 15], [hx - 6, hy - 26]], hexA(accent, 0.32), hexA(accent, 0.95), 1.4);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(hx + s * 14, hy - 10);
      ctx.lineTo(hx + s * 24, hy - 22);
      ctx.strokeStyle = hexA(col, 0.7);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else if (gear === 'heavy') {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(hx + s * 8, hy + 8);
      ctx.lineTo(hx + s * 12, hy + 18);
      ctx.strokeStyle = hexA(accent, 0.85);
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(hx, hy + 6, 23, 0.18, Math.PI - 0.18);
    ctx.strokeStyle = hexA(col, 0.55);
    ctx.lineWidth = 4;
    ctx.stroke();
  } else {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(hx + s * 7, hy - 14);
      ctx.quadraticCurveTo(hx + s * 17, hy - 38, hx + s * 9, hy - 48);
      ctx.strokeStyle = hexA(col, 0.22);
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = hexA(accent, 0.9);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCostumeBack(ctx, f, col, accent, p) {
  const style = f.style;
  const long = style === 'mira' ? 86 : style === 'nyx' ? 76 : style === 'storm' ? 70 : style === 'heavy' ? 54 : 48;
  if (f.isBoss) return;

  ctx.save();
  ctx.lineJoin = 'round';
  for (const s of [-1, 1]) {
    const sway = Math.sin(f.animT * 2.6 + (s > 0 ? 0.7 : 0)) * (5 + Math.min(8, Math.abs(f.kb) / 60));
    const top = [p.hip[0] + s * 9, p.hip[1] + 2];
    const mid = [p.hip[0] + s * 27 + sway, p.hip[1] + long * 0.62];
    const tip = [p.hip[0] + s * (15 + long * 0.08) + sway * 1.4, p.hip[1] + long];
    ctx.beginPath();
    ctx.moveTo(top[0] - s * 5, top[1]);
    ctx.lineTo(mid[0], mid[1]);
    ctx.lineTo(tip[0], tip[1]);
    ctx.lineTo(top[0] + s * 6, top[1] + 3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,3,12,0.93)';
    ctx.fill();
    ctx.strokeStyle = hexA(col, 0.45);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(top[0], top[1] + 4);
    ctx.lineTo(mid[0] + s * 2, mid[1] - 4);
    ctx.strokeStyle = hexA(accent, 0.32);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawGearBack(ctx, f, col, accent) {
  const gear = f.gear || f.style;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (gear === 'nyx' || gear === 'rogue') {
    // два клинка за спиной
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-8 + s * 5, -142);
      ctx.quadraticCurveTo(-48 + s * 18, -184, -44 + s * 31, -234);
      ctx.strokeStyle = 'rgba(4,2,10,0.92)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.strokeStyle = hexA(col, 0.9);
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.strokeStyle = hexA(accent, 0.7);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (gear === 'heavy' || gear === 'cyber') {
    // тяжёлый щит на спине
    ctx.save();
    ctx.translate(-39, -117);
    ctx.rotate(-0.18);
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 3;
      pts.push([Math.cos(a) * 43, Math.sin(a) * 43]);
    }
    polygon(ctx, pts, 'rgba(10,4,8,0.95)', hexA(col, 0.85), 2.4);
    polygon(ctx, pts.map(([x, y]) => [x * 0.62, y * 0.62]), 'rgba(20,8,12,0.8)', hexA(accent, 0.6), 1.4);
    ctx.restore();
  } else if (gear === 'mira' || gear === 'cat') {
    // ледяной посох с кристаллом
    ctx.beginPath();
    ctx.moveTo(20, -44);
    ctx.lineTo(54, -238);
    ctx.strokeStyle = 'rgba(4,12,16,0.95)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.8);
    ctx.lineWidth = 2.2;
    ctx.stroke();
    polygon(ctx, [[54, -262], [66, -242], [52, -222], [40, -242]], hexA(accent, 0.3), hexA(accent, 0.95), 1.6);
  } else if (gear === 'orc') {
    // тяжёлая дубина
    ctx.beginPath();
    ctx.moveTo(-16, -70);
    ctx.lineTo(-64, -208);
    ctx.strokeStyle = 'rgba(14,3,4,0.96)';
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.85);
    ctx.lineWidth = 3;
    ctx.stroke();
    polygon(ctx, [[-70, -232], [-44, -214], [-54, -186], [-86, -202]], 'rgba(20,5,6,0.98)', hexA(accent, 0.9), 1.8);
  } else if (gear === 'storm') {
    // громовой трезубец
    ctx.beginPath();
    ctx.moveTo(15, -42);
    ctx.lineTo(30, -238);
    ctx.strokeStyle = 'rgba(8,6,2,0.95)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.85);
    ctx.lineWidth = 2.4;
    ctx.stroke();
    for (const d of [-1, 0, 1]) {
      ctx.beginPath();
      ctx.moveTo(30 + d * 15, -224);
      ctx.lineTo(30 + d * 22, -258);
      ctx.strokeStyle = hexA(accent, 0.85);
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
  } else {
    // плазменное копьё / энергетический клинок
    ctx.beginPath();
    ctx.moveTo(-20, -70);
    ctx.lineTo(92, -230);
    ctx.strokeStyle = 'rgba(2,12,16,0.9)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.85);
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    polygon(ctx, [[92, -246], [101, -224], [84, -214]], hexA(accent, 0.28), hexA(accent, 0.95), 1.4);
    ctx.restore();
  }
  ctx.restore();
}

function drawGearFront(ctx, f, col, accent, p) {
  const style = f.style;
  const gear = f.gear || f.style;
  const plate = (pt, size, tilt) => {
    ctx.save();
    ctx.translate(pt[0], pt[1]);
    ctx.rotate(tilt);
    polygon(ctx, [
      [-size, -size * 0.65], [size * 0.6, -size * 0.85],
      [size, size * 0.35], [0, size * 0.72], [-size * 0.85, size * 0.3]
    ], 'rgba(8,4,13,0.95)', hexA(col, 0.8), 2);
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.1);
    ctx.lineTo(size * 0.4, -size * 0.2);
    ctx.strokeStyle = hexA(accent, 0.7);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  };

  if (gear === 'heavy' || gear === 'cyber') {
    plate(p.shF, 19, 0.16);
    plate(p.shB, 17, -0.18);
    // наручи
    for (const [pt, a] of [[p.elF, 0.9], [p.elB, 0.55]]) {
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 8.5, 0, TAU);
      ctx.fillStyle = 'rgba(12,5,8,0.9)';
      ctx.fill();
      ctx.strokeStyle = hexA(col, 0.75 * a);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else if (gear === 'nyx' || gear === 'rogue' || gear === 'bunny') {
    plate(p.shF, 13, 0.18);
    plate(p.shB, 10, -0.2);
    // кинжалы у кистей
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const pt of [p.haF, p.haB]) {
      ctx.beginPath();
      ctx.moveTo(pt[0] + 4, pt[1] - 2);
      ctx.lineTo(pt[0] + 26, pt[1] - 16);
      ctx.strokeStyle = hexA(accent, 0.75);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  } else if (gear === 'mira' || gear === 'cat') {
    plate(p.shF, 14, 0.14);
    plate(p.shB, 12, -0.16);
    // кристаллы на плече
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    polygon(ctx, [[p.shF[0], p.shF[1] - 16], [p.shF[0] + 6, p.shF[1] - 6], [p.shF[0], p.shF[1] + 4], [p.shF[0] - 6, p.shF[1] - 6]], hexA(accent, 0.25), hexA(accent, 0.9), 1.2);
    ctx.restore();
  } else if (gear === 'orc') {
    plate(p.shF, 20, 0.2);
    plate(p.shB, 17, -0.22);
    for (const s of [-1, 1]) {
      polygon(ctx, [[p.shF[0] + s * 12, p.shF[1] - 12], [p.shF[0] + s * 26, p.shF[1] + 2], [p.shF[0] + s * 12, p.shF[1] + 12]], 'rgba(24,4,4,0.95)', hexA(col, 0.7), 1.4);
    }
  } else if (gear === 'storm') {
    plate(p.shF, 16, 0.2);
    plate(p.shB, 14, -0.2);
    // молнии на плече
    ctx.beginPath();
    ctx.moveTo(p.shF[0] - 8, p.shF[1] - 14);
    ctx.lineTo(p.shF[0] + 2, p.shF[1] - 8);
    ctx.lineTo(p.shF[0] - 3, p.shF[1] - 1);
    ctx.lineTo(p.shF[0] + 8, p.shF[1] + 6);
    ctx.strokeStyle = hexA(accent, 0.85);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  } else {
    plate(p.shF, 14, 0.16);
    plate(p.shB, 12, -0.18);
    // плазменный сердечник
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.arc(0, -132, 6, 0, TAU);
    ctx.fillStyle = hexA(accent, 0.85);
    ctx.fill();
    ctx.restore();
  }

  drawHeadGear(ctx, f, p.head[0], p.head[1], col, accent);
}
function clothLimb(ctx, pts, width, col, accent, alpha = 1) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = `rgba(6,3,12,${0.94 * alpha})`;
  ctx.lineWidth = width + 4;
  ctx.stroke();
  ctx.strokeStyle = hexA(col, 0.28 * alpha);
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.strokeStyle = hexA(col, 0.82 * alpha);
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.strokeStyle = hexA(accent, 0.5 * alpha);
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();
}

function drawCostumeLegs(ctx, f, col, accent, p) {
  const style = f.style;
  const heavy = style === 'heavy';
  const w = heavy ? 17 : style === 'nyx' ? 12.5 : style === 'mira' ? 13 : 14;
  clothLimb(ctx, [p.hipB, p.knB, p.ftB], w * 0.9, col, accent, 0.66);
  clothLimb(ctx, [p.hipF, p.knF, p.ftF], w, col, accent, 0.98);

  // наколенники / броня
  for (const [pt, a] of [[p.knB, 0.6], [p.knF, 0.95]]) {
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], heavy ? 7.5 : 5.2, 0, TAU);
    ctx.fillStyle = 'rgba(7,4,12,0.9)';
    ctx.fill();
    ctx.strokeStyle = hexA(accent, 0.65 * a);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // бронированная юбка / пластины
  if (style === 'heavy' || style === 'mira' || style === 'storm') {
    const wdt = style === 'heavy' ? 25 : 21;
    const drop = style === 'heavy' ? 28 : 34;
    polygon(ctx, [
      [p.hip[0] - wdt, p.hip[1] + 3],
      [p.hip[0] + wdt, p.hip[1] + 3],
      [p.hip[0] + wdt * 0.72, p.hip[1] + drop],
      [p.hip[0], p.hip[1] + drop + 5],
      [p.hip[0] - wdt * 0.72, p.hip[1] + drop]
    ], 'rgba(6,3,12,0.9)', hexA(col, 0.55), 1.6);
    ctx.beginPath();
    ctx.moveTo(p.hip[0], p.hip[1] + 8);
    ctx.lineTo(p.hip[0], p.hip[1] + drop);
    ctx.strokeStyle = hexA(accent, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // набедренные пластины
  if (style === 'volt' || style === 'heavy' || style === 'storm') {
    for (const [hipPt, kneePt, s] of [[p.hipB, p.knB, -1], [p.hipF, p.knF, 1]]) {
      ctx.beginPath();
      ctx.moveTo(hipPt[0] + s * 4, hipPt[1] + 2);
      ctx.lineTo(kneePt[0] + s * 7, kneePt[1] + 4);
      ctx.strokeStyle = hexA(col, 0.55);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.strokeStyle = hexA(accent, 0.28);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // пояс
  ctx.beginPath();
  ctx.moveTo(p.hip[0] - 17, p.hip[1] + 4);
  ctx.lineTo(p.hip[0] + 17, p.hip[1] + 4);
  ctx.strokeStyle = hexA(col, 0.65);
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p.hip[0], p.hip[1] + 4, 2.6, 0, TAU);
  ctx.fillStyle = hexA(accent, 0.9);
  ctx.fill();
}

function drawJacketDetails(ctx, f, col, accent, p) {
  const style = f.style;
  // воротник
  ctx.beginPath();
  ctx.moveTo(p.neck[0] - 7, p.neck[1] + 3);
  ctx.lineTo(p.chest[0] - 10, p.chest[1] + 16);
  ctx.moveTo(p.neck[0] + 7, p.neck[1] + 3);
  ctx.lineTo(p.chest[0] + 10, p.chest[1] + 16);
  ctx.strokeStyle = hexA(accent, 0.55);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // грудная перевязь
  ctx.beginPath();
  ctx.moveTo(p.chest[0] - 14, p.chest[1] + 20);
  ctx.lineTo(p.chest[0] + 13, p.chest[1] + 36);
  ctx.moveTo(p.chest[0] + 13, p.chest[1] + 21);
  ctx.lineTo(p.chest[0] - 2, p.chest[1] + 46);
  ctx.strokeStyle = hexA(col, 0.65);
  ctx.lineWidth = 2;
  ctx.stroke();

  if (style === 'heavy') {
    ctx.beginPath();
    ctx.moveTo(p.chest[0] - 19, p.chest[1] + 24);
    ctx.lineTo(p.chest[0] + 19, p.chest[1] + 24);
    ctx.strokeStyle = hexA(accent, 0.5);
    ctx.lineWidth = 2.4;
    ctx.stroke();
  } else if (style === 'storm') {
    ctx.beginPath();
    ctx.moveTo(p.chest[0] - 4, p.chest[1] + 18);
    ctx.lineTo(p.chest[0] + 5, p.chest[1] + 27);
    ctx.lineTo(p.chest[0] - 2, p.chest[1] + 34);
    ctx.strokeStyle = hexA(accent, 0.85);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function drawCostumeArms(ctx, f, col, accent, p) {
  const style = f.style;
  const heavy = style === 'heavy';
  const w = heavy ? 13 : style === 'nyx' ? 8.5 : 9.5;
  clothLimb(ctx, [p.shB, p.elB, p.haB], w * 0.82, col, accent, 0.62);
  clothLimb(ctx, [p.shF, p.elF, p.haF], w, col, accent, 0.98);

  // наручи
  for (const [el, ha, a] of [[p.elB, p.haB, 0.6], [p.elF, p.haF, 0.95]]) {
    ctx.beginPath();
    ctx.moveTo(el[0], el[1]);
    ctx.lineTo(ha[0], ha[1]);
    ctx.strokeStyle = 'rgba(6,3,12,0.9)';
    ctx.lineWidth = w + 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = hexA(col, 0.42 * a);
    ctx.lineWidth = w * 0.72;
    ctx.stroke();
    ctx.strokeStyle = hexA(accent, 0.32 * a);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // манжеты
  for (const [pt, a] of [[p.elB, 0.55], [p.elF, 0.9]]) {
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], heavy ? 7 : 4.6, 0, TAU);
    ctx.fillStyle = 'rgba(7,4,12,0.85)';
    ctx.fill();
    ctx.strokeStyle = hexA(accent, 0.55 * a);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
}

function drawFighterBody(ctx, f, col, accent) {
  const style = f.style;
  const heavy = style === 'heavy';
  const nyx = style === 'nyx';
  const mira = style === 'mira';
  const storm = style === 'storm';
  const p = buildPose(f);

  // аура при готовой супер-атаке
  if (f.meter >= 50 && f.state !== 'ko') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.5 + Math.sin(f.animT * 4) * 0.2;
    const g = ctx.createRadialGradient(0, -100, 8, 0, -100, 92);
    g.addColorStop(0, hexA(col, (heavy ? 0.13 : 0.10) * pulse));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -100, heavy ? 74 : nyx ? 58 : 66, 106, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  if (f.isBoss) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.55 + Math.sin(f.animT * 3.2) * 0.16;
    const g = ctx.createRadialGradient(0, -110, 10, 0, -110, 130);
    g.addColorStop(0, hexA(col, 0.20 * pulse));
    g.addColorStop(0.55, hexA(col, 0.07 * pulse));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -108, 92, 142, 0, 0, TAU);
    ctx.fill();
    // тёмные шипы за спиной
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 5; i++) {
      const y = -170 + i * 24;
      const len = 34 + (i % 2) * 12;
      ctx.beginPath();
      ctx.moveTo(-10, y);
      ctx.lineTo(-len, y - 12 - (i % 3) * 4);
      ctx.lineTo(-16, y + 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(8,2,10,0.9)';
      ctx.fill();
      ctx.strokeStyle = hexA(col, 0.4);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCostumeBack(ctx, f, col, accent, p);
  drawGearBack(ctx, f, col, accent);
  drawScarf(ctx, f, col);

  // скоростные линии при рывке
  if (f.attack?.dash && !f.attackHit) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-28 - i * 14, -40 - i * 34);
      ctx.lineTo(-6 - i * 8, -38 - i * 34);
      ctx.strokeStyle = hexA(col, 0.3 - i * 0.07);
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  const armW = heavy ? 13 : nyx ? 8.5 : mira ? 9 : storm ? 9.5 : 10.5;
  const legW = heavy ? 14.5 : nyx ? 10.5 : mira ? 11 : storm ? 11.5 : 12;
  const armBackW = heavy ? 11.5 : nyx ? 7.5 : 8;
  const legBackW = heavy ? 13 : nyx ? 9.5 : 10;

  // задняя нога
  limb(ctx, [p.hipB, p.knB, p.ftB], col, legBackW, 0.62);
  // задняя рука
  limb(ctx, [p.shB, p.elB, p.haB], col, armBackW, 0.62);
  // передняя нога
  limb(ctx, [p.hipF, p.knF, p.ftF], col, legW, 0.95);
  drawCostumeLegs(ctx, f, col, accent, p);
  // торс
  drawTorso(ctx, f, col, p);
  drawJacketDetails(ctx, f, col, accent, p);
  // голова
  drawHead(ctx, f, col, accent, p);
  // передняя рука
  limb(ctx, [p.shF, p.elF, p.haF], col, armW, 1);
  drawCostumeArms(ctx, f, col, accent, p);
  // кулаки, клинки, кристаллы и ботинки
  drawExtremities(ctx, f, col, accent, p);

  drawGearFront(ctx, f, col, accent, p);

  if (f.state === 'block') drawShield(ctx, f, col);
  drawSpecialOrb(ctx, f, col);
  drawStyleCharge(ctx, f, col, accent);
  drawAttackTrail(ctx, f, col);


}

function drawSpriteFrame(ctx, f, sprite) {
  const scale = (sprite.scale || 1) * (f.scale || 1);
  const squash = f.landSquash || 0;
  ctx.save();
  ctx.translate(f.x, GROUND_Y - f.y);
  ctx.scale(f.facing, 1);
  if (f.state === 'ko') {
    const e = easeOut(Math.min(1, f.koTime * 1.5));
    ctx.translate(-14 * e, -2 * e);
    ctx.rotate(-1.5 * e);
  }
  ctx.scale(1 + squash * 0.05, 1 - squash * 0.07);
  let filter = '';
  if (f.variant === 1) filter += 'hue-rotate(195deg) saturate(1.35) ';
  if (f.flash > 0.42) filter += 'brightness(2.6) ';
  if (filter) {
    try { ctx.filter = filter.trim(); } catch (e) { /* filter не поддерживается */ }
  }
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sprite.img,
    sprite.sx, sprite.sy, sprite.sw, sprite.sh,
    -sprite.anchorX * scale, -sprite.anchorY * scale,
    sprite.sw * scale, sprite.sh * scale
  );
  ctx.imageSmoothingEnabled = prevSmooth;
  ctx.restore();
}

export function drawFighter(ctx, f) {
  const style = f.style;
  const heavy = style === 'heavy';
  const nyx = style === 'nyx';
  const shadowW = (heavy ? 50 : nyx ? 42 : 46) * (f.scale || 1);
  const shadowScale = 1 - Math.min(0.62, f.y / 360);
  ctx.save();
  ctx.globalAlpha = 0.5 * shadowScale;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(f.x, GROUND_Y + 5, shadowW * shadowScale + 10, (heavy ? 12 : 10) * shadowScale + 2, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  const col = f.flash > 0.42 ? '#ffffff' : f.color;
  const accent = f.flash > 0.42 ? '#ffffff' : f.accent;

  const sprite = getSpriteFrame(f);
  if (sprite) {
    drawSpriteFrame(ctx, f, sprite);
    return;
  }

  const pc = getPixelCanvas();

  pc.clearRect(0, 0, pc.canvas.width, pc.canvas.height);
  pc.save();
  pc.scale(PIXEL_RES, PIXEL_RES);
  pc.translate(PIXEL_ORIGIN_X, PIXEL_ORIGIN_Y);
  if (f.state === 'ko') {
    const e = easeOut(Math.min(1, f.koTime * 1.5));
    pc.translate(-14 * e, -2 * e);
    pc.rotate(-1.5 * e);
  }
  const squash = f.landSquash || 0;
  pc.scale(f.facing * (f.scale || 1) * (1 + squash * 0.05), (f.scale || 1) * (1 - squash * 0.07));
  drawFighterBody(pc, f, col, accent);
  pc.restore();

  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    pc.canvas,
    f.x - PIXEL_ORIGIN_X,
    GROUND_Y - f.y - PIXEL_ORIGIN_Y,
    PIXEL_VIEW_W,
    PIXEL_VIEW_H
  );
  ctx.imageSmoothingEnabled = prevSmooth;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFighterPortrait(ctx, f, x, y, size, flip = false) {
  const col = f.color;
  const accent = f.accent;
  ctx.save();
  roundRectPath(ctx, x, y, size, size, size * 0.12);
  ctx.clip();

  const bg = ctx.createLinearGradient(x, y, x, y + size);
  bg.addColorStop(0, 'rgba(9,5,22,0.98)');
  bg.addColorStop(1, 'rgba(3,1,9,0.98)');
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, size, size);

  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x + size / 2, y + size * 0.58, 2, x + size / 2, y + size * 0.58, size * 0.65);
  glow.addColorStop(0, hexA(col, 0.3));
  glow.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, size, size);
  ctx.globalCompositeOperation = 'source-over';

  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let i = -size; i < size * 2; i += 7) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + size, y + size);
    ctx.stroke();
  }

  ctx.translate(x + size / 2, y + size * 0.82);
  if (flip) ctx.scale(-1, 1);
  const sc = size / 100;
  ctx.scale(sc, sc);

  // плечи
  ctx.beginPath();
  ctx.moveTo(-46, 30);
  ctx.quadraticCurveTo(-40, -2, -23, -7);
  ctx.lineTo(23, -7);
  ctx.quadraticCurveTo(40, -2, 46, 30);
  ctx.closePath();
  ctx.fillStyle = '#08040f';
  ctx.fill();
  ctx.strokeStyle = hexA(col, 0.75);
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(18, 0);
  ctx.strokeStyle = hexA(accent, 0.45);
  ctx.lineWidth = 1.4;
  ctx.stroke();

  drawHead(ctx, f, col, accent, { head: [0, -30] });
  drawHeadGear(ctx, f, 0, -30, col, accent);

  ctx.restore();

  roundRectPath(ctx, x, y, size, size, size * 0.12);
  ctx.strokeStyle = hexA(col, 0.8);
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // неоновые уголки
  ctx.save();
  ctx.strokeStyle = hexA(accent, 0.9);
  ctx.lineWidth = 2;
  const c = size * 0.18;
  for (const [cx, cy, dx, dy] of [
    [x, y, 1, 1], [x + size, y, -1, 1],
    [x, y + size, 1, -1], [x + size, y + size, -1, -1]
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * 2, cy + dy * c);
    ctx.lineTo(cx + dx * 2, cy + dy * 2);
    ctx.lineTo(cx + dx * c, cy + dy * 2);
    ctx.stroke();
  }
  ctx.restore();
}

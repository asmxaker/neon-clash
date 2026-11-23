// Простой, но живой ИИ: держит дистанцию, блокирует, прыгает и бьёт.

import { Controller } from './input.js';
import { ARENA } from './fighter.js';

export class AIController extends Controller {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    super.reset();
    this.think = 0.2;
    this.cool = 0.5;
    this.blockTime = 0;
    this.blockCd = 0;
    this.crouchTime = 0;
    this.jumpCd = 0;
    this.tactic = 'approach';
    this.tacticTimer = 0.3;
    this.reaction = 0.1;
  }

  updateAI(dt, self, foe, game) {
    this.cool = Math.max(0, this.cool - dt);
    this.blockCd = Math.max(0, this.blockCd - dt);
    this.jumpCd = Math.max(0, this.jumpCd - dt);
    this.crouchTime = Math.max(0, this.crouchTime - dt);
    this.tacticTimer -= dt;

    const idle = !game || game.phase !== 'fight' || self.locked || !foe ||
      self.state === 'ko' || self.state === 'win' || self.hitstun > 0 || self.blockstun > 0 || self.attack;
    if (idle) {
      this.state.left = this.state.right = this.state.up = this.state.down = false;
      this.state.block = false;
      if (self.state === 'ko' || !foe) this.blockTime = 0;
      return;
    }

    const d = Math.abs(foe.x - self.x);
    const toward = foe.x >= self.x ? 'right' : 'left';
    const away = toward === 'right' ? 'left' : 'right';

    // ---- блок ----
    if (this.blockTime > 0) {
      this.blockTime -= dt;
      this.state.left = this.state.right = this.state.up = this.state.down = false;
      this.state.block = true;
      return;
    }
    this.state.block = false;

    // ---- реакция на снаряд ----
    for (const p of game.projectiles || []) {
      if (p.owner === self.index) continue;
      if (p.kind === 'lightning' && !p.struck && Math.abs(self.x - p.x) < 95) {
        const away = self.x >= p.x ? 'right' : 'left';
        this.state.left = this.state.right = this.state.up = this.state.down = false;
        this.state[away] = true;
        this.state.block = false;
        return;
      }
      const dirToSelf = Math.sign(self.x - p.x);
      if (dirToSelf === Math.sign(p.vx) && Math.abs(self.x - p.x) < 430 && self.y <= 0) {
        if (Math.random() < dt * 1.1) {
          this.blockTime = 0.26;
          this.state.block = true;
          this.state.left = this.state.right = false;
          return;
        }
      }
    }

    // ---- блок от атаки ----
    if (foe.attack && foe.attackT < foe.attack.startup + foe.attack.active + 0.02 && d < 230) {
      const reactChance = d < 170 ? 0.3 : 0.16;
      if (this.blockCd <= 0 && Math.random() < reactChance) {
        this.blockTime = 0.18 + Math.random() * 0.16;
        this.blockCd = 0.9;
        this.state.block = true;
        this.state.left = this.state.right = false;
        return;
      }
    }

    // ---- выбор тактики ----
    this.think -= dt;
    if (this.think <= 0) {
      this.think = 0.16 + Math.random() * 0.19;
      const r = Math.random();

      if (d > 340) {
        this.tactic = 'approach';
        this.tacticTimer = 0.5;
        if (this.meter >= 50 && this.cool <= 0 && r < 0.14) {
          this.press('special');
          this.cool = 1.4;
        }
      } else if (d > 230) {
        if (r < 0.1 && this.jumpCd <= 0) {
          this.tactic = 'jumpIn';
          this.tacticTimer = 0.75;
        } else {
          this.tactic = r < 0.88 ? 'approach' : 'hold';
          this.tacticTimer = 0.3 + Math.random() * 0.25;
        }
      } else if (d > 160) {
        if (r < 0.3) this.tryAttack(d, foe);
        else if (r < 0.4) this.tactic = 'retreat';
        else if (r < 0.48 && this.jumpCd <= 0) {
          this.tactic = 'jumpIn';
          this.tacticTimer = 0.75;
        }
        else this.tactic = 'approach';
        this.tacticTimer = Math.max(this.tacticTimer, 0.22);
      } else {
        if (r < 0.38) this.tryAttack(d, foe);
        else if (r < 0.55) this.tactic = 'hold';
        else if (r < 0.68) this.tactic = 'retreat';
        else if (r < 0.78) {
          this.crouchTime = 0.22;
          this.tactic = 'hold';
        } else this.tactic = 'approach';
        this.tacticTimer = Math.max(this.tacticTimer, 0.2);
      }
    }

    // ---- исполнение тактики ----
    this.state.left = this.state.right = this.state.up = this.state.down = false;

    if (this.crouchTime > 0) {
      this.state.down = true;
      return;
    }

    if (this.tacticTimer <= 0 && this.tactic !== 'jumpIn') {
      this.tactic = 'approach';
    }

    if (this.tactic === 'approach') {
      this.state[toward] = true;
    } else if (this.tactic === 'retreat') {
      // не зажиматься в угол
      const atWall = self.x < ARENA.left + 78 || self.x > ARENA.right - 78;
      this.state[atWall ? toward : away] = true;
    } else if (this.tactic === 'jumpIn') {
      this.state[toward] = true;
      if (self.y <= 0 && this.jumpCd <= 0) {
        this.press('up');
        this.state.up = true;
        this.jumpCd = 1.5;
      }
      if (self.y > 0 && d < 210 && !self.airAttackUsed && this.cool <= 0 && Math.random() < 0.12) {
        this.press('kick');
        this.cool = 0.5;
      }
      if (self.y <= 0 && this.tacticTimer <= -0.1) this.tactic = 'approach';
    }

    // добить, если соперник рядом и мы свободны
    if (d < 145 && this.cool <= 0 && Math.random() < dt * 1.4) {
      this.tryAttack(d, foe);
    }

    // использовать спец по назначению бойца
    if (self.meter >= 50 && this.cool <= 0 && Math.random() < dt * 1.2) {
      const want =
        (self.special === 'dash' && d > 70 && d < 360) ||
        (self.special === 'wave' && d > 80) ||
        (self.special === 'fan' && d > 70) ||
        (self.special === 'lightning' && d > 30) ||
        (self.special === 'plasma' && d > 80);
      if (want) {
        this.press('special');
        this.cool = 0.9;
        this.state.left = this.state.right = this.state.up = this.state.down = false;
        return;
      }
    }
  }

  tryAttack(d, foe) {
    if (this.cool > 0) return false;
    const crouching = foe && foe.isCrouching && foe.isCrouching();
    const r = Math.random();
    if (crouching || d > 150) {
      if (r < 0.82) this.press('kick');
      else this.press('punch');
    } else {
      if (r < 0.4) this.press('kick');
      else this.press('punch');
    }
    this.cool = 0.47 + Math.random() * 0.4;
    return true;
  }
}

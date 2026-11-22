// Абстрактный контроллер + сенсорный джойстик, клавиатура и объединение источников.
//
// Любой контроллер умеет:
//   isDown(action)  — действие удерживается
//   consume(action) — действие было нажато недавно (буфер ~150 мс)
// Это позволяет легко добавить позже сетевой/Bluetooth-контроллер.

export class Controller {
  constructor() {
    this.state = { left: false, right: false, up: false, down: false, block: false };
    this.presses = Object.create(null);
  }

  isDown(action) {
    return !!this.state[action];
  }

  press(action) {
    this.presses[action] = performance.now();
  }

  consume(action, windowMs = 170) {
    const t = this.presses[action];
    if (!t) return false;
    delete this.presses[action];
    return performance.now() - t <= windowMs;
  }

  clearPress(action) {
    if (action) delete this.presses[action];
    else this.presses = Object.create(null);
  }

  reset() {
    for (const k of Object.keys(this.state)) this.state[k] = false;
    this.clearPress();
  }
}

export class MergeController extends Controller {
  constructor(list) {
    super();
    this.list = list;
  }

  isDown(action) {
    return this.list.some(c => c.isDown(action));
  }

  consume(action, windowMs = 170) {
    let hit = false;
    // Сначала ищем самое свежее нажатие, чтобы не «съесть» его у другого источника.
    let best = null;
    for (const c of this.list) {
      const t = c.presses[action];
      if (t) {
        const age = performance.now() - t;
        if (age <= windowMs && (!best || t > best.t)) best = { c, t };
      }
    }
    if (best) {
      best.c.clearPress(action);
      hit = true;
    }
    for (const c of this.list) {
      const t = c.presses[action];
      if (t && performance.now() - t > windowMs) c.clearPress(action);
    }
    return hit;
  }

  reset() {
    for (const c of this.list) c.reset();
  }

  clearPresses() {
    for (const c of this.list) c.clearPress();
  }
}

export class TouchController extends Controller {
  constructor(padEl) {
    super();
    this.pad = padEl;
    this.stick = padEl.querySelector('.stick');
    this.knob = padEl.querySelector('.knob');
    this.buttons = [...padEl.querySelectorAll('[data-action]')];
    this.stickPointer = null;
    this.buttonPointers = new Map();
    this.upLatched = false;
    this.bind();
  }

  bind() {
    const stick = this.stick;
    stick.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.stickPointer !== null) return;
      this.stickPointer = e.pointerId;
      stick.setPointerCapture(e.pointerId);
      stick.classList.add('active');
      this.updateStick(e);
    });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.stickPointer) return;
      e.preventDefault();
      this.updateStick(e);
    });
    const endStick = (e) => {
      if (e.pointerId !== this.stickPointer) return;
      this.stickPointer = null;
      stick.classList.remove('active');
      this.state.left = this.state.right = this.state.up = this.state.down = false;
      this.upLatched = false;
      this.knob.style.transform = 'translate(0px, 0px)';
    };
    stick.addEventListener('pointerup', endStick);
    stick.addEventListener('pointercancel', endStick);

    for (const btn of this.buttons) {
      const action = btn.dataset.action;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.setPointerCapture(e.pointerId);
        this.buttonPointers.set(e.pointerId, action);
        this.state[action] = true;
        btn.classList.add('pressed');
        this.press(action);
      });
      const release = (e) => {
        const a = this.buttonPointers.get(e.pointerId);
        if (!a) return;
        this.buttonPointers.delete(e.pointerId);
        this.state[a] = false;
        btn.classList.remove('pressed');
      };
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('lostpointercapture', release);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    stick.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  updateStick(e) {
    const r = this.stick.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = r.width * 0.31;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = dx / len * max;
      dy = dy / len * max;
    }
    this.knob.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;

    const nx = dx / max;
    const ny = dy / max;
    const dead = 0.32;

    this.state.left = nx < -dead;
    this.state.right = nx > dead;
    this.state.down = ny > 0.52;
    const upNow = ny < -0.42;
    this.state.up = upNow;
    if (upNow && !this.upLatched) {
      this.upLatched = true;
      this.press('up');
    }
    if (!upNow) this.upLatched = false;
  }

  reset() {
    super.reset();
    this.stickPointer = null;
    this.upLatched = false;
    this.buttonPointers.clear();
    if (this.knob) this.knob.style.transform = 'translate(0px, 0px)';
    if (this.stick) this.stick.classList.remove('active');
    for (const b of this.buttons) b.classList.remove('pressed');
  }
}

export class KeyboardController extends Controller {
  constructor(keyMap) {
    super();
    this.map = keyMap;
    this.held = new Set();
    this.onDown = (e) => {
      const action = this.map[e.code];
      if (!action) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.state[action] = true;
      this.press(action);
    };
    this.onUp = (e) => {
      const action = this.map[e.code];
      if (!action) return;
      this.state[action] = false;
    };
    this.onBlur = () => this.reset();
    window.addEventListener('keydown', this.onDown, { passive: false });
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('blur', this.onBlur);
  }
}

export function makePlayerControllers() {
  const touch1 = new TouchController(document.getElementById('pad1'));
  const touch2 = new TouchController(document.getElementById('pad2'));

  const kb1 = new KeyboardController({
    KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down',
    KeyF: 'punch', KeyG: 'kick', KeyH: 'block', KeyT: 'special'
  });
  const kb2 = new KeyboardController({
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    Digit1: 'punch', Digit2: 'kick', Digit3: 'block', Digit4: 'special'
  });

  return {
    touch1, touch2, kb1, kb2,
    p1: new MergeController([touch1, kb1]),
    p2: new MergeController([touch2, kb2])
  };
}

// Небольшой синтезатор: все звуки генерируются через WebAudio, без файлов.

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxBus = null;
    this.musicBus = null;
    this.noiseBuffer = null;
    this.muted = false;
    try { this.muted = localStorage.getItem('nc_muted') === '1'; } catch (e) { /* ignore */ }
    this.step = 0;
    this.nextTime = 0;
    this.musicTimer = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();

    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 22;
    comp.ratio.value = 6;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;
    comp.connect(this.ctx.destination);

    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.62;
    this.master.connect(comp);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.9;
    this.sfxBus.connect(this.master);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.42;
    this.musicBus.connect(this.master);

    const len = Math.floor(this.ctx.sampleRate * 1.2);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
  }

  unlock() {
    this.init();
    if (!this.ctx) return;
    const start = () => this.startMusic();
    if (this.ctx.state === 'suspended') this.ctx.resume().then(start).catch(() => {});
    else start();
  }

  setMuted(muted) {
    this.muted = !!muted;
    try { localStorage.setItem('nc_muted', this.muted ? '1' : '0'); } catch (e) { /* ignore */ }
    if (this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.62, t, 0.03);
    }
    if (this.muted) this.stopMusic();
    else if (this.ctx && this.ctx.state === 'running') this.startMusic();
    return this.muted;
  }

  toggleMuted() { return this.setMuted(!this.muted); }

  // ---- низкоуровневые помощники ----

  tone({ freq, freqEnd = null, dur = 0.15, type = 'sine', vol = 0.2, delay = 0, dest = null }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, freq), t);
    if (freqEnd != null) o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest || this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  noise({ dur = 0.1, vol = 0.15, type = 'bandpass', freq = 1200, freqEnd = null, q = 0.8, delay = 0, dest = null }) {
    if (!this.ctx || !this.noiseBuffer) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) f.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest || this.sfxBus);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  // ---- SFX ----

  ui() {
    this.tone({ freq: 680, freqEnd: 900, dur: 0.055, type: 'square', vol: 0.05 });
  }

  whiff() {
    this.noise({ dur: 0.075, vol: 0.055, type: 'bandpass', freq: 1600, freqEnd: 500, q: 1.4 });
  }

  hit(power = 1) {
    const p = Math.min(1.6, power);
    this.tone({ freq: 150, freqEnd: 48, dur: 0.18, type: 'sine', vol: 0.42 * p });
    this.noise({ dur: 0.1, vol: 0.22 * p, type: 'lowpass', freq: 1800, freqEnd: 300, q: 0.7 });
    this.noise({ dur: 0.035, vol: 0.12 * p, type: 'highpass', freq: 2800, q: 0.7 });
  }

  block() {
    this.tone({ freq: 320, freqEnd: 210, dur: 0.075, type: 'square', vol: 0.09 });
    this.noise({ dur: 0.07, vol: 0.12, type: 'bandpass', freq: 3200, q: 2.2 });
  }

  jump() {
    this.tone({ freq: 300, freqEnd: 560, dur: 0.09, type: 'sine', vol: 0.06 });
  }

  specialCharge() {
    this.tone({ freq: 110, freqEnd: 470, dur: 0.24, type: 'sawtooth', vol: 0.07 });
    this.noise({ dur: 0.22, vol: 0.035, type: 'bandpass', freq: 400, freqEnd: 2200, q: 1.6 });
  }

  fire() {
    this.tone({ freq: 620, freqEnd: 130, dur: 0.26, type: 'sawtooth', vol: 0.11 });
    this.noise({ dur: 0.18, vol: 0.1, type: 'bandpass', freq: 2400, freqEnd: 600, q: 0.9 });
  }

  ko() {
    this.tone({ freq: 170, freqEnd: 34, dur: 0.85, type: 'sine', vol: 0.5 });
    this.noise({ dur: 0.7, vol: 0.24, type: 'lowpass', freq: 900, freqEnd: 120, q: 0.6 });
    this.tone({ freq: 900, freqEnd: 200, dur: 0.4, type: 'triangle', vol: 0.08, delay: 0.05 });
  }

  round() {
    this.tone({ freq: 330, dur: 0.1, type: 'square', vol: 0.07 });
    this.tone({ freq: 494, dur: 0.14, type: 'square', vol: 0.07, delay: 0.12 });
  }

  fight() {
    this.tone({ freq: 392, freqEnd: 784, dur: 0.22, type: 'sawtooth', vol: 0.12 });
    this.tone({ freq: 196, dur: 0.3, type: 'square', vol: 0.07, delay: 0.02 });
  }

  win() {
    const notes = [392, 523, 659, 784];
    notes.forEach((f, i) => this.tone({ freq: f, dur: 0.22, type: 'triangle', vol: 0.12, delay: i * 0.11 }));
  }

  timeout() {
    this.tone({ freq: 220, freqEnd: 110, dur: 0.4, type: 'square', vol: 0.09 });
  }

  // ---- музыка ----

  startMusic() {
    if (!this.ctx || this.muted || this.musicTimer) return;
    if (this.ctx.state !== 'running') return;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.musicTimer = setInterval(() => this.scheduleMusic(), 40);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  scheduleMusic() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const ahead = this.ctx.currentTime + 0.22;
    let guard = 0;
    while (this.nextTime < ahead && guard++ < 32) {
      this.playStep(this.step, this.nextTime);
      this.step = (this.step + 1) % 64;
      this.nextTime += 0.145;
    }
  }

  playStep(step, t) {
    const bar = Math.floor(step / 16) % 4;
    const s = step % 16;
    const roots = [55, 55, 43.65, 49]; // A1 A1 F1 G1
    const root = roots[bar];
    const delay = Math.max(0, t - this.ctx.currentTime);
    const music = this.musicBus;

    if (s % 2 === 0) {
      this.tone({ freq: root, freqEnd: root * 0.98, dur: 0.26, type: 'sawtooth', vol: 0.13, delay, dest: music });
    }
    if (s === 0 || s === 4 || s === 8 || s === 12) this.kick(delay);
    if (s % 2 === 1) {
      this.noise({ dur: 0.028, vol: 0.038, type: 'highpass', freq: 7200, q: 1, delay, dest: music });
    }
    if (s === 0) {
      [1, 1.1892, 1.4983].forEach((m, i) => {
        this.tone({ freq: root * 4 * m, dur: 0.9, type: 'triangle', vol: 0.018, delay: delay + i * 0.004, dest: music });
      });
    }
    if (s === 2 || s === 6 || s === 10 || s === 14) {
      const arp = [4, 6, 9, 6][(step / 2 | 0) % 4];
      this.tone({ freq: root * arp, dur: 0.16, type: 'triangle', vol: 0.022, delay, dest: music });
    }
  }

  kick(delay = 0) {
    this.tone({ freq: 110, freqEnd: 42, dur: 0.14, type: 'sine', vol: 0.3, delay, dest: this.musicBus });
  }
}

export const audio = new AudioEngine();

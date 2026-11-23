// Небольшой синтезатор: все звуки генерируются через WebAudio, без файлов.

// stepDur — длительность 1/16, roots — аккордовая сетка по тактам.
const TRACKS = {
  menu: {
    stepDur: 0.148, roots: [55, 55, 43.65, 49],
    bass: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null],
    bassType: 'sawtooth', bassVol: 0.11, bassDur: 0.26,
    kick: [0, 4, 8, 12], kickVol: 0.28, hat: [1, 3, 5, 7, 9, 11, 13, 15], hatVol: 0.028,
    arp: [null, null, 24, null, null, null, 27, null, null, null, 31, null, null, null, 27, null],
    arpType: 'triangle', arpVol: 0.022, pad: [12, 16, 19], padVol: 0.016
  },
  select: {
    stepDur: 0.134, roots: [49, 55, 58.27, 43.65],
    bass: [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, null, 0, null],
    bassType: 'triangle', bassVol: 0.10, bassDur: 0.22,
    kick: [0, 4, 8, 12], kickVol: 0.22, snare: [4, 12], snareVol: 0.55,
    hat: [1, 3, 5, 7, 9, 11, 13, 15], hatVol: 0.024,
    arp: [null, 24, null, 28, null, 31, null, 36, null, 31, null, 28, null, 31, null, 36],
    arpType: 'triangle', arpVol: 0.02, pad: [12, 16, 19], padVol: 0.014
  },
  stage_city: {
    stepDur: 0.121, roots: [55, 55, 43.65, 49],
    bass: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null],
    bassType: 'sawtooth', bassVol: 0.14, bassDur: 0.22,
    kick: [0, 4, 8, 12], kickVol: 0.32, snare: [4, 12], snareVol: 0.8,
    hat: [1, 3, 5, 7, 9, 11, 13, 15], hatVol: 0.04,
    arp: [24, 27, 31, 36, 31, 27, 24, 27, 31, 36, 34, 31, 27, 24, 27, 31],
    arpType: 'square', arpVol: 0.017, pad: [12, 16, 19], padVol: 0.015
  },
  stage_dojo: {
    stepDur: 0.156, roots: [55, 49, 43.65, 49],
    bass: [0, null, null, null, null, null, 0, null, 0, null, null, null, null, null, 0, null],
    bassType: 'triangle', bassVol: 0.12, bassDur: 0.3,
    kick: [0, 3, 6, 10, 12], kickVol: 0.24, snare: [4, 12, 15], snareVol: 0.5,
    tom: [0, 3, 6, 10, 12], tomVol: 0.10,
    hat: [2, 6, 10, 14], hatVol: 0.018,
    arp: [null, 24, null, 27, null, 29, null, 31, null, 36, null, 31, null, 29, null, 27],
    arpType: 'triangle', arpVol: 0.024, pad: [12, 15, 19], padVol: 0.018
  },
  stage_reactor: {
    stepDur: 0.114, roots: [43.65, 43.65, 41.2, 49],
    bass: [0, null, -12, null, 0, null, -12, null, 0, null, -12, null, 0, null, -12, null],
    bassType: 'square', bassVol: 0.12, bassDur: 0.18,
    kick: [0, 2, 4, 6, 8, 10, 12, 14], kickVol: 0.26, snare: [4, 12], snareVol: 0.6,
    hat: [1, 5, 9, 13], hatVol: 0.035, metal: [3, 7, 11, 15], alarm: true,
    arp: [24, null, null, null, 27, null, null, null, 24, null, null, null, 31, null, null, null],
    arpType: 'sawtooth', arpVol: 0.014, pad: [12, 15, 18], padVol: 0.012
  },
  stage_orbit: {
    stepDur: 0.178, roots: [55, 49, 43.65, 49],
    bass: [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null],
    bassType: 'sine', bassVol: 0.12, bassDur: 0.6,
    kick: [0, 8], kickVol: 0.18, snare: [], hat: [4, 12], hatVol: 0.012,
    arp: [36, null, null, null, 43, null, null, null, 39, null, null, null, 31, null, null, null],
    arpType: 'sine', arpVol: 0.024, pad: [12, 19, 24, 28], padVol: 0.02
  },
  stage_tundra: {
    stepDur: 0.163, roots: [58.27, 55, 49, 43.65],
    bass: [0, null, null, null, null, null, 0, null, 0, null, null, null, null, null, 0, null],
    bassType: 'triangle', bassVol: 0.10, bassDur: 0.32,
    kick: [0, 4, 8, 12], kickVol: 0.20, snare: [4, 12], snareVol: 0.35,
    hat: [1, 3, 5, 7, 9, 11, 13, 15], hatVol: 0.02,
    arp: [36, null, 41, null, 43, null, 48, null, 43, null, 41, null, 36, null, 41, null],
    arpType: 'sine', arpVol: 0.03, pad: [12, 19, 24], padVol: 0.02
  },
  boss: {
    stepDur: 0.106, roots: [41.2, 41.2, 43.65, 38.89],
    bass: [0, null, -12, null, 0, null, -12, null, 0, null, -12, null, 0, null, -12, null],
    bassType: 'sawtooth', bassVol: 0.17, bassDur: 0.2,
    kick: [0, 2, 4, 6, 8, 10, 12, 14], kickVol: 0.34, snare: [4, 12], snareVol: 0.9,
    hat: [1, 3, 5, 7, 9, 11, 13, 15], hatVol: 0.04, metal: [7, 15], alarm: true,
    arp: [24, 27, 30, 36, 30, 27, 24, 27, 30, 36, 39, 36, 30, 27, 24, 27],
    arpType: 'square', arpVol: 0.018, pad: [12, 15, 18], padVol: 0.016
  }
};

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
    this.trackId = 'menu';
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

  combo(step = 2) {
    const base = 620 + Math.min(3, step) * 95;
    this.tone({ freq: base, freqEnd: base * 1.2, dur: 0.06, type: 'triangle', vol: 0.06 });
    this.tone({ freq: base * 1.5, dur: 0.08, type: 'square', vol: 0.035, delay: 0.045 });
  }

  jump() {
    this.tone({ freq: 300, freqEnd: 560, dur: 0.09, type: 'sine', vol: 0.06 });
  }

  command(key = '') {
    const heavy = key === 'breakerPunch' || key === 'breakerKick';
    this.noise({ dur: heavy ? 0.24 : 0.14, vol: heavy ? 0.12 : 0.07, type: 'bandpass', freq: heavy ? 500 : 900, freqEnd: heavy ? 1800 : 2200, q: 1.2 });
    this.tone({ freq: heavy ? 120 : 240, freqEnd: heavy ? 60 : 430, dur: heavy ? 0.22 : 0.12, type: 'sawtooth', vol: heavy ? 0.08 : 0.05 });
  }

  specialCharge() {
    this.tone({ freq: 110, freqEnd: 470, dur: 0.24, type: 'sawtooth', vol: 0.07 });
    this.noise({ dur: 0.22, vol: 0.035, type: 'bandpass', freq: 400, freqEnd: 2200, q: 1.6 });
  }

  fire() {
    this.tone({ freq: 620, freqEnd: 130, dur: 0.26, type: 'sawtooth', vol: 0.11 });
    this.noise({ dur: 0.18, vol: 0.1, type: 'bandpass', freq: 2400, freqEnd: 600, q: 0.9 });
  }

  shockwave() {
    this.tone({ freq: 95, freqEnd: 36, dur: 0.5, type: 'sine', vol: 0.4 });
    this.noise({ dur: 0.42, vol: 0.24, type: 'lowpass', freq: 620, freqEnd: 90, q: 0.6 });
    this.tone({ freq: 240, freqEnd: 70, dur: 0.24, type: 'square', vol: 0.07 });
  }

  dash() {
    this.noise({ dur: 0.22, vol: 0.12, type: 'bandpass', freq: 600, freqEnd: 2600, q: 1.4 });
    this.tone({ freq: 180, freqEnd: 520, dur: 0.18, type: 'sawtooth', vol: 0.05 });
  }

  shard() {
    this.tone({ freq: 1500, freqEnd: 2400, dur: 0.12, type: 'triangle', vol: 0.06 });
    this.tone({ freq: 2200, freqEnd: 3200, dur: 0.1, type: 'sine', vol: 0.04, delay: 0.03 });
    this.noise({ dur: 0.16, vol: 0.06, type: 'highpass', freq: 3200, q: 1.2 });
  }

  thunder() {
    this.tone({ freq: 150, freqEnd: 34, dur: 0.75, type: 'sine', vol: 0.5 });
    this.noise({ dur: 0.18, vol: 0.3, type: 'highpass', freq: 2400, q: 0.7 });
    this.noise({ dur: 0.6, vol: 0.26, type: 'lowpass', freq: 1400, freqEnd: 100, q: 0.6 });
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

  setMusic(trackId) {
    const next = TRACKS[trackId] ? trackId : 'menu';
    if (this.trackId === next) return;
    this.trackId = next;
    if (this.ctx && !this.muted && this.ctx.state === 'running') this.restartMusic();
  }

  restartMusic() {
    this.stopMusic();
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.musicTimer = setInterval(() => this.scheduleMusic(), 40);
  }

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
    const cfg = TRACKS[this.trackId] || TRACKS.menu;
    const loop = cfg.roots.length * 16;
    const ahead = this.ctx.currentTime + 0.22;
    let guard = 0;
    while (this.nextTime < ahead && guard++ < 32) {
      this.playStep(this.step, this.nextTime, cfg);
      this.step = (this.step + 1) % loop;
      this.nextTime += cfg.stepDur;
    }
  }

  playStep(step, t, cfg) {
    const bar = Math.floor(step / 16) % cfg.roots.length;
    const s = step % 16;
    const root = cfg.roots[bar];
    const delay = Math.max(0, t - this.ctx.currentTime);
    const music = this.musicBus;
    const semi = (n) => root * Math.pow(2, n / 12);

    if (cfg.bass && cfg.bass[s] != null) {
      this.tone({
        freq: semi(cfg.bass[s]), freqEnd: semi(cfg.bass[s]) * 0.985,
        dur: cfg.bassDur || 0.24, type: cfg.bassType || 'sawtooth',
        vol: cfg.bassVol || 0.12, delay, dest: music
      });
    }
    if (cfg.kick && cfg.kick.includes(s)) this.kick(delay, cfg.kickVol || 0.3);
    if (cfg.snare && cfg.snare.includes(s)) this.snare(delay, (cfg.snareVol || 0.6) * 0.16);
    if (cfg.hat && cfg.hat.includes(s)) this.hat(delay, cfg.hatVol || 0.03);
    if (cfg.tom && cfg.tom.includes(s)) {
      this.tone({ freq: semi(-12), freqEnd: semi(-12) * 0.8, dur: 0.18, type: 'sine', vol: cfg.tomVol || 0.1, delay, dest: music });
    }
    if (cfg.metal && cfg.metal.includes(s)) {
      this.noise({ dur: 0.06, vol: 0.05, type: 'highpass', freq: 4200, q: 1.4, delay, dest: music });
    }
    if (cfg.alarm && s === 0 && bar % 2 === 0) {
      this.tone({ freq: semi(36), freqEnd: semi(36) * 0.75, dur: 0.16, type: 'square', vol: 0.025, delay, dest: music });
    }
    if (cfg.pad && s === 0) {
      for (let i = 0; i < cfg.pad.length; i++) {
        this.tone({
          freq: semi(cfg.pad[i]), dur: cfg.stepDur * 15, type: 'triangle',
          vol: (cfg.padVol || 0.016) / (i * 0.35 + 1), delay: delay + i * 0.006, dest: music
        });
      }
    }
    if (cfg.arp && cfg.arp[s] != null) {
      this.tone({
        freq: semi(cfg.arp[s]), dur: cfg.stepDur * 0.9, type: cfg.arpType || 'triangle',
        vol: cfg.arpVol || 0.02, delay, dest: music
      });
    }
  }

  snare(delay = 0, vol = 0.1) {
    this.noise({ dur: 0.11, vol, type: 'bandpass', freq: 1900, q: 1.1, delay, dest: this.musicBus });
    this.tone({ freq: 190, freqEnd: 120, dur: 0.09, type: 'triangle', vol: vol * 0.8, delay, dest: this.musicBus });
  }

  hat(delay = 0, vol = 0.03) {
    this.noise({ dur: 0.028, vol, type: 'highpass', freq: 7600, q: 1, delay, dest: this.musicBus });
  }

  kick(delay = 0, vol = 0.3) {
    this.tone({ freq: 110, freqEnd: 42, dur: 0.14, type: 'sine', vol, delay, dest: this.musicBus });
  }

}

export const audio = new AudioEngine();

// Сетевой режим «рядом»: Nearby Connections (Bluetooth/Wi-Fi), хост-авторитетная синхронизация.

import { Controller } from './input.js';

const SERVICE_ID = 'com.neonclash.game';
const ENDPOINT_NAME = 'Neon Clash';

export class RemoteController extends Controller {
  constructor() {
    super();
    this.prev = { up: false, punch: false, kick: false, special: false };
  }

  applyState(s) {
    const st = {
      left: !!s.l,
      right: !!s.r,
      up: !!s.u,
      down: !!s.d,
      block: !!s.b
    };
    const btn = { up: st.up, punch: !!s.p, kick: !!s.k, special: !!s.s };
    for (const a of ['up', 'punch', 'kick', 'special']) {
      if (btn[a] && !this.prev[a]) this.press(a);
    }
    this.state = st;
    this.prev = btn;
  }

  reset() {
    super.reset();
    this.prev = { up: false, punch: false, kick: false, special: false };
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class LinkManager {
  constructor() {
    this.plugin = null;
    this.available = false;
    this.prepared = false;
    this.ready = false;
    this.role = null;
    this.connected = false;
    this.endpointID = null;
    this.peerName = '';
    this.ownChar = 'volt';
    this.peerChar = null;
    this.found = new Map();
    this.handles = [];
    this.attached = false;
    this.hostGame = null;
    this.guestGame = null;
    this.remote = new RemoteController();
    this.snapshotTimer = null;
    this.inputTimer = null;
    this.sending = false;
    this.outbox = [];
    this.pendingInput = null;
    this.pendingSnap = false;
    this.lastSnap = null;
    this.lastInput = null;
    this.callbacks = {};
    this.disconnecting = false;
  }

  on(handlers) {
    Object.assign(this.callbacks, handlers || {});
  }

  status(text, kind = 'info') {
    this.callbacks.onStatus?.(text, kind);
  }

  endpoints() {
    this.callbacks.onEndpoints?.(Array.from(this.found.values()));
  }

  async prepare() {
    if (this.prepared) return this.available;
    this.prepared = true;
    try {
      this.plugin = await this.loadPlugin();
      this.available = !!this.plugin;
    } catch (e) {
      this.plugin = null;
      this.available = false;
    }
    return this.available;
  }

  async loadPlugin() {
    const cap = window.Capacitor;
    if (!cap) return null;
    if (cap.getPlatform?.() === 'web') return null;
    // В Android WebView Capacitor регистрирует нативный прокси плагина автоматически.
    return cap.Plugins?.NearbyConnections || null;
  }

  async ensureReady() {
    if (!this.plugin) {
      const ok = await this.prepare();
      if (!ok || !this.plugin) throw new Error('BLUETOOTH-РЕЖИМ ДОСТУПЕН ТОЛЬКО В ANDROID-ПРИЛОЖЕНИИ');
    }
    if (this.ready) return;

    const p = this.plugin;
    try {
      let perm = await p.checkPermissions();
      const need = ['bluetoothNearby', 'wifiNearby', 'location', 'locationCoarse', 'bluetoothLegacy', 'wifiState'];
      const missing = !perm ? need : need.filter((k) => perm[k] && perm[k] !== 'granted');
      if (missing.length) {
        this.status('ЗАПРАШИВАЕМ РАЗРЕШЕНИЯ...');
        try {
          perm = await p.requestPermissions({ permissions: need });
        } catch (e) {
          perm = await p.requestPermissions();
        }
      }
      if (perm && perm.bluetoothNearby === 'denied' && perm.wifiNearby === 'denied') {
        throw new Error('НУЖНЫ РАЗРЕШЕНИЯ НА BLUETOOTH И УСТРОЙСТВА РЯДОМ');
      }
    } catch (e) {
      // На старых Android разрешение location может быть не выдано — пробуем инициализацию.
      if (String(e?.message || '').includes('НУЖНЫ')) throw e;
    }

    this.status('ВКЛЮЧАЕМ СВЯЗЬ...');
    await p.initialize({
      serviceID: SERVICE_ID,
      endpointName: ENDPOINT_NAME,
      strategy: 'pointToPoint',
      lowPower: false,
      autoConnect: false
    });
    await this.attach();
    this.ready = true;
  }

  async attach() {
    if (this.attached) return;
    this.attached = true;
    const p = this.plugin;
    const add = (name, fn) => {
      try {
        const res = p.addListener(name, fn);
        if (res && typeof res.then === 'function') res.then((h) => this.handles.push(h)).catch(() => {});
        else if (res) this.handles.push(res);
      } catch (e) { /* ignore */ }
    };

    add('onEndpointFound', (ep) => {
      if (!ep || !ep.endpointID) return;
      if (this.role !== 'guest') return;
      this.found.set(ep.endpointID, ep);
      this.endpoints();
    });

    add('onEndpointLost', (ep) => {
      if (!ep) return;
      this.found.delete(ep.endpointID);
      this.endpoints();
    });

    add('onEndpointInitiated', async (ep) => {
      if (!ep || !ep.endpointID) return;
      if (!this.endpointID) this.endpointID = ep.endpointID;
      this.status('ПОДТВЕРЖДАЕМ СОЕДИНЕНИЕ...');
      try { await this.plugin.acceptConnection({ endpointID: ep.endpointID }); } catch (e) { /* ignore */ }
    });

    add('onEndpointConnected', async (ep) => {
      if (!ep || !ep.endpointID) return;
      this.endpointID = ep.endpointID;
      this.connected = true;
      this.found.clear();
      this.endpoints();
      this.status('СОЕДИНЕНИЕ УСТАНОВЛЕНО');
      await this.stopScanning();
      this.sendHello();
      this.callbacks.onConnected?.({ endpointID: this.endpointID });
    });

    add('onEndpointRejected', () => {
      this.status('СОЕДИНЕНИЕ ОТКЛОНЕНО', 'error');
      this.callbacks.onConnected?.({ rejected: true });
    });

    add('onEndpointFailed', () => {
      this.status('НЕ УДАЛОСЬ СОЕДИНИТЬСЯ', 'error');
    });

    add('onEndpointDisconnected', () => {
      this.handleDisconnected('СОЕДИНЕНИЕ ПОТЕРЯНО');
    });

    add('onPayloadReceived', (ev) => this.onPayload(ev));

    add('onBluetoothStateChanged', (state) => {
      if (state === 'poweredOff') this.status('ВКЛЮЧИТЕ BLUETOOTH', 'warn');
      else if (state === 'unauthorized') this.status('НЕТ ДОСТУПА К BLUETOOTH', 'error');
      else if (state === 'poweredOn' && this.role) this.status('BLUETOOTH ВКЛЮЧЁН');
    });
  }

  async stopScanning() {
    try { await this.plugin?.stopAdvertising?.(); } catch (e) { /* ignore */ }
    try { await this.plugin?.stopDiscovery?.(); } catch (e) { /* ignore */ }
  }

  async startHost(charId) {
    this.resetSession();
    if (this.connected || this.endpointID) await this.disconnect(true);
    this.role = 'host';
    this.ownChar = charId;
    this.peerChar = null;
    this.hostGame = null;
    this.connected = false;
    this.status('СОЗДАЁМ КОМНАТУ...');
    await this.ensureReady();
    await this.stopScanning();
    try {
      await this.plugin.startAdvertising({ endpointName: ENDPOINT_NAME, connectionType: 'balanced' });
      this.status('ОЖИДАНИЕ ИГРОКА...');
    } catch (e) {
      this.status('BLUETOOTH НЕДОСТУПЕН: ' + (e?.message || 'ОШИБКА'), 'error');
      throw e;
    }
  }

  async startJoin(charId) {
    this.resetSession();
    if (this.connected || this.endpointID) await this.disconnect(true);
    this.role = 'guest';
    this.ownChar = charId;
    this.peerChar = null;
    this.guestGame = null;
    this.connected = false;
    this.status('ИЩЕМ ИГРОКА РЯДОМ...');
    await this.ensureReady();
    await this.stopScanning();
    try {
      await this.plugin.startDiscovery({});
    } catch (e) {
      this.status('ПОИСК НЕДОСТУПЕН: ' + (e?.message || 'ОШИБКА'), 'error');
      throw e;
    }
  }

  async connect(ep) {
    if (this.role !== 'guest' || !ep) return;
    this.status('ПОДКЛЮЧАЕМСЯ К ' + (ep.endpointName || 'ИГРОКУ') + '...');
    try {
      await this.plugin.stopDiscovery();
      await this.plugin.requestConnection({
        endpointID: ep.endpointID,
        endpointName: ep.endpointName || ENDPOINT_NAME
      });
    } catch (e) {
      this.status('НЕ УДАЛОСЬ ПОДКЛЮЧИТЬСЯ', 'error');
    }
  }

  sendHello() {
    this.sendControl({ t: 'hello', char: this.ownChar, name: ENDPOINT_NAME });
  }

  sendStart(hostChar, guestChar) {
    this.ownChar = hostChar;
    this.peerChar = guestChar;
    this.sendControl({ t: 'start', hostChar, guestChar });
    this.stopScanning();
    this.status('БОЙ');
  }

  requestRematch() {
    this.sendControl({ t: 'rematch' });
  }

  sendBye() {
    this.sendControl({ t: 'bye' });
  }

  sendControl(msg) {
    if (!msg) return;
    this.outbox.push(msg);
    this.pump();
  }

  queueInput(s) {
    this.pendingInput = s;
    this.pump();
  }

  queueSnapshot() {
    this.pendingSnap = true;
    this.pump();
  }

  async pump() {
    if (this.sending || !this.connected || !this.endpointID || !this.plugin) return;
    let msg = null;
    if (this.outbox.length) msg = this.outbox.shift();
    else if (this.pendingInput) {
      msg = { t: 'input', s: this.pendingInput };
      this.pendingInput = null;
    } else if (this.pendingSnap) {
      this.pendingSnap = false;
      msg = this.buildSnapshot();
    }
    if (!msg) return;
    this.sending = true;
    try {
      await this.plugin.sendPayload({ endpointID: this.endpointID, payload: JSON.stringify(msg) });
    } catch (e) {
      this.status('ОШИБКА ОТПРАВКИ', 'warn');
    } finally {
      this.sending = false;
      if (this.outbox.length || this.pendingInput || this.pendingSnap) this.pump();
    }
  }

  buildSnapshot() {
    const g = this.hostGame;
    if (!g || g.screen !== 'match') return null;
    return {
      t: 'snap',
      ph: g.phase,
      pt: Number(g.phaseT.toFixed(2)),
      tm: Number(g.timer.toFixed(2)),
      rd: g.round,
      w: [g.wins[0], g.wins[1]],
      rw: g.roundWinner ?? -1,
      rr: g.roundReason || '',
      mw: g.matchWinner ?? -1,
      f: g.fighters.map((f) => ({
        x: Number(f.x.toFixed(1)),
        y: Number(f.y.toFixed(1)),
        vy: Number(f.vy.toFixed(0)),
        fc: f.facing,
        hp: Number(f.health.toFixed(1)),
        mh: f.maxHealth,
        dh: Number(f.displayHealth.toFixed(1)),
        m: Number(f.meter.toFixed(1)),
        st: f.state,
        stt: Number(f.stateTime.toFixed(2)),
        at: f.attack?.kind || null,
        atT: Number(f.attackT.toFixed(2)),
        as: f.attack ? Number(f.attack.startup.toFixed(3)) : 0,
        aa: f.attack ? Number(f.attack.active.toFixed(3)) : 0,
        ar: f.attack ? Number(f.attack.recovery.toFixed(3)) : 0,
        hs: Number(f.hitstun.toFixed(2)),
        bs: Number(f.blockstun.toFixed(2)),
        c: f.combo,
        ct: Number(f.comboTimer.toFixed(2)),
        fl: Number(f.flash.toFixed(2)),
        kt: Number(f.koTime.toFixed(2)),
        wt: Number(f.winTime.toFixed(2))
      })),
      p: g.projectiles.map((p) => ({
        k: p.kind,
        x: Number(p.x.toFixed(1)),
        y: Number(p.y.toFixed(1)),
        vx: Number(p.vx.toFixed(0)),
        vy: Number((p.vy || 0).toFixed(0)),
        r: p.r,
        hw: p.hitW || 0,
        hh: p.hitH || 0,
        o: p.owner,
        life: Number((p.life || 0).toFixed(2)),
        dl: Number((p.delay ?? 0).toFixed(2)),
        sk: p.struck ? 1 : 0,
        st: Number((p.strikeT || 0).toFixed(2)),
        color: p.color || '',
        hd: p.hitDir || 0,
        ub: p.unblockable ? 1 : 0
      }))
    };
  }

  bindHostGame(game) {
    this.hostGame = game;
    this.hostMatch = true;
    if (this.snapshotTimer) clearInterval(this.snapshotTimer);
    this.snapshotTimer = setInterval(() => {
      if (this.connected && this.hostGame && this.hostGame.screen === 'match') this.queueSnapshot();
    }, 33);
  }

  bindGuestGame(game) {
    this.guestGame = game;
    if (this.lastSnap && game?.receiveSnapshot) {
      game.receiveSnapshot(this.lastSnap);
      this.lastSnap = null;
    }
  }

  startGuestInput(controller) {
    if (this.inputTimer) clearInterval(this.inputTimer);
    let lastSent = 0;
    let lastJson = '';
    this.inputTimer = setInterval(() => {
      if (!this.connected || this.role !== 'guest' || !controller) return;
      const s = {
        l: controller.isDown('left') ? 1 : 0,
        r: controller.isDown('right') ? 1 : 0,
        u: controller.isDown('up') ? 1 : 0,
        d: controller.isDown('down') ? 1 : 0,
        b: controller.isDown('block') ? 1 : 0,
        p: controller.isDown('punch') ? 1 : 0,
        k: controller.isDown('kick') ? 1 : 0,
        s: controller.isDown('special') ? 1 : 0
      };
      const json = JSON.stringify(s);
      const now = performance.now();
      if (json !== lastJson || now - lastSent > 150) {
        lastJson = json;
        lastSent = now;
        this.queueInput(s);
      }
    }, 33);
  }

  stopTimers() {
    if (this.snapshotTimer) clearInterval(this.snapshotTimer);
    if (this.inputTimer) clearInterval(this.inputTimer);
    this.snapshotTimer = null;
    this.inputTimer = null;
  }

  onPayload(ev) {
    let msg = null;
    try {
      const raw = ev && (ev.payload ?? ev.data);
      msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      return;
    }
    if (!msg || typeof msg !== 'object') return;

    if (msg.t === 'hello') {
      this.peerChar = msg.char || 'volt';
      this.peerName = msg.name || 'ИГРОК';
      this.status(this.role === 'host' ? 'ИГРОК ПОДКЛЮЧЁН · МОЖНО НАЧИНАТЬ' : 'ПОДКЛЮЧЕНО · ЖДЁМ ХОСТА');
      this.callbacks.onPeer?.({ char: this.peerChar, name: this.peerName });
      return;
    }

    if (msg.t === 'start') {
      if (this.role !== 'guest') return;
      this.peerChar = msg.hostChar;
      this.ownChar = msg.guestChar;
      this.status('БОЙ');
      this.stopTimers();
      this.lastSnap = null;
      this.callbacks.onStart?.(msg);
      return;
    }

    if (msg.t === 'input') {
      if (this.role === 'host') this.remote.applyState(msg.s || {});
      return;
    }

    if (msg.t === 'snap') {
      if (this.role !== 'guest') return;
      if (this.guestGame?.receiveSnapshot) this.guestGame.receiveSnapshot(msg);
      else this.lastSnap = msg;
      return;
    }

    if (msg.t === 'rematch') {
      if (this.role === 'host') this.callbacks.onRematchRequest?.();
      return;
    }

    if (msg.t === 'bye') {
      this.handleDisconnected('СОПЕРНИК ВЫШЕЛ');
    }
  }

  async disconnect(silent = false) {
    if (this.disconnecting) return;
    this.disconnecting = true;
    try {
      if (this.connected) this.sendBye();
      await delay(30);
      if (this.endpointID) {
        try { await this.plugin?.disconnect?.({ endpointID: this.endpointID }); } catch (e) { /* ignore */ }
      }
      await this.stopScanning();
    } finally {
      this.stopTimers();
      this.connected = false;
      this.endpointID = null;
      this.hostGame = null;
      this.guestGame = null;
      this.remote.reset();
      this.outbox = [];
      this.pendingInput = null;
      this.pendingSnap = false;
      this.found.clear();
      this.role = null;
      this.lastSnap = null;
      this.disconnecting = false;
      this.endpoints();
      if (!silent) this.status('СВЯЗЬ ЗАВЕРШЕНА');
    }
  }

  handleDisconnected(reason) {
    if (this.disconnecting) return;
    if (!this.role) return;
    if (!this.connected && !this.endpointID) return;
    this.connected = false;
    this.endpointID = null;
    this.stopTimers();
    this.stopScanning();
    this.remote.reset();
    this.guestGame = null;
    this.hostGame = null;
    this.status(reason, 'warn');
    this.callbacks.onDisconnected?.(reason);
  }

  resetSession() {
    this.stopTimers();
    this.connected = false;
    this.endpointID = null;
    this.hostGame = null;
    this.guestGame = null;
    this.remote.reset();
    this.outbox = [];
    this.pendingInput = null;
    this.pendingSnap = false;
    this.found.clear();
    this.lastSnap = null;
    this.peerChar = null;
    this.peerName = '';
    this.role = null;
  }

  async dispose() {
    await this.disconnect(true);
    for (const h of this.handles) {
      try { await h.remove?.(); } catch (e) { /* ignore */ }
    }
    this.handles = [];
    this.attached = false;
    this.ready = false;
  }
}

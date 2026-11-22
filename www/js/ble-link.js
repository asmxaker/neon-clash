// Прямое BLE-подключение: хост — GATT-периферия, гость — центральное устройство.
// Использует @capgo/capacitor-bluetooth-low-energy и тот же хост-авторитетный протокол.

import { LinkManager } from './link.js';

const SERVICE = '6e6f6e65-636c-6173-6801-000000000001';
const CHAR_RX = '6e6f6e65-636c-6173-6801-000000000002'; // гость → хост
const CHAR_TX = '6e6f6e65-636c-6173-6801-000000000003'; // хост → гость
const CHUNK = 180;
const SNAP_MS = 120;

const PHASES = ['idle', 'intro', 'fight', 'roundEnd', 'matchEnd'];
const STATES = ['idle', 'walk', 'jump', 'crouch', 'block', 'hit', 'attack', 'ko', 'win'];
const ATTACK_CODES = [null, 'punch', 'kick', 'airkick', 'special', 'shockwave', 'dash', 'fan', 'lightning'];
const PROJ_CODES = [null, 'plasma', 'wave', 'shard', 'lightning'];

const TX_PROPS = {
  broadcast: false, read: false, writeWithoutResponse: false, write: false,
  notify: true, indicate: false, authenticatedSignedWrites: false, extendedProperties: false
};
const RX_PROPS = {
  broadcast: false, read: true, writeWithoutResponse: true, write: true,
  notify: false, indicate: false, authenticatedSignedWrites: false, extendedProperties: false
};

function buildBleSnapshot(game) {
  if (!game || game.screen !== 'match') return null;
  return {
    t: 'snap',
    ph: Math.max(0, PHASES.indexOf(game.phase)),
    pt: Math.round(game.phaseT * 100),
    tm: Math.round(game.timer * 10),
    rd: game.round,
    w: [game.wins[0], game.wins[1]],
    rw: game.roundWinner ?? -1,
    rr: game.roundReason === 'ko' ? 1 : game.roundReason === 'time' ? 2 : 0,
    mw: game.matchWinner ?? -1,
    f: game.fighters.map((f) => {
      const a = f.attack;
      return [
        Math.round(f.x), Math.round(f.y), Math.round(f.vy), f.facing,
        Math.round(f.health), f.maxHealth, Math.round(f.displayHealth), Math.round(f.meter),
        Math.max(0, STATES.indexOf(f.state)), Math.round(f.stateTime * 100),
        a ? Math.max(0, ATTACK_CODES.indexOf(a.kind)) : 0, Math.round(f.attackT * 100),
        a ? Math.round(a.startup * 1000) : 0,
        a ? Math.round(a.active * 1000) : 0,
        a ? Math.round(a.recovery * 1000) : 0,
        Math.round(f.hitstun * 100), Math.round(f.blockstun * 100), f.combo,
        Math.round(f.comboTimer * 100), Math.round(f.flash * 100),
        Math.round(f.koTime * 100), Math.round(f.winTime * 100)
      ];
    }),
    p: game.projectiles.map((p) => [
      Math.max(0, PROJ_CODES.indexOf(p.kind)),
      Math.round(p.x), Math.round(p.y), Math.round(p.vx), Math.round(p.vy || 0),
      p.r, p.hitW || 0, p.hitH || 0, p.owner,
      Math.round((p.life || 0) * 10), Math.round((p.delay || 0) * 100),
      p.struck ? 1 : 0, Math.round((p.strikeT || 0) * 100),
      p.hitDir || 0, p.unblockable ? 1 : 0
    ])
  };
}

function expandBleSnapshot(s) {
  if (!s || !Array.isArray(s.f)) return null;
  return {
    t: 'snap',
    ph: PHASES[s.ph] || 'fight',
    pt: (s.pt || 0) / 100,
    tm: (s.tm || 0) / 10,
    rd: s.rd || 1,
    w: s.w || [0, 0],
    rw: s.rw ?? -1,
    rr: s.rr === 1 ? 'ko' : s.rr === 2 ? 'time' : '',
    mw: s.mw ?? -1,
    f: (s.f || []).map((a) => ({
      x: a[0], y: a[1], vy: a[2], fc: a[3],
      hp: a[4], mh: a[5], dh: a[6], m: a[7],
      st: STATES[a[8]] || 'idle', stt: (a[9] || 0) / 100,
      at: ATTACK_CODES[a[10]] || null, atT: (a[11] || 0) / 100,
      as: (a[12] || 0) / 1000, aa: (a[13] || 0) / 1000, ar: (a[14] || 0) / 1000,
      hs: (a[15] || 0) / 100, bs: (a[16] || 0) / 100,
      c: a[17] || 0, ct: (a[18] || 0) / 100, fl: (a[19] || 0) / 100,
      kt: (a[20] || 0) / 100, wt: (a[21] || 0) / 100
    })),
    p: (s.p || []).map((a) => ({
      k: PROJ_CODES[a[0]] || 'plasma',
      x: a[1], y: a[2], vx: a[3], vy: a[4], r: a[5],
      hitW: a[6], hitH: a[7], owner: a[8],
      life: (a[9] || 0) / 10, delay: (a[10] || 0) / 100,
      struck: !!a[11], strikeT: (a[12] || 0) / 100,
      color: '', hitDir: a[13], unblockable: !!a[14]
    }))
  };
}

export class BleLinkManager extends LinkManager {
  constructor() {
    super();
    this.transport = 'ble';
    this.ble = null;
    this.bleMode = null;
    this.deviceId = null;
    this.centralId = null;
    this.txId = 1;
    this.rxMsgs = new Map();
    this.mtu = 23;
    this.bleAttached = false;
    this.autoReconnect = true;
    this.hostChunk = 20;
  }

  async loadPlugin() {
    const cap = window.Capacitor;
    if (!cap) return null;
    if (cap.getPlatform?.() === 'web') return null;
    return cap.Plugins?.BluetoothLowEnergy || null;
  }

  async ensureReady(mode) {
    if (!this.plugin) {
      const ok = await this.prepare();
      if (!ok || !this.plugin) throw new Error('BLE-РЕЖИМ ДОСТУПЕН ТОЛЬКО В ANDROID-ПРИЛОЖЕНИИ');
    }
    if (this.ready && this.bleMode === mode) return;
    if (this.ready) {
      // Переключаем роль (central ↔ peripheral), сначала освобождаем BLE-стек.
      try { await this.stopScanning(); } catch (e) { /* ignore */ }
      try { if (this.deviceId) await this.plugin.disconnect({ deviceId: this.deviceId }); } catch (e) { /* ignore */ }
      try { await this.plugin.removeGattService({ service: SERVICE }); } catch (e) { /* ignore */ }
      this.ready = false;
      this.bleMode = null;
    }
    const p = this.plugin;
    this.status('ЗАПРАШИВАЕМ РАЗРЕШЕНИЯ BLE...');
    try { await p.requestPermissions(); } catch (e) { /* пользователь мог уже выдать */ }
    try {
      const av = await p.isAvailable();
      if (av && av.available === false) throw new Error('BLE НЕ ПОДДЕРЖИВАЕТСЯ');
      const en = await p.isEnabled();
      if (en && en.enabled === false) throw new Error('ВКЛЮЧИТЕ BLUETOOTH');
    } catch (e) {
      if (String(e?.message || '').includes('ВКЛЮЧИТЕ') || String(e?.message || '').includes('НЕ ПОДДЕРЖ')) throw e;
    }
    this.status(mode === 'peripheral' ? 'ЗАПУСКАЕМ BLE-СЕРВЕР...' : 'ЗАПУСКАЕМ BLE...');
    await p.initialize({ mode });
    await this.attachBle();
    this.bleMode = mode;
    this.ready = true;
  }

  async attachBle() {
    if (this.bleAttached) return;
    this.bleAttached = true;
    const p = this.plugin;
    const add = (name, fn) => {
      try {
        const res = p.addListener(name, fn);
        if (res && typeof res.then === 'function') res.then((h) => this.handles.push(h)).catch(() => {});
        else if (res) this.handles.push(res);
      } catch (e) { /* ignore */ }
    };

    add('deviceScanned', (ev) => {
      const d = ev?.device;
      if (!d || this.role !== 'guest') return;
      this.found.set(d.deviceId, {
        endpointID: d.deviceId,
        endpointName: d.name || 'BLE-игрок',
        deviceId: d.deviceId
      });
      this.endpoints();
      if (this.autoJoin && this.reconnecting) {
        this.autoJoin = false;
        this.connect({ endpointID: d.deviceId, deviceId: d.deviceId });
      }
    });

    add('deviceConnected', (ev) => this.onBleConnected(ev?.deviceId));
    add('deviceDisconnected', () => this.onBleDisconnected('BLE-СОЕДИНЕНИЕ ПОТЕРЯНО'));
    add('characteristicChanged', (ev) => this.onBleBytes(ev?.value));
    add('centralConnected', (ev) => this.onBleCentralConnected(ev?.deviceId));
    add('centralDisconnected', () => this.onBleDisconnected('ГОСТЬ ОТКЛЮЧИЛСЯ'));
    add('gattCharacteristicWriteRequest', (ev) => this.onBleBytes(ev?.value));
  }

  async startHost(charId) {
    if (this.connected || this.endpointID || this.reconnecting) await this.disconnect(true);
    this.resetSession();
    this.role = 'host';
    this.ownChar = charId;
    this.peerChar = null;
    this.hostGame = null;
    this.connected = false;
    this.centralId = null;
    this.endpointID = null;
    this.status('СОЗДАЁМ BLE-СЕРВЕР...');
    await this.ensureReady('peripheral');
    try {
      try {
        await this.plugin.addGattService({
          service: SERVICE,
          characteristics: [
            { uuid: CHAR_RX, properties: { ...RX_PROPS } },
            { uuid: CHAR_TX, properties: { ...TX_PROPS } }
          ]
        });
      } catch (e) {
        try { await this.plugin.removeGattService({ service: SERVICE }); } catch (e2) { /* ignore */ }
        await this.plugin.addGattService({
          service: SERVICE,
          characteristics: [
            { uuid: CHAR_RX, properties: { ...RX_PROPS } },
            { uuid: CHAR_TX, properties: { ...TX_PROPS } }
          ]
        });
      }
      await this.plugin.startAdvertising({ name: 'Neon Clash', services: [SERVICE], includeName: true });
      this.status('ОЖИДАНИЕ ИГРОКА (BLE)...');
    } catch (e) {
      this.status('BLE НЕДОСТУПЕН: ' + (e?.message || 'ОШИБКА'), 'error');
      throw e;
    }
  }

  async startJoin(charId) {
    if (this.connected || this.endpointID || this.reconnecting) await this.disconnect(true);
    this.resetSession();
    this.role = 'guest';
    this.ownChar = charId;
    this.peerChar = null;
    this.guestGame = null;
    this.connected = false;
    this.deviceId = null;
    this.endpointID = null;
    this.status('ИЩЕМ BLE-УСТРОЙСТВО...');
    await this.ensureReady('central');
    try {
      await this.plugin.startScan({ services: [SERVICE], timeout: 0, allowDuplicates: false });
      this.status('ИЩЕМ BLE-УСТРОЙСТВО...');
    } catch (e) {
      this.status('BLE-ПОИСК НЕДОСТУПЕН: ' + (e?.message || 'ОШИБКА'), 'error');
      throw e;
    }
  }

  async connect(ep) {
    if (this.role !== 'guest' || !ep) return;
    const deviceId = ep.deviceId || ep.endpointID;
    if (!deviceId) return;
    this.deviceId = deviceId;
    this.status('ПОДКЛЮЧАЕМСЯ ПО BLE...');
    try {
      await this.plugin.stopScan();
      await this.plugin.connect({ deviceId, autoConnect: true });
    } catch (e) {
      this.status('BLE-ПОДКЛЮЧЕНИЕ НЕ УДАЛОСЬ', 'error');
    }
  }

  async onBleConnected(deviceId) {
    if (!deviceId || this.role !== 'guest') return;
    this.deviceId = deviceId;
    this.endpointID = deviceId;
    this.connected = true;
    this.status(this.reconnecting ? 'ПЕРЕПОДКЛЮЧЕНИЕ ПО BLE...' : 'BLE-СОЕДИНЕНИЕ УСТАНОВЛЕНО', this.reconnecting ? 'warn' : 'ok');
    try { this.found.clear(); this.endpoints(); } catch (e) { /* ignore */ }
    try { await this.plugin.stopScan(); } catch (e) { /* ignore */ }
    try {
      const mtu = await this.plugin.requestMtu({ deviceId, mtu: 517 });
      this.mtu = Math.max(23, (mtu && mtu.mtu) || 517);
    } catch (e) { this.mtu = 23; }
    try {
      await this.plugin.discoverServices({ deviceId });
      await this.plugin.startCharacteristicNotifications({
        deviceId, service: SERVICE, characteristic: CHAR_TX
      });
    } catch (e) {
      this.status('BLE-СЕРВИС НЕ НАЙДЕН', 'error');
      return;
    }
    this.sendHello();
    this.callbacks.onConnected?.({ endpointID: deviceId });
    // Гость завершит переподключение, когда получит resume от хоста.
  }

  onBleCentralConnected(deviceId) {
    if (this.role !== 'host' || !deviceId) return;
    this.centralId = deviceId;
    this.endpointID = deviceId;
    this.connected = true;
    this.status(this.reconnecting ? 'ПЕРЕПОДКЛЮЧЕНИЕ ПО BLE...' : 'ГОСТЬ ПОДКЛЮЧЁН ПО BLE', this.reconnecting ? 'warn' : 'ok');
    this.callbacks.onConnected?.({ endpointID: deviceId });
    // Гость подписывается на TX чуть позже; отправим hello повторно.
    setTimeout(() => {
      if (this.connected && this.role === 'host') this.sendHello();
    }, 350);
  }

  onBleBytes(value) {
    if (!Array.isArray(value) || value.length < 4) return;
    const id = value[0] | (value[1] << 8);
    const index = value[2];
    const count = value[3];
    if (count <= 0 || index >= count) return;
    const data = value.slice(4);
    let entry = this.rxMsgs.get(id);
    if (!entry) {
      entry = { chunks: new Array(count), got: 0, stamp: performance.now() };
      this.rxMsgs.set(id, entry);
    }
    if (!entry.chunks[index]) {
      entry.chunks[index] = data;
      entry.got++;
    }
    if (entry.got >= count) {
      this.rxMsgs.delete(id);
      const total = entry.chunks.reduce((n, c) => n + c.length, 0);
      const bytes = new Uint8Array(total);
      let off = 0;
      for (const c of entry.chunks) { bytes.set(c, off); off += c.length; }
      let text = '';
      try { text = new TextDecoder().decode(bytes); } catch (e) { return; }
      this.onPayload({ payload: text });
    }
    const now = performance.now();
    for (const [k, v] of this.rxMsgs) {
      if (now - v.stamp > 2500) this.rxMsgs.delete(k);
    }
  }

  async sendRaw(text) {
    if (!this.connected || !this.role) return;
    const bytes = new TextEncoder().encode(text);
    // Хост не знает MTU каждого центра, поэтому шлёт безопасными пакетами по 20 байт.
    // Гость поднимает MTU при подключении и может писать крупнее.
    const max = this.role === 'host'
      ? this.hostChunk
      : Math.max(20, Math.min(CHUNK, this.mtu - 7));
    const count = Math.max(1, Math.ceil(bytes.length / max));
    const id = this.txId = (this.txId + 1) & 0xffff;
    for (let i = 0; i < count; i++) {
      const slice = bytes.slice(i * max, (i + 1) * max);
      const packet = [id & 0xff, (id >> 8) & 0xff, i, count, ...slice];
      if (this.role === 'host') {
        await this.plugin.notifyGattCharacteristicChanged({
          service: SERVICE, characteristic: CHAR_TX, value: packet
        });
      } else {
        await this.plugin.writeCharacteristic({
          deviceId: this.deviceId,
          service: SERVICE,
          characteristic: CHAR_RX,
          value: packet,
          type: packet.length <= this.mtu - 3 ? 'withoutResponse' : 'withResponse'
        });
      }
      // Небольшая пауза между чанками, чтобы не переполнить очередь BLE-стека.
      if (i < count - 1) await delay(6);
    }
  }

  buildSnapshot() {
    return buildBleSnapshot(this.hostGame);
  }

  handleSnapshot(msg) {
    const snap = expandBleSnapshot(msg);
    if (!snap) return;
    if (this.guestGame?.receiveSnapshot) this.guestGame.receiveSnapshot(snap);
    else this.lastSnap = snap;
  }

  bindHostGame(game) {
    this.hostGame = game;
    this.hostMatch = true;
    if (this.snapshotTimer) clearInterval(this.snapshotTimer);
    this.snapshotTimer = setInterval(() => {
      if (this.connected && this.hostGame && this.hostGame.screen === 'match') this.queueSnapshot();
    }, SNAP_MS);
  }

  async stopScanning() {
    try { await this.plugin?.stopAdvertising?.(); } catch (e) { /* ignore */ }
    try { await this.plugin?.stopScan?.(); } catch (e) { /* ignore */ }
  }

  onBleDisconnected(reason) {
    this.handleDisconnected(reason);
  }

  async restartTransport() {
    if (!this.plugin || !this.role) return;
    if (this.role === 'host') {
      try { await this.plugin.stopAdvertising(); } catch (e) { /* ignore */ }
      try {
        await this.plugin.startAdvertising({ name: 'Neon Clash', services: [SERVICE], includeName: true });
      } catch (e) { /* следующая попытка */ }
      return;
    }
    try { await this.plugin.stopScan(); } catch (e) { /* ignore */ }
    if (this.deviceId) {
      try { await this.plugin.connect({ deviceId: this.deviceId, autoConnect: true }); } catch (e) { /* ignore */ }
    }
    if (this.connected) return;
    try {
      await this.plugin.startScan({ services: [SERVICE], timeout: 0, allowDuplicates: false });
    } catch (e) { /* следующая попытка */ }
  }

  async disconnect(silent = false) {
    if (this.disconnecting) return;
    this.disconnecting = true;
    this.reconnecting = false;
    this.autoJoin = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    try {
      if (this.connected) this.sendBye();
      await delay(30);
      if (this.role === 'guest' && this.deviceId) {
        try { await this.plugin?.disconnect({ deviceId: this.deviceId }); } catch (e) { /* ignore */ }
      }
      await this.stopScanning();
      if (this.role === 'host') {
        try { await this.plugin?.removeGattService({ service: SERVICE }); } catch (e) { /* ignore */ }
      }
    } finally {
      this.stopTimers();
      this.connected = false;
      this.endpointID = null;
      this.deviceId = null;
      this.centralId = null;
      this.hostGame = null;
      this.guestGame = null;
      this.guestController = null;
      this.matchActive = false;
      this.remote.reset();
      this.outbox = [];
      this.pendingInput = null;
      this.pendingSnap = false;
      this.found.clear();
      this.lastSnap = null;
      this.role = null;
      this.rxMsgs.clear();
      this.disconnecting = false;
      this.endpoints();
      if (!silent) this.status('BLE-СВЯЗЬ ЗАВЕРШЕНА');
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

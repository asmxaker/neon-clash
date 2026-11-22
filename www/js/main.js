// Точка входа: меню, переключение режимов, пауза, звук и мелкие интеграции.

import { Game } from './game.js';
import { Fighter, drawFighter } from './fighter.js';
import { CHARACTERS, CHARACTER_LIST, getCharacter, randomCharacterExcept } from './characters.js';
import { makePlayerControllers } from './input.js';
import { AIController } from './ai.js';
import { LinkManager } from './link.js';
import { BleLinkManager } from './ble-link.js';
import { audio } from './audio.js';
import { initI18n, getLang, setLang, LANGS, t, charText, onLangChange } from './i18n.js';

const $ = (id) => document.getElementById(id);

const stage = $('stage');
const menu = $('menu');
const help = $('help');
const select = $('select');
const pause = $('pause');
const result = $('result');
const sysBtns = $('sysBtns');
const pauseBtn = $('pauseBtn');
const soundBtn = $('soundBtn');
const btn1p = $('btn1p');
const btnStory = $('btnStory');
const btn2p = $('btn2p');
const btnLink = $('btnLink');
const btnHelp = $('btnHelp');
const btnHelpClose = $('btnHelpClose');
const btnResume = $('btnResume');
const btnRestart = $('btnRestart');
const btnQuit = $('btnQuit');
const btnRematch = $('btnRematch');
const btnResultMenu = $('btnResultMenu');
const resultKicker = $('resultKicker');
const resultTitle = $('resultTitle');
const resultSub = $('resultSub');
const selectKicker = $('selectKicker');
const selectTitle = $('selectTitle');
const selectTabs = $('selectTabs');
const selectTabEls = [...document.querySelectorAll('.select-tab')];
const selectDetail = document.querySelector('.select-detail');
const sdName = $('sdName');
const sdTag = $('sdTag');
const sdSpecial = $('sdSpecial');
const sdStats = [...document.querySelectorAll('.sd-stat u')];
const selectSummary = $('selectSummary');
const btnSelectBack = $('btnSelectBack');
const btnSelectFight = $('btnSelectFight');
const btnSelectFightLabel = btnSelectFight.querySelector('.mb-main');
const fighterCards = [...document.querySelectorAll('.fighter-card')];

const linkEl = $('link');
const linkChar = $('linkChar');
const linkStatus = $('linkStatus');
const linkRoles = $('linkRoles');
const linkEndpoints = $('linkEndpoints');
const btnHost = $('btnHost');
const btnJoin = $('btnJoin');
const btnLinkStart = $('btnLinkStart');
const btnLinkBack = $('btnLinkBack');
const linkNotice = $('linkNotice');
const linkNoticeText = $('linkNoticeText');
const transportBtns = [...document.querySelectorAll('.link-transport-btn')];
const langSelect = $('langSelect');

initI18n();

const controllers = makePlayerControllers();
const ai = new AIController();
let linkTransport = 'nearby';
try {
  const savedTransport = localStorage.getItem('nc_transport');
  if (savedTransport === 'ble') linkTransport = savedTransport;
} catch (e) { /* ignore */ }
let link = linkTransport === 'ble' ? new BleLinkManager() : new LinkManager();

const game = new Game($('game'), {
  p1: controllers.p1,
  p2: controllers.p2,
  ai,
  onMatchEnd: handleMatchEnd
});

window.__game = game;
window.__audio = audio;
window.__link = link;

let resultTimer = null;
let wakeLock = null;
let story = null;
let lastStoryWin = false;
let selectMode = '1p';
let selectActive = 0;
let aiPick = 'storm';
let linkCharId = 'volt';
const selectPicks = ['volt', 'blaze'];
try {
  const saved = localStorage.getItem('nc_char');
  if (saved && CHARACTERS[saved]) selectPicks[0] = saved;
} catch (e) { /* ignore */ }
selectPicks[1] = randomCharacterExcept(selectPicks[0]).id;
aiPick = randomCharacterExcept(selectPicks[0]).id;

// ---------------------------------------------------------------- портреты

function renderPortraits() {
  for (const card of fighterCards) {
    const canvas = card.querySelector('.portrait');
    if (!canvas) continue;
    const W = 220;
    const H = 160;
    const dpr = 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const f = new Fighter({ charId: card.dataset.char, x: 0, facing: 1, index: 0 });
    f.locked = true;
    f.state = 'idle';
    f.animT = card.dataset.char === 'blaze' ? 2.1 : 1.4;
    f.meter = 0;
    const s = 0.64;
    ctx.save();
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (W / 2), dpr * (H - 8 - 604 * s));
    drawFighter(ctx, f);
    ctx.restore();
  }
}
renderPortraits();

// ---------------------------------------------------------------- link events

function bindLinkEvents(mgr) {
  mgr.on({
    onStatus: (text, kind) => {
      linkStatus.textContent = text;
      linkStatus.className = 'link-status' + (kind ? ' ' + kind : '');
    },
    onEndpoints: (list) => renderLinkEndpoints(list),
    onPeer: ({ char }) => {
      updateLinkCharLine();
      if (mgr.role === 'host') {
        btnLinkStart.classList.remove('hidden');
        linkStatus.textContent = t('status.peerHost');
        linkStatus.className = 'link-status ok';
      } else {
        linkStatus.textContent = t('status.peerGuest');
        linkStatus.className = 'link-status ok';
      }
      if (char) audio.ui();
    },
    onStart: (msg) => startLinkGuest(msg),
    onRematchRequest: () => restartLinkMatch(),
    onDisconnected: (reason) => handleLinkDisconnected(reason),
    onReconnecting: (reason) => {
      if (linkNotice) {
        linkNoticeText.textContent = t('link.reconnecting');
        linkNotice.classList.remove('hidden');
      }
      if (linkStatus) {
        linkStatus.textContent = reason || t('link.reconnecting');
        linkStatus.className = 'link-status warn';
      }
      if (game.netHost) game.setPaused(true);
    },
    onReconnected: ({ role } = {}) => {
      linkNotice?.classList.add('hidden');
      if (role === 'host' || game.netHost) game.setPaused(false);
    },
    onReconnectFailed: () => {
      linkNotice?.classList.add('hidden');
      handleLinkDisconnected(t('link.reconnectFailed'));
    }
  });
  window.__link = mgr;
}
bindLinkEvents(link);

// ---------------------------------------------------------------- язык

if (langSelect) {
  for (const l of LANGS) {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.label;
    langSelect.appendChild(opt);
  }
  langSelect.value = getLang();
  langSelect.addEventListener('change', () => {
    setLang(langSelect.value);
    audio.ui();
  });
}

onLangChange(() => {
  updateSelectUI();
  updateSoundIcon();
  updateLinkCharLine();
});

// ---------------------------------------------------------------- звук

function updateSoundIcon() {
  soundBtn.textContent = audio.muted ? '✕' : '♪';
  soundBtn.title = audio.muted ? t('sound.unmute') : t('sound.mute');
}
updateSoundIcon();

soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  audio.unlock();
  const muted = audio.toggleMuted();
  updateSoundIcon();
  if (!muted) audio.ui();
});

document.addEventListener('pointerdown', () => audio.unlock(), { once: true, capture: true });
document.addEventListener('keydown', () => audio.unlock(), { once: true, capture: true });

// ---------------------------------------------------------------- меню

function hideAllOverlays() {
  for (const el of [menu, help, select, linkEl, pause, result]) el.classList.add('hidden');
}

function updateSelectUI() {
  if (selectMode !== '2p') selectActive = 0;
  const p1Char = getCharacter(selectPicks[0]);
  const p2Char = getCharacter(selectPicks[1]);
  const aiChar = getCharacter(aiPick);
  const activeChar = getCharacter(selectPicks[selectActive] || selectPicks[0]);
  const p1 = charText(p1Char.id);
  const p2 = charText(p2Char.id);
  const ai = charText(aiChar.id);
  const activeText = charText(activeChar.id);

  for (const card of fighterCards) {
    const id = card.dataset.char;
    const isP1 = p1Char.id === id;
    const isP2 = selectMode === '2p' && p2Char.id === id;
    const isAI = selectMode === '1p' && aiChar.id === id;
    const isActive = activeChar.id === id;
    card.classList.toggle('selected', isActive);
    card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    const role = card.querySelector('.fc-role');
    if (role) {
      role.className = 'fc-role';
      if (selectMode === '2p') {
        if (isP1 && isP2) {
          role.textContent = 'P1·P2';
          role.classList.add('both');
        } else if (isP1) {
          role.textContent = 'P1';
          role.classList.add('p1');
        } else if (isP2) {
          role.textContent = 'P2';
          role.classList.add('p2');
        } else {
          role.textContent = '';
        }
      } else if (isP1) {
        role.textContent = t('select.you');
        role.classList.add('p1');
      } else if (isAI) {
        role.textContent = t('select.ai');
        role.classList.add('ai');
      } else {
        role.textContent = '';
      }
    }
  }

  if (selectMode === 'link') {
    selectKicker.textContent = t('select.kLink');
    selectTitle.textContent = t('select.tLink');
  } else if (selectMode === 'story') {
    selectKicker.textContent = t('select.kStory');
    selectTitle.textContent = t('select.tStory');
  } else if (selectMode === '2p') {
    selectKicker.textContent = t('select.k2');
    selectTitle.textContent = t('select.t2');
  } else {
    selectKicker.textContent = t('select.k1');
    selectTitle.textContent = t('select.t1');
  }
  selectTabs.hidden = selectMode !== '2p';
  for (const tab of selectTabEls) {
    tab.classList.toggle('active', Number(tab.dataset.player) === selectActive);
  }

  sdName.textContent = activeText.name;
  sdTag.textContent = activeText.tagline;
  sdSpecial.innerHTML = t('select.special', { name: activeText.specialName, desc: activeText.specialDesc });
  selectDetail.style.setProperty('--sel-color', activeChar.color);
  for (const bar of sdStats) {
    const stat = bar.dataset.stat;
    bar.style.width = `${((activeChar.stats[stat] || 3) / 5) * 100}%`;
  }

  if (selectMode === '2p') {
    const mirror = p1Char.id === p2Char.id;
    selectSummary.innerHTML = t('select.sum2', {
      p1: p1.name, p2: p2.name, mirror: mirror ? t('select.mirror') : ''
    });
  } else if (selectMode === 'link') {
    selectSummary.innerHTML = t('select.sumLink', { p1: p1.name });
  } else if (selectMode === 'story') {
    selectSummary.innerHTML = t('select.sumStory', { n: CHARACTER_LIST.length + 1 });
  } else {
    selectSummary.innerHTML = t('select.sum1', { p1: p1.name, ai: ai.name });
  }
}

function openSelect(mode) {
  selectMode = mode;
  selectActive = 0;
  const p1 = getCharacter(selectPicks[0]);
  selectPicks[0] = p1.id;
  selectPicks[1] = randomCharacterExcept(p1.id).id;
  aiPick = randomCharacterExcept(p1.id).id;
  btnSelectFightLabel.textContent = mode === 'link' ? t('select.toLink') : mode === 'story' ? t('select.storyFight') : t('select.fight');
  updateSelectUI();
  audio.unlock();
  audio.ui();
  hideAllOverlays();
  select.classList.remove('hidden');
  stage.classList.remove('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.add('hidden');
}

function closeSelect() {
  select.classList.add('hidden');
  menu.classList.remove('hidden');
  audio.ui();
}

function startGame(mode, p1CharId, p2CharId) {
  const p1 = getCharacter(p1CharId);
  const p2 = getCharacter(p2CharId);
  try { localStorage.setItem('nc_char', p1.id); } catch (e) { /* ignore */ }
  audio.unlock();
  audio.ui();
  tryImmersive();
  clearTimeout(resultTimer);
  hideAllOverlays();
  stage.classList.add('in-match');
  stage.classList.toggle('two-p', mode === '2p');
  sysBtns.classList.remove('hidden');
  controllers.touch1.reset();
  controllers.touch2.reset();
  game.startMatch(mode, p1.id, p2.id);
  requestWakeLock();
}

function startSelectedMatch() {
  if (selectMode === 'link') {
    openLinkLobby(selectPicks[0]);
    return;
  }
  if (selectMode === 'story') {
    startStory(selectPicks[0]);
    return;
  }
  story = null;
  const p2 = selectMode === '2p' ? selectPicks[1] : aiPick;
  startGame(selectMode, selectPicks[0], p2);
}

function startStory(charId) {
  const others = CHARACTER_LIST.filter((c) => c.id !== charId).map((c) => c.id);
  story = { charId, opponents: [...others, charId, 'boss'], index: 0 };
  lastStoryWin = false;
  startStoryFight();
}

function startStoryFight() {
  if (!story) return;
  const opponentId = story.opponents[story.index];
  const p1 = getCharacter(story.charId);
  const p2 = getCharacter(opponentId);
  lastStoryWin = false;
  try { localStorage.setItem('nc_char', p1.id); } catch (e) { /* ignore */ }
  audio.unlock();
  audio.ui();
  tryImmersive();
  clearTimeout(resultTimer);
  hideAllOverlays();
  stage.classList.add('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.remove('hidden');
  pauseBtn.classList.remove('hidden');
  controllers.touch1.reset();
  controllers.touch2.reset();
  game.startMatch('story', p1.id, p2.id);
  game.storyChapter = story.index + 1;
  game.storyTotal = story.opponents.length;
  requestWakeLock();
}

for (const card of fighterCards) {
  card.addEventListener('click', () => {
    const id = card.dataset.char;
    if (selectMode === '2p') {
      selectPicks[selectActive] = id;
    } else {
      selectPicks[0] = id;
      if (aiPick === id) aiPick = randomCharacterExcept(id).id;
    }
    updateSelectUI();
    audio.ui();
  });
}

for (const tab of selectTabEls) {
  tab.addEventListener('click', () => {
    selectActive = Number(tab.dataset.player);
    updateSelectUI();
    audio.ui();
  });
}

btn1p.addEventListener('click', () => openSelect('1p'));
btnStory.addEventListener('click', () => openSelect('story'));
btn2p.addEventListener('click', () => openSelect('2p'));
btnLink.addEventListener('click', () => openSelect('link'));
btnSelectBack.addEventListener('click', closeSelect);
btnSelectFight.addEventListener('click', startSelectedMatch);

btnHelp.addEventListener('click', () => {
  audio.unlock();
  audio.ui();
  help.classList.remove('hidden');
});

btnHelpClose.addEventListener('click', () => {
  audio.ui();
  help.classList.add('hidden');
});

// ---------------------------------------------------------------- Bluetooth / link

function updateLinkCharLine() {
  const own = charText(getCharacter(linkCharId).id);
  const peer = link.peerChar ? charText(getCharacter(link.peerChar).id) : null;
  linkChar.textContent = peer
    ? t('link.charBoth', { own: own.name, peer: peer.name })
    : t('link.charOwn', { name: own.name });
}

function resetLinkRoles() {
  linkRoles.classList.remove('hidden');
  btnLinkStart.classList.add('hidden');
  linkEndpoints.classList.add('hidden');
  linkEndpoints.innerHTML = '';
}

function renderLinkEndpoints(list) {
  linkEndpoints.innerHTML = '';
  if (!list || !list.length) {
    linkEndpoints.classList.add('hidden');
    return;
  }
  linkEndpoints.classList.remove('hidden');
  for (const ep of list) {
    const b = document.createElement('button');
    b.className = 'link-endpoint';
    b.textContent = ep.endpointName || t('link.playerNearby');
    b.addEventListener('click', () => {
      audio.ui();
      linkEndpoints.classList.add('hidden');
      link.connect(ep);
    });
    linkEndpoints.appendChild(b);
  }
}

function updateTransportUI() {
  for (const b of transportBtns) {
    b.classList.toggle('active', b.dataset.transport === linkTransport);
  }
}
updateTransportUI();

function selectTransport(kind) {
  if (kind === linkTransport || link.connected || link.reconnecting || game.inMatch) return;
  const old = link;
  old.callbacks = {};
  old.dispose().catch(() => {});
  link = kind === 'ble' ? new BleLinkManager() : new LinkManager();
  linkTransport = kind;
  bindLinkEvents(link);
  updateTransportUI();
  try { localStorage.setItem('nc_transport', kind); } catch (e) { /* ignore */ }
  if (!linkEl.classList.contains('hidden')) openLinkLobby(linkCharId);
}

for (const b of transportBtns) {
  b.addEventListener('click', () => {
    audio.ui();
    selectTransport(b.dataset.transport);
  });
}

function openLinkLobby(charId) {
  linkCharId = charId;
  updateLinkCharLine();
  updateTransportUI();
  const isBle = link.transport === 'ble';
  linkStatus.textContent = t('link.checking');
  linkStatus.className = 'link-status';
  resetLinkRoles();
  linkNotice?.classList.add('hidden');
  btnHost.disabled = true;
  btnJoin.disabled = true;
  hideAllOverlays();
  linkEl.classList.remove('hidden');
  stage.classList.remove('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  game.toMenu();
  audio.unlock();
  audio.ui();

  const mgr = link;
  mgr.prepare().then((ok) => {
    if (mgr !== link || linkEl.classList.contains('hidden')) return;
    if (!ok) {
      linkStatus.textContent = isBle ? t('link.bleAndroidOnly') : t('link.androidOnly');
      linkStatus.className = 'link-status error';
      btnHost.disabled = true;
      btnJoin.disabled = true;
      return;
    }
    btnHost.disabled = false;
    btnJoin.disabled = false;
    btnLinkStart.classList.add('hidden');
    linkStatus.textContent = isBle ? t('link.bleRolePrompt') : t('link.rolePrompt');
    linkStatus.className = 'link-status';
  });
}

function closeLinkLobby() {
  link.disconnect(true);
  link.resetSession();
  hideAllOverlays();
  menu.classList.remove('hidden');
  stage.classList.remove('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  game.toMenu();
  audio.ui();
}

function startLinkHost(hostChar, guestChar) {
  hideAllOverlays();
  stage.classList.add('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.remove('hidden');
  pauseBtn.classList.remove('hidden');
  controllers.touch1.reset();
  controllers.touch2.reset();
  link.remote.reset();
  game.startMatch('2p', hostChar, guestChar);
  game.mode = 'link';
  game.netHost = true;
  game.netGuest = false;
  game.fighters[1].controller = link.remote;
  link.matchActive = true;
  link.bindHostGame(game);
  linkNotice?.classList.add('hidden');
  requestWakeLock();
  tryImmersive();
}

function startLinkGuest(msg) {
  if (!msg || !msg.hostChar || !msg.guestChar) return;
  hideAllOverlays();
  stage.classList.add('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.remove('hidden');
  pauseBtn.classList.remove('hidden');
  controllers.touch1.reset();
  controllers.touch2.reset();
  linkCharId = msg.guestChar;
  game.startGuestMatch(msg.hostChar, msg.guestChar);
  game.mode = 'link';
  game.netHost = false;
  game.netGuest = true;
  link.matchActive = true;
  link.bindGuestGame(game);
  if (msg.snap) game.receiveSnapshot(msg.snap);
  link.startGuestInput(controllers.p1);
  linkNotice?.classList.add('hidden');
  requestWakeLock();
  tryImmersive();
}

function restartLinkMatch() {
  if (!game.netHost) return;
  const hostChar = game.p1CharId;
  const guestChar = game.p2CharId;
  hideAllOverlays();
  game.setPaused(false);
  game.rematch();
  game.mode = 'link';
  game.netHost = true;
  game.netGuest = false;
  game.fighters[1].controller = link.remote;
  link.remote.reset();
  link.matchActive = true;
  link.sendStart(hostChar, guestChar);
  link.bindHostGame(game);
  linkNotice?.classList.add('hidden');
  stage.classList.add('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.remove('hidden');
  pauseBtn.classList.remove('hidden');
  audio.ui();
}

function handleLinkDisconnected(reason) {
  const inMatch = game.netHost || game.netGuest || stage.classList.contains('in-match');
  game.netHost = false;
  game.netGuest = false;
  linkNotice?.classList.add('hidden');
  link.resetSession();
  if (inMatch) {
    game.toMenu();
    stage.classList.remove('in-match');
    stage.classList.remove('two-p');
    sysBtns.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    hideAllOverlays();
    linkEl.classList.remove('hidden');
    updateLinkCharLine();
    resetLinkRoles();
    linkStatus.textContent = reason || t('link.connectionLost');
    linkStatus.className = 'link-status error';
    btnHost.disabled = !link.available;
    btnJoin.disabled = !link.available;
    audio.ui();
  } else {
    linkStatus.textContent = reason || t('link.connectionLost');
    linkStatus.className = 'link-status error';
    resetLinkRoles();
    btnHost.disabled = !link.available;
    btnJoin.disabled = !link.available;
  }
}

btnHost.addEventListener('click', async () => {
  if (btnHost.disabled) return;
  audio.unlock();
  audio.ui();
  btnHost.disabled = true;
  btnJoin.disabled = true;
  linkRoles.classList.add('hidden');
  btnLinkStart.classList.add('hidden');
  linkEndpoints.classList.add('hidden');
  try {
    await link.startHost(linkCharId);
  } catch (e) {
    resetLinkRoles();
    btnHost.disabled = !link.available;
    btnJoin.disabled = !link.available;
    linkStatus.textContent = t('link.hostFailed', { msg: e?.message || t('status.failed') });
    linkStatus.className = 'link-status error';
  }
});

btnJoin.addEventListener('click', async () => {
  if (btnJoin.disabled) return;
  audio.unlock();
  audio.ui();
  btnHost.disabled = true;
  btnJoin.disabled = true;
  linkRoles.classList.add('hidden');
  btnLinkStart.classList.add('hidden');
  linkEndpoints.innerHTML = '';
  linkEndpoints.classList.remove('hidden');
  try {
    await link.startJoin(linkCharId);
  } catch (e) {
    resetLinkRoles();
    btnHost.disabled = !link.available;
    btnJoin.disabled = !link.available;
    linkStatus.textContent = t('link.searchFailed', { msg: e?.message || t('status.failed') });
    linkStatus.className = 'link-status error';
  }
});

btnLinkStart.addEventListener('click', () => {
  if (!link.connected || !link.peerChar) return;
  audio.ui();
  const hostChar = linkCharId;
  const guestChar = link.peerChar;
  link.sendStart(hostChar, guestChar);
  startLinkHost(hostChar, guestChar);
});

btnLinkBack.addEventListener('click', closeLinkLobby);

// ---------------------------------------------------------------- пауза

function openPause() {
  if (!game.inMatch || game.paused) return;
  if (game.phase === 'matchEnd') return;
  if (!game.netGuest) game.setPaused(true);
  pause.classList.remove('hidden');
  audio.ui();
}

function closePause() {
  pause.classList.add('hidden');
  if (!game.netGuest) game.setPaused(false);
}

pauseBtn.addEventListener('click', openPause);
btnResume.addEventListener('click', closePause);

btnRestart.addEventListener('click', () => {
  pause.classList.add('hidden');
  result.classList.add('hidden');
  if (story) {
    startStoryFight();
    return;
  }
  if (game.netHost) {
    restartLinkMatch();
    return;
  }
  if (game.netGuest) {
    link.requestRematch();
    audio.ui();
    return;
  }
  game.setPaused(false);
  game.rematch();
  audio.ui();
});

function quitToMenu() {
  clearTimeout(resultTimer);
  story = null;
  lastStoryWin = false;
  btnRematch.textContent = t('result.rematch');
  if (game.netHost || game.netGuest || link.connected || link.role) {
    link.disconnect(true);
    link.resetSession();
  }
  game.netHost = false;
  game.netGuest = false;
  hideAllOverlays();
  menu.classList.remove('hidden');
  stage.classList.remove('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  game.setPaused(false);
  game.toMenu();
  releaseWakeLock();
  audio.ui();
}

btnQuit.addEventListener('click', quitToMenu);
btnResultMenu.addEventListener('click', quitToMenu);

btnRematch.addEventListener('click', () => {
  if (story) {
    result.classList.add('hidden');
    if (lastStoryWin) {
      if (story.index >= story.opponents.length - 1) startStory(story.charId);
      else {
        story.index++;
        startStoryFight();
      }
    } else {
      startStoryFight();
    }
    audio.ui();
    return;
  }
  if (game.netGuest) {
    link.requestRematch();
    resultSub.textContent = t('result.requestSent');
    return;
  }
  if (game.netHost) {
    result.classList.add('hidden');
    restartLinkMatch();
    return;
  }
  result.classList.add('hidden');
  game.rematch();
  audio.ui();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (!linkEl.classList.contains('hidden')) {
      closeLinkLobby();
      return;
    }
    if (!select.classList.contains('hidden')) {
      closeSelect();
      return;
    }
    if (!help.classList.contains('hidden')) {
      help.classList.add('hidden');
      return;
    }
    if (!result.classList.contains('hidden')) return;
    if (!pause.classList.contains('hidden')) closePause();
    else if (game.inMatch) openPause();
  } else if (e.code === 'Enter') {
    if (!select.classList.contains('hidden')) {
      startSelectedMatch();
      return;
    }
    if (game.screen === 'menu' && help.classList.contains('hidden')) {
      openSelect('1p');
    }
  }
});

// ---------------------------------------------------------------- итог боя

function handleMatchEnd(winner) {
  clearTimeout(resultTimer);
  resultTimer = setTimeout(() => {
    if (!game.inMatch || game.phase !== 'matchEnd') return;
    const p1Won = winner === 0;
    const winnerF = game.fighters[winner];
    resultTitle.classList.remove('win1', 'win2');

    if (story) {
      lastStoryWin = p1Won;
      const final = story.index >= story.opponents.length - 1;
      const nextId = story.opponents[story.index + 1];
      resultKicker.textContent = final
        ? t('story.finalBattle')
        : t('story.chapter', { n: story.index + 1, total: story.opponents.length });
      if (p1Won && final) resultTitle.textContent = t('story.complete');
      else resultTitle.textContent = p1Won ? t('result.win') : t('result.lose');
      if (winnerF) {
        resultTitle.style.color = winnerF.color;
        resultTitle.style.textShadow = `0 0 24px ${winnerF.color}`;
      }
      if (p1Won && final) resultSub.textContent = t('story.completeSub');
      else if (p1Won) resultSub.textContent = t('story.nextOpponent', { name: charText(nextId).name });
      else resultSub.textContent = t('story.defeatSub');
      btnRematch.textContent = p1Won ? (final ? t('story.playAgain') : t('story.next')) : t('story.retry');
    } else {
      const twoP = game.mode === '2p' || game.mode === 'link';
      resultKicker.textContent = t('result.kicker');
      if (twoP) {
        resultTitle.textContent = p1Won ? t('result.win1') : t('result.win2');
      } else {
        resultTitle.textContent = p1Won ? t('result.win') : t('result.lose');
      }
      if (winnerF) {
        resultTitle.style.color = winnerF.color;
        resultTitle.style.textShadow = `0 0 24px ${winnerF.color}`;
      }
      resultSub.textContent = `${winnerF ? `${winnerF.name} · ` : ''}${t('result.score', { w0: game.wins[0], w1: game.wins[1] })}`;
      btnRematch.textContent = t('result.rematch');
    }

    result.classList.remove('hidden');
    audio.ui();
  }, 900);
}

// ---------------------------------------------------------------- фон

async function tryImmersive() {
  if (!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (e) { /* не критично */ }
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (e) { /* браузер может не разрешать */ }
}

async function requestWakeLock() {
  if (wakeLock || !('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (e) { wakeLock = null; }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (game.inMatch) requestWakeLock();
    audio.unlock();
  } else {
    controllers.touch1.reset();
    controllers.touch2.reset();
    audio.stopMusic();
    if (game.inMatch && !game.paused && game.phase !== 'matchEnd') openPause();
  }
});

window.addEventListener('blur', () => {
  controllers.touch1.reset();
  controllers.touch2.reset();
  if (game.inMatch && !game.paused && game.phase !== 'matchEnd') openPause();
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => game.resize(), 250);
});

// запрет случайных жестов браузера
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest?.('#touch, #stage')) e.preventDefault();
});

// ---------------------------------------------------------------- PWA

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

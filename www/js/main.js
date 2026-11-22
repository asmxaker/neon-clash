// Точка входа: меню, переключение режимов, пауза, звук и мелкие интеграции.

import { Game } from './game.js';
import { Fighter, drawFighter } from './fighter.js';
import { CHARACTERS, getCharacter, otherCharacter } from './characters.js';
import { makePlayerControllers } from './input.js';
import { AIController } from './ai.js';
import { audio } from './audio.js';

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
const btn2p = $('btn2p');
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
const selectSummary = $('selectSummary');
const btnSelectBack = $('btnSelectBack');
const btnSelectFight = $('btnSelectFight');
const fighterCards = [...document.querySelectorAll('.fighter-card')];

const controllers = makePlayerControllers();
const ai = new AIController();

const game = new Game($('game'), {
  p1: controllers.p1,
  p2: controllers.p2,
  ai,
  onMatchEnd: handleMatchEnd
});

window.__game = game;
window.__audio = audio;

let resultTimer = null;
let wakeLock = null;
let selectMode = '1p';
let selectedCharId = 'volt';
try {
  const saved = localStorage.getItem('nc_char');
  if (saved && CHARACTERS[saved]) selectedCharId = saved;
} catch (e) { /* ignore */ }

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

// ---------------------------------------------------------------- звук

function updateSoundIcon() {
  soundBtn.textContent = audio.muted ? '✕' : '♪';
  soundBtn.title = audio.muted ? 'Включить звук' : 'Выключить звук';
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
  for (const el of [menu, help, select, pause, result]) el.classList.add('hidden');
}

function updateSelectUI() {
  const p1 = getCharacter(selectedCharId);
  const p2 = otherCharacter(p1.id);
  for (const card of fighterCards) {
    const active = card.dataset.char === p1.id;
    card.classList.toggle('selected', active);
    card.setAttribute('aria-pressed', active ? 'true' : 'false');
    const role = card.querySelector('.fc-role');
    if (role) {
      role.textContent = selectMode === '2p'
        ? (active ? 'P1' : 'P2')
        : (active ? 'ТЫ' : 'ИИ');
    }
  }
  selectKicker.textContent = selectMode === '2p'
    ? '2 ИГРОКА · ВЫБЕРИ СТОРОНУ'
    : '1 ИГРОК · ПРОТИВ ИИ';
  selectSummary.innerHTML = selectMode === '2p'
    ? `P1: <b>${p1.name}</b> · P2: <b>${p2.name}</b>`
    : `ИГРОК: <b>${p1.name}</b> · ИИ: <b>${p2.name}</b>`;
}

function openSelect(mode) {
  selectMode = mode;
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

function startGame(mode, charId) {
  const p1 = getCharacter(charId);
  const p2 = otherCharacter(p1.id);
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

for (const card of fighterCards) {
  card.addEventListener('click', () => {
    selectedCharId = card.dataset.char;
    updateSelectUI();
    audio.ui();
  });
}

btn1p.addEventListener('click', () => openSelect('1p'));
btn2p.addEventListener('click', () => openSelect('2p'));
btnSelectBack.addEventListener('click', closeSelect);
btnSelectFight.addEventListener('click', () => startGame(selectMode, selectedCharId));

btnHelp.addEventListener('click', () => {
  audio.unlock();
  audio.ui();
  help.classList.remove('hidden');
});

btnHelpClose.addEventListener('click', () => {
  audio.ui();
  help.classList.add('hidden');
});

// ---------------------------------------------------------------- пауза

function openPause() {
  if (!game.inMatch || game.paused) return;
  if (game.phase === 'matchEnd') return;
  game.setPaused(true);
  pause.classList.remove('hidden');
  audio.ui();
}

function closePause() {
  pause.classList.add('hidden');
  game.setPaused(false);
}

pauseBtn.addEventListener('click', openPause);
btnResume.addEventListener('click', closePause);

btnRestart.addEventListener('click', () => {
  pause.classList.add('hidden');
  result.classList.add('hidden');
  game.setPaused(false);
  game.rematch();
  audio.ui();
});

function quitToMenu() {
  clearTimeout(resultTimer);
  hideAllOverlays();
  menu.classList.remove('hidden');
  stage.classList.remove('in-match');
  stage.classList.remove('two-p');
  sysBtns.classList.add('hidden');
  game.setPaused(false);
  game.toMenu();
  releaseWakeLock();
  audio.ui();
}

btnQuit.addEventListener('click', quitToMenu);
btnResultMenu.addEventListener('click', quitToMenu);

btnRematch.addEventListener('click', () => {
  result.classList.add('hidden');
  game.rematch();
  audio.ui();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'KeyP') {
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
      startGame(selectMode, selectedCharId);
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
    const twoP = game.mode === '2p';
    const winnerF = game.fighters[winner];
    resultKicker.textContent = 'БОЙ ОКОНЧЕН';
    if (twoP) {
      resultTitle.textContent = p1Won ? 'ПОБЕДА ИГРОКА 1' : 'ПОБЕДА ИГРОКА 2';
    } else {
      resultTitle.textContent = p1Won ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
    }
    resultTitle.classList.remove('win1', 'win2');
    if (winnerF) {
      resultTitle.style.color = winnerF.color;
      resultTitle.style.textShadow = `0 0 24px ${winnerF.color}`;
    }
    resultSub.textContent = `${winnerF ? `${winnerF.name} · ` : ''}Счёт раундов ${game.wins[0]} : ${game.wins[1]} · до двух побед`;
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

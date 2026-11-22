// Точка входа: меню, переключение режимов, пауза, звук и мелкие интеграции.

import { Game } from './game.js';
import { Fighter, drawFighter } from './fighter.js';
import { CHARACTERS, getCharacter, randomCharacterExcept } from './characters.js';
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
let selectActive = 0;
let aiPick = 'storm';
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
  if (selectMode !== '2p') selectActive = 0;
  const p1 = getCharacter(selectPicks[0]);
  const p2 = getCharacter(selectPicks[1]);
  const ai = getCharacter(aiPick);
  const activeChar = getCharacter(selectPicks[selectActive] || selectPicks[0]);

  for (const card of fighterCards) {
    const id = card.dataset.char;
    const isP1 = p1.id === id;
    const isP2 = selectMode === '2p' && p2.id === id;
    const isAI = selectMode !== '2p' && ai.id === id;
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
        role.textContent = 'ТЫ';
        role.classList.add('p1');
      } else if (isAI) {
        role.textContent = 'ИИ';
        role.classList.add('ai');
      } else {
        role.textContent = '';
      }
    }
  }

  selectKicker.textContent = selectMode === '2p'
    ? '2 ИГРОКА · ВЫБЕРИТЕ БОЙЦОВ'
    : '1 ИГРОК · ПРОТИВ ИИ';
  selectTitle.textContent = selectMode === '2p' ? 'ВЫБЕРИТЕ БОЙЦОВ' : 'ВЫБЕРИ БОЙЦА';
  selectTabs.hidden = selectMode !== '2p';
  for (const tab of selectTabEls) {
    tab.classList.toggle('active', Number(tab.dataset.player) === selectActive);
  }

  sdName.textContent = activeChar.name;
  sdTag.textContent = activeChar.tagline;
  sdSpecial.innerHTML = `<b>СПЕЦ</b> ${activeChar.specialName} — ${activeChar.specialDesc}`;
  selectDetail.style.setProperty('--sel-color', activeChar.color);
  for (const bar of sdStats) {
    const stat = bar.dataset.stat;
    bar.style.width = `${((activeChar.stats[stat] || 3) / 5) * 100}%`;
  }

  if (selectMode === '2p') {
    const mirror = p1.id === p2.id;
    selectSummary.innerHTML = `P1: <b>${p1.name}</b> · P2: <b>${p2.name}</b>${mirror ? '<span class="mirror"> · ЗЕРКАЛО</span>' : ''}`;
  } else {
    selectSummary.innerHTML = `ИГРОК: <b>${p1.name}</b> · ИИ: <b>${ai.name}</b>`;
  }
}

function openSelect(mode) {
  selectMode = mode;
  selectActive = 0;
  const p1 = getCharacter(selectPicks[0]);
  selectPicks[0] = p1.id;
  selectPicks[1] = randomCharacterExcept(p1.id).id;
  aiPick = randomCharacterExcept(p1.id).id;
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
  const p2 = selectMode === '2p' ? selectPicks[1] : aiPick;
  startGame(selectMode, selectPicks[0], p2);
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
btn2p.addEventListener('click', () => openSelect('2p'));
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

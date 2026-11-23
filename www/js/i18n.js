// Переводы интерфейса и игровых надписей.
// По умолчанию — английский; выбор сохраняется в localStorage.

export const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
  { id: 'es', label: 'Español' },
  { id: 'pt', label: 'Português' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'zh', label: '中文' },
  { id: 'ja', label: '日本語' }
];

const en = {
  app: {
    title: 'NEON CLASH — fighting game',
    desc: 'Neon Clash — a neon 2D fighting game for phone. One player vs AI or two players on one screen.',
    arena: 'Neon Clash fight arena'
  },
  menu: {
    tagline: 'NEON FIGHTING · MVP',
    p1: '1 PLAYER', p1sub: 'vs AI',
    p2: '2 PLAYERS', p2sub: 'on one screen',
    link: 'VIA BLUETOOTH', linksub: 'play nearby',
    help: 'HOW TO PLAY',
    footer: 'Turn your phone horizontal · headphones on',
    roundLength: 'ROUND LENGTH', hitsFast: 'Fast · 8 hits', hitsNormal: 'Normal · 12 hits', hitsLong: 'Long · 18 hits',
    story: 'STORY', storySub: 'fight all challengers',
    language: 'LANGUAGE'
  },
  help: {
    title: 'HOW TO PLAY',
    p1title: '1 PLAYER',
    move: '<b>D-PAD</b> — move. Up to jump, down to crouch.',
    punch: '<b>PUNCH</b> — fast strike. Whiffs on a crouching opponent.',
    kick: '<b>KICK</b> — heavy strike. Breaks crouch.',
    block: '<b>BLOCK</b> — hold to defend. Does not work in the air.',
    special: '<b>SPECIAL</b> — unique attack. Costs 50 energy.',
    combo: '<b>COMBO</b> — PUNCH→PUNCH “Double”, PUNCH→PUNCH→KICK “Flurry”, KICK→PUNCH “Switch”. Land the first hit to continue.',
    roster: '<b>VOLT</b> — plasma. <b>BLAZE</b> — shockwave. <b>NYX</b> — dash. <b>MIRA</b> — shard fan. <b>STORM</b> — lightning.',
    commands: 'COMMANDS — F,F+PUNCH Rush, F,F+KICK Charge, D,F+PUNCH Uppercut, D,B+KICK Sweep, F,D,B+ATTACK Breaker.',
    p2title: '2 PLAYERS',
    split: 'The screen splits in half: each player gets a D-pad and buttons.',
    sides: 'Player 1 is on the left, player 2 on the right. Colors follow the chosen fighter.',
    mirror: 'Each player picks a fighter on the P1 or P2 tab. Pick the same one for a mirror match.',
    keyboard: 'KEYBOARD',
    keyp1: 'P1: <b>A D W S</b> + <b>F</b> punch, <b>G</b> kick, <b>H</b> block, <b>T</b> special.',
    keyp2: 'P2: <b>← → ↑ ↓</b> + <b>1</b> punch, <b>2</b> kick, <b>3</b> block, <b>4</b> special.',
    tip: 'Energy builds when you hit or take damage. First to two round wins takes the fight.',
    close: 'GOT IT'
  },
  select: {
    k1: '1 PLAYER · VS AI',
    k2: '2 PLAYERS · CHOOSE FIGHTERS',
    kLink: 'PLAY NEARBY · BLUETOOTH / WI-FI',
    t1: 'CHOOSE YOUR FIGHTER',
    t2: 'CHOOSE FIGHTERS',
    tLink: 'CHOOSE YOUR FIGHTER',
    you: 'YOU', ai: 'AI', both: 'P1·P2',
    speed: 'SPD', power: 'PWR', range: 'RNG',
    kStory: 'STORY · CHOOSE YOUR FIGHTER',
    tStory: 'CHOOSE YOUR FIGHTER',
    sumStory: 'STORY: {n} FIGHTS · FINAL BOSS',
    storyFight: 'START STORY',
    back: 'BACK', fight: 'FIGHT', toLink: 'TO LINK',
    special: '<b>SPECIAL</b> {name} — {desc}',
    sum2: 'P1: <b>{p1}</b> · P2: <b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · MIRROR</span>',
    sumLink: 'YOUR FIGHTER: <b>{p1}</b> · <span class="mirror">NEARBY</span>',
    sum1: 'PLAYER: <b>{p1}</b> · AI: <b>{ai}</b>'
  },
  link: {
    kicker: 'PLAY NEARBY · BLUETOOTH / WI-FI',
    title: 'VIA BLUETOOTH',
    nearby: 'NEARBY', nearbySub: 'Bluetooth + Wi-Fi',
    ble: 'DIRECT BLE', bleSub: 'no Wi-Fi',
    host: 'CREATE GAME', hostSub: 'become host',
    join: 'JOIN', joinSub: 'find nearby',
    back: 'BACK', start: 'START FIGHT',
    note: 'Two Android phones with Bluetooth on are required. NEARBY uses Bluetooth + Wi-Fi; DIRECT BLE uses Bluetooth only. The match reconnects automatically after a dropout.',
    checking: 'CHECKING CONNECTION...',
    rolePrompt: 'NEARBY · CHOOSE ROLE: HOST OR GUEST',
    bleRolePrompt: 'DIRECT BLE · CHOOSE ROLE: HOST OR GUEST',
    androidOnly: 'AVAILABLE ONLY IN THE ANDROID APP',
    bleAndroidOnly: 'DIRECT BLE IS AVAILABLE ONLY IN THE ANDROID APP',
    charOwn: 'YOUR FIGHTER: {name}',
    charBoth: 'YOU: {own} · OPPONENT: {peer}',
    playerNearby: 'PLAYER NEARBY',
    player: 'PLAYER',
    blePlayer: 'BLE PLAYER',
    hostFailed: 'COULD NOT START: {msg}',
    searchFailed: 'COULD NOT SEARCH: {msg}',
    reconnecting: 'RECONNECTING...',
    reconnectHint: 'keep Bluetooth on · the fight will resume',
    reconnectFailed: 'RECONNECTION FAILED',
    connectionLost: 'CONNECTION LOST',
    opponentLeft: 'OPPONENT LEFT'
  },
  status: {
    permissions: 'REQUESTING PERMISSIONS...',
    permissionsNeeded: 'BLUETOOTH AND NEARBY DEVICES PERMISSIONS ARE REQUIRED',
    enabling: 'TURNING ON CONNECTION...',
    confirm: 'CONFIRMING CONNECTION...',
    connected: 'CONNECTED',
    rejected: 'CONNECTION REJECTED',
    failed: 'COULD NOT CONNECT',
    bluetoothOff: 'TURN ON BLUETOOTH',
    noAccess: 'NO BLUETOOTH ACCESS',
    bluetoothOn: 'BLUETOOTH IS ON',
    creatingRoom: 'CREATING ROOM...',
    waiting: 'WAITING FOR PLAYER...',
    btUnavailable: 'BLUETOOTH UNAVAILABLE: {msg}',
    searching: 'SEARCHING FOR A PLAYER NEARBY...',
    searchUnavailable: 'SEARCH UNAVAILABLE: {msg}',
    connectingTo: 'CONNECTING TO {name}...',
    connectFailed: 'COULD NOT CONNECT',
    fight: 'FIGHT',
    sendError: 'SEND ERROR',
    peerHost: 'PLAYER CONNECTED · READY TO START',
    peerGuest: 'CONNECTED · WAITING FOR HOST',
    ended: 'CONNECTION CLOSED',
    reconnectAttempt: 'RECONNECTING... {n}',
    reconnected: 'CONNECTION RESTORED',
    reconnectFailed: 'RECONNECTION FAILED',
    blePermissions: 'REQUESTING BLE PERMISSIONS...',
    bleUnsupported: 'BLE IS NOT SUPPORTED',
    bleServerStart: 'STARTING BLE SERVER...',
    bleStart: 'STARTING BLE...',
    bleServerCreate: 'CREATING BLE SERVER...',
    bleWaiting: 'WAITING FOR PLAYER (BLE)...',
    bleUnavailable: 'BLE UNAVAILABLE: {msg}',
    bleSearching: 'SEARCHING FOR A BLE DEVICE...',
    bleSearchUnavailable: 'BLE SEARCH UNAVAILABLE: {msg}',
    bleConnecting: 'CONNECTING VIA BLE...',
    bleConnectFailed: 'BLE CONNECTION FAILED',
    bleConnected: 'BLE CONNECTED',
    bleReconnecting: 'RECONNECTING VIA BLE...',
    bleServiceMissing: 'BLE SERVICE NOT FOUND',
    bleGuestConnected: 'GUEST CONNECTED VIA BLE',
    bleEnded: 'BLE CONNECTION CLOSED'
  },
  story: {
    chapter: 'STORY · CHAPTER {n} / {total}', finalBattle: 'FINAL BATTLE',
    next: 'NEXT FIGHT', retry: 'RETRY', playAgain: 'PLAY AGAIN',
    nextOpponent: 'NEXT: {name}', complete: 'STORY COMPLETE',
    completeSub: 'You defeated the boss and finished the story.', defeatSub: 'The story ends here. Try this fight again.'
  },
  notation: { punch: 'P', kick: 'K' },
  pause: { title: 'PAUSE', resume: 'RESUME', restart: 'RESTART', quit: 'MENU', combos: 'COMBOS', commands: 'COMMANDS', special: 'SPECIAL', inputNote: 'Directions are relative to the fighter’s facing.' },
  result: {
    kicker: 'FIGHT OVER',
    win1: 'PLAYER 1 WINS',
    win2: 'PLAYER 2 WINS',
    win: 'VICTORY',
    lose: 'DEFEAT',
    score: 'ROUNDS {w0} : {w1} · FIRST TO TWO WINS',
    rematch: 'REMATCH',
    menu: 'MENU',
    requestSent: 'REQUEST SENT · WAITING FOR HOST'
  },
  controls: {
    pad1: 'PLAYER 1 D-PAD', pad2: 'PLAYER 2 D-PAD',
    jump: 'Jump', left: 'Left', right: 'Right', crouch: 'Crouch',
    block: 'BLOCK', special: 'SPEC', kick: 'KICK', punch: 'PUNCH'
  },
  sound: { mute: 'Mute sound', unmute: 'Unmute sound' },
  rotate: { title: 'ROTATE YOUR PHONE', sub: 'this game is made for landscape' },
  hud: {
    round: 'ROUND {n}',
    fight: 'FIGHT!',
    ko: 'K.O.',
    time: 'TIME',
    roundWon: 'ROUND WON',
    roundWin: '{name} WINS THE ROUND',
    draw: 'DRAW',
    victory: 'VICTORY',
    series: 'STREAK',
    combo: 'COMBO “{name}”',
    story: 'STORY {n}/{total}',
    hits: '{n} HITS'
  },
  combo: { double: 'Double', hook: 'Hook', switch: 'Switch', flurry: 'Flurry', triple: 'Triple', doubleKick: 'Double Kick', reversal: 'Reversal', rush: 'Rush', charge: 'Charge', uppercut: 'Uppercut', sweep: 'Sweep', breakerPunch: 'Breaker Punch', breakerKick: 'Breaker Kick' },
  char: {
    volt: { name: 'VOLT', tagline: 'SPEED · PLASMA', specialName: 'PLASMA CHARGE', specialDesc: 'A flying projectile. Keep your distance.', badge: 'FAST', short: 'PLASMA' },
    blaze: { name: 'BLAZE', tagline: 'POWER · SHOCKWAVE', specialName: 'SHOCKWAVE', specialDesc: 'Travels along the ground. Jump over it!', badge: 'HEAVY', short: 'WAVE' },
    nyx: { name: 'NYX', tagline: 'SHADOW · DASH', specialName: 'SHADOW DASH', specialDesc: 'A quick dash through your opponent. Close combat.', badge: 'STEALTHY', short: 'DASH' },
    mira: { name: 'MIRA', tagline: 'ICE · SHARD FAN', specialName: 'ICE FAN', specialDesc: 'Three shards: up, forward and down.', badge: 'ICY', short: 'FAN' },
    storm: { name: 'STORM', tagline: 'STORM · LIGHTNING', specialName: 'SKY STRIKE', specialDesc: 'Lightning strikes a spot — move away in time.', badge: 'STORMBORN', short: 'LIGHTNING' },
    boss: { name: 'OVERLORD', tagline: 'VOID · BOSS', specialName: 'VOID STRIKE', specialDesc: 'The final boss. Hits harder than anyone.', badge: 'BOSS', short: 'VOID' }
  }
};

const ru = {
  app: {
    title: 'NEON CLASH — файтинг',
    desc: 'Neon Clash — неоновый 2D-файтинг для телефона. Один игрок против ИИ или двое на одном экране.',
    arena: 'Арена файтинга Neon Clash'
  },
  menu: {
    tagline: 'НЕОНОВЫЙ ФАЙТИНГ · MVP',
    p1: '1 ИГРОК', p1sub: 'против ИИ',
    p2: '2 ИГРОКА', p2sub: 'на одном экране',
    link: 'ПО BLUETOOTH', linksub: 'игра рядом',
    help: 'КАК ИГРАТЬ',
    footer: 'Поверни телефон горизонтально · надень наушники',
    roundLength: 'ДЛИНА РАУНДА', hitsFast: 'Быстро · 8', hitsNormal: 'Обычно · 12', hitsLong: 'Долго · 18',
    story: 'ИСТОРИЯ', storySub: 'пройти всех бойцов',
    language: 'ЯЗЫК'
  },
  help: {
    title: 'КАК ИГРАТЬ',
    p1title: '1 ИГРОК',
    move: '<b>Крестовина</b> — движение. Вверх — прыжок, вниз — присед.',
    punch: '<b>РУКА</b> — быстрый удар. Не попадает по присевшему сопернику.',
    kick: '<b>НОГА</b> — сильный удар. Пробивает присед.',
    block: '<b>БЛОК</b> — держи, чтобы защищаться. В воздухе не работает.',
    special: '<b>СПЕЦ</b> — особая атака. Нужно 50 энергии.',
    combo: '<b>КОМБО</b> — РУКА→РУКА «Двойка», РУКА→РУКА→НОГА «Шквал», НОГА→РУКА «Смена». Главное — попасть первым ударом.',
    roster: '<b>ВОЛЬТ</b> — плазма. <b>БЛЕЙЗ</b> — ударная волна. <b>НИКС</b> — рывок. <b>МИРА</b> — веер осколков. <b>СТОРМ</b> — молния.',
    commands: 'ПРИЁМЫ — ВПЕРЁД,ВПЕРЁД+РУКА «Рывок», ВПЕРЁД,ВПЕРЁД+НОГА «Таран», ВНИЗ,ВПЕРЁД+РУКА «Апперкот», ВНИЗ,НАЗАД+НОГА «Подсечка», ВПЕРЁД,ВНИЗ,НАЗАД+УДАР «Пробой».',
    p2title: '2 ИГРОКА',
    split: 'Экран делится пополам: у каждого своя крестовина и кнопки.',
    sides: 'Игрок 1 — слева, игрок 2 — справа. Цвета зависят от выбранного бойца.',
    mirror: 'Каждый выбирает бойца на вкладке P1 или P2. Можно выбрать одного и того же — будет зеркальный бой.',
    keyboard: 'КЛАВИАТУРА',
    keyp1: 'P1: <b>A D W S</b> + <b>F</b> рука, <b>G</b> нога, <b>H</b> блок, <b>T</b> спец.',
    keyp2: 'P2: <b>← → ↑ ↓</b> + <b>1</b> рука, <b>2</b> нога, <b>3</b> блок, <b>4</b> спец.',
    tip: 'Энергия растёт, когда ты бьёшь или получаешь урон. Бой — до двух побед.',
    close: 'ПОНЯТНО'
  },
  select: {
    k1: '1 ИГРОК · ПРОТИВ ИИ',
    k2: '2 ИГРОКА · ВЫБЕРИТЕ БОЙЦОВ',
    kLink: 'ИГРА РЯДОМ · BLUETOOTH / WI-FI',
    t1: 'ВЫБЕРИ БОЙЦА',
    t2: 'ВЫБЕРИТЕ БОЙЦОВ',
    tLink: 'ВЫБЕРИ БОЙЦА',
    you: 'ТЫ', ai: 'ИИ', both: 'P1·P2',
    speed: 'СКОР', power: 'СИЛА', range: 'ДАЛЬН',
    kStory: 'ИСТОРИЯ · ВЫБЕРИ БОЙЦА',
    tStory: 'ВЫБЕРИ БОЙЦА',
    sumStory: 'ИСТОРИЯ: {n} БОЁВ · ФИНАЛЬНЫЙ БОСС',
    storyFight: 'НАЧАТЬ ИСТОРИЮ',
    back: 'НАЗАД', fight: 'В БОЙ', toLink: 'К СВЯЗИ',
    special: '<b>СПЕЦ</b> {name} — {desc}',
    sum2: 'P1: <b>{p1}</b> · P2: <b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · ЗЕРКАЛО</span>',
    sumLink: 'ТВОЙ БОЁЦ: <b>{p1}</b> · <span class="mirror">РЯДОМ</span>',
    sum1: 'ИГРОК: <b>{p1}</b> · ИИ: <b>{ai}</b>'
  },
  link: {
    kicker: 'ИГРА РЯДОМ · BLUETOOTH / WI-FI',
    title: 'ПО BLUETOOTH',
    nearby: 'NEARBY', nearbySub: 'Bluetooth + Wi-Fi',
    ble: 'ПРЯМОЕ BLE', bleSub: 'без Wi-Fi',
    host: 'СОЗДАТЬ ИГРУ', hostSub: 'стать хостом',
    join: 'ПОДКЛЮЧИТЬСЯ', joinSub: 'найти рядом',
    back: 'НАЗАД', start: 'НАЧАТЬ БОЙ',
    note: 'Нужны два Android-телефона с включённым Bluetooth. NEARBY использует Bluetooth + Wi-Fi; ПРЯМОЕ BLE работает по Bluetooth без Wi-Fi. При обрыве связь восстанавливается автоматически.',
    checking: 'ПРОВЕРКА СВЯЗИ...',
    rolePrompt: 'NEARBY · ВЫБЕРИ РОЛЬ: ХОСТ ИЛИ ГОСТЬ',
    bleRolePrompt: 'ПРЯМОЕ BLE · ВЫБЕРИ РОЛЬ: ХОСТ ИЛИ ГОСТЬ',
    androidOnly: 'ДОСТУПНО ТОЛЬКО В ANDROID-ПРИЛОЖЕНИИ',
    bleAndroidOnly: 'ПРЯМОЕ BLE ДОСТУПНО ТОЛЬКО В ANDROID-ПРИЛОЖЕНИИ',
    charOwn: 'ТВОЙ БОЁЦ: {name}',
    charBoth: 'ТЫ: {own} · СОПЕРНИК: {peer}',
    playerNearby: 'ИГРОК РЯДОМ',
    player: 'ИГРОК',
    blePlayer: 'BLE-игрок',
    hostFailed: 'НЕ УДАЛОСЬ НАЧАТЬ: {msg}',
    searchFailed: 'НЕ УДАЛОСЬ ИСКАТЬ: {msg}',
    reconnecting: 'ПЕРЕПОДКЛЮЧЕНИЕ...',
    reconnectHint: 'не выключай Bluetooth · бой продолжится сам',
    reconnectFailed: 'НЕ УДАЛОСЬ ПЕРЕПОДКЛЮЧИТЬСЯ',
    connectionLost: 'СВЯЗЬ ПОТЕРЯНА',
    opponentLeft: 'СОПЕРНИК ВЫШЕЛ'
  },
  status: {
    permissions: 'ЗАПРАШИВАЕМ РАЗРЕШЕНИЯ...',
    permissionsNeeded: 'НУЖНЫ РАЗРЕШЕНИЯ НА BLUETOOTH И УСТРОЙСТВА РЯДОМ',
    enabling: 'ВКЛЮЧАЕМ СВЯЗЬ...',
    confirm: 'ПОДТВЕРЖДАЕМ СОЕДИНЕНИЕ...',
    connected: 'СОЕДИНЕНИЕ УСТАНОВЛЕНО',
    rejected: 'СОЕДИНЕНИЕ ОТКЛОНЕНО',
    failed: 'НЕ УДАЛОСЬ СОЕДИНИТЬСЯ',
    bluetoothOff: 'ВКЛЮЧИТЕ BLUETOOTH',
    noAccess: 'НЕТ ДОСТУПА К BLUETOOTH',
    bluetoothOn: 'BLUETOOTH ВКЛЮЧЁН',
    creatingRoom: 'СОЗДАЁМ КОМНАТУ...',
    waiting: 'ОЖИДАНИЕ ИГРОКА...',
    btUnavailable: 'BLUETOOTH НЕДОСТУПЕН: {msg}',
    searching: 'ИЩЕМ ИГРОКА РЯДОМ...',
    searchUnavailable: 'ПОИСК НЕДОСТУПЕН: {msg}',
    connectingTo: 'ПОДКЛЮЧАЕМСЯ К {name}...',
    connectFailed: 'НЕ УДАЛОСЬ ПОДКЛЮЧИТЬСЯ',
    fight: 'БОЙ',
    sendError: 'ОШИБКА ОТПРАВКИ',
    peerHost: 'ИГРОК ПОДКЛЮЧЁН · МОЖНО НАЧИНАТЬ',
    peerGuest: 'ПОДКЛЮЧЕНО · ЖДЁМ ХОСТА',
    ended: 'СВЯЗЬ ЗАВЕРШЕНА',
    reconnectAttempt: 'ПЕРЕПОДКЛЮЧЕНИЕ... {n}',
    reconnected: 'СВЯЗЬ ВОССТАНОВЛЕНА',
    reconnectFailed: 'НЕ УДАЛОСЬ ПЕРЕПОДКЛЮЧИТЬСЯ',
    blePermissions: 'ЗАПРАШИВАЕМ РАЗРЕШЕНИЯ BLE...',
    bleUnsupported: 'BLE НЕ ПОДДЕРЖИВАЕТСЯ',
    bleServerStart: 'ЗАПУСКАЕМ BLE-СЕРВЕР...',
    bleStart: 'ЗАПУСКАЕМ BLE...',
    bleServerCreate: 'СОЗДАЁМ BLE-СЕРВЕР...',
    bleWaiting: 'ОЖИДАНИЕ ИГРОКА (BLE)...',
    bleUnavailable: 'BLE НЕДОСТУПЕН: {msg}',
    bleSearching: 'ИЩЕМ BLE-УСТРОЙСТВО...',
    bleSearchUnavailable: 'BLE-ПОИСК НЕДОСТУПЕН: {msg}',
    bleConnecting: 'ПОДКЛЮЧАЕМСЯ ПО BLE...',
    bleConnectFailed: 'BLE-ПОДКЛЮЧЕНИЕ НЕ УДАЛОСЬ',
    bleConnected: 'BLE-СОЕДИНЕНИЕ УСТАНОВЛЕНО',
    bleReconnecting: 'ПЕРЕПОДКЛЮЧЕНИЕ ПО BLE...',
    bleServiceMissing: 'BLE-СЕРВИС НЕ НАЙДЕН',
    bleGuestConnected: 'ГОСТЬ ПОДКЛЮЧЁН ПО BLE',
    bleEnded: 'BLE-СВЯЗЬ ЗАВЕРШЕНА'
  },
  story: {
    chapter: 'ИСТОРИЯ · ГЛАВА {n} / {total}', finalBattle: 'ФИНАЛЬНЫЙ БОЙ',
    next: 'СЛЕДУЮЩИЙ БОЙ', retry: 'ПОВТОРИТЬ', playAgain: 'ПРОЙТИ ЗАНОВО',
    nextOpponent: 'ДАЛЬШЕ: {name}', complete: 'ИСТОРИЯ ПРОЙДЕНА',
    completeSub: 'Ты победил босса и прошёл историю.', defeatSub: 'История здесь заканчивается. Попробуй этот бой снова.'
  },
  notation: { punch: 'Р', kick: 'Н' },
  pause: { title: 'ПАУЗА', resume: 'ПРОДОЛЖИТЬ', restart: 'ЗАНОВО', quit: 'В МЕНЮ', combos: 'КОМБО', commands: 'ПРИЁМЫ', special: 'СПЕЦПРИЁМ', inputNote: 'Направления — относительно взгляда бойца.' },
  result: {
    kicker: 'БОЙ ОКОНЧЕН',
    win1: 'ПОБЕДА ИГРОКА 1',
    win2: 'ПОБЕДА ИГРОКА 2',
    win: 'ПОБЕДА',
    lose: 'ПОРАЖЕНИЕ',
    score: 'СЧЁТ РАУНДОВ {w0} : {w1} · ДО ДВУХ ПОБЕД',
    rematch: 'РЕВАНШ',
    menu: 'В МЕНЮ',
    requestSent: 'ЗАПРОС ОТПРАВЛЕН · ЖДЁМ ХОСТА'
  },
  controls: {
    pad1: 'Крестовина игрока 1', pad2: 'Крестовина игрока 2',
    jump: 'Прыжок', left: 'Влево', right: 'Вправо', crouch: 'Присед',
    block: 'БЛОК', special: 'СПЕЦ', kick: 'НОГА', punch: 'РУКА'
  },
  sound: { mute: 'Выключить звук', unmute: 'Включить звук' },
  rotate: { title: 'ПОВЕРНИ ТЕЛЕФОН', sub: 'игра создана для горизонтального экрана' },
  hud: {
    round: 'РАУНД {n}',
    fight: 'БОЙ!',
    ko: 'K.O.',
    time: 'ВРЕМЯ',
    roundWon: 'РАУНД ВЫИГРАН',
    roundWin: '{name} ПОБЕЖДАЕТ',
    draw: 'НИЧЬЯ',
    victory: 'ПОБЕДА',
    series: 'СЕРИЯ',
    combo: 'КОМБО «{name}»',
    story: 'ИСТОРИЯ {n}/{total}',
    hits: '{n} ХИТОВ'
  },
  combo: { double: 'Двойка', hook: 'Крюк', switch: 'Смена', flurry: 'Шквал', triple: 'Тройка', doubleKick: 'Двойная нога', reversal: 'Реверс', rush: 'Рывок', charge: 'Таран', uppercut: 'Апперкот', sweep: 'Подсечка', breakerPunch: 'Пробой рукой', breakerKick: 'Пробой ногой' },
  char: {
    volt: { name: 'ВОЛЬТ', tagline: 'СКОРОСТЬ · ПЛАЗМА', specialName: 'ПЛАЗМЕННЫЙ ЗАРЯД', specialDesc: 'Летящий снаряд. Держи дистанцию.', badge: 'БЫСТРЫЙ', short: 'ПЛАЗМА' },
    blaze: { name: 'БЛЕЙЗ', tagline: 'СИЛА · УДАРНАЯ ВОЛНА', specialName: 'УДАРНАЯ ВОЛНА', specialDesc: 'Идёт по земле. Перепрыгни!', badge: 'ТЯЖЁЛЫЙ', short: 'ВОЛНА' },
    nyx: { name: 'НИКС', tagline: 'ТЕНЬ · РЫВОК', specialName: 'ТЕНЕВОЙ РЫВОК', specialDesc: 'Быстрый рывок сквозь соперника. Ближний бой.', badge: 'СКРЫТНЫЙ', short: 'РЫВОК' },
    mira: { name: 'МИРА', tagline: 'ЛЁД · ВЕЕР ОСКОЛКОВ', specialName: 'ЛЕДЯНОЙ ВЕЕР', specialDesc: 'Три осколка: вверх, вперёд и вниз.', badge: 'ЛЕДЯНОЙ', short: 'ВЕЕР' },
    storm: { name: 'СТОРМ', tagline: 'ГРОЗА · МОЛНИЯ', specialName: 'НЕБЕСНЫЙ РАЗРЯД', specialDesc: 'Молния бьёт в точку — успей уйти.', badge: 'ГРОЗОВОЙ', short: 'МОЛНИЯ' },
    boss: { name: 'ОВЕРЛОРД', tagline: 'ПУСТОТА · БОСС', specialName: 'УДАР ПУСТОТЫ', specialDesc: 'Финальный босс. Бьёт сильнее всех.', badge: 'БОСС', short: 'ПУСТОТА' }
  }
};

const es = {
  app: {
    title: 'NEON CLASH — juego de lucha',
    desc: 'Neon Clash — juego de lucha 2D neón para móvil. Un jugador contra la IA o dos en una pantalla.',
    arena: 'Arena de lucha Neon Clash'
  },
  menu: {
    tagline: 'LUCHA NEÓN · MVP',
    p1: '1 JUGADOR', p1sub: 'contra la IA',
    p2: '2 JUGADORES', p2sub: 'en una pantalla',
    link: 'POR BLUETOOTH', linksub: 'jugar cerca',
    help: 'CÓMO JUGAR',
    footer: 'Gira el teléfono en horizontal · ponte auriculares',
    roundLength: 'DURACIÓN', hitsFast: 'Rápida · 8', hitsNormal: 'Normal · 12', hitsLong: 'Larga · 18',
    story: 'HISTORIA', storySub: 'vence a todos',
    language: 'IDIOMA'
  },
  help: {
    title: 'CÓMO JUGAR',
    p1title: '1 JUGADOR',
    move: '<b>CRUZ</b> — movimiento. Arriba salta, abajo se agacha.',
    punch: '<b>PUÑO</b> — golpe rápido. Falla contra un rival agachado.',
    kick: '<b>PATADA</b> — golpe fuerte. Rompe la guardia baja.',
    block: '<b>BLOQUEO</b> — mantén para defenderte. No funciona en el aire.',
    special: '<b>ESPECIAL</b> — ataque único. Cuesta 50 de energía.',
    combo: '<b>COMBO</b> — PUÑO→PUÑO «Doble», PUÑO→PUÑO→PATADA «Ráfaga», PATADA→PUÑO «Cambio». Acierta el primer golpe.',
    roster: '<b>VOLT</b> — plasma. <b>BLAZE</b> — onda. <b>NYX</b> — embestida. <b>MIRA</b> — abanico. <b>STORM</b> — rayo.',
    commands: 'COMANDOS — ADELANTE,ADELANTE+PUÑO Embestida; ADELANTE,ADELANTE+PATADA Carga; ABAJO,ADELANTE+PUÑO Uppercut; ABAJO,ATRÁS+PATADA Barrido; ADELANTE,ABAJO,ATRÁS+ATAQUE Rompebloqueo.',
    p2title: '2 JUGADORES',
    split: 'La pantalla se divide: cada jugador tiene su cruz y botones.',
    sides: 'Jugador 1 a la izquierda, jugador 2 a la derecha. Los colores siguen al luchador.',
    mirror: 'Cada jugador elige en la pestaña P1 o P2. Si eliges el mismo, hay combate espejo.',
    keyboard: 'TECLADO',
    keyp1: 'P1: <b>A D W S</b> + <b>F</b> puño, <b>G</b> patada, <b>H</b> bloqueo, <b>T</b> especial.',
    keyp2: 'P2: <b>← → ↑ ↓</b> + <b>1</b> puño, <b>2</b> patada, <b>3</b> bloqueo, <b>4</b> especial.',
    tip: 'La energía sube al golpear o recibir daño. Gana quien consiga dos rondas.',
    close: 'ENTENDIDO'
  },
  select: {
    k1: '1 JUGADOR · CONTRA LA IA',
    k2: '2 JUGADORES · ELIGAN LUCHADORES',
    kLink: 'JUGAR CERCA · BLUETOOTH / WI-FI',
    t1: 'ELIGE TU LUCHADOR',
    t2: 'ELIGAN LUCHADORES',
    tLink: 'ELIGE TU LUCHADOR',
    you: 'TÚ', ai: 'IA', both: 'P1·P2',
    speed: 'VEL', power: 'FUE', range: 'ALC',
    kStory: 'HISTORIA · ELIGE TU LUCHADOR',
    tStory: 'ELIGE TU LUCHADOR',
    sumStory: 'HISTORIA: {n} COMBATES · JEFE FINAL',
    storyFight: 'EMPEZAR HISTORIA',
    back: 'ATRÁS', fight: 'LUCHAR', toLink: 'A CONECTAR',
    special: '<b>ESPECIAL</b> {name} — {desc}',
    sum2: 'P1: <b>{p1}</b> · P2: <b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · ESPEJO</span>',
    sumLink: 'TU LUCHADOR: <b>{p1}</b> · <span class="mirror">CERCA</span>',
    sum1: 'JUGADOR: <b>{p1}</b> · IA: <b>{ai}</b>'
  },
  link: {
    kicker: 'JUGAR CERCA · BLUETOOTH / WI-FI',
    title: 'POR BLUETOOTH',
    nearby: 'NEARBY', nearbySub: 'Bluetooth + Wi-Fi',
    ble: 'BLE DIRECTO', bleSub: 'sin Wi-Fi',
    host: 'CREAR PARTIDA', hostSub: 'ser anfitrión',
    join: 'UNIRSE', joinSub: 'buscar cerca',
    back: 'ATRÁS', start: 'EMPEZAR',
    note: 'Se necesitan dos móviles Android con Bluetooth. NEARBY usa Bluetooth + Wi-Fi; BLE DIRECTO usa solo Bluetooth. La partida se reconecta sola.',
    checking: 'COMPROBANDO CONEXIÓN...',
    rolePrompt: 'NEARBY · ELIGE ROL: ANFITRIÓN O INVITADO',
    bleRolePrompt: 'BLE DIRECTO · ELIGE ROL: ANFITRIÓN O INVITADO',
    androidOnly: 'DISPONIBLE SOLO EN LA APP ANDROID',
    bleAndroidOnly: 'BLE DIRECTO SOLO ESTÁ DISPONIBLE EN LA APP ANDROID',
    charOwn: 'TU LUCHADOR: {name}',
    charBoth: 'TÚ: {own} · RIVAL: {peer}',
    playerNearby: 'JUGADOR CERCANO',
    player: 'JUGADOR',
    blePlayer: 'JUGADOR BLE',
    hostFailed: 'NO SE PUDO EMPEZAR: {msg}',
    searchFailed: 'NO SE PUDO BUSCAR: {msg}',
    reconnecting: 'RECONECTANDO...',
    reconnectHint: 'mantén el Bluetooth · la lucha continuará',
    reconnectFailed: 'NO SE PUDO RECONECTAR',
    connectionLost: 'CONEXIÓN PERDIDA',
    opponentLeft: 'EL RIVAL SE FUE'
  },
  status: {
    permissions: 'PIDIENDO PERMISOS...',
    permissionsNeeded: 'SE NECESITAN PERMISOS DE BLUETOOTH Y DISPOSITIVOS CERCANOS',
    enabling: 'ACTIVANDO CONEXIÓN...',
    confirm: 'CONFIRMANDO CONEXIÓN...',
    connected: 'CONECTADO',
    rejected: 'CONEXIÓN RECHAZADA',
    failed: 'NO SE PUDO CONECTAR',
    bluetoothOff: 'ACTIVA EL BLUETOOTH',
    noAccess: 'SIN ACCESO AL BLUETOOTH',
    bluetoothOn: 'BLUETOOTH ACTIVO',
    creatingRoom: 'CREANDO SALA...',
    waiting: 'ESPERANDO JUGADOR...',
    btUnavailable: 'BLUETOOTH NO DISPONIBLE: {msg}',
    searching: 'BUSCANDO JUGADOR CERCA...',
    searchUnavailable: 'BÚSQUEDA NO DISPONIBLE: {msg}',
    connectingTo: 'CONECTANDO CON {name}...',
    connectFailed: 'NO SE PUDO CONECTAR',
    fight: 'LUCHA',
    sendError: 'ERROR DE ENVÍO',
    peerHost: 'JUGADOR CONECTADO · LISTO PARA EMPEZAR',
    peerGuest: 'CONECTADO · ESPERANDO AL ANFITRIÓN',
    ended: 'CONEXIÓN CERRADA',
    reconnectAttempt: 'RECONECTANDO... {n}',
    reconnected: 'CONEXIÓN RESTABLECIDA',
    reconnectFailed: 'NO SE PUDO RECONECTAR',
    blePermissions: 'PIDIENDO PERMISOS BLE...',
    bleUnsupported: 'BLE NO COMPATIBLE',
    bleServerStart: 'INICIANDO SERVIDOR BLE...',
    bleStart: 'INICIANDO BLE...',
    bleServerCreate: 'CREANDO SERVIDOR BLE...',
    bleWaiting: 'ESPERANDO JUGADOR (BLE)...',
    bleUnavailable: 'BLE NO DISPONIBLE: {msg}',
    bleSearching: 'BUSCANDO DISPOSITIVO BLE...',
    bleSearchUnavailable: 'BÚSQUEDA BLE NO DISPONIBLE: {msg}',
    bleConnecting: 'CONECTANDO POR BLE...',
    bleConnectFailed: 'FALLÓ LA CONEXIÓN BLE',
    bleConnected: 'BLE CONECTADO',
    bleReconnecting: 'RECONECTANDO POR BLE...',
    bleServiceMissing: 'SERVICIO BLE NO ENCONTRADO',
    bleGuestConnected: 'INVITADO CONECTADO POR BLE',
    bleEnded: 'CONEXIÓN BLE CERRADA'
  },
  story: {
    chapter: 'HISTORIA · CAPÍTULO {n} / {total}', finalBattle: 'COMBATE FINAL',
    next: 'SIGUIENTE COMBATE', retry: 'REINTENTAR', playAgain: 'JUGAR DE NUEVO',
    nextOpponent: 'SIGUIENTE: {name}', complete: 'HISTORIA COMPLETADA',
    completeSub: 'Has derrotado al jefe y terminado la historia.', defeatSub: 'La historia termina aquí. Inténtalo de nuevo.'
  },
  notation: { punch: 'PU', kick: 'PA' },
  pause: { title: 'PAUSA', resume: 'SEGUIR', restart: 'REINICIAR', quit: 'MENÚ', combos: 'COMBOS', commands: 'COMANDOS', special: 'ESPECIAL', inputNote: 'Las direcciones son relativas a la orientación del luchador.' },
  result: {
    kicker: 'FIN DE LA LUCHA',
    win1: 'GANA EL JUGADOR 1',
    win2: 'GANA EL JUGADOR 2',
    win: 'VICTORIA',
    lose: 'DERROTA',
    score: 'RONDAS {w0} : {w1} · AL MEJOR DE TRES',
    rematch: 'REVANCHA',
    menu: 'MENÚ',
    requestSent: 'SOLICITUD ENVIADA · ESPERANDO AL ANFITRIÓN'
  },
  controls: {
    pad1: 'CRUZ DEL J1', pad2: 'CRUZ DEL J2',
    jump: 'Saltar', left: 'Izquierda', right: 'Derecha', crouch: 'Agacharse',
    block: 'BLOQ', special: 'ESP', kick: 'PIE', punch: 'PUÑO'
  },
  sound: { mute: 'Silenciar', unmute: 'Activar sonido' },
  rotate: { title: 'GIRA EL TELÉFONO', sub: 'el juego es para pantalla horizontal' },
  hud: {
    round: 'RONDA {n}',
    fight: '¡LUCHA!',
    ko: 'K.O.',
    time: 'TIEMPO',
    roundWon: 'RONDA GANADA',
    roundWin: 'GANA {name}',
    draw: 'EMPATE',
    victory: 'VICTORIA',
    series: 'RACHA',
    combo: 'COMBO «{name}»',
    story: 'HISTORIA {n}/{total}',
    hits: '{n} GOLPES'
  },
  combo: { double: 'Doble', hook: 'Gancho', switch: 'Cambio', flurry: 'Ráfaga', triple: 'Triple', doubleKick: 'Patada doble', reversal: 'Reversión', rush: 'Embestida', charge: 'Carga', uppercut: 'Uppercut', sweep: 'Barrido', breakerPunch: 'Rompebloqueo', breakerKick: 'Patada rota' },
  char: {
    volt: { name: 'VOLT', tagline: 'VELOCIDAD · PLASMA', specialName: 'CARGA DE PLASMA', specialDesc: 'Proyectil volador. Mantén la distancia.', badge: 'RÁPIDO', short: 'PLASMA' },
    blaze: { name: 'BLAZE', tagline: 'FUERZA · ONDA', specialName: 'ONDA SÍSMICA', specialDesc: 'Viaja por el suelo. ¡Salta!', badge: 'PESADO', short: 'ONDA' },
    nyx: { name: 'NYX', tagline: 'SOMBRA · EMBESTIDA', specialName: 'EMBESTIDA SOMBRÍA', specialDesc: 'Embestida rápida a través del rival. Cuerpo a cuerpo.', badge: 'OCULTO', short: 'EMBESTIDA' },
    mira: { name: 'MIRA', tagline: 'HIELO · ABANICO', specialName: 'ABANICO DE HIELO', specialDesc: 'Tres fragmentos: arriba, adelante y abajo.', badge: 'GÉLIDO', short: 'ABANICO' },
    storm: { name: 'STORM', tagline: 'TORMENTA · RAYO', specialName: 'RAYO CELESTE', specialDesc: 'El rayo cae en un punto: muévete a tiempo.', badge: 'TORMENTA', short: 'RAYO' },
    boss: { name: 'OVERLORD', tagline: 'VACÍO · JEFE', specialName: 'GOLPE DEL VACÍO', specialDesc: 'El jefe final. Golpea más fuerte que nadie.', badge: 'JEFE', short: 'VACÍO' }
  }
};

const pt = {
  app: {
    title: 'NEON CLASH — jogo de luta',
    desc: 'Neon Clash — jogo de luta 2D neon para celular. Um jogador contra a IA ou dois na mesma tela.',
    arena: 'Arena de luta Neon Clash'
  },
  menu: {
    tagline: 'LUTA NEON · MVP',
    p1: '1 JOGADOR', p1sub: 'contra a IA',
    p2: '2 JOGADORES', p2sub: 'na mesma tela',
    link: 'POR BLUETOOTH', linksub: 'jogar perto',
    help: 'COMO JOGAR',
    footer: 'Vire o celular na horizontal · use fones',
    roundLength: 'DURAÇÃO', hitsFast: 'Rápida · 8', hitsNormal: 'Normal · 12', hitsLong: 'Longa · 18',
    story: 'HISTÓRIA', storySub: 'enfrente todos',
    language: 'IDIOMA'
  },
  help: {
    title: 'COMO JOGAR',
    p1title: '1 JOGADOR',
    move: '<b>CRUZETA</b> — movimento. Cima pula, baixo agacha.',
    punch: '<b>SOC</b> — golpe rápido. Erra em quem está agachado.',
    kick: '<b>CHUTE</b> — golpe forte. Quebra a defesa baixa.',
    block: '<b>BLOQUEIO</b> — segure para defender. Não funciona no ar.',
    special: '<b>ESPECIAL</b> — ataque único. Custa 50 de energia.',
    combo: '<b>COMBO</b> — SOC→SOC «Dupla», SOC→SOC→CHUTE «Rajada», CHUTE→SOC «Troca». Acerte o primeiro golpe.',
    roster: '<b>VOLT</b> — plasma. <b>BLAZE</b> — onda. <b>NYX</b> — avanço. <b>MIRA</b> — leque. <b>STORM</b> — raio.',
    commands: 'COMANDOS — FRENTE,FRENTE+SOC Avanço; FRENTE,FRENTE+CHUTE Carga; BAIXO,FRENTE+SOC Uppercut; BAIXO,TRÁS+CHUTE Rasteira; FRENTE,BAIXO,TRÁS+ATAQUE Quebra-guarda.',
    p2title: '2 JOGADORES',
    split: 'A tela se divide: cada jogador tem sua cruzeta e botões.',
    sides: 'Jogador 1 à esquerda, jogador 2 à direita. As cores seguem o lutador.',
    mirror: 'Cada um escolhe na aba P1 ou P2. Se escolherem o mesmo, é luta espelhada.',
    keyboard: 'TECLADO',
    keyp1: 'P1: <b>A D W S</b> + <b>F</b> soco, <b>G</b> chute, <b>H</b> bloqueio, <b>T</b> especial.',
    keyp2: 'P2: <b>← → ↑ ↓</b> + <b>1</b> soco, <b>2</b> chute, <b>3</b> bloqueio, <b>4</b> especial.',
    tip: 'A energia sobe ao acertar ou levar dano. Vence quem ganhar duas rodadas.',
    close: 'ENTENDI'
  },
  select: {
    k1: '1 JOGADOR · CONTRA A IA',
    k2: '2 JOGADORES · ESCOLHAM LUTADORES',
    kLink: 'JOGAR PERTO · BLUETOOTH / WI-FI',
    t1: 'ESCOLHA SEU LUTADOR',
    t2: 'ESCOLHAM LUTADORES',
    tLink: 'ESCOLHA SEU LUTADOR',
    you: 'VOCÊ', ai: 'IA', both: 'P1·P2',
    speed: 'VEL', power: 'FOR', range: 'ALC',
    kStory: 'HISTÓRIA · ESCOLHA SEU LUTADOR',
    tStory: 'ESCOLHA SEU LUTADOR',
    sumStory: 'HISTÓRIA: {n} LUTAS · CHEFE FINAL',
    storyFight: 'COMEÇAR HISTÓRIA',
    back: 'VOLTAR', fight: 'LUTAR', toLink: 'CONECTAR',
    special: '<b>ESPECIAL</b> {name} — {desc}',
    sum2: 'P1: <b>{p1}</b> · P2: <b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · ESPELHO</span>',
    sumLink: 'SEU LUTADOR: <b>{p1}</b> · <span class="mirror">PERTO</span>',
    sum1: 'JOGADOR: <b>{p1}</b> · IA: <b>{ai}</b>'
  },
  link: {
    kicker: 'JOGAR PERTO · BLUETOOTH / WI-FI',
    title: 'POR BLUETOOTH',
    nearby: 'NEARBY', nearbySub: 'Bluetooth + Wi-Fi',
    ble: 'BLE DIRETO', bleSub: 'sem Wi-Fi',
    host: 'CRIAR PARTIDA', hostSub: 'ser anfitrião',
    join: 'ENTRAR', joinSub: 'buscar perto',
    back: 'VOLTAR', start: 'COMEÇAR',
    note: 'São necessários dois celulares Android com Bluetooth. NEARBY usa Bluetooth + Wi-Fi; BLE DIRETO usa só Bluetooth. A partida se reconecta sozinha.',
    checking: 'VERIFICANDO CONEXÃO...',
    rolePrompt: 'NEARBY · ESCOLHA O PAPEL: ANFITRIÃO OU CONVIDADO',
    bleRolePrompt: 'BLE DIRETO · ESCOLHA O PAPEL: ANFITRIÃO OU CONVIDADO',
    androidOnly: 'DISPONÍVEL SÓ NO APP ANDROID',
    bleAndroidOnly: 'BLE DIRETO SÓ ESTÁ DISPONÍVEL NO APP ANDROID',
    charOwn: 'SEU LUTADOR: {name}',
    charBoth: 'VOCÊ: {own} · RIVAL: {peer}',
    playerNearby: 'JOGADOR PERTO',
    player: 'JOGADOR',
    blePlayer: 'JOGADOR BLE',
    hostFailed: 'NÃO FOI POSSÍVEL COMEÇAR: {msg}',
    searchFailed: 'NÃO FOI POSSÍVEL BUSCAR: {msg}',
    reconnecting: 'RECONECTANDO...',
    reconnectHint: 'mantenha o Bluetooth · a luta continua',
    reconnectFailed: 'NÃO FOI POSSÍVEL RECONECTAR',
    connectionLost: 'CONEXÃO PERDIDA',
    opponentLeft: 'O RIVAL SAIU'
  },
  status: {
    permissions: 'PEDINDO PERMISSÕES...',
    permissionsNeeded: 'SÃO NECESSÁRIAS PERMISSÕES DE BLUETOOTH E DISPOSITIVOS PRÓXIMOS',
    enabling: 'ATIVANDO CONEXÃO...',
    confirm: 'CONFIRMANDO CONEXÃO...',
    connected: 'CONECTADO',
    rejected: 'CONEXÃO RECUSADA',
    failed: 'NÃO FOI POSSÍVEL CONECTAR',
    bluetoothOff: 'ATIVE O BLUETOOTH',
    noAccess: 'SEM ACESSO AO BLUETOOTH',
    bluetoothOn: 'BLUETOOTH ATIVO',
    creatingRoom: 'CRIANDO SALA...',
    waiting: 'ESPERANDO JOGADOR...',
    btUnavailable: 'BLUETOOTH INDISPONÍVEL: {msg}',
    searching: 'BUSCANDO JOGADOR PERTO...',
    searchUnavailable: 'BUSCA INDISPONÍVEL: {msg}',
    connectingTo: 'CONECTANDO A {name}...',
    connectFailed: 'NÃO FOI POSSÍVEL CONECTAR',
    fight: 'LUTA',
    sendError: 'ERRO DE ENVIO',
    peerHost: 'JOGADOR CONECTADO · PRONTO PARA COMEÇAR',
    peerGuest: 'CONECTADO · ESPERANDO O ANFITRIÃO',
    ended: 'CONEXÃO ENCERRADA',
    reconnectAttempt: 'RECONECTANDO... {n}',
    reconnected: 'CONEXÃO RESTAURADA',
    reconnectFailed: 'NÃO FOI POSSÍVEL RECONECTAR',
    blePermissions: 'PEDINDO PERMISSÕES BLE...',
    bleUnsupported: 'BLE NÃO SUPORTADO',
    bleServerStart: 'INICIANDO SERVIDOR BLE...',
    bleStart: 'INICIANDO BLE...',
    bleServerCreate: 'CRIANDO SERVIDOR BLE...',
    bleWaiting: 'ESPERANDO JOGADOR (BLE)...',
    bleUnavailable: 'BLE INDISPONÍVEL: {msg}',
    bleSearching: 'BUSCANDO DISPOSITIVO BLE...',
    bleSearchUnavailable: 'BUSCA BLE INDISPONÍVEL: {msg}',
    bleConnecting: 'CONECTANDO POR BLE...',
    bleConnectFailed: 'FALHA NA CONEXÃO BLE',
    bleConnected: 'BLE CONECTADO',
    bleReconnecting: 'RECONECTANDO POR BLE...',
    bleServiceMissing: 'SERVIÇO BLE NÃO ENCONTRADO',
    bleGuestConnected: 'CONVIDADO CONECTADO POR BLE',
    bleEnded: 'CONEXÃO BLE ENCERRADA'
  },
  story: {
    chapter: 'HISTÓRIA · CAPÍTULO {n} / {total}', finalBattle: 'LUTA FINAL',
    next: 'PRÓXIMA LUTA', retry: 'TENTAR DE NOVO', playAgain: 'JOGAR DE NOVO',
    nextOpponent: 'PRÓXIMO: {name}', complete: 'HISTÓRIA CONCLUÍDA',
    completeSub: 'Você derrotou o chefe e concluiu a história.', defeatSub: 'A história termina aqui. Tente esta luta novamente.'
  },
  notation: { punch: 'SO', kick: 'CH' },
  pause: { title: 'PAUSA', resume: 'CONTINUAR', restart: 'REINICIAR', quit: 'MENU', combos: 'COMBOS', commands: 'COMANDOS', special: 'ESPECIAL', inputNote: 'As direções são relativas para onde o lutador está virado.' },
  result: {
    kicker: 'FIM DA LUTA',
    win1: 'JOGADOR 1 VENCE',
    win2: 'JOGADOR 2 VENCE',
    win: 'VITÓRIA',
    lose: 'DERROTA',
    score: 'RODADAS {w0} : {w1} · MELHOR DE TRÊS',
    rematch: 'REVANCHE',
    menu: 'MENU',
    requestSent: 'PEDIDO ENVIADO · ESPERANDO O ANFITRIÃO'
  },
  controls: {
    pad1: 'CRUZETA DO J1', pad2: 'CRUZETA DO J2',
    jump: 'Pular', left: 'Esquerda', right: 'Direita', crouch: 'Agachar',
    block: 'BLOQ', special: 'ESP', kick: 'CHUTE', punch: 'SOCO'
  },
  sound: { mute: 'Silenciar', unmute: 'Ativar som' },
  rotate: { title: 'VIRE O CELULAR', sub: 'o jogo é para tela horizontal' },
  hud: {
    round: 'RODADA {n}',
    fight: 'LUTA!',
    ko: 'K.O.',
    time: 'TEMPO',
    roundWon: 'RODADA VENCIDA',
    roundWin: '{name} VENCE',
    draw: 'EMPATE',
    victory: 'VITÓRIA',
    series: 'SEQUÊNCIA',
    combo: 'COMBO «{name}»',
    story: 'HISTÓRIA {n}/{total}',
    hits: '{n} GOLPES'
  },
  combo: { double: 'Dupla', hook: 'Gancho', switch: 'Troca', flurry: 'Rajada', triple: 'Tripla', doubleKick: 'Chute duplo', reversal: 'Reversão', rush: 'Avanço', charge: 'Carga', uppercut: 'Uppercut', sweep: 'Rasteira', breakerPunch: 'Quebra-guarda', breakerKick: 'Chute quebra' },
  char: {
    volt: { name: 'VOLT', tagline: 'VELOCIDADE · PLASMA', specialName: 'CARGA DE PLASMA', specialDesc: 'Projétil voador. Mantenha distância.', badge: 'RÁPIDO', short: 'PLASMA' },
    blaze: { name: 'BLAZE', tagline: 'FORÇA · ONDA', specialName: 'ONDA DE CHOQUE', specialDesc: 'Anda pelo chão. Pule!', badge: 'PESADO', short: 'ONDA' },
    nyx: { name: 'NYX', tagline: 'SOMBRA · AVANÇO', specialName: 'AVANÇO SOMBRIO', specialDesc: 'Avanço rápido pelo oponente. Corpo a corpo.', badge: 'OCULTO', short: 'AVANÇO' },
    mira: { name: 'MIRA', tagline: 'GELO · LEQUE', specialName: 'LEQUE DE GELO', specialDesc: 'Três fragmentos: cima, frente e baixo.', badge: 'GÉLIDO', short: 'LEQUE' },
    storm: { name: 'STORM', tagline: 'TEMPESTADE · RAIO', specialName: 'RAIO CELESTE', specialDesc: 'O raio cai num ponto — saia a tempo.', badge: 'TEMPESTUOSO', short: 'RAIO' },
    boss: { name: 'OVERLORD', tagline: 'VAZIO · CHEFE', specialName: 'GOLPE DO VAZIO', specialDesc: 'O chefe final. Bate mais forte que todos.', badge: 'CHEFE', short: 'VAZIO' }
  }
};

const fr = {
  app: {
    title: 'NEON CLASH — jeu de combat',
    desc: 'Neon Clash — jeu de combat 2D néon pour mobile. Un joueur contre l’IA ou deux sur un écran.',
    arena: 'Arène de combat Neon Clash'
  },
  menu: {
    tagline: 'COMBAT NÉON · MVP',
    p1: '1 JOUEUR', p1sub: 'contre l’IA',
    p2: '2 JOUEURS', p2sub: 'sur un écran',
    link: 'PAR BLUETOOTH', linksub: 'jouer à proximité',
    help: 'COMMENT JOUER',
    footer: 'Mets le téléphone à l’horizontale · mets un casque',
    roundLength: 'DURÉE', hitsFast: 'Rapide · 8', hitsNormal: 'Normale · 12', hitsLong: 'Longue · 18',
    story: 'HISTOIRE', storySub: 'bats tous les combattants',
    language: 'LANGUE'
  },
  help: {
    title: 'COMMENT JOUER',
    p1title: '1 JOUEUR',
    move: '<b>CROIX</b> — déplacement. Haut pour sauter, bas pour s’accroupir.',
    punch: '<b>POING</b> — frappe rapide. Rate un adversaire accroupi.',
    kick: '<b>PIED</b> — frappe puissante. Brise la garde basse.',
    block: '<b>BLOCAGE</b> — maintiens pour te défendre. Inutile en l’air.',
    special: '<b>SPÉCIAL</b> — attaque unique. Coûte 50 d’énergie.',
    combo: '<b>COMBO</b> — POING→POING «Double», POING→POING→PIED «Déluge», PIED→POING «Bascule». Touche avec le premier coup.',
    roster: '<b>VOLT</b> — plasma. <b>BLAZE</b> — onde. <b>NYX</b> — ruée. <b>MIRA</b> — éventail. <b>STORM</b> — foudre.',
    commands: 'COMMANDES — AVANT,AVANT+POING Ruée ; AVANT,AVANT+PIED Charge ; BAS,AVANT+POING Uppercut ; BAS,ARRIÈRE+PIED Balayage ; AVANT,BAS,ARRIÈRE+ATTAQUE Brise-garde.',
    p2title: '2 JOUEURS',
    split: 'L’écran se coupe en deux : chacun a sa croix et ses boutons.',
    sides: 'Joueur 1 à gauche, joueur 2 à droite. Les couleurs suivent le combattant.',
    mirror: 'Chacun choisit dans l’onglet P1 ou P2. Le même combattant donne un combat miroir.',
    keyboard: 'CLAVIER',
    keyp1: 'P1 : <b>A D W S</b> + <b>F</b> poing, <b>G</b> pied, <b>H</b> blocage, <b>T</b> spécial.',
    keyp2: 'P2 : <b>← → ↑ ↓</b> + <b>1</b> poing, <b>2</b> pied, <b>3</b> blocage, <b>4</b> spécial.',
    tip: 'L’énergie monte quand tu frappes ou prends des dégâts. Premier à deux manches gagnées.',
    close: 'COMPRIS'
  },
  select: {
    k1: '1 JOUEUR · CONTRE L’IA',
    k2: '2 JOUEURS · CHOISISSEZ VOS COMBATTANTS',
    kLink: 'JOUER À PROXIMITÉ · BLUETOOTH / WI-FI',
    t1: 'CHOISIS TON COMBATTANT',
    t2: 'CHOISISSEZ VOS COMBATTANTS',
    tLink: 'CHOISIS TON COMBATTANT',
    you: 'TOI', ai: 'IA', both: 'P1·P2',
    speed: 'VIT', power: 'FOR', range: 'POR',
    kStory: 'HISTOIRE · CHOISIS TON COMBATTANT',
    tStory: 'CHOISIS TON COMBATTANT',
    sumStory: 'HISTOIRE : {n} COMBATS · BOSS FINAL',
    storyFight: 'COMMENCER L’HISTOIRE',
    back: 'RETOUR', fight: 'COMBAT', toLink: 'CONNEXION',
    special: '<b>SPÉCIAL</b> {name} — {desc}',
    sum2: 'P1 : <b>{p1}</b> · P2 : <b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · MIROIR</span>',
    sumLink: 'TON COMBATTANT : <b>{p1}</b> · <span class="mirror">À CÔTÉ</span>',
    sum1: 'JOUEUR : <b>{p1}</b> · IA : <b>{ai}</b>'
  },
  link: {
    kicker: 'JOUER À PROXIMITÉ · BLUETOOTH / WI-FI',
    title: 'PAR BLUETOOTH',
    nearby: 'NEARBY', nearbySub: 'Bluetooth + Wi-Fi',
    ble: 'BLE DIRECT', bleSub: 'sans Wi-Fi',
    host: 'CRÉER UNE PARTIE', hostSub: 'être hôte',
    join: 'REJOINDRE', joinSub: 'chercher à proximité',
    back: 'RETOUR', start: 'COMMENCER',
    note: 'Deux téléphones Android avec Bluetooth sont nécessaires. NEARBY utilise Bluetooth + Wi-Fi ; BLE DIRECT utilise seulement Bluetooth. La partie se reconnecte seule.',
    checking: 'VÉRIFICATION DE LA CONNEXION...',
    rolePrompt: 'NEARBY · CHOISIS LE RÔLE : HÔTE OU INVITÉ',
    bleRolePrompt: 'BLE DIRECT · CHOISIS LE RÔLE : HÔTE OU INVITÉ',
    androidOnly: 'DISPONIBLE UNIQUEMENT DANS L’APP ANDROID',
    bleAndroidOnly: 'BLE DIRECT EST DISPONIBLE UNIQUEMENT DANS L’APP ANDROID',
    charOwn: 'TON COMBATTANT : {name}',
    charBoth: 'TOI : {own} · ADVERSAIRE : {peer}',
    playerNearby: 'JOUEUR À PROXIMITÉ',
    player: 'JOUEUR',
    blePlayer: 'JOUEUR BLE',
    hostFailed: 'IMPOSSIBLE DE COMMENCER : {msg}',
    searchFailed: 'IMPOSSIBLE DE CHERCHER : {msg}',
    reconnecting: 'RECONNEXION...',
    reconnectHint: 'garde le Bluetooth · le combat reprendra',
    reconnectFailed: 'RECONNEXION IMPOSSIBLE',
    connectionLost: 'CONNEXION PERDUE',
    opponentLeft: 'L’ADVERSAIRE EST PARTI'
  },
  status: {
    permissions: 'DEMANDE DES AUTORISATIONS...',
    permissionsNeeded: 'AUTORISATIONS BLUETOOTH ET APPAREILS À PROXIMITÉ REQUISES',
    enabling: 'ACTIVATION DE LA CONNEXION...',
    confirm: 'CONFIRMATION DE LA CONNEXION...',
    connected: 'CONNECTÉ',
    rejected: 'CONNEXION REFUSÉE',
    failed: 'CONNEXION IMPOSSIBLE',
    bluetoothOff: 'ACTIVE LE BLUETOOTH',
    noAccess: 'PAS D’ACCÈS AU BLUETOOTH',
    bluetoothOn: 'BLUETOOTH ACTIVÉ',
    creatingRoom: 'CRÉATION DE LA SALLE...',
    waiting: 'EN ATTENTE D’UN JOUEUR...',
    btUnavailable: 'BLUETOOTH INDISPONIBLE : {msg}',
    searching: 'RECHERCHE D’UN JOUEUR À PROXIMITÉ...',
    searchUnavailable: 'RECHERCHE INDISPONIBLE : {msg}',
    connectingTo: 'CONNEXION À {name}...',
    connectFailed: 'CONNEXION IMPOSSIBLE',
    fight: 'COMBAT',
    sendError: 'ERREUR D’ENVOI',
    peerHost: 'JOUEUR CONNECTÉ · PRÊT À COMMENCER',
    peerGuest: 'CONNECTÉ · EN ATTENTE DE L’HÔTE',
    ended: 'CONNEXION FERMÉE',
    reconnectAttempt: 'RECONNEXION... {n}',
    reconnected: 'CONNEXION RÉTABLIE',
    reconnectFailed: 'RECONNEXION IMPOSSIBLE',
    blePermissions: 'DEMANDE DES AUTORISATIONS BLE...',
    bleUnsupported: 'BLE NON PRIS EN CHARGE',
    bleServerStart: 'DÉMARRAGE DU SERVEUR BLE...',
    bleStart: 'DÉMARRAGE DU BLE...',
    bleServerCreate: 'CRÉATION DU SERVEUR BLE...',
    bleWaiting: 'EN ATTENTE D’UN JOUEUR (BLE)...',
    bleUnavailable: 'BLE INDISPONIBLE : {msg}',
    bleSearching: 'RECHERCHE D’UN APPAREIL BLE...',
    bleSearchUnavailable: 'RECHERCHE BLE INDISPONIBLE : {msg}',
    bleConnecting: 'CONNEXION BLE...',
    bleConnectFailed: 'ÉCHEC DE LA CONNEXION BLE',
    bleConnected: 'BLE CONNECTÉ',
    bleReconnecting: 'RECONNEXION BLE...',
    bleServiceMissing: 'SERVICE BLE INTROUVABLE',
    bleGuestConnected: 'INVITÉ CONNECTÉ EN BLE',
    bleEnded: 'CONNEXION BLE FERMÉE'
  },
  story: {
    chapter: 'HISTOIRE · CHAPITRE {n} / {total}', finalBattle: 'COMBAT FINAL',
    next: 'COMBAT SUIVANT', retry: 'RÉESSAYER', playAgain: 'REJOUER',
    nextOpponent: 'SUIVANT : {name}', complete: 'HISTOIRE TERMINÉE',
    completeSub: 'Tu as vaincu le boss et terminé l’histoire.', defeatSub: 'L’histoire s’arrête ici. Réessaie ce combat.'
  },
  notation: { punch: 'PO', kick: 'PI' },
  pause: { title: 'PAUSE', resume: 'REPRENDRE', restart: 'RECOMMENCER', quit: 'MENU', combos: 'COMBOS', commands: 'COMMANDES', special: 'SPÉCIAL', inputNote: 'Les directions sont relatives à l’orientation du combattant.' },
  result: {
    kicker: 'COMBAT TERMINÉ',
    win1: 'JOUEUR 1 GAGNE',
    win2: 'JOUEUR 2 GAGNE',
    win: 'VICTOIRE',
    lose: 'DÉFAITE',
    score: 'MANCHES {w0} : {w1} · PREMIER À DEUX',
    rematch: 'REVANCHE',
    menu: 'MENU',
    requestSent: 'DEMANDE ENVOYÉE · EN ATTENTE DE L’HÔTE'
  },
  controls: {
    pad1: 'CROIX J1', pad2: 'CROIX J2',
    jump: 'Sauter', left: 'Gauche', right: 'Droite', crouch: 'S’accroupir',
    block: 'BLOQ', special: 'SPEC', kick: 'PIED', punch: 'POING'
  },
  sound: { mute: 'Couper le son', unmute: 'Activer le son' },
  rotate: { title: 'TOURNE LE TÉLÉPHONE', sub: 'le jeu est prévu pour l’horizontale' },
  hud: {
    round: 'MANCHE {n}',
    fight: 'COMBAT !',
    ko: 'K.O.',
    time: 'TEMPS',
    roundWon: 'MANCHE GAGNÉE',
    roundWin: '{name} GAGNE',
    draw: 'ÉGALITÉ',
    victory: 'VICTOIRE',
    series: 'SÉRIE',
    combo: 'COMBO «{name}»',
    story: 'HISTOIRE {n}/{total}',
    hits: '{n} COUPS'
  },
  combo: { double: 'Double', hook: 'Crochet', switch: 'Bascule', flurry: 'Déluge', triple: 'Triple', doubleKick: 'Double coup de pied', reversal: 'Revers', rush: 'Ruée', charge: 'Charge', uppercut: 'Uppercut', sweep: 'Balayage', breakerPunch: 'Brise-garde', breakerKick: 'Coup de pied briseur' },
  char: {
    volt: { name: 'VOLT', tagline: 'VITESSE · PLASMA', specialName: 'CHARGE PLASMA', specialDesc: 'Projectile volant. Garde tes distances.', badge: 'RAPIDE', short: 'PLASMA' },
    blaze: { name: 'BLAZE', tagline: 'FORCE · ONDE', specialName: 'ONDE DE CHOC', specialDesc: 'Rase le sol. Saute par-dessus !', badge: 'LOURD', short: 'ONDE' },
    nyx: { name: 'NYX', tagline: 'OMBRE · RUÉE', specialName: 'RUÉE OMBRÉE', specialDesc: 'Ruée rapide à travers l’adversaire. Corps à corps.', badge: 'FURTIF', short: 'RUÉE' },
    mira: { name: 'MIRA', tagline: 'GLACE · ÉVENTAIL', specialName: 'ÉVENTAIL DE GLACE', specialDesc: 'Trois éclats : haut, avant et bas.', badge: 'GLACIAL', short: 'ÉVENTAIL' },
    storm: { name: 'STORM', tagline: 'ORAGE · FOUDRE', specialName: 'FOUDRE CÉLESTE', specialDesc: 'La foudre frappe un point — déplace-toi à temps.', badge: 'ORAGEUX', short: 'FOUDRE' },
    boss: { name: 'OVERLORD', tagline: 'VIDE · BOSS', specialName: 'FRAPPE DU VIDE', specialDesc: 'Le boss final. Frappe plus fort que tous.', badge: 'BOSS', short: 'VIDE' }
  }
};

const de = {
  app: {
    title: 'NEON CLASH — Kampfspiel',
    desc: 'Neon Clash — Neon-2D-Kampfspiel fürs Handy. Ein Spieler gegen KI oder zwei auf einem Bildschirm.',
    arena: 'Neon Clash Kampfarena'
  },
  menu: {
    tagline: 'NEON-KAMPF · MVP',
    p1: '1 SPIELER', p1sub: 'gegen KI',
    p2: '2 SPIELER', p2sub: 'auf einem Bildschirm',
    link: 'ÜBER BLUETOOTH', linksub: 'in der Nähe spielen',
    help: 'SO WIRD GESPIELT',
    footer: 'Handy quer halten · Kopfhörer auf',
    roundLength: 'RUNDENLÄNGE', hitsFast: 'Kurz · 8', hitsNormal: 'Normal · 12', hitsLong: 'Lang · 18',
    story: 'STORY', storySub: 'alle Kämpfer besiegen',
    language: 'SPRACHE'
  },
  help: {
    title: 'SO WIRD GESPIELT',
    p1title: '1 SPIELER',
    move: '<b>STEUERKREUZ</b> — Bewegung. Hoch springt, runter duckt.',
    punch: '<b>FAUST</b> — schneller Schlag. Trifft keinen geduckten Gegner.',
    kick: '<b>TRITT</b> — schwerer Schlag. Durchbricht die Deckung unten.',
    block: '<b>BLOCK</b> — halten zum Verteidigen. In der Luft nutzlos.',
    special: '<b>SPEZIAL</b> — einzigartige Attacke. Kostet 50 Energie.',
    combo: '<b>COMBO</b> — FAUST→FAUST „Doppel“, FAUST→FAUST→TRITT „Salve“, TRITT→FAUST „Wechsel“. Triff mit dem ersten Schlag.',
    roster: '<b>VOLT</b> — Plasma. <b>BLAZE</b> — Schockwelle. <b>NYX</b> — Sprint. <b>MIRA</b> — Fächer. <b>STORM</b> — Blitz.',
    commands: 'KOMMANDOS — VOR,VOR+FAUST Sprint; VOR,VOR+TRITT Ansturm; RUNTER,VOR+FAUST Uppercut; RUNTER,ZURÜCK+TRITT Tiefkick; VOR,RUNTER,ZURÜCK+ANGRIFF Guardbrecher.',
    p2title: '2 SPIELER',
    split: 'Der Bildschirm wird geteilt: jeder hat ein Steuerkreuz und Tasten.',
    sides: 'Spieler 1 links, Spieler 2 rechts. Farben richten sich nach dem Kämpfer.',
    mirror: 'Jeder wählt im P1- oder P2-Tab. Gleicher Kämpfer ergibt einen Spiegelkampf.',
    keyboard: 'TASTATUR',
    keyp1: 'P1: <b>A D W S</b> + <b>F</b> Faust, <b>G</b> Tritt, <b>H</b> Block, <b>T</b> Spezial.',
    keyp2: 'P2: <b>← → ↑ ↓</b> + <b>1</b> Faust, <b>2</b> Tritt, <b>3</b> Block, <b>4</b> Spezial.',
    tip: 'Energie steigt bei Treffern und Schaden. Wer zwei Runden gewinnt, gewinnt den Kampf.',
    close: 'VERSTANDEN'
  },
  select: {
    k1: '1 SPIELER · GEGEN KI',
    k2: '2 SPIELER · KÄMPFER WÄHLEN',
    kLink: 'IN DER NÄHE · BLUETOOTH / WI-FI',
    t1: 'WÄHLE DEINEN KÄMPFER',
    t2: 'WÄHLT EURE KÄMPFER',
    tLink: 'WÄHLE DEINEN KÄMPFER',
    you: 'DU', ai: 'KI', both: 'P1·P2',
    speed: 'TEM', power: 'KRA', range: 'REI',
    kStory: 'STORY · KÄMPFER WÄHLEN',
    tStory: 'KÄMPFER WÄHLEN',
    sumStory: 'STORY: {n} KÄMPFE · ENDBOSS',
    storyFight: 'STORY STARTEN',
    back: 'ZURÜCK', fight: 'KAMPF', toLink: 'VERBINDEN',
    special: '<b>SPEZIAL</b> {name} — {desc}',
    sum2: 'P1: <b>{p1}</b> · P2: <b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · SPIEGEL</span>',
    sumLink: 'DEIN KÄMPFER: <b>{p1}</b> · <span class="mirror">NÄHE</span>',
    sum1: 'SPIELER: <b>{p1}</b> · KI: <b>{ai}</b>'
  },
  link: {
    kicker: 'IN DER NÄHE SPIELEN · BLUETOOTH / WI-FI',
    title: 'ÜBER BLUETOOTH',
    nearby: 'NEARBY', nearbySub: 'Bluetooth + Wi-Fi',
    ble: 'DIREKT BLE', bleSub: 'ohne Wi-Fi',
    host: 'SPIEL ERSTELLEN', hostSub: 'Host werden',
    join: 'BEITRETEN', joinSub: 'in der Nähe suchen',
    back: 'ZURÜCK', start: 'KAMPF STARTEN',
    note: 'Zwei Android-Handys mit Bluetooth nötig. NEARBY nutzt Bluetooth + Wi-Fi; DIREKT BLE nur Bluetooth. Die Partie verbindet sich automatisch neu.',
    checking: 'VERBINDUNG WIRD GEPRÜFT...',
    rolePrompt: 'NEARBY · ROLLE WÄHLEN: HOST ODER GAST',
    bleRolePrompt: 'DIREKT BLE · ROLLE WÄHLEN: HOST ODER GAST',
    androidOnly: 'NUR IN DER ANDROID-APP VERFÜGBAR',
    bleAndroidOnly: 'DIREKT BLE IST NUR IN DER ANDROID-APP VERFÜGBAR',
    charOwn: 'DEIN KÄMPFER: {name}',
    charBoth: 'DU: {own} · GEGNER: {peer}',
    playerNearby: 'SPIELER IN DER NÄHE',
    player: 'SPIELER',
    blePlayer: 'BLE-SPIELER',
    hostFailed: 'START FEHLGESCHLAGEN: {msg}',
    searchFailed: 'SUCHE FEHLGESCHLAGEN: {msg}',
    reconnecting: 'VERBINDE NEU...',
    reconnectHint: 'Bluetooth an lassen · der Kampf geht weiter',
    reconnectFailed: 'NEUVERBINDUNG FEHLGESCHLAGEN',
    connectionLost: 'VERBINDUNG VERLOREN',
    opponentLeft: 'GEGNER HAT VERLASSEN'
  },
  status: {
    permissions: 'BERECHTIGUNGEN WERDEN ANGEFRAGT...',
    permissionsNeeded: 'BLUETOOTH- UND GERÄTE-IN-DER-NÄHE-BERECHTIGUNGEN NÖTIG',
    enabling: 'VERBINDUNG WIRD AKTIVIERT...',
    confirm: 'VERBINDUNG WIRD BESTÄTIGT...',
    connected: 'VERBUNDEN',
    rejected: 'VERBINDUNG ABGELEHNT',
    failed: 'VERBINDUNG FEHLGESCHLAGEN',
    bluetoothOff: 'BLUETOOTH EINSCHALTEN',
    noAccess: 'KEIN BLUETOOTH-ZUGRIFF',
    bluetoothOn: 'BLUETOOTH IST AN',
    creatingRoom: 'RAUM WIRD ERSTELLT...',
    waiting: 'WARTE AUF SPIELER...',
    btUnavailable: 'BLUETOOTH NICHT VERFÜGBAR: {msg}',
    searching: 'SUCHE SPIELER IN DER NÄHE...',
    searchUnavailable: 'SUCHE NICHT VERFÜGBAR: {msg}',
    connectingTo: 'VERBINDE MIT {name}...',
    connectFailed: 'VERBINDUNG FEHLGESCHLAGEN',
    fight: 'KAMPF',
    sendError: 'SENDFEHLER',
    peerHost: 'SPIELER VERBUNDEN · BEREIT',
    peerGuest: 'VERBUNDEN · WARTE AUF HOST',
    ended: 'VERBINDUNG BEENDET',
    reconnectAttempt: 'VERBINDE NEU... {n}',
    reconnected: 'VERBINDUNG WIEDERHERGESTELLT',
    reconnectFailed: 'NEUVERBINDUNG FEHLGESCHLAGEN',
    blePermissions: 'BLE-BERECHTIGUNGEN WERDEN ANGEFRAGT...',
    bleUnsupported: 'BLE WIRD NICHT UNTERSTÜTZT',
    bleServerStart: 'BLE-SERVER STARTET...',
    bleStart: 'BLE STARTET...',
    bleServerCreate: 'BLE-SERVER WIRD ERSTELLT...',
    bleWaiting: 'WARTE AUF SPIELER (BLE)...',
    bleUnavailable: 'BLE NICHT VERFÜGBAR: {msg}',
    bleSearching: 'SUCHE BLE-GERÄT...',
    bleSearchUnavailable: 'BLE-SUCHE NICHT VERFÜGBAR: {msg}',
    bleConnecting: 'VERBINDE ÜBER BLE...',
    bleConnectFailed: 'BLE-VERBINDUNG FEHLGESCHLAGEN',
    bleConnected: 'BLE VERBUNDEN',
    bleReconnecting: 'VERBINDE NEU ÜBER BLE...',
    bleServiceMissing: 'BLE-DIENST NICHT GEFUNDEN',
    bleGuestConnected: 'GAST ÜBER BLE VERBUNDEN',
    bleEnded: 'BLE-VERBINDUNG BEENDET'
  },
  story: {
    chapter: 'STORY · KAPITEL {n} / {total}', finalBattle: 'ENDBOSS',
    next: 'NÄCHSTER KAMPF', retry: 'NOCHMAL', playAgain: 'NEU STARTEN',
    nextOpponent: 'NÄCHSTER: {name}', complete: 'STORY GESCHAFFT',
    completeSub: 'Du hast den Boss besiegt und die Story beendet.', defeatSub: 'Hier endet die Story. Versuch diesen Kampf erneut.'
  },
  notation: { punch: 'FA', kick: 'TR' },
  pause: { title: 'PAUSE', resume: 'WEITER', restart: 'NEUSTART', quit: 'MENÜ', combos: 'KOMBOS', commands: 'KOMMANDOS', special: 'SPEZIAL', inputNote: 'Die Richtungen gelten relativ zur Blickrichtung des Kämpfers.' },
  result: {
    kicker: 'KAMPF VORBEI',
    win1: 'SPIELER 1 GEWINNT',
    win2: 'SPIELER 2 GEWINNT',
    win: 'SIEG',
    lose: 'NIEDERLAGE',
    score: 'RUNDEN {w0} : {w1} · BEST OF THREE',
    rematch: 'REVANCHE',
    menu: 'MENÜ',
    requestSent: 'ANFRAGE GESENDET · WARTE AUF HOST'
  },
  controls: {
    pad1: 'STEUERKREUZ P1', pad2: 'STEUERKREUZ P2',
    jump: 'Springen', left: 'Links', right: 'Rechts', crouch: 'Ducken',
    block: 'BLOCK', special: 'SPEZ', kick: 'TRITT', punch: 'FAUST'
  },
  sound: { mute: 'Ton aus', unmute: 'Ton an' },
  rotate: { title: 'HANDY DREHEN', sub: 'das Spiel ist für Querformat' },
  hud: {
    round: 'RUNDE {n}',
    fight: 'KAMPF!',
    ko: 'K.O.',
    time: 'ZEIT',
    roundWon: 'RUNDE GEWONNEN',
    roundWin: '{name} GEWINNT',
    draw: 'UNENTSCHIEDEN',
    victory: 'SIEG',
    series: 'SERIE',
    combo: 'COMBO „{name}“',
    story: 'STORY {n}/{total}',
    hits: '{n} TREFFER'
  },
  combo: { double: 'Doppel', hook: 'Haken', switch: 'Wechsel', flurry: 'Salve', triple: 'Dreifach', doubleKick: 'Doppeltritt', reversal: 'Reversal', rush: 'Sprint', charge: 'Ansturm', uppercut: 'Uppercut', sweep: 'Tiefkick', breakerPunch: 'Guardbrecher', breakerKick: 'Brechertritt' },
  char: {
    volt: { name: 'VOLT', tagline: 'TEMPO · PLASMA', specialName: 'PLASMALADUNG', specialDesc: 'Fliegendes Geschoss. Halte Abstand.', badge: 'SCHNELL', short: 'PLASMA' },
    blaze: { name: 'BLAZE', tagline: 'KRAFT · SCHOCKWELLE', specialName: 'SCHOCKWELLE', specialDesc: 'Läuft über den Boden. Spring drüber!', badge: 'SCHWER', short: 'WELLE' },
    nyx: { name: 'NYX', tagline: 'SCHATTEN · SPRINT', specialName: 'SCHATTENSPRINT', specialDesc: 'Schneller Sprint durch den Gegner. Nahkampf.', badge: 'VERBORGEN', short: 'SPRINT' },
    mira: { name: 'MIRA', tagline: 'EIS · FÄCHER', specialName: 'EISFÄCHER', specialDesc: 'Drei Splitter: hoch, vorwärts und runter.', badge: 'EISIG', short: 'FÄCHER' },
    storm: { name: 'STORM', tagline: 'STURM · BLITZ', specialName: 'HIMMELBLITZ', specialDesc: 'Der Blitz schlägt punktgenau ein — beweg dich rechtzeitig.', badge: 'GEWITTER', short: 'BLITZ' },
    boss: { name: 'OVERLORD', tagline: 'LEERE · BOSS', specialName: 'LEERENSTOSS', specialDesc: 'Der Endboss. Trifft härter als alle anderen.', badge: 'BOSS', short: 'LEERE' }
  }
};

const zh = {
  app: {
    title: 'NEON CLASH — 格斗游戏',
    desc: 'Neon Clash — 手机霓虹 2D 格斗游戏。单人对 AI，或同一屏幕双人对战。',
    arena: 'Neon Clash 格斗场'
  },
  menu: {
    tagline: '霓虹格斗 · MVP',
    p1: '单人', p1sub: '对战 AI',
    p2: '双人', p2sub: '同一屏幕',
    link: '蓝牙对战', linksub: '附近联机',
    help: '玩法说明',
    footer: '请横屏握持手机 · 建议戴耳机',
    roundLength: '回合长度', hitsFast: '快速 · 8', hitsNormal: '普通 · 12', hitsLong: '持久 · 18',
    story: '剧情', storySub: '挑战所有角色',
    language: '语言'
  },
  help: {
    title: '玩法说明',
    p1title: '单人',
    move: '<b>十字键</b> — 移动。上跳，下蹲。',
    punch: '<b>拳</b> — 快速攻击。打不中下蹲的对手。',
    kick: '<b>腿</b> — 强力攻击。可破下蹲防御。',
    block: '<b>格挡</b> — 按住防御。空中无效。',
    special: '<b>必杀</b> — 独有招式。消耗 50 能量。',
    combo: '<b>连招</b> — 拳→拳「双击」，拳→拳→腿「连破」，腿→拳「换手」。第一下必须命中。',
    roster: '<b>VOLT</b> — 等离子。<b>BLAZE</b> — 冲击波。<b>NYX</b> — 突进。<b>MIRA</b> — 碎片扇。<b>STORM</b> — 闪电。',
    commands: '指令技 — 前,前+拳 突进；前,前+腿 冲锋；下,前+拳 上勾拳；下,后+腿 扫腿；前,下,后+攻击 破防。',
    p2title: '双人',
    split: '屏幕一分为二：双方各有十字键和按钮。',
    sides: '玩家 1 在左，玩家 2 在右。颜色随所选角色变化。',
    mirror: '双方分别在 P1、P2 标签选择角色。选同一个角色即为镜像战。',
    keyboard: '键盘',
    keyp1: 'P1：<b>A D W S</b> + <b>F</b> 拳，<b>G</b> 腿，<b>H</b> 格挡，<b>T</b> 必杀。',
    keyp2: 'P2：<b>← → ↑ ↓</b> + <b>1</b> 拳，<b>2</b> 腿，<b>3</b> 格挡，<b>4</b> 必杀。',
    tip: '命中或受伤都会积攒能量。先赢两回合者获胜。',
    close: '明白了'
  },
  select: {
    k1: '单人 · 对战 AI',
    k2: '双人 · 选择角色',
    kLink: '附近联机 · 蓝牙 / WI-FI',
    t1: '选择角色',
    t2: '选择角色',
    tLink: '选择角色',
    you: '你', ai: 'AI', both: 'P1·P2',
    speed: '速度', power: '力量', range: '距离',
    kStory: '剧情 · 选择角色',
    tStory: '选择角色',
    sumStory: '剧情：{n} 场战斗 · 最终 BOSS',
    storyFight: '开始剧情',
    back: '返回', fight: '开战', toLink: '去联机',
    special: '<b>必杀</b> {name} — {desc}',
    sum2: 'P1：<b>{p1}</b> · P2：<b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · 镜像</span>',
    sumLink: '你的角色：<b>{p1}</b> · <span class="mirror">附近</span>',
    sum1: '玩家：<b>{p1}</b> · AI：<b>{ai}</b>'
  },
  link: {
    kicker: '附近联机 · 蓝牙 / WI-FI',
    title: '蓝牙对战',
    nearby: 'NEARBY', nearbySub: '蓝牙 + Wi-Fi',
    ble: '直连 BLE', bleSub: '不用 Wi-Fi',
    host: '创建游戏', hostSub: '成为主机',
    join: '加入游戏', joinSub: '搜索附近',
    back: '返回', start: '开始战斗',
    note: '需要两台开启蓝牙的 Android 手机。NEARBY 使用蓝牙 + Wi-Fi；直连 BLE 只使用蓝牙。断线后会自动重连。',
    checking: '正在检查连接...',
    rolePrompt: 'NEARBY · 选择角色：主机或客机',
    bleRolePrompt: '直连 BLE · 选择角色：主机或客机',
    androidOnly: '仅 Android 应用可用',
    bleAndroidOnly: '直连 BLE 仅在 Android 应用中可用',
    charOwn: '你的角色：{name}',
    charBoth: '你：{own} · 对手：{peer}',
    playerNearby: '附近的玩家',
    player: '玩家',
    blePlayer: 'BLE 玩家',
    hostFailed: '无法开始：{msg}',
    searchFailed: '无法搜索：{msg}',
    reconnecting: '正在重连...',
    reconnectHint: '请保持蓝牙开启 · 战斗会继续',
    reconnectFailed: '重连失败',
    connectionLost: '连接断开',
    opponentLeft: '对手已离开'
  },
  status: {
    permissions: '正在请求权限...',
    permissionsNeeded: '需要蓝牙和附近设备权限',
    enabling: '正在开启连接...',
    confirm: '正在确认连接...',
    connected: '已连接',
    rejected: '连接被拒绝',
    failed: '连接失败',
    bluetoothOff: '请开启蓝牙',
    noAccess: '没有蓝牙权限',
    bluetoothOn: '蓝牙已开启',
    creatingRoom: '正在创建房间...',
    waiting: '等待玩家...',
    btUnavailable: '蓝牙不可用：{msg}',
    searching: '正在搜索附近玩家...',
    searchUnavailable: '无法搜索：{msg}',
    connectingTo: '正在连接 {name}...',
    connectFailed: '连接失败',
    fight: '战斗',
    sendError: '发送错误',
    peerHost: '玩家已连接 · 可以开始',
    peerGuest: '已连接 · 等待主机',
    ended: '连接已关闭',
    reconnectAttempt: '正在重连... {n}',
    reconnected: '连接已恢复',
    reconnectFailed: '重连失败',
    blePermissions: '正在请求 BLE 权限...',
    bleUnsupported: '不支持 BLE',
    bleServerStart: '正在启动 BLE 服务器...',
    bleStart: '正在启动 BLE...',
    bleServerCreate: '正在创建 BLE 服务器...',
    bleWaiting: '等待玩家 (BLE)...',
    bleUnavailable: 'BLE 不可用：{msg}',
    bleSearching: '正在搜索 BLE 设备...',
    bleSearchUnavailable: 'BLE 搜索不可用：{msg}',
    bleConnecting: '正在通过 BLE 连接...',
    bleConnectFailed: 'BLE 连接失败',
    bleConnected: 'BLE 已连接',
    bleReconnecting: '正在通过 BLE 重连...',
    bleServiceMissing: '未找到 BLE 服务',
    bleGuestConnected: '客机已通过 BLE 连接',
    bleEnded: 'BLE 连接已关闭'
  },
  story: {
    chapter: '剧情 · 第 {n} / {total} 章', finalBattle: '最终决战',
    next: '下一场', retry: '重试', playAgain: '重新开始',
    nextOpponent: '下一个：{name}', complete: '剧情通关',
    completeSub: '你击败了 BOSS，完成了剧情。', defeatSub: '剧情在此结束。再试一次这场战斗。'
  },
  notation: { punch: '拳', kick: '腿' },
  pause: { title: '暂停', resume: '继续', restart: '重新开始', quit: '菜单', combos: '连招', commands: '指令技', special: '必杀', inputNote: '方向以角色面向为准。' },
  result: {
    kicker: '战斗结束',
    win1: '玩家 1 获胜',
    win2: '玩家 2 获胜',
    win: '胜利',
    lose: '失败',
    score: '回合 {w0} : {w1} · 两胜制',
    rematch: '再战',
    menu: '菜单',
    requestSent: '请求已发送 · 等待主机'
  },
  controls: {
    pad1: '玩家1十字键', pad2: '玩家2十字键',
    jump: '跳跃', left: '左', right: '右', crouch: '蹲下',
    block: '格挡', special: '必杀', kick: '腿', punch: '拳'
  },
  sound: { mute: '关闭声音', unmute: '开启声音' },
  rotate: { title: '请横屏', sub: '本游戏为横屏设计' },
  hud: {
    round: '第 {n} 回合',
    fight: '开战！',
    ko: 'K.O.',
    time: '时间',
    roundWon: '回合胜利',
    roundWin: '{name} 获胜',
    draw: '平局',
    victory: '胜利',
    series: '连击',
    combo: '连招「{name}」',
    story: '剧情 {n}/{total}',
    hits: '{n} 连击'
  },
  combo: { double: '双击', hook: '勾拳', switch: '换手', flurry: '连破', triple: '三连击', doubleKick: '二连踢', reversal: '逆袭', rush: '突进', charge: '冲锋', uppercut: '上勾拳', sweep: '扫腿', breakerPunch: '破防拳', breakerKick: '破防踢' },
  char: {
    volt: { name: 'VOLT', tagline: '速度 · 等离子', specialName: '等离子冲击', specialDesc: '飞行能量弹。保持距离。', badge: '迅捷', short: '等离子' },
    blaze: { name: 'BLAZE', tagline: '力量 · 冲击波', specialName: '地面冲击波', specialDesc: '沿地面推进。跳过去！', badge: '重装', short: '冲击波' },
    nyx: { name: 'NYX', tagline: '暗影 · 突进', specialName: '暗影突进', specialDesc: '快速穿过对手。近身战。', badge: '隐秘', short: '突进' },
    mira: { name: 'MIRA', tagline: '冰霜 · 碎片扇', specialName: '冰霜扇', specialDesc: '三枚碎片：上、前、下。', badge: '冰霜', short: '碎片扇' },
    storm: { name: 'STORM', tagline: '雷霆 · 闪电', specialName: '天雷', specialDesc: '闪电击中定点——及时闪开。', badge: '雷霆', short: '闪电' },
    boss: { name: '霸主', tagline: '虚空 · BOSS', specialName: '虚空打击', specialDesc: '最终 BOSS，攻击力最强。', badge: 'BOSS', short: '虚空' }
  }
};

const ja = {
  app: {
    title: 'NEON CLASH — 格闘ゲーム',
    desc: 'Neon Clash — スマホ向けネオン 2D 格闘ゲーム。1人で AI と、または同じ画面で2人対戦。',
    arena: 'Neon Clash 格闘アリーナ'
  },
  menu: {
    tagline: 'ネオン格闘 · MVP',
    p1: '1人プレイ', p1sub: 'AI と対戦',
    p2: '2人プレイ', p2sub: '同じ画面で',
    link: 'Bluetooth対戦', linksub: '近くの友達と',
    help: '遊び方',
    footer: 'スマホを横向きに · ヘッドホン推奨',
    roundLength: 'ラウンド長', hitsFast: '短い · 8', hitsNormal: '普通 · 12', hitsLong: '長い · 18',
    story: 'ストーリー', storySub: '全キャラと勝負',
    language: '言語'
  },
  help: {
    title: '遊び方',
    p1title: '1人プレイ',
    move: '<b>十字キー</b> — 移動。上でジャンプ、下でしゃがみ。',
    punch: '<b>パンチ</b> — 速い攻撃。しゃがみには当たらない。',
    kick: '<b>キック</b> — 強い攻撃。しゃがみガードを崩す。',
    block: '<b>ガード</b> — 押し続けて防御。空中では無効。',
    special: '<b>必殺</b> — 固有技。エネルギー50を消費。',
    combo: '<b>コンボ</b> — パンチ→パンチ「ダブル」、パンチ→パンチ→キック「連撃」、キック→パンチ「スイッチ」。最初の一撃を当てること。',
    roster: '<b>VOLT</b> — プラズマ。<b>BLAZE</b> — 衝撃波。<b>NYX</b> — ダッシュ。<b>MIRA</b> — 扇。<b>STORM</b> — 雷。',
    commands: 'コマンド技 — 前,前+パンチ ラッシュ；前,前+キック チャージ；下,前+パンチ アッパー；下,後+キック スイープ；前,下,後+攻撃 ガードブレイク。',
    p2title: '2人プレイ',
    split: '画面を半分に分割。それぞれ十字キーとボタンを使う。',
    sides: 'プレイヤー1は左、プレイヤー2は右。色は選んだキャラに合わせて変わる。',
    mirror: 'P1・P2タブでそれぞれ選択。同じキャラならミラーマッチ。',
    keyboard: 'キーボード',
    keyp1: 'P1：<b>A D W S</b> + <b>F</b> パンチ、<b>G</b> キック、<b>H</b> ガード、<b>T</b> 必殺。',
    keyp2: 'P2：<b>← → ↑ ↓</b> + <b>1</b> パンチ、<b>2</b> キック、<b>3</b> ガード、<b>4</b> 必殺。',
    tip: '攻撃や被ダメージでエネルギーが溜まる。2ラウンド先取で勝利。',
    close: 'OK'
  },
  select: {
    k1: '1人プレイ · AI と対戦',
    k2: '2人プレイ · キャラ選択',
    kLink: '近くで対戦 · BLUETOOTH / WI-FI',
    t1: 'キャラを選べ',
    t2: 'キャラを選べ',
    tLink: 'キャラを選べ',
    you: 'あなた', ai: 'AI', both: 'P1·P2',
    speed: '速さ', power: '力', range: '距離',
    kStory: 'ストーリー · キャラ選択',
    tStory: 'キャラを選べ',
    sumStory: 'ストーリー：全 {n} 戦 · ラスボス',
    storyFight: 'ストーリー開始',
    back: '戻る', fight: '開始', toLink: '通信へ',
    special: '<b>必殺</b> {name} — {desc}',
    sum2: 'P1：<b>{p1}</b> · P2：<b>{p2}</b>{mirror}',
    mirror: '<span class="mirror"> · ミラー</span>',
    sumLink: 'あなたのキャラ：<b>{p1}</b> · <span class="mirror">近く</span>',
    sum1: 'プレイヤー：<b>{p1}</b> · AI：<b>{ai}</b>'
  },
  link: {
    kicker: '近くで対戦 · BLUETOOTH / WI-FI',
    title: 'Bluetooth対戦',
    nearby: 'NEARBY', nearbySub: 'Bluetooth + Wi-Fi',
    ble: 'BLE 直接', bleSub: 'Wi-Fi なし',
    host: 'ゲームを作成', hostSub: 'ホストになる',
    join: '参加する', joinSub: '近くを探す',
    back: '戻る', start: '対戦開始',
    note: 'Bluetooth をオンにした Android 端末が2台必要。NEARBY は Bluetooth + Wi-Fi、BLE 直接は Bluetooth のみ。切断時は自動で再接続します。',
    checking: '接続を確認中...',
    rolePrompt: 'NEARBY · 役割を選択：ホストかゲスト',
    bleRolePrompt: 'BLE 直接 · 役割を選択：ホストかゲスト',
    androidOnly: 'Android アプリでのみ利用可能',
    bleAndroidOnly: 'BLE 直接は Android アプリでのみ利用可能',
    charOwn: 'あなたのキャラ：{name}',
    charBoth: 'あなた：{own} · 相手：{peer}',
    playerNearby: '近くのプレイヤー',
    player: 'プレイヤー',
    blePlayer: 'BLE プレイヤー',
    hostFailed: '開始できません：{msg}',
    searchFailed: '検索できません：{msg}',
    reconnecting: '再接続中...',
    reconnectHint: 'Bluetooth をオンに · 対戦は続行します',
    reconnectFailed: '再接続に失敗',
    connectionLost: '接続が切れました',
    opponentLeft: '相手が退出しました'
  },
  status: {
    permissions: '権限を要求中...',
    permissionsNeeded: 'Bluetooth と付近のデバイスの権限が必要です',
    enabling: '接続を有効化中...',
    confirm: '接続を確認中...',
    connected: '接続済み',
    rejected: '接続が拒否されました',
    failed: '接続できません',
    bluetoothOff: 'Bluetooth をオンにしてください',
    noAccess: 'Bluetooth へのアクセスなし',
    bluetoothOn: 'Bluetooth オン',
    creatingRoom: 'ルームを作成中...',
    waiting: 'プレイヤーを待機中...',
    btUnavailable: 'Bluetooth 利用不可：{msg}',
    searching: '近くのプレイヤーを検索中...',
    searchUnavailable: '検索できません：{msg}',
    connectingTo: '{name} に接続中...',
    connectFailed: '接続できません',
    fight: '対戦',
    sendError: '送信エラー',
    peerHost: 'プレイヤー接続済み · 開始できます',
    peerGuest: '接続済み · ホストを待機中',
    ended: '接続を終了しました',
    reconnectAttempt: '再接続中... {n}',
    reconnected: '接続を復元しました',
    reconnectFailed: '再接続に失敗',
    blePermissions: 'BLE 権限を要求中...',
    bleUnsupported: 'BLE 非対応',
    bleServerStart: 'BLE サーバーを起動中...',
    bleStart: 'BLE を起動中...',
    bleServerCreate: 'BLE サーバーを作成中...',
    bleWaiting: 'プレイヤーを待機中 (BLE)...',
    bleUnavailable: 'BLE 利用不可：{msg}',
    bleSearching: 'BLE 端末を検索中...',
    bleSearchUnavailable: 'BLE 検索不可：{msg}',
    bleConnecting: 'BLE で接続中...',
    bleConnectFailed: 'BLE 接続に失敗',
    bleConnected: 'BLE 接続済み',
    bleReconnecting: 'BLE で再接続中...',
    bleServiceMissing: 'BLE サービスが見つかりません',
    bleGuestConnected: 'ゲストが BLE で接続しました',
    bleEnded: 'BLE 接続を終了しました'
  },
  story: {
    chapter: 'ストーリー · 第 {n} / {total} 章', finalBattle: '最終決戦',
    next: '次の試合', retry: 'リトライ', playAgain: 'もう一度',
    nextOpponent: '次：{name}', complete: 'ストーリークリア',
    completeSub: 'ボスを倒してストーリーを完了した。', defeatSub: 'ストーリーはここで終了。もう一度この試合へ。'
  },
  notation: { punch: 'パ', kick: 'キ' },
  pause: { title: 'ポーズ', resume: '再開', restart: 'やり直す', quit: 'メニュー', combos: 'コンボ', commands: 'コマンド技', special: '必殺', inputNote: '方向はキャラクターの向きが基準。' },
  result: {
    kicker: '対戦終了',
    win1: 'プレイヤー1の勝ち',
    win2: 'プレイヤー2の勝ち',
    win: '勝利',
    lose: '敗北',
    score: 'ラウンド {w0} : {w1} · 2本先取',
    rematch: '再戦',
    menu: 'メニュー',
    requestSent: 'リクエスト送信 · ホストを待機中'
  },
  controls: {
    pad1: 'プレイヤー1十字キー', pad2: 'プレイヤー2十字キー',
    jump: 'ジャンプ', left: '左', right: '右', crouch: 'しゃがみ',
    block: 'ガード', special: '必殺', kick: 'キック', punch: 'パンチ'
  },
  sound: { mute: '音を消す', unmute: '音を出す' },
  rotate: { title: 'スマホを横向きに', sub: 'このゲームは横画面用です' },
  hud: {
    round: 'ラウンド {n}',
    fight: 'ファイト！',
    ko: 'K.O.',
    time: 'タイム',
    roundWon: 'ラウンド獲得',
    roundWin: '{name} の勝ち',
    draw: '引き分け',
    victory: '勝利',
    series: '連続ヒット',
    combo: 'コンボ「{name}」',
    story: 'ストーリー {n}/{total}',
    hits: '{n} ヒット'
  },
  combo: { double: 'ダブル', hook: 'フック', switch: 'スイッチ', flurry: '連撃', triple: 'トリプル', doubleKick: 'ダブルキック', reversal: 'リバーサル', rush: 'ラッシュ', charge: 'チャージ', uppercut: 'アッパー', sweep: 'スイープ', breakerPunch: 'ガードブレイク', breakerKick: 'ブレイカ―キック' },
  char: {
    volt: { name: 'VOLT', tagline: 'スピード · プラズマ', specialName: 'プラズマチャージ', specialDesc: '飛ぶエネルギー弾。距離を保て。', badge: 'スピード', short: 'プラズマ' },
    blaze: { name: 'BLAZE', tagline: 'パワー · 衝撃波', specialName: 'グラウンドウェーブ', specialDesc: '地面を進む。跳び越えろ！', badge: 'ヘビー', short: '波動' },
    nyx: { name: 'NYX', tagline: '影 · ダッシュ', specialName: 'シャドウダッシュ', specialDesc: '相手をすり抜ける快速ダッシュ。近接戦。', badge: 'ステルス', short: 'ダッシュ' },
    mira: { name: 'MIRA', tagline: '氷 · 扇', specialName: 'アイスファン', specialDesc: '3つの破片：上・前・下。', badge: 'アイス', short: '扇' },
    storm: { name: 'STORM', tagline: '嵐 · 雷', specialName: 'スカイストライク', specialDesc: '雷が地点に落ちる。早く離れろ。', badge: 'ストーム', short: '雷' },
    boss: { name: 'オーバーロード', tagline: '虚空 · ボス', specialName: 'ヴォイドストライク', specialDesc: '最終ボス。誰よりも強烈な一撃。', badge: 'ボス', short: '虚空' }
  }
};

const messages = { en, ru, es, pt, fr, de, zh, ja };

let current = 'en';
const listeners = new Set();

function get(obj, path) {
  return path.split('.').reduce((v, k) => (v == null ? undefined : v[k]), obj);
}

function interpolate(text, vars) {
  if (!vars) return text;
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
}

export function t(key, vars) {
  const value = get(messages[current], key) ?? get(messages.en, key) ?? key;
  return interpolate(value, vars);
}

export function getLang() {
  return current;
}

export function langLabel(id = current) {
  return LANGS.find((l) => l.id === id)?.label || id;
}

export function setLang(id, save = true) {
  if (!messages[id]) id = 'en';
  current = id;
  if (save) {
    try { localStorage.setItem('nc_lang', id); } catch (e) { /* ignore */ }
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = id;
    applyTranslations();
  }
  for (const fn of listeners) {
    try { fn(id); } catch (e) { /* ignore */ }
  }
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyTranslations(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of root.querySelectorAll('[data-i18n-html]')) {
    el.innerHTML = t(el.dataset.i18nHtml);
  }
  for (const el of root.querySelectorAll('[data-i18n-title]')) {
    el.title = t(el.dataset.i18nTitle);
  }
  for (const el of root.querySelectorAll('[data-i18n-aria]')) {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  }
  if (root === document) {
    document.title = t('app.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('app.desc'));
  }
}

export function charText(id) {
  const prefix = `char.${id}`;
  return {
    name: t(`${prefix}.name`),
    tagline: t(`${prefix}.tagline`),
    specialName: t(`${prefix}.specialName`),
    specialDesc: t(`${prefix}.specialDesc`),
    badge: t(`${prefix}.badge`),
    short: t(`${prefix}.short`)
  };
}

export function hitsText(n) {
  if (current === 'ru') {
    const mod10 = n % 10;
    const mod100 = n % 100;
    const word = (mod10 === 1 && mod100 !== 11) ? 'ХИТ'
      : (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) ? 'ХИТА'
      : 'ХИТОВ';
    return `${n} ${word}`;
  }
  return t('hud.hits', { n });
}

export function initI18n() {
  let saved = null;
  try { saved = localStorage.getItem('nc_lang'); } catch (e) { /* ignore */ }
  const url = new URLSearchParams(location.search).get('lang');
  current = messages[url] ? url : (messages[saved] ? saved : 'en');
  document.documentElement.lang = current;
  applyTranslations();
  return current;
}

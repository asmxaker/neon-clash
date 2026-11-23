# AGENTS.md — инструкция для агента

Этот файл обязателен к прочтению перед изменениями в репозитории. Он описывает, где что лежит, какие правила нельзя нарушать и как проверять изменения.

## 1. Что это за проект

**Neon Clash** — 2D-файтинг на HTML5 Canvas для Android и мобильного браузера.

- 10 играбельных бойцов + босс `OVERLORD`.
- Режимы: 1P против ИИ, 2P на одном экране, история, Nearby (Bluetooth/Wi-Fi), прямое BLE.
- Пиксельно-неоновая процедурная графика.
- 8 языков, английский по умолчанию.
- Внешняя OGG-музыка + синтезированные SFX.
- Android APK через Capacitor 8.

Перед работой прочитай:

1. [`README.md`](README.md) — пользовательская документация и команды.
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — модули, игровой цикл, сеть, аудио, рендеринг.
3. [`docs/ASSETS.md`](docs/ASSETS.md) — форматы музыки, SFX и спрайтов.

## 2. Быстрый старт

```bash
npm install
npm run dev          # http://127.0.0.1:5180
npm run apk          # debug APK в dist/NeonClash-MVP.apk
```

Требования для APK:

- Node.js 22+;
- JDK 21 (`brew install openjdk@21`);
- Android SDK, platform/build-tools 36.

`npm run apk` запускает `scripts/fix-ble-gradle.mjs`, делает `cap sync android` и Gradle-сборку.

## 3. Карта репозитория

```text
www/
  index.html                 DOM: меню, выбор бойца, HUD-оверлеи, пауза, связь, финал
  styles.css                 неоновый UI, адаптив, сенсорные контролы
  js/
    main.js                  точка входа, экраны, меню, пауза, результат, язык, длина раунда
    game.js                  матч, фазы, физика, HUD, арены, история, гостевой рендер
    fighter.js               состояния, удары, комбо, motion-команды, позы, пиксельная отрисовка
    characters.js            ростер 10 + boss, статы, палитры, спец-атаки
    input.js                 Controller, TouchController, KeyboardController, MergeController
    ai.js                    искусственный интеллект
    fx.js                    частицы, кольца, тряска, hitstop
    audio.js                 OGG-плеер, синтезированный fallback, SFX
    i18n.js                  словари 8 языков, t(), charText(), hitsText()
    link.js                  Nearby + хост-авторитетные снапшоты + интерполяция + реконнект
    ble-link.js              прямое BLE (GATT) поверх LinkManager
    ending.js                финальная сцена с кабриолетом
  audio/                     menu.ogg, battle_*.ogg, victory.ogg
  icons/                     PWA/Android иконки
  manifest.webmanifest
  sw.js                      service worker
docs/
  ARCHITECTURE.md            архитектура и поток данных
  ASSETS.md                  форматы ассетов
  *.jpg                      скриншоты README
scripts/
  build-apk.sh               сборка APK
  fix-ble-gradle.mjs         удаление jcenter() из BLE-плагина для Gradle 9
  make-icons.mjs             генерация иконок
  notify.mjs                 личный вспомогательный скрипт, НЕ КОММИТИТЬ без запроса
android/                     нативный проект Capacitor
capacitor.config.json
dist/NeonClash-MVP.apk       собранный APK (dist/ в .gitignore)
```

## 4. Жёсткие правила

### Можно

- Менять `www/`, `docs/`, `scripts/`, `README.md`, `AGENTS.md`.
- Добавлять новые ES-модули в `www/js/`.
- Добавлять OGG в `www/audio/`.
- Обновлять Android-конфиг, если этого требует Capacitor.

### Нельзя

- **Не коммить** `.env.example` и `scripts/notify.mjs` — это локальные файлы пользователя. Не удалять их.
- **Не коммить** секреты, токены, `.env`, `node_modules`, `dist/`, Android build-выходы.
- **Не редактировать** `node_modules/`. Для BLE-плагина есть `scripts/fix-ble-gradle.mjs`.
- **Не редактировать вручную** `android/app/src/main/assets/public/` и `android/app/src/main/assets/capacitor.config.json` — это генерируется Capacitor.
- **Не добавлять** бандлер/фреймворк (React/Vue/Vite/Webpack) без отдельного решения. Проект нативно на ES modules.
- **Не хардкодить** пользовательские строки на русском. Всё через `i18n.js`.
- **Не менять** язык по умолчанию с английского (`en`) без явной просьбы.
- **Не добавлять** босса `OVERLORD` в `CHARACTER_LIST` — он доступен только в истории.
- **Не ломать** fallback: если OGG/спрайт/перевод отсутствует, игра должна продолжать работать.

## 5. Архитектура в двух минутах

- `main.js` управляет DOM-экранами и создаёт `Game`.
- `Game` — единственный владелец состояния матча: бойцы, снаряды, FX, фазы.
- `Fighter` содержит состояние и атаки. Комбо и motion-команды живут в `fighter.js`.
- `characters.js` — только данные, без игровой логики.
- `input.js` нормализует тач, клавиатуру и удалённый ввод в `Controller`.
- `game.js` и `fighter.js` не должны знать о DOM-оверлеях, кроме HUD/Canvas.
- Сеть: хост симулирует и отправляет снапшоты, гость только рендерит + отправляет ввод.
- Аудио и i18n — независимые сервисы.

Подробные диаграммы и таблицы — в `docs/ARCHITECTURE.md`.

## 6. Частые задачи

### 6.1 Добавить бойца

1. Добавь запись в `CHARACTERS` (`www/js/characters.js`).
2. Задай `style` и, если нужно, `gear`.
3. Добавь `char.<id>.*` во все 8 словарей `i18n.js`: `name`, `tagline`, `specialName`, `specialDesc`, `badge`, `short`.
4. Добавь карточку в `www/index.html` (`data-char`, `data-i18n`).
5. Добавь цвета `.fighter-card[data-char="<id>"]` в `styles.css`.
6. Проверь выбор P1/P2 и HUD-портрет.
7. Проверь, что `CHARACTER_LIST` автоматически включает бойца в выбор и историю.

### 6.2 Добавить удар/комбо/команду

- Обычные атаки и тайминги: `ATTACKS` и `startAttack()` в `fighter.js`.
- Комбо-таблицы: `COMBOS` в `fighter.js`.
- Motion-команды: `COMMAND_MOVES`, `detectCommand()`, `startCommand()`.
- Названия комбо — это **ключи** (`double`, `hook`, `flurry` и т.д.), а не русский текст. UI переводит через `combo.<key>`.
- Проверь `resolveHit()`: `launch`, `unblockable`, `comboName`, `commandKey`.
- Проверь HUD-серию и popup через `drawCombo()`.

### 6.3 Добавить арену

1. Добавь id в `STAGE_IDS` в `game.js`.
2. Напиши `draw<Name>Background(ctx, t)`.
3. Добавь `case` в `drawBackground`.
4. Добавь id в `STAGE_CODES` в `ble-link.js`.
5. Добавь трек в `MUSIC_FILES` и файл в `www/audio/`.
6. Проверь гостевой режим: гость получает арену из снапшота (`st`).

### 6.4 Добавить перевод

- Словари — `i18n.js`.
- Статический DOM: `data-i18n`, `data-i18n-html`, `data-i18n-aria`, `data-i18n-title`.
- Динамический текст: только `t('key', vars)`.
- Персонажи: `charText(id)`.
- Серии: `hitsText(n)`.
- Проверь длинные строки на телефоне (немецкий/французский/португальский).

### 6.5 Спрайты

- Загрузчик: `www/js/sprites.js`.
- Формат: `www/sprites/README.md`.
- Первый персонаж: `www/sprites/kai/`, бриф `docs/CHARACTER_KAI.md`.
- По умолчанию спрайты выключены (`SPRITE_ENABLED` пуст). Включать только после добавления PNG и manifest.
- Если спрайт/анимация не загрузились, обязателен процедурный fallback.

### 6.6 Музыка/SFX

- Музыка: `www/audio/*.ogg`, карта `MUSIC_FILES` в `audio.js`.
- Селект и меню используют `menu.ogg`; арены — `battle_*.ogg`; результат победы — `victory.ogg`.
- SFX сейчас синтезируются методами `AudioEngine`.
- Форматы и ограничения — `docs/ASSETS.md`.
- Если меняешь список ассетов, подними `CACHE` в `www/sw.js`.

### 6.7 Сеть

- Общая логика: `LinkManager` в `link.js`.
- BLE: `BleLinkManager` в `ble-link.js` наследует общий протокол.
- При изменении снапшота меняй **обе** стороны:
  - `buildGameSnapshot` / `applyNetSnapshot` для Nearby;
  - `buildBleSnapshot` / `expandBleSnapshot` для BLE.
- Гость не должен симулировать бой.
- Арена и label комбо синхронизируются в снапшоте.
- Проверь авто-реконнект и паузу на обрыве.

### 6.8 UI

- Оверлеи: `index.html` + `styles.css`.
- Логика видимости: `main.js` (`hideAllOverlays`, `startGame`, `openSelect`, `openLinkLobby`).
- `#stage.in-match` показывает сенсорное управление. `Game.render()` дополнительно выставляет этот класс, пока `screen === 'match'`.
- Держи кнопки паузы/навигации видимыми на низких экранах: списки должны скроллиться внутри, а не выдавливать кнопки.

## 7. Проверка изменений

### 7.1 Синтаксис

```bash
for f in www/js/*.js; do node --check "$f" || exit 1; done
```

### 7.2 Браузер

```bash
npm run dev
```

Открой `http://127.0.0.1:5180/`.

Важно: если ты тестировал старую версию, браузер мог закэшировать ES-модули. Для проверки новых файлов:

- сделай hard reload / новый порт;
- убедись, что `window.__game` и `window.__audio` созданы;
- проверь консоль на ошибки.

### 7.3 Android

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
$ANDROID_HOME/emulator/emulator -avd Pixel_7 -no-snapshot-save -no-boot-anim \
  -gpu swiftshader_indirect &

adb install -r dist/NeonClash-MVP.apk
adb shell am force-stop com.neonclash.game
adb shell am start -n com.neonclash.game/.MainActivity
```

CDP-отладка WebView:

```bash
PID=$(adb shell pidof com.neonclash.game | tr -d '\r')
adb forward tcp:9222 localabstract:webview_devtools_remote_$PID
```

Проверь:

- `window.__game`, `window.__audio`;
- нет `console.error`;
- кнопки управления видимы (`#stage.in-match`, `#touch` opacity > 0);
- музыка: `__audio.trackId`, `__audio.fileSource`, `__audio.ctx.state === 'running'`;
- HUD, портреты, пауза;
- затронутый режим: 1P / 2P / story / Nearby / BLE.

### 7.4 Что проверять перед коммитом

- Нет ошибок в консоли браузера.
- Все 8 языков не падают на новых ключах.
- Interactive: выбор 10 бойцов, пауза, рестарт, результат.
- Если менял снапшоты — оба транспорта.
- APK собирается: `npm run apk`.
- `git diff --check`.
- `git status` не содержит случайных файлов.

## 8. Известные ловушки

- **Service worker и APK.** После изменения `www/` старый кэш может отдавать старые JS. Поднимай `CACHE` в `www/sw.js` и делай `cap sync`/переустановку.
- **Спрайтовый кэш в браузере.** При тестировании используй новый порт или hard reload, иначе можно проверять старый `fighter.js`.
- **rAF в фоне.** В неактивной вкладке анимация может не обновляться: не делай вывод «игра зависла» по `game.time`.
- **`drawCostumeBack`.** Не удаляй функции костюмов при рефакторинге `drawHeadGear` — они вызываются из `drawFighterBody`.
- **Boss.** `BOSS_CHARACTER` не входит в `CHARACTER_LIST`; не добавляй его в карточки выбора.
- **`CHARACTER_LIST.length + 1`.** История автоматически пересчитывает число боёв. При добавлении бойца проверь summary и финал.
- **Комбо-ключи.** В `COMBOS`/`COMMAND_MOVES` хранятся ключи i18n, а не локализованный текст.
- **BLE и MTU.** Хост шлёт по 20 байт; не увеличивай без проверки на реальном телефоне.
- **Gradle jcenter.** Если BLE-плагин обновится и снова добавит `jcenter()`, сборка упадёт; `scripts/fix-ble-gradle.mjs` должен запускаться до Gradle.
- **`.env.example` и `scripts/notify.mjs`** — локальные файлы пользователя, не коммить.

## 9. Definition of Done

Задача считается завершённой, если:

- [ ] код работает в браузере;
- [ ] APK собирается и запускается на Android;
- [ ] нет новых ошибок в консоли;
- [ ] затронутые режимы проверены;
- [ ] все новые строки добавлены в 8 языков;
- [ ] обновлены README и/или docs, если изменилось поведение/ассеты;
- [ ] `node --check` проходит;
- [ ] `git status` чистый, кроме личных файлов пользователя;
- [ ] сделан осмысленный коммит.

## 10. Коммиты

- Один коммит — одна логическая задача.
- Сообщение на английском, короткое, в императиве:
  - `Add selectable round length`
  - `Fix BLE reconnect after app background`
- Не коммить `dist/`, `node_modules/`, `.env`, личные скрипты.
- Перед коммитом проверь `git status` и `git diff --stat`.

## 11. Ссылки

- [README](README.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [Ассеты](docs/ASSETS.md)
- [APK instructions](README.md#сборка-apk)

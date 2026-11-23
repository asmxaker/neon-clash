# Ассеты и форматы

Документ для тех, кто добавляет музыку, звуки, спрайты, иконки или фоны. Все пути указаны относительно `www/`.

## 1. Музыка

Музыкальные треки лежат в `www/audio/` в **OGG Vorbis**. `audio.js` скачивает их через `fetch`, декодирует через WebAudio и играет бесшовным лупом.

| Файл | Сцена | Длительность |
| --- | --- | --- |
| `audio/menu.ogg` | Главное меню, выбор бойца, лобби связи | ~60 сек |
| `audio/battle_city.ogg` | Neon City | ~63 сек |
| `audio/battle_dojo.ogg` | Sunset Dojo | ~67 сек |
| `audio/battle_reactor.ogg` | Toxic Reactor | ~65 сек |
| `audio/battle_orbit.ogg` | Orbit Station | ~80 сек |
| `audio/battle_tundra.ogg` | Frozen Tundra | ~58 сек |
| `audio/battle_boss.ogg` | Финальный босс | ~61 сек |
| `audio/victory.ogg` | Экран победы | ~63 сек |

### Формат

| Параметр | Значение |
| --- | --- |
| Контейнер / кодек | OGG Vorbis |
| Частота | 44.1 или 48 кГц |
| Каналы | стерео |
| Битрейт | 96–160 kbps |
| Громкость | примерно −16 LUFS |
| true peak | не выше −1.5 dBTP |
| Луп | бесшовный, без тишины и fade на стыке |

Если OGG не загрузился, `audio.js` включает синтезированный fallback из `TRACKS`. Это защищает игру от пустой тишины, но fallback звучит проще.

### Замена трека

1. Положить новый файл с тем же именем в `www/audio/`.
2. Если меняется имя — обновить `MUSIC_FILES` в `www/js/audio.js`.
3. Обновить `CACHE` в `www/sw.js`, если нужно сбросить PWA-кэш.
4. Для APK выполнить `npm run apk` или `npx cap sync android`.

### Если трек не зацикливается

Лучше присылать отдельно intro + loop:

```text
audio/menu_intro.ogg
audio/menu_loop.ogg
```

Сейчас плеер рассчитан на один бесшовный файл. Для intro+loop нужно расширить `playFileTrack()` и хранить две точки старта.

## 2. Звуковые эффекты

Короткие SFX сейчас синтезируются в `audio.js`:

| Метод | Где используется |
| --- | --- |
| `ui()` | кнопки и меню |
| `whiff()` | промах |
| `hit(power)` | попадание |
| `block()` | блок |
| `jump()` | прыжок |
| `specialCharge()` | замах спец-атаки |
| `fire()` | выстрел снаряда |
| `shockwave()` | ударная волна |
| `dash()` | рывок |
| `shard()` | ледяные осколки |
| `thunder()` | молния |
| `ko()` | нокаут |
| `round()` / `fight()` | начало раунда |
| `win()` | победа |
| `timeout()` | конец времени |
| `combo()` | комбо |
| `command()` | motion-команда |
| `kick(delay, vol)` | бочка в синтезированной музыке |

### Формат внешних SFX

Если добавлять WAV/OGG-сэмплы:

| Параметр | Значение |
| --- | --- |
| Формат | WAV PCM 16/24 бит или OGG |
| Частота | 44.1 / 48 кГц |
| Каналы | моно или стерео |
| Длина | 0.05–1.5 сек |
| Пики | −3…−6 dBFS |
| Начало | без тишины |
| Конец | fade-out 5–15 мс |
| Файлы | латиница, нижний регистр, `_01`, `_02` для вариантов |

Рекомендуемая структура:

```text
www/audio/sfx/
  hit_light_01.wav
  hit_light_02.wav
  hit_heavy_01.wav
  block_01.wav
  whiff_punch_01.wav
  jump.wav
  land.wav
  ko.wav
  special_charge.wav
  projectile_plasma.wav
  projectile_wave.wav
  projectile_shard.wav
  thunder.wav
  dash.wav
  combo_hit.wav
  ui_select.wav
  win.wav
  timeout.wav
```

После добавления файлов нужно расширить `audio.js`: загрузить буферы по аналогии с музыкой и проигрывать их в соответствующих методах. Пока fallback — синтез.

## 3. Спрайты бойцов

Сейчас бойцы рисуются процедурно и пикселизуются через offscreen Canvas. Внешние спрайты пока не подключены.

Если добавлять спрайты, предлагаемый формат:

```text
www/sprites/
  volt/
    idle.png
    walk.png
    jump.png
    punch.png
    kick.png
    special.png
    block.png
    hit.png
    ko.png
  blaze/
  nyx/
  mira/
  storm/
  kai/
  cyber/
  neko/
  orc/
  rogue/
  boss/
```

| Параметр | Значение |
| --- | --- |
| Формат | PNG с прозрачностью |
| Кадр | 192×192 или 256×256 |
| Раскладка | горизонтальная полоса |
| Взгляд | вправо |
| Anchor | ступни по центру нижнего края |
| Масштаб | одинаковый во всех анимациях |
| Фон | прозрачный |
| Тени | не включать |
| Текст/UI | не включать |

Минимальный набор для теста:

- `idle.png` — 4–8 кадров;
- `walk.png` — 6–8 кадров;
- `punch.png` — 4–6 кадров.

Для полного набора: `jump`, `kick`, `special`, `block`, `hit`, `ko`.

Нужен единый JSON-манифест:

```json
{
  "volt": {
    "frameW": 256,
    "frameH": 256,
    "anchorX": 128,
    "anchorY": 240,
    "animations": {
      "idle": { "file": "idle.png", "frames": 6, "fps": 10 },
      "walk": { "file": "walk.png", "frames": 8, "fps": 12 },
      "punch": { "file": "punch.png", "frames": 5, "fps": 18 }
    }
  }
}
```

После получения спрайтов нужно:

1. Добавить загрузчик PNG.
2. Выбирать анимацию по `f.state` и `f.attack.kind`.
3. Рисовать кадр с anchor и flip по `f.facing`.
4. Оставить процедурный fallback для отсутствующих анимаций.

## 4. Иконки и PWA

- `www/icons/icon-192.png`, `icon-512.png`, `icon-1024.png` — PWA/Android.
- `www/manifest.webmanifest` — имя, цвета, ориентация.
- `www/sw.js` — service worker; при изменении списка файлов обновить `CACHE`.

## 5. Добавление ассетов в APK

1. Положить файлы в `www/`.
2. Обновить код/манифест ассетов.
3. Проверить размер APK.
4. `npm run apk`.
5. Установить `dist/NeonClash-MVP.apk`.

`android/app/src/main/assets/public/` генерируется Capacitor и не редактируется вручную.

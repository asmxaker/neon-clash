# Спрайты бойцов

Спрайтовый рендер подготовлен, но **по умолчанию выключен**: пока PNG-файлов нет, игра рисует бойцов процедурно.

## Как включить

1. Положи PNG-файлы в `www/sprites/<charId>/`.
2. Проверь `manifest.json`.
3. Открой `www/js/sprites.js` и добавь id в `SPRITE_ENABLED`:

```js
SPRITE_ENABLED.add('kai');
```

Или вызови `enableSprite('kai')` из кода/консоли.

4. Перезагрузи игру. Если манифест/кадры не загрузятся, игра автоматически вернётся к процедурной отрисовке.

## Формат

```text
www/sprites/
  kai/
    manifest.json
    idle.png
    walk.png
    jump.png
    punch.png
    kick.png
    special.png
    block.png
    hit.png
    ko.png
```

- PNG с прозрачным фоном.
- Один горизонтальный ряд кадров на файл.
- Кадр `256×256`.
- Персонаж смотрит **вправо**.
- Ступни на anchor `(128, 242)`.
- Одинаковый масштаб во всех анимациях.
- Без теней, текста и UI.
- Шаблон сетки: [`kai/_layout.svg`](kai/_layout.svg).

## manifest.json

```json
{
  "charId": "kai",
  "frameW": 256,
  "frameH": 256,
  "anchorX": 128,
  "anchorY": 242,
  "scale": 0.92,
  "animations": {
    "idle": { "file": "idle.png", "frames": 6, "fps": 10, "loop": true },
    "punch": { "file": "punch.png", "frames": 5, "fps": 18, "loop": false }
  }
}
```

Поддерживаемые имена анимаций:

`idle`, `walk`, `jump`, `punch`, `kick`, `special`, `block`, `hit`, `ko`.

Если какой-то анимации нет, используется процедурная отрисовка для этого состояния.

## Как это работает

- `sprites.js` загружает `manifest.json` и PNG через `Image`.
- `drawFighter()` спрашивает `getSpriteFrame(f)`.
- Если кадр есть — рисует спрайт с anchor и flip по `facing`.
- Если нет — старый процедурный пиксельно-неоновый рендер.
- `flash` от попадания передаётся через `ctx.filter` (если поддерживается).

## KAI

Первый подготовленный персонаж — KAI. Дизайн-бриф, палитра и раскадровка анимаций:

- [`docs/CHARACTER_KAI.md`](../../docs/CHARACTER_KAI.md)

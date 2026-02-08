# ⚡ Typebound Dungeon

> *A dungeon lies beneath. Monsters guard every corridor. Your only weapon is your keyboard.*

A typing-powered dungeon crawler with roguelike card mechanics. Explore procedural dungeons, slay monsters with your words, and collect ability cards to survive deeper floors. Built entirely with DOM and CSS — zero canvas.

![Dungeon Crawl](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2w0cjJqb215OXA5ZHl2OGY3ajJycDQ2Z3dxOWwyMGh6NWx3cTl1ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NSzHiAwAcazs7dcDr9/giphy.gif)

---

## 🎮 How It Works

You wake up in a dark dungeon. The only thing you can see is the space around you — everything else is fog. Move tile by tile, reveal the map, and pray you don't step on something nasty.

**Spoiler: you will.**

When you hit an enemy, combat kicks in. Words flash on screen. Type them. Fast. Every correct word deals damage. Every mistype? The enemy swings back. A timer bar is ticking down the whole time — run out, and you eat another hit.

> 💀 *Type fast or die slow.*

![Typing Fast](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2diZ2htcHE0M2xicWt0M3Nib2hyYTg2bDZiZm92Z2hwZTN3NTV5ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ThrM4jEi2lBxd7X2yz/giphy.gif)

---

## 🕹️ Controls

| Action | Input |
|--------|-------|
| 🚶 Move | `WASD` / `Arrow Keys` / Click adjacent tile |
| ⌨️ Fight | Just start typing |
| 🃏 Use card (combat) | Click the card button below the word |
| 💚 Use card (overworld) | Click a Heal card in your hand |

---

## 👹 Bestiary

Not all monsters are created equal. The deeper you go, the worse it gets.

| Enemy | Difficulty | Words to Type | Vibe |
|-------|-----------|---------------|------|
| 🐀 Rat | Easy | 1 | Warm-up |
| 💀 Skeleton | Easy | 2 | Still chill |
| 👺 Goblin | Medium | 2 | Getting real |
| 🧟 Zombie | Medium | 3 | Panic sets in |
| 👻 Wraith | Medium | 3 | Can't see it coming |
| 😈 Demon | Hard | 4 | Sweat on keyboard |
| 🐉 Dragon | Hard | 5 | Good luck |

> Enemy HP, damage, word count, and timer pressure all scale with floor depth. Floor 7+ is not a good time.

---

## 🃏 Cards

Open chests to collect ability cards. They flip open with a 3D CSS animation. Max hand size: **5 cards**.

| Card | Effect | When to use it |
|------|--------|----------------|
| 💚 Heal | Restore 25 HP | Anytime (even outside combat) |
| 🛡️ Shield | Block the next enemy hit | Before a mistype you feel coming |
| ⚔️ Double Strike | Next word deals 2x damage | On long hard words |
| ❄️ Time Freeze | Pause timer for 3 seconds | When the bar is red |
| ⚡ Lightning | Auto-complete current word | When you can't spell "necromancer" |

![Card Magic](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2VuM2I2ZGpmNDVvZjhscTE0MmpqZ2RhcW40ajNlMWhmaXB1N3RxdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TS9pTA670S1ajXEiK1/giphy.gif)

---

## 🏗️ Under The Hood

This game has **zero `<canvas>` elements**. Everything is DOM and CSS.

| Feature | How |
|---------|-----|
| 🗺️ Dungeon grid | CSS Grid — 9x9 `div` tiles |
| 🌫️ Fog of war | CSS opacity on unrevealed tiles (1-tile vision radius) |
| 🃏 Card flip | `transform: rotateY(180deg)` + `transform-style: preserve-3d` |
| 💥 Kill particles | Spawned `div` elements with `@keyframes` + CSS custom properties |
| 📳 Screen shake | CSS `animation` on the grid container |
| 🗡️ Combat overlay | Fixed overlay with backdrop blur |
| 🏔️ Dungeon generation | Random walk algorithm carving floor from walls |
| 📱 Responsive | Sidebar + hand stack horizontally on mobile |

---

## 📁 Structure

```
TypeboundDungeon/
  index.html    🏠 Landing page — title, rules, play button
  game.html     ⚔️ Game screen — dungeon, combat, cards
  styles.css    🎨 All styles (landing + game)
  script.js     🧠 Game logic — generation, combat, cards, stats
  favicon.svg   ⚡ Icon
```

---

## 🛠️ Built With

`HTML` | `CSS` | `JavaScript` | `Font Awesome`

No frameworks. No libraries. No canvas. Just vibes and DOM manipulation.

---

> ⚡ *How deep can you go?*

/* ============================================
   Typebound Dungeon - Game Logic
   ============================================ */

(function () {
  'use strict';

  // ── Constants ──
  const GRID = 9;
  const MAX_HP = 100;
  const MAX_CARDS = 5;
  const BASE_TIMER = 12000; // ms per word
  const TIMER_TICK = 50;

  // Word pools by difficulty
  const WORDS = {
    easy: ['fire', 'cast', 'bolt', 'rune', 'trap', 'dark', 'glow', 'fang', 'bone', 'dust',
      'cave', 'tomb', 'gate', 'iron', 'gold', 'mist', 'howl', 'claw', 'bite', 'slam',
      'arch', 'void', 'hex', 'orb', 'ash', 'fog', 'web', 'gem', 'axe', 'elf'
    ],
    medium: ['shield', 'potion', 'dragon', 'zombie', 'goblin', 'shadow', 'portal', 'cipher',
      'amulet', 'spirit', 'frozen', 'vortex', 'ritual', 'plague', 'mystic', 'arcane',
      'hammer', 'scroll', 'throne', 'inferno', 'dungeon', 'crystal', 'specter', 'bandit'
    ],
    hard: ['labyrinth', 'enchantment', 'sorcerer', 'catacombs', 'necromancer', 'corruption',
      'apocalypse', 'shadowbane', 'thunderstrike', 'nightshade', 'obsidian', 'phantasm',
      'maelstrom', 'berserker', 'bloodstone', 'dragonfire', 'hellstorm', 'tombwalker'
    ]
  };

  // Enemy types
  const ENEMIES = [{
      name: 'Rat',
      icon: 'fa-disease',
      hp: 20,
      damage: 5,
      words: 1,
      diff: 'easy'
    },
    {
      name: 'Skeleton',
      icon: 'fa-skull',
      hp: 30,
      damage: 8,
      words: 2,
      diff: 'easy'
    },
    {
      name: 'Goblin',
      icon: 'fa-mask',
      hp: 40,
      damage: 10,
      words: 2,
      diff: 'medium'
    },
    {
      name: 'Zombie',
      icon: 'fa-head-side-virus',
      hp: 50,
      damage: 12,
      words: 3,
      diff: 'medium'
    },
    {
      name: 'Wraith',
      icon: 'fa-ghost',
      hp: 60,
      damage: 15,
      words: 3,
      diff: 'medium'
    },
    {
      name: 'Demon',
      icon: 'fa-fire',
      hp: 80,
      damage: 18,
      words: 4,
      diff: 'hard'
    },
    {
      name: 'Dragon',
      icon: 'fa-dragon',
      hp: 100,
      damage: 22,
      words: 5,
      diff: 'hard'
    },
  ];

  // Card definitions
  const CARD_TYPES = [{
      type: 'heal',
      name: 'HEAL',
      desc: 'Restore 25 HP',
      icon: 'fa-heart',
      color: 'var(--card-heal)'
    },
    {
      type: 'shield',
      name: 'SHIELD',
      desc: 'Block next enemy hit',
      icon: 'fa-shield-alt',
      color: 'var(--card-shield)'
    },
    {
      type: 'double',
      name: 'DOUBLE',
      desc: 'Next word deals 2x damage',
      icon: 'fa-bolt',
      color: 'var(--card-double)'
    },
    {
      type: 'freeze',
      name: 'FREEZE',
      desc: 'Pause timer for 3 seconds',
      icon: 'fa-snowflake',
      color: 'var(--card-freeze)'
    },
    {
      type: 'lightning',
      name: 'LIGHTNING',
      desc: 'Auto-complete current word',
      icon: 'fa-bolt',
      color: 'var(--card-lightning)'
    },
  ];

  // Tile icons
  const TILE_ICONS = {
    player: '<i class="fas fa-user tile-icon"></i>',
    enemy: '<i class="fas fa-skull tile-icon"></i>',
    chest: '<i class="fas fa-box tile-icon"></i>',
    exit: '<i class="fas fa-stairs tile-icon"></i>',
  };

  // ── Game State ──
  let state = {
    floor: 1,
    hp: MAX_HP,
    maxHp: MAX_HP,
    score: 0,
    kills: 0,
    totalChars: 0,
    correctChars: 0,
    wpmSamples: [],
    cards: [],
    grid: [],
    playerPos: {
      x: 0,
      y: 0
    },
    revealed: [],
    inCombat: false,
    gameOver: false,
    shieldActive: false,
    doubleActive: false,
  };

  // Combat state
  let combat = {
    enemy: null,
    enemyHp: 0,
    enemyMaxHp: 0,
    words: [],
    currentWordIndex: 0,
    currentCharIndex: 0,
    timer: 0,
    timerMax: 0,
    timerInterval: null,
    frozen: false,
    startTime: 0,
    wordChars: 0,
  };

  // ── DOM refs ──
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {};

  function cacheDom() {
    dom.grid = $('#dungeonGrid');
    dom.hpFill = $('#hpFill');
    dom.hpText = $('#hpText');
    dom.floorNum = $('#floorNum');
    dom.statFloor = $('#statFloor');
    dom.statKills = $('#statKills');
    dom.statWpm = $('#statWpm');
    dom.statAccuracy = $('#statAccuracy');
    dom.statScore = $('#statScore');
    dom.minimap = $('#minimap');
    dom.handSlots = $('#handSlots');
    dom.combatOverlay = $('#combatOverlay');
    dom.enemyIcon = $('#enemyIcon');
    dom.enemyName = $('#enemyName');
    dom.enemyHpFill = $('#enemyHpFill');
    dom.timerFill = $('#timerFill');
    dom.wordDisplay = $('#wordDisplay');
    dom.typedDisplay = $('#typedDisplay');
    dom.combatInput = $('#combatInput');
    dom.combatCards = $('#combatCards');
    dom.combatFeedback = $('#combatFeedback');
    dom.chestOverlay = $('#chestOverlay');
    dom.chestCard = $('#chestCard');
    dom.chestCardArt = $('#chestCardArt');
    dom.chestCardName = $('#chestCardName');
    dom.chestCardDesc = $('#chestCardDesc');
    dom.chestCollect = $('#chestCollect');
    dom.chestDiscard = $('#chestDiscard');
    dom.floorTransition = $('#floorTransition');
    dom.transFloor = $('#transFloor');
    dom.gameoverOverlay = $('#gameoverOverlay');
    dom.goFloor = $('#goFloor');
    dom.goKills = $('#goKills');
    dom.goWpm = $('#goWpm');
    dom.goAccuracy = $('#goAccuracy');
    dom.goScore = $('#goScore');
    dom.goRetry = $('#goRetry');
    dom.dungeonMsg = $('#dungeonMsg');
    dom.gameContainer = $('#gameContainer');
  }

  // ── Utilities ──
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[rand(0, arr.length - 1)];
  }

  // ── Dungeon Generation ──
  function generateDungeon() {
    const grid = [];
    for (let y = 0; y < GRID; y++) {
      grid[y] = [];
      for (let x = 0; x < GRID; x++) {
        grid[y][x] = 'wall';
      }
    }

    // Random walk to carve floors
    let cx = Math.floor(GRID / 2);
    let cy = Math.floor(GRID / 2);
    grid[cy][cx] = 'floor';
    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0]
    ];
    const floorCount = Math.floor(GRID * GRID * 0.55) + rand(0, 5);

    let carved = 1;
    while (carved < floorCount) {
      const [dx, dy] = pick(dirs);
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < GRID - 1 && ny > 0 && ny < GRID - 1) {
        if (grid[ny][nx] === 'wall') carved++;
        grid[ny][nx] = 'floor';
        cx = nx;
        cy = ny;
      }
    }

    // Place player at center
    const pcx = Math.floor(GRID / 2);
    const pcy = Math.floor(GRID / 2);
    grid[pcy][pcx] = 'floor';

    // Collect floor tiles (excluding player start)
    const floors = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (grid[y][x] === 'floor' && !(x === pcx && y === pcy)) {
          floors.push({
            x,
            y
          });
        }
      }
    }

    // Shuffle floors
    for (let i = floors.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [floors[i], floors[j]] = [floors[j], floors[i]];
    }

    // Place enemies (3-5 + floor bonus)
    const enemyCount = Math.min(rand(3, 5) + Math.floor(state.floor / 2), floors.length - 5);
    for (let i = 0; i < enemyCount && floors.length > 2; i++) {
      const tile = floors.pop();
      grid[tile.y][tile.x] = 'enemy';
    }

    // Place chests (1-2)
    const chestCount = rand(1, 2);
    for (let i = 0; i < chestCount && floors.length > 2; i++) {
      const tile = floors.pop();
      grid[tile.y][tile.x] = 'chest';
    }

    // Place exit (far from player)
    floors.sort((a, b) => {
      const da = Math.abs(a.x - pcx) + Math.abs(a.y - pcy);
      const db = Math.abs(b.x - pcx) + Math.abs(b.y - pcy);
      return db - da;
    });
    const exitTile = floors[0];
    if (exitTile) grid[exitTile.y][exitTile.x] = 'exit';

    return {
      grid,
      playerStart: {
        x: pcx,
        y: pcy
      }
    };
  }

  // ── Fog of War ──
  function initRevealed() {
    state.revealed = [];
    for (let y = 0; y < GRID; y++) {
      state.revealed[y] = [];
      for (let x = 0; x < GRID; x++) {
        state.revealed[y][x] = false;
      }
    }
  }

  function revealAround(px, py) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx;
        const ny = py + dy;
        if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
          state.revealed[ny][nx] = true;
        }
      }
    }
  }

  // ── Render ──
  function renderGrid() {
    dom.grid.innerHTML = '';
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.x = x;
        tile.dataset.y = y;

        const cellType = state.grid[y][x];
        const isPlayer = x === state.playerPos.x && y === state.playerPos.y;
        const isRevealed = state.revealed[y][x];

        if (!isRevealed) {
          tile.classList.add('fog');
        } else if (isPlayer) {
          tile.classList.add('player');
          tile.innerHTML = TILE_ICONS.player;
        } else if (cellType === 'wall') {
          tile.classList.add('wall');
        } else if (cellType === 'enemy') {
          tile.classList.add('enemy');
          tile.innerHTML = TILE_ICONS.enemy;
        } else if (cellType === 'chest') {
          tile.classList.add('chest');
          tile.innerHTML = TILE_ICONS.chest;
        } else if (cellType === 'exit') {
          tile.classList.add('exit');
          tile.innerHTML = TILE_ICONS.exit;
        } else {
          tile.classList.add('floor');
        }

        tile.addEventListener('click', () => handleTileClick(x, y));
        dom.grid.appendChild(tile);
      }
    }
  }

  function renderMinimap() {
    dom.minimap.innerHTML = '';
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const mt = document.createElement('div');
        mt.className = 'mini-tile';
        const isPlayer = x === state.playerPos.x && y === state.playerPos.y;
        const isRevealed = state.revealed[y][x];

        if (!isRevealed) {
          mt.classList.add('hidden');
        } else if (isPlayer) {
          mt.classList.add('player');
        } else {
          const type = state.grid[y][x];
          mt.classList.add(type);
        }
        dom.minimap.appendChild(mt);
      }
    }
  }

  function updateStats() {
    // HP
    const hpPct = (state.hp / state.maxHp) * 100;
    dom.hpFill.style.width = hpPct + '%';
    dom.hpFill.className = 'hp-fill' + (hpPct <= 25 ? ' low' : hpPct <= 50 ? ' mid' : '');
    dom.hpText.textContent = state.hp + ' / ' + state.maxHp;

    // Stats
    dom.floorNum.textContent = state.floor;
    dom.statFloor.textContent = state.floor;
    dom.statKills.textContent = state.kills;
    dom.statScore.textContent = state.score;

    // WPM
    const avgWpm = state.wpmSamples.length > 0 ?
      Math.round(state.wpmSamples.reduce((a, b) => a + b, 0) / state.wpmSamples.length) :
      0;
    dom.statWpm.textContent = avgWpm;

    // Accuracy
    const acc = state.totalChars > 0 ?
      Math.round((state.correctChars / state.totalChars) * 100) :
      100;
    dom.statAccuracy.textContent = acc + '%';
  }

  function renderCards() {
    const slots = dom.handSlots.children;
    for (let i = 0; i < MAX_CARDS; i++) {
      const slot = slots[i];
      if (i < state.cards.length) {
        const card = state.cards[i];
        slot.className = 'card-slot filled';
        slot.dataset.type = card.type;
        slot.dataset.index = i;
        slot.innerHTML = `<span class="card-slot-icon"><i class="fas ${card.icon}"></i></span><span class="card-slot-name">${card.name}</span>`;
        slot.onclick = () => useCardFromHand(i);
      } else {
        slot.className = 'card-slot empty';
        slot.removeAttribute('data-type');
        slot.removeAttribute('data-index');
        slot.innerHTML = '<i class="fas fa-plus"></i>';
        slot.onclick = null;
      }
    }
  }

  // ── Movement ──
  function canMoveTo(x, y) {
    if (x < 0 || x >= GRID || y < 0 || y >= GRID) return false;
    if (state.grid[y][x] === 'wall') return false;
    // Must be adjacent
    const dx = Math.abs(x - state.playerPos.x);
    const dy = Math.abs(y - state.playerPos.y);
    return (dx + dy === 1);
  }

  function movePlayer(x, y) {
    if (state.inCombat || state.gameOver) return;
    if (!canMoveTo(x, y)) return;

    const cellType = state.grid[y][x];

    state.playerPos = {
      x,
      y
    };
    revealAround(x, y);

    if (cellType === 'enemy') {
      startCombat(x, y);
    } else if (cellType === 'chest') {
      openChest(x, y);
    } else if (cellType === 'exit') {
      nextFloor();
    } else {
      state.grid[y][x] = 'floor';
    }

    renderGrid();
    renderMinimap();
    updateStats();
  }

  function handleTileClick(x, y) {
    movePlayer(x, y);
  }

  function handleKeydown(e) {
    if (state.inCombat || state.gameOver) return;

    let dx = 0,
      dy = 0;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        dy = -1;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        dy = 1;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        dx = -1;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        dx = 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const nx = state.playerPos.x + dx;
    const ny = state.playerPos.y + dy;
    movePlayer(nx, ny);
  }

  // ── Combat ──
  function pickEnemy() {
    // Pick based on floor
    const maxIndex = Math.min(state.floor, ENEMIES.length) - 1;
    const minIndex = Math.max(0, maxIndex - 2);
    return ENEMIES[rand(minIndex, maxIndex)];
  }

  function getWords(count, diff) {
    const pool = WORDS[diff] || WORDS.easy;
    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(pick(pool));
    }
    return words;
  }

  function startCombat(x, y) {
    state.inCombat = true;
    const enemyDef = pickEnemy();

    // Scale with floor
    const hpScale = 1 + (state.floor - 1) * 0.15;
    const dmgScale = 1 + (state.floor - 1) * 0.1;

    combat.enemy = enemyDef;
    combat.enemyHp = Math.round(enemyDef.hp * hpScale);
    combat.enemyMaxHp = combat.enemyHp;
    combat.words = getWords(enemyDef.words + Math.floor(state.floor / 3), enemyDef.diff);
    combat.currentWordIndex = 0;
    combat.currentCharIndex = 0;
    combat.frozen = false;
    combat.startTime = Date.now();
    combat.wordChars = 0;

    // Timer scales down with floor
    combat.timerMax = Math.max(BASE_TIMER - state.floor * 500, 4000);
    combat.timer = combat.timerMax;

    // Render
    dom.enemyIcon.innerHTML = `<i class="fas ${enemyDef.icon}"></i>`;
    dom.enemyName.textContent = enemyDef.name.toUpperCase();
    dom.enemyHpFill.style.width = '100%';
    dom.timerFill.style.width = '100%';
    dom.timerFill.classList.remove('urgent');
    dom.combatFeedback.textContent = '';
    dom.combatFeedback.className = 'combat-feedback';
    dom.combatInput.value = '';

    renderCombatWord();
    renderCombatCards();

    dom.combatOverlay.classList.add('active');
    setTimeout(() => dom.combatInput.focus(), 100);

    startCombatTimer();
  }

  function renderCombatWord() {
    if (combat.currentWordIndex >= combat.words.length) return;
    const word = combat.words[combat.currentWordIndex];
    let html = '';
    for (let i = 0; i < word.length; i++) {
      let cls = '';
      if (i < combat.currentCharIndex) cls = 'correct';
      else if (i === combat.currentCharIndex) cls = 'current';
      html += `<span class="char ${cls}">${word[i]}</span>`;
    }
    dom.wordDisplay.innerHTML = html;
    dom.typedDisplay.textContent = `Word ${combat.currentWordIndex + 1} of ${combat.words.length}`;
  }

  function renderCombatCards() {
    dom.combatCards.innerHTML = '';
    state.cards.forEach((card, idx) => {
      const btn = document.createElement('button');
      btn.className = 'combat-card-btn';
      btn.dataset.type = card.type;
      btn.innerHTML = `<i class="fas ${card.icon}"></i> ${card.name}`;
      btn.onclick = () => useCardInCombat(idx);
      dom.combatCards.appendChild(btn);
    });
  }

  function startCombatTimer() {
    clearInterval(combat.timerInterval);
    combat.timerInterval = setInterval(() => {
      if (combat.frozen) return;
      combat.timer -= TIMER_TICK;
      const pct = (combat.timer / combat.timerMax) * 100;
      dom.timerFill.style.width = pct + '%';
      if (pct < 25) dom.timerFill.classList.add('urgent');

      if (combat.timer <= 0) {
        // Time's up - enemy attacks
        enemyAttack();
        combat.timer = combat.timerMax;
        dom.timerFill.classList.remove('urgent');
      }
    }, TIMER_TICK);
  }

  function enemyAttack() {
    const dmgScale = 1 + (state.floor - 1) * 0.1;
    let dmg = Math.round(combat.enemy.damage * dmgScale);
    if (state.shieldActive) {
      dmg = 0;
      state.shieldActive = false;
      showFeedback('SHIELDED!', 'miss');
    } else {
      state.hp = Math.max(0, state.hp - dmg);
      showFeedback(`HIT! -${dmg} HP`, 'hit');
      shakeScreen();
    }
    updateStats();
    if (state.hp <= 0) {
      endCombat(false);
    }
  }

  function handleCombatInput(e) {
    if (!state.inCombat) return;
    const word = combat.words[combat.currentWordIndex];
    if (!word) return;

    const val = dom.combatInput.value;
    const lastChar = val[val.length - 1];
    const expected = word[combat.currentCharIndex];

    state.totalChars++;

    if (lastChar === expected) {
      state.correctChars++;
      combat.currentCharIndex++;
      combat.wordChars++;

      if (combat.currentCharIndex >= word.length) {
        // Word completed
        wordCompleted();
      }
    } else {
      // Wrong character - enemy attacks
      showFeedback('MISTYPE!', 'miss');
      enemyAttack();
    }

    dom.combatInput.value = '';
    renderCombatWord();
  }

  function wordCompleted() {
    // Calculate WPM for this word
    const elapsed = (Date.now() - combat.startTime) / 1000 / 60; // minutes
    if (elapsed > 0) {
      const wpm = Math.round((combat.wordChars / 5) / elapsed);
      state.wpmSamples.push(wpm);
      if (state.wpmSamples.length > 20) state.wpmSamples.shift();
    }

    // Deal damage
    let dmg = 10 + rand(5, 15);
    // WPM bonus
    const avgWpm = state.wpmSamples.length > 0 ?
      state.wpmSamples.reduce((a, b) => a + b, 0) / state.wpmSamples.length :
      30;
    dmg += Math.floor(avgWpm / 10);

    if (state.doubleActive) {
      dmg *= 2;
      state.doubleActive = false;
      showFeedback(`DOUBLE STRIKE! -${dmg} DMG`, 'kill');
    } else {
      showFeedback(`-${dmg} DMG`, 'kill');
    }

    combat.enemyHp = Math.max(0, combat.enemyHp - dmg);
    dom.enemyHpFill.style.width = (combat.enemyHp / combat.enemyMaxHp) * 100 + '%';

    // Reset timer
    combat.timer = combat.timerMax;
    dom.timerFill.classList.remove('urgent');
    combat.startTime = Date.now();
    combat.wordChars = 0;

    if (combat.enemyHp <= 0) {
      // Enemy defeated
      endCombat(true);
      return;
    }

    combat.currentWordIndex++;
    combat.currentCharIndex = 0;

    if (combat.currentWordIndex >= combat.words.length) {
      // All words typed but enemy still alive - generate more
      const extra = getWords(2, combat.enemy.diff);
      combat.words = combat.words.concat(extra);
    }

    renderCombatWord();
  }

  function endCombat(won) {
    clearInterval(combat.timerInterval);
    state.inCombat = false;
    dom.combatOverlay.classList.remove('active');

    if (won) {
      state.kills++;
      state.score += 100 * state.floor;
      // Clear enemy tile
      state.grid[state.playerPos.y][state.playerPos.x] = 'floor';
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 'var(--success)');
      showDungeonMsg('Enemy defeated! +' + (100 * state.floor) + ' pts');
    } else {
      gameOver();
    }

    state.shieldActive = false;
    state.doubleActive = false;
    renderGrid();
    updateStats();
    renderCards();
  }

  function showFeedback(text, cls) {
    dom.combatFeedback.textContent = text;
    dom.combatFeedback.className = 'combat-feedback ' + cls;
    setTimeout(() => {
      dom.combatFeedback.textContent = '';
    }, 1500);
  }

  // ── Cards ──
  function useCardInCombat(index) {
    if (index >= state.cards.length) return;
    const card = state.cards[index];

    switch (card.type) {
      case 'heal':
        state.hp = Math.min(state.maxHp, state.hp + 25);
        showFeedback('+25 HP', 'kill');
        break;
      case 'shield':
        state.shieldActive = true;
        showFeedback('SHIELD ACTIVE', 'miss');
        break;
      case 'double':
        state.doubleActive = true;
        showFeedback('DOUBLE STRIKE READY', 'kill');
        break;
      case 'freeze':
        combat.frozen = true;
        showFeedback('TIME FROZEN', 'miss');
        setTimeout(() => {
          combat.frozen = false;
        }, 3000);
        break;
      case 'lightning':
        // Auto-complete current word
        combat.currentCharIndex = combat.words[combat.currentWordIndex].length;
        const word = combat.words[combat.currentWordIndex];
        state.correctChars += word.length;
        state.totalChars += word.length;
        showFeedback('LIGHTNING STRIKE!', 'kill');
        wordCompleted();
        break;
    }

    state.cards.splice(index, 1);
    updateStats();
    renderCards();
    renderCombatCards();
  }

  function useCardFromHand(index) {
    if (state.inCombat) return;
    if (index >= state.cards.length) return;
    const card = state.cards[index];

    // Only heal works outside combat
    if (card.type === 'heal') {
      state.hp = Math.min(state.maxHp, state.hp + 25);
      state.cards.splice(index, 1);
      showDungeonMsg('+25 HP healed');
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 'var(--card-heal)');
    } else {
      showDungeonMsg('Use this card in combat!');
    }
    updateStats();
    renderCards();
  }

  // ── Chests ──
  function openChest(x, y) {
    state.grid[y][x] = 'floor';
    const cardDef = pick(CARD_TYPES);

    // Show chest overlay with 3D card flip
    dom.chestCard.classList.remove('flipped');
    dom.chestCardArt.innerHTML = `<i class="fas ${cardDef.icon}" style="color:${cardDef.color}"></i>`;
    dom.chestCardName.textContent = cardDef.name;
    dom.chestCardName.style.color = cardDef.color;
    dom.chestCardDesc.textContent = cardDef.desc;

    dom.chestOverlay.classList.add('active');
    state.inCombat = true; // Block movement

    // Flip after a moment
    setTimeout(() => dom.chestCard.classList.add('flipped'), 400);

    dom.chestCollect.onclick = () => {
      if (state.cards.length < MAX_CARDS) {
        state.cards.push({
          ...cardDef
        });
        showDungeonMsg(`Collected ${cardDef.name} card!`);
      } else {
        showDungeonMsg('Hand full! Card discarded.');
      }
      closeChest();
    };
    dom.chestDiscard.onclick = () => {
      showDungeonMsg('Card discarded.');
      closeChest();
    };
  }

  function closeChest() {
    dom.chestOverlay.classList.remove('active');
    state.inCombat = false;
    state.score += 50;
    renderGrid();
    renderCards();
    updateStats();
  }

  // ── Floor Transition ──
  function nextFloor() {
    state.floor++;
    state.score += 200 * state.floor;
    // Small HP bonus
    state.hp = Math.min(state.maxHp, state.hp + 10);

    dom.transFloor.textContent = state.floor;
    dom.floorTransition.classList.add('active');

    setTimeout(() => {
      dom.floorTransition.classList.remove('active');
      initFloor();
    }, 1500);
  }

  // ── Game Over ──
  function gameOver() {
    state.gameOver = true;
    clearInterval(combat.timerInterval);

    const avgWpm = state.wpmSamples.length > 0 ?
      Math.round(state.wpmSamples.reduce((a, b) => a + b, 0) / state.wpmSamples.length) :
      0;
    const acc = state.totalChars > 0 ?
      Math.round((state.correctChars / state.totalChars) * 100) :
      0;

    dom.goFloor.textContent = state.floor;
    dom.goKills.textContent = state.kills;
    dom.goWpm.textContent = avgWpm;
    dom.goAccuracy.textContent = acc + '%';
    dom.goScore.textContent = state.score;

    setTimeout(() => {
      dom.gameoverOverlay.classList.add('active');
    }, 300);
  }

  // ── Effects ──
  function shakeScreen() {
    dom.grid.classList.add('shake');
    setTimeout(() => dom.grid.classList.remove('shake'), 300);
  }

  function spawnParticles(cx, cy, color) {
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = color;
      const angle = (Math.PI * 2 / 12) * i;
      const dist = rand(30, 80);
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  function showDungeonMsg(text) {
    dom.dungeonMsg.textContent = text;
    dom.dungeonMsg.classList.add('show');
    setTimeout(() => dom.dungeonMsg.classList.remove('show'), 2000);
  }

  // ── Init ──
  function initFloor() {
    const {
      grid,
      playerStart
    } = generateDungeon();
    state.grid = grid;
    state.playerPos = playerStart;
    state.inCombat = false;
    state.shieldActive = false;
    state.doubleActive = false;

    initRevealed();
    revealAround(playerStart.x, playerStart.y);
    renderGrid();
    renderMinimap();
    updateStats();
    renderCards();
  }

  function resetGame() {
    state = {
      floor: 1,
      hp: MAX_HP,
      maxHp: MAX_HP,
      score: 0,
      kills: 0,
      totalChars: 0,
      correctChars: 0,
      wpmSamples: [],
      cards: [],
      grid: [],
      playerPos: {
        x: 0,
        y: 0
      },
      revealed: [],
      inCombat: false,
      gameOver: false,
      shieldActive: false,
      doubleActive: false,
    };
    dom.gameoverOverlay.classList.remove('active');
    dom.combatOverlay.classList.remove('active');
    dom.chestOverlay.classList.remove('active');
    initFloor();
  }

  function init() {
    cacheDom();

    // Keyboard movement
    document.addEventListener('keydown', handleKeydown);

    // Combat input
    dom.combatInput.addEventListener('input', handleCombatInput);

    // Retry button
    dom.goRetry.addEventListener('click', resetGame);

    initFloor();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
/**
 * THE IDEA SPACE - Demon Compendium
 * A tribute to Shin Megami Tensei
 */

// ============================================
// Demon Database
// ============================================
const demonDatabase = [
    // Classic Era Demons (SMT I/II)
    {
        id: 1,
        name: "JACK FROST",
        race: "Fairy",
        alignment: "neutral",
        tier: "b",
        level: 7,
        games: ["smt1", "smt2", "smt-if", "nocturne", "strange-journey", "smt4", "smt4a", "smt5", "smt5v"],
        stats: {
            str: 5,
            mag: 8,
            vit: 6,
            agi: 7,
            luk: 6
        },
        skills: ["Bufu", "Dia", "Ice Breath"],
        lore: "A winter fairy from English folklore. Known for his cheerful 'Hee-ho!' catchphrase, Jack Frost is one of the most iconic demons in the Megami Tensei series."
    },
    {
        id: 2,
        name: "PIXIE",
        race: "Fairy",
        alignment: "neutral",
        tier: "c",
        level: 2,
        games: ["smt1", "smt2", "smt-if", "nocturne", "strange-journey", "smt4", "smt4a", "smt5", "smt5v"],
        stats: {
            str: 3,
            mag: 7,
            vit: 4,
            agi: 8,
            luk: 5
        },
        skills: ["Zio", "Dia", "Patra"],
        lore: "A tiny fairy from Celtic folklore. Often the first demon encountered, Pixie has a special significance in Nocturne where she can accompany the Demi-fiend throughout the entire game."
    },
    {
        id: 3,
        name: "CERBERUS",
        race: "Beast",
        alignment: "neutral",
        tier: "a",
        level: 52,
        games: ["smt1", "smt2", "nocturne", "strange-journey", "smt4", "smt5"],
        stats: {
            str: 45,
            mag: 30,
            vit: 40,
            agi: 35,
            luk: 28
        },
        skills: ["Agidyne", "Fire Breath", "Lunge"],
        lore: "The three-headed hound that guards the gates of the underworld in Greek mythology. A loyal and powerful demon."
    },
    {
        id: 4,
        name: "METATRON",
        race: "Herald",
        alignment: "law",
        tier: "s",
        level: 95,
        games: ["smt2", "nocturne", "strange-journey", "smt4", "smt4a", "smt5", "smt5v"],
        stats: {
            str: 60,
            mag: 75,
            vit: 55,
            agi: 50,
            luk: 45
        },
        skills: ["Megidolaon", "Fire of Sinai", "Mahamaon", "Dekaja"],
        lore: "The voice of God and highest of the angels. Said to have been the prophet Enoch before ascending to heaven."
    },
    {
        id: 5,
        name: "ALICE",
        race: "Fiend",
        alignment: "neutral",
        tier: "s",
        level: 72,
        games: ["smt1", "smt2", "nocturne", "strange-journey", "smt4", "smt4a", "smt5", "smt5v"],
        stats: {
            str: 25,
            mag: 80,
            vit: 35,
            agi: 55,
            luk: 50
        },
        skills: ["Die For Me!", "Mamudoon", "Megidola", "Dekunda"],
        lore: "A mysterious girl who commands instant death. Based on Lewis Carroll's character, but with a much darker interpretation."
    },
    {
        id: 6,
        name: "LUCIFER",
        race: "Tyrant",
        alignment: "chaos",
        tier: "s",
        level: 99,
        games: ["smt1", "smt2", "nocturne", "strange-journey", "smt4", "smt4a", "smt5", "smt5v"],
        stats: {
            str: 70,
            mag: 80,
            vit: 65,
            agi: 55,
            luk: 60
        },
        skills: ["Morning Star", "Megidolaon", "High King", "Debilitate"],
        lore: "The fallen angel and ruler of demons. Often appears as the final boss or ultimate persona in the series."
    },
    {
        id: 7,
        name: "MARA",
        race: "Tyrant",
        alignment: "chaos",
        tier: "a",
        level: 64,
        games: ["smt1", "smt2", "nocturne", "strange-journey", "smt4", "smt5"],
        stats: {
            str: 55,
            mag: 45,
            vit: 50,
            agi: 30,
            luk: 35
        },
        skills: ["Maragidyne", "Mamudoon", "Charge"],
        lore: "A demon of temptation from Buddhist mythology. Its... distinctive design has made it infamous among fans."
    },
    {
        id: 8,
        name: "THOR",
        race: "Kishin",
        alignment: "neutral",
        tier: "a",
        level: 53,
        games: ["smt1", "smt2", "nocturne", "smt4", "smt5"],
        stats: {
            str: 50,
            mag: 42,
            vit: 45,
            agi: 38,
            luk: 32
        },
        skills: ["Ziodyne", "Megaton Press", "Thunder Reign"],
        lore: "The Norse god of thunder. Wields the mighty hammer Mjolnir and protects Asgard from giants."
    },
    {
        id: 9,
        name: "SHIVA",
        race: "Fury",
        alignment: "chaos",
        tier: "s",
        level: 84,
        games: ["smt1", "smt2", "nocturne", "strange-journey", "smt4", "smt5"],
        stats: {
            str: 65,
            mag: 70,
            vit: 55,
            agi: 60,
            luk: 50
        },
        skills: ["Pralaya", "Megidolaon", "Enduring Soul", "Drain Phys"],
        lore: "The Hindu god of destruction and transformation. One of the most powerful demons, often requiring special fusion."
    },
    {
        id: 10,
        name: "MOTHMAN",
        race: "Wilder",
        alignment: "neutral",
        tier: "c",
        level: 32,
        games: ["nocturne", "strange-journey", "smt4", "smt5"],
        stats: {
            str: 22,
            mag: 28,
            vit: 20,
            agi: 35,
            luk: 30
        },
        skills: ["Zio", "Panic Voice", "Sukunda"],
        lore: "A cryptid from West Virginia folklore. Said to appear before disasters as an omen of doom."
    },
    {
        id: 11,
        name: "DAISOUJOU",
        race: "Fiend",
        alignment: "neutral",
        tier: "s",
        level: 45,
        games: ["nocturne", "smt4", "smt5"],
        stats: {
            str: 18,
            mag: 55,
            vit: 30,
            agi: 28,
            luk: 40
        },
        skills: ["Meditation", "Prayer", "Mahamudo", "Endure"],
        lore: "The spirit of a Buddhist monk who achieved enlightenment through self-mummification. One of the Fiends in Nocturne."
    },
    {
        id: 12,
        name: "MATADOR",
        race: "Fiend",
        alignment: "neutral",
        tier: "a",
        level: 30,
        games: ["nocturne", "smt4", "smt5"],
        stats: {
            str: 35,
            mag: 20,
            vit: 25,
            agi: 45,
            luk: 28
        },
        skills: ["Andalucia", "Red Capote", "Taunt", "Dekunda"],
        lore: "The spirit of a legendary bullfighter. Famous as the first major skill check boss in Nocturne."
    },
    {
        id: 13,
        name: "MITHRAS",
        race: "Deity",
        alignment: "law",
        tier: "b",
        level: 42,
        games: ["smt1", "smt2", "nocturne", "strange-journey", "smt4"],
        stats: {
            str: 38,
            mag: 35,
            vit: 36,
            agi: 30,
            luk: 28
        },
        skills: ["Maragion", "Hamaon", "Mediarama"],
        lore: "A Persian god of light and covenants. His worship was popular among Roman soldiers."
    },
    {
        id: 14,
        name: "RANGDA",
        race: "Femme",
        alignment: "chaos",
        tier: "a",
        level: 48,
        games: ["smt1", "nocturne", "smt4", "smt5"],
        stats: {
            str: 30,
            mag: 48,
            vit: 35,
            agi: 40,
            luk: 38
        },
        skills: ["Mamudoon", "Tentarafoo", "Repel Phys"],
        lore: "A demon queen from Balinese mythology. Often depicted in conflict with the lion-like Barong."
    },
    {
        id: 15,
        name: "BLACK FROST",
        race: "Night",
        alignment: "chaos",
        tier: "s",
        level: 66,
        games: ["smt-if", "nocturne", "strange-journey", "smt4", "smt5"],
        stats: {
            str: 45,
            mag: 60,
            vit: 48,
            agi: 42,
            luk: 50
        },
        skills: ["Bufudyne", "Mamudoon", "Ice Age", "Drain Ice"],
        lore: "A Jack Frost who fell to darkness. Unlike its cheerful counterpart, Black Frost embraces evil while keeping its cute appearance."
    },
    {
        id: 16,
        name: "ISHTAR",
        race: "Lady",
        alignment: "law",
        tier: "s",
        level: 85,
        games: ["smt2", "nocturne", "smt4", "smt5"],
        stats: {
            str: 40,
            mag: 75,
            vit: 50,
            agi: 55,
            luk: 60
        },
        skills: ["Salvation", "Samarecarm", "Luster Candy", "Maziodyne"],
        lore: "The Mesopotamian goddess of love and war. One of the most versatile support demons in the series."
    },
    {
        id: 17,
        name: "ODIN",
        race: "Deity",
        alignment: "neutral",
        tier: "s",
        level: 75,
        games: ["smt1", "smt2", "nocturne", "smt4", "smt5"],
        stats: {
            str: 55,
            mag: 65,
            vit: 50,
            agi: 48,
            luk: 45
        },
        skills: ["Thunder Reign", "Gungnir", "Debilitate", "Concentrate"],
        lore: "The All-Father of Norse mythology. Rules over Asgard and sacrificed his eye for wisdom."
    },
    {
        id: 18,
        name: "ARAHABAKI",
        race: "Kunitsu",
        alignment: "neutral",
        tier: "b",
        level: 35,
        games: ["smt2", "nocturne", "strange-journey", "smt4", "smt5"],
        stats: {
            str: 28,
            mag: 32,
            vit: 38,
            agi: 25,
            luk: 30
        },
        skills: ["Makarakarn", "Tetrakarn", "Spirit Drain"],
        lore: "An ancient clay figure from Japanese prehistory. Highly valued for its ability to reflect attacks."
    },
    {
        id: 19,
        name: "HUANG LONG",
        race: "Dragon",
        alignment: "neutral",
        tier: "s",
        level: 90,
        games: ["smt2", "nocturne", "smt4"],
        stats: {
            str: 60,
            mag: 70,
            vit: 60,
            agi: 55,
            luk: 55
        },
        skills: ["Megidolaon", "Luster Candy", "Debilitate", "Victory Cry"],
        lore: "The Yellow Dragon of the center in Chinese mythology. Commands the four cardinal beasts."
    },
    {
        id: 20,
        name: "YOSHITSUNE",
        race: "Wargod",
        alignment: "neutral",
        tier: "s",
        level: 73,
        games: ["smt-if", "nocturne", "smt4", "smt5"],
        stats: {
            str: 70,
            mag: 35,
            vit: 50,
            agi: 65,
            luk: 45
        },
        skills: ["Hassou Tobi", "Charge", "Power Charge", "Arms Master"],
        lore: "A legendary Japanese samurai and military genius. His eight-hit attack Hassou Tobi is infamous for its power."
    }
];

// Era definitions
const eras = [{
        id: "classic",
        name: "CLASSIC ERA (1992-1995)",
        years: [1992, 1994, 1995],
        games: ["smt1", "smt2", "smt-if"]
    },
    {
        id: "rebirth",
        name: "REBIRTH ERA (2003-2009)",
        years: [2003, 2009],
        games: ["nocturne", "strange-journey"]
    },
    {
        id: "modern",
        name: "MODERN ERA (2013-2024)",
        years: [2013, 2016, 2021, 2024],
        games: ["smt4", "smt4a", "smt5", "smt5v"]
    }
];

let currentEraIndex = 0;

// ============================================
// Boot Sequence
// ============================================
const bootMessages = [
    "INITIALIZING DEMON SUMMONING PROGRAM...",
    "LOADING DEMON DATABASE... [847 ENTRIES FOUND]",
    "CALIBRATING MAGNETITE SENSORS...",
    "ESTABLISHING AMALA NETWORK CONNECTION...",
    "SYNCHRONIZING DEMON COMPENDIUM...",
    "LOADING TIMELINE DATA...",
    "VERIFYING ALIGNMENT MATRICES...",
    "BOOT SEQUENCE COMPLETE."
];

let bootIndex = 0;
let charIndex = 0;
let bootProgress = 0;

function typeBootMessage() {
    const bootText = document.getElementById('bootText');
    const progressBar = document.getElementById('progressBar');
    const bootStatus = document.getElementById('bootStatus');

    if (bootIndex < bootMessages.length) {
        const currentMessage = bootMessages[bootIndex];

        if (charIndex < currentMessage.length) {
            bootText.textContent += currentMessage[charIndex];
            charIndex++;
            setTimeout(typeBootMessage, 15);
        } else {
            // Message complete, move to next
            bootIndex++;
            charIndex = 0;
            bootProgress = (bootIndex / bootMessages.length) * 100;
            progressBar.style.width = bootProgress + '%';

            if (bootIndex < bootMessages.length) {
                bootStatus.textContent = bootMessages[bootIndex].split('...')[0] + '...';
                setTimeout(() => {
                    bootText.textContent = '';
                    typeBootMessage();
                }, 300);
            } else {
                // Boot complete
                bootStatus.textContent = 'SYSTEM READY';
                bootStatus.style.animation = 'none';
                bootStatus.style.color = '#00ff9f';
                setTimeout(endBootSequence, 800);
            }
        }
    }
}

function endBootSequence() {
    const bootSequence = document.getElementById('bootSequence');
    const appContainer = document.getElementById('appContainer');

    bootSequence.classList.add('hidden');

    setTimeout(() => {
        appContainer.classList.add('visible');
        initializeApp();
    }, 500);
}

// ============================================
// Application Initialization
// ============================================
function initializeApp() {
    setupDateTime();
    setupNavigation();
    setupFilters();
    setupTimeline();
    populateDemonGrid();
    populateCompendium();
    setupModal();
    setupSearch();
    setupGlobalSearch();
    setupFusion();
}

// ============================================
// DateTime Display
// ============================================
function setupDateTime() {
    function updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        document.getElementById('datetime').innerHTML = `${dateStr}<br>${timeStr}`;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// ============================================
// Navigation
// ============================================
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;

            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                }
            });

            // Play click sound effect (visual feedback)
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 100);
        });
    });
}

// ============================================
// Filters
// ============================================
let activeFilters = {
    game: 'all',
    alignment: 'all',
    race: 'all',
    tier: 'all',
    skill: 'all'
};

function setupFilters() {
    // Game filter
    document.getElementById('gameFilter').addEventListener('change', (e) => {
        activeFilters.game = e.target.value;
        applyFilters();
    });

    // Alignment buttons
    const alignBtns = document.querySelectorAll('.align-btn');
    alignBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alignBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.alignment = btn.dataset.align;
            applyFilters();
        });
    });

    // Race filter
    document.getElementById('raceFilter').addEventListener('change', (e) => {
        activeFilters.race = e.target.value;
        applyFilters();
    });

    // Tier buttons
    const tierBtns = document.querySelectorAll('.tier-btn');
    tierBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tierBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.tier = btn.dataset.tier;
            applyFilters();
        });
    });

    // Skill filter
    document.getElementById('skillFilter').addEventListener('change', (e) => {
        activeFilters.skill = e.target.value;
        applyFilters();
    });

    // Reset button
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

function resetFilters() {
    activeFilters = {
        game: 'all',
        alignment: 'all',
        race: 'all',
        tier: 'all',
        skill: 'all'
    };

    document.getElementById('gameFilter').value = 'all';
    document.getElementById('raceFilter').value = 'all';
    document.getElementById('skillFilter').value = 'all';

    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.align === 'all') btn.classList.add('active');
    });

    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tier === 'all') btn.classList.add('active');
    });

    applyFilters();
}

function applyFilters() {
    const filteredDemons = demonDatabase.filter(demon => {
        if (activeFilters.game !== 'all' && !demon.games.includes(activeFilters.game)) return false;
        if (activeFilters.alignment !== 'all' && demon.alignment !== activeFilters.alignment) return false;
        if (activeFilters.race !== 'all' && demon.race.toLowerCase() !== activeFilters.race) return false;
        if (activeFilters.tier !== 'all' && demon.tier !== activeFilters.tier) return false;
        // Skill filter would need more complex logic based on skill types
        return true;
    });

    updateDemonGrid(filteredDemons);
    updateCompendiumGrid(filteredDemons);
}

// ============================================
// Timeline
// ============================================
function setupTimeline() {
    const nodes = document.querySelectorAll('.timeline-node');
    const prevBtn = document.getElementById('prevEra');
    const nextBtn = document.getElementById('nextEra');

    nodes.forEach(node => {
        node.addEventListener('click', () => {
            nodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            const game = node.dataset.game;
            activeFilters.game = game;
            document.getElementById('gameFilter').value = game;
            applyFilters();
        });
    });

    prevBtn.addEventListener('click', () => {
        if (currentEraIndex > 0) {
            currentEraIndex--;
            updateEraDisplay();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentEraIndex < eras.length - 1) {
            currentEraIndex++;
            updateEraDisplay();
        }
    });

    updateEraDisplay();
}

function updateEraDisplay() {
    const era = eras[currentEraIndex];
    document.getElementById('currentEra').textContent = era.name;

    // Highlight relevant timeline nodes
    const nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach(node => {
        const game = node.dataset.game;
        if (era.games.includes(game)) {
            node.style.opacity = '1';
        } else {
            node.style.opacity = '0.4';
        }
    });
}

// ============================================
// Demon Grid
// ============================================
function populateDemonGrid() {
    updateDemonGrid(demonDatabase);
}

function updateDemonGrid(demons) {
    const grid = document.getElementById('demonGrid');
    grid.innerHTML = '';

    demons.forEach(demon => {
        const card = createDemonCard(demon);
        grid.appendChild(card);
    });
}

function getElementIcons(skills) {
    const elements = [];
    const seen = new Set();
    skills.forEach(skill => {
        const s = skill.toLowerCase();
        let el = null;
        if (s.includes('bufu') || s.includes('ice')) el = { icon: '❄', cls: 'ice' };
        else if (s.includes('agi') || s.includes('fire') || s.includes('maragion')) el = { icon: '🔥', cls: 'fire' };
        else if (s.includes('zio') || s.includes('elec') || s.includes('thunder')) el = { icon: '⚡', cls: 'elec' };
        else if (s.includes('zan') || s.includes('force')) el = { icon: '🌪', cls: 'force' };
        else if (s.includes('hama') || s.includes('salvation')) el = { icon: '✦', cls: 'light' };
        else if (s.includes('mudo') || s.includes('dark') || s.includes('die')) el = { icon: '☠', cls: 'dark' };
        else if (s.includes('megido') || s.includes('morning star') || s.includes('pralaya')) el = { icon: '✴', cls: 'almighty' };
        else if (s.includes('dia') || s.includes('media') || s.includes('prayer') || s.includes('meditation')) el = { icon: '✚', cls: 'heal' };
        else if (s.includes('lunge') || s.includes('charge') || s.includes('hassou') || s.includes('megaton') || s.includes('phys')) el = { icon: '⚔', cls: 'phys' };
        if (el && !seen.has(el.cls)) {
            seen.add(el.cls);
            elements.push(el);
        }
    });
    return elements;
}

function createDemonCard(demon) {
    const card = document.createElement('div');
    card.className = 'demon-card';
    card.dataset.demonId = demon.id;

    const elements = getElementIcons(demon.skills);
    const elementsHtml = elements.map(e => `<span class="elem-icon elem-${e.cls}" title="${e.cls}">${e.icon}</span>`).join('');

    card.innerHTML = `
        <div class="demon-card-header">
            <span class="demon-card-name">${demon.name}</span>
            <span class="demon-card-tier tier-${demon.tier}">TIER ${demon.tier.toUpperCase()}</span>
        </div>
        <div class="demon-card-race">${demon.race}</div>
        <div class="demon-card-sprite" style="background: linear-gradient(135deg, ${getAlignmentColor(demon.alignment)} 0%, #333 100%)"></div>
        <div class="demon-card-elements">${elementsHtml}</div>
        <div class="demon-card-stats">
            <span>LV ${demon.level}</span>
            <span>${demon.alignment.toUpperCase()}</span>
        </div>
    `;

    card.addEventListener('click', () => openDemonModal(demon));

    return card;
}

function getAlignmentColor(alignment) {
    switch (alignment) {
        case 'law':
            return '#3399ff';
        case 'chaos':
            return '#ff3333';
        default:
            return '#888888';
    }
}

// ============================================
// Compendium
// ============================================
function populateCompendium() {
    updateCompendiumGrid(demonDatabase);
}

function updateCompendiumGrid(demons) {
    const grid = document.getElementById('compendiumGrid');
    grid.innerHTML = '';

    demons.forEach(demon => {
        const card = createDemonCard(demon);
        grid.appendChild(card);
    });
}

// ============================================
// Search
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('demonSearch');
    const searchBtn = document.querySelector('.search-btn');

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();

        if (query === '') {
            updateCompendiumGrid(demonDatabase);
            return;
        }

        const results = demonDatabase.filter(demon =>
            demon.name.toLowerCase().includes(query) ||
            demon.race.toLowerCase().includes(query) ||
            demon.skills.some(skill => skill.toLowerCase().includes(query)) ||
            demon.lore.toLowerCase().includes(query)
        );

        updateCompendiumGrid(results);
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// ============================================
// Modal
// ============================================
function setupModal() {
    const modal = document.getElementById('demonModal');
    const closeBtn = document.getElementById('closeModal');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
        }
    });
}

function openDemonModal(demon) {
    const modal = document.getElementById('demonModal');

    document.getElementById('modalDemonName').textContent = demon.name;
    document.getElementById('modalDemonRace').textContent = demon.race;
    document.getElementById('modalAlignment').textContent = demon.alignment.toUpperCase();
    document.getElementById('modalLevel').textContent = demon.level;
    document.getElementById('modalTier').textContent = demon.tier.toUpperCase();
    document.getElementById('modalLore').textContent = demon.lore;

    // Update stat bars
    const statsContainer = document.querySelector('.stats-bars');
    statsContainer.innerHTML = '';

    const statNames = ['STR', 'MAG', 'VIT', 'AGI', 'LUK'];
    const statKeys = ['str', 'mag', 'vit', 'agi', 'luk'];

    statKeys.forEach((key, index) => {
        const value = demon.stats[key];
        const percentage = Math.min((value / 80) * 100, 100);

        const row = document.createElement('div');
        row.className = 'stat-bar-row';
        row.innerHTML = `
            <span class="stat-name">${statNames[index]}</span>
            <div class="stat-bar"><div class="stat-fill" style="width: ${percentage}%"></div></div>
            <span class="stat-val">${value}</span>
        `;
        statsContainer.appendChild(row);
    });

    // Update skills
    const skillsList = document.getElementById('modalSkills');
    skillsList.innerHTML = '';

    demon.skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `<span class="skill-icon">${getSkillIcon(skill)}</span> ${skill}`;
        skillsList.appendChild(skillItem);
    });

    // Update sprite background
    const sprite = document.getElementById('modalDemonSprite');
    sprite.style.background = `linear-gradient(135deg, ${getAlignmentColor(demon.alignment)} 0%, #333 100%)`;

    modal.classList.add('active');
}

function getSkillIcon(skill) {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('bufu') || skillLower.includes('ice')) return '❄';
    if (skillLower.includes('agi') || skillLower.includes('fire')) return '🔥';
    if (skillLower.includes('zio') || skillLower.includes('elec') || skillLower.includes('thunder')) return '⚡';
    if (skillLower.includes('zan') || skillLower.includes('force')) return '🌪';
    if (skillLower.includes('hama') || skillLower.includes('light')) return '✦';
    if (skillLower.includes('mudo') || skillLower.includes('dark') || skillLower.includes('die')) return '☠';
    if (skillLower.includes('megido')) return '✴';
    if (skillLower.includes('dia') || skillLower.includes('media') || skillLower.includes('salvation')) return '✚';
    return '◆';
}

// ============================================
// Global Search
// ============================================
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    const searchCount = document.getElementById('searchCount');
    const searchClear = document.getElementById('searchClear');

    let debounceTimer;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.toLowerCase().trim();

            if (query === '') {
                searchCount.textContent = '';
                searchClear.classList.remove('visible');
                updateDemonGrid(demonDatabase);
                updateCompendiumGrid(demonDatabase);
                return;
            }

            searchClear.classList.add('visible');

            const results = demonDatabase.filter(demon =>
                demon.name.toLowerCase().includes(query) ||
                demon.race.toLowerCase().includes(query) ||
                demon.alignment.toLowerCase().includes(query) ||
                demon.skills.some(skill => skill.toLowerCase().includes(query)) ||
                demon.lore.toLowerCase().includes(query) ||
                demon.tier.toLowerCase() === query
            );

            searchCount.textContent = `${results.length} FOUND`;
            updateDemonGrid(results);
            updateCompendiumGrid(results);
        }, 200);
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchCount.textContent = '';
        searchClear.classList.remove('visible');
        updateDemonGrid(demonDatabase);
        updateCompendiumGrid(demonDatabase);
        searchInput.focus();
    });
}

// ============================================
// Fusion Calculator
// ============================================
const fusionChart = {
    'Fairy':    { 'Fairy': 'Beast',    'Beast': 'Wilder',  'Deity': 'Lady',     'Fiend': 'Night',    'Tyrant': 'Fallen',  'Fury': 'Lady',     'Kishin': 'Genma',   'Lady': 'Megami',    'Night': 'Fairy',    'Wilder': 'Jirae',   'Fallen': 'Night',   'Femme': 'Fairy',    'Dragon': 'Deity',   'Herald': 'Megami',  'Wargod': 'Kishin',  'Kunitsu': 'Lady',   'Megami': 'Deity'   },
    'Beast':    { 'Fairy': 'Wilder',   'Beast': 'Jirae',   'Deity': 'Kishin',   'Fiend': 'Tyrant',   'Tyrant': 'Night',   'Fury': 'Kishin',   'Kishin': 'Fury',    'Lady': 'Femme',     'Night': 'Fairy',    'Wilder': 'Beast',   'Fallen': 'Night',   'Femme': 'Wilder',   'Dragon': 'Fury',    'Herald': 'Deity',   'Wargod': 'Fury',    'Kunitsu': 'Femme',  'Megami': 'Fairy'   },
    'Deity':    { 'Fairy': 'Lady',     'Beast': 'Kishin',  'Deity': 'Herald',   'Fiend': 'Tyrant',   'Tyrant': 'Fury',    'Fury': 'Deity',    'Kishin': 'Deity',   'Lady': 'Megami',    'Night': 'Femme',    'Wilder': 'Beast',   'Fallen': 'Fury',    'Femme': 'Lady',     'Dragon': 'Deity',   'Herald': 'Deity',   'Wargod': 'Kishin',  'Kunitsu': 'Lady',   'Megami': 'Herald'  },
    'Fiend':    { 'Fairy': 'Night',    'Beast': 'Tyrant',  'Deity': 'Tyrant',   'Fiend': 'Fiend',    'Tyrant': 'Fiend',   'Fury': 'Tyrant',   'Kishin': 'Fury',    'Lady': 'Fiend',     'Night': 'Fiend',    'Wilder': 'Fallen',  'Fallen': 'Fiend',   'Femme': 'Fiend',    'Dragon': 'Tyrant',  'Herald': 'Deity',   'Wargod': 'Fury',    'Kunitsu': 'Femme',  'Megami': 'Lady'    },
    'Tyrant':   { 'Fairy': 'Fallen',   'Beast': 'Night',   'Deity': 'Fury',     'Fiend': 'Fiend',    'Tyrant': 'Tyrant',  'Fury': 'Tyrant',   'Kishin': 'Fury',    'Lady': 'Femme',     'Night': 'Tyrant',   'Wilder': 'Night',   'Fallen': 'Tyrant',  'Femme': 'Lady',     'Dragon': 'Fury',    'Herald': 'Deity',   'Wargod': 'Kishin',  'Kunitsu': 'Femme',  'Megami': 'Deity'   },
    'Fury':     { 'Fairy': 'Lady',     'Beast': 'Kishin',  'Deity': 'Deity',    'Fiend': 'Tyrant',   'Tyrant': 'Tyrant',  'Fury': 'Kishin',   'Kishin': 'Fury',    'Lady': 'Deity',     'Night': 'Lady',     'Wilder': 'Beast',   'Fallen': 'Tyrant',  'Femme': 'Lady',     'Dragon': 'Deity',   'Herald': 'Deity',   'Wargod': 'Deity',   'Kunitsu': 'Lady',   'Megami': 'Deity'   },
    'Kishin':   { 'Fairy': 'Genma',    'Beast': 'Fury',    'Deity': 'Deity',    'Fiend': 'Fury',     'Tyrant': 'Fury',    'Fury': 'Fury',     'Kishin': 'Wargod',  'Lady': 'Kishin',    'Night': 'Femme',    'Wilder': 'Beast',   'Fallen': 'Lady',    'Femme': 'Kishin',   'Dragon': 'Fury',    'Herald': 'Deity',   'Wargod': 'Fury',    'Kunitsu': 'Kishin', 'Megami': 'Deity'   },
    'Lady':     { 'Fairy': 'Megami',   'Beast': 'Femme',   'Deity': 'Megami',   'Fiend': 'Fiend',    'Tyrant': 'Femme',   'Fury': 'Deity',    'Kishin': 'Kishin',  'Lady': 'Femme',     'Night': 'Lady',     'Wilder': 'Femme',   'Fallen': 'Lady',    'Femme': 'Lady',     'Dragon': 'Deity',   'Herald': 'Megami',  'Wargod': 'Deity',   'Kunitsu': 'Lady',   'Megami': 'Deity'   },
    'Night':    { 'Fairy': 'Fairy',    'Beast': 'Fairy',   'Deity': 'Femme',    'Fiend': 'Fiend',    'Tyrant': 'Tyrant',  'Fury': 'Lady',     'Kishin': 'Femme',   'Lady': 'Lady',      'Night': 'Fallen',   'Wilder': 'Fairy',   'Fallen': 'Night',   'Femme': 'Night',    'Dragon': 'Femme',   'Herald': 'Lady',    'Wargod': 'Kishin',  'Kunitsu': 'Femme',  'Megami': 'Lady'    },
    'Wilder':   { 'Fairy': 'Jirae',    'Beast': 'Beast',   'Deity': 'Beast',    'Fiend': 'Fallen',   'Tyrant': 'Night',   'Fury': 'Beast',    'Kishin': 'Beast',   'Lady': 'Femme',     'Night': 'Fairy',    'Wilder': 'Jirae',   'Fallen': 'Wilder',  'Femme': 'Wilder',   'Dragon': 'Beast',   'Herald': 'Beast',   'Wargod': 'Beast',   'Kunitsu': 'Jirae',  'Megami': 'Fairy'   },
    'Fallen':   { 'Fairy': 'Night',    'Beast': 'Night',   'Deity': 'Fury',     'Fiend': 'Fiend',    'Tyrant': 'Tyrant',  'Fury': 'Tyrant',   'Kishin': 'Lady',    'Lady': 'Lady',      'Night': 'Night',    'Wilder': 'Wilder',  'Fallen': 'Fallen',  'Femme': 'Night',    'Dragon': 'Tyrant',  'Herald': 'Fallen',  'Wargod': 'Fury',    'Kunitsu': 'Femme',  'Megami': 'Lady'    },
    'Femme':    { 'Fairy': 'Fairy',    'Beast': 'Wilder',  'Deity': 'Lady',     'Fiend': 'Fiend',    'Tyrant': 'Lady',    'Fury': 'Lady',     'Kishin': 'Kishin',  'Lady': 'Lady',      'Night': 'Night',    'Wilder': 'Wilder',  'Fallen': 'Night',   'Femme': 'Femme',    'Dragon': 'Lady',    'Herald': 'Megami',  'Wargod': 'Kishin',  'Kunitsu': 'Lady',   'Megami': 'Megami'  },
    'Dragon':   { 'Fairy': 'Deity',    'Beast': 'Fury',    'Deity': 'Deity',    'Fiend': 'Tyrant',   'Tyrant': 'Fury',    'Fury': 'Deity',    'Kishin': 'Fury',    'Lady': 'Deity',     'Night': 'Femme',    'Wilder': 'Beast',   'Fallen': 'Tyrant',  'Femme': 'Lady',     'Dragon': 'Dragon',  'Herald': 'Deity',   'Wargod': 'Deity',   'Kunitsu': 'Fury',   'Megami': 'Deity'   },
    'Herald':   { 'Fairy': 'Megami',   'Beast': 'Deity',   'Deity': 'Deity',    'Fiend': 'Deity',    'Tyrant': 'Deity',   'Fury': 'Deity',    'Kishin': 'Deity',   'Lady': 'Megami',    'Night': 'Lady',     'Wilder': 'Beast',   'Fallen': 'Fallen',  'Femme': 'Megami',   'Dragon': 'Deity',   'Herald': 'Herald',  'Wargod': 'Deity',   'Kunitsu': 'Deity',  'Megami': 'Herald'  },
    'Wargod':   { 'Fairy': 'Kishin',   'Beast': 'Fury',    'Deity': 'Kishin',   'Fiend': 'Fury',     'Tyrant': 'Kishin',  'Fury': 'Deity',    'Kishin': 'Fury',    'Lady': 'Deity',     'Night': 'Kishin',   'Wilder': 'Beast',   'Fallen': 'Fury',    'Femme': 'Kishin',   'Dragon': 'Deity',   'Herald': 'Deity',   'Wargod': 'Wargod',  'Kunitsu': 'Kishin', 'Megami': 'Deity'   },
    'Kunitsu':  { 'Fairy': 'Lady',     'Beast': 'Femme',   'Deity': 'Lady',     'Fiend': 'Femme',    'Tyrant': 'Femme',   'Fury': 'Lady',     'Kishin': 'Kishin',  'Lady': 'Lady',      'Night': 'Femme',    'Wilder': 'Jirae',   'Fallen': 'Femme',   'Femme': 'Lady',     'Dragon': 'Fury',    'Herald': 'Deity',   'Wargod': 'Kishin',  'Kunitsu': 'Kunitsu','Megami': 'Lady'    },
    'Megami':   { 'Fairy': 'Deity',    'Beast': 'Fairy',   'Deity': 'Herald',   'Fiend': 'Lady',     'Tyrant': 'Deity',   'Fury': 'Deity',    'Kishin': 'Deity',   'Lady': 'Deity',     'Night': 'Lady',     'Wilder': 'Fairy',   'Fallen': 'Lady',    'Femme': 'Megami',   'Dragon': 'Deity',   'Herald': 'Herald',  'Wargod': 'Deity',   'Kunitsu': 'Lady',   'Megami': 'Herald'  }
};

// Races that exist in our database for reference
const allRaces = [...new Set(demonDatabase.map(d => d.race))];

function setupFusion() {
    const select1 = document.getElementById('fusionDemon1');
    const select2 = document.getElementById('fusionDemon2');
    const fuseBtn = document.getElementById('fuseBtn');

    // Populate selects
    const sortedDemons = [...demonDatabase].sort((a, b) => a.name.localeCompare(b.name));
    sortedDemons.forEach(demon => {
        const opt1 = document.createElement('option');
        opt1.value = demon.id;
        opt1.textContent = `${demon.name} (${demon.race} - Lv.${demon.level})`;
        select1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = demon.id;
        opt2.textContent = `${demon.name} (${demon.race} - Lv.${demon.level})`;
        select2.appendChild(opt2);
    });

    select1.addEventListener('change', () => {
        updateFusionPreview(1);
        updateFuseButton();
    });

    select2.addEventListener('change', () => {
        updateFusionPreview(2);
        updateFuseButton();
    });

    fuseBtn.addEventListener('click', executeFusion);

    // Build fusion chart table
    buildFusionTable();
}

function updateFusionPreview(slot) {
    const select = document.getElementById(`fusionDemon${slot}`);
    const preview = document.getElementById(`fusionPreview${slot}`);
    const demonId = parseInt(select.value);

    if (!demonId) {
        preview.innerHTML = '<div class="fusion-preview-empty">AWAITING SELECTION...</div>';
        return;
    }

    const demon = demonDatabase.find(d => d.id === demonId);
    if (!demon) return;

    preview.innerHTML = `
        <div class="fusion-preview-card">
            <div class="fp-name">${demon.name}</div>
            <div class="fp-race">${demon.race} | ${demon.alignment.toUpperCase()}</div>
            <div class="fp-sprite" style="background: linear-gradient(135deg, ${getAlignmentColor(demon.alignment)} 0%, #333 100%)"></div>
            <div class="fp-stats">
                <span>LV ${demon.level}</span>
                <span>STR ${demon.stats.str}</span>
                <span>MAG ${demon.stats.mag}</span>
            </div>
            <span class="fp-tier tier-${demon.tier}">TIER ${demon.tier.toUpperCase()}</span>
        </div>
    `;
}

function updateFuseButton() {
    const select1 = document.getElementById('fusionDemon1');
    const select2 = document.getElementById('fusionDemon2');
    const fuseBtn = document.getElementById('fuseBtn');

    fuseBtn.disabled = !(select1.value && select2.value && select1.value !== select2.value);
}

function executeFusion() {
    const select1 = document.getElementById('fusionDemon1');
    const select2 = document.getElementById('fusionDemon2');
    const resultContainer = document.getElementById('fusionResult');
    const resultContent = document.getElementById('fusionResultContent');

    const demon1 = demonDatabase.find(d => d.id === parseInt(select1.value));
    const demon2 = demonDatabase.find(d => d.id === parseInt(select2.value));

    if (!demon1 || !demon2) return;

    // Calculate fusion result
    const resultRace = getFusionResultRace(demon1.race, demon2.race);
    const resultLevel = Math.floor((demon1.level + demon2.level) / 2) + 1;

    // Find best matching demon from database
    const resultDemon = findFusionResult(resultRace, resultLevel);

    resultContainer.classList.add('has-result');

    if (resultDemon) {
        resultContent.innerHTML = `
            <div class="fusion-result-demon">
                <div class="fr-name">${resultDemon.name}</div>
                <div class="fr-race">${resultDemon.race} | ${resultDemon.alignment.toUpperCase()}</div>
                <div class="fr-sprite" style="background: linear-gradient(135deg, ${getAlignmentColor(resultDemon.alignment)} 0%, #333 100%)"></div>
                <div class="fr-stats-row">
                    <span>LV <span class="fr-val">${resultDemon.level}</span></span>
                    <span>STR <span class="fr-val">${resultDemon.stats.str}</span></span>
                    <span>MAG <span class="fr-val">${resultDemon.stats.mag}</span></span>
                    <span>VIT <span class="fr-val">${resultDemon.stats.vit}</span></span>
                    <span>AGI <span class="fr-val">${resultDemon.stats.agi}</span></span>
                    <span>LUK <span class="fr-val">${resultDemon.stats.luk}</span></span>
                </div>
                <span class="fr-tier tier-${resultDemon.tier}">TIER ${resultDemon.tier.toUpperCase()}</span>
                <div class="fr-lore">${resultDemon.lore}</div>
                <button class="fr-view-btn" onclick="openDemonModal(demonDatabase.find(d => d.id === ${resultDemon.id}))">◆ VIEW FULL ENTRY ◆</button>
            </div>
        `;
    } else {
        resultContent.innerHTML = `
            <div class="fusion-result-demon">
                <div class="fr-name">??? UNKNOWN ???</div>
                <div class="fr-race">Result Race: ${resultRace} | Target Level: ~${resultLevel}</div>
                <div class="fr-sprite" style="background: linear-gradient(135deg, #555 0%, #222 100%)"></div>
                <div class="fr-lore">This fusion combination produces a demon not yet in the compendium. The resulting ${resultRace} demon would be around level ${resultLevel}.</div>
            </div>
        `;
    }
}

function getFusionResultRace(race1, race2) {
    // Look up in fusion chart
    if (fusionChart[race1] && fusionChart[race1][race2]) {
        return fusionChart[race1][race2];
    }
    if (fusionChart[race2] && fusionChart[race2][race1]) {
        return fusionChart[race2][race1];
    }
    // Fallback: return the less common race or Fairy
    return 'Fairy';
}

function findFusionResult(targetRace, targetLevel) {
    // Find demons of the target race, pick the one closest to targetLevel
    const candidates = demonDatabase.filter(d => d.race === targetRace);

    if (candidates.length === 0) {
        // No exact race match, find closest race match
        const allDemons = [...demonDatabase].sort((a, b) =>
            Math.abs(a.level - targetLevel) - Math.abs(b.level - targetLevel)
        );
        return allDemons[0];
    }

    // Find the demon closest to target level (prefer equal or higher)
    candidates.sort((a, b) => {
        const diffA = Math.abs(a.level - targetLevel);
        const diffB = Math.abs(b.level - targetLevel);
        return diffA - diffB;
    });

    return candidates[0];
}

function buildFusionTable() {
    const header = document.getElementById('fusionTableHeader');
    const body = document.getElementById('fusionTableBody');

    // Get races that appear in our fusion chart
    const races = Object.keys(fusionChart);

    // Build header row
    races.forEach(race => {
        const th = document.createElement('th');
        th.textContent = race.substring(0, 4).toUpperCase();
        th.title = race;
        header.appendChild(th);
    });

    // Build body rows
    races.forEach(race1 => {
        const row = document.createElement('tr');
        const th = document.createElement('td');
        th.textContent = race1.substring(0, 4).toUpperCase();
        th.title = race1;
        row.appendChild(th);

        races.forEach(race2 => {
            const td = document.createElement('td');
            const result = getFusionResultRace(race1, race2);
            td.textContent = result.substring(0, 4);
            td.title = `${race1} + ${race2} = ${result}`;

            if (race1 === race2) {
                td.classList.add('same-race');
            }

            row.appendChild(td);
        });

        body.appendChild(row);
    });
}

// ============================================
// Start Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Start boot sequence
    setTimeout(typeBootMessage, 500);
});
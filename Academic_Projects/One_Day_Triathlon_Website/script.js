const challengeOptions = {
    genre: ["Platformer", "Role-playing game", "Survival horror", "Rhythm game", "Sports game", "Turn-based strategy", "Life simulation", "Arcade racer", "Beat 'em up", "Puzzle adventure"],
    mechanic: ["Time loop", "Physics stacking", "Deck building", "Shape shifting", "Resource trading", "Rewind movement", "Light and shadow", "Sound navigation", "Clone yourself", "Risk versus reward"],
    wildcard: ["One-button controls", "No written dialogue", "Everything is temporary", "The map keeps shrinking", "You play as the level", "Failure makes you stronger", "Only two colors", "The enemy copies you", "Ten-second rounds", "Made for two players"]
};

const state = {
    genre: 0,
    mechanic: 0,
    wildcard: 0,
    locked: new Set()
};

function randomIndex(items, current) {
    let next = current;
    while (next === current) next = Math.floor(Math.random() * items.length);
    return next;
}

function setChallengeValue(type) {
    document.querySelector(`[data-value="${type}"]`).textContent = challengeOptions[type][state[type]];
}

function rollChallenge() {
    const available = Object.keys(challengeOptions).filter(type => !state.locked.has(type));
    const status = document.querySelector('[data-copy-status]');
    if (!available.length) {
        status.textContent = 'Unlock a result to reroll';
        return;
    }

    available.forEach(type => document.querySelector(`[data-card="${type}"]`).classList.add('is-rolling'));
    status.textContent = '';
    window.setTimeout(() => {
        available.forEach(type => {
            state[type] = randomIndex(challengeOptions[type], state[type]);
            setChallengeValue(type);
            document.querySelector(`[data-card="${type}"]`).classList.remove('is-rolling');
        });
    }, 420);
}

document.querySelector('[data-roll]').addEventListener('click', rollChallenge);

document.querySelectorAll('[data-lock]').forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.lock;
        const wasLocked = state.locked.has(type);
        if (wasLocked) state.locked.delete(type);
        else state.locked.add(type);
        button.setAttribute('aria-pressed', String(!wasLocked));
        button.textContent = wasLocked ? 'Lock result' : 'Unlock result';
        document.querySelector(`[data-card="${type}"]`).classList.toggle('is-locked', !wasLocked);
    });
});

document.querySelector('[data-copy]').addEventListener('click', async () => {
    const brief = `The One Day Triathlon challenge: ${challengeOptions.genre[state.genre]} + ${challengeOptions.mechanic[state.mechanic]} + ${challengeOptions.wildcard[state.wildcard]}`;
    const status = document.querySelector('[data-copy-status]');
    try {
        await navigator.clipboard.writeText(brief);
        status.textContent = 'Brief copied';
    } catch {
        status.textContent = `Copy this brief: ${brief}`;
    }
});

const timerKey = 'oneDayTriathlonEndTime';
const timerElements = {
    hours: document.querySelector('[data-hours]'),
    minutes: document.querySelector('[data-minutes]'),
    seconds: document.querySelector('[data-seconds]'),
    start: document.querySelector('[data-start-timer]'),
    reset: document.querySelector('[data-reset-timer]')
};
let timerInterval;

function updateTimer() {
    const endTime = Number(localStorage.getItem(timerKey));
    if (!endTime) return;
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    timerElements.hours.textContent = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    timerElements.minutes.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    timerElements.seconds.textContent = String(totalSeconds % 60).padStart(2, '0');
    timerElements.start.textContent = remaining ? 'Race in progress' : 'Time is up';
    timerElements.start.disabled = true;
    timerElements.reset.hidden = false;
    if (!remaining) window.clearInterval(timerInterval);
}

function startTimer() {
    localStorage.setItem(timerKey, String(Date.now() + (24 * 60 * 60 * 1000)));
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 1000);
}

function resetTimer() {
    window.clearInterval(timerInterval);
    localStorage.removeItem(timerKey);
    timerElements.hours.textContent = '24';
    timerElements.minutes.textContent = '00';
    timerElements.seconds.textContent = '00';
    timerElements.start.textContent = 'Start 24-hour clock';
    timerElements.start.disabled = false;
    timerElements.reset.hidden = true;
}

timerElements.start.addEventListener('click', startTimer);
timerElements.reset.addEventListener('click', resetTimer);
if (localStorage.getItem(timerKey)) {
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 1000);
}

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
}));

const header = document.querySelector('[data-header]');

function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateHeader, {
    passive: true
});
updateHeader();
document.querySelector('[data-year]').textContent = new Date().getFullYear();
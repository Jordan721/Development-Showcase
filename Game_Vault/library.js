'use strict';

(() => {
    const cards = Array.from(document.querySelectorAll('a.game-card[data-game]'));
    const filters = document.querySelectorAll('.library-filter');
    const search = document.getElementById('gameSearch');
    const count = document.getElementById('libraryCount');
    const empty = document.getElementById('libraryEmpty');
    const upcoming = document.querySelector('.empty-slot');
    let category = 'all';

    function updateLibrary() {
        const query = search.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(card => {
            const matches = (category === 'all' || card.dataset.category === category)
                && card.querySelector('.game-info').textContent.toLowerCase().includes(query);
            card.hidden = !matches;
            if (matches) visible++;
        });
        count.textContent = `${visible} experience${visible === 1 ? '' : 's'}`;
        empty.hidden = visible > 0;
        upcoming.hidden = category !== 'all' || query !== '';
    }

    filters.forEach(button => {
        button.addEventListener('click', () => {
            category = button.dataset.filter;
            filters.forEach(filter => {
                const selected = filter === button;
                filter.classList.toggle('active', selected);
                filter.setAttribute('aria-pressed', String(selected));
            });
            updateLibrary();
        });
    });
    search.addEventListener('input', updateLibrary);
    document.getElementById('surpriseGame').addEventListener('click', () => {
        const visible = cards.filter(card => !card.hidden);
        const pool = visible.length ? visible : cards;
        window.location.href = pool[Math.floor(Math.random() * pool.length)].href;
    });
    cards.forEach(card => {
        const image = card.querySelector('.game-preview img');
        if (image) image.alt = `${card.querySelector('.game-title').textContent.trim()} gameplay preview`;
    });
})();

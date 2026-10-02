(() => {
    'use strict';
    const cards = [...document.querySelectorAll('.project-card')];
    const search = document.getElementById('projectSearch');
    const filters = document.getElementById('techFilters');
    let selectedTech = 'all';
    const projects = cards.map(card => ({
        card,
        text: card.textContent.toLowerCase(),
        technologies: [...card.querySelectorAll('.card-tech span')].map(tag => tag.textContent.trim())
    }));
    const technologies = [...new Set(projects.flatMap(project => project.technologies))].sort();
    technologies.forEach(tech => {
        const button = document.createElement('button');
        button.className = 'filter-chip';
        button.dataset.tech = tech;
        button.textContent = tech;
        button.setAttribute('aria-pressed', 'false');
        filters.append(button);
    });

    function updateResults() {
        const query = search.value.trim().toLowerCase();
        let count = 0;
        projects.forEach(project => {
            const visible = project.text.includes(query) && (selectedTech === 'all' || project.technologies.includes(selectedTech));
            project.card.hidden = !visible;
            if (visible) count++;
        });
        document.querySelectorAll('.chapter').forEach(chapter => {
            const visible = [...chapter.querySelectorAll('.project-card')].filter(card => !card.hidden).length;
            chapter.hidden = visible === 0;
            chapter.querySelector('.chapter-count').textContent = `${visible} ${chapter.id === 'games' ? 'collection' : visible === 1 ? 'project' : 'projects'} to explore`;
        });
        document.getElementById('resultCount').textContent = `${count} ${count === 1 ? 'result' : 'projects & collections'}`;
        document.getElementById('emptyState').hidden = count > 0;
        filters.querySelectorAll('button').forEach(button => {
            const active = button.dataset.tech === selectedTech;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }
    search.addEventListener('input', updateResults);
    filters.addEventListener('click', event => {
        const button = event.target.closest('button[data-tech]');
        if (!button) return;
        selectedTech = button.dataset.tech;
        updateResults();
    });
    document.getElementById('resetFilters').addEventListener('click', () => {
        search.value = '';
        selectedTech = 'all';
        updateResults();
        search.focus();
    });
    const motionToggle = document.getElementById('motionToggle');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let motionPaused = reducedMotion.matches;

    function updateMotion() {
        document.documentElement.classList.toggle('motion-paused', motionPaused);
        motionToggle.textContent = motionPaused ? 'Resume motion' : 'Pause motion';
        motionToggle.setAttribute('aria-pressed', String(motionPaused));
    }
    motionToggle.addEventListener('click', () => {
        motionPaused = !motionPaused;
        updateMotion();
    });
    reducedMotion.addEventListener('change', event => {
        motionPaused = event.matches;
        updateMotion();
    });
    updateMotion();
    let discoveryTimer;
    document.getElementById('surpriseProject').addEventListener('click', () => {
        let available = cards.filter(card => !card.hidden);
        if (!available.length) {
            search.value = '';
            selectedTech = 'all';
            updateResults();
            available = cards;
        }
        if (!available.length) return;
        cards.forEach(card => card.classList.remove('discovery-flash'));
        clearTimeout(discoveryTimer);
        const pick = available[Math.floor(Math.random() * available.length)];
        pick.scrollIntoView({
            behavior: motionPaused || reducedMotion.matches ? 'instant' : 'smooth',
            block: 'center'
        });
        pick.focus({
            preventScroll: true
        });
        pick.classList.add('discovery-flash');
        discoveryTimer = setTimeout(() => pick.classList.remove('discovery-flash'), 1600);
    });
})();
(() => {
    'use strict';
    const cards = [...document.querySelectorAll('.project-card')];
    document.querySelector('.hero-caption span').textContent = `${cards.length} projects & collections`;
    const search = document.getElementById('projectSearch');
    const filters = document.getElementById('techFilters');
    const skillFilters = document.getElementById('skillFilters');
    let selectedTech = 'all';
    let selectedSkill = 'all';
    const projects = cards.map(card => ({
        card,
        text: `${card.textContent} ${card.dataset.skills || ''}`.toLowerCase(),
        skills: (card.dataset.skills || '').split('|').filter(Boolean),
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
    [...new Set(projects.flatMap(project => project.skills))].sort().forEach(skill => {
        const button = document.createElement('button');
        button.className = 'filter-chip';
        button.dataset.skill = skill;
        button.textContent = skill;
        button.setAttribute('aria-pressed', 'false');
        skillFilters.append(button);
    });

    function updateResults() {
        const query = search.value.trim().toLowerCase();
        let count = 0;
        projects.forEach(project => {
            const visible = project.text.includes(query) &&
                (selectedTech === 'all' || project.technologies.includes(selectedTech)) &&
                (selectedSkill === 'all' || project.skills.includes(selectedSkill));
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
        skillFilters.querySelectorAll('button').forEach(button => {
            const active = button.dataset.skill === selectedSkill;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        document.getElementById('clearFilters').hidden = !query && selectedTech === 'all' && selectedSkill === 'all';
    }
    search.addEventListener('input', updateResults);
    updateResults();
    filters.addEventListener('click', event => {
        const button = event.target.closest('button[data-tech]');
        if (!button) return;
        selectedTech = button.dataset.tech;
        updateResults();
    });
    skillFilters.addEventListener('click', event => {
        const button = event.target.closest('button[data-skill]');
        if (!button) return;
        selectedSkill = button.dataset.skill;
        updateResults();
    });

    function resetFilters() {
        search.value = '';
        selectedTech = 'all';
        selectedSkill = 'all';
        updateResults();
        search.focus();
    }
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('clearFilters').addEventListener('click', resetFilters);
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
            selectedSkill = 'all';
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
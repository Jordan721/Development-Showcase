const header = document.querySelector('[data-header]');
const progressBar = document.querySelector('[data-progress]');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.primary-nav');

function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, progress)}%`;
    header.classList.toggle('scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateScrollState, {
    passive: true
});
updateScrollState();

menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('open', !isOpen);
});

navigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        navigation.classList.remove('open');
    });
});

const themeTabs = [...document.querySelectorAll('[data-theme-tab]')];
const themePanels = [...document.querySelectorAll('[data-theme-panel]')];

function selectTheme(selectedTab) {
    const selectedTheme = selectedTab.dataset.themeTab;
    themeTabs.forEach(tab => {
        const active = tab === selectedTab;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
    });
    themePanels.forEach(panel => {
        panel.hidden = panel.dataset.themePanel !== selectedTheme;
    });
}

themeTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTheme(tab));
    tab.addEventListener('keydown', event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowDown') nextIndex = (index + 1) % themeTabs.length;
        if (event.key === 'ArrowUp') nextIndex = (index - 1 + themeTabs.length) % themeTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = themeTabs.length - 1;
        selectTheme(themeTabs[nextIndex]);
        themeTabs[nextIndex].focus();
    });
});

const galleryDialog = document.querySelector('[data-gallery-dialog]');
const dialogImage = document.querySelector('[data-dialog-image]');
const dialogTitle = document.querySelector('[data-dialog-title]');
const dialogClose = document.querySelector('[data-gallery-close]');

document.querySelectorAll('[data-gallery-image]').forEach(item => {
    item.addEventListener('click', () => {
        const preview = item.querySelector('img');
        dialogImage.src = item.dataset.galleryImage;
        dialogImage.alt = preview.alt;
        dialogTitle.textContent = item.dataset.galleryTitle;
        galleryDialog.showModal();
    });
});

dialogClose.addEventListener('click', () => galleryDialog.close());
galleryDialog.addEventListener('click', event => {
    if (event.target === galleryDialog) galleryDialog.close();
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
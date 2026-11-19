const bsgPages = 16;
let currentPage = 1;

const bsgImage = document.getElementById('bsg-image');
const bsgCurrent = document.getElementById('bsg-current');
const bsgPrev = document.getElementById('bsg-prev');
const bsgNext = document.getElementById('bsg-next');
const bsgThumbnails = document.getElementById('bsg-thumbnails');
const bsgViewer = document.querySelector('.bsg-viewer');

function getBsgSrc(page) {
    const number = String(page).padStart(2, '0');
    return "Pics/BSG_Folder/Watt's Gaming Brand Guide font outline-" + number + ".jpg";
}

function updateBsg(page) {
    if (page < 1 || page > bsgPages) return;

    bsgThumbnails.children[currentPage - 1].removeAttribute('aria-current');
    currentPage = page;
    bsgThumbnails.children[page - 1].setAttribute('aria-current', 'page');
    bsgImage.src = getBsgSrc(page);
    bsgImage.alt = 'Brand Standards Guide Page ' + page;
    bsgCurrent.textContent = page;
    bsgPrev.disabled = page === 1;
    bsgNext.disabled = page === bsgPages;

    if (document.activeElement === bsgPrev && bsgPrev.disabled) bsgNext.focus();
    if (document.activeElement === bsgNext && bsgNext.disabled) bsgPrev.focus();
}

for (let page = 1; page <= bsgPages; page++) {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'bsg-thumb';
    thumb.setAttribute('aria-label', 'Show page ' + page);
    if (page === 1) thumb.setAttribute('aria-current', 'page');

    const img = document.createElement('img');
    img.src = getBsgSrc(page);
    img.alt = '';
    img.loading = 'lazy';

    thumb.appendChild(img);
    thumb.addEventListener('click', () => updateBsg(page));
    bsgThumbnails.appendChild(thumb);
}

bsgPrev.addEventListener('click', () => updateBsg(currentPage - 1));
bsgNext.addEventListener('click', () => updateBsg(currentPage + 1));

bsgViewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        updateBsg(currentPage + (event.key === 'ArrowLeft' ? -1 : 1));
    }
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(image) {
    lightboxImg.src = image.currentSrc || image.src;
    lightboxImg.alt = image.alt;
    lightbox.showModal();
}

function closeLightbox() {
    lightbox.close();
}

lightbox.addEventListener('click', (event) => {
    if (event.target !== lightbox) return;

    const bounds = lightbox.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
        closeLightbox();
    }
});

const backToTop = document.getElementById('backToTop');

function updateBackToTop() {
    backToTop.hidden = window.scrollY <= 300;
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
updateBackToTop();

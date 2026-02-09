// ===== Brand Standards Guide Page Viewer =====
const bsgPages = 16;
let currentPage = 1;

const bsgImage = document.getElementById('bsg-image');
const bsgCurrent = document.getElementById('bsg-current');
const bsgPrev = document.getElementById('bsg-prev');
const bsgNext = document.getElementById('bsg-next');
const bsgThumbnails = document.getElementById('bsg-thumbnails');

function getBsgSrc(page) {
    const num = String(page).padStart(2, '0');
    return "Pics/BSG_Folder/Watt's Gaming Brand Guide font outline-" + num + ".jpg";
}

function updateBsg(page) {
    currentPage = page;
    bsgImage.src = getBsgSrc(page);
    bsgImage.alt = 'Brand Standards Guide Page ' + page;
    bsgCurrent.textContent = page;
    bsgPrev.disabled = page === 1;
    bsgNext.disabled = page === bsgPages;

    document.querySelectorAll('.bsg-thumb').forEach(function (thumb, i) {
        thumb.classList.toggle('active', i + 1 === page);
    });
}

// Build thumbnails
for (var i = 1; i <= bsgPages; i++) {
    var thumb = document.createElement('div');
    thumb.className = 'bsg-thumb' + (i === 1 ? ' active' : '');
    thumb.dataset.page = i;

    var img = document.createElement('img');
    img.src = getBsgSrc(i);
    img.alt = 'Page ' + i;
    img.loading = 'lazy';

    thumb.appendChild(img);
    thumb.addEventListener('click', function () {
        updateBsg(parseInt(this.dataset.page));
    });
    bsgThumbnails.appendChild(thumb);
}

bsgPrev.addEventListener('click', function () {
    if (currentPage > 1) updateBsg(currentPage - 1);
});

bsgNext.addEventListener('click', function () {
    if (currentPage < bsgPages) updateBsg(currentPage + 1);
});

// Keyboard navigation for BSG
document.addEventListener('keydown', function (e) {
    if (document.getElementById('lightbox').classList.contains('active')) return;
    if (e.key === 'ArrowLeft' && currentPage > 1) updateBsg(currentPage - 1);
    if (e.key === 'ArrowRight' && currentPage < bsgPages) updateBsg(currentPage + 1);
});

// ===== Lightbox =====
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');

function openLightbox(imgElement) {
    lightboxImg.src = imgElement.src;
    lightboxImg.alt = imgElement.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
});

// ===== Back to Top Button =====
var backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== Smooth reveal on scroll =====
var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.project-card, .gallery-item, .project-subsection').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
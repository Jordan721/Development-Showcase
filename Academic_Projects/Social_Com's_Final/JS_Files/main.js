/**
 * Social Com's - Main JavaScript
 * A Privacy-Focused Social Media Platform
 */

// ============================================
// DOM Ready
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initModals();
    initScrollReveal();
    initCounters();
    initNavbarScroll();
});

// ============================================
// Navigation
// ============================================

function initNavbar() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (!navToggle || !navMenu) return;

    // Toggle mobile menu
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

        // Update icon
        const icon = navToggle.querySelector('i');
        if (icon) {
            icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        }
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            const icon = navToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            const icon = navToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            const icon = navToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    });
}

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ============================================
// Modals
// ============================================

function initModals() {
    // Login Modal
    const loginModal = document.getElementById('loginModal');
    const openLoginBtns = document.querySelectorAll('#openLoginBtn, #openLoginBtn2');
    const closeLoginBtns = document.querySelectorAll('#closeLoginBtn, #cancelLoginBtn');

    openLoginBtns.forEach(btn => {
        btn?.addEventListener('click', () => openModal(loginModal));
    });

    closeLoginBtns.forEach(btn => {
        btn?.addEventListener('click', () => closeModal(loginModal));
    });

    // About Modal
    const aboutModal = document.getElementById('aboutModal');
    const openAboutBtn = document.getElementById('openAboutBtn');
    const closeAboutBtns = document.querySelectorAll('#closeAboutBtn, #closeAboutBtn2');

    openAboutBtn?.addEventListener('click', () => openModal(aboutModal));

    closeAboutBtns.forEach(btn => {
        btn?.addEventListener('click', () => closeModal(aboutModal));
    });

    // Close modals when clicking on overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                closeModal(modal);
            });
        }
    });
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// Scroll Reveal Animations
// ============================================

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length === 0) return;

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const revealPoint = 150;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };

    // Initial check
    revealOnScroll();

    // Check on scroll
    window.addEventListener('scroll', revealOnScroll);
}

// ============================================
// Animated Counters
// ============================================

function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    if (counters.length === 0) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                if (counter.dataset.animated) return;

                animateCounter(counter);
                counter.dataset.animated = 'true';
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;

        if (current < target) {
            element.textContent = formatNumber(Math.ceil(current));
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = formatNumber(target) + '+';
        }
    };

    requestAnimationFrame(updateCounter);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    }
    return num.toString();
}

// ============================================
// Smooth Scroll
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// Utility Functions
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// Page-Specific Initializations
// ============================================

// Account Page - Theme Customization
if (document.getElementById('bgColor')) {
    initThemeCustomization();
}

function initThemeCustomization() {
    const bgColor = document.getElementById('bgColor');
    const textColor = document.getElementById('textColor');
    const accentColor = document.getElementById('accentColor');
    const bgColorValue = document.getElementById('bgColorValue');
    const textColorValue = document.getElementById('textColorValue');
    const accentColorValue = document.getElementById('accentColorValue');
    const resetBtn = document.getElementById('resetTheme');
    const presetBtns = document.querySelectorAll('.preset-btn');

    const defaults = {
        bg: '#667eea',
        text: '#1e293b',
        accent: '#6366f1'
    };

    // Update color values display
    function updateColorDisplay() {
        if (bgColorValue) bgColorValue.textContent = bgColor?.value || defaults.bg;
        if (textColorValue) textColorValue.textContent = textColor?.value || defaults.text;
        if (accentColorValue) accentColorValue.textContent = accentColor?.value || defaults.accent;
    }

    // Apply theme
    function applyTheme(bg, text, accent) {
        document.documentElement.style.setProperty('--user-bg', bg);
        document.documentElement.style.setProperty('--user-text', text);
        document.documentElement.style.setProperty('--user-accent', accent);

        if (bgColor) bgColor.value = bg;
        if (textColor) textColor.value = text;
        if (accentColor) accentColor.value = accent;

        updateColorDisplay();

        // Save to localStorage
        localStorage.setItem('userTheme', JSON.stringify({ bg, text, accent }));
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        applyTheme(theme.bg, theme.text, theme.accent);
    }

    // Color input listeners
    bgColor?.addEventListener('input', () => {
        applyTheme(bgColor.value, textColor?.value || defaults.text, accentColor?.value || defaults.accent);
    });

    textColor?.addEventListener('input', () => {
        applyTheme(bgColor?.value || defaults.bg, textColor.value, accentColor?.value || defaults.accent);
    });

    accentColor?.addEventListener('input', () => {
        applyTheme(bgColor?.value || defaults.bg, textColor?.value || defaults.text, accentColor.value);
    });

    // Reset button
    resetBtn?.addEventListener('click', () => {
        applyTheme(defaults.bg, defaults.text, defaults.accent);
    });

    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const bg = btn.dataset.bg;
            const text = btn.dataset.text;
            const accent = btn.dataset.accent;
            applyTheme(bg, text, accent);
        });
    });

    updateColorDisplay();
}

// Account Page - File Upload
if (document.getElementById('fileUploadArea')) {
    initFileUpload();
}

function initFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('eventFileInput');
    const fileList = document.getElementById('fileList');

    if (!fileUploadArea || !fileInput || !fileList) return;

    // Click to upload
    fileUploadArea.addEventListener('click', () => fileInput.click());

    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    // File input change
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        fileList.innerHTML = '';

        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            `;
            fileList.appendChild(fileItem);
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Messages Page
if (document.getElementById('conversationsList')) {
    initMessages();
}

function initMessages() {
    const conversationsList = document.getElementById('conversationsList');
    const chatContainer = document.querySelector('.chat-container');
    const emptyState = document.querySelector('.empty-state');
    const chatMessages = document.getElementById('chatMessages');
    const chatUserName = document.getElementById('chatUserName');
    const chatUserStatus = document.getElementById('chatUserStatus');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const searchInput = document.getElementById('searchConversations');

    // Sample conversations data
    const conversations = [
        {
            id: 1,
            name: 'Sarah Johnson',
            lastMessage: 'That sounds great! Let me know when...',
            time: '2m ago',
            unread: 2,
            online: true,
            messages: [
                { from: 'them', text: 'Hey! How are you doing?', time: '10:30 AM' },
                { from: 'me', text: 'I\'m doing great, thanks! How about you?', time: '10:32 AM' },
                { from: 'them', text: 'Pretty good! Working on some new projects.', time: '10:35 AM' },
                { from: 'them', text: 'That sounds great! Let me know when you\'re free to catch up.', time: '10:36 AM' }
            ]
        },
        {
            id: 2,
            name: 'Mike Chen',
            lastMessage: 'Thanks for sharing that article!',
            time: '1h ago',
            unread: 0,
            online: true,
            messages: [
                { from: 'me', text: 'Check out this article about privacy tech!', time: '9:00 AM' },
                { from: 'them', text: 'Thanks for sharing that article!', time: '9:45 AM' }
            ]
        },
        {
            id: 3,
            name: 'Alex Rivera',
            lastMessage: 'See you at the meetup!',
            time: '3h ago',
            unread: 0,
            online: false,
            messages: [
                { from: 'them', text: 'Are you coming to the tech meetup tomorrow?', time: 'Yesterday' },
                { from: 'me', text: 'Yes, I\'ll be there!', time: 'Yesterday' },
                { from: 'them', text: 'See you at the meetup!', time: 'Yesterday' }
            ]
        },
        {
            id: 4,
            name: 'Jordan Smith',
            lastMessage: 'The new update looks amazing!',
            time: '1d ago',
            unread: 0,
            online: false,
            messages: [
                { from: 'them', text: 'Have you seen the new Social Com\'s update?', time: '2 days ago' },
                { from: 'me', text: 'Just updated! The new features are great.', time: '2 days ago' },
                { from: 'them', text: 'The new update looks amazing!', time: '1 day ago' }
            ]
        }
    ];

    // Render conversations
    function renderConversations(filter = '') {
        if (!conversationsList) return;

        conversationsList.innerHTML = '';

        const filtered = conversations.filter(c =>
            c.name.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.dataset.id = conv.id;
            item.innerHTML = `
                <div class="conv-avatar ${conv.online ? 'online' : ''}">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="conv-info">
                    <h4>${conv.name}</h4>
                    <p>${conv.lastMessage}</p>
                </div>
                <div class="conv-meta">
                    <span class="conv-time">${conv.time}</span>
                    ${conv.unread ? `<span class="conv-unread">${conv.unread}</span>` : ''}
                </div>
            `;

            item.addEventListener('click', () => openConversation(conv));
            conversationsList.appendChild(item);
        });
    }

    // Open conversation
    function openConversation(conv) {
        if (!chatContainer || !emptyState) return;

        // Update UI
        emptyState.style.display = 'none';
        chatContainer.style.display = 'flex';

        if (chatUserName) chatUserName.textContent = conv.name;
        if (chatUserStatus) chatUserStatus.textContent = conv.online ? 'Online' : 'Offline';

        // Mark conversation as active
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.id) === conv.id) {
                item.classList.add('active');
            }
        });

        // Render messages
        renderMessages(conv.messages);
    }

    // Render messages
    function renderMessages(messages) {
        if (!chatMessages) return;

        chatMessages.innerHTML = '';

        messages.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = `message ${msg.from === 'me' ? 'sent' : 'received'}`;
            msgEl.innerHTML = `
                <div class="message-content">
                    <p>${msg.text}</p>
                    <span class="message-time">${msg.time}</span>
                </div>
            `;
            chatMessages.appendChild(msgEl);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message
    function sendMessage() {
        if (!messageInput || !messageInput.value.trim()) return;

        const activeConv = document.querySelector('.conversation-item.active');
        if (!activeConv) return;

        const convId = parseInt(activeConv.dataset.id);
        const conv = conversations.find(c => c.id === convId);
        if (!conv) return;

        const newMessage = {
            from: 'me',
            text: messageInput.value.trim(),
            time: 'Just now'
        };

        conv.messages.push(newMessage);
        renderMessages(conv.messages);
        messageInput.value = '';
    }

    // Event listeners
    sendMessageBtn?.addEventListener('click', sendMessage);

    messageInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    searchInput?.addEventListener('input', (e) => {
        renderConversations(e.target.value);
    });

    // Initial render
    renderConversations();
}

// Feed Page - Like functionality
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.querySelector('.fa-heart')) {
            this.classList.toggle('liked');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fas');
                icon.classList.toggle('far');
            }
        }
    });
});

// Console branding
console.log(
    '%c Social Com\'s %c Privacy-Focused Social Media ',
    'background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px 0 0 5px;',
    'background: #1a1a2e; color: #a5b4fc; padding: 10px 20px; font-size: 16px; border-radius: 0 5px 5px 0;'
);

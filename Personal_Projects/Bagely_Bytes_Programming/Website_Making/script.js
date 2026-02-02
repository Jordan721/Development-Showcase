// Website Making - Interactive Learning Script

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Playground - Interactive Div Sandbox

    const playgroundArea = document.getElementById('playgroundArea');
    const addDivBtn = document.getElementById('addDiv');
    const clearAllBtn = document.getElementById('clearAll');
    const layoutBtns = document.querySelectorAll('.layout-btn');
    const colorPicker = document.getElementById('boxColor');
    const generatedCode = document.getElementById('generatedCode');
    const copyCodeBtn = document.getElementById('copyCode');
    const layoutExplanation = document.getElementById('layoutExplanation');

    let boxCounter = 2; // Starting count based on initial boxes
    let currentLayout = 'normal';
    let isDragging = false;
    let isResizing = false;
    let currentBox = null;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    // Layout explanations
    const layoutExplanations = {
        normal: {
            title: 'Normal Flow',
            text: 'Elements stack based on their display type. Block elements (like divs) stack vertically. In this mode, boxes are positioned absolutely so you can drag them anywhere.'
        },
        flex: {
            title: 'Flexbox Layout',
            text: 'Flexbox arranges items in a row (or column) and handles spacing automatically. Items wrap to the next line when space runs out. Great for navigation bars and card layouts!'
        },
        grid: {
            title: 'CSS Grid Layout',
            text: 'Grid creates a two-dimensional layout with rows and columns. Items automatically fill available cells. Perfect for complex layouts like dashboards and galleries!'
        }
    };

    // Generate random color variation

    function getRandomColor() {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Create a new playground box
    function createBox(width = 100, height = 100, color = null) {
        const box = document.createElement('div');
        box.className = 'playground-box';
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
        box.style.background = color || colorPicker.value;

        if (currentLayout === 'normal') {
            box.style.left = `${20 + (boxCounter % 3) * 30}px`;
            box.style.top = `${20 + Math.floor(boxCounter / 3) * 30}px`;
        }

        box.innerHTML = `
            <span class="box-size">${width} x ${height}</span>
            <button class="box-remove"><i class="fas fa-times"></i></button>
            <div class="resize-handle"></div>
        `;

        // Remove button handler

        box.querySelector('.box-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            box.remove();
            updateGeneratedCode();
        });

        // Dragging (only in normal layout)
        box.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle') || e.target.closest('.box-remove')) return;
            if (currentLayout !== 'normal') return;

            isDragging = true;
            currentBox = box;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(box.style.left) || 0;
            startTop = parseInt(box.style.top) || 0;
            box.style.zIndex = '10';
        });

        // Resizing

        box.querySelector('.resize-handle').addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            currentBox = box;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(box.style.width);
            startHeight = parseInt(box.style.height);
        });

        playgroundArea.appendChild(box);
        boxCounter++;
        updateGeneratedCode();
    }

    // Mouse move handler

    document.addEventListener('mousemove', (e) => {
        if (isDragging && currentBox) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            currentBox.style.left = `${startLeft + dx}px`;
            currentBox.style.top = `${startTop + dy}px`;
        }

        if (isResizing && currentBox) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newWidth = Math.max(50, startWidth + dx);
            const newHeight = Math.max(50, startHeight + dy);
            currentBox.style.width = `${newWidth}px`;
            currentBox.style.height = `${newHeight}px`;
            currentBox.querySelector('.box-size').textContent = `${Math.round(newWidth)} x ${Math.round(newHeight)}`;
            updateGeneratedCode();
        }
    });

    // Mouse up handler

    document.addEventListener('mouseup', () => {
        if (isDragging && currentBox) {
            currentBox.style.zIndex = '1';
            updateGeneratedCode();
        }
        isDragging = false;
        isResizing = false;
        currentBox = null;
    });

    // Add box button
    addDivBtn.addEventListener('click', () => {
        const size = 80 + Math.floor(Math.random() * 70);
        createBox(size, size, getRandomColor());
    });

    // Clear all button

    clearAllBtn.addEventListener('click', () => {
        playgroundArea.innerHTML = '';
        boxCounter = 0;
        updateGeneratedCode();
    });

    // Layout switcher

    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            layoutBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLayout = btn.dataset.layout;

            // Update playground classes
            playgroundArea.classList.remove('flex-layout', 'grid-layout');
            if (currentLayout === 'flex') {
                playgroundArea.classList.add('flex-layout');
            } else if (currentLayout === 'grid') {
                playgroundArea.classList.add('grid-layout');
            }

            // Reset box positions for normal layout
            if (currentLayout === 'normal') {
                const boxes = playgroundArea.querySelectorAll('.playground-box');
                boxes.forEach((box, i) => {
                    box.style.left = `${20 + (i % 4) * 40}px`;
                    box.style.top = `${20 + Math.floor(i / 4) * 40}px`;
                });
            }

            // Update explanation
            const explanation = layoutExplanations[currentLayout];
            layoutExplanation.innerHTML = `
                <div class="explanation-content">
                    <h4><i class="fas fa-info-circle"></i> ${explanation.title}</h4>
                    <p>${explanation.text}</p>
                </div>
            `;

            updateGeneratedCode();
        });
    });

    // Generate code output

    function updateGeneratedCode() {
        const boxes = playgroundArea.querySelectorAll('.playground-box');
        let html = '<!-- HTML -->\n<div class="container">\n';
        let css = '\n/* CSS */\n.container {\n';

        // Add layout-specific CSS
        if (currentLayout === 'flex') {
            css += '  display: flex;\n  flex-wrap: wrap;\n  gap: 15px;\n';
        } else if (currentLayout === 'grid') {
            css += '  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));\n  gap: 15px;\n';
        }
        css += '}\n\n';

        boxes.forEach((box, i) => {
            const width = parseInt(box.style.width);
            const height = parseInt(box.style.height);
            const color = box.style.background;

            html += `  <div class="box-${i + 1}"></div>\n`;
            css += `.box-${i + 1} {\n  width: ${width}px;\n  height: ${height}px;\n  background: ${color};\n  border-radius: 8px;\n}\n\n`;
        });

        html += '</div>';
        generatedCode.textContent = html + '\n' + css;
    }

    // Copy code button

    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedCode.textContent).then(() => {
            copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
    });

    // Initialize existing boxes with event handlers

    document.querySelectorAll('.playground-box').forEach(box => {
        box.querySelector('.box-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            box.remove();
            updateGeneratedCode();
        });

        box.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle') || e.target.closest('.box-remove')) return;
            if (currentLayout !== 'normal') return;

            isDragging = true;
            currentBox = box;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(box.style.left) || 0;
            startTop = parseInt(box.style.top) || 0;
            box.style.zIndex = '10';
        });

        box.querySelector('.resize-handle').addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            currentBox = box;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(box.style.width);
            startHeight = parseInt(box.style.height);
        });
    });

    // Initial code generation

    updateGeneratedCode();

    // File Toggle Demo

    const toggleHTML = document.getElementById('toggleHTML');
    const toggleCSS = document.getElementById('toggleCSS');
    const toggleJS = document.getElementById('toggleJS');
    const demoPreview = document.getElementById('demoPreview');
    const demoCard = demoPreview.querySelector('.demo-card');
    const demoBtn = document.getElementById('demoBtn');
    const demoCounter = document.getElementById('demoCounter');

    let clickCount = 0;

    // Demo button click

    demoBtn.addEventListener('click', () => {
        if (!toggleJS.checked) return;
        clickCount++;
        demoCounter.textContent = `Clicks: ${clickCount}`;

        // Fun animation

        demoBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            demoBtn.style.transform = 'scale(1)';
        }, 100);
    });

    // Toggle handlers

    function updateDemoPreview() {
        // HTML toggle

        if (!toggleHTML.checked) {
            demoCard.classList.add('no-html');
        } else {
            demoCard.classList.remove('no-html');
        }

        // CSS toggle
        if (!toggleCSS.checked) {
            demoCard.classList.add('no-css');
        } else {
            demoCard.classList.remove('no-css');
        }

        // JS toggle
        if (!toggleJS.checked) {
            demoBtn.classList.add('no-js');
            demoCounter.style.opacity = '0.3';
        } else {
            demoBtn.classList.remove('no-js');
            demoCounter.style.opacity = '1';
        }
    }

    toggleHTML.addEventListener('change', updateDemoPreview);
    toggleCSS.addEventListener('change', updateDemoPreview);
    toggleJS.addEventListener('change', updateDemoPreview);

    // Challenges
    const completedChallenges = new Set();

    // Challenge 1: Size It
    const c1Width = document.getElementById('c1Width');
    const c1Height = document.getElementById('c1Height');
    const challenge1Box = document.getElementById('challenge1Box');

    function updateChallenge1() {
        const width = parseInt(c1Width.value) || 100;
        const height = parseInt(c1Height.value) || 100;
        challenge1Box.style.width = `${width}px`;
        challenge1Box.style.height = `${height}px`;
    }

    c1Width.addEventListener('input', updateChallenge1);
    c1Height.addEventListener('input', updateChallenge1);
    updateChallenge1();

    // Challenge 2: Stack 'Em
    const c2Display = document.getElementById('c2Display');
    const c2Direction = document.getElementById('c2Direction');
    const challenge2Preview = document.getElementById('challenge2Preview');

    c2Display.addEventListener('change', () => {
        c2Direction.disabled = c2Display.value !== 'flex';
        updateChallenge2();
    });

    c2Direction.addEventListener('change', updateChallenge2);

    function updateChallenge2() {
        challenge2Preview.style.display = c2Display.value;
        challenge2Preview.classList.remove('flex-column');

        if (c2Display.value === 'flex' && c2Direction.value === 'column') {
            challenge2Preview.classList.add('flex-column');
        }
    }

    // Challenge 3: Grid Master
    const c3Display = document.getElementById('c3Display');
    const c3Columns = document.getElementById('c3Columns');
    const challenge3Preview = document.getElementById('challenge3Preview');

    c3Display.addEventListener('change', () => {
        c3Columns.disabled = c3Display.value !== 'grid';
        updateChallenge3();
    });

    c3Columns.addEventListener('change', updateChallenge3);

    function updateChallenge3() {
        challenge3Preview.style.display = c3Display.value;
        challenge3Preview.classList.remove('grid-2x2');

        if (c3Display.value === 'grid' && c3Columns.value === '1fr 1fr') {
            challenge3Preview.classList.add('grid-2x2');
            challenge3Preview.style.gridTemplateColumns = '1fr 1fr';
        } else if (c3Display.value === 'grid') {
            challenge3Preview.style.gridTemplateColumns = c3Columns.value;
        }
    }

    // Check buttons
    document.querySelectorAll('.check-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const challengeNum = btn.dataset.challenge;
            const feedback = document.getElementById(`feedback${challengeNum}`);
            let isCorrect = false;

            if (challengeNum === '1') {
                const width = parseInt(c1Width.value);
                const height = parseInt(c1Height.value);
                isCorrect = width === 200 && height === 100;
            } else if (challengeNum === '2') {
                isCorrect = c2Display.value === 'flex' && c2Direction.value === 'column';
            } else if (challengeNum === '3') {
                isCorrect = c3Display.value === 'grid' && c3Columns.value === '1fr 1fr';
            }

            if (isCorrect) {
                feedback.className = 'challenge-feedback success';
                feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct! Great job!';
                completedChallenges.add(challengeNum);
                document.querySelector(`[data-challenge="${challengeNum}"]`).classList.add('completed');

                // Confetti effect
                createConfetti(btn);

                // Check if all completed
                if (completedChallenges.size === 3) {
                    document.getElementById('completionMessage').classList.add('show');
                }
            } else {
                feedback.className = 'challenge-feedback error';
                feedback.innerHTML = '<i class="fas fa-times-circle"></i> Not quite right. Try again!';
            }
        });
    });

    // Hint buttons
    document.querySelectorAll('.hint-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const challengeNum = btn.dataset.challenge;
            const hint = document.getElementById(`hint${challengeNum}`);
            hint.classList.toggle('show');
        });
    });

    // Simple confetti effect
    function createConfetti(element) {
        const colors = ['#FF6B35', '#6B5CE7', '#2EC4B6', '#FFD23F', '#FF6B9D'];
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top}px;
                pointer-events: none;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                z-index: 9999;
            `;
            document.body.appendChild(confetti);

            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = 5 + Math.random() * 10;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - 10;

            let x = 0,
                y = 0,
                rotation = 0;
            const gravity = 0.5;
            let currentVy = vy;

            const animate = () => {
                x += vx;
                currentVy += gravity;
                y += currentVy;
                rotation += 10;

                confetti.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
                confetti.style.opacity = Math.max(0, 1 - y / 300);

                if (y < 300) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

    // Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
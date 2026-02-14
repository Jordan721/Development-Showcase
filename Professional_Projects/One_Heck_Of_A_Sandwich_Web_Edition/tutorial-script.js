// Progress tracking
let currentStep = 0;
let totalSteps = 4;

// Game state
let gameActive = false;
let gameScore = 0;
let gameTimer = 60;
let ordersCompleted = 0;
let currentCustomerOrder = null;
let playerSandwich = {
    size: null,
    bread: null,
    meat: null,
    cheese: null,
    toasted: null
};
let timerInterval = null;

// Game data
const gameOptions = {
    sizes: ['4', '8', '12'],
    breads: ['White', 'Wheat', 'Rye', 'Wrap'],
    meats: ['Turkey', 'Ham', 'Bacon', 'Salami', 'Chicken'],
    cheeses: ['Cheddar', 'Swiss', 'Provolone', 'American']
};

const customerAvatars = ['🧑', '👨', '👩', '🧔', '👴', '👵', '🧑‍🦱', '👨‍🦰'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    initializeGameButtons();
});

// Progress functions
function updateProgress() {
    const percentage = (currentStep / totalSteps) * 100;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = Math.round(percentage) + '% Complete';
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

// Navigation functions
function startJourney() {
    currentStep = 1;
    updateProgress();
    showSection('step-1');
}

function nextStep(stepNumber) {
    currentStep = stepNumber;
    updateProgress();
    showSection('step-' + stepNumber);
}

// Code comparison tabs
function showComparison(type) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Remove active from all comparisons
    document.querySelectorAll('.comparison-container').forEach(container => {
        container.classList.remove('active');
    });

    // Activate clicked tab
    event.target.classList.add('active');

    // Show corresponding comparison
    document.getElementById('comparison-' + type).classList.add('active');
}

// Game unlock
function startGame() {
    currentStep = 4;
    updateProgress();
    showSection('game');
}

function skipToKiosk() {
    window.location.href = 'index.html';
}

// Game initialization
function initializeGameButtons() {
    // Create size buttons
    const sizesContainer = document.getElementById('game-sizes');
    if (sizesContainer) {
        gameOptions.sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.className = 'quick-btn';
            btn.setAttribute('data-value', size);
            btn.textContent = size + '"';
            btn.onclick = () => selectGameOption('size', size);
            sizesContainer.appendChild(btn);
        });
    }

    // Create bread buttons
    const breadsContainer = document.getElementById('game-breads');
    if (breadsContainer) {
        gameOptions.breads.forEach(bread => {
            const btn = document.createElement('button');
            btn.className = 'quick-btn';
            btn.setAttribute('data-value', bread);
            btn.textContent = bread;
            btn.onclick = () => selectGameOption('bread', bread);
            breadsContainer.appendChild(btn);
        });
    }

    // Create meat buttons
    const meatsContainer = document.getElementById('game-meats');
    if (meatsContainer) {
        gameOptions.meats.forEach(meat => {
            const btn = document.createElement('button');
            btn.className = 'quick-btn';
            btn.setAttribute('data-value', meat);
            btn.textContent = meat;
            btn.onclick = () => selectGameOption('meat', meat);
            meatsContainer.appendChild(btn);
        });
    }

    // Create cheese buttons
    const cheesesContainer = document.getElementById('game-cheeses');
    if (cheesesContainer) {
        gameOptions.cheeses.forEach(cheese => {
            const btn = document.createElement('button');
            btn.className = 'quick-btn';
            btn.setAttribute('data-value', cheese);
            btn.textContent = cheese;
            btn.onclick = () => selectGameOption('cheese', cheese);
            cheesesContainer.appendChild(btn);
        });
    }
}

function selectGameOption(category, value) {
    // Update player sandwich
    playerSandwich[category] = value;

    // Update UI
    const container = document.getElementById('game-' + category + 's') || event.target.parentElement;
    container.querySelectorAll('.quick-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');

    // Check if sandwich is complete
    checkSandwichComplete();
}

function checkSandwichComplete() {
    const isComplete = playerSandwich.size &&
                      playerSandwich.bread &&
                      playerSandwich.meat &&
                      playerSandwich.cheese &&
                      playerSandwich.toasted !== null;

    document.getElementById('submit-order-btn').disabled = !isComplete;
}

// Game logic
function startGameRound() {
    gameActive = true;
    gameScore = 0;
    gameTimer = 60;
    ordersCompleted = 0;

    // Hide start button
    document.getElementById('start-game-btn').style.display = 'none';

    // Update displays
    updateGameDisplay();

    // Start timer
    timerInterval = setInterval(() => {
        gameTimer--;
        updateGameDisplay();

        if (gameTimer <= 0) {
            endGame(false);
        }
    }, 1000);

    // Generate first order
    generateNewOrder();
}

function updateGameDisplay() {
    document.getElementById('score').textContent = gameScore;
    document.getElementById('timer').textContent = gameTimer;
    document.getElementById('orders-completed').textContent = ordersCompleted;
}

function generateNewOrder() {
    // Reset player sandwich
    playerSandwich = {
        size: null,
        bread: null,
        meat: null,
        cheese: null,
        toasted: null
    };

    // Clear selections
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('submit-order-btn').disabled = true;

    // Generate random order
    currentCustomerOrder = {
        size: gameOptions.sizes[Math.floor(Math.random() * gameOptions.sizes.length)],
        bread: gameOptions.breads[Math.floor(Math.random() * gameOptions.breads.length)],
        meat: gameOptions.meats[Math.floor(Math.random() * gameOptions.meats.length)],
        cheese: gameOptions.cheeses[Math.floor(Math.random() * gameOptions.cheeses.length)],
        toasted: Math.random() > 0.5 ? 'yes' : 'no',
        timestamp: Date.now()
    };

    // Update customer avatar
    const randomAvatar = customerAvatars[Math.floor(Math.random() * customerAvatars.length)];
    document.getElementById('customer-avatar').textContent = randomAvatar;

    // Update request
    const toastedText = currentCustomerOrder.toasted === 'yes' ? 'TOASTED' : 'NOT toasted';
    document.getElementById('customer-request').textContent =
        `I'd like a ${currentCustomerOrder.size}" sandwich, please!`;

    // Update requirements
    const requirementsHTML = `
        <div class="requirement" id="req-size">
            <span>Size: ${currentCustomerOrder.size}"</span>
            <span>⏳</span>
        </div>
        <div class="requirement" id="req-bread">
            <span>Bread: ${currentCustomerOrder.bread}</span>
            <span>⏳</span>
        </div>
        <div class="requirement" id="req-meat">
            <span>Meat: ${currentCustomerOrder.meat}</span>
            <span>⏳</span>
        </div>
        <div class="requirement" id="req-cheese">
            <span>Cheese: ${currentCustomerOrder.cheese}</span>
            <span>⏳</span>
        </div>
        <div class="requirement" id="req-toasted">
            <span>${toastedText}</span>
            <span>⏳</span>
        </div>
    `;
    document.getElementById('order-requirements').innerHTML = requirementsHTML;
}

function submitGameOrder() {
    if (!gameActive) return;

    // Calculate time bonus (faster = more points)
    const timeElapsed = (Date.now() - currentCustomerOrder.timestamp) / 1000;
    let timeBonus = Math.max(0, Math.floor((10 - timeElapsed) * 10));

    // Check accuracy
    let correct = 0;
    let total = 5;

    if (playerSandwich.size === currentCustomerOrder.size) {
        correct++;
        document.getElementById('req-size').classList.add('correct');
    }
    if (playerSandwich.bread === currentCustomerOrder.bread) {
        correct++;
        document.getElementById('req-bread').classList.add('correct');
    }
    if (playerSandwich.meat === currentCustomerOrder.meat) {
        correct++;
        document.getElementById('req-meat').classList.add('correct');
    }
    if (playerSandwich.cheese === currentCustomerOrder.cheese) {
        correct++;
        document.getElementById('req-cheese').classList.add('correct');
    }
    if (playerSandwich.toasted === currentCustomerOrder.toasted) {
        correct++;
        document.getElementById('req-toasted').classList.add('correct');
    }

    // Calculate score
    const accuracyPoints = correct * 20;
    const orderScore = accuracyPoints + timeBonus;
    gameScore += orderScore;

    // Show feedback briefly
    setTimeout(() => {
        ordersCompleted++;
        updateGameDisplay();

        // Check if game won
        if (ordersCompleted >= 5) {
            endGame(true);
        } else {
            generateNewOrder();
        }
    }, 1000);
}

function endGame(won) {
    gameActive = false;
    clearInterval(timerInterval);

    // Show results
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const finalScore = document.getElementById('final-score');

    finalScore.textContent = gameScore;

    if (won) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = 'Congratulations!';
        resultMessage.textContent = `You completed all 5 orders! You've mastered the sandwich-building flow. This is exactly how the web version improves on the CLI - instant visual feedback and interactive controls make the experience so much better!`;
    } else {
        resultIcon.textContent = '⏰';
        resultTitle.textContent = 'Time\'s Up!';
        resultMessage.textContent = `You completed ${ordersCompleted} orders and scored ${gameScore} points! The speed challenge shows how a good UI needs to be both fast and accurate - just like good code!`;
    }

    showSection('game-over');
}

function playAgain() {
    showSection('game');
    document.getElementById('start-game-btn').style.display = 'block';
}

function goToKiosk() {
    window.location.href = 'index.html';
}

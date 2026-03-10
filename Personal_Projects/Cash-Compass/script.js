// === Data Structure ===
const categories = {
    income: [{
            name: 'Salary',
            icon: 'fa-briefcase'
        },
        {
            name: 'Freelance',
            icon: 'fa-laptop-code'
        },
        {
            name: 'Investment',
            icon: 'fa-chart-line'
        },
        {
            name: 'Gift',
            icon: 'fa-gift'
        },
        {
            name: 'Other Income',
            icon: 'fa-money-bill-wave'
        }
    ],
    expense: [{
            name: 'Housing',
            icon: 'fa-home'
        },
        {
            name: 'Transportation',
            icon: 'fa-car'
        },
        {
            name: 'Food & Dining',
            icon: 'fa-utensils'
        },
        {
            name: 'Groceries',
            icon: 'fa-shopping-cart'
        },
        {
            name: 'Entertainment',
            icon: 'fa-film'
        },
        {
            name: 'Healthcare',
            icon: 'fa-heartbeat'
        },
        {
            name: 'Utilities',
            icon: 'fa-bolt'
        },
        {
            name: 'Shopping',
            icon: 'fa-shopping-bag'
        },
        {
            name: 'Education',
            icon: 'fa-graduation-cap'
        },
        {
            name: 'Other Expense',
            icon: 'fa-receipt'
        }
    ]
};

// === Chart Colors (matching new theme) ===
const chartColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#3b82f6'
];

// === State Management ===
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
let expenseChart = null;
let trendChart = null;

// === DOM Elements ===
const transactionForm = document.getElementById('transactionForm');
const transactionType = document.getElementById('transactionType');
const transactionCategory = document.getElementById('transactionCategory');
const transactionAmount = document.getElementById('transactionAmount');
const transactionDate = document.getElementById('transactionDate');
const transactionDescription = document.getElementById('transactionDescription');
const transactionsList = document.getElementById('transactionsList');
const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const darkModeToggle = document.getElementById('darkModeToggle');
const exportBtn = document.getElementById('exportBtn');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const budgetModal = document.getElementById('budgetModal');
const exportModal = document.getElementById('exportModal');
const aboutModal = document.getElementById('aboutModal');
const closeBudgetModal = document.getElementById('closeBudgetModal');
const closeExportModal = document.getElementById('closeExportModal');
const closeAboutModal = document.getElementById('closeAboutModal');
const budgetForm = document.getElementById('budgetForm');
const budgetInputs = document.getElementById('budgetInputs');
const exportCSV = document.getElementById('exportCSV');
const exportJSON = document.getElementById('exportJSON');
const sampleDataBtn = document.getElementById('sampleDataBtn');
const aboutBtn = document.getElementById('aboutBtn');
const backBtn = document.getElementById('backBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set today's date as default
    transactionDate.value = new Date().toISOString().split('T')[0];

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // Populate category dropdowns
    updateCategoryOptions();
    populateFilterCategories();

    // Render everything
    updateDashboard();
    renderTransactions();
    createCharts();
    renderBudgets();

    // Event listeners
    attachEventListeners();
}

function attachEventListeners() {
    transactionForm.addEventListener('submit', handleAddTransaction);
    transactionType.addEventListener('change', updateCategoryOptions);
    filterType.addEventListener('change', renderTransactions);
    filterCategory.addEventListener('change', renderTransactions);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    exportBtn.addEventListener('click', () => exportModal.classList.add('active'));
    closeExportModal.addEventListener('click', () => exportModal.classList.remove('active'));
    exportCSV.addEventListener('click', exportToCSV);
    exportJSON.addEventListener('click', exportToJSON);
    setBudgetBtn.addEventListener('click', openBudgetModal);
    closeBudgetModal.addEventListener('click', () => budgetModal.classList.remove('active'));
    budgetForm.addEventListener('submit', handleSetBudgets);

    // New button listeners
    if (sampleDataBtn) sampleDataBtn.addEventListener('click', toggleSampleData);
    if (aboutBtn) aboutBtn.addEventListener('click', () => aboutModal.classList.add('active'));
    if (closeAboutModal) closeAboutModal.addEventListener('click', () => aboutModal.classList.remove('active'));
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = '../../index.html');
    if (clearAllBtn) clearAllBtn.addEventListener('click', handleClearAll);

    // Close modals on outside click
    budgetModal.addEventListener('click', (e) => {
        if (e.target === budgetModal) budgetModal.classList.remove('active');
    });
    exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) exportModal.classList.remove('active');
    });
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) aboutModal.classList.remove('active');
    });
}

// === Category Management ===
function updateCategoryOptions() {
    const type = transactionType.value;
    const categoryList = categories[type];

    transactionCategory.innerHTML = '';
    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        transactionCategory.appendChild(option);
    });
}

function populateFilterCategories() {
    const allCategories = [...categories.income, ...categories.expense];
    filterCategory.innerHTML = '<option value="all">All Categories</option>';

    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        filterCategory.appendChild(option);
    });
}

function getCategoryIcon(categoryName) {
    const allCategories = [...categories.income, ...categories.expense];
    const category = allCategories.find(cat => cat.name === categoryName);
    return category ? category.icon : 'fa-circle';
}

// === Transaction Management ===
function handleAddTransaction(e) {
    e.preventDefault();

    const transaction = {
        id: Date.now(),
        type: transactionType.value,
        category: transactionCategory.value,
        amount: parseFloat(transactionAmount.value),
        date: transactionDate.value,
        description: transactionDescription.value,
        timestamp: new Date().toISOString()
    };

    transactions.unshift(transaction);
    saveTransactions();

    // Reset form
    transactionForm.reset();
    transactionDate.value = new Date().toISOString().split('T')[0];
    updateCategoryOptions();

    // Update UI
    updateDashboard();
    renderTransactions();
    updateCharts();
    renderBudgets();

    // Show feedback
    showNotification('Transaction added successfully!', 'success');
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDashboard();
        renderTransactions();
        updateCharts();
        renderBudgets();
        showNotification('Transaction deleted', 'info');
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// === Dashboard Calculations ===
function calculateTotals() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

    // Calculate previous month for comparison
    const lastMonth = new Date(currentYear, currentMonth - 1);
    const previousMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === lastMonth.getMonth() &&
            date.getFullYear() === lastMonth.getFullYear();
    });

    const prevIncome = previousMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const prevExpenses = previousMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100) : 0;
    const expenseChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses * 100) : 0;

    return {
        totalIncome,
        totalExpenses,
        netBalance,
        savingsRate,
        incomeChange,
        expenseChange
    };
}

function updateDashboard() {
    const totals = calculateTotals();

    // Update summary cards
    document.getElementById('totalIncome').textContent = formatCurrency(totals.totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totals.totalExpenses);
    document.getElementById('netBalance').textContent = formatCurrency(totals.netBalance);
    document.getElementById('savingsRate').textContent = `${totals.savingsRate.toFixed(1)}%`;

    // Update change indicators
    document.getElementById('incomeChange').textContent = `${Math.abs(totals.incomeChange).toFixed(1)}%`;
    document.getElementById('expenseChange').textContent = `${Math.abs(totals.expenseChange).toFixed(1)}%`;

    // Update balance change
    const balanceChangeEl = document.getElementById('balanceChange');
    const balanceChangeIcon = balanceChangeEl.querySelector('i');
    const balanceChangeText = balanceChangeEl.querySelector('span');

    if (totals.netBalance > 0) {
        balanceChangeEl.className = 'card-change positive';
        balanceChangeIcon.className = 'fas fa-arrow-up';
        balanceChangeText.textContent = 'Positive';
    } else if (totals.netBalance < 0) {
        balanceChangeEl.className = 'card-change negative';
        balanceChangeIcon.className = 'fas fa-arrow-down';
        balanceChangeText.textContent = 'Negative';
    } else {
        balanceChangeEl.className = 'card-change';
        balanceChangeIcon.className = 'fas fa-minus';
        balanceChangeText.textContent = 'Neutral';
    }
}

// === Transaction Rendering ===
function renderTransactions() {
    const typeFilter = filterType.value;
    const categoryFilter = filterCategory.value;

    let filtered = transactions;

    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (filtered.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions found. Try adjusting your filters or add a new transaction!</p>
            </div>
        `;
        return;
    }

    transactionsList.innerHTML = filtered.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${t.type}">
                    <i class="fas ${getCategoryIcon(t.category)}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${t.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-category">
                            <i class="fas fa-tag"></i>
                            ${t.category}
                        </span>
                        <span class="transaction-date">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(t.date)}
                        </span>
                    </div>
                </div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
            </div>
            <div class="transaction-actions">
                <button class="btn-small delete" onclick="deleteTransaction(${t.id})" aria-label="Delete transaction">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// === Charts ===
function createCharts() {
    createExpenseChart();
    createTrendChart();
}

function updateCharts() {
    if (expenseChart) expenseChart.destroy();
    if (trendChart) trendChart.destroy();
    createCharts();
}

function createExpenseChart() {
    let canvas = document.getElementById('expenseChart');

    // If canvas doesn't exist or was replaced, we need to restore it
    if (!canvas || canvas.tagName !== 'CANVAS') {
        // Find all chart containers and get the first one (expense chart)
        const chartContainers = document.querySelectorAll('.chart-container');
        const chartContainer = chartContainers[0]; // First one is expense chart
        if (!chartContainer) return;
        chartContainer.innerHTML = '<canvas id="expenseChart"></canvas>';
        canvas = document.getElementById('expenseChart');
    }

    const chartContainer = canvas.parentNode;
    const ctx = canvas.getContext('2d');

    // Get current month expenses by category
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expensesByCategory = {};

    transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' &&
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear;
        })
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });

    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);

    // Clear legend container
    const legendContainer = document.getElementById('expenseLegend');

    if (labels.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><p>No expense data yet this month</p></div>';
        legendContainer.innerHTML = ''; // Clear the legend
        return;
    }

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors,
                borderWidth: 3,
                borderColor: document.body.classList.contains('light-mode') ? '#ffffff' : '#1a1a2e',
                borderRadius: 6,
                hoverBorderWidth: 0,
                hoverOffset: 8,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 10,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    },
                    displayColors: true,
                    boxPadding: 6,
                    callbacks: {
                        label: function (context) {
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return ` ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });

    // Create custom legend
    legendContainer.innerHTML = labels.map((label, i) => {
        const percentage = ((data[i] / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
        return `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${chartColors[i]}"></div>
                <span>${label} (${percentage}%)</span>
            </div>
        `;
    }).join('');
}

function createTrendChart() {
    let canvas = document.getElementById('trendChart');

    // If canvas doesn't exist or was replaced, we need to restore it
    if (!canvas || canvas.tagName !== 'CANVAS') {
        // Find all chart containers and get the second one (trend chart)
        const chartContainers = document.querySelectorAll('.chart-container');
        const chartContainer = chartContainers[1]; // Second one is trend chart
        if (!chartContainer) return;
        chartContainer.innerHTML = '<canvas id="trendChart"></canvas>';
        canvas = document.getElementById('trendChart');
    }

    const chartContainer = canvas.parentNode;
    const ctx = canvas.getContext('2d');

    // Get last 6 months of data
    const monthsData = getLast6MonthsData();

    if (monthsData.labels.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Not enough data for trends yet</p></div>';
        return;
    }

    const isLightMode = document.body.classList.contains('light-mode');
    const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)';
    const textColor = isLightMode ? '#64748b' : '#94a3b8';

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthsData.labels,
            datasets: [{
                    label: 'Income',
                    data: monthsData.income,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: isLightMode ? '#ffffff' : '#1a1a2e',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#10b981',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3
                },
                {
                    label: 'Expenses',
                    data: monthsData.expenses,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: isLightMode ? '#ffffff' : '#1a1a2e',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#ef4444',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            size: 13,
                            weight: '600'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 10,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    },
                    boxPadding: 6,
                    callbacks: {
                        label: function (context) {
                            return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function (value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                }
            }
        }
    });
}

function getLast6MonthsData() {
    const months = [];
    const income = [];
    const expenses = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.toLocaleString('default', {
            month: 'short'
        });
        const year = date.getFullYear();

        months.push(`${month} ${year}`);

        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear();
        });

        const monthIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        income.push(monthIncome);
        expenses.push(monthExpenses);
    }

    return {
        labels: months,
        income,
        expenses
    };
}

// === Budget Management ===
function openBudgetModal() {
    budgetInputs.innerHTML = '';

    categories.expense.forEach(cat => {
        const currentBudget = budgets[cat.name] || 0;

        budgetInputs.innerHTML += `
            <div class="form-group">
                <label for="budget-${cat.name}">
                    <i class="fas ${cat.icon}"></i>
                    ${cat.name}
                </label>
                <input
                    type="number"
                    id="budget-${cat.name}"
                    step="0.01"
                    min="0"
                    value="${currentBudget}"
                    placeholder="0.00"
                >
            </div>
        `;
    });

    budgetModal.classList.add('active');
}

function handleSetBudgets(e) {
    e.preventDefault();

    categories.expense.forEach(cat => {
        const input = document.getElementById(`budget-${cat.name}`);
        const value = parseFloat(input.value) || 0;
        budgets[cat.name] = value;
    });

    localStorage.setItem('budgets', JSON.stringify(budgets));
    budgetModal.classList.remove('active');
    renderBudgets();
    showNotification('Budgets updated successfully!', 'success');
}

function renderBudgets() {
    const budgetList = document.getElementById('budgetList');

    const hasBudgets = Object.keys(budgets).some(key => budgets[key] > 0);

    if (!hasBudgets) {
        budgetList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <p>No budgets set. Click "Set Budgets" to get started!</p>
            </div>
        `;
        return;
    }

    // Get current month expenses by category
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expensesByCategory = {};
    transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' &&
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear;
        })
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });

    budgetList.innerHTML = Object.entries(budgets)
        .filter(([_, budget]) => budget > 0)
        .map(([category, budget]) => {
            const spent = expensesByCategory[category] || 0;
            const percentage = (spent / budget) * 100;
            const remaining = budget - spent;

            let progressClass = '';
            if (percentage >= 100) progressClass = 'danger';
            else if (percentage >= 80) progressClass = 'warning';

            return `
                <div class="budget-item">
                    <div class="budget-header">
                        <span class="budget-category">
                            <i class="fas ${getCategoryIcon(category)}"></i>
                            ${category}
                        </span>
                        <span class="budget-amounts">
                            <span class="budget-amount-spent">${formatCurrency(spent)}</span> / ${formatCurrency(budget)}
                        </span>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">
                        ${remaining >= 0
                            ? `${formatCurrency(remaining)} remaining`
                            : `<span style="color: var(--danger-color);">${formatCurrency(Math.abs(remaining))} over budget</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
}

// === Export Functions ===
function exportToCSV() {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = transactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.description,
        t.amount.toFixed(2)
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });

    downloadFile(csvContent, 'cash-compass-data.csv', 'text/csv');
    exportModal.classList.remove('active');
    showNotification('Data exported as CSV!', 'success');
}

function exportToJSON() {
    const data = {
        transactions,
        budgets,
        exportDate: new Date().toISOString(),
        summary: calculateTotals()
    };

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'cash-compass-data.json', 'application/json');
    exportModal.classList.remove('active');
    showNotification('Data exported as JSON!', 'success');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], {
        type: contentType
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// === Dark Mode ===
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    const icon = darkModeToggle.querySelector('i');
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);

    localStorage.setItem('darkMode', isDark);

    // Update charts for new theme
    updateCharts();
}

// === Utility Functions ===
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Simple notification (you can enhance this with a toast library)
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// === Sample Data (for demo purposes) ===
function loadSampleData() {
    const sampleTransactions = [{
            id: Date.now() - 1000,
            type: 'income',
            category: 'Salary',
            amount: 5000,
            date: '2026-01-01',
            description: 'Monthly Salary',
            timestamp: new Date().toISOString()
        },
        {
            id: Date.now() - 2000,
            type: 'expense',
            category: 'Housing',
            amount: 1500,
            date: '2026-01-02',
            description: 'Rent Payment',
            timestamp: new Date().toISOString()
        },
        {
            id: Date.now() - 3000,
            type: 'expense',
            category: 'Groceries',
            amount: 250,
            date: '2026-01-05',
            description: 'Weekly Groceries',
            timestamp: new Date().toISOString()
        },
        {
            id: Date.now() - 4000,
            type: 'expense',
            category: 'Transportation',
            amount: 80,
            date: '2026-01-07',
            description: 'Gas',
            timestamp: new Date().toISOString()
        },
        {
            id: Date.now() - 5000,
            type: 'income',
            category: 'Freelance',
            amount: 800,
            date: '2026-01-08',
            description: 'Web Design Project',
            timestamp: new Date().toISOString()
        },
        {
            id: Date.now() - 6000,
            type: 'expense',
            category: 'Food & Dining',
            amount: 120,
            date: '2026-01-09',
            description: 'Restaurant Dinner',
            timestamp: new Date().toISOString()
        },
        {
            id: Date.now() - 7000,
            type: 'expense',
            category: 'Entertainment',
            amount: 60,
            date: '2026-01-10',
            description: 'Movie Tickets',
            timestamp: new Date().toISOString()
        }
    ];

    transactions = sampleTransactions;
    saveTransactions();

    budgets = {
        'Housing': 1600,
        'Food & Dining': 400,
        'Groceries': 300,
        'Transportation': 200,
        'Entertainment': 150
    };
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('sampleDataLoaded', 'true');

    updateDashboard();
    renderTransactions();
    updateCharts();
    renderBudgets();
}

function handleClearAll() {
    if (transactions.length === 0) {
        showNotification('No transactions to clear!', 'info');
        return;
    }

    if (confirm('This will delete all transactions and budgets. Are you sure?')) {
        transactions = [];
        budgets = {};
        localStorage.removeItem('transactions');
        localStorage.removeItem('budgets');
        localStorage.removeItem('sampleDataLoaded');

        updateDashboard();
        renderTransactions();
        updateCharts();
        renderBudgets();

        showNotification('All data cleared!', 'success');
    }
}

function toggleSampleData() {
    const hasSampleData = localStorage.getItem('sampleDataLoaded') === 'true';

    if (hasSampleData || transactions.length > 0) {
        // Clear all data
        if (confirm('This will clear all your data. Are you sure?')) {
            transactions = [];
            budgets = {};
            localStorage.removeItem('transactions');
            localStorage.removeItem('budgets');
            localStorage.removeItem('sampleDataLoaded');

            updateDashboard();
            renderTransactions();
            updateCharts();
            renderBudgets();

            showNotification('All data cleared!', 'info');
        }
    } else {
        // Load sample data
        loadSampleData();
        showNotification('Sample data loaded! Explore the features.', 'success');
    }
}

// Sample data can be loaded manually using the button
// if (transactions.length === 0) {
//     loadSampleData();
// }
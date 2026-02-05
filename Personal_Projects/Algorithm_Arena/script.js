// Algorithm Arena - Main Script

// ==================== State Management ====================
const state = {
    sorting: {
        array: [],
        isRunning: false,
        comparisons: 0,
        swaps: 0,
        startTime: null
    },
    searching: {
        array: [],
        isRunning: false,
        steps: 0
    }
};

// ==================== Analytics Data ====================
const STORAGE_KEY = 'algorithmArenaHistory';

// Load history from localStorage
function loadHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load history:', e);
        return [];
    }
}

// Save history to localStorage
function saveHistory(history) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

// Add a new run to history
function recordRun(data) {
    const history = loadHistory();
    history.unshift({
        ...data,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    // Keep only last 100 runs
    if (history.length > 100) history.pop();
    saveHistory(history);
    updateAnalytics();
}

// Clear all history
function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    updateAnalytics();
}

// ==================== DOM Elements ====================
const elements = {
    // Navigation
    navBtns: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.section'),

    // Sorting
    sortAlgorithm: document.getElementById('sort-algorithm'),
    arraySize: document.getElementById('array-size'),
    sizeValue: document.getElementById('size-value'),
    speed: document.getElementById('speed'),
    speedValue: document.getElementById('speed-value'),
    generateBtn: document.getElementById('generate-btn'),
    sortBtn: document.getElementById('sort-btn'),
    stopBtn: document.getElementById('stop-btn'),
    sortingVisualizer: document.getElementById('sorting-visualizer'),
    comparisons: document.getElementById('comparisons'),
    swaps: document.getElementById('swaps'),
    time: document.getElementById('time'),
    sortInfo: document.getElementById('sort-info'),

    // Searching
    searchAlgorithm: document.getElementById('search-algorithm'),
    searchArraySize: document.getElementById('search-array-size'),
    searchSizeValue: document.getElementById('search-size-value'),
    searchTarget: document.getElementById('search-target'),
    searchSpeed: document.getElementById('search-speed'),
    searchSpeedValue: document.getElementById('search-speed-value'),
    searchGenerateBtn: document.getElementById('search-generate-btn'),
    searchBtn: document.getElementById('search-btn'),
    searchingVisualizer: document.getElementById('searching-visualizer'),
    searchSteps: document.getElementById('search-steps'),
    targetDisplay: document.getElementById('target-display'),
    foundIndex: document.getElementById('found-index'),
    searchInfo: document.getElementById('search-info')
};

// ==================== Algorithm Info ====================
const algorithmInfo = {
    bubble: {
        name: 'Bubble Sort',
        description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        time: 'O(n²)',
        space: 'O(1)',
        stable: 'Yes'
    },
    selection: {
        name: 'Selection Sort',
        description: 'Finds the minimum element from unsorted part and puts it at the beginning.',
        time: 'O(n²)',
        space: 'O(1)',
        stable: 'No'
    },
    insertion: {
        name: 'Insertion Sort',
        description: 'Builds the final sorted array one item at a time by inserting each element into its correct position.',
        time: 'O(n²)',
        space: 'O(1)',
        stable: 'Yes'
    },
    merge: {
        name: 'Merge Sort',
        description: 'Divides the array into halves, recursively sorts them, then merges the sorted halves.',
        time: 'O(n log n)',
        space: 'O(n)',
        stable: 'Yes'
    },
    quick: {
        name: 'Quick Sort',
        description: 'Picks a pivot element and partitions the array around it, then recursively sorts the partitions.',
        time: 'O(n log n)',
        space: 'O(log n)',
        stable: 'No'
    },
    linear: {
        name: 'Linear Search',
        description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
        time: 'O(n)',
        space: 'O(1)',
        sorted: 'No'
    },
    binary: {
        name: 'Binary Search',
        description: 'Compares the target with the middle element and eliminates half of the remaining elements each step.',
        time: 'O(log n)',
        space: 'O(1)',
        sorted: 'Yes'
    },
    jump: {
        name: 'Jump Search',
        description: 'Jumps ahead by fixed steps and performs linear search in the block where the element may exist.',
        time: 'O(√n)',
        space: 'O(1)',
        sorted: 'Yes'
    }
};

// ==================== Utility Functions ====================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getSpeed() {
    return parseInt(elements.speed.value);
}

function getSearchSpeed() {
    return parseInt(elements.searchSpeed.value);
}

function generateRandomArray(size, min = 5, max = 100) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function generateSortedArray(size) {
    const arr = [];
    let current = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < size; i++) {
        arr.push(current);
        current += Math.floor(Math.random() * 5) + 1;
    }
    return arr;
}

// ==================== Navigation ====================
elements.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;

        elements.navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        elements.sections.forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
    });
});

// ==================== Sorting Visualization ====================
function renderSortingArray() {
    const container = elements.sortingVisualizer;
    const array = state.sorting.array;
    const maxVal = Math.max(...array);
    const barWidth = Math.max(2, Math.floor((container.clientWidth - array.length * 2) / array.length));

    container.innerHTML = '';

    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(value / maxVal) * 100}%`;
        bar.style.width = `${barWidth}px`;
        bar.dataset.index = index;
        container.appendChild(bar);
    });
}

function updateBars(indices, className) {
    const bars = elements.sortingVisualizer.querySelectorAll('.bar');
    bars.forEach((bar, i) => {
        bar.classList.remove('comparing', 'swapping', 'pivot');
        if (indices.includes(i)) {
            bar.classList.add(className);
        }
    });
}

function markSorted(indices) {
    const bars = elements.sortingVisualizer.querySelectorAll('.bar');
    indices.forEach(i => {
        if (bars[i]) bars[i].classList.add('sorted');
    });
}

function updateStats() {
    elements.comparisons.textContent = state.sorting.comparisons;
    elements.swaps.textContent = state.sorting.swaps;
    if (state.sorting.startTime) {
        const elapsed = ((Date.now() - state.sorting.startTime) / 1000).toFixed(2);
        elements.time.textContent = elapsed;
    }
}

function resetStats() {
    state.sorting.comparisons = 0;
    state.sorting.swaps = 0;
    state.sorting.startTime = null;
    updateStats();
}

function updateSortInfo(algorithm) {
    const info = algorithmInfo[algorithm];
    elements.sortInfo.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> ${info.name}</h3>
        <p>${info.description}</p>
        <div class="complexity">
            <span><strong>Time:</strong> ${info.time}</span>
            <span><strong>Space:</strong> ${info.space}</span>
            <span><strong>Stable:</strong> ${info.stable}</span>
        </div>
    `;
}

// ==================== Sorting Algorithms ====================
async function bubbleSort() {
    const arr = state.sorting.array;
    const n = arr.length;

    for (let i = 0; i < n - 1 && state.sorting.isRunning; i++) {
        for (let j = 0; j < n - i - 1 && state.sorting.isRunning; j++) {
            updateBars([j, j + 1], 'comparing');
            state.sorting.comparisons++;
            updateStats();
            await sleep(getSpeed());

            if (arr[j] > arr[j + 1]) {
                updateBars([j, j + 1], 'swapping');
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                state.sorting.swaps++;
                renderSortingArray();
                updateBars([j, j + 1], 'swapping');
                await sleep(getSpeed());
            }
        }
        markSorted([n - i - 1]);
    }
    markSorted([0]);
}

async function selectionSort() {
    const arr = state.sorting.array;
    const n = arr.length;

    for (let i = 0; i < n - 1 && state.sorting.isRunning; i++) {
        let minIdx = i;

        for (let j = i + 1; j < n && state.sorting.isRunning; j++) {
            updateBars([minIdx, j], 'comparing');
            state.sorting.comparisons++;
            updateStats();
            await sleep(getSpeed());

            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }

        if (minIdx !== i) {
            updateBars([i, minIdx], 'swapping');
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            state.sorting.swaps++;
            renderSortingArray();
            updateBars([i, minIdx], 'swapping');
            await sleep(getSpeed());
        }
        markSorted([i]);
    }
    markSorted([n - 1]);
}

async function insertionSort() {
    const arr = state.sorting.array;
    const n = arr.length;

    for (let i = 1; i < n && state.sorting.isRunning; i++) {
        let key = arr[i];
        let j = i - 1;

        updateBars([i], 'comparing');
        await sleep(getSpeed());

        while (j >= 0 && arr[j] > key && state.sorting.isRunning) {
            state.sorting.comparisons++;
            updateBars([j, j + 1], 'swapping');
            arr[j + 1] = arr[j];
            state.sorting.swaps++;
            renderSortingArray();
            updateStats();
            await sleep(getSpeed());
            j--;
        }
        arr[j + 1] = key;
        renderSortingArray();
    }

    for (let i = 0; i < n; i++) markSorted([i]);
}

async function mergeSort() {
    const arr = state.sorting.array;

    async function merge(left, mid, right) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length && state.sorting.isRunning) {
            updateBars([left + i, mid + 1 + j], 'comparing');
            state.sorting.comparisons++;
            updateStats();
            await sleep(getSpeed());

            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            state.sorting.swaps++;
            renderSortingArray();
            updateBars([k], 'swapping');
            await sleep(getSpeed());
            k++;
        }

        while (i < leftArr.length && state.sorting.isRunning) {
            arr[k] = leftArr[i];
            renderSortingArray();
            i++;
            k++;
            await sleep(getSpeed());
        }

        while (j < rightArr.length && state.sorting.isRunning) {
            arr[k] = rightArr[j];
            renderSortingArray();
            j++;
            k++;
            await sleep(getSpeed());
        }
    }

    async function sort(left, right) {
        if (left < right && state.sorting.isRunning) {
            const mid = Math.floor((left + right) / 2);
            await sort(left, mid);
            await sort(mid + 1, right);
            await merge(left, mid, right);
        }
    }

    await sort(0, arr.length - 1);
    for (let i = 0; i < arr.length; i++) markSorted([i]);
}

async function quickSort() {
    const arr = state.sorting.array;

    async function partition(low, high) {
        const pivot = arr[high];
        updateBars([high], 'pivot');
        await sleep(getSpeed());

        let i = low - 1;

        for (let j = low; j < high && state.sorting.isRunning; j++) {
            updateBars([j, high], 'comparing');
            state.sorting.comparisons++;
            updateStats();
            await sleep(getSpeed());

            if (arr[j] < pivot) {
                i++;
                updateBars([i, j], 'swapping');
                [arr[i], arr[j]] = [arr[j], arr[i]];
                state.sorting.swaps++;
                renderSortingArray();
                await sleep(getSpeed());
            }
        }

        updateBars([i + 1, high], 'swapping');
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        state.sorting.swaps++;
        renderSortingArray();
        await sleep(getSpeed());

        return i + 1;
    }

    async function sort(low, high) {
        if (low < high && state.sorting.isRunning) {
            const pi = await partition(low, high);
            markSorted([pi]);
            await sort(low, pi - 1);
            await sort(pi + 1, high);
        } else if (low === high) {
            markSorted([low]);
        }
    }

    await sort(0, arr.length - 1);
}

// ==================== Searching Visualization ====================
function renderSearchingArray() {
    const container = elements.searchingVisualizer;
    const array = state.searching.array;

    container.innerHTML = '';

    array.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'search-cell';
        cell.innerHTML = `${value}<span class="index">${index}</span>`;
        cell.dataset.index = index;
        container.appendChild(cell);
    });
}

function updateSearchCells(indices, className, clearOthers = false) {
    const cells = elements.searchingVisualizer.querySelectorAll('.search-cell');
    cells.forEach((cell, i) => {
        if (clearOthers) {
            cell.classList.remove('checking', 'found', 'in-range');
        }
        if (indices.includes(i)) {
            cell.classList.add(className);
        }
    });
}

function eliminateCells(indices) {
    const cells = elements.searchingVisualizer.querySelectorAll('.search-cell');
    indices.forEach(i => {
        if (cells[i]) cells[i].classList.add('eliminated');
    });
}

function updateSearchStats() {
    elements.searchSteps.textContent = state.searching.steps;
}

function updateSearchInfo(algorithm) {
    const info = algorithmInfo[algorithm];
    elements.searchInfo.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> ${info.name}</h3>
        <p>${info.description}</p>
        <div class="complexity">
            <span><strong>Time:</strong> ${info.time}</span>
            <span><strong>Space:</strong> ${info.space}</span>
            <span><strong>Sorted Required:</strong> ${info.sorted}</span>
        </div>
    `;
}

// ==================== Search Algorithms ====================
async function linearSearch(target) {
    const arr = state.searching.array;

    for (let i = 0; i < arr.length && state.searching.isRunning; i++) {
        state.searching.steps++;
        updateSearchStats();
        updateSearchCells([i], 'checking', true);
        await sleep(getSearchSpeed());

        if (arr[i] === target) {
            updateSearchCells([i], 'found', true);
            return i;
        }
    }

    return -1;
}

async function binarySearch(target) {
    const arr = state.searching.array;
    let left = 0;
    let right = arr.length - 1;

    // Mark initial range
    const initialRange = Array.from({ length: arr.length }, (_, i) => i);
    updateSearchCells(initialRange, 'in-range');

    while (left <= right && state.searching.isRunning) {
        const mid = Math.floor((left + right) / 2);

        state.searching.steps++;
        updateSearchStats();

        // Clear previous and show current check
        const cells = elements.searchingVisualizer.querySelectorAll('.search-cell');
        cells.forEach((cell, i) => {
            cell.classList.remove('checking', 'found', 'in-range');
            if (i >= left && i <= right) {
                cell.classList.add('in-range');
            }
            if (i < left || i > right) {
                cell.classList.add('eliminated');
            }
        });

        updateSearchCells([mid], 'checking');
        await sleep(getSearchSpeed());

        if (arr[mid] === target) {
            updateSearchCells([mid], 'found', true);
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}

async function jumpSearch(target) {
    const arr = state.searching.array;
    const n = arr.length;
    const step = Math.floor(Math.sqrt(n));

    let prev = 0;
    let curr = step;

    // Jump phase
    while (curr < n && arr[Math.min(curr, n) - 1] < target && state.searching.isRunning) {
        state.searching.steps++;
        updateSearchStats();
        updateSearchCells([Math.min(curr, n) - 1], 'checking', true);
        await sleep(getSearchSpeed());

        prev = curr;
        curr += step;
    }

    // Linear search in block
    for (let i = prev; i < Math.min(curr, n) && state.searching.isRunning; i++) {
        state.searching.steps++;
        updateSearchStats();
        updateSearchCells([i], 'checking', true);
        await sleep(getSearchSpeed());

        if (arr[i] === target) {
            updateSearchCells([i], 'found', true);
            return i;
        }
    }

    return -1;
}

// ==================== Event Listeners ====================

// Sorting controls
elements.arraySize.addEventListener('input', () => {
    elements.sizeValue.textContent = elements.arraySize.value;
});

elements.speed.addEventListener('input', () => {
    elements.speedValue.textContent = elements.speed.value;
});

elements.sortAlgorithm.addEventListener('change', () => {
    updateSortInfo(elements.sortAlgorithm.value);
});

elements.generateBtn.addEventListener('click', () => {
    const size = parseInt(elements.arraySize.value);
    state.sorting.array = generateRandomArray(size);
    renderSortingArray();
    resetStats();

    // Clear sorted state
    const bars = elements.sortingVisualizer.querySelectorAll('.bar');
    bars.forEach(bar => bar.classList.remove('sorted', 'comparing', 'swapping', 'pivot'));
});

elements.sortBtn.addEventListener('click', async () => {
    if (state.sorting.array.length === 0) {
        const size = parseInt(elements.arraySize.value);
        state.sorting.array = generateRandomArray(size);
        renderSortingArray();
    }

    state.sorting.isRunning = true;
    elements.sortBtn.disabled = true;
    elements.stopBtn.disabled = false;
    elements.generateBtn.disabled = true;
    resetStats();
    state.sorting.startTime = Date.now();

    // Clear previous sorted state
    const bars = elements.sortingVisualizer.querySelectorAll('.bar');
    bars.forEach(bar => bar.classList.remove('sorted'));

    const algorithm = elements.sortAlgorithm.value;

    switch (algorithm) {
        case 'bubble':
            await bubbleSort();
            break;
        case 'selection':
            await selectionSort();
            break;
        case 'insertion':
            await insertionSort();
            break;
        case 'merge':
            await mergeSort();
            break;
        case 'quick':
            await quickSort();
            break;
    }

    // Record run to analytics (only if completed, not stopped)
    if (!state.sorting.isRunning || state.sorting.comparisons > 0) {
        const elapsed = (Date.now() - state.sorting.startTime) / 1000;
        recordRun({
            type: 'sorting',
            algorithm: algorithm,
            size: state.sorting.array.length,
            comparisons: state.sorting.comparisons,
            swaps: state.sorting.swaps,
            time: elapsed
        });
    }

    state.sorting.isRunning = false;
    elements.sortBtn.disabled = false;
    elements.stopBtn.disabled = true;
    elements.generateBtn.disabled = false;
});

elements.stopBtn.addEventListener('click', () => {
    state.sorting.isRunning = false;
    elements.sortBtn.disabled = false;
    elements.stopBtn.disabled = true;
    elements.generateBtn.disabled = false;
});

// Searching controls
elements.searchArraySize.addEventListener('input', () => {
    elements.searchSizeValue.textContent = elements.searchArraySize.value;
});

elements.searchSpeed.addEventListener('input', () => {
    elements.searchSpeedValue.textContent = elements.searchSpeed.value;
});

elements.searchTarget.addEventListener('input', () => {
    elements.targetDisplay.textContent = elements.searchTarget.value;
});

elements.searchAlgorithm.addEventListener('change', () => {
    updateSearchInfo(elements.searchAlgorithm.value);
});

elements.searchGenerateBtn.addEventListener('click', () => {
    const size = parseInt(elements.searchArraySize.value);
    const algorithm = elements.searchAlgorithm.value;

    // Binary and Jump search need sorted arrays
    if (algorithm === 'binary' || algorithm === 'jump') {
        state.searching.array = generateSortedArray(size);
    } else {
        state.searching.array = generateRandomArray(size, 1, 99);
    }

    renderSearchingArray();
    state.searching.steps = 0;
    updateSearchStats();
    elements.foundIndex.textContent = '-';
});

elements.searchBtn.addEventListener('click', async () => {
    if (state.searching.array.length === 0) {
        const size = parseInt(elements.searchArraySize.value);
        const algorithm = elements.searchAlgorithm.value;

        if (algorithm === 'binary' || algorithm === 'jump') {
            state.searching.array = generateSortedArray(size);
        } else {
            state.searching.array = generateRandomArray(size, 1, 99);
        }
        renderSearchingArray();
    }

    const target = parseInt(elements.searchTarget.value);
    state.searching.isRunning = true;
    state.searching.steps = 0;
    elements.searchBtn.disabled = true;
    elements.searchGenerateBtn.disabled = true;
    elements.foundIndex.textContent = '-';

    // Clear previous states
    const cells = elements.searchingVisualizer.querySelectorAll('.search-cell');
    cells.forEach(cell => cell.classList.remove('checking', 'found', 'eliminated', 'in-range'));

    const algorithm = elements.searchAlgorithm.value;
    let result;

    switch (algorithm) {
        case 'linear':
            result = await linearSearch(target);
            break;
        case 'binary':
            result = await binarySearch(target);
            break;
        case 'jump':
            result = await jumpSearch(target);
            break;
    }

    elements.foundIndex.textContent = result >= 0 ? result : 'Not found';

    // Record search run to analytics
    recordRun({
        type: 'searching',
        algorithm: algorithm,
        size: state.searching.array.length,
        steps: state.searching.steps,
        found: result >= 0,
        time: state.searching.steps * (getSearchSpeed() / 1000) // Approximate time
    });

    state.searching.isRunning = false;
    elements.searchBtn.disabled = false;
    elements.searchGenerateBtn.disabled = false;
});

// Learn section - clicking on algorithm items
document.querySelectorAll('.algo-item').forEach(item => {
    item.addEventListener('click', () => {
        const algo = item.dataset.algo;

        // Switch to appropriate section
        if (['bubble', 'selection', 'insertion', 'merge', 'quick'].includes(algo)) {
            document.querySelector('[data-section="sorting"]').click();
            elements.sortAlgorithm.value = algo;
            updateSortInfo(algo);
        } else {
            document.querySelector('[data-section="searching"]').click();
            elements.searchAlgorithm.value = algo;
            updateSearchInfo(algo);
        }
    });
});

// ==================== Analytics & Charts ====================
let timeChart = null;
let operationsChart = null;
let historyChart = null;

// Chart.js default configuration
const chartColors = {
    bubble: '#6366f1',
    selection: '#8b5cf6',
    insertion: '#a855f7',
    merge: '#10b981',
    quick: '#ec4899',
    linear: '#f59e0b',
    binary: '#06b6d4',
    jump: '#14b8a6'
};

const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#94a3b8',
                font: { size: 11 }
            }
        }
    },
    scales: {
        x: {
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(100, 116, 139, 0.1)' }
        },
        y: {
            ticks: { color: '#64748b' },
            grid: { color: 'rgba(100, 116, 139, 0.1)' }
        }
    }
};

// Update all analytics displays
function updateAnalytics() {
    const history = loadHistory();

    // Update summary cards
    updateSummaryCards(history);

    // Update charts
    updateTimeChart(history);
    updateOperationsChart(history);
    updateHistoryLineChart(history);

    // Update history table
    updateHistoryTable(history);
}

// Update summary statistics cards
function updateSummaryCards(history) {
    const totalRunsEl = document.getElementById('total-runs');
    const favoriteAlgoEl = document.getElementById('favorite-algo');
    const fastestAlgoEl = document.getElementById('fastest-algo');
    const efficientAlgoEl = document.getElementById('efficient-algo');

    if (!totalRunsEl) return;

    totalRunsEl.textContent = history.length;

    if (history.length === 0) {
        favoriteAlgoEl.textContent = '-';
        fastestAlgoEl.textContent = '-';
        efficientAlgoEl.textContent = '-';
        return;
    }

    // Find most used algorithm
    const algoCounts = {};
    history.forEach(run => {
        algoCounts[run.algorithm] = (algoCounts[run.algorithm] || 0) + 1;
    });
    const mostUsed = Object.entries(algoCounts).sort((a, b) => b[1] - a[1])[0];
    favoriteAlgoEl.textContent = formatAlgoName(mostUsed[0]);

    // Find fastest average (sorting only, normalized by size)
    const sortingRuns = history.filter(r => r.type === 'sorting');
    if (sortingRuns.length > 0) {
        const avgTimes = {};
        const avgCounts = {};
        sortingRuns.forEach(run => {
            const normalized = run.time / run.size; // normalize by array size
            avgTimes[run.algorithm] = (avgTimes[run.algorithm] || 0) + normalized;
            avgCounts[run.algorithm] = (avgCounts[run.algorithm] || 0) + 1;
        });

        let fastest = null;
        let fastestTime = Infinity;
        Object.keys(avgTimes).forEach(algo => {
            const avg = avgTimes[algo] / avgCounts[algo];
            if (avg < fastestTime) {
                fastestTime = avg;
                fastest = algo;
            }
        });
        fastestAlgoEl.textContent = fastest ? formatAlgoName(fastest) : '-';

        // Find most efficient (fewest operations per element)
        const avgOps = {};
        const opsCounts = {};
        sortingRuns.forEach(run => {
            const ops = (run.comparisons + run.swaps) / run.size;
            avgOps[run.algorithm] = (avgOps[run.algorithm] || 0) + ops;
            opsCounts[run.algorithm] = (opsCounts[run.algorithm] || 0) + 1;
        });

        let efficient = null;
        let minOps = Infinity;
        Object.keys(avgOps).forEach(algo => {
            const avg = avgOps[algo] / opsCounts[algo];
            if (avg < minOps) {
                minOps = avg;
                efficient = algo;
            }
        });
        efficientAlgoEl.textContent = efficient ? formatAlgoName(efficient) : '-';
    } else {
        fastestAlgoEl.textContent = '-';
        efficientAlgoEl.textContent = '-';
    }
}

// Format algorithm name for display
function formatAlgoName(algo) {
    const names = {
        bubble: 'Bubble',
        selection: 'Selection',
        insertion: 'Insertion',
        merge: 'Merge',
        quick: 'Quick',
        linear: 'Linear',
        binary: 'Binary',
        jump: 'Jump'
    };
    return names[algo] || algo;
}

// Update average time bar chart
function updateTimeChart(history) {
    const canvas = document.getElementById('time-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const sortingRuns = history.filter(r => r.type === 'sorting');

    // Calculate averages per algorithm
    const avgData = {};
    const counts = {};
    sortingRuns.forEach(run => {
        avgData[run.algorithm] = (avgData[run.algorithm] || 0) + run.time;
        counts[run.algorithm] = (counts[run.algorithm] || 0) + 1;
    });

    const labels = Object.keys(avgData).map(formatAlgoName);
    const data = Object.keys(avgData).map(algo => (avgData[algo] / counts[algo]).toFixed(2));
    const colors = Object.keys(avgData).map(algo => chartColors[algo] || '#6366f1');

    if (timeChart) timeChart.destroy();

    timeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No data'],
            datasets: [{
                label: 'Avg Time (s)',
                data: data.length ? data : [0],
                backgroundColor: colors.length ? colors : ['#374151'],
                borderRadius: 6
            }]
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                legend: { display: false }
            }
        }
    });
}

// Update operations comparison chart
function updateOperationsChart(history) {
    const canvas = document.getElementById('operations-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const sortingRuns = history.filter(r => r.type === 'sorting');

    // Calculate averages
    const avgComparisons = {};
    const avgSwaps = {};
    const counts = {};

    sortingRuns.forEach(run => {
        avgComparisons[run.algorithm] = (avgComparisons[run.algorithm] || 0) + run.comparisons;
        avgSwaps[run.algorithm] = (avgSwaps[run.algorithm] || 0) + run.swaps;
        counts[run.algorithm] = (counts[run.algorithm] || 0) + 1;
    });

    const algos = Object.keys(counts);
    const labels = algos.map(formatAlgoName);

    if (operationsChart) operationsChart.destroy();

    operationsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No data'],
            datasets: [
                {
                    label: 'Comparisons',
                    data: algos.map(a => Math.round(avgComparisons[a] / counts[a])),
                    backgroundColor: '#f59e0b',
                    borderRadius: 6
                },
                {
                    label: 'Swaps',
                    data: algos.map(a => Math.round(avgSwaps[a] / counts[a])),
                    backgroundColor: '#ef4444',
                    borderRadius: 6
                }
            ]
        },
        options: chartConfig
    });
}

// Update performance over time line chart
function updateHistoryLineChart(history) {
    const canvas = document.getElementById('history-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Get last 20 sorting runs, reversed for chronological order
    const recentRuns = history
        .filter(r => r.type === 'sorting')
        .slice(0, 20)
        .reverse();

    const labels = recentRuns.map((_, i) => `Run ${i + 1}`);

    // Group by algorithm
    const datasets = {};
    recentRuns.forEach((run, i) => {
        if (!datasets[run.algorithm]) {
            datasets[run.algorithm] = {
                label: formatAlgoName(run.algorithm),
                data: new Array(recentRuns.length).fill(null),
                borderColor: chartColors[run.algorithm] || '#6366f1',
                backgroundColor: chartColors[run.algorithm] || '#6366f1',
                tension: 0.3,
                pointRadius: 4
            };
        }
        datasets[run.algorithm].data[i] = run.time;
    });

    if (historyChart) historyChart.destroy();

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['No data'],
            datasets: Object.values(datasets).length ? Object.values(datasets) : [{
                label: 'No data',
                data: [0],
                borderColor: '#374151'
            }]
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Update history table
function updateHistoryTable(history) {
    const tbody = document.getElementById('history-tbody');
    if (!tbody) return;

    if (history.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="7">No runs recorded yet. Start sorting or searching!</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = history.slice(0, 50).map(run => {
        const date = new Date(run.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const typeBadge = run.type === 'sorting'
            ? '<span class="type-badge sorting">Sort</span>'
            : '<span class="type-badge searching">Search</span>';

        return `
            <tr>
                <td>${formatAlgoName(run.algorithm)}</td>
                <td>${typeBadge}</td>
                <td>${run.size}</td>
                <td>${run.comparisons || '-'}</td>
                <td>${run.swaps !== undefined ? run.swaps : run.steps}</td>
                <td>${run.time.toFixed(2)}s</td>
                <td>${dateStr}</td>
            </tr>
        `;
    }).join('');
}

// Clear history button handler
document.getElementById('clear-history-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all run history?')) {
        clearHistory();
    }
});

// ==================== Initialization ====================
function init() {
    // Generate initial arrays
    const sortSize = parseInt(elements.arraySize.value);
    state.sorting.array = generateRandomArray(sortSize);
    renderSortingArray();

    const searchSize = parseInt(elements.searchArraySize.value);
    state.searching.array = generateSortedArray(searchSize);
    renderSearchingArray();

    // Set initial info panels
    updateSortInfo('bubble');
    updateSearchInfo('linear');

    // Initialize analytics
    updateAnalytics();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Also run immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    init();
}

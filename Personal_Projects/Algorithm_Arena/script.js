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

// ==================== Export Functions ====================

// Trigger a file download in the browser
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], {
        type: mimeType
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

// Export run history as CSV file
function exportCSV() {
    const history = loadHistory();
    if (history.length === 0) {
        alert('No data to export.');
        return;
    }

    const headers = ['Algorithm', 'Type', 'Size', 'Comparisons', 'Swaps/Steps', 'Time (s)', 'Date'];
    const rows = history.map(run => [
        formatAlgoName(run.algorithm),
        run.type,
        run.size,
        run.comparisons || '',
        run.swaps !== undefined ? run.swaps : run.steps,
        run.time.toFixed(2),
        new Date(run.timestamp).toLocaleString()
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    downloadFile(csvContent, 'algorithm-arena-history.csv', 'text/csv');
}

// Export run history as JSON file
function exportJSON() {
    const history = loadHistory();
    if (history.length === 0) {
        alert('No data to export.');
        return;
    }

    const jsonContent = JSON.stringify(history, null, 2);
    downloadFile(jsonContent, 'algorithm-arena-history.json', 'application/json');
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
        stable: 'Yes',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        bestClass: 'good',
        averageClass: 'bad',
        worstClass: 'bad',
        spaceClass: 'good',
        reason: 'Quadratic because of nested loops comparing adjacent elements. Best case O(n) when already sorted with early exit.'
    },
    selection: {
        name: 'Selection Sort',
        description: 'Finds the minimum element from unsorted part and puts it at the beginning.',
        time: 'O(n²)',
        space: 'O(1)',
        stable: 'No',
        best: 'O(n²)',
        average: 'O(n²)',
        worst: 'O(n²)',
        bestClass: 'bad',
        averageClass: 'bad',
        worstClass: 'bad',
        spaceClass: 'good',
        reason: 'Always O(n²) regardless of input because it must scan the entire unsorted portion to find the minimum each time.'
    },
    insertion: {
        name: 'Insertion Sort',
        description: 'Builds the final sorted array one item at a time by inserting each element into its correct position.',
        time: 'O(n²)',
        space: 'O(1)',
        stable: 'Yes',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        bestClass: 'good',
        averageClass: 'bad',
        worstClass: 'bad',
        spaceClass: 'good',
        reason: 'Best case O(n) when nearly sorted. Worst case when reverse sorted as each element needs maximum shifting.'
    },
    merge: {
        name: 'Merge Sort',
        description: 'Divides the array into halves, recursively sorts them, then merges the sorted halves.',
        time: 'O(n log n)',
        space: 'O(n)',
        stable: 'Yes',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        bestClass: 'great',
        averageClass: 'great',
        worstClass: 'great',
        spaceClass: 'bad',
        reason: 'Always divides in half (log n levels) and merges n elements at each level. Guaranteed O(n log n) but requires O(n) extra space.'
    },
    quick: {
        name: 'Quick Sort',
        description: 'Picks a pivot element and partitions the array around it, then recursively sorts the partitions.',
        time: 'O(n log n)',
        space: 'O(log n)',
        stable: 'No',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n²)',
        bestClass: 'great',
        averageClass: 'great',
        worstClass: 'bad',
        spaceClass: 'mid',
        reason: 'Average O(n log n) with good pivot selection. Worst case O(n²) when pivot is always smallest or largest element.'
    },
    heap: {
        name: 'Heap Sort',
        description: 'Builds a max heap from the array, then repeatedly extracts the maximum element and places it at the end.',
        time: 'O(n log n)',
        space: 'O(1)',
        stable: 'No',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        bestClass: 'great',
        averageClass: 'great',
        worstClass: 'great',
        spaceClass: 'good',
        reason: 'Heap operations are O(log n) performed n times. In-place with O(1) extra space, guaranteed O(n log n).'
    },
    shell: {
        name: 'Shell Sort',
        description: 'Generalization of insertion sort that allows exchange of items far apart. Gap sequence progressively reduces.',
        time: 'O(n log n)',
        space: 'O(1)',
        stable: 'No',
        best: 'O(n log n)',
        average: 'O(n^1.25)',
        worst: 'O(n²)',
        bestClass: 'great',
        averageClass: 'mid',
        worstClass: 'bad',
        spaceClass: 'good',
        reason: 'Performance depends on gap sequence. Knuth sequence gives ~O(n^1.25) average. Worst case with poor gap selection.'
    },
    counting: {
        name: 'Counting Sort',
        description: 'Non-comparison integer sorting algorithm. Counts occurrences of each value and reconstructs the sorted array.',
        time: 'O(n + k)',
        space: 'O(k)',
        stable: 'Yes',
        best: 'O(n + k)',
        average: 'O(n + k)',
        worst: 'O(n + k)',
        bestClass: 'great',
        averageClass: 'great',
        worstClass: 'great',
        spaceClass: 'mid',
        reason: 'Linear time because it avoids comparisons. k is the range of input values. Efficient when k is not much larger than n.'
    },
    linear: {
        name: 'Linear Search',
        description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
        time: 'O(n)',
        space: 'O(1)',
        sorted: 'No',
        best: 'O(1)',
        average: 'O(n)',
        worst: 'O(n)',
        bestClass: 'great',
        averageClass: 'mid',
        worstClass: 'mid',
        spaceClass: 'good',
        reason: 'Must check each element sequentially. Best case O(1) when target is first element. Worst when target is last or absent.'
    },
    binary: {
        name: 'Binary Search',
        description: 'Compares the target with the middle element and eliminates half of the remaining elements each step.',
        time: 'O(log n)',
        space: 'O(1)',
        sorted: 'Yes',
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(log n)',
        bestClass: 'great',
        averageClass: 'great',
        worstClass: 'great',
        spaceClass: 'good',
        reason: 'Halves the search space each step. Maximum log2(n) steps. Requires sorted input.'
    },
    jump: {
        name: 'Jump Search',
        description: 'Jumps ahead by fixed steps and performs linear search in the block where the element may exist.',
        time: 'O(√n)',
        space: 'O(1)',
        sorted: 'Yes',
        best: 'O(1)',
        average: 'O(√n)',
        worst: 'O(√n)',
        bestClass: 'great',
        averageClass: 'mid',
        worstClass: 'mid',
        spaceClass: 'good',
        reason: 'Optimal jump size is √n. Makes at most √n jumps plus √n linear steps within the block.'
    },
    exponential: {
        name: 'Exponential Search',
        description: 'Finds the range where element may be present by doubling index, then performs binary search within that range.',
        time: 'O(log n)',
        space: 'O(1)',
        sorted: 'Yes',
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(log n)',
        bestClass: 'great',
        averageClass: 'great',
        worstClass: 'great',
        spaceClass: 'good',
        reason: 'Range finding takes O(log n) by doubling. Binary search within range also O(log n). Great for large sorted datasets.'
    }
};

// ==================== Step-by-Step Mode ====================
const stepMode = {
    enabled: false,
    resolver: null
};

// Update the step explanation text
function setStepExplanation(text) {
    if (stepMode.enabled) {
        const stepText = document.getElementById('step-text');
        if (stepText) stepText.textContent = text;
    }
}

// ==================== Utility Functions ====================
function sleep(ms) {
    if (stepMode.enabled && state.sorting.isRunning) {
        return new Promise(resolve => {
            stepMode.resolver = resolve;
            const nextBtn = document.getElementById('next-step-btn');
            if (nextBtn) nextBtn.disabled = false;
        });
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getSpeed() {
    return parseInt(elements.speed.value);
}

function getSearchSpeed() {
    return parseInt(elements.searchSpeed.value);
}

function generateRandomArray(size, min = 5, max = 100) {
    return Array.from({
        length: size
    }, () => Math.floor(Math.random() * (max - min + 1)) + min);
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

// ==================== Custom Input ====================

// Parse comma-separated input into array of numbers
function parseCustomArray(inputStr) {
    if (!inputStr || inputStr.trim() === '') return null;
    const parts = inputStr.split(',').map(s => s.trim()).filter(s => s !== '');
    const numbers = parts.map(Number);
    if (numbers.some(n => isNaN(n) || !isFinite(n))) return null;
    if (numbers.length < 2) return null;
    return numbers;
}

// Check if array is sorted ascending
function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[i - 1]) return false;
    }
    return true;
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

function toggleComplexityDetail(type) {
    const detail = document.getElementById(`${type}-complexity-detail`);
    if (detail) detail.classList.toggle('hidden');
}

function updateSortInfo(algorithm) {
    const info = algorithmInfo[algorithm];
    elements.sortInfo.innerHTML = `
        <div class="info-header">
            <h3><i class="fas fa-info-circle"></i> ${info.name}</h3>
            <button class="btn-icon" onclick="toggleComplexityDetail('sort')" title="Detailed complexity">
                <i class="fas fa-chart-line"></i>
            </button>
        </div>
        <p>${info.description}</p>
        <div class="complexity">
            <span><strong>Time:</strong> ${info.time}</span>
            <span><strong>Space:</strong> ${info.space}</span>
            <span><strong>Stable:</strong> ${info.stable}</span>
        </div>
        <div class="complexity-detail hidden" id="sort-complexity-detail">
            <div class="complexity-grid">
                <div class="complexity-item">
                    <span class="complexity-label">Best</span>
                    <span class="complexity-value complexity-${info.bestClass}">${info.best}</span>
                </div>
                <div class="complexity-item">
                    <span class="complexity-label">Average</span>
                    <span class="complexity-value complexity-${info.averageClass}">${info.average}</span>
                </div>
                <div class="complexity-item">
                    <span class="complexity-label">Worst</span>
                    <span class="complexity-value complexity-${info.worstClass}">${info.worst}</span>
                </div>
                <div class="complexity-item">
                    <span class="complexity-label">Space</span>
                    <span class="complexity-value complexity-${info.spaceClass}">${info.space}</span>
                </div>
            </div>
            <p class="complexity-reason">${info.reason}</p>
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
            setStepExplanation(`Comparing index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]})`);
            await sleep(getSpeed());

            if (arr[j] > arr[j + 1]) {
                setStepExplanation(`Swapping ${arr[j]} and ${arr[j + 1]} because ${arr[j]} > ${arr[j + 1]}`);
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
            setStepExplanation(`Scanning for minimum: comparing index ${minIdx} (${arr[minIdx]}) with index ${j} (${arr[j]})`);
            await sleep(getSpeed());

            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }

        if (minIdx !== i) {
            setStepExplanation(`Swapping minimum ${arr[minIdx]} at index ${minIdx} to position ${i}`);
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

        setStepExplanation(`Picking up element at index ${i} (value: ${key})`);
        updateBars([i], 'comparing');
        await sleep(getSpeed());

        while (j >= 0 && arr[j] > key && state.sorting.isRunning) {
            state.sorting.comparisons++;
            setStepExplanation(`Shifting ${arr[j]} right to make room for ${key}`);
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
        let i = 0,
            j = 0,
            k = left;

        while (i < leftArr.length && j < rightArr.length && state.sorting.isRunning) {
            setStepExplanation(`Merging: comparing left[${i}]=${leftArr[i]} with right[${j}]=${rightArr[j]}`);
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
            setStepExplanation(`Placing ${arr[k]} at position ${k}`);
            renderSortingArray();
            updateBars([k], 'swapping');
            await sleep(getSpeed());
            k++;
        }

        while (i < leftArr.length && state.sorting.isRunning) {
            arr[k] = leftArr[i];
            setStepExplanation(`Copying remaining left element ${leftArr[i]} to position ${k}`);
            renderSortingArray();
            i++;
            k++;
            await sleep(getSpeed());
        }

        while (j < rightArr.length && state.sorting.isRunning) {
            arr[k] = rightArr[j];
            setStepExplanation(`Copying remaining right element ${rightArr[j]} to position ${k}`);
            renderSortingArray();
            j++;
            k++;
            await sleep(getSpeed());
        }
    }

    async function sort(left, right) {
        if (left < right && state.sorting.isRunning) {
            const mid = Math.floor((left + right) / 2);
            setStepExplanation(`Dividing array [${left}..${right}] at midpoint ${mid}`);
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
        setStepExplanation(`Pivot chosen: ${pivot} at index ${high}`);
        updateBars([high], 'pivot');
        await sleep(getSpeed());

        let i = low - 1;

        for (let j = low; j < high && state.sorting.isRunning; j++) {
            setStepExplanation(`Comparing ${arr[j]} at index ${j} with pivot ${pivot}`);
            updateBars([j, high], 'comparing');
            state.sorting.comparisons++;
            updateStats();
            await sleep(getSpeed());

            if (arr[j] < pivot) {
                i++;
                setStepExplanation(`${arr[j]} < ${pivot}: swapping index ${i} and ${j}`);
                updateBars([i, j], 'swapping');
                [arr[i], arr[j]] = [arr[j], arr[i]];
                state.sorting.swaps++;
                renderSortingArray();
                await sleep(getSpeed());
            }
        }

        setStepExplanation(`Placing pivot ${pivot} at its final position ${i + 1}`);
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

// ==================== Heap Sort ====================
async function heapSort() {
    const arr = state.sorting.array;
    const n = arr.length;

    async function heapify(size, rootIndex) {
        let largest = rootIndex;
        const left = 2 * rootIndex + 1;
        const right = 2 * rootIndex + 2;

        if (left < size) {
            setStepExplanation(`Heapify: comparing root ${arr[largest]} with left child ${arr[left]}`);
            updateBars([largest, left], 'comparing');
            state.sorting.comparisons++;
            updateStats();
            await sleep(getSpeed());
            if (arr[left] > arr[largest]) largest = left;
        }

        if (right < size) {
            setStepExplanation(`Heapify: comparing ${arr[largest]} with right child ${arr[right]}`);
            updateBars([largest, right], 'comparing');
            state.sorting.comparisons++;
            updateStats();
            await sleep(getSpeed());
            if (arr[right] > arr[largest]) largest = right;
        }

        if (largest !== rootIndex && state.sorting.isRunning) {
            setStepExplanation(`Swapping ${arr[rootIndex]} and ${arr[largest]} to maintain heap property`);
            updateBars([rootIndex, largest], 'swapping');
            [arr[rootIndex], arr[largest]] = [arr[largest], arr[rootIndex]];
            state.sorting.swaps++;
            renderSortingArray();
            updateBars([rootIndex, largest], 'swapping');
            await sleep(getSpeed());
            await heapify(size, largest);
        }
    }

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0 && state.sorting.isRunning; i--) {
        setStepExplanation(`Building max heap: heapifying subtree at index ${i}`);
        await heapify(n, i);
    }

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0 && state.sorting.isRunning; i--) {
        setStepExplanation(`Extracting max ${arr[0]} to position ${i}`);
        updateBars([0, i], 'swapping');
        [arr[0], arr[i]] = [arr[i], arr[0]];
        state.sorting.swaps++;
        renderSortingArray();
        markSorted([i]);
        await sleep(getSpeed());
        await heapify(i, 0);
    }
    markSorted([0]);
}

// ==================== Shell Sort ====================
async function shellSort() {
    const arr = state.sorting.array;
    const n = arr.length;

    // Using Knuth's gap sequence
    let gap = 1;
    while (gap < Math.floor(n / 3)) gap = gap * 3 + 1;

    while (gap > 0 && state.sorting.isRunning) {
        for (let i = gap; i < n && state.sorting.isRunning; i++) {
            const temp = arr[i];
            let j = i;

            setStepExplanation(`Gap ${gap}: picking element ${temp} at index ${i}`);
            updateBars([i], 'comparing');
            await sleep(getSpeed());

            while (j >= gap && arr[j - gap] > temp && state.sorting.isRunning) {
                state.sorting.comparisons++;
                setStepExplanation(`Gap ${gap}: shifting ${arr[j - gap]} from index ${j - gap} to ${j}`);
                updateBars([j, j - gap], 'swapping');
                arr[j] = arr[j - gap];
                state.sorting.swaps++;
                renderSortingArray();
                updateStats();
                await sleep(getSpeed());
                j -= gap;
            }

            arr[j] = temp;
            renderSortingArray();
        }
        gap = Math.floor(gap / 3);
    }

    for (let i = 0; i < n; i++) markSorted([i]);
}

// ==================== Counting Sort ====================
async function countingSort() {
    const arr = state.sorting.array;
    const n = arr.length;
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    const output = new Array(n);

    // Count occurrences
    for (let i = 0; i < n && state.sorting.isRunning; i++) {
        count[arr[i] - min]++;
        state.sorting.comparisons++;
        setStepExplanation(`Counting: value ${arr[i]} at index ${i}, count[${arr[i]}] = ${count[arr[i] - min]}`);
        updateBars([i], 'comparing');
        updateStats();
        await sleep(getSpeed());
    }

    // Cumulative count
    for (let i = 1; i < range; i++) {
        count[i] += count[i - 1];
    }

    // Build output array (backwards for stability)
    for (let i = n - 1; i >= 0 && state.sorting.isRunning; i--) {
        output[count[arr[i] - min] - 1] = arr[i];
        count[arr[i] - min]--;
        state.sorting.swaps++;
        updateStats();
    }

    // Copy output back with visualization
    for (let i = 0; i < n && state.sorting.isRunning; i++) {
        arr[i] = output[i];
        setStepExplanation(`Placing ${output[i]} at sorted position ${i}`);
        renderSortingArray();
        updateBars([i], 'swapping');
        markSorted([i]);
        await sleep(getSpeed());
    }
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
        <div class="info-header">
            <h3><i class="fas fa-info-circle"></i> ${info.name}</h3>
            <button class="btn-icon" onclick="toggleComplexityDetail('search')" title="Detailed complexity">
                <i class="fas fa-chart-line"></i>
            </button>
        </div>
        <p>${info.description}</p>
        <div class="complexity">
            <span><strong>Time:</strong> ${info.time}</span>
            <span><strong>Space:</strong> ${info.space}</span>
            <span><strong>Sorted Required:</strong> ${info.sorted}</span>
        </div>
        <div class="complexity-detail hidden" id="search-complexity-detail">
            <div class="complexity-grid">
                <div class="complexity-item">
                    <span class="complexity-label">Best</span>
                    <span class="complexity-value complexity-${info.bestClass}">${info.best}</span>
                </div>
                <div class="complexity-item">
                    <span class="complexity-label">Average</span>
                    <span class="complexity-value complexity-${info.averageClass}">${info.average}</span>
                </div>
                <div class="complexity-item">
                    <span class="complexity-label">Worst</span>
                    <span class="complexity-value complexity-${info.worstClass}">${info.worst}</span>
                </div>
                <div class="complexity-item">
                    <span class="complexity-label">Space</span>
                    <span class="complexity-value complexity-${info.spaceClass}">${info.space}</span>
                </div>
            </div>
            <p class="complexity-reason">${info.reason}</p>
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
    const initialRange = Array.from({
        length: arr.length
    }, (_, i) => i);
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

// ==================== Exponential Search ====================
async function exponentialSearch(target) {
    const arr = state.searching.array;
    const n = arr.length;

    // Check first element
    state.searching.steps++;
    updateSearchStats();
    updateSearchCells([0], 'checking', true);
    await sleep(getSearchSpeed());

    if (arr[0] === target) {
        updateSearchCells([0], 'found', true);
        return 0;
    }

    // Find range by doubling index
    let bound = 1;
    while (bound < n && arr[bound] <= target && state.searching.isRunning) {
        state.searching.steps++;
        updateSearchStats();
        updateSearchCells([bound], 'checking', true);
        await sleep(getSearchSpeed());

        if (arr[bound] === target) {
            updateSearchCells([bound], 'found', true);
            return bound;
        }
        bound *= 2;
    }

    // Binary search in the found range
    let left = Math.floor(bound / 2);
    let right = Math.min(bound, n - 1);

    // Mark range and eliminate outside
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
    await sleep(getSearchSpeed());

    while (left <= right && state.searching.isRunning) {
        const mid = Math.floor((left + right) / 2);
        state.searching.steps++;
        updateSearchStats();

        // Update range visualization
        const allCells = elements.searchingVisualizer.querySelectorAll('.search-cell');
        allCells.forEach((cell, i) => {
            cell.classList.remove('checking', 'in-range');
            if (i >= left && i <= right) cell.classList.add('in-range');
            if (i < left || i > right) cell.classList.add('eliminated');
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

    if (stepMode.enabled) {
        document.getElementById('step-text').textContent = 'Starting... Click "Next Step" to advance.';
    }

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
        case 'heap':
            await heapSort();
            break;
        case 'shell':
            await shellSort();
            break;
        case 'counting':
            await countingSort();
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

    if (stepMode.enabled) {
        document.getElementById('step-text').textContent = 'Sorting complete!';
        document.getElementById('next-step-btn').disabled = true;
    }
});

elements.stopBtn.addEventListener('click', () => {
    state.sorting.isRunning = false;
    elements.sortBtn.disabled = false;
    elements.stopBtn.disabled = true;
    elements.generateBtn.disabled = false;

    // Resolve any pending step
    if (stepMode.resolver) {
        stepMode.resolver();
        stepMode.resolver = null;
    }
    const nextBtn = document.getElementById('next-step-btn');
    if (nextBtn) nextBtn.disabled = true;
});

// Step mode toggle
document.getElementById('step-mode-toggle')?.addEventListener('change', (e) => {
    stepMode.enabled = e.target.checked;
    const explanation = document.getElementById('step-explanation');

    if (stepMode.enabled) {
        explanation.classList.remove('hidden');
    } else {
        explanation.classList.add('hidden');
        if (stepMode.resolver) {
            stepMode.resolver();
            stepMode.resolver = null;
        }
    }
});

// Next step button
document.getElementById('next-step-btn')?.addEventListener('click', () => {
    if (stepMode.resolver) {
        const nextBtn = document.getElementById('next-step-btn');
        if (nextBtn) nextBtn.disabled = true;
        stepMode.resolver();
        stepMode.resolver = null;
    }
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
    if (algorithm === 'binary' || algorithm === 'jump' || algorithm === 'exponential') {
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

        if (algorithm === 'binary' || algorithm === 'jump' || algorithm === 'exponential') {
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
        case 'exponential':
            result = await exponentialSearch(target);
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

// Custom input - sorting
document.getElementById('sort-use-custom-btn')?.addEventListener('click', () => {
    const input = document.getElementById('sort-custom-input');
    const parsed = parseCustomArray(input.value);
    if (!parsed) {
        input.classList.add('input-error');
        setTimeout(() => input.classList.remove('input-error'), 2000);
        return;
    }

    const algorithm = elements.sortAlgorithm.value;
    if (algorithm === 'counting' && parsed.some(n => n < 0 || !Number.isInteger(n))) {
        alert('Counting Sort requires non-negative integers.');
        return;
    }

    state.sorting.array = parsed;
    renderSortingArray();
    resetStats();
    input.classList.remove('input-error');
    elements.sizeValue.textContent = parsed.length;
});

// Custom input - searching
document.getElementById('search-use-custom-btn')?.addEventListener('click', () => {
    const input = document.getElementById('search-custom-input');
    const parsed = parseCustomArray(input.value);
    if (!parsed) {
        input.classList.add('input-error');
        setTimeout(() => input.classList.remove('input-error'), 2000);
        return;
    }

    const algorithm = elements.searchAlgorithm.value;
    if ((algorithm === 'binary' || algorithm === 'jump' || algorithm === 'exponential') && !isSorted(parsed)) {
        alert('This search algorithm requires a sorted array. Please enter numbers in ascending order.');
        return;
    }

    state.searching.array = parsed;
    renderSearchingArray();
    state.searching.steps = 0;
    updateSearchStats();
    elements.foundIndex.textContent = '-';
    input.classList.remove('input-error');
    elements.searchSizeValue.textContent = parsed.length;
});

// Learn section - clicking on algorithm items
document.querySelectorAll('.algo-item').forEach(item => {
    item.addEventListener('click', () => {
        const algo = item.dataset.algo;

        // Switch to appropriate section
        if (['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'shell', 'counting'].includes(algo)) {
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
    heap: '#f97316',
    shell: '#84cc16',
    counting: '#22d3ee',
    linear: '#f59e0b',
    binary: '#06b6d4',
    jump: '#14b8a6',
    exponential: '#a78bfa'
};

const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#94a3b8',
                font: {
                    size: 11
                }
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#64748b'
            },
            grid: {
                color: 'rgba(100, 116, 139, 0.1)'
            }
        },
        y: {
            ticks: {
                color: '#64748b'
            },
            grid: {
                color: 'rgba(100, 116, 139, 0.1)'
            }
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
        heap: 'Heap',
        shell: 'Shell',
        counting: 'Counting',
        linear: 'Linear',
        binary: 'Binary',
        jump: 'Jump',
        exponential: 'Exponential'
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
                legend: {
                    display: false
                }
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
            datasets: [{
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
                        font: {
                            size: 11
                        }
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
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        const typeBadge = run.type === 'sorting' ?
            '<span class="type-badge sorting">Sort</span>' :
            '<span class="type-badge searching">Search</span>';

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

// Export buttons
document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);
document.getElementById('export-json-btn')?.addEventListener('click', exportJSON);

// ==================== Race Mode ====================
const raceState = {
    isRunning: false,
    lane1: {
        array: [],
        comparisons: 0,
        swaps: 0,
        startTime: null,
        done: false
    },
    lane2: {
        array: [],
        comparisons: 0,
        swaps: 0,
        startTime: null,
        done: false
    }
};

// Render bars into a specific race container
function renderRaceLane(container, array) {
    const maxVal = Math.max(...array);
    const barWidth = Math.max(2, Math.floor((container.clientWidth - array.length * 2) / array.length));
    container.innerHTML = '';
    array.forEach((value) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(value / maxVal) * 100}%`;
        bar.style.width = `${barWidth}px`;
        container.appendChild(bar);
    });
}

// Update bar classes in a race container
function updateRaceBars(container, indices, className) {
    const bars = container.querySelectorAll('.bar');
    bars.forEach((bar, i) => {
        bar.classList.remove('comparing', 'swapping', 'pivot');
        if (indices.includes(i)) bar.classList.add(className);
    });
}

// Mark bars as sorted in a race container
function markRaceSorted(container, indices) {
    const bars = container.querySelectorAll('.bar');
    indices.forEach(i => {
        if (bars[i]) bars[i].classList.add('sorted');
    });
}

// Race-specific sleep (uses race speed slider)
function raceSleep() {
    return new Promise(resolve => setTimeout(resolve, parseInt(document.getElementById('race-speed').value)));
}

// Update race stats display
function updateRaceStats(laneNum) {
    const lane = laneNum === 1 ? raceState.lane1 : raceState.lane2;
    document.getElementById(`race-comps-${laneNum}`).textContent = lane.comparisons;
    document.getElementById(`race-swaps-${laneNum}`).textContent = lane.swaps;
    if (lane.startTime) {
        document.getElementById(`race-time-${laneNum}`).textContent =
            ((Date.now() - lane.startTime) / 1000).toFixed(2);
    }
}

// Create a race sort function for a given lane
function createRaceSorter(algorithm, laneNum) {
    const lane = laneNum === 1 ? raceState.lane1 : raceState.lane2;
    const container = document.getElementById(`race-visualizer-${laneNum}`);

    const render = () => renderRaceLane(container, lane.array);
    const bars = (indices, cls) => updateRaceBars(container, indices, cls);
    const sorted = (indices) => markRaceSorted(container, indices);
    const stats = () => updateRaceStats(laneNum);
    const wait = () => raceSleep();
    const running = () => raceState.isRunning;

    switch (algorithm) {
        case 'bubble':
            return async () => {
                const arr = lane.array;
                const n = arr.length;
                for (let i = 0; i < n - 1 && running(); i++) {
                    for (let j = 0; j < n - i - 1 && running(); j++) {
                        bars([j, j + 1], 'comparing');
                        lane.comparisons++;
                        stats();
                        await wait();
                        if (arr[j] > arr[j + 1]) {
                            bars([j, j + 1], 'swapping');
                            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                            lane.swaps++;
                            render();
                            bars([j, j + 1], 'swapping');
                            await wait();
                        }
                    }
                    sorted([n - i - 1]);
                }
                sorted([0]);
            };
        case 'selection':
            return async () => {
                const arr = lane.array;
                const n = arr.length;
                for (let i = 0; i < n - 1 && running(); i++) {
                    let minIdx = i;
                    for (let j = i + 1; j < n && running(); j++) {
                        bars([minIdx, j], 'comparing');
                        lane.comparisons++;
                        stats();
                        await wait();
                        if (arr[j] < arr[minIdx]) minIdx = j;
                    }
                    if (minIdx !== i) {
                        bars([i, minIdx], 'swapping');
                        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                        lane.swaps++;
                        render();
                        bars([i, minIdx], 'swapping');
                        await wait();
                    }
                    sorted([i]);
                }
                sorted([n - 1]);
            };
        case 'insertion':
            return async () => {
                const arr = lane.array;
                const n = arr.length;
                for (let i = 1; i < n && running(); i++) {
                    let key = arr[i],
                        j = i - 1;
                    bars([i], 'comparing');
                    await wait();
                    while (j >= 0 && arr[j] > key && running()) {
                        lane.comparisons++;
                        bars([j, j + 1], 'swapping');
                        arr[j + 1] = arr[j];
                        lane.swaps++;
                        render();
                        stats();
                        await wait();
                        j--;
                    }
                    arr[j + 1] = key;
                    render();
                }
                for (let i = 0; i < arr.length; i++) sorted([i]);
            };
        case 'merge':
            return async () => {
                const arr = lane.array;
                async function merge(left, mid, right) {
                    const leftArr = arr.slice(left, mid + 1);
                    const rightArr = arr.slice(mid + 1, right + 1);
                    let i = 0,
                        j = 0,
                        k = left;
                    while (i < leftArr.length && j < rightArr.length && running()) {
                        bars([left + i, mid + 1 + j], 'comparing');
                        lane.comparisons++;
                        stats();
                        await wait();
                        if (leftArr[i] <= rightArr[j]) {
                            arr[k] = leftArr[i];
                            i++;
                        } else {
                            arr[k] = rightArr[j];
                            j++;
                        }
                        lane.swaps++;
                        render();
                        bars([k], 'swapping');
                        await wait();
                        k++;
                    }
                    while (i < leftArr.length && running()) {
                        arr[k] = leftArr[i];
                        render();
                        i++;
                        k++;
                        await wait();
                    }
                    while (j < rightArr.length && running()) {
                        arr[k] = rightArr[j];
                        render();
                        j++;
                        k++;
                        await wait();
                    }
                }
                async function sort(left, right) {
                    if (left < right && running()) {
                        const mid = Math.floor((left + right) / 2);
                        await sort(left, mid);
                        await sort(mid + 1, right);
                        await merge(left, mid, right);
                    }
                }
                await sort(0, arr.length - 1);
                for (let i = 0; i < arr.length; i++) sorted([i]);
            };
        case 'quick':
            return async () => {
                const arr = lane.array;
                async function partition(low, high) {
                    const pivot = arr[high];
                    bars([high], 'pivot');
                    await wait();
                    let i = low - 1;
                    for (let j = low; j < high && running(); j++) {
                        bars([j, high], 'comparing');
                        lane.comparisons++;
                        stats();
                        await wait();
                        if (arr[j] < pivot) {
                            i++;
                            bars([i, j], 'swapping');
                            [arr[i], arr[j]] = [arr[j], arr[i]];
                            lane.swaps++;
                            render();
                            await wait();
                        }
                    }
                    bars([i + 1, high], 'swapping');
                    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                    lane.swaps++;
                    render();
                    await wait();
                    return i + 1;
                }
                async function sort(low, high) {
                    if (low < high && running()) {
                        const pi = await partition(low, high);
                        sorted([pi]);
                        await sort(low, pi - 1);
                        await sort(pi + 1, high);
                    } else if (low === high) sorted([low]);
                }
                await sort(0, arr.length - 1);
            };
        case 'heap':
            return async () => {
                const arr = lane.array;
                const n = arr.length;
                async function heapify(size, root) {
                    let largest = root;
                    const left = 2 * root + 1,
                        right = 2 * root + 2;
                    if (left < size) {
                        bars([largest, left], 'comparing');
                        lane.comparisons++;
                        stats();
                        await wait();
                        if (arr[left] > arr[largest]) largest = left;
                    }
                    if (right < size) {
                        bars([largest, right], 'comparing');
                        lane.comparisons++;
                        stats();
                        await wait();
                        if (arr[right] > arr[largest]) largest = right;
                    }
                    if (largest !== root && running()) {
                        bars([root, largest], 'swapping');
                        [arr[root], arr[largest]] = [arr[largest], arr[root]];
                        lane.swaps++;
                        render();
                        bars([root, largest], 'swapping');
                        await wait();
                        await heapify(size, largest);
                    }
                }
                for (let i = Math.floor(n / 2) - 1; i >= 0 && running(); i--) await heapify(n, i);
                for (let i = n - 1; i > 0 && running(); i--) {
                    bars([0, i], 'swapping');
                    [arr[0], arr[i]] = [arr[i], arr[0]];
                    lane.swaps++;
                    render();
                    sorted([i]);
                    await wait();
                    await heapify(i, 0);
                }
                sorted([0]);
            };
        case 'shell':
            return async () => {
                const arr = lane.array;
                const n = arr.length;
                let gap = 1;
                while (gap < Math.floor(n / 3)) gap = gap * 3 + 1;
                while (gap > 0 && running()) {
                    for (let i = gap; i < n && running(); i++) {
                        const temp = arr[i];
                        let j = i;
                        bars([i], 'comparing');
                        await wait();
                        while (j >= gap && arr[j - gap] > temp && running()) {
                            lane.comparisons++;
                            bars([j, j - gap], 'swapping');
                            arr[j] = arr[j - gap];
                            lane.swaps++;
                            render();
                            stats();
                            await wait();
                            j -= gap;
                        }
                        arr[j] = temp;
                        render();
                    }
                    gap = Math.floor(gap / 3);
                }
                for (let i = 0; i < n; i++) sorted([i]);
            };
        case 'counting':
            return async () => {
                const arr = lane.array;
                const n = arr.length;
                const max = Math.max(...arr),
                    min = Math.min(...arr);
                const range = max - min + 1;
                const count = new Array(range).fill(0);
                const output = new Array(n);
                for (let i = 0; i < n && running(); i++) {
                    count[arr[i] - min]++;
                    lane.comparisons++;
                    bars([i], 'comparing');
                    stats();
                    await wait();
                }
                for (let i = 1; i < range; i++) count[i] += count[i - 1];
                for (let i = n - 1; i >= 0 && running(); i--) {
                    output[count[arr[i] - min] - 1] = arr[i];
                    count[arr[i] - min]--;
                    lane.swaps++;
                    stats();
                }
                for (let i = 0; i < n && running(); i++) {
                    arr[i] = output[i];
                    render();
                    bars([i], 'swapping');
                    sorted([i]);
                    await wait();
                }
            };
    }
}

// Race button handler
document.getElementById('race-btn')?.addEventListener('click', async () => {
    const algo1 = document.getElementById('race-algo-1').value;
    const algo2 = document.getElementById('race-algo-2').value;
    const size = parseInt(document.getElementById('race-size').value);

    // Same random array for both
    const sourceArray = generateRandomArray(size);
    raceState.lane1.array = [...sourceArray];
    raceState.lane2.array = [...sourceArray];
    raceState.lane1.comparisons = 0;
    raceState.lane1.swaps = 0;
    raceState.lane1.done = false;
    raceState.lane2.comparisons = 0;
    raceState.lane2.swaps = 0;
    raceState.lane2.done = false;
    raceState.isRunning = true;

    // Update UI
    document.getElementById('race-name-1').textContent = algorithmInfo[algo1].name;
    document.getElementById('race-name-2').textContent = algorithmInfo[algo2].name;
    document.getElementById('race-winner').classList.add('hidden');
    document.getElementById('race-btn').disabled = true;
    document.getElementById('race-stop-btn').disabled = false;

    // Render initial arrays
    const vis1 = document.getElementById('race-visualizer-1');
    const vis2 = document.getElementById('race-visualizer-2');
    renderRaceLane(vis1, raceState.lane1.array);
    renderRaceLane(vis2, raceState.lane2.array);

    // Start timers
    raceState.lane1.startTime = Date.now();
    raceState.lane2.startTime = Date.now();

    // Create sort functions
    const sort1 = createRaceSorter(algo1, 1);
    const sort2 = createRaceSorter(algo2, 2);

    // Run both simultaneously
    const race1 = sort1().then(() => {
        raceState.lane1.done = true;
        return 1;
    });
    const race2 = sort2().then(() => {
        raceState.lane2.done = true;
        return 2;
    });

    // Wait for winner
    const winner = await Promise.race([race1, race2]);
    await Promise.allSettled([race1, race2]);

    // Announce winner
    if (raceState.isRunning) {
        const winnerName = winner === 1 ? algorithmInfo[algo1].name : algorithmInfo[algo2].name;
        const winnerEl = document.getElementById('race-winner');
        document.getElementById('race-winner-text').textContent = `${winnerName} wins the race!`;
        winnerEl.classList.remove('hidden');
    }

    raceState.isRunning = false;
    document.getElementById('race-btn').disabled = false;
    document.getElementById('race-stop-btn').disabled = true;
});

// Race stop button
document.getElementById('race-stop-btn')?.addEventListener('click', () => {
    raceState.isRunning = false;
    document.getElementById('race-btn').disabled = false;
    document.getElementById('race-stop-btn').disabled = true;
});

// Race slider listeners
document.getElementById('race-size')?.addEventListener('input', (e) => {
    document.getElementById('race-size-value').textContent = e.target.value;
});

document.getElementById('race-speed')?.addEventListener('input', (e) => {
    document.getElementById('race-speed-value').textContent = e.target.value;
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
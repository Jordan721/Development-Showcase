# Algorithm Arena

An interactive algorithm visualization tool for learning and comparing sorting and searching algorithms.


## Features

### Sorting Algorithms
Visualize how different sorting algorithms work with animated bar graphs:
- **Bubble Sort** - Simple comparison-based sorting
- **Selection Sort** - Find minimum and place at beginning
- **Insertion Sort** - Build sorted array one element at a time
- **Merge Sort** - Divide and conquer approach
- **Quick Sort** - Pivot-based partitioning

### Searching Algorithms
Watch search algorithms find targets in arrays:
- **Linear Search** - Sequential checking
- **Binary Search** - Divide search space in half
- **Jump Search** - Block-based jumping

### Real-Time Statistics
Track performance metrics as algorithms run:
- Number of comparisons
- Number of swaps/steps
- Execution time

### Performance Analytics Dashboard
Track your algorithm exploration with persistent analytics:
- **Summary Cards** - Total runs, most used algorithm, fastest & most efficient
- **Time Chart** - Average execution time by algorithm
- **Operations Chart** - Comparisons vs swaps comparison
- **History Chart** - Performance trends over time
- **Run History Table** - Detailed log of all algorithm runs

### Learning Section
Educational content for each algorithm:
- Algorithm descriptions
- Time & space complexity
- Complexity comparison table

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, animations
- **JavaScript (ES6+)** - Async/await, destructuring, modules
- **Chart.js** - Interactive data visualizations
- **Font Awesome** - Icons
- **LocalStorage** - Persistent analytics data

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies to install!

## How to Use

### Sorting
1. Select an algorithm from the dropdown
2. Adjust array size and animation speed
3. Click "Generate" to create a new random array
4. Click "Sort" to start the visualization
5. Watch the bars change colors:
   - **Yellow** - Comparing elements
   - **Red** - Swapping elements
   - **Pink** - Pivot element (Quick Sort)
   - **Green** - Sorted position

### Searching
1. Select a search algorithm
2. Adjust array size and speed
3. Enter a target value to find
4. Click "Generate" then "Search"
5. Watch cells highlight:
   - **Yellow** - Currently checking
   - **Green** - Target found
   - **Gray** - Eliminated from search

### Analytics
- All sorting and searching runs are automatically tracked
- View performance trends and comparisons
- Clear history anytime with the "Clear History" button

## File Structure

```
Algorithm_Arena/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── script.js       # Algorithm logic and interactivity
└── README.md       # This file
```

## Browser Support

Works best in modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

### Changing Colors
Edit the CSS custom properties in `styles.css`:
```css
:root {
    --accent-primary: #6366f1;    /* Main accent color */
    --bar-comparing: #f59e0b;      /* Comparison highlight */
    --bar-sorted: #10b981;         /* Sorted element */
}
```

### Adding New Algorithms
1. Add algorithm info to `algorithmInfo` object in `script.js`
2. Create the algorithm function (async with visualization updates)
3. Add to the switch statement in the sort/search button handler
4. Add option to the HTML select element

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Add new algorithms
- Improve visualizations

---

Made with code and curiosity.

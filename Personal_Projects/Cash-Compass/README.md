# 🧭 Cash Compass

Navigate your finances with confidence! A premium financial dashboard demonstrating modern web design with glassmorphism effects, animated backgrounds, and interactive data visualization using Chart.js.

## ✨ Features

### 🎯 Core Functionality
- **💸 Transaction Management** - Add, view, and delete income/expense transactions
- **🎯 Budget Tracking** - Set monthly budgets per category and track spending against goals
- **📊 Data Visualization** - Interactive charts showing expense breakdown and monthly trends
- **🧮 Smart Analytics** - Automatic calculation of savings rate, net balance, and monthly changes
- **📤 Data Export** - Export your financial data as CSV or JSON files
- **🔍 Search** - Real-time search filtering for transactions

### 🎨 Premium UI Design
- **🌌 Animated Background** - Floating gradient orbs with subtle animations
- **🪟 Glassmorphism** - Semi-transparent cards with backdrop blur effects
- **📱 Sidebar Navigation** - Fixed sidebar with smooth scroll navigation
- **🌙 Dark/Light Themes** - Dark mode by default with light mode toggle
- **✨ Hover Glow Effects** - Cards glow with theme colors on hover
- **📱 Fully Responsive** - Collapsible sidebar on mobile, adaptive grid layouts

## 🛠️ Tech Stack

- **HTML5** 📄 - Semantic markup with modern structure
- **CSS3** 🎨 - Glassmorphism, CSS Grid, Flexbox, animations
- **JavaScript (Vanilla)** ⚡ - No frameworks, pure JavaScript
- **Chart.js** 📊 - Beautiful, responsive charts
- **Font Awesome** 🎭 - Icon library
- **LocalStorage API** 💾 - Client-side data persistence

## 📂 Categories

### 💚 Income Categories
- 💼 Salary
- 💻 Freelance
- 📈 Investment
- 🎁 Gift
- 💵 Other Income

### 💰 Expense Categories
- 🏠 Housing
- 🚗 Transportation
- 🍽️ Food & Dining
- 🛒 Groceries
- 🎬 Entertainment
- ❤️ Healthcare
- ⚡ Utilities
- 🛍️ Shopping
- 🎓 Education
- 🧾 Other Expense

## 📈 Analytics & Insights

The dashboard automatically calculates:
- **💵 Total Income** - All income for the current month
- **💸 Total Expenses** - All expenses for the current month
- **💰 Net Balance** - Income minus expenses
- **🐷 Savings Rate** - Percentage of income saved
- **📊 Monthly Trends** - Comparison with previous month
- **🎯 Budget Progress** - Spending vs. budget for each category

## 📊 Data Visualization

### 🥧 Expense Breakdown (Pie Chart)
- Shows distribution of expenses across categories
- Interactive tooltips with amounts and percentages
- Color-coded for easy identification

### 📈 Monthly Trends (Line Chart)
- Displays income vs. expenses over the last 6 months
- Dual-line graph for easy comparison
- Helps identify spending patterns

## 🚀 Usage

### ➕ Adding Transactions
1. Use the Income/Expense toggle buttons in the Quick Add panel
2. Choose category from dropdown
3. Enter amount, date, and description
4. Click "Add Transaction"
5. Or click the green "Add Transaction" button in the top bar to scroll to the form

### 🎯 Setting Budgets
1. Click "Set Budgets" button
2. Enter monthly budget for each expense category
3. Click "Save Budgets"
4. View animated progress bars showing spending vs. budget

### 📤 Exporting Data
1. Click "Export Data" button
2. Choose format (CSV for Excel/Sheets, JSON for backup)
3. File downloads automatically

### 🌙 Dark/Light Mode
- Dark mode is the default theme
- Click the moon/sun icon in the top bar to toggle
- Preference saved automatically
- All UI elements adapt to theme

## 💻 Installation

No installation required! Just open the files in a web browser:

```bash
# Clone or download the project
cd Cash-Compass

# Option 1: Open directly
# Double-click index.html

# Option 2: Use a local server (recommended)
npx serve
# or
python -m http.server 8000
```

Then visit `http://localhost:8000` 🌐

## 🌍 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires JavaScript enabled and LocalStorage support.

## 🔒 Data Privacy

- **🏠 100% Local** - All data stored in your browser only
- **🚫 No Server** - No data sent to any server
- **👀 No Tracking** - No analytics or tracking
- **🎮 Your Control** - Export/delete data anytime

## 📁 Project Structure

```
Cash-Compass/
├── 📄 index.html          # Main HTML structure
├── 🎨 styles.css          # Premium gradient styling with animations
├── ⚡ script.js           # All functionality & charts
└── 📖 README.md          # This file
```

## 🎨 Customization

### 🎨 Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #6366f1;       /* Indigo */
    --secondary: #10b981;     /* Emerald */
    --accent: #06b6d4;        /* Cyan */
    --purple: #8b5cf6;        /* Purple */
    --danger: #ef4444;        /* Red */
}
```

### ➕ Add Categories
Edit the `categories` object in `script.js`:
```javascript
const categories = {
    income: [...],
    expense: [...]
};
```

### 📅 Modify Budget Periods
Currently set to monthly. Edit date filtering logic in `script.js` to change to weekly, yearly, etc.

## 🔗 Pairs With PipelineTrack

Cash Compass is designed to complement [PipelineTrack](https://jordan721.github.io/Development-Showcase/Personal_Projects/PipelineTrack/index.html), a job search tracker built alongside it.

While you're job hunting:
- Use **PipelineTrack** to track applications, score your skill fit against job descriptions, and manage interviews and offers
- Use **Cash Compass** to track your financial runway — know how long you can sustain your search, budget for job-search expenses (certifications, interview travel), and evaluate salary offers against your actual cost of living

When an offer comes in, PipelineTrack links directly to Cash Compass so you can cross-reference the offered salary with your real monthly numbers.

---

## 🔮 Future Enhancements

Potential features to add:
- 📥 Import data from CSV/JSON
- 🔄 Recurring transactions
- 💳 Multiple accounts/wallets
- 🔔 Bill reminders
- 🎯 Financial goals tracking
- 📄 Reports and insights
- ☁️ Cloud sync option

## 📸 Screenshots

(Add screenshots here once you view the app!)

## 🐛 Known Issues & Bug Fixes

### Recent Fixes
- **✅ Chart Re-rendering** - Fixed issue where charts wouldn't display after clearing and reloading sample data
- **✅ Legend Persistence** - Fixed expense legend not clearing when data was removed
- **✅ Canvas Restoration** - Improved canvas element restoration when switching between empty states and data views

### Reporting Issues
If you encounter any bugs or have suggestions for improvements:
1. Check the browser console for error messages
2. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
3. Try clearing browser cache and localStorage
4. Report issues with detailed steps to reproduce

## 📜 License

© 2025 Jordan. All Rights Reserved.

This project is publicly viewable for portfolio purposes only. You may not copy, use, modify, or distribute any part of this code without explicit written permission from the author. To request permission, open an issue on GitHub.

## 👨‍💻 Credits

Built with modern web technologies and Chart.js for data visualization.

---

**Made with 💙 - Navigate your finances with Cash Compass!**

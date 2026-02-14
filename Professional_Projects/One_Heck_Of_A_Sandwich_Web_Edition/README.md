# One Heck Of A Sandwich - Web Edition

This is the **web edition** of my Year Up United capstone project. The original project was built in Java as a command-line application that takes sandwich orders and prints them to a `.txt` file. This version reimagines that same concept as a modern, interactive kiosk-style web app.

You can find the original Java project here:
[One Heck Of A Sandwich - Capstone 2 (Java)](https://github.com/Year-Up-United-SPR-2025/Capstones/tree/main/One_Heck_Of_A_Sandwich_Cap_2)

---

## About

The original capstone required building a sandwich ordering system in Java where customers could customize their sandwich, add drinks and chips, and have their order receipt saved to a text file. This web edition brings that experience to the browser with a fully interactive kiosk UI, real-time pricing, and a polished modern design.

---

## Features

- **Build Your Own Sandwich** - Choose size (4", 8", 12"), bread type (White, Wheat, Rye, Wrap, Italian), and toggle toasting
- **Toppings System** - Select from meats, cheeses, regular toppings, and sauces with automatic surcharge calculation
- **Signature Sandwiches** - Pre-built favorites like BLT O Heck, Philly Cheese Steak, Heckin Italian, and Cluckin Chicken
- **Combo Meals** - Bundled deals with built-in savings ($1.50 - $2.00 off)
- **Drinks & Chips** - Add drinks with customizable size/flavor and chips as sides
- **Order Summary** - Real-time sidebar that updates as you build your order
- **Checkout & Receipt** - Detailed receipt with print functionality
- **Order Tracker** - Animated 4-step order progress after checkout
- **Order History** - Past orders saved to localStorage with timestamps
- **Tutorial Page** - A dedicated walkthrough explaining the journey from Java CLI to web kiosk

---

## Pricing

| Item | Small (4") | Medium (8") | Large (12") |
|------|-----------|-------------|-------------|
| Sandwich Base | $5.50 | $7.00 | $8.50 |
| Premium Topping | $1.00 | $2.00 | $3.00 |
| Extra Premium | $0.50 | $1.00 | $1.50 |
| Drink | $2.00 | $2.50 | $3.00 |
| Chips | $1.50 | - | - |

- Every 3 regular toppings adds a $0.50 surcharge
- Every 2 extras (premium items) adds a $0.50 surcharge

---

## Tech Stack

- **HTML5** - Semantic markup with ARIA accessibility
- **CSS3** - Modern minimalist design, CSS variables, animations, responsive layout
- **JavaScript (Vanilla)** - No frameworks, pure JS for all interactivity and state management
- **Google Fonts** - Inter font family
- **localStorage** - Order history persistence

---

## How to Run

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. Start ordering!

No build tools, dependencies, or servers required.

---

## Project Structure

```
One_Heck_Of_A_Sandwich_Web_Edition/
├── index.html            # Main kiosk application
├── script.js             # Order logic, pricing, and state management
├── styles.css            # Kiosk styling and animations
├── tutorial.html         # Tutorial page (Java to Web journey)
├── tutorial-script.js    # Tutorial interactivity
├── tutorial-styles.css   # Tutorial page styles
└── favicon.svg           # Sandwich favicon
```

---

## Original vs. Web Edition

| | Java (Original) | Web Edition |
|---|---|---|
| **Interface** | Command-line prompts | Interactive kiosk UI |
| **Output** | Order saved to `.txt` file | On-screen receipt with print option |
| **Data** | File-based | localStorage |
| **Extras** | Core ordering flow | Signature sandwiches, combos, order history, animations, tutorial |

---

## Credits

Built by **Jordan Alexis** as part of the Year Up United SPR 2025 program.

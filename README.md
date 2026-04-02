# Finance Dashboard

A clean and interactive finance dashboard built for the Zorvyn Frontend Developer Intern assignment.

## Live Demo
[View Live →](https://finance-dashboard95132.netlify.app/)

## Overview

I built this as a single page React application that lets users track and understand
their financial activity. The focus was on keeping the UI clean and the interactions
intuitive — not on complexity for its own sake.

The data is all mock/static, structured to reflect realistic Indian financial patterns
(salaries, Swiggy orders, utility bills, freelance payments etc).

## Features

- **Summary Cards** — Total Balance, Income, and Expenses calculated live from data
- **Monthly Trend Chart** — Line chart showing Income vs Expense vs Balance per month
- **Spending Breakdown** — Donut chart showing expenses by category
- **Transactions Table** — Full list with search, filter by type/category, and sort by date or amount
- **Role Based UI** — Switch between Viewer (read only) and Admin (add/delete transactions)
- **Insights Section** — Top spending category, worst expense month, savings rate, average expense
- **Responsive Layout** — Works on mobile and desktop
- **Empty States** — Handled gracefully when filters return no results

## Tech Stack

- React 18 (Vite)
- Recharts for data visualization
- Pure CSS with CSS variables for theming
- No backend — all state managed with useState

## State Management Approach

All application state lives in the top level App component and gets passed down
as props. Transactions are stored in useState so any add or delete instantly
reflects across all views — summary cards, charts, and the table all update
together without any page refresh.

The role switcher works purely on the frontend. Admin role unlocks the add
transaction form and delete buttons. Viewer role hides them entirely.

## Setup
```bash
npm install
npm run dev
```

Open http://localhost:5173

## Folder Structure
```
src/
├── App.jsx       # All components and app logic
├── data.js       # Mock transactions data
└── index.css     # Global styles
```

## Assumptions Made

- Data is static and mock — no backend or real API
- Dates cover Jan–Apr 2026 to show meaningful monthly trends
- Role switching is frontend only for demonstration purposes
- INR currency used throughout
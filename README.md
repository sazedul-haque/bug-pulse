# BugPulse — Support Issue Tracker & Workflow Analytics

A high-performance, client-side issue tracking dashboard built with **React**, **TypeScript**, **Tailwind CSS**, and **SQLite WASM**. Designed to triage, categorize, analyze, and visualize customer support workflow issues directly in the browser with zero backend server requirement.

![BugPulse Dashboard](https://raw.githubusercontent.com/placeholder-demo.png)

---

## ✨ Features

- **⚡ In-Browser SQLite WASM Engine**: Full SQL relational query engine running directly in the browser.
- **📊 Real-time Analytics & KPI Metrics**: Auto-calculates resolution rates, ticket volumes, domain categorization breakdowns, and urgent queues.
- **📋 Interactive Kanban Board**: 6 workflow stage columns with drag/status updates.
- **📑 Searchable & Filterable Data Grid**: Multi-attribute sorting, full-text search, and pagination.
- **💻 SQLite Studio**: Interactive in-browser SQL query terminal with CSV export.
- **🌓 Light & Dark Theme Support**: High-contrast theme toggle with persistence.
- **🔄 Sync, Import & Export**: Import Slack workflow CSVs or export `.csv` / standalone `.sqlite` binaries.
- **🚀 100% GitHub Pages Ready**: Zero backend required — easily deployed to GitHub Pages via automated GitHub Actions.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/bug-pulse.git
cd bug-pulse

# Install dependencies using pnpm
pnpm install
```

### 2. Start the Development Server
```bash
pnpm dev
```
Open your browser at `http://localhost:5173/`.

### 3. Build for Production
```bash
pnpm build
```

---

## 🌐 Deploy to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push your code to the `main` branch.
2. In your GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The workflow will automatically build and publish your site!

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Database Engine**: `sql.js` (WebAssembly SQLite)
- **Charts**: Chart.js + `react-chartjs-2`
- **CSV Parser**: PapaParse

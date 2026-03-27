# CredServ | Autonomous Financial Orchestration 🚀

**Live Demo: [https://udaydomadiya08.github.io/credserv-mvp/](https://udaydomadiya08.github.io/credserv-mvp/)**

A high-fidelity, interactive demo of the CredServ ecosystem. This application transforms a technical MVP into a premium user experience, showcasing autonomous credit management, AI-native KYCเข้าใจ Understanding, and state-machine driven collections.

## ✨ Features

- **Premium Dashboard**: Glassmorphism UI with dark mode and neon accents.
- **Real-time Credit Engine**: Dynamic balance management with instant transaction validation.
- **AI-Native KYC (Phase 1 Simulation)**: Demonstrates VLM-powered bank statement extraction using Gemini 1.5 Flash.
- **Collections Orchestrator (Phase 2 Simulation)**: Visual representation of the LangGraph-based borrower lifecycle.
- **Dynamic Credit Scoring**: Simulated scoring algorithm that responds to financial behavior.
- **Immutable Audit Logs**: Visual feed of all transactions with timestamps.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Custom Theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Logic**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/udaydomadiya08/credserv-mvp.git
cd credserv-mvp

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📦 Project Structure

- `src/components/`: UI Components (Dashboard, Action Cards).
- `src/context/`: Core business logic and state management.
- `core-engine/`: Original Python MVP files (Phase 1-3).
- `dist/`: Production-ready build artifacts.

## 🚢 Deployment

### Deploy to Vercel
1. Push your code to GitHub.
2. Import the project in Vercel.
3. The configuration is automatically detected.

### Deploy to GitHub Pages
1. Install `gh-pages`: `npm install -D gh-pages`.
2. Update `vite.config.ts` to include `base: '/repo-name/'`.
3. Run `npm run build` and `npm run deploy`.

---

Built with ❤️ for the CredServ Case Study by **Uday Domadiya**.
Original backend logic preserved in `core-engine/`.

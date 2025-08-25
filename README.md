# AITA Frontend v2

Frontend for the **AITA Protocol**, built with [Next.js 15](https://nextjs.org) and the App Router.  
It powers the dashboard for **AI Trading Agents (AITA)** and integrates with smart contracts, vaults, and strategies.

---

## 🚀 Getting Started

Clone the repo:

```bash
git clone https://github.com/aqtisofficial/aita-frontend-v2.git
cd aita-frontend-v2
```

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3011](http://localhost:3011) in your browser.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Server & Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Web3**: [wagmi](https://wagmi.sh), [RainbowKit](https://www.rainbowkit.com)
- **State / Data**: [TanStack Query](https://tanstack.com/query/latest)
- **Charts**: [Recharts](https://recharts.org)
- **Icons**: [Lucide](https://lucide.dev), [Tabler Icons](https://tabler-icons.io)

---

## 📂 Project Structure

- `app/` → Next.js App Router routes (pages, layouts, API routes)
- `components/` → Reusable UI and feature components  
  - `agents/` → Agent-related components  
  - `vaults/` → Vault UI + charts  
  - `ui/` → Shared design system (cards, buttons, toggles, etc.)
- `lib/` → Helpers, env config, constants
- `public/` → Static assets
- `styles/` → Global CSS

---

## ✨ Features

- Wallet connection (MetaMask, Rabby, Rainbow, Trust) via RainbowKit
- Create and manage AI trading agents
- Vault overview with charts (PnL, account value)
- Backtesting and strategy pages
- Dark theme by default

---

## 📚 Resources

- [AITA Protocol GitHub](https://github.com/aqtisofficial)
- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create your feature branch: `git checkout -b feature/my-feature`  
3. Commit your changes: `git commit -m 'Add new feature'`  
4. Push to the branch: `git push origin feature/my-feature`  
5. Open a Pull Request  

We follow conventional commit messages and prefer small, focused PRs.

---

## 📝 License

This project is part of the [AITA Protocol](https://github.com/aqtisofficial).  
All rights reserved © AITA.
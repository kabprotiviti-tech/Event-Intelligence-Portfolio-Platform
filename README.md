# EIPP — Event Intelligence & Portfolio Platform
**Abu Dhabi Events Bureau (DCT)**

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features
- **Dashboard** — Calendar heatmap + gap insights + concept previews
- **Gap Finder** — AD vs Dubai density matrix + cross-city opportunities
- **Concepts** — AI-generated event recommendations based on gaps
- **Portfolio** — Scored event portfolio with budget simulation

## Stack
- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- All logic in `lib/` — pure functions, no framework dependency
- Mock data in `data/` — swap `lib/data-provider.ts` for real APIs

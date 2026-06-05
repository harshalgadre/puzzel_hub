# Crack the Code

A real-time group puzzle game built with Next.js. Each group enters a 4-digit code to reveal their word. When all groups unlock, the final message appears.

## Features

- Main puzzle page at `/`
- Admin panel at `/admin` to edit groups, codes, words, and final message
- Persistent unlock state (survives page refresh)
- Live sync every 2 seconds across all open tabs/devices

## Getting started

1. Install [Node.js](https://nodejs.org/) (v18+)
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Default codes

| Group   | Code | Word     |
|---------|------|----------|
| Group 1 | 1111 | HEAD     |
| Group 2 | 2222 | TO       |
| Group 3 | 3333 | THE      |
| Group 4 | 4444 | CANTEEN  |

Final message: **Head to the Canteen!**

## Data storage

Game state is saved to `data/state.json` on the server. Unlock progress and admin config persist across refreshes and sync in real time.

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm start` — run production server

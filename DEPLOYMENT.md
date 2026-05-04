# Deployment Guide

## Frontend → Vercel

### Option A: Deploy from Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects the root `vercel.json` — no extra config needed
4. Add environment variable in Vercel dashboard:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
   - (Leave empty to run in offline/localStorage-only mode)
5. Click Deploy

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel --cwd exam-system
```

---

## Backend → Railway (recommended for SQLite)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `exam-system-backend` folder as root
3. Add environment variables:
   ```
   PORT=5000
   JWT_SECRET=<generate a long random string>
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
4. Railway auto-runs `npm start`
5. Copy the Railway URL → paste as `VITE_API_URL` in Vercel

---

## Offline / Demo Mode (no backend needed)

The app works fully without a backend using localStorage.
All seed data (GBU exam data) loads automatically on first visit.
Just deploy the frontend to Vercel — no backend required for demo.

---

## Notes

- The SQLite `.db` file is excluded from git (`.gitignore`)
- Backend uses `node-sqlite3-wasm` — no native bindings, works on any platform
- Frontend falls back to localStorage if backend is unreachable

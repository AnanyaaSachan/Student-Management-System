# Deployment Guide

Student Management System — Production Deployment Instructions

**Table of Contents**
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Offline Demo Mode](#offline--demo-mode-no-backend-needed)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Repository pushed to GitHub with all changes committed
- [ ] No sensitive data in `.env` files (they're in `.gitignore`)
- [ ] Both `package.json` files have clean dependencies
- [ ] Frontend builds successfully: `npm run build` in `exam-system/`
- [ ] Backend has `node_modules` installed
- [ ] All environment variables documented (see [Environment Variables](#environment-variables))
- [ ] Default credentials changed in production database
- [ ] CORS settings correctly configured for production URLs
- [ ] Health check endpoint responds: `GET /api/health`

---

## Frontend Deployment (Vercel)

### Option A: Deploy from Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Create Project on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel automatically detects the root `vercel.json` configuration

3. **Configure Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-api.railway.app/api`
   - (Leave empty to run in offline/localStorage-only mode)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (typically 2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy from the project root
vercel --cwd exam-system

# Set environment variables when prompted
# Follow the interactive setup
```

---

## Backend Deployment (Railway)

### Prerequisites
- Railway account at [railway.app](https://railway.app)
- GitHub repository with `exam-system-backend` folder

### Step-by-Step

1. **Create New Project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize GitHub and select your repository

2. **Configure Deployment**
   - Select `exam-system-backend` as the root directory (or specify in Railway settings)
   - Set the start command to `npm start` (if not auto-detected)

3. **Add Environment Variables**
   - In Railway Project → Variables
   - Add the following:
     ```
     PORT=5000
     JWT_SECRET=<generate-a-long-random-string>
     FRONTEND_URL=https://your-frontend.vercel.app
     NODE_ENV=production
     ```

4. **Deploy**
   - Railway auto-deploys from main branch
   - View logs to confirm it's running
   - Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

5. **Connect Frontend to Backend**
   - In Vercel Dashboard, update `VITE_API_URL` to your Railway URL + `/api`
   - Example: `VITE_API_URL=https://your-app.up.railway.app/api`
   - Vercel will auto-redeploy

---

## Environment Variables

### Backend (`exam-system-backend/.env`)

```bash
# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=<generate-a-long-random-secret-string>

# CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Database
# SQLite database is stored in data/ folder (auto-created)
```

#### Generating a Secure JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (`exam-system/.env.local`)

```bash
# API Configuration
VITE_API_URL=https://your-backend-api.railway.app/api

# Leave empty to use offline/localStorage mode
```

---

## Post-Deployment Testing

### 1. Test Health Endpoint
```bash
curl https://your-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "GBU Exam Management System API",
  "version": "1.0.0",
  "timestamp": "2024-05-08T10:30:00.000Z"
}
```

### 2. Test Login Endpoint
```bash
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Test Frontend
- Visit `https://your-app.vercel.app`
- Verify the app loads without errors
- Open Browser DevTools → Network tab
- Check that API calls go to your backend URL
- Try logging in with default credentials

---

## Offline / Demo Mode (No Backend Needed)

The application is designed to work **completely offline** using `localStorage`:

- ✅ All features work without backend
- ✅ Seed data (GBU exam data) auto-loads on first visit
- ✅ Authentication simulated via localStorage
- ✅ Student data, seating, attendance all stored locally
- ✅ Perfect for demo/testing without backend deployment

### To Run in Demo Mode:
1. Deploy **only** the frontend to Vercel
2. Leave `VITE_API_URL` empty (or comment it out)
3. App automatically falls back to localStorage

---

## Troubleshooting

### Build Errors in Vercel

**Error: "Command 'npm run build' failed"**
- Check that all dependencies are in `package.json`
- Verify Node version: `node --version` (should be 18+)
- Run locally: `npm install && npm run build` to test

### Backend Not Connecting

**Error: "Cannot reach backend API"**
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check Railway logs for errors: `railway logs`
3. Test backend health: `curl https://your-backend.up.railway.app/api/health`
4. Check CORS configuration in `exam-system-backend/src/index.js`

### CORS Errors

**Error: "Cross-Origin Request Blocked"**
- Verify `FRONTEND_URL` in Railway matches your Vercel domain
- Ensure `FRONTEND_URL` includes `https://` but NO trailing slash
- Check that backend CORS middleware includes both URLs

### Database Issues

**Error: "Database locked" or "Cannot create database"**
- SQLite database stored in `exam-system-backend/data/`
- Ensure Railway has write permissions to `/tmp` or persistent storage
- Default admin account created automatically on first run

### How to Change Default Admin Credentials

Edit `exam-system-backend/src/database/schema.js` and update the seed data, or use the change password API:
```bash
curl -X PUT https://your-backend.up.railway.app/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"admin123","newPassword":"your-new-password"}'
```

---

## Deployment Summary

| Component | Platform | Status URL | Command |
|-----------|----------|-----------|---------|
| Frontend | Vercel | `https://your-app.vercel.app` | `npm run build` |
| Backend | Railway | `https://your-app.up.railway.app` | `npm start` |
| Database | Railway (SQLite) | N/A | Auto-managed |

---

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Production Build](https://react.dev/learn/react-compiler)

---

## Notes

- The SQLite `.db` file is excluded from git (`.gitignore`)
- Backend uses `node-sqlite3-wasm` — no native bindings, works cross-platform
- Frontend falls back to localStorage if backend is unreachable
- All seed data loads automatically on first run
- JWT tokens are stored in localStorage (client-side)

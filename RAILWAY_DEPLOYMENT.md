# Railway Deployment Guide

## Prerequisites
- Railway account at https://railway.app
- GitHub repository with your code

## Deployment Steps

### 1. Connect Repository
- Login to Railway
- Click "New Project" → "Deploy from GitHub repo"
- Select your GenRemnant server repository

### 2. Environment Variables
In Railway dashboard, add these variables:
```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Build Configuration
**Build Command:** `npm install && npm rebuild sqlite3`
**Start Command:** `npm start`

The rebuild command fixes SQLite3 binary compatibility issues on Railway's Linux environment.

### 4. Database Setup
Add to your Railway service:
```bash
# Railway will run these automatically on deploy
npm run setup-db
```

Add this script to package.json:
```json
{
  "scripts": {
    "setup-db": "node setupDatabase.js && node createAdminUser.js"
  }
}
```

### 5. Deploy
- Push code to GitHub
- Railway auto-deploys on push
- Get your app URL from Railway dashboard

## Important Notes
- SQLite file persists in Railway's volume storage
- Database resets on redeploy (use PostgreSQL for production)
- Railway provides HTTPS automatically
- Update CORS_ORIGIN to match your frontend URL

## Production Database (Recommended)
For production, use Railway's PostgreSQL:
1. Add PostgreSQL service in Railway
2. Update database.js to use PostgreSQL connection
3. Install `pg` package: `npm install pg`
# Vercel Postgres Setup Guide

## Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on **Storage** tab

2. **Create Database**
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Choose **"Continue"**
   - Database name: `wmealplan-db` (or your choice)
   - Region: Choose closest to you
   - Click **"Create"**

3. **Note Your Connection**
   - After creation, you'll see environment variables
   - These will be automatically added to your project

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to https://vercel.com/new
   - Click **"Import Git Repository"**
   - Select: `wilsonnguyen257/WMealPlan`
   - Click **"Import"**

2. **Configure Project**
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: `npm run vercel-build`
   - Output Directory: (leave empty)

3. **Environment Variables**
   Add these manually:
   
   | Variable | Value |
   |----------|-------|
   | `GEMINI_API_KEY` | `your-gemini-api-key-here` |
   | `NODE_ENV` | `production` |

   **Note**: Postgres variables (`POSTGRES_URL`, etc.) are auto-added when you link the database

4. **Link Database**
   - In project settings → **Storage**
   - Click **"Connect Store"**
   - Select your Postgres database
   - Click **"Connect"**

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Done! 🎉

### Option B: Via Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd D:\WMealPlan
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: wmealplan
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add GEMINI_API_KEY
# Paste: your-gemini-api-key-here

vercel env add NODE_ENV
# Enter: production

# Link database in dashboard, then redeploy
vercel --prod
```

## Step 3: Verify Database Connection

After deployment:

1. Visit your app: `https://your-project.vercel.app`
2. Generate a meal plan
3. Click **"Save This Meal Plan"**
4. Check **"View Saved Plans"** button
5. Your plan should be there! ✅

## Troubleshooting

### Database Connection Issues

If you see errors:
1. Check Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these exist:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `GEMINI_API_KEY`
   - `NODE_ENV`

3. Redeploy if needed:
   ```powershell
   vercel --prod
   ```

### Local Development

Your local environment still uses SQLite:
```powershell
npm run dev
# or
npm run server
```

To test with Postgres locally, add to `.env`:
```
POSTGRES_URL=your_vercel_postgres_url
```

## Database Migration (Automatic)

The app automatically:
- ✅ Creates tables on first connection
- ✅ Uses Postgres in production (Vercel)
- ✅ Uses SQLite locally (development)

No manual migration needed! 🎯

## Your Live URLs

After deployment:
- **App**: `https://wmealplan.vercel.app`
- **API Health**: `https://wmealplan.vercel.app/api/health`

## Features Now Enabled

✅ **Persistent Storage** - Saved meal plans persist forever
✅ **Auto-deployments** - Every git push deploys automatically
✅ **Free SSL** - Secure HTTPS
✅ **Global CDN** - Fast worldwide
✅ **Custom Domain** - Add in Vercel settings

## Cost

- **Vercel Hobby Plan**: FREE
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS

- **Vercel Postgres**: FREE (Starter)
  - 256 MB storage
  - 60 hours compute/month
  - Perfect for your app! 🎉

## Next Steps

1. Deploy to Vercel ✅
2. Create Postgres database ✅
3. Link database to project ✅
4. Test saved meal plans ✅
5. Optional: Add custom domain
6. Share with friends! 🚀

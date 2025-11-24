# Deploying to Vercel

## Quick Deploy

1. **Install Vercel CLI** (optional):
   ```powershell
   npm install -g vercel
   ```

2. **Push to GitHub** (if not already done):
   ```powershell
   git add .
   git commit -m "Add Vercel configuration"
   git push
   ```

3. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository: `wilsonnguyen257/WMealPlan`
   - Configure:
     - **Framework Preset**: Other
     - **Root Directory**: `./`
     - **Build Command**: `npm run vercel-build`
     - **Output Directory**: `client/build`

4. **Add Environment Variables** (CRITICAL):
   - In Vercel Project Settings → Environment Variables, add:
     - `GEMINI_API_KEY` = `your-new-api-key-here`
     - `NODE_ENV` = `production`

5. **Deploy!** - Click "Deploy"

## Or Deploy via CLI

```powershell
cd d:\WMealPlan
vercel
# Follow the prompts
# When asked for environment variables, add GEMINI_API_KEY
```

## Important Notes

⚠️ **SQLite Database Limitation**:
- Vercel uses **serverless functions** with **read-only file systems**
- SQLite (file-based database) **won't persist** data between deployments
- **Saved meal plans will be lost** on each deployment

### Solutions for Database:

**Option 1: Use Vercel Postgres** (Recommended)
- Free tier: 256 MB storage
- Sign up at https://vercel.com/storage/postgres
- I can help migrate from SQLite to Postgres

**Option 2: Use MongoDB Atlas** (Free)
- Free tier: 512 MB storage
- Cloud database, works with serverless

**Option 3: Keep SQLite for Demo**
- Data won't persist, but app will work
- Good for testing/demo purposes

Would you like me to:
1. Keep current setup (SQLite - data won't persist)?
2. Migrate to Vercel Postgres?
3. Migrate to MongoDB Atlas?

## Your Live URL

After deployment, your app will be available at:
- `https://wmealplan.vercel.app` (or similar)
- Custom domain available in settings

## Auto-Deployments

Vercel automatically redeploys when you push to GitHub! 🚀

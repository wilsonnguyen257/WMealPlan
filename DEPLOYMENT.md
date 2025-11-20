# Deployment Guide

## Option 1: Deploy to Render (Recommended - Free Tier Available)

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

### Step 1: Prepare for Deployment

1. **Add production build script** (already done)
2. **Create start script for production**

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Weekly Meal Prep Planner"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wmealplan.git
git push -u origin main
```

### Step 3: Deploy on Render

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `wmealplan`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd client && npm install && npm run build && cd ..`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   - Click **"Environment"**
   - Add: `GEMINI_API_KEY` = `your_gemini_api_key_here`
   - Add: `PORT` = `3001`

6. Click **"Create Web Service"**

Your app will be live at: `https://wmealplan.onrender.com` 🎉

---

## Option 2: Deploy to Railway

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Railway

1. Go to https://railway.app/
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect Node.js
5. Add Environment Variables:
   - `GEMINI_API_KEY` = `your_gemini_api_key_here`
   - `PORT` = `3001`

6. Click **"Deploy"**

Your app will be live at: `https://YOUR_APP.railway.app` 🎉

---

## Important Notes

### Database Persistence
- The SQLite database will persist on Render/Railway
- For better production reliability, consider upgrading to PostgreSQL later

### Environment Variables
Make sure to set:
- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - Port number (usually 3001)

### Custom Domain (Optional)
Both platforms support custom domains in their settings.

---

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility

### App Won't Start
- Check environment variables are set correctly
- Review deployment logs for errors

### Database Issues
- SQLite works great for small apps
- For heavy usage, migrate to PostgreSQL

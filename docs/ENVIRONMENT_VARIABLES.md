# Environment Variables Configuration Guide

This guide explains all environment variables needed for WMealPlan.

---

## 🔑 Backend Environment Variables

### File: `.env` (Production)

Copy `.env.example` to `.env` and fill in the values:

```bash
# ============================================
# CORE CONFIGURATION
# ============================================

NODE_ENV=production
PORT=3001

# ============================================
# GOOGLE GEMINI AI API
# ============================================
# Get your API key from: https://makersuite.google.com/app/apikey
# Free tier: 60 requests/minute
# Paid tier recommended for production
GEMINI_API_KEY=your-gemini-api-key-here

# ============================================
# FIREBASE ADMIN SDK (Server-Side)
# ============================================
# Get these from Firebase Console > Project Settings > Service Accounts
# Click "Generate new private key"

FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Important: Keep the quotes and \n for newlines in FIREBASE_PRIVATE_KEY

# ============================================
# CORS AND CLIENT URL
# ============================================
# Your production frontend URL
CLIENT_URL=https://your-domain.com

# ============================================
# RATE LIMITING
# ============================================
# Window in milliseconds (900000 = 15 minutes)
RATE_LIMIT_WINDOW_MS=900000
# Maximum requests per window
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# SECURITY SECRETS
# ============================================
# Generate strong secrets using:
# PowerShell: $bytes = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); [System.Convert]::ToBase64String($bytes)
# Unix: openssl rand -base64 32

SESSION_SECRET=generate-secure-32-char-random-string-here
JWT_SECRET=generate-another-secure-32-char-random-string-here

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true
ENABLE_BETA_FEATURES=false

# ============================================
# LOGGING
# ============================================
# Options: error, warn, info, debug
LOG_LEVEL=info

# ============================================
# DATABASE (Auto-configured by Vercel)
# ============================================
# These are automatically set by Vercel when you add Postgres
# No need to manually configure:
# POSTGRES_URL
# POSTGRES_PRISMA_URL
# POSTGRES_URL_NON_POOLING
# POSTGRES_USER
# POSTGRES_HOST
# POSTGRES_PASSWORD
# POSTGRES_DATABASE
```

---

## 🎨 Frontend Environment Variables

### File: `client/.env.production`

Create this file in the `client/` directory:

```bash
# ============================================
# FIREBASE CLIENT SDK (Browser-Side)
# ============================================
# Get these from Firebase Console > Project Settings > General
# Your web app's Firebase configuration

REACT_APP_FIREBASE_API_KEY=your-web-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Note: These are safe to commit as they're client-side identifiers
# Security is enforced by Firebase Security Rules, not by hiding these values

# ============================================
# API ENDPOINT (Optional)
# ============================================
# Only needed if API is on different domain
# Otherwise, proxy settings in package.json handle this
# REACT_APP_API_URL=https://api.your-domain.com
```

---

## 🔧 Development Environment Variables

### File: `.env.local` (Local Development)

For local development, create `.env.local`:

```bash
NODE_ENV=development
PORT=3001

GEMINI_API_KEY=your-dev-api-key
FIREBASE_PROJECT_ID=your-dev-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-dev-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

CLIENT_URL=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

SESSION_SECRET=dev-secret-not-for-production
JWT_SECRET=dev-jwt-secret-not-for-production

LOG_LEVEL=debug
ENABLE_ANALYTICS=false
ENABLE_ERROR_TRACKING=false
```

### File: `client/.env.local` (Frontend Development)

```bash
REACT_APP_FIREBASE_API_KEY=your-dev-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-dev-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:devabcdef
```

---

## 📝 Setting Environment Variables in Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. For each variable:
   - Enter the name (e.g., `GEMINI_API_KEY`)
   - Enter the value
   - Select environment: **Production** (and optionally Preview, Development)
   - Click **Save**

### Option 2: Vercel CLI

```bash
# Add a single variable
vercel env add GEMINI_API_KEY production

# You'll be prompted to enter the value

# Pull all variables to local file (for testing)
vercel env pull .env.local
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Use strong, randomly generated secrets (32+ characters)
- Rotate secrets every 90 days
- Use different keys for development and production
- Store secrets in password manager
- Use environment variables, never hardcode
- Keep `.env` files in `.gitignore`

### ❌ DON'T:
- Commit `.env` files to git
- Share secrets in Slack/email
- Use weak or simple secrets
- Reuse secrets across projects
- Put secrets in client-side code

---

## 🧪 Testing Your Configuration

### 1. Verify Backend Variables

```powershell
# Check if all required variables are set
Check-Environment

# Test server health
Test-Health
```

### 2. Test Firebase Connection

```powershell
# Start server
npm run server

# In another terminal, test auth endpoint
curl http://localhost:3001/api/health
```

### 3. Test Gemini API

Generate a meal plan through the UI. Check console for:
```
✅ Should see: "Meal plan generated successfully"
❌ If error: Check GEMINI_API_KEY is correct
```

---

## 🚨 Troubleshooting

### Error: "API key not configured"
- Check `GEMINI_API_KEY` is set in Vercel
- Verify key is valid at https://makersuite.google.com
- Check for typos or extra spaces

### Error: "Firebase authentication failed"
- Verify `FIREBASE_PROJECT_ID` matches your project
- Check `FIREBASE_PRIVATE_KEY` includes `\n` for newlines
- Ensure private key is wrapped in quotes

### Error: "Database connection failed"
- Database should auto-configure in Vercel
- Check Vercel Storage tab shows Postgres database
- Verify database and functions are in same region

### Error: "CORS error"
- Check `CLIENT_URL` matches your frontend domain
- Include protocol (https://)
- No trailing slash

---

## 📋 Complete Checklist

Before deploying to production:

- [ ] All backend variables set in Vercel
- [ ] All frontend variables set in Vercel
- [ ] Secrets are strong and unique
- [ ] Different keys for dev and prod
- [ ] `.env` files in `.gitignore`
- [ ] Firebase project created for production
- [ ] Gemini API key has sufficient quota
- [ ] Database created in Vercel
- [ ] CLIENT_URL points to production domain
- [ ] Tested locally with production config (using vercel env pull)

---

## 🔄 Variable Update Procedure

When you need to update a variable:

1. **Update in Vercel Dashboard**
   - Settings > Environment Variables
   - Find variable
   - Click Edit
   - Enter new value
   - Save

2. **Redeploy**
   - Vercel automatically redeploys on variable change
   - Or manually: `vercel --prod`

3. **Verify**
   - Check deployment logs
   - Test affected features
   - Monitor for errors

---

## 📖 Additional Resources

- **Vercel Env Docs:** https://vercel.com/docs/concepts/projects/environment-variables
- **Firebase Setup:** https://firebase.google.com/docs/admin/setup
- **Gemini API:** https://ai.google.dev/tutorials/setup
- **Security Best Practices:** https://cheatsheetseries.owasp.org/

---

**Remember:** Never commit secrets to version control!

If you accidentally commit a secret:
1. Immediately rotate the secret
2. Update all deployments
3. Consider using `git filter-branch` to remove from history

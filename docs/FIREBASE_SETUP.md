# Firebase Authentication Setup Guide

## Why Firebase?

Firebase Authentication provides:
- ✅ **Free tier** - No database costs
- ✅ **Built-in password reset** - Email-based recovery
- ✅ **Easy deployment** - Works on Vercel automatically
- ✅ **Secure** - Industry-standard authentication
- ✅ **No database management** - Firebase handles everything

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it: `wmealplan` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Enable **Email/Password**
4. Click **Save**

### 3. Get Frontend Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register app name: `WMealPlan Web`
5. Copy the `firebaseConfig` object

### 4. Configure Frontend

Create `client/.env.local`:

```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

### 5. Get Backend Configuration (Service Account)

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Open the JSON file and extract these values:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

### 6. Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **WMealPlan** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `FIREBASE_PROJECT_ID` | your-project-id | Production, Preview, Development |
| `FIREBASE_CLIENT_EMAIL` | firebase-adminsdk-...@... | Production, Preview, Development |
| `FIREBASE_PRIVATE_KEY` | "-----BEGIN PRIVATE..." | Production, Preview, Development |
| `REACT_APP_FIREBASE_API_KEY` | AIzaSy... | Production, Preview, Development |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production, Preview, Development |
| `REACT_APP_FIREBASE_PROJECT_ID` | your-project-id | Production, Preview, Development |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | Production, Preview, Development |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | 123456789012 | Production, Preview, Development |
| `REACT_APP_FIREBASE_APP_ID` | 1:123456789012:web:xxx | Production, Preview, Development |

**Important for FIREBASE_PRIVATE_KEY:**
- Keep the quotes around the entire key
- Include `\n` characters (they should be literal backslash-n, not actual newlines)
- The value should look like: `"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"`

### 7. Local Development

Add to root `.env`:

```bash
GEMINI_API_KEY=your-gemini-api-key
PORT=3001

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\n-----END PRIVATE KEY-----\n"
```

### 8. Test Locally

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Run development server
npm run dev
```

Open `http://localhost:3000` and try:
1. **Sign up** with a new account
2. **Log in** with your credentials
3. **Forgot password** - Click "Forgot password?" to test email reset

### 9. Deploy to Vercel

```bash
git add .
git commit -m "Switch to Firebase Authentication with password reset"
git push origin main
```

Vercel will auto-deploy. Check deployment logs for any errors.

## Features Included

✅ **User Registration** - Create account with email/password
✅ **Login** - Secure authentication
✅ **Logout** - Clear session
✅ **Password Reset** - Email-based recovery (automatic)
✅ **Email Verification** - Optional (can enable in Firebase Console)
✅ **User Isolation** - Each user sees only their meal plans

## Password Reset

Users can reset their password:
1. Click "Forgot password?" on login screen
2. Enter email address
3. Firebase sends password reset email
4. User clicks link in email
5. User enters new password

No additional code needed - Firebase handles everything!

## Troubleshooting

**"Firebase: Error (auth/configuration-not-found)"**
- Make sure all `REACT_APP_FIREBASE_*` variables are set
- Check that `.env.local` exists in `client/` folder
- Restart development server after adding env vars

**"Firebase Admin SDK error"**
- Verify `FIREBASE_PRIVATE_KEY` includes `\n` characters
- Make sure the private key is wrapped in quotes
- Check that all three Firebase Admin variables are set in Vercel

**"CORS error"**
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains

## Migration from JWT

The old JWT/Postgres authentication has been removed. All existing users will need to create new Firebase accounts. This provides:
- Better security
- No database costs
- Built-in password reset
- Easier maintenance

## Next Steps

After setup:
- Test signup/login flow
- Try password reset feature
- Deploy to Vercel
- Share your app! 🎉

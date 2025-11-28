# Quick Start: Firebase Setup for WMealPlan

## Step 1: Create Firebase Project (2 minutes)

1. Go to https://console.firebase.google.com
2. Click "Add project" → Name it "WMealPlan" → Create
3. Click "Authentication" in left menu → "Get started"
4. Click "Email/Password" → Enable it → Save

## Step 2: Get Frontend Config (1 minute)

1. Click gear icon ⚙️ → "Project settings"
2. Scroll down → Click Web icon `</>`
3. App nickname: "WMealPlan" → Register app
4. Copy the config object (starts with `const firebaseConfig = {`)

## Step 3: Configure Frontend

Create file `client/.env.local` with:

```bash
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

(Use the values from step 2)

## Step 4: Get Backend Config (2 minutes)

1. In Firebase Console → Project settings → "Service accounts" tab
2. Click "Generate new private key" → Download JSON
3. Open the downloaded JSON file
4. Extract these 3 values:
   - `project_id`
   - `client_email`
   - `private_key`

## Step 5: Add to Vercel (3 minutes)

1. Go to https://vercel.com/dashboard
2. Click your WMealPlan project → Settings → Environment Variables
3. Add these (copy from the JSON file):

```
FIREBASE_PROJECT_ID = your-project-id
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com  
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Plus the frontend vars:**
```
REACT_APP_FIREBASE_API_KEY = your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 123456789
REACT_APP_FIREBASE_APP_ID = 1:123456789:web:abc123
```

Select "Production, Preview, and Development" for all variables.

## Step 6: Redeploy

Vercel auto-deploys when you push to GitHub. Wait 2-3 minutes, then:

1. Go to your Vercel app URL
2. Click "Sign up"
3. Create an account
4. Try "Forgot password?" to test password reset! ✅

## Features Now Working

✅ Sign up with email/password
✅ Login
✅ Logout  
✅ **Password reset via email** (automatic!)
✅ Secure authentication
✅ No database needed
✅ Free forever

## Troubleshooting

**Can't login after deployment?**
- Wait 3-5 minutes for Vercel to rebuild
- Check Vercel deployment logs for errors
- Verify all environment variables are set

**Firebase error on signup?**
- Make sure you enabled Email/Password in Firebase Console
- Check browser console for specific error message

**Password reset email not sending?**
- Check spam folder
- Verify email is correct in Firebase Users tab
- Firebase free tier has email limits (test with different emails)

That's it! Firebase handles everything else automatically. 🎉

# Authentication System Documentation

## Overview

WMealPlan now includes a complete JWT-based authentication system that ensures user data isolation and secure access to meal planning features.

## Features

✅ **User Registration & Login**
- Email/password authentication
- Secure password hashing with bcrypt
- Password validation (minimum 6 characters)

✅ **JWT Token-Based Sessions**
- 7-day token expiration
- Stored in both localStorage and httpOnly cookies
- Automatic token validation on app load

✅ **User Data Isolation**
- Each user only sees their own meal plans
- Database-level isolation with user_id foreign key
- CASCADE delete: removing user deletes their meal plans

✅ **Protected API Endpoints**
- All meal plan operations require authentication
- Token verification middleware
- Proper error handling (401 Unauthorized, 403 Forbidden)

## Architecture

### Backend Components

**1. Database Schema (`database-postgres.js`)**
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal plans with user ownership
CREATE TABLE meal_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ...
);
```

**2. Authentication Middleware (`middleware/auth.js`)**
- `authenticateToken()`: Validates JWT from cookie or Authorization header
- `generateToken()`: Creates signed JWT with 7-day expiration
- Uses `JWT_SECRET` from environment variables

**3. Authentication Endpoints (`server.js`)**
- `POST /api/auth/signup`: Register new user
- `POST /api/auth/login`: Login with credentials
- `POST /api/auth/logout`: Clear session
- `GET /api/auth/me`: Get current user info

**4. Protected Endpoints**
All these now require authentication:
- `POST /api/generate-meal-plan`
- `POST /api/save-meal-plan`
- `GET /api/meal-plans`
- `GET /api/meal-plans/:id`
- `DELETE /api/meal-plans/:id`
- `POST /api/generate-from-pantry`
- `POST /api/search-recipes`

### Frontend Components

**1. Authentication Context (`client/src/context/AuthContext.js`)**
```javascript
const { user, token, isAuthenticated, login, signup, logout } = useAuth();
```
- Global authentication state management
- Automatic token validation on mount
- Token persistence in localStorage

**2. Authentication UI**
- `AuthPage.js`: Login/Signup toggle
- `Login.js`: Email/password login form
- `Signup.js`: User registration form
- `Auth.css`: Minimal aesthetic styling

**3. Protected App (`client/src/App.js`)**
- Shows `AuthPage` when not authenticated
- Shows main app when logged in
- Displays user email in header
- Logout button with session clearing

**4. API Integration**
All components updated to send JWT tokens:
- `SavedMealPlans.js`: GET/DELETE meal plans
- `PantryMeals.js`: Generate from pantry
- `RecipeSearch.js`: Search recipes
- `App.js`: Generate/save meal plans

## Installation

### Dependencies
```bash
npm install bcryptjs jsonwebtoken cookie-parser
```

### Environment Variables
Add to `.env`:
```bash
# JWT Authentication Secret
JWT_SECRET=b4f8c9e2d1a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
```

**⚠️ IMPORTANT**: Change `JWT_SECRET` to a secure random string in production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Usage Flow

1. **First Visit**: User sees login/signup page
2. **Signup**: User creates account with email/password
3. **Login**: User signs in, receives JWT token
4. **Authenticated Session**: 
   - Token stored in localStorage + httpOnly cookie
   - All API requests include Authorization header
   - User can access meal planning features
5. **Logout**: Clears token and returns to login page

## Security Features

🔒 **Password Security**
- Bcrypt hashing with default salt rounds (10)
- Passwords never stored in plain text
- Minimum 6 character requirement

🔒 **Token Security**
- JWT signed with secret key
- 7-day expiration to limit exposure
- Both cookie (httpOnly) and localStorage storage
- Verified on every protected endpoint

🔒 **Data Isolation**
- Database-level user_id filtering
- Server validates user ownership before operations
- No cross-user data access

🔒 **CORS Protection**
- Credentials enabled for cookie support
- Origin validation
- Secure flag in production

## API Authentication

### Request Format
```javascript
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Response Codes
- `200`: Success
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (valid token but no access)
- `409`: Conflict (email already exists)

## Testing

### Local Testing
**Note**: Requires PostgreSQL database connection

1. Set `POSTGRES_URL` in `.env` (or deploy to Vercel for auto-setup)
2. Start development server: `npm run dev`
3. Test signup at `http://localhost:3000`
4. Verify user data isolation

### Production Testing (Vercel)
1. Deploy to Vercel (see `POSTGRES_SETUP.md`)
2. Database automatically connected
3. Test complete authentication flow
4. Verify JWT_SECRET is set in Vercel environment variables

## Troubleshooting

**"Missing connection string" error**
- Local: Add `POSTGRES_URL` to `.env`
- Production: Link Vercel Postgres database in dashboard

**"Invalid token" or 401 errors**
- Clear localStorage and cookies
- Login again to get fresh token
- Verify `JWT_SECRET` matches between requests

**Email already exists**
- Use different email address
- Or login with existing credentials

## Database Migrations

The authentication system auto-creates tables on first run:
- `users` table
- `meal_plans` table with `user_id` foreign key
- Index on `user_id` for performance

No manual migration needed.

## Next Steps

After authentication is working:
- ✅ All users have isolated meal plans
- ✅ Secure access to meal generation features
- ✅ Session management with logout
- Consider adding: password reset, email verification, OAuth login

## File Changes Summary

**New Files:**
- `middleware/auth.js`
- `client/src/context/AuthContext.js`
- `client/src/components/Login.js`
- `client/src/components/Signup.js`
- `client/src/components/AuthPage.js`
- `client/src/components/Auth.css`

**Modified Files:**
- `database-postgres.js`: Added users table, user_id FK
- `server.js`: Auth endpoints + protected routes
- `client/src/App.js`: AuthProvider + conditional rendering
- `client/src/App.css`: Logout button styles
- `client/src/components/SavedMealPlans.js`: Auth headers
- `client/src/components/PantryMeals.js`: Auth headers
- `client/src/components/RecipeSearch.js`: Auth headers
- `.env`: Added JWT_SECRET

**Dependencies Added:**
- `bcryptjs`: v2.4.3
- `jsonwebtoken`: v9.0.2
- `cookie-parser`: v1.4.6

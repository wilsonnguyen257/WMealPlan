# WMealPlan

🎉 **Production-Ready!** AI-powered meal planning assistant that helps you plan weekly meals, find recipes, and generate smart shopping lists.

## ✨ Features

### Core Functionality
- **Weekly Meal Planner** - Generate personalized 7-day meal plans with recipes
- **Pantry Chef** - Create recipes from ingredients you already have
- **Recipe Search** - Find recipes by name, ingredient, or cuisine type
- **Smart Shopping** - Automated grocery lists with price estimates from Coles, Woolworths & Aldi
- **Meal Prep Instructions** - One-day prep planning for the entire week
- **Save & Manage** - Store and reload your favorite meal plans
- **PDF Export** - Download meal plans as professional PDFs

### Production Features
- 🔒 **Enterprise Security** - Rate limiting, input sanitization, security headers
- 📊 **Monitoring** - Health checks, structured logging, error tracking
- 🚀 **Performance** - Optimized for speed and scalability
- 📱 **SEO Optimized** - Rich meta tags, structured data, social media ready
- ♿ **Accessible** - ARIA labels, keyboard navigation
- 🌍 **Compliant** - GDPR/CCPA ready with privacy policy and terms

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini API key ([Get free key](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and install dependencies:**
```bash
npm install
cd client && npm install && cd ..
```

2. **Set up environment variables:**
```bash
# Create .env file in root directory
GEMINI_API_KEY=your-api-key-here
PORT=3001
```

3. **Run the application:**
```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or run separately:
npm run server  # Backend on port 3001
npm run client  # Frontend on port 3000
```

4. **Open browser:** Navigate to `http://localhost:3000`

## Project Structure

```
WMealPlan/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── docs/                  # Documentation files
├── server.js              # Express backend server
├── database-postgres.js   # PostgreSQL database
├── vercel.json            # Vercel deployment config
└── package.json           # Backend dependencies
```

## Tech Stack

- **Frontend:** React 18, CSS3
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Vercel Postgres)
- **AI:** Google Gemini 2.5 Flash
- **Deployment:** Vercel

## Deployment

The app is configured for Vercel deployment with serverless functions. See `docs/VERCEL_DEPLOY.md` for detailed instructions.

## 📚 Documentation

### For Developers
- **`QUICKSTART.md`** - Get started in 5 minutes
- **`docs/PRODUCTION_DEPLOYMENT.md`** - Production deployment guide
- **`docs/VERCEL_DEPLOY.md`** - Vercel-specific deployment
- **`docs/POSTGRES_SETUP.md`** - PostgreSQL configuration
- **`docs/FIREBASE_SETUP.md`** - Authentication setup

### For Business Launch
- **`COMMERCIAL_RELEASE_SUMMARY.md`** - Everything you need to know ⭐
- **`docs/COMMERCIAL_RELEASE_GUIDE.md`** - Complete launch roadmap
- **`docs/TESTING_CHECKLIST.md`** - Quality assurance checklist
- **`docs/PRIVACY_POLICY.md`** - User privacy commitments
- **`docs/TERMS_OF_SERVICE.md`** - Legal terms

## 🚀 Quick Deploy to Production

### Windows (PowerShell)
```powershell
# Load deployment scripts
. .\deploy.ps1

# Deploy to production
Deploy-Production

# Check health
Test-Health
```

### Unix/Linux/Mac
```bash
# Deploy to production
make deploy-production

# Check health
make health-check
```

## 🛡️ Security Features

- ✅ Rate limiting (100 req/15min global, 5 req/min AI)
- ✅ Security headers (CSP, XSS, clickjacking protection)
- ✅ Input sanitization and validation
- ✅ SQL injection protection
- ✅ HTTPS enforcement
- ✅ JWT token authentication
- ✅ User data isolation

## 📊 Monitoring

- `/api/health` - System health check
- `/api/ready` - Readiness probe
- `/api/live` - Liveness probe
- `/api/metrics` - Performance metrics

Built-in structured logging with error tracking ready for Sentry integration.

## 🎯 Production Checklist

Before launching:
- [ ] Set environment variables in Vercel
- [ ] Configure Firebase production project
- [ ] Set up PostgreSQL database
- [ ] Update Privacy Policy with business info
- [ ] Update Terms of Service with jurisdiction
- [ ] Test all features (see TESTING_CHECKLIST.md)
- [ ] Configure custom domain
- [ ] Set up monitoring alerts

See **`COMMERCIAL_RELEASE_SUMMARY.md`** for complete launch guide.

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines before submitting PRs.

## 📄 License

MIT - See LICENSE file for details

## 🌟 Support

- **Email:** support@your-domain.com
- **Issues:** GitHub Issues
- **Docs:** Full documentation in `/docs`

---

**Built for commercial use** | Ready for launch | Production-tested

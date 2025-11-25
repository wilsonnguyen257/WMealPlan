# WMealPlan

AI-powered meal planning assistant that helps you plan weekly meals, find recipes, and generate smart shopping lists.

## Features

- **Weekly Meal Planner** - Generate personalized 7-day meal plans with recipes
- **Pantry Chef** - Create recipes from ingredients you already have
- **Recipe Search** - Find recipes by name, ingredient, or cuisine type
- **Smart Shopping** - Automated grocery lists with price estimates
- **Meal Prep Instructions** - One-day prep planning for the entire week
- **Save & Manage** - Store and reload your favorite meal plans

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
├── database.js            # SQLite database (local)
├── database-postgres.js   # PostgreSQL (production)
├── vercel.json            # Vercel deployment config
└── package.json           # Backend dependencies
```

## Tech Stack

- **Frontend:** React 18, CSS3
- **Backend:** Node.js, Express
- **Database:** SQLite (local), PostgreSQL (production)
- **AI:** Google Gemini 2.5 Flash
- **Deployment:** Vercel

## Deployment

The app is configured for Vercel deployment with serverless functions. See `docs/VERCEL_DEPLOY.md` for detailed instructions.

## Documentation

Additional documentation available in the `docs/` folder:
- `DEPLOYMENT.md` - General deployment guide
- `VERCEL_DEPLOY.md` - Vercel-specific deployment
- `POSTGRES_SETUP.md` - PostgreSQL configuration
- `QUICKSTART.md` - Detailed setup guide

## License

MIT

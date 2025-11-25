# Weekly Meal Prep Planner - Quick Start Guide

## Getting Started

### Step 1: Install Dependencies

First, install the backend dependencies:
```powershell
npm install
```

Then install the frontend dependencies:
```powershell
cd client
npm install
cd ..
```

### Step 2: Set Up Environment Variables

Run the setup script:
```powershell
.\setup-env.ps1
```

Then open the `.env` file and add your Google Gemini API key:
```
GEMINI_API_KEY=your-gemini-api-key-here
PORT=3001
```

**Where to get a FREE Google Gemini API key:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API key" or "Get API key"
4. Copy the key and paste it in your `.env` file

✨ **Gemini is completely FREE with generous usage limits!**

### Step 3: Run the Application

Open two terminal windows:

**Terminal 1 - Backend Server:**
```powershell
npm run server
```

**Terminal 2 - Frontend:**
```powershell
npm run client
```

The app will open automatically at `http://localhost:3000`

## Features Overview

### 🤖 AI-Powered Meal Planning
- Generate complete 7-day meal plans
- Customizable preferences (vegetarian, high-protein, etc.)
- Dietary restrictions support
- Adjustable serving sizes

### 📝 Recipe Management
- Detailed recipes with ingredients and instructions
- Prep and cook times
- Storage and reheating instructions
- Click any meal to view the full recipe

### 🛒 Smart Grocery Lists
- Automatically consolidated from all recipes
- Organized by category (produce, proteins, dairy, etc.)
- Interactive checkboxes
- Printable format

### 📅 One-Day Prep Guide
- Step-by-step prep instructions
- Optimized workflow for batch cooking
- Storage tips and best practices

## Usage Tips

1. **Be Specific**: The more detailed your preferences, the better the meal plan
   - Good: "high protein, mediterranean, low carb"
   - Basic: "healthy"

2. **Dietary Restrictions**: Clearly state any restrictions
   - Examples: "gluten-free", "dairy-free", "nut-free"

3. **Servings**: Select the right number for your household

4. **Explore Recipes**: Click on any meal name to see the full recipe

5. **Print Grocery List**: Use the print button for shopping

## Troubleshooting

**Issue**: "Failed to connect to server"
- Make sure the backend is running (`npm run server`)
- Check that port 3001 is not in use

**Issue**: "Failed to generate meal plan"
- Verify your Google Gemini API key is correct in `.env`
- Make sure you have an active internet connection
- Check the server console for specific error messages

**Issue**: PowerShell execution policy error
- Run PowerShell as Administrator
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Project Structure

```
WMealPlan/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       ├── App.js         # Main app component
│       └── index.js       # Entry point
├── server.js              # Express backend with OpenAI integration
├── package.json           # Backend dependencies
├── .env                   # Environment variables (create this)
└── README.md             # This file
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/generate-meal-plan` - Generate weekly meal plan
- `POST /api/generate-recipe` - Generate individual recipe

## Technologies Used

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express
- **AI**: Google Gemini Pro (FREE!)
- **HTTP Client**: Fetch API

## Cost Considerations

This app uses **Google Gemini API which is completely FREE**! 🎉
- Free tier: 60 requests per minute
- No credit card required
- Perfect for personal use
- Monitor your usage at https://makersuite.google.com/

## Support

For issues or questions:
1. Check that all dependencies are installed
2. Verify your `.env` file is configured correctly
3. Make sure both servers are running
4. Check the browser console and terminal for error messages

Happy meal prepping! 🍽️

# Weekly Meal Prep Planner

An AI-powered meal planning app that helps you plan a full week of meals, generates recipes, and creates a consolidated grocery list for efficient meal prep.

## Features

- 🤖 AI-generated meal plans for the entire week
- 📝 Detailed recipes with instructions
- 🛒 Automated grocery list generation
- 📅 One-day prep planning for the whole week
- 💾 Save and manage your meal plans

## Setup

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini API key (FREE!)

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Get a FREE Google Gemini API key and add it to the `.env` file:
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API key"
   - Copy and paste into `.env`:
```
GEMINI_API_KEY=your-api-key-here
PORT=3001
```

### Running the App

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend:
```bash
npm run client
```

3. Open your browser to `http://localhost:3000`

## Usage

1. Enter your dietary preferences and number of servings
2. Click "Generate Weekly Meal Plan" to get AI-powered meal suggestions
3. Review the 7-day meal plan with recipes
4. Check the consolidated grocery list organized by category
5. Use the prep instructions to prepare meals in one day

## Tech Stack

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express
- **AI**: Google Gemini Pro (FREE!)

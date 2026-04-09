# WMealPlan

A minimal AI-powered weekly meal planner that generates personalized meal plans using Google Gemini AI.

## Features

- Generate 3, 5, or 7-day meal plans
- Customize for number of people, dietary goals, and budget
- Auto-generated shopping list
- Clean, focused interface
- Direct Gemini AI integration

## Setup

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Create `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

3. Install dependencies:
```bash
npm install
cd client && npm install
```

4. Run the app:
```bash
npm run client
```

## Tech Stack

- React + TypeScript
- Google Gemini Pro API
- Clean CSS (no framework)

## Architecture

Single-page React app that calls Gemini API directly from the client. No authentication, no database - just pure meal planning functionality.

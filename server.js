require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { saveMealPlan, loadMealPlan } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for meal plan data

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
  try {
    const { sql } = require('@vercel/postgres');
    const result = await sql`SELECT COUNT(*) as count FROM shared_plans`;
    res.json({ 
      status: 'connected', 
      sharedPlans: result.rows[0].count,
      hasEnv: !!process.env.POSTGRES_URL
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      hasEnv: !!process.env.POSTGRES_URL
    });
  }
});

// Save shared meal plan - returns short code
app.post('/api/share', async (req, res) => {
  try {
    const { mealPlan, preferences } = req.body;
    
    if (!mealPlan || !preferences) {
      return res.status(400).json({ error: 'Missing mealPlan or preferences' });
    }
    
    const shortCode = await saveMealPlan(mealPlan, preferences);
    res.json({ shortCode });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).json({ error: `Failed to save meal plan: ${error.message}` });
  }
});

// Load shared meal plan by short code
app.get('/api/share/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const data = await loadMealPlan(shortCode);
    
    if (!data) {
      return res.status(404).json({ error: 'Meal plan not found or expired' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error loading meal plan:', error);
    res.status(500).json({ error: 'Failed to load meal plan' });
  }
});

// All other routes serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving React app from client/build`);
});

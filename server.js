require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { saveMealPlan, loadMealPlan } = require('./db/database');
const {
  estimatePrices,
  generateMealPlan,
  validateFeedback,
  validateSharePayload,
} = require('./api/meal-service');

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const rateLimitStore = new Map();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for meal plan data

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

function enforceRateLimit(req, res, key, maxRequests) {
  const now = Date.now();
  const bucketKey = `${key}:${getClientIp(req)}`;
  const record = rateLimitStore.get(bucketKey);

  if (!record || now - record.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(bucketKey, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.windowStart)) / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return true;
  }

  record.count += 1;
  return false;
}

function getErrorStatusCode(message, defaultServerCode) {
  const normalized = String(message || '').toLowerCase();
  const clientIndicators = ['must', 'invalid', 'required', 'between', 'expected', 'too long'];
  return clientIndicators.some((indicator) => normalized.includes(indicator)) ? 400 : defaultServerCode;
}

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
  if (enforceRateLimit(req, res, 'share', 30)) {
    return;
  }

  try {
    const { mealPlan, preferences } = validateSharePayload(req.body);
    const shortCode = await saveMealPlan(mealPlan, preferences);
    res.json({ shortCode });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    const message = error instanceof Error ? error.message : 'Failed to save meal plan';
    res.status(getErrorStatusCode(message, 500)).json({ error: message });
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

// Save user feedback
app.post('/api/feedback', async (req, res) => {
  if (enforceRateLimit(req, res, 'feedback', 10)) {
    return;
  }

  try {
    const { rating, comment, email } = validateFeedback(req.body);

    const { sql } = require('@vercel/postgres');
    
    // Save to database
    await sql`
      INSERT INTO feedback (rating, comment, email, created_at)
      VALUES (${rating}, ${comment}, ${email}, ${new Date().toISOString()})
    `;
    
    console.log('Feedback received:', { rating, email });
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    const message = error instanceof Error ? error.message : 'Failed to save feedback';
    res.status(getErrorStatusCode(message, 500)).json({ error: message });
  }
});

// Generate a meal plan on the server so the Gemini key never reaches the browser.
app.post('/api/generate', async (req, res) => {
  if (enforceRateLimit(req, res, 'generate', 12)) {
    return;
  }

  try {
    const { mealPlan, preferences } = await generateMealPlan(req.body);
    res.json({ mealPlan, preferences });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate meal plan';
    res.status(getErrorStatusCode(message, 502)).json({ error: message });
  }
});

// Estimate prices on the server for the same reason.
app.post('/api/estimate-prices', async (req, res) => {
  if (enforceRateLimit(req, res, 'estimate-prices', 20)) {
    return;
  }

  try {
    const { ingredients } = req.body || {};
    const result = await estimatePrices(ingredients);
    res.json(result);
  } catch (error) {
    console.error('Error estimating prices:', error);
    const message = error instanceof Error ? error.message : 'Failed to estimate prices';
    res.status(getErrorStatusCode(message, 502)).json({ error: message });
  }
});

// All other routes serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Only start server locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving React app from client/build`);
  });
}

// Export for Vercel serverless
module.exports = app;

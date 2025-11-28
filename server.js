require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { jsonrepair } = require('jsonrepair');

// Use Vercel Postgres database
const db = require('./database-postgres');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Helper function for retrying API calls with exponential backoff
async function withRetry(apiCall, maxRetries = 5) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.message.includes('503') || error.message.includes('timeout') || error.message.includes('DEADLINE_EXCEEDED')) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1500; // 3s, 6s, 12s, 24s, 48s
        console.log(`API issue (${error.message.substring(0, 50)}). Retrying attempt ${attempt}/${maxRetries} in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        // For other errors, fail immediately
        throw error;
      }
    }
  }
  throw new Error('The service is currently unavailable after multiple retries. Please try again later.');
}

function repairJson(jsonString) {
  try {
    // Use the professional jsonrepair library
    const repaired = jsonrepair(jsonString);
    return JSON.parse(repaired);
  } catch (e) {
    console.error("Failed to parse JSON even with jsonrepair:", e.message);
    console.error("Original text:", jsonString.substring(0, 500));
    throw new Error("Failed to parse AI response.");
  }
}

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
    maxOutputTokens: 16000,
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Generate meal plan endpoint (protected)
app.post('/api/generate-meal-plan', authenticateToken, async (req, res) => {
  try {
    const { preferences, servings = 2, dietaryRestrictions = '', budgetMin = '', budgetMax = '', allergies = '', healthGoal = '', weight = '', activityLevel = 'moderate' } = req.body;

    const budgetText = budgetMin && budgetMax 
      ? `\nBudget constraint: Total grocery cost should be between AUD $${budgetMin} and AUD $${budgetMax}. Choose affordable ingredients and adjust portions if needed to stay within budget.`
      : budgetMin
      ? `\nBudget constraint: Total grocery cost should be at least AUD $${budgetMin}.`
      : budgetMax
      ? `\nBudget constraint: Total grocery cost should not exceed AUD $${budgetMax}. Choose budget-friendly ingredients.`
      : '';

    const healthText = healthGoal || weight || allergies
      ? `\n\nPersonalization:
${weight ? `- User weight: ${weight} kg (consider this for portion sizing and calorie needs)` : ''}
${activityLevel ? `- Activity level: ${activityLevel} (adjust calories accordingly)` : ''}
${healthGoal ? `- Health goal: ${healthGoal} (optimize macros and ingredients for this goal)` : ''}
${allergies ? `- CRITICAL ALLERGIES: ${allergies} - ABSOLUTELY AVOID these ingredients and cross-contamination` : ''}`
      : '';

    const prompt = `Create a detailed 7-day meal prep plan with the following requirements:

Preferences: ${preferences || 'balanced, healthy meals'}
Servings per meal: ${servings}
Dietary restrictions: ${dietaryRestrictions || 'none'}${budgetText}${healthText}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.

MEASUREMENT UNITS - CRITICAL:
- Use METRIC measurements ONLY (Australian standard)
- Weights: grams (g) or kilograms (kg) - NOT pounds, lbs, or ounces
- Liquids: millilitres (ml) or litres (L) - NOT cups, fluid ounces, or pints
- Examples: "500g chicken breast", "200ml milk", "1.5kg potatoes", "250ml cream"
- Temperature: Celsius (°C) - NOT Fahrenheit

For the grocery list, EXCLUDE common kitchen staples that most people already have:
- Do NOT include: salt, pepper, olive oil, vegetable oil, flour, sugar, baking powder, baking soda, butter, garlic, onions (small amounts)
- ONLY include items that need to be specifically purchased for these recipes
${allergies ? `\n- CRITICALLY IMPORTANT: Completely avoid any ingredients containing ${allergies}. Check all ingredients carefully for allergens.` : ''}

Format:
{
  "mealPlan": {
    "Monday": {"breakfast": "meal name", "lunch": "meal name", "dinner": "meal name"},
    "Tuesday": {"breakfast": "meal name", "lunch": "meal name", "dinner": "meal name"},
    "Wednesday": {"breakfast": "meal name", "lunch": "meal name", "dinner": "meal name"},
    "Thursday": {"breakfast": "meal name", "lunch": "meal name", "dinner": "meal name"},
    "Friday": {"breakfast": "meal name", "lunch": "meal name", "dinner": "meal name"},
    "Saturday": {"breakfast": "meal name", "lunch": "meal name", "dinner": "meal name"},
    "Sunday": {"breakfast": "meal name", "lunch": "meal name", "dinner": "meal name"}
  },
  "recipes": [
    {
      "name": "Recipe Name",
      "servings": ${servings},
      "prepTime": "X minutes",
      "cookTime": "X minutes",
      "ingredients": ["ingredient with amount"],
      "instructions": ["step by step"],
      "storageInstructions": "how to store"
    }
  ],
  "groceryList": {
    "produce": ["items"],
    "proteins": ["items"],
    "dairy": ["items"],
    "pantry": ["items"]
  },
  "prepInstructions": {
    "overview": "brief overview",
    "steps": ["prep step without numbers - the UI will auto-number them"]
  }
}

CRITICAL FOR PREP INSTRUCTIONS:
- In the "steps" array, write each step WITHOUT numbering (e.g., "Roast Whole Chicken..." not "1. Roast Whole Chicken...")
- The frontend automatically numbers steps using an ordered list (<ol>)
- Each step should be a complete sentence describing the prep task
- Focus on batch cooking, chopping, portioning, and storage
`;

    const fullPrompt = `You are a professional meal prep nutritionist and chef. You MUST respond with ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON object. Start your response with { and end with }.\n\n${prompt}`;
    
    const apiCall = () => model.generateContent(fullPrompt);
    const result = await withRetry(apiCall);
    
    const response = await result.response;
    const mealPlanData = repairJson(response.text());
    
    res.json({
      success: true,
      data: mealPlanData
    });

  } catch (error) {
    console.error('Error generating meal plan:', error);
    console.error('Error details:', error.message);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate meal plan';
    
    if (error.message.includes('503') || error.message.includes('unavailable')) {
      errorMessage = 'AI service is temporarily busy. Please try again in a moment.';
    } else if (error.message.includes('DEADLINE_EXCEEDED') || error.message.includes('timeout')) {
      errorMessage = 'Request took too long. Try reducing servings or simplifying preferences.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'API configuration error. Please contact support.';
    } else if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'Daily request limit reached (20 requests/day). Please try again tomorrow or upgrade your API key.';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Too many requests. Please wait a minute and try again.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Generate custom recipe endpoint
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { recipeName, servings = 2 } = req.body;

    const prompt = `Create a detailed recipe for "${recipeName}" that serves ${servings} people and is suitable for meal prep.

MEASUREMENT UNITS - CRITICAL:
- Use METRIC measurements ONLY (Australian standard)
- Weights: grams (g) or kilograms (kg) - NOT pounds, lbs, or ounces
- Liquids: millilitres (ml) or litres (L) - NOT cups, fluid ounces, or pints
- Examples: "500g chicken", "200ml milk", "2kg beef", "100ml oil"
- Temperature: Celsius (°C) - NOT Fahrenheit

Provide the response as a JSON object with this structure:
{
  "name": "Recipe Name",
  "servings": number,
  "prepTime": "time",
  "cookTime": "time",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity", ...],
  "instructions": ["step 1", "step 2", ...],
  "storageInstructions": "how to store and reheat",
  "nutritionTips": "brief nutrition information or tips"
}`;

    const fullPrompt = `You are a professional chef specializing in meal prep recipes. Provide detailed, practical recipes. Always respond with valid JSON only.\n\n${prompt}`;
    
    const apiCall = () => model.generateContent(fullPrompt);
    const result = await withRetry(apiCall);
    
    const response = await result.response;
    const recipeData = repairJson(response.text());
    
    res.json({
      success: true,
      data: recipeData
    });

  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate recipe'
    });
  }
});

// Estimate prices endpoint
app.post('/api/estimate-prices', async (req, res) => {
  try {
    const { groceryList } = req.body;

    if (!groceryList) {
      return res.status(400).json({ success: false, error: 'Grocery list is required' });
    }

    // Flatten the grocery list into a single array of items
    let allItems = [];
    if (typeof groceryList === 'object' && !Array.isArray(groceryList)) {
      // If it's categorized (produce, proteins, etc.), flatten it
      Object.values(groceryList).forEach(category => {
        if (Array.isArray(category)) {
          allItems = allItems.concat(category);
        }
      });
    } else if (Array.isArray(groceryList)) {
      allItems = groceryList;
    }

    console.log('Processing', allItems.length, 'items for price estimation');

    const prompt = `You are an expert Australian grocery shopper. Based on your knowledge of current prices at Coles, Woolworths, and Aldi in Australia, estimate the price for each item in the following grocery list.

For each item, provide an estimated price and suggest the store that is likely the cheapest.

Grocery List:
${allItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

IMPORTANT: You MUST respond with valid JSON only. No markdown, no explanations.
Calculate the total cost by summing all individual item prices.
Provide an estimate for ALL ${allItems.length} items in the list.

Required JSON format:
{
  "priceEstimates": [
    {
      "item": "Item Name",
      "estimatedPrice": 5.99,
      "suggestedStore": "Coles"
    }
  ],
  "totalEstimatedCost": 99.99,
  "shoppingTips": "Brief tips for saving money."
}`;

    const apiCall = () => model.generateContent(prompt);
    const result = await withRetry(apiCall);
    
    const response = await result.response;
    const priceData = repairJson(response.text());
    
    // Ensure we have all required fields and calculate total if missing
    if (!priceData.priceEstimates) {
      priceData.priceEstimates = [];
    }
    
    // Fill in missing suggestedStore or estimatedPrice fields
    priceData.priceEstimates = priceData.priceEstimates.map(item => ({
      item: item.item || 'Unknown item',
      estimatedPrice: item.estimatedPrice || 0,
      suggestedStore: item.suggestedStore || 'Aldi'
    }));
    
    // Calculate total cost from individual prices if not provided
    if (!priceData.totalEstimatedCost && priceData.priceEstimates.length > 0) {
      priceData.totalEstimatedCost = priceData.priceEstimates.reduce((sum, item) => {
        const price = typeof item.estimatedPrice === 'number' 
          ? item.estimatedPrice 
          : parseFloat(String(item.estimatedPrice).replace(/[A$,]/g, '')) || 0;
        return sum + price;
      }, 0);
    }
    
    console.log('Price estimation response:', JSON.stringify(priceData, null, 2));

    res.json({
      success: true,
      data: priceData
    });

  } catch (error) {
    console.error('Error estimating prices:', error);
    
    let errorMessage = 'Failed to estimate prices';
    
    if (error.message.includes('503')) {
      errorMessage = 'Price estimation service is busy. Please try again.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Search for recipes endpoint
app.post('/api/search-recipes', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const prompt = `You are a professional recipe database. Search for recipes matching: "${query}"

Find 6-8 diverse recipes that match the search query. The query might be:
- A specific dish name (e.g., "chicken pasta", "chocolate cake")
- An ingredient (e.g., "salmon", "mushrooms")
- A cuisine type (e.g., "italian", "thai", "mexican")
- A meal type (e.g., "breakfast", "dessert", "appetizer")

MEASUREMENT UNITS - CRITICAL:
- Use METRIC measurements ONLY (Australian standard)
- Weights: grams (g) or kilograms (kg) - NOT pounds, lbs, or ounces
- Liquids: millilitres (ml) or litres (L) - NOT cups, fluid ounces, or pints
- Examples: "300g pasta", "150ml water", "1kg chicken", "50ml olive oil"
- Temperature: Celsius (°C) - NOT Fahrenheit

For each recipe, provide:
- name: Recipe name
- description: Brief 1-2 sentence description
- cuisine: Type of cuisine (Italian, Thai, Mexican, etc.)
- difficulty: Easy, Medium, or Hard
- cookTime: Total time (e.g., "30 mins", "1 hour")
- servings: Number of servings (e.g., "4 servings")
- ingredients: Array of ingredients with measurements
- instructions: Array of step-by-step instructions
- nutrition: Object with calories, protein, carbs, fat per serving

Return in JSON format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "cuisine": "Cuisine type",
      "difficulty": "Easy/Medium/Hard",
      "cookTime": "30 mins",
      "servings": "4 servings",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "nutrition": {
        "calories": "400 kcal",
        "protein": "25g",
        "carbs": "45g",
        "fat": "12g"
      }
    }
  ]
}`;

    const result = await withRetry(async () => {
      const response = await model.generateContent(prompt);
      return response;
    });

    const text = result.response.text();
    const data = repairJson(text);

    if (!data.recipes || !Array.isArray(data.recipes)) {
      throw new Error('Invalid recipe data format');
    }

    res.json({
      success: true,
      recipes: data.recipes
    });

  } catch (error) {
    console.error('Recipe search error:', error);
    
    let errorMessage = 'Failed to search recipes';
    
    if (error.message.includes('API key')) {
      errorMessage = 'API configuration error. Please check settings.';
    } else if (error.message.includes('quota')) {
      errorMessage = 'Daily API limit reached. Please try again tomorrow.';
    } else if (error.message.includes('503')) {
      errorMessage = 'Recipe search service is busy. Please try again.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Generate meals from pantry items
app.post('/api/generate-from-pantry', async (req, res) => {
  try {
    const { pantryItems, servings = 2 } = req.body;

    const prompt = `You are a creative chef helping someone use ingredients they already have at home.

Available ingredients: ${pantryItems}
Servings needed: ${servings}

Generate 3-5 different meal ideas using primarily these ingredients. For each recipe, identify which ingredients from the list you're using and which additional common items (if any) are needed.

MEASUREMENT UNITS - CRITICAL:
- Use METRIC measurements ONLY (Australian standard)
- Weights: grams (g) or kilograms (kg) - NOT pounds, lbs, or ounces
- Liquids: millilitres (ml) or litres (L) - NOT cups, fluid ounces, or pints
- Examples: "400g rice", "250ml broth", "500g vegetables"
- Temperature: Celsius (°C) - NOT Fahrenheit

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations.

Format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "servings": ${servings},
      "prepTime": "X minutes",
      "cookTime": "X minutes",
      "ingredients": ["ingredient with amount"],
      "instructions": ["step by step"],
      "missingIngredients": ["items not in pantry but needed"],
      "tips": "helpful cooking tip"
    }
  ],
  "shoppingList": ["unique list of all missing ingredients across recipes"]
}`;

    const fullPrompt = `You are a professional chef and meal planner. You MUST respond with ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON object. Start your response with { and end with }.\n\n${prompt}`;

    const result = await withRetry(async () => {
      const response = await model.generateContent(fullPrompt);
      const text = response.response.text();
      return repairJson(text);
    });

    console.log('Pantry meals generated successfully');

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error generating from pantry:', error);
    
    let errorMessage = 'Failed to generate meals from pantry';
    
    if (error.message.includes('503')) {
      errorMessage = 'AI service is temporarily busy. Please try again.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Save meal plan to database
// Save meal plan endpoint (protected)
app.post('/api/save-meal-plan', authenticateToken, async (req, res) => {
  try {
    const { name, preferences, servings, dietaryRestrictions, mealPlan, recipes, groceryList, prepInstructions } = req.body;
    
    const id = await db.saveMealPlan({
      userId: req.user.userId,
      name,
      preferences,
      servings,
      dietaryRestrictions,
      mealPlan,
      recipes,
      groceryList,
      prepInstructions
    });
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all saved meal plans for current user (protected)
app.get('/api/meal-plans', authenticateToken, async (req, res) => {
  try {
    const plans = await db.getAllMealPlans(req.user.userId);
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error getting meal plans:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific meal plan (protected)
app.get('/api/meal-plans/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await db.getMealPlan(req.params.id, req.user.userId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Error getting meal plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a meal plan (protected)
app.delete('/api/meal-plans/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteMealPlan(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

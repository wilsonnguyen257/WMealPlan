require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { jsonrepair } = require('jsonrepair');

// Use Vercel Postgres in production, SQLite locally
const db = process.env.POSTGRES_URL 
  ? require('./database-postgres')
  : require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Helper function for retrying API calls with exponential backoff
async function withRetry(apiCall, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.message.includes('503')) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`API overloaded. Retrying attempt ${attempt} in ${delay / 1000}s...`);
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
    maxOutputTokens: 8000,
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Generate meal plan endpoint
app.post('/api/generate-meal-plan', async (req, res) => {
  try {
    const { preferences, servings = 2, dietaryRestrictions = '', budgetMin = '', budgetMax = '' } = req.body;

    const budgetText = budgetMin && budgetMax 
      ? `\nBudget constraint: Total grocery cost should be between AUD $${budgetMin} and AUD $${budgetMax}. Choose affordable ingredients and adjust portions if needed to stay within budget.`
      : budgetMin
      ? `\nBudget constraint: Total grocery cost should be at least AUD $${budgetMin}.`
      : budgetMax
      ? `\nBudget constraint: Total grocery cost should not exceed AUD $${budgetMax}. Choose budget-friendly ingredients.`
      : '';

    const prompt = `Create a detailed 7-day meal prep plan with the following requirements:

Preferences: ${preferences || 'balanced, healthy meals'}
Servings per meal: ${servings}
Dietary restrictions: ${dietaryRestrictions || 'none'}${budgetText}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.

For the grocery list, EXCLUDE common kitchen staples that most people already have:
- Do NOT include: salt, pepper, olive oil, vegetable oil, flour, sugar, baking powder, baking soda, butter, garlic, onions (small amounts)
- ONLY include items that need to be specifically purchased for these recipes

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
    "steps": ["prep steps"]
  }
}`;

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
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate meal plan'
    });
  }
});

// Generate custom recipe endpoint
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { recipeName, servings = 2 } = req.body;

    const prompt = `Create a detailed recipe for "${recipeName}" that serves ${servings} people and is suitable for meal prep.

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
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to estimate prices'
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
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate meals from pantry'
    });
  }
});

// Save meal plan to database
app.post('/api/save-meal-plan', async (req, res) => {
  try {
    const { name, preferences, servings, dietaryRestrictions, mealPlan, recipes, groceryList, prepInstructions } = req.body;
    
    const id = await db.saveMealPlan({
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

// Get all saved meal plans
app.get('/api/meal-plans', async (req, res) => {
  try {
    const plans = await db.getAllMealPlans();
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error getting meal plans:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific meal plan
app.get('/api/meal-plans/:id', async (req, res) => {
  try {
    const plan = await db.getMealPlan(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Error getting meal plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a meal plan
app.delete('/api/meal-plans/:id', async (req, res) => {
  try {
    await db.deleteMealPlan(req.params.id);
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

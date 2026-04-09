require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { jsonrepair } = require('jsonrepair');

const MODEL_NAME = 'gemini-2.5-flash';
const MAX_RETRIES = 3;
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ALLOWED_GOALS = new Set(['Normal eating', 'Weight loss', 'Muscle gain', 'Meat lover']);

const DIET_BLOCKLIST = {
  Vegan: ['beef', 'chicken', 'pork', 'fish', 'salmon', 'tuna', 'meat', 'egg', 'milk', 'cheese', 'yogurt', 'cream', 'butter', 'honey'],
  Vegetarian: ['beef', 'chicken', 'pork', 'fish', 'salmon', 'tuna', 'meat', 'bacon', 'sausage'],
  Keto: ['bread', 'pasta', 'rice', 'potato', 'sugar', 'flour', 'oats', 'beans'],
  'Gluten-Free': ['bread', 'pasta', 'flour', 'wheat', 'barley', 'rye', 'breadcrumbs', 'soy sauce'],
};

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Server Gemini API key is not configured.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function coercePositiveInteger(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function validatePreferences(input) {
  if (!isPlainObject(input)) {
    throw new Error('Preferences must be an object.');
  }

  const days = coercePositiveInteger(input.days);
  const people = coercePositiveInteger(input.people);
  const budget = Number(input.budget);
  const goal = typeof input.goal === 'string' ? input.goal.trim() : '';
  const diet = typeof input.diet === 'string' ? input.diet.trim() : '';

  if (!days || days < 1 || days > 7) {
    throw new Error('Days must be an integer between 1 and 7.');
  }
  if (!people || people < 1 || people > 10) {
    throw new Error('People must be an integer between 1 and 10.');
  }
  if (!Number.isFinite(budget) || budget < 10) {
    throw new Error('Budget must be at least 10 AUD.');
  }
  if (goal && !ALLOWED_GOALS.has(goal)) {
    throw new Error('Goal is invalid.');
  }
  if (diet.length > 300) {
    throw new Error('Diet text is too long.');
  }

  return {
    days,
    people,
    budget,
    goal: goal || 'Normal eating',
    diet,
  };
}

function normalizeInstructions(instructions) {
  if (Array.isArray(instructions)) {
    return instructions
      .map((step) => String(step || '').trim())
      .filter(Boolean)
      .map((step, index) => `${index + 1}. ${step}`)
      .join(' ');
  }
  return String(instructions || '').trim();
}

function validateMeal(meal) {
  if (!isPlainObject(meal)) {
    throw new Error('Meal must be an object.');
  }

  const name = String(meal.name || '').trim();
  const prepTime = String(meal.prepTime || '').trim();
  const cookTime = String(meal.cookTime || '').trim();
  const difficulty = String(meal.difficulty || '').trim();
  const instructions = normalizeInstructions(meal.instructions);
  const ingredients = Array.isArray(meal.ingredients)
    ? meal.ingredients.map((ingredient) => {
        if (!isPlainObject(ingredient)) {
          throw new Error('Ingredient must be an object.');
        }
        const item = String(ingredient.item || '').trim();
        const amount = String(ingredient.amount || '').trim();
        if (!item || !amount) {
          throw new Error('Ingredient item and amount are required.');
        }
        return { item, amount };
      })
    : null;

  if (!name || !prepTime || !cookTime || !difficulty || !instructions) {
    throw new Error('Meal is missing required fields.');
  }
  if (!ingredients || ingredients.length === 0) {
    throw new Error('Meal must contain at least one ingredient.');
  }

  return {
    name,
    prepTime,
    cookTime,
    difficulty,
    ingredients,
    instructions,
  };
}

function assertDietSafety(plan, diet) {
  const restrictedTerms = DIET_BLOCKLIST[diet];
  if (!restrictedTerms) {
    return;
  }

  for (const day of plan.days) {
    for (const meal of Object.values(day.meals)) {
      for (const ingredient of meal.ingredients) {
        const haystack = `${meal.name} ${ingredient.item}`.toLowerCase();
        const match = restrictedTerms.find((term) => haystack.includes(term));
        if (match) {
          throw new Error(`Meal plan violates the ${diet} restriction with "${ingredient.item}".`);
        }
      }
    }
  }
}

function validateMealPlan(plan, preferences) {
  if (!isPlainObject(plan) || !Array.isArray(plan.days)) {
    throw new Error('Meal plan must contain a days array.');
  }

  const expectedDayNames = DAY_NAMES.slice(0, preferences.days);
  if (plan.days.length !== preferences.days) {
    throw new Error(`Meal plan must contain exactly ${preferences.days} days.`);
  }

  const normalizedDays = plan.days.map((dayPlan, index) => {
    if (!isPlainObject(dayPlan)) {
      throw new Error('Day plan must be an object.');
    }

    const day = String(dayPlan.day || '').trim();
    if (day !== expectedDayNames[index]) {
      throw new Error(`Expected day ${index + 1} to be "${expectedDayNames[index]}".`);
    }
    if (!isPlainObject(dayPlan.meals)) {
      throw new Error('Day plan meals must be an object.');
    }

    return {
      day,
      meals: {
        breakfast: validateMeal(dayPlan.meals.breakfast),
        lunch: validateMeal(dayPlan.meals.lunch),
        dinner: validateMeal(dayPlan.meals.dinner),
      },
    };
  });

  const pantryItems = Array.isArray(plan.pantryItems)
    ? plan.pantryItems.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

  const normalizedPlan = {
    days: normalizedDays,
    pantryItems,
    estimatedCost: Number.isFinite(Number(plan.estimatedCost)) ? Number(plan.estimatedCost) : undefined,
  };

  assertDietSafety(normalizedPlan, preferences.diet);

  if (normalizedPlan.estimatedCost !== undefined && normalizedPlan.estimatedCost > preferences.budget * 1.2) {
    throw new Error('Meal plan exceeds the allowed budget threshold.');
  }

  return normalizedPlan;
}

function buildMealPlanPrompt(params) {
  const days = DAY_NAMES.slice(0, params.days);
  const dailyBudget = Math.round(params.budget / params.days);

  return `You are an expert meal planner and nutritionist specializing in practical, budget-friendly Australian home cooking.

CREATE A ${params.days}-DAY MEAL PLAN with these EXACT requirements:

REQUIREMENTS:
- Days: ${params.days} (${days.join(', ')})
- Servings: ${params.people} ${params.people === 1 ? 'person' : 'people'} per meal
- Health Goal: ${params.goal}${params.goal === 'Meat lover' ? ' (MUST include meat or protein in every meal)' : ''}
- Dietary Restrictions: ${params.diet || 'None'}
- Total Budget: $${params.budget} AUD (~$${dailyBudget}/day)

RULES:
1. Create breakfast, lunch, and dinner for every day.
2. Reuse ingredients across meals to minimize waste and cost.
3. Keep recipes simple: under 30 minutes, beginner friendly.
4. Use Australian ingredients and metric measurements.
5. Include an estimated total grocery cost in AUD.
6. Output valid JSON only. No markdown, no commentary.

OUTPUT:
{
  "days": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": {
          "name": "Simple Descriptive Name",
          "prepTime": "5 min",
          "cookTime": "10 min",
          "difficulty": "Easy",
          "ingredients": [
            { "item": "Ingredient Name", "amount": "Store quantity" }
          ],
          "instructions": "1. Step one. 2. Step two. 3. Step three."
        },
        "lunch": { "name": "", "prepTime": "", "cookTime": "", "difficulty": "", "ingredients": [], "instructions": "" },
        "dinner": { "name": "", "prepTime": "", "cookTime": "", "difficulty": "", "ingredients": [], "instructions": "" }
      }
    }
  ],
  "pantryItems": ["Salt", "Pepper"],
  "estimatedCost": 120
}

Generate exactly ${params.days} days starting with "${days[0]}" and ending with "${days[days.length - 1]}".`;
}

function buildPriceEstimatePrompt(ingredients) {
  return `You are a grocery pricing expert for Australian supermarkets (Coles, Woolworths, Aldi).

TASK: Estimate realistic current prices in AUD for these grocery items.

ITEMS TO PRICE:
${ingredients.map((ing, index) => `${index + 1}. ${ing}`).join('\n')}

OUTPUT FORMAT:
Return only valid JSON:
[
  { "item": "Chicken breast", "estimatedPrice": 9.00, "quantity": "500g pack" }
]

RULES:
1. Preserve the item names.
2. Round prices to the nearest 0.50.
3. Use realistic store package sizes.
4. Pantry staples can be priced at 0.00.`;
}

function extractJson(text) {
  const cleaned = String(text || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return JSON.parse(jsonrepair(cleaned));
  }
}

async function runPrompt(prompt) {
  const model = getGenAI().getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response?.text();
      if (!text) {
        throw new Error('Empty response from Gemini.');
      }
      return extractJson(text);
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Unknown Gemini error.';
  throw new Error(`Gemini failed after ${MAX_RETRIES} attempts: ${message}`);
}

async function generateMealPlan(preferencesInput) {
  const preferences = validatePreferences(preferencesInput);
  const rawPlan = await runPrompt(buildMealPlanPrompt(preferences));
  return {
    preferences,
    mealPlan: validateMealPlan(rawPlan, preferences),
  };
}

async function estimatePrices(ingredientsInput) {
  if (!Array.isArray(ingredientsInput)) {
    throw new Error('Ingredients must be an array.');
  }

  const ingredients = Array.from(
    new Set(
      ingredientsInput
        .map((ingredient) => String(ingredient || '').trim())
        .filter(Boolean)
        .slice(0, 100)
    )
  );

  if (ingredients.length === 0) {
    return { estimates: [], total: 0 };
  }

  const raw = await runPrompt(buildPriceEstimatePrompt(ingredients));
  if (!Array.isArray(raw)) {
    throw new Error('Price estimate response must be an array.');
  }

  const estimates = raw
    .map((item) => ({
      item: String(item?.item || '').trim(),
      quantity: String(item?.quantity || '').trim(),
      estimatedPrice: Number.isFinite(Number(item?.estimatedPrice))
        ? Math.round(Number(item.estimatedPrice) * 2) / 2
        : 0,
    }))
    .filter((item) => item.item && item.quantity && item.estimatedPrice >= 0);

  return {
    estimates,
    total: estimates.reduce((sum, item) => sum + item.estimatedPrice, 0),
  };
}

function validateSharePayload(input) {
  if (!isPlainObject(input)) {
    throw new Error('Share payload must be an object.');
  }
  const preferences = validatePreferences(input.preferences);
  const mealPlan = validateMealPlan(input.mealPlan, preferences);
  return { preferences, mealPlan };
}

function validateFeedback(input) {
  if (!isPlainObject(input)) {
    throw new Error('Feedback must be an object.');
  }

  const rating = coercePositiveInteger(input.rating);
  const comment = String(input.comment || '').trim();
  const email = String(input.email || '').trim();

  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.');
  }
  if (comment.length > 2000) {
    throw new Error('Comment is too long.');
  }
  if (email && email !== 'anonymous' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email is invalid.');
  }

  return {
    rating,
    comment,
    email: email || 'anonymous',
  };
}

module.exports = {
  estimatePrices,
  generateMealPlan,
  validateFeedback,
  validateMealPlan,
  validatePreferences,
  validateSharePayload,
};

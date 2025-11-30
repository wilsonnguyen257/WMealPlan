// src/api/gemini.ts
import { MealPlanResponse, Preferences, PriceEstimate } from '../types/mealPlan';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Estimates prices for grocery items based on typical market prices
 */
export const estimatePrices = async (ingredients: string[]): Promise<{ estimates: PriceEstimate[], total: number }> => {
  if (!GEMINI_API_KEY || ingredients.length === 0) {
    console.warn('Price estimation skipped: No API key or empty ingredients');
    return { estimates: [], total: 0 };
  }

  // Deduplicate ingredients
  const uniqueIngredients = Array.from(new Set(ingredients.map(i => i.toLowerCase().trim())))
    .filter(i => i.length > 0);
  
  console.log('Starting price estimation for', uniqueIngredients.length, 'unique items');

  const prompt = `You are a grocery pricing expert for Australian supermarkets (Coles, Woolworths, Aldi).

TASK: Estimate December 2025 prices in AUD for these grocery items.

ITEMS TO PRICE:
${uniqueIngredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUSTRALIAN SUPERMARKET PRICE GUIDE (2025):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROTEINS:
• Chicken breast 500g: $8-10
• Chicken thighs 1kg: $8-12
• Beef mince 500g: $7-9
• Pork mince 500g: $6-8
• Salmon fillet 200g: $8-12
• Eggs 12-pack: $6-8
• Bacon 250g: $5-7
• Sausages 500g: $6-8

DAIRY:
• Milk 2L: $3-4
• Milk 1L: $1.80-2.50
• Cheese block 250g: $4-6
• Cheese shredded 500g: $6-8
• Greek yogurt 500g: $5-7
• Cream 300ml: $3-4
• Butter 250g: $4-5

VEGETABLES:
• Broccoli head: $3-4
• Carrots 1kg bag: $2-3
• Capsicum each: $2-3
• Lettuce head: $2-3
• Tomatoes 500g: $4-6
• Spinach bag 120g: $3-4
• Mushrooms 200g: $3-4
• Zucchini each: $1-2
• Sweet potato kg: $3-4
• Potatoes 2kg: $4-6

FRUITS:
• Bananas kg: $3-4
• Apples kg: $4-5
• Berries punnet: $4-6
• Oranges kg: $4-5
• Avocado each: $2-3

OTHER:
• Bread loaf: $3-4
• Pasta 500g: $1.50-3
• Rice 1kg: $3-4
• Canned tomatoes 400g: $1-2
• Canned beans 400g: $1-2
• Tofu 300g: $4-5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT - JSON ONLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a valid JSON array. No markdown, no explanation.

[
  {"item": "Chicken breast", "estimatedPrice": 9.00, "quantity": "500g pack"},
  {"item": "Milk", "estimatedPrice": 3.50, "quantity": "2L"}
]

RULES:
1. Use the EXACT item names from the list above
2. Round prices to nearest $0.50
3. Use realistic store package sizes
4. If item seems like a pantry staple (oil, spices, etc), price at $0.00`;

  try {
    console.log('Calling Gemini for price estimation...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Price API error:', response.status, errorText);
      throw new Error(`Price API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('No text in Gemini response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No price data in API response');
    }

    console.log('Raw response:', text.substring(0, 300));

    // Clean and extract JSON
    let cleanedText = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
    
    // Find the JSON array in the response
    const startIdx = cleanedText.indexOf('[');
    const endIdx = cleanedText.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleanedText = cleanedText.substring(startIdx, endIdx + 1);
    }

    console.log('Cleaned JSON:', cleanedText.substring(0, 200));

    let estimates: PriceEstimate[];
    try {
      estimates = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('JSON parse failed:', parseErr);
      console.error('Text was:', cleanedText.substring(0, 300));
      throw new Error('Failed to parse price data');
    }

    if (!Array.isArray(estimates)) {
      throw new Error('Price data is not an array');
    }

    // Normalize and validate the estimates
    estimates = estimates
      .map(e => ({
        item: String(e.item || 'Unknown').trim(),
        quantity: String(e.quantity || '').trim(),
        estimatedPrice: typeof e.estimatedPrice === 'number' 
          ? Math.round(e.estimatedPrice * 2) / 2 // Round to nearest 0.50
          : parseFloat(String(e.estimatedPrice).replace(/[^0-9.]/g, '')) || 0
      }))
      .filter(e => e.estimatedPrice > 0); // Remove $0 items (pantry staples)

    const total = estimates.reduce((sum, e) => sum + e.estimatedPrice, 0);
    console.log(`Price estimation complete: ${estimates.length} items, total $${total.toFixed(2)} AUD`);

    return { estimates, total };
  } catch (error) {
    console.error('Price estimation failed:', error);
    throw error;
  }
};



/**
 * Builds the prompt for the Gemini API call.
 * This is where you instruct the AI on exactly what you want.
 */
const buildPrompt = (params: Preferences): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, params.days);
  
  // Calculate per-day budget
  const dailyBudget = Math.round(params.budget / params.days);
  
  return `You are an expert meal planner and nutritionist specializing in practical, budget-friendly Australian home cooking.

CREATE A ${params.days}-DAY MEAL PLAN with these EXACT requirements:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Days: ${params.days} (${days.join(', ')})
• Servings: ${params.people} ${params.people === 1 ? 'person' : 'people'} per meal
• Health Goal: ${params.goal}${params.goal === 'Meat lover' ? ' (MUST include meat/protein in EVERY meal - breakfast, lunch, AND dinner)' : ''}
• Dietary Restrictions: ${params.diet || 'None'}
• Total Budget: $${params.budget} AUD (~$${dailyBudget}/day)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEAL PLANNING RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. REUSE INGREDIENTS across meals to minimize waste and cost
   - If buying chicken, use it in 2-3 meals
   - If buying vegetables, plan multiple uses

2. SIMPLE RECIPES only - max 6 ingredients per meal, under 30 min prep

3. REALISTIC PORTIONS for ${params.people} ${params.people === 1 ? 'person' : 'people'}:
   - Protein: ${params.people * 150}g per meal (${150}g per person)
   - Vegetables: ${params.people * 100}g per meal
   - Carbs: ${params.people * 75}g per meal

4. BUDGET-CONSCIOUS choices for Australian supermarkets:
   - Prefer chicken thighs over breast
   - Use seasonal vegetables
   - Include eggs and legumes as protein sources

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INGREDIENT RULES - CRITICAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO NOT LIST these pantry staples (assume already owned):
× Salt, pepper, herbs, spices
× Cooking oil, butter, margarine  
× Flour, sugar, baking items
× Soy sauce, vinegar, condiments
× Basic rice and pasta
× Garlic, onions (for seasoning)

ONLY LIST items to purchase:
✓ Fresh proteins (meat, fish, eggs, tofu)
✓ Fresh vegetables and fruits
✓ Dairy (milk, cheese, yogurt, cream)
✓ Specialty items specific to recipes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUANTITY FORMAT - USE STORE PACKAGES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write amounts as SOLD IN STORES:
• Meat: "500g pack", "1kg pack" (not "200g")
• Chicken: "500g thigh fillets", "1kg drumsticks"
• Eggs: "12-pack", "6-pack" (not "2 eggs")
• Milk: "1L", "2L" (not "1 cup")
• Cheese: "250g block", "500g shredded"
• Vegetables: "1 bunch", "400g bag", "1 head"
• Bread: "1 loaf" (not "2 slices")
• Yogurt: "500g tub", "1kg tub"
• Cream: "300ml", "600ml"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT - JSON ONLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY valid JSON. No markdown, no explanation, no code blocks.

{
  "days": [
    {
      "day": "${days[0]}",
      "meals": {
        "breakfast": {
          "name": "Simple Descriptive Name",
          "ingredients": [
            {"item": "Ingredient Name", "amount": "Store quantity"}
          ],
          "instructions": "Clear step-by-step instructions"
        },
        "lunch": { "name": "", "ingredients": [], "instructions": "" },
        "dinner": { "name": "", "ingredients": [], "instructions": "" }
      }
    }
  ]
}

Generate exactly ${params.days} days. Start with "${days[0]}" and end with "${days[days.length - 1]}".`;
};

/**
 * Generates a meal plan using the Gemini API.
 */
export const generateMealPlanWithGemini = async (params: Preferences): Promise<MealPlanResponse> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
  }

  const prompt = buildPrompt(params);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 12000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the text from Gemini's response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('Invalid response from Gemini API');
    }

    // Clean up the response - remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Parse the JSON response
    let mealPlan: MealPlanResponse;
    try {
      mealPlan = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', cleanedText.substring(0, 200));
      throw new Error('AI returned incomplete response. Please try again.');
    }
    
    // Validate the response has required fields
    if (!mealPlan.days || !Array.isArray(mealPlan.days) || mealPlan.days.length === 0) {
      throw new Error('Invalid meal plan format. Please try again.');
    }
    
    // Prices are now calculated separately via the "Calculate Prices" button
    // This makes meal plan generation faster
    
    return mealPlan;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to generate meal plan. Please check your API key and try again.');
  }
};

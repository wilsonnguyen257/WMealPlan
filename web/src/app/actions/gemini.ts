'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Preferences, MealPlan, MealPlanSchema, validateMealPlanForPreferences } from '@/lib/contracts';

const MODEL_NAME = 'gemini-2.5-flash'; // Using a stable, high-performance model
const MAX_RETRIES = 3;

/**
 * Generates the system prompt based on user preferences
 */
function buildPrompt(params: Preferences): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, params.days);
  const dailyBudget = Math.round(params.budget / params.days);

  return `You are an expert meal planner for Australian families.
  
CONTEXT:
- Days: ${params.days} (${days.join(', ')})
- People: ${params.people}
- Diet: ${params.diet}
- Goal: ${params.goal || 'Balanced'}
- Budget: $${params.budget} AUD (~$${dailyBudget}/day)

REQUIREMENTS:
1. Create a complete meal plan with Breakfast, Lunch, and Dinner for each day.
2. Use Australian ingredients and metric measurements.
3. Reuse ingredients to save money.
4. Recipes should be simple (under 30 mins).
5. Include a realistic total estimated grocery cost in AUD.
6. Output strict JSON only.

OUTPUT FORMAT (JSON):
{
  "days": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": { "name": "...", "prepTime": "...", "cookTime": "...", "difficulty": "...", "ingredients": [{"item": "...", "amount": "..."}], "instructions": "..." },
        "lunch": { ... },
        "dinner": { ... }
      }
    }
  ],
  "pantryItems": ["Oil", "Salt"],
  "estimatedCost": 120
}`;
}

export async function generateMealPlanAction(prefs: Preferences): Promise<MealPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = buildPrompt(prefs);
  
  let lastError: Error | null = null;

  // Retry Loop (High Assurance Pattern)
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) throw new Error("Empty response from AI");

      // Parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Failed to parse JSON response");
      }

      // Validate against Contract (The Gate)
      const validPlan = validateMealPlanForPreferences(MealPlanSchema.parse(data), prefs);
      
      return validPlan;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Attempt ${attempt} failed:`, errorMessage);
      lastError = error instanceof Error ? error : new Error(errorMessage);
      // Simple backoff could go here
    }
  }

  throw new Error(`Failed to generate valid plan after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
}

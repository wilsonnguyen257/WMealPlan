// src/api/gemini.ts
import { MealPlanResponse, Preferences } from '../types/mealPlan';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Builds the prompt for the Gemini API call.
 * This is where you instruct the AI on exactly what you want.
 */
const buildPrompt = (params: Preferences): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, params.days);
  
  return `You are a world-class nutritionist and chef.
Generate a simple, beginner-friendly ${params.days}-day meal plan based on the following user preferences.
The meal plan should reuse ingredients where possible to minimize waste.

User Preferences:
- Number of days: ${params.days}
- Number of people: ${params.people}
- Health goal: ${params.goal}
- Dietary preferences/restrictions: ${params.diet || 'None'}
- Budget level: ${params.budget}

Output ONLY a valid JSON object representing the meal plan. Do not include any introductory text, explanations, markdown formatting, or code blocks.
The JSON structure must follow this exact format:

{
  "days": [
    {
      "day": "${days[0]}",
      "meals": {
        "breakfast": { "name": "Meal Name", "ingredients": [{ "item": "Ingredient", "amount": "Quantity" }], "instructions": "Step-by-step cooking instructions" },
        "lunch": { "name": "Meal Name", "ingredients": [{ "item": "Ingredient", "amount": "Quantity" }], "instructions": "Step-by-step cooking instructions" },
        "dinner": { "name": "Meal Name", "ingredients": [{ "item": "Ingredient", "amount": "Quantity" }], "instructions": "Step-by-step cooking instructions" }
      }
    }
  ]
}

Generate all ${params.days} days following the same structure.`;
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
          maxOutputTokens: 8000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
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
    const mealPlan: MealPlanResponse = JSON.parse(cleanedText);
    
    return mealPlan;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
};

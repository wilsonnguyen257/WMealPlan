import { z } from 'zod';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const DIET_BLOCKLIST: Partial<Record<Diet, string[]>> = {
  Vegan: ['beef', 'chicken', 'pork', 'fish', 'salmon', 'tuna', 'meat', 'egg', 'milk', 'cheese', 'yogurt', 'cream', 'butter', 'honey'],
  Vegetarian: ['beef', 'chicken', 'pork', 'fish', 'salmon', 'tuna', 'meat', 'bacon', 'sausage'],
  Keto: ['bread', 'pasta', 'rice', 'potato', 'sugar', 'flour', 'oats', 'beans'],
  'Gluten-Free': ['bread', 'pasta', 'flour', 'wheat', 'barley', 'rye', 'breadcrumbs', 'soy sauce'],
};

// ==========================================
// Domain Types (Formal Specification)
// ==========================================

export const DietSchema = z.enum(["None", "Vegan", "Vegetarian", "Keto", "Gluten-Free"]);
export type Diet = z.infer<typeof DietSchema>;

export const IngredientSchema = z.object({
  item: z.string().min(1, "Ingredient name cannot be empty"),
  amount: z.string().min(1, "Amount cannot be empty"),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const MealSchema = z.object({
  name: z.string().min(1, "Meal name cannot be empty"),
  prepTime: z.string(),
  cookTime: z.string(),
  difficulty: z.string(),
  ingredients: z.array(IngredientSchema),
  instructions: z.string().or(z.array(z.string())), // Allow string or list of steps
});
export type Meal = z.infer<typeof MealSchema>;

export const DayPlanSchema = z.object({
  day: z.string(),
  meals: z.object({
    breakfast: MealSchema,
    lunch: MealSchema,
    dinner: MealSchema,
  }),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

// ==========================================
// Contracts (Input / Output Gates)
// ==========================================

/**
 * Input Contract: User Preferences
 * Invariants:
 * - Days: 1-7
 * - People: 1-10
 * - Budget: >= 10
 */
export const PreferencesSchema = z.object({
  days: z.number().int().min(1).max(7),
  people: z.number().int().min(1).max(10),
  budget: z.number().min(10, "Budget must be at least $10"),
  diet: DietSchema,
  goal: z.string().optional(),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

/**
 * Output Contract: Meal Plan
 * Invariants:
 * - Must have exactly 'days' number of day plans
 */
export const MealPlanSchema = z.object({
  days: z.array(DayPlanSchema),
  pantryItems: z.array(z.string()).optional(),
  estimatedCost: z.number().nonnegative(),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

export function validateMealPlanForPreferences(plan: MealPlan, prefs: Preferences): MealPlan {
  const expectedDays = DAY_NAMES.slice(0, prefs.days);

  if (plan.days.length !== prefs.days) {
    throw new Error(`Meal plan must contain exactly ${prefs.days} days.`);
  }

  plan.days.forEach((dayPlan, index) => {
    if (dayPlan.day !== expectedDays[index]) {
      throw new Error(`Expected day ${index + 1} to be ${expectedDays[index]}.`);
    }
  });

  if (plan.estimatedCost > prefs.budget * 1.2) {
    throw new Error('Meal plan exceeds the allowed budget threshold.');
  }

  const restrictedTerms = DIET_BLOCKLIST[prefs.diet];
  if (restrictedTerms) {
    for (const dayPlan of plan.days) {
      for (const meal of Object.values(dayPlan.meals)) {
        for (const ingredient of meal.ingredients) {
          const haystack = `${meal.name} ${ingredient.item}`.toLowerCase();
          const match = restrictedTerms.find((term) => haystack.includes(term));
          if (match) {
            throw new Error(`Meal plan violates the ${prefs.diet} restriction with "${ingredient.item}".`);
          }
        }
      }
    }
  }

  return plan;
}

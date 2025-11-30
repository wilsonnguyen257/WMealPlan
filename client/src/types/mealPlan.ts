// src/types/mealPlan.ts

export interface MealIngredient {
  item: string;
  amount: string;
}

export interface Meal {
  name: string;
  ingredients: MealIngredient[];
  instructions: string;
}

export interface DayPlan {
  day: string; // e.g. "Monday"
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
}

export interface MealPlanResponse {
  days: DayPlan[];
  estimatedCost?: number;
  priceBreakdown?: PriceEstimate[];
}

export interface PriceEstimate {
  item: string;
  estimatedPrice: number;
  quantity: string;
}

export interface Preferences {
  days: number;
  people: number;
  goal: 'Normal eating' | 'Weight loss' | 'Muscle gain' | 'Meat lover';
  diet: string;
  budget: number;
}

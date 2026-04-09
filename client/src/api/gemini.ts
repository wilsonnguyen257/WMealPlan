import { MealPlanResponse, Preferences, PriceEstimate } from '../types/mealPlan';

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error?: string }).error || 'Request failed')
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const estimatePrices = async (
  ingredients: string[]
): Promise<{ estimates: PriceEstimate[]; total: number }> => {
  const uniqueIngredients = Array.from(new Set(ingredients.map((item) => item.trim()).filter(Boolean)));

  if (uniqueIngredients.length === 0) {
    return { estimates: [], total: 0 };
  }

  const response = await fetch('/api/estimate-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients: uniqueIngredients }),
  });

  return parseJsonOrThrow<{ estimates: PriceEstimate[]; total: number }>(response);
};

export const generateMealPlanWithGemini = async (params: Preferences): Promise<MealPlanResponse> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await parseJsonOrThrow<{ mealPlan: MealPlanResponse }>(response);
  return data.mealPlan;
};

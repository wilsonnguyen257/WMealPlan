import { describe, it, expect } from 'vitest';
import { PreferencesSchema, MealPlanSchema, validateMealPlanForPreferences } from './contracts';

describe('Formal Contracts', () => {
  
  describe('PreferencesSchema (Input Gate)', () => {
    it('should accept valid preferences', () => {
      const valid = {
        days: 3,
        people: 2,
        budget: 150,
        diet: 'None',
        goal: 'Healthy'
      };
      expect(PreferencesSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject invalid days (invariant violation)', () => {
      const invalid = { days: 8, people: 1, budget: 100, diet: 'None' }; // Max 7 days
      expect(PreferencesSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject invalid budget (invariant violation)', () => {
      const invalid = { days: 3, people: 1, budget: 5, diet: 'None' }; // Min $10
      expect(PreferencesSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('MealPlanSchema (Output Gate)', () => {
    it('should validate a correct meal plan structure', () => {
      const validPlan = {
        days: [
          {
            day: 'Monday',
            meals: {
              breakfast: { name: 'Eggs', prepTime: '5m', cookTime: '5m', difficulty: 'Easy', ingredients: [{ item: 'Eggs', amount: '2' }], instructions: 'Cook' },
              lunch: { name: 'Salad', prepTime: '5m', cookTime: '0m', difficulty: 'Easy', ingredients: [{ item: 'Lettuce', amount: '1' }], instructions: 'Mix' },
              dinner: { name: 'Steak', prepTime: '5m', cookTime: '10m', difficulty: 'Medium', ingredients: [{ item: 'Steak', amount: '1' }], instructions: 'Grill' },
            }
          }
        ],
        estimatedCost: 35,
      };
      expect(MealPlanSchema.safeParse(validPlan).success).toBe(true);
    });

    it('should reject incomplete meals (safety violation)', () => {
      const invalidPlan = {
        days: [
          {
            day: 'Monday',
            meals: {
              // Missing breakfast
              lunch: { name: 'Salad', ingredients: [], instructions: '' },
              dinner: { name: 'Steak', ingredients: [], instructions: '' },
            }
          }
        ],
        estimatedCost: 20,
      };
      expect(MealPlanSchema.safeParse(invalidPlan).success).toBe(false);
    });

    it('should reject a plan whose day count does not match the submitted preferences', () => {
      const validShape = MealPlanSchema.parse({
        days: [
          {
            day: 'Monday',
            meals: {
              breakfast: { name: 'Eggs', prepTime: '5m', cookTime: '5m', difficulty: 'Easy', ingredients: [{ item: 'Eggs', amount: '2' }], instructions: 'Cook' },
              lunch: { name: 'Salad', prepTime: '5m', cookTime: '0m', difficulty: 'Easy', ingredients: [{ item: 'Lettuce', amount: '1' }], instructions: 'Mix' },
              dinner: { name: 'Steak', prepTime: '5m', cookTime: '10m', difficulty: 'Medium', ingredients: [{ item: 'Steak', amount: '1' }], instructions: 'Grill' },
            }
          }
        ],
        estimatedCost: 40,
      });

      expect(() =>
        validateMealPlanForPreferences(validShape, {
          days: 2,
          people: 2,
          budget: 100,
          diet: 'None',
        })
      ).toThrow('exactly 2 days');
    });

    it('should reject a plan that violates diet restrictions', () => {
      const validShape = MealPlanSchema.parse({
        days: [
          {
            day: 'Monday',
            meals: {
              breakfast: { name: 'Bacon and eggs', prepTime: '5m', cookTime: '5m', difficulty: 'Easy', ingredients: [{ item: 'Bacon', amount: '200g' }], instructions: 'Cook' },
              lunch: { name: 'Salad', prepTime: '5m', cookTime: '0m', difficulty: 'Easy', ingredients: [{ item: 'Lettuce', amount: '1' }], instructions: 'Mix' },
              dinner: { name: 'Soup', prepTime: '5m', cookTime: '10m', difficulty: 'Easy', ingredients: [{ item: 'Tomatoes', amount: '4' }], instructions: 'Boil' },
            }
          }
        ],
        estimatedCost: 30,
      });

      expect(() =>
        validateMealPlanForPreferences(validShape, {
          days: 1,
          people: 2,
          budget: 100,
          diet: 'Vegetarian',
        })
      ).toThrow('Vegetarian');
    });

    it('should reject a plan that exceeds the allowed budget threshold', () => {
      const validShape = MealPlanSchema.parse({
        days: [
          {
            day: 'Monday',
            meals: {
              breakfast: { name: 'Toast', prepTime: '5m', cookTime: '2m', difficulty: 'Easy', ingredients: [{ item: 'Bread', amount: '1 loaf' }], instructions: 'Toast' },
              lunch: { name: 'Salad', prepTime: '5m', cookTime: '0m', difficulty: 'Easy', ingredients: [{ item: 'Lettuce', amount: '1' }], instructions: 'Mix' },
              dinner: { name: 'Pasta', prepTime: '5m', cookTime: '10m', difficulty: 'Easy', ingredients: [{ item: 'Pasta', amount: '500g' }], instructions: 'Boil' },
            }
          }
        ],
        estimatedCost: 90,
      });

      expect(() =>
        validateMealPlanForPreferences(validShape, {
          days: 1,
          people: 2,
          budget: 50,
          diet: 'None',
        })
      ).toThrow('budget threshold');
    });
  });
});

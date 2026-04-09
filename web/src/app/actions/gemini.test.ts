import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMealPlanAction } from './gemini';

// Use vi.hoisted to share mocks between factory and tests
const mocks = vi.hoisted(() => {
  return {
    generateContent: vi.fn(),
  };
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mocks.generateContent
        };
      }
    }
  };
});

describe('generateMealPlanAction (Integration)', () => {
  
  const validPrefs = {
    days: 1,
    people: 1,
    budget: 50,
    diet: 'None' as const
  };

  const mockValidResponse = {
    days: [
      {
        day: 'Monday',
        meals: {
          breakfast: { name: 'Toast', prepTime: '5m', cookTime: '5m', difficulty: 'Easy', ingredients: [{ item: 'Bread', amount: '2 slices' }], instructions: 'Toast it' },
          lunch: { name: 'Sandwich', prepTime: '5m', cookTime: '0m', difficulty: 'Easy', ingredients: [{ item: 'Bread', amount: '2 slices' }], instructions: 'Make it' },
          dinner: { name: 'Pasta', prepTime: '10m', cookTime: '10m', difficulty: 'Easy', ingredients: [{ item: 'Pasta', amount: '100g' }], instructions: 'Boil it' },
        }
      }
    ],
    pantryItems: ['Salt'],
    estimatedCost: 40,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('should throw if API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateMealPlanAction(validPrefs)).rejects.toThrow('API key not configured');
  });

  it('should return a validated meal plan on success', async () => {
    mocks.generateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockValidResponse)
      }
    });

    const result = await generateMealPlanAction(validPrefs);
    expect(result).toEqual(mockValidResponse);
    expect(mocks.generateContent).toHaveBeenCalledTimes(1);
  });

  it('should retry on invalid JSON and eventually fail', async () => {
    mocks.generateContent.mockResolvedValue({
      response: {
        text: () => "I am not a JSON"
      }
    });

    await expect(generateMealPlanAction(validPrefs)).rejects.toThrow('Failed to parse JSON response');
    expect(mocks.generateContent).toHaveBeenCalledTimes(3); // Should retry 3 times
  });

  it('should retry on schema validation failure', async () => {
    const badStructure = {
      days: [{ day: 'Monday', meals: { } }],
      estimatedCost: 40,
    };

    mocks.generateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(badStructure)
      }
    });

    await expect(generateMealPlanAction(validPrefs)).rejects.toThrow(); // Zod error
    expect(mocks.generateContent).toHaveBeenCalledTimes(3);
  });

  it('should retry when plan violates preference invariants', async () => {
    mocks.generateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            ...mockValidResponse,
            estimatedCost: 500,
          })
      }
    });

    await expect(generateMealPlanAction(validPrefs)).rejects.toThrow('budget threshold');
    expect(mocks.generateContent).toHaveBeenCalledTimes(3);
  });
});

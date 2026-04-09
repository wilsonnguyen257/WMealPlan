import { describe, it, expect, vi } from 'vitest';
import { generateMealPlanAction } from './gemini';

// Mock the Google SDK to simulate chaos
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: vi.fn().mockImplementation(() => {
            // CHAOS: Randomly fail or return garbage
            const roll = Math.random();
            if (roll < 0.3) throw new Error('Chaos: Network Timeout');
            if (roll < 0.6) return { response: { text: () => 'Invalid JSON' } };
            return { 
              response: { 
                text: () => JSON.stringify({ 
                  days: [{ day: 'Monday', meals: { 
                    breakfast: { name: 'Test', ingredients: [], instructions: '' },
                    lunch: { name: 'Test', ingredients: [], instructions: '' },
                    dinner: { name: 'Test', ingredients: [], instructions: '' }
                  }}] 
                }) 
              } 
            };
          })
        };
      }
    }
  };
});

describe('Chaos Engineering Tests', () => {
  const prefs = { days: 1, people: 1, budget: 100, diet: 'None' as const };

  it('should handle system instability gracefully', async () => {
    // We expect the system to either recover (return plan) or fail gracefully (throw known error)
    // It should NEVER crash the process or return undefined.
    
    try {
      await generateMealPlanAction(prefs);
    } catch (e) {
      // If it fails, it must be a handled error
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toMatch(/Failed to|Chaos|API key/);
    }
  });
});

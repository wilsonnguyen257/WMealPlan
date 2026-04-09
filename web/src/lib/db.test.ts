import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { saveMealPlan, getMealPlan } from './db';
import { sql } from '@vercel/postgres';
import { MealPlan, Preferences } from './contracts';

// Mock Vercel Postgres
vi.mock('@vercel/postgres', () => {
  return {
    sql: vi.fn(),
  };
});

describe('Database Layer (Integration)', () => {
  const mockPlan = {
    mealPlan: { days: [] } as unknown as MealPlan, // Simplified for test
    preferences: { days: 3, people: 2, budget: 100, diet: 'None' } as unknown as Preferences
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveMealPlan', () => {
    it('should generate a short code and save to DB', async () => {
      // Mock successful insert
      (sql as unknown as Mock).mockResolvedValue({ rowCount: 1 });

      const shortCode = await saveMealPlan(mockPlan.mealPlan, mockPlan.preferences);

      expect(shortCode).toHaveLength(6);
      expect(sql).toHaveBeenCalledTimes(1);
      // Verify SQL query structure (roughly)
      const callArgs = (sql as unknown as Mock).mock.calls[0];
      expect(callArgs[0][0]).toContain('INSERT INTO shared_plans');
    });

    it('should retry if a generated short code collides', async () => {
      (sql as unknown as Mock)
        .mockRejectedValueOnce({ code: '23505' })
        .mockResolvedValueOnce({ rowCount: 1 });

      const shortCode = await saveMealPlan(mockPlan.mealPlan, mockPlan.preferences);

      expect(shortCode).toHaveLength(6);
      expect(sql).toHaveBeenCalledTimes(2);
    });

    it('should throw if database fails', async () => {
      (sql as unknown as Mock).mockRejectedValue(new Error('DB Connection Failed'));

      await expect(saveMealPlan(mockPlan.mealPlan, mockPlan.preferences))
        .rejects.toThrow('Failed to save plan');
    });
  });

  describe('getMealPlan', () => {
    it('should retrieve a plan by short code', async () => {
      const mockRow = {
        meal_plan: mockPlan.mealPlan,
        preferences: mockPlan.preferences,
        created_at: new Date()
      };

      // Mock successful select
      (sql as unknown as Mock).mockResolvedValue({ 
        rows: [mockRow], 
        rowCount: 1 
      });

      const result = await getMealPlan('ABC123');

      expect(result).toEqual(expect.objectContaining({
        mealPlan: mockPlan.mealPlan,
        preferences: mockPlan.preferences
      }));
      const callArgs = (sql as unknown as Mock).mock.calls[0];
      expect(callArgs[0].join('')).toContain('expires_at IS NULL OR expires_at > NOW()');
    });

    it('should return null if not found', async () => {
      (sql as unknown as Mock).mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await getMealPlan('NONEXIST');
      expect(result).toBeNull();
    });
  });
});

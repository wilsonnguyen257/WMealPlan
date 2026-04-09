import { sql } from '@vercel/postgres';
import { MealPlan, Preferences } from './contracts';
import { randomBytes } from 'crypto';

/**
 * Generates a random 6-character code (A-Z, 0-9)
 */
function generateShortCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

/**
 * Saves a meal plan to Vercel Postgres
 * @returns The 6-character short code for sharing
 */
export async function saveMealPlan(mealPlan: MealPlan, preferences: Preferences): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = generateShortCode();

    try {
      await sql`
        INSERT INTO shared_plans (short_code, meal_plan, preferences, created_at)
        VALUES (${shortCode}, ${JSON.stringify(mealPlan)}, ${JSON.stringify(preferences)}, NOW())
      `;

      return shortCode;
    } catch (error: unknown) {
      console.error('DB Error:', error);
      const duplicateKey = typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
      if (duplicateKey) {
        continue;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save plan: ${message}`);
    }
  }

  throw new Error('Failed to save plan: could not generate a unique short code.');
}

/**
 * Retrieves a meal plan by its short code
 */
export async function getMealPlan(shortCode: string): Promise<{ mealPlan: MealPlan; preferences: Preferences } | null> {
  try {
    const { rows } = await sql`
      SELECT meal_plan, preferences FROM shared_plans 
      WHERE short_code = ${shortCode.toUpperCase()}
      AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      return null;
    }
    
    return {
      mealPlan: rows[0].meal_plan as MealPlan,
      preferences: rows[0].preferences as Preferences
    };
  } catch (error: unknown) {
    console.error('DB Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to retrieve plan: ${message}`);
  }
}

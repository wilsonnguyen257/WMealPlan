require('dotenv').config();
const { sql } = require('@vercel/postgres');

// Generate random short code (6 chars: letters + numbers)
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Save meal plan and return short code
async function saveMealPlan(mealPlan, preferences) {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const shortCode = generateShortCode();
    
    try {
      await sql`
        INSERT INTO shared_plans (short_code, meal_plan, preferences)
        VALUES (${shortCode}, ${JSON.stringify(mealPlan)}, ${JSON.stringify(preferences)})
      `;
      return shortCode;
    } catch (error) {
      // If duplicate, try again
      if (error.code === '23505') {
        attempts++;
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Failed to generate unique short code');
}

// Load meal plan by short code
async function loadMealPlan(shortCode) {
  const result = await sql`
    SELECT meal_plan, preferences 
    FROM shared_plans 
    WHERE short_code = ${shortCode}
    AND (expires_at IS NULL OR expires_at > NOW())
  `;
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return {
    mealPlan: result.rows[0].meal_plan,
    preferences: result.rows[0].preferences
  };
}

// Clean up expired plans (optional, can run periodically)
async function cleanupExpired() {
  await sql`
    DELETE FROM shared_plans 
    WHERE expires_at IS NOT NULL AND expires_at < NOW()
  `;
}

module.exports = {
  saveMealPlan,
  loadMealPlan,
  cleanupExpired
};

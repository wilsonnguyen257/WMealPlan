const { sql } = require('@vercel/postgres');

// Initialize database schema
async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        preferences TEXT,
        servings INTEGER,
        dietary_restrictions TEXT,
        meal_plan JSONB NOT NULL,
        recipes JSONB NOT NULL,
        grocery_list JSONB NOT NULL,
        prep_instructions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Auto-initialize on import
initDatabase();

// Save a meal plan
async function saveMealPlan(data) {
  try {
    const result = await sql`
      INSERT INTO meal_plans (
        name, preferences, servings, dietary_restrictions, 
        meal_plan, recipes, grocery_list, prep_instructions
      )
      VALUES (
        ${data.name},
        ${data.preferences || ''},
        ${data.servings || 2},
        ${data.dietaryRestrictions || ''},
        ${JSON.stringify(data.mealPlan)},
        ${JSON.stringify(data.recipes)},
        ${JSON.stringify(data.groceryList)},
        ${JSON.stringify(data.prepInstructions)}
      )
      RETURNING id
    `;
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving meal plan:', error);
    throw error;
  }
}

// Get all meal plans (summary)
async function getAllMealPlans() {
  try {
    const result = await sql`
      SELECT id, name, preferences, servings, dietary_restrictions, created_at
      FROM meal_plans
      ORDER BY created_at DESC
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error getting meal plans:', error);
    throw error;
  }
}

// Get a specific meal plan by ID
async function getMealPlan(id) {
  try {
    const result = await sql`
      SELECT 
        id, name, preferences, servings, dietary_restrictions,
        meal_plan, recipes, grocery_list, prep_instructions, created_at
      FROM meal_plans
      WHERE id = ${id}
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const plan = result.rows[0];
    
    // Parse JSON fields
    return {
      id: plan.id,
      name: plan.name,
      preferences: plan.preferences,
      servings: plan.servings,
      dietaryRestrictions: plan.dietary_restrictions,
      mealPlan: typeof plan.meal_plan === 'string' ? JSON.parse(plan.meal_plan) : plan.meal_plan,
      recipes: typeof plan.recipes === 'string' ? JSON.parse(plan.recipes) : plan.recipes,
      groceryList: typeof plan.grocery_list === 'string' ? JSON.parse(plan.grocery_list) : plan.grocery_list,
      prepInstructions: typeof plan.prep_instructions === 'string' ? JSON.parse(plan.prep_instructions) : plan.prep_instructions,
      created_at: plan.created_at
    };
  } catch (error) {
    console.error('Error getting meal plan:', error);
    throw error;
  }
}

// Delete a meal plan
async function deleteMealPlan(id) {
  try {
    await sql`
      DELETE FROM meal_plans
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    throw error;
  }
}

module.exports = {
  saveMealPlan,
  getAllMealPlans,
  getMealPlan,
  deleteMealPlan
};

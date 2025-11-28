const { sql } = require('@vercel/postgres');

// Initialize database schema
async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create meal_plans table with user_id
    await sql`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

    // Create index on user_id for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id 
      ON meal_plans(user_id)
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
        user_id, name, preferences, servings, dietary_restrictions, 
        meal_plan, recipes, grocery_list, prep_instructions
      )
      VALUES (
        ${data.userId},
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

// Get all meal plans for a specific user
async function getAllMealPlans(userId) {
  try {
    const result = await sql`
      SELECT id, name, preferences, servings, dietary_restrictions, created_at
      FROM meal_plans
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error getting meal plans:', error);
    throw error;
  }
}

// Get a specific meal plan by ID (with user verification)
async function getMealPlan(id, userId) {
  try {
    const result = await sql`
      SELECT 
        id, name, preferences, servings, dietary_restrictions,
        meal_plan, recipes, grocery_list, prep_instructions, created_at
      FROM meal_plans
      WHERE id = ${id} AND user_id = ${userId}
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

// Delete a meal plan (with user verification)
async function deleteMealPlan(id, userId) {
  try {
    await sql`
      DELETE FROM meal_plans
      WHERE id = ${id} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    throw error;
  }
}

// User authentication functions
async function createUser(email, passwordHash, name = null) {
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name})
      RETURNING id, email, name, created_at
    `;
    return result.rows[0];
  } catch (error) {
    if (error.message.includes('unique')) {
      throw new Error('Email already exists');
    }
    console.error('Error creating user:', error);
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const result = await sql`
      SELECT id, email, password_hash, name, created_at
      FROM users
      WHERE email = ${email}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

async function getUserById(id) {
  try {
    const result = await sql`
      SELECT id, email, name, created_at
      FROM users
      WHERE id = ${id}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

module.exports = {
  saveMealPlan,
  getAllMealPlans,
  getMealPlan,
  deleteMealPlan,
  createUser,
  getUserByEmail,
  getUserById
};

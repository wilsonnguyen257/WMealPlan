const Database = require('better-sqlite3');
const path = require('path');

// Create/connect to database
const db = new Database(path.join(__dirname, 'mealplans.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    preferences TEXT,
    servings INTEGER,
    dietary_restrictions TEXT,
    meal_plan TEXT NOT NULL,
    recipes TEXT NOT NULL,
    grocery_list TEXT NOT NULL,
    prep_instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Save a meal plan
function saveMealPlan(data) {
  const stmt = db.prepare(`
    INSERT INTO meal_plans (name, preferences, servings, dietary_restrictions, meal_plan, recipes, grocery_list, prep_instructions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.name,
    data.preferences || '',
    data.servings || 2,
    data.dietaryRestrictions || '',
    JSON.stringify(data.mealPlan),
    JSON.stringify(data.recipes),
    JSON.stringify(data.groceryList),
    JSON.stringify(data.prepInstructions)
  );
  
  return result.lastInsertRowid;
}

// Get all meal plans (summary)
function getAllMealPlans() {
  const stmt = db.prepare(`
    SELECT id, name, preferences, servings, dietary_restrictions, created_at
    FROM meal_plans
    ORDER BY created_at DESC
  `);
  
  return stmt.all();
}

// Get a specific meal plan by ID
function getMealPlan(id) {
  const stmt = db.prepare(`
    SELECT * FROM meal_plans WHERE id = ?
  `);
  
  const row = stmt.get(id);
  
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    preferences: row.preferences,
    servings: row.servings,
    dietaryRestrictions: row.dietary_restrictions,
    mealPlan: JSON.parse(row.meal_plan),
    recipes: JSON.parse(row.recipes),
    groceryList: JSON.parse(row.grocery_list),
    prepInstructions: JSON.parse(row.prep_instructions),
    createdAt: row.created_at
  };
}

// Delete a meal plan
function deleteMealPlan(id) {
  const stmt = db.prepare(`DELETE FROM meal_plans WHERE id = ?`);
  return stmt.run(id);
}

module.exports = {
  saveMealPlan,
  getAllMealPlans,
  getMealPlan,
  deleteMealPlan
};

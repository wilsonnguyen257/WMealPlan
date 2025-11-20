import React, { useState } from 'react';
import './MealPlanDisplay.css';

function MealPlanDisplay({ mealPlan, recipes }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  const findRecipe = (mealName) => {
    return recipes.find(recipe => 
      recipe.name.toLowerCase() === mealName.toLowerCase()
    );
  };

  const handleMealClick = (mealName) => {
    const recipe = findRecipe(mealName);
    if (recipe) {
      setSelectedRecipe(recipe);
    }
  };

  return (
    <div className="meal-plan-display">
      <h2>📅 Your 7-Day Meal Plan</h2>
      
      <div className="meal-grid">
        {days.map(day => (
          <div key={day} className="day-card">
            <h3>{day}</h3>
            {mealTypes.map(mealType => (
              <div key={mealType} className="meal-item">
                <span className="meal-type">{mealType}</span>
                <span 
                  className="meal-name"
                  onClick={() => handleMealClick(mealPlan[day][mealType])}
                >
                  {mealPlan[day][mealType]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <div className="recipe-modal" onClick={() => setSelectedRecipe(null)}>
          <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedRecipe(null)}>×</button>
            
            <h2>{selectedRecipe.name}</h2>
            
            <div className="recipe-meta">
              <span>👥 {selectedRecipe.servings} servings</span>
              <span>⏱️ Prep: {selectedRecipe.prepTime}</span>
              <span>🍳 Cook: {selectedRecipe.cookTime}</span>
            </div>

            <div className="recipe-section">
              <h3>Ingredients</h3>
              <ul>
                {selectedRecipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="recipe-section">
              <h3>Instructions</h3>
              <ol>
                {selectedRecipe.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>

            {selectedRecipe.storageInstructions && (
              <div className="recipe-section storage">
                <h3>📦 Storage & Reheating</h3>
                <p>{selectedRecipe.storageInstructions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="recipes-section">
        <h2>📖 All Recipes</h2>
        <div className="recipes-list">
          {recipes.map((recipe, idx) => (
            <div key={idx} className="recipe-card" onClick={() => setSelectedRecipe(recipe)}>
              <h4>{recipe.name}</h4>
              <div className="recipe-quick-info">
                <span>👥 {recipe.servings}</span>
                <span>⏱️ {recipe.prepTime}</span>
                <span>🍳 {recipe.cookTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MealPlanDisplay;

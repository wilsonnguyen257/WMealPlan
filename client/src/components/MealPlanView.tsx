// src/components/MealPlanView.tsx
import React, { useState } from 'react';
import { DayPlan, Meal } from '../types/mealPlan';
import './MealPlanView.css';

interface MealPlanViewProps {
  days: DayPlan[];
  servings: number;
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ days, servings }) => {
  const [selectedMeal, setSelectedMeal] = useState<{ meal: Meal; mealType: string; day: string } | null>(null);

  const handleMealClick = (meal: Meal, mealType: string, day: string) => {
    setSelectedMeal({ meal, mealType, day });
  };

  return (
    <div className="meal-plan-view">
      <div className="servings-badge">
        All recipes serve <strong>{servings} {servings === 1 ? 'person' : 'people'}</strong>
      </div>
      
      <div className="meal-plan-layout">
        <div className="meals-list">
          {days.map((dayPlan) => (
            <div key={dayPlan.day} className="day-card">
              <div className="day-header">
                <h3 className="day-title">{dayPlan.day}</h3>
              </div>
              <div className="meals-grid">
                {Object.entries(dayPlan.meals).map(([mealType, meal]) => (
                  <div 
                    key={mealType} 
                    className={`meal-item ${selectedMeal?.meal === meal ? 'active' : ''}`}
                    onClick={() => handleMealClick(meal, mealType, dayPlan.day)}
                  >
                    <h4 className="meal-type">{mealType}</h4>
                    <p className="meal-name">{meal.name}</p>
                    <div className="meal-meta">
                      <span className="meta-item">{meal.prepTime}</span>
                      <span className="meta-item">{meal.cookTime}</span>
                      <span className="meta-item">{meal.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedMeal && (
          <div className="recipe-panel">
            <div className="recipe-header">
              <div>
                <h3>{selectedMeal.meal.name}</h3>
                <p className="recipe-meta-info">
                  {selectedMeal.day} • {selectedMeal.mealType}
                </p>
              </div>
              <button className="close-btn" onClick={() => setSelectedMeal(null)}>×</button>
            </div>
            
            <div className="recipe-stats">
              <div className="stat">
                <span className="stat-label">Prep</span>
                <span className="stat-value">{selectedMeal.meal.prepTime}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Cook</span>
                <span className="stat-value">{selectedMeal.meal.cookTime}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Difficulty</span>
                <span className="stat-value">{selectedMeal.meal.difficulty}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Serves</span>
                <span className="stat-value">{servings}</span>
              </div>
            </div>

            <div className="recipe-content">
              <section className="recipe-section">
                <h4>Ingredients</h4>
                <ul className="ingredients-list">
                  {selectedMeal.meal.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <span className="ingredient-amount">{ing.amount}</span>
                      <span className="ingredient-name">{ing.item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="recipe-section">
                <h4>Instructions</h4>
                <ol className="instructions-list">
                  {selectedMeal.meal.instructions.split(/\d+\.\s+/).filter(step => step.trim()).map((step, idx) => (
                    <li key={idx}>{step.trim()}</li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanView;

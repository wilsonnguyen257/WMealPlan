// src/components/MealPlanView.tsx
import React from 'react';
import { DayPlan } from '../types/mealPlan';
import './MealPlanView.css';

interface MealPlanViewProps {
  days: DayPlan[];
  servings: number;
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ days, servings }) => {
  return (
    <div className="meal-plan-view">
      <div className="servings-badge">
        All recipes serve <strong>{servings} {servings === 1 ? 'person' : 'people'}</strong>
      </div>
      {days.map((dayPlan) => (
        <div key={dayPlan.day} className="day-card">
          <div className="day-header">
            <h3 className="day-title">{dayPlan.day}</h3>
          </div>
          <div className="meals-grid">
            {Object.entries(dayPlan.meals).map(([mealType, meal]) => (
              <div key={mealType} className="meal-item">
                <h4 className="meal-type">{mealType}</h4>
                <p className="meal-name">{meal.name}</p>
                <span className="serving-info">Serves {servings}</span>
                <details className="meal-details">
                  <summary>Details</summary>
                  <p className="meal-instructions">{meal.instructions}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealPlanView;

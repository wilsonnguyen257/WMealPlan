// src/components/MealPlanView.tsx
import React from 'react';
import { DayPlan } from '../types/mealPlan';
import './MealPlanView.css';

interface MealPlanViewProps {
  days: DayPlan[];
  onRegenerateDay: (day: string) => void;
}

const MealPlanView: React.FC<MealPlanViewProps> = ({ days, onRegenerateDay }) => {
  return (
    <div className="meal-plan-view">
      {days.map((dayPlan) => (
        <div key={dayPlan.day} className="day-card">
          <div className="day-header">
            <h3 className="day-title">{dayPlan.day}</h3>
            <button className="regenerate-btn" onClick={() => onRegenerateDay(dayPlan.day)}>
              Regenerate
            </button>
          </div>
          <div className="meals-grid">
            {Object.entries(dayPlan.meals).map(([mealType, meal]) => (
              <div key={mealType} className="meal-item">
                <h4 className="meal-type">{mealType}</h4>
                <p className="meal-name">{meal.name}</p>
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

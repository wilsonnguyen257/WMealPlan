// src/components/Results.tsx
import React, { useState } from 'react';
import { MealPlanResponse } from '../types/mealPlan';
import MealPlanView from './MealPlanView';
import ShoppingListView from './ShoppingListView';
import './Results.css';

interface ResultsProps {
  mealPlan: MealPlanResponse;
  onRegenerateDay: (day: string) => void;
}

type View = 'plan' | 'shopping';

const Results: React.FC<ResultsProps> = ({ mealPlan, onRegenerateDay }) => {
  const [activeView, setActiveView] = useState<View>('plan');

  return (
    <section className="results-section">
      <div className="tabs">
        <button
          className={`tab-btn ${activeView === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveView('plan')}
        >
          Meal Plan
        </button>
        <button
          className={`tab-btn ${activeView === 'shopping' ? 'active' : ''}`}
          onClick={() => setActiveView('shopping')}
        >
          Shopping List
        </button>
      </div>

      <div className="tab-content">
        {activeView === 'plan' ? (
          <MealPlanView days={mealPlan.days} onRegenerateDay={onRegenerateDay} />
        ) : (
          <ShoppingListView mealPlan={mealPlan} />
        )}
      </div>
    </section>
  );
};

export default Results;

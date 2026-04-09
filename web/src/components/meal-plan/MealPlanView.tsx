'use client';

import { MealPlan, DayPlan, Meal } from '@/lib/contracts';
import { useState } from 'react';

// ==========================================
// Sub-Components
// ==========================================

function MealCard({ type, meal }: { type: string; meal: Meal }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 capitalize">{type}</h4>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {meal.difficulty} • {meal.cookTime}
        </span>
      </div>
      <h3 className="text-lg font-bold text-indigo-600 mb-2">{meal.name}</h3>
      
      <div className="space-y-2">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 list-none flex items-center">
            <span className="mr-2 group-open:rotate-90 transition-transform">▸</span>
            Ingredients ({meal.ingredients.length})
          </summary>
          <ul className="mt-2 text-sm text-gray-600 space-y-1 pl-4">
            {meal.ingredients.map((ing, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{ing.item}</span>
                <span className="text-gray-400">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </details>
        
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 list-none flex items-center">
            <span className="mr-2 group-open:rotate-90 transition-transform">▸</span>
            Instructions
          </summary>
          <div className="mt-2 text-sm text-gray-600 pl-4">
            {Array.isArray(meal.instructions) ? (
              <ol className="list-decimal space-y-1">
                {meal.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            ) : (
              <p>{meal.instructions}</p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

function DayView({ dayPlan }: { dayPlan: DayPlan }) {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{dayPlan.day}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MealCard type="breakfast" meal={dayPlan.meals.breakfast} />
        <MealCard type="lunch" meal={dayPlan.meals.lunch} />
        <MealCard type="dinner" meal={dayPlan.meals.dinner} />
      </div>
    </div>
  );
}

function ShoppingList({ plan }: { plan: MealPlan }) {
  // Aggregate ingredients
  const allIngredients: Record<string, string[]> = {};
  
  plan.days.forEach(day => {
    Object.values(day.meals).forEach(meal => {
      meal.ingredients.forEach(ing => {
        if (!allIngredients[ing.item]) {
          allIngredients[ing.item] = [];
        }
        allIngredients[ing.item].push(ing.amount);
      });
    });
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(allIngredients).map(([item, amounts]) => (
          <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-800">{item}</span>
            <span className="text-sm text-gray-500 text-right">{amounts.join(' + ')}</span>
          </div>
        ))}
      </div>
      {plan.pantryItems && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Check Pantry</h3>
          <div className="flex flex-wrap gap-2">
            {plan.pantryItems.map((item, idx) => (
              <span key={idx} className="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Main Component
// ==========================================

export function MealPlanView({ plan, onReset }: { plan: MealPlan; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<'plan' | 'shopping'>('plan');

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'plan' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Weekly Plan
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'shopping' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Shopping List
          </button>
        </div>
        <button
          onClick={onReset}
          className="text-gray-500 hover:text-gray-700 font-medium underline"
        >
          Create New Plan
        </button>
      </div>

      {activeTab === 'plan' ? (
        <div className="space-y-6">
          {plan.days.map((day, idx) => (
            <DayView key={idx} dayPlan={day} />
          ))}
        </div>
      ) : (
        <ShoppingList plan={plan} />
      )}
    </div>
  );
}

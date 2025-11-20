import React, { useState } from 'react';
import './App.css';
import MealPlanForm from './components/MealPlanForm';
import MealPlanDisplay from './components/MealPlanDisplay';
import GroceryList from './components/GroceryList';
import PrepInstructions from './components/PrepInstructions';
import SmartShopper from './components/SmartShopper';
import SavedMealPlans from './components/SavedMealPlans';

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);

  const generateMealPlan = async (preferences, servings, dietaryRestrictions) => {
    setLoading(true);
    setError(null);
    setFormData({ preferences, servings, dietaryRestrictions });

    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          servings,
          dietaryRestrictions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMealPlan(data.data);
      } else {
        setError(data.error || 'Failed to generate meal plan');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async () => {
    const name = prompt('Enter a name for this meal plan:');
    if (!name) return;

    try {
      const response = await fetch('/api/save-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ...formData,
          ...mealPlan
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Meal plan saved successfully!');
      } else {
        alert('Failed to save meal plan');
      }
    } catch (err) {
      alert('Failed to save meal plan');
    }
  };

  const loadMealPlan = (plan) => {
    setMealPlan({
      mealPlan: plan.mealPlan,
      recipes: plan.recipes,
      groceryList: plan.groceryList,
      prepInstructions: plan.prepInstructions
    });
    setFormData({
      preferences: plan.preferences,
      servings: plan.servings,
      dietaryRestrictions: plan.dietaryRestrictions
    });
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🍽️ Weekly Meal Prep Planner</h1>
        <p>AI-powered meal planning for efficient one-day prep</p>
      </header>

      <main className="app-main">
        <SavedMealPlans onLoadPlan={loadMealPlan} />
        
        <MealPlanForm onGenerate={generateMealPlan} loading={loading} />

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Generating your personalized meal plan...</p>
          </div>
        )}

        {mealPlan && !loading && (
          <div className="results-container">
            <div className="save-bar">
              <button onClick={saveMealPlan} className="save-btn">
                💾 Save This Meal Plan
              </button>
            </div>
            <MealPlanDisplay mealPlan={mealPlan.mealPlan} recipes={mealPlan.recipes} />
            <div className="side-panel">
              <GroceryList groceryList={mealPlan.groceryList} />
              <SmartShopper groceryList={mealPlan.groceryList} />
              <PrepInstructions prepInstructions={mealPlan.prepInstructions} />
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ for healthy meal prep</p>
      </footer>
    </div>
  );
}

export default App;

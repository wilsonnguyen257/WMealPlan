import React, { useState } from 'react';
import './App.css';
import MealPlanForm from './components/MealPlanForm';
import MealPlanDisplay from './components/MealPlanDisplay';
import GroceryList from './components/GroceryList';
import PrepInstructions from './components/PrepInstructions';
import SmartShopper from './components/SmartShopper';
import SavedMealPlans from './components/SavedMealPlans';
import PantryMeals from './components/PantryMeals';

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'pantry'
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [savedPlansCount, setSavedPlansCount] = useState(0);

  // Fetch saved plans count
  const updateSavedPlansCount = async () => {
    try {
      const response = await fetch('/api/meal-plans');
      const data = await response.json();
      if (data.success) {
        setSavedPlansCount(data.data.length);
      }
    } catch (error) {
      console.error('Error fetching saved plans count:', error);
    }
  };

  React.useEffect(() => {
    updateSavedPlansCount();
  }, []);

  const generateMealPlan = async (preferences, servings, dietaryRestrictions, budgetMin, budgetMax) => {
    setLoading(true);
    setError(null);
    setFormData({ preferences, servings, dietaryRestrictions, budgetMin, budgetMax });

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
          budgetMin,
          budgetMax,
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
        alert('✅ Meal plan saved successfully!');
        updateSavedPlansCount();
      } else {
        alert('Failed to save meal plan');
      }
    } catch (err) {
      alert('Failed to save meal plan');
    }
  };

  const loadMealPlan = async (plan) => {
    setActiveTab('weekly');
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
    setShowSavedPlans(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🍽️ WMealPlan</h1>
          <p className="tagline">Your AI-Powered Meal Planning Assistant</p>
          <div className="header-actions">
            <button 
              className="saved-plans-toggle"
              onClick={() => setShowSavedPlans(!showSavedPlans)}
            >
              📚 {showSavedPlans ? 'Hide' : 'View'} Saved Plans ({savedPlansCount})
            </button>
          </div>
        </div>
      </header>

      {showSavedPlans && (
        <div className="saved-plans-overlay">
          <SavedMealPlans onLoadPlan={loadMealPlan} onClose={() => setShowSavedPlans(false)} />
        </div>
      )}

      <main className="app-main">
        <section className="hero-section">
          <h2>Plan Smarter, Eat Better</h2>
          <p>Generate personalized weekly meal plans or find recipes from ingredients you already have</p>
          <div className="feature-highlights">
            <div className="feature-card">
              <span className="feature-icon">📅</span>
              <h3>Weekly Planner</h3>
              <p>7-day meal plans with recipes & shopping lists</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🍳</span>
              <h3>Pantry Chef</h3>
              <p>Cook from what you have at home</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Budget Friendly</h3>
              <p>Price estimates from local stores</p>
            </div>
          </div>
        </section>
        
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            📅 Weekly Meal Planner
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pantry' ? 'active' : ''}`}
            onClick={() => setActiveTab('pantry')}
          >
            🍳 Cook from Pantry
          </button>
        </div>

        {activeTab === 'weekly' ? (
          <>
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
          </>
        ) : (
          <PantryMeals />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Made with ❤️ for healthy meal prep</p>
          <p className="footer-note">Powered by Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

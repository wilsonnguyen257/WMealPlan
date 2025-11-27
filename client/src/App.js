import React, { useState } from 'react';
import './App.css';
import MealPlanForm from './components/MealPlanForm';
import MealPlanDisplay from './components/MealPlanDisplay';
import GroceryList from './components/GroceryList';
import PrepInstructions from './components/PrepInstructions';
import SmartShopper from './components/SmartShopper';
import SavedMealPlans from './components/SavedMealPlans';
import PantryMeals from './components/PantryMeals';
import RecipeSearch from './components/RecipeSearch';
import Toast from './components/Toast';

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly', 'pantry', or 'search'
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [savedPlansCount, setSavedPlansCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

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

  const generateMealPlan = async (preferences, servings, dietaryRestrictions, budgetMin, budgetMax, allergies, healthGoal, weight, activityLevel) => {
    setLoading(true);
    setError(null);
    setFormData({ preferences, servings, dietaryRestrictions, budgetMin, budgetMax, allergies, healthGoal, weight, activityLevel });

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
          allergies,
          healthGoal,
          weight,
          activityLevel
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMealPlan(data.data);
        showToast('✨ Meal plan generated successfully!', 'success');
        window.scrollTo({ top: document.querySelector('.results-container')?.offsetTop - 100 || 0, behavior: 'smooth' });
      } else {
        const errorMsg = data.error || 'Failed to generate meal plan';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      const errorMsg = 'Failed to connect to server. Please check your connection.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async () => {
    const name = prompt('Enter a name for this meal plan:');
    if (!name || !name.trim()) return;

    try {
      const response = await fetch('/api/save-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ...formData,
          ...mealPlan
        })
      });

      const data = await response.json();
      if (data.success) {
        showToast(`✅ "${name.trim()}" saved successfully!`, 'success');
        updateSavedPlansCount();
      } else {
        showToast('Failed to save meal plan. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please check your connection.', 'error');
      console.error('Save error:', err);
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
    showToast(`📂 Loaded "${plan.name}" successfully!`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>WMealPlan</h1>
          <p className="tagline">Your AI-Powered Meal Planning Assistant</p>
          <div className="header-actions">
            <button 
              className="saved-plans-toggle"
              onClick={() => setShowSavedPlans(!showSavedPlans)}
            >
              {showSavedPlans ? 'Hide' : 'View'} Saved Plans ({savedPlansCount})
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
              <h3>Weekly Planner</h3>
              <p>AI-powered 7-day meal plans with detailed recipes & shopping lists</p>
            </div>
            <div className="feature-card">
              <h3>Recipe Search</h3>
              <p>Find perfect recipes by name, ingredient, or cuisine</p>
            </div>
            <div className="feature-card">
              <h3>Pantry Chef</h3>
              <p>Turn leftover ingredients into delicious meals</p>
            </div>
            <div className="feature-card">
              <h3>Smart Shopping</h3>
              <p>Price estimates from Coles, Woolworths & Aldi</p>
            </div>
          </div>
          
          <div className="how-it-works">
            <h3>How It Works</h3>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <p>Choose your preferences and serving size</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>AI generates personalized meal plan in seconds</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>Get recipes, grocery list & price estimates</p>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <p>Save favorites and shop with confidence</p>
              </div>
            </div>
          </div>
        </section>
        
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            Weekly Meal Planner
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pantry' ? 'active' : ''}`}
            onClick={() => setActiveTab('pantry')}
          >
            Cook from Pantry
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Find Recipes
          </button>
        </div>

        {activeTab === 'weekly' ? (
          <>
            <MealPlanForm onGenerate={generateMealPlan} loading={loading} />

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {loading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Crafting your personalized meal plan...</p>
                <p className="loading-subtext">This may take 10-20 seconds</p>
              </div>
            )}

            {mealPlan && !loading && (
              <div className="results-container">
                <div className="save-bar">
                  <button onClick={saveMealPlan} className="save-btn">
                    Save This Meal Plan
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
        ) : activeTab === 'pantry' ? (
          <PantryMeals />
        ) : (
          <RecipeSearch />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Made for healthy meal prep</p>
          <p className="footer-note">Powered by Google Gemini AI</p>
        </div>
      </footer>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;

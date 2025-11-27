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
import ProgressBar from './components/ProgressBar';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { exportMealPlanToPDF } from './utils/pdfExport';

function App() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly', 'pantry', or 'search'
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [savedPlansCount, setSavedPlansCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      // ? to toggle shortcuts panel (Shift + /)
      if (e.key === '?' && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // Ctrl+S or Cmd+S to save meal plan
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && mealPlan && !loading) {
        e.preventDefault();
        saveMealPlan();
        return;
      }

      // ESC to close saved plans modal
      if (e.key === 'Escape' && showSavedPlans) {
        setShowSavedPlans(false);
        return;
      }

      // Number keys 1-3 for tab navigation (when not in input)
      if (!e.target.matches('input, textarea, select')) {
        if (e.key === '1') {
          setActiveTab('weekly');
        } else if (e.key === '2') {
          setActiveTab('pantry');
        } else if (e.key === '3') {
          setActiveTab('search');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealPlan, loading, showSavedPlans]);

  const generateMealPlan = async (preferences, servings, dietaryRestrictions, budgetMin, budgetMax, allergies, healthGoal, weight, activityLevel) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setProgressStage('Analyzing your preferences...');
    setFormData({ preferences, servings, dietaryRestrictions, budgetMin, budgetMax, allergies, healthGoal, weight, activityLevel });

    // Simulate progress stages
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90%, complete on success
        const increment = Math.random() * 15 + 5;
        const newProgress = Math.min(prev + increment, 90);
        
        // Update stage based on progress
        if (newProgress < 20) {
          setProgressStage('Analyzing your preferences...');
        } else if (newProgress < 40) {
          setProgressStage('Finding perfect recipes...');
        } else if (newProgress < 60) {
          setProgressStage('Building your meal plan...');
        } else if (newProgress < 80) {
          setProgressStage('Creating grocery list...');
        } else {
          setProgressStage('Finalizing details...');
        }
        
        return newProgress;
      });
    }, 800);

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
      clearInterval(progressInterval);

      if (data.success) {
        setProgress(100);
        setProgressStage('Complete!');
        setTimeout(() => {
          setMealPlan(data.data);
          showToast('✨ Meal plan generated successfully!', 'success');
          window.scrollTo({ top: document.querySelector('.results-container')?.offsetTop - 100 || 0, behavior: 'smooth' });
        }, 500);
      } else {
        const errorMsg = data.error || 'Failed to generate meal plan';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      clearInterval(progressInterval);
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
      <header className="app-header" role="banner">
        <div className="header-content">
          <div className="brand-section">
            <h1>WMeal</h1>
            <p className="tagline">Meal planning that adapts to your life</p>
          </div>
          <div className="header-actions">
            <button 
              className="saved-plans-toggle"
              onClick={() => setShowSavedPlans(!showSavedPlans)}
              aria-label={`${showSavedPlans ? 'Hide' : 'View'} saved meal plans. You have ${savedPlansCount} saved plans`}
              aria-expanded={showSavedPlans}
            >
              <span className="saved-icon">📁</span>
              <span>Saved Plans</span>
              {savedPlansCount > 0 && <span className="badge">{savedPlansCount}</span>}
            </button>
            <button
              className="keyboard-hint-btn"
              onClick={() => setShowShortcuts(true)}
              aria-label="View keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <span>⌨️</span>
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
          <h2>Your week's meals, planned in minutes</h2>
          <p className="hero-description">Smart meal plans, instant grocery lists, and recipe ideas that fit your lifestyle</p>
          <div className="feature-highlights">
            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">📅</span>
              <h3>Weekly Plans</h3>
              <p>7-day plans with recipes, grocery lists, and price estimates</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">🔍</span>
              <h3>Recipe Library</h3>
              <p>Search thousands of recipes by ingredient or cuisine</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">🥘</span>
              <h3>Use What You Have</h3>
              <p>Transform pantry staples into delicious meals</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">💰</span>
              <h3>Smart Shopping</h3>
              <p>Compare prices across Coles, Woolworths & Aldi</p>
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
        
        <nav className="tab-navigation" role="tablist" aria-label="Meal planning options">
          <button 
            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
            role="tab"
            aria-selected={activeTab === 'weekly'}
            aria-controls="weekly-panel"
          >
            <span className="tab-icon">📅</span>
            <span>Weekly Plans</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pantry' ? 'active' : ''}`}
            onClick={() => setActiveTab('pantry')}
            role="tab"
            aria-selected={activeTab === 'pantry'}
            aria-controls="pantry-panel"
          >
            <span className="tab-icon">🥘</span>
            <span>Use Pantry</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
            role="tab"
            aria-selected={activeTab === 'search'}
            aria-controls="search-panel"
          >
            <span className="tab-icon">🔍</span>
            <span>Find Recipes</span>
          </button>
        </nav>

        {activeTab === 'weekly' ? (
          <>
            <MealPlanForm onGenerate={generateMealPlan} loading={loading} />

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {loading && (
              <ProgressBar 
                progress={progress} 
                message="Crafting your personalized meal plan..."
                stage={progressStage}
              />
            )}

            {mealPlan && !loading && (
              <div className="results-container">
                <div className="save-bar">
                  <button onClick={saveMealPlan} className="save-btn">
                    Save This Meal Plan
                  </button>
                  <button 
                    onClick={() => exportMealPlanToPDF(
                      mealPlan.mealPlan, 
                      mealPlan.recipes, 
                      mealPlan.groceryList, 
                      mealPlan.prepInstructions,
                      formData
                    )} 
                    className="export-btn"
                  >
                    Download PDF
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

      <footer className="app-footer" role="contentinfo">
        <div className="footer-content">
          <p>Built for home cooks who value their time</p>
          <p className="footer-note">Powered by AI · Made with care</p>
        </div>
      </footer>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}

export default App;

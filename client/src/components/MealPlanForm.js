import React, { useState } from 'react';
import useAutosave from '../hooks/useAutosave';
import './MealPlanForm.css';

const AUTOSAVE_KEY = 'mealPlanFormData';

function MealPlanForm({ onGenerate, loading }) {
  // Initialize state from localStorage if available
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  };

  const savedData = getSavedData();

  const [preferences, setPreferences] = useState(savedData?.preferences || '');
  const [servings, setServings] = useState(savedData?.servings || 2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(savedData?.dietaryRestrictions || '');
  const [allergies, setAllergies] = useState(savedData?.allergies || '');
  const [healthGoal, setHealthGoal] = useState(savedData?.healthGoal || '');
  const [weight, setWeight] = useState(savedData?.weight || '');
  const [activityLevel, setActivityLevel] = useState(savedData?.activityLevel || 'moderate');
  const [budgetMin, setBudgetMin] = useState(savedData?.budgetMin || '');
  const [budgetMax, setBudgetMax] = useState(savedData?.budgetMax || '');
  const [showAdvanced, setShowAdvanced] = useState(savedData?.showAdvanced || false);
  const [errors, setErrors] = useState({});
  
  // Use autosave hook with all form data
  const formData = {
    preferences,
    servings,
    dietaryRestrictions,
    allergies,
    healthGoal,
    weight,
    activityLevel,
    budgetMin,
    budgetMax,
    showAdvanced
  };
  
  const { lastSaved, clearSavedData } = useAutosave(AUTOSAVE_KEY, formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    
    if (budgetMin && budgetMax && parseFloat(budgetMin) > parseFloat(budgetMax)) {
      newErrors.budget = 'Minimum budget cannot be greater than maximum';
    }
    
    if (weight && (parseFloat(weight) < 20 || parseFloat(weight) > 300)) {
      newErrors.weight = 'Please enter a realistic weight (20-300 kg)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    clearSavedData(); // Clear autosaved data on successful submission
    onGenerate(preferences, servings, dietaryRestrictions, budgetMin, budgetMax, allergies, healthGoal, weight, activityLevel);
  };

  return (
    <div className="meal-plan-form">
      <div className="form-header">
        <div>
          <h2>Choose Your Meal Style</h2>
          <p className="form-subtitle">Pick a preset or customize your plan</p>
        </div>
        {lastSaved && (
          <div className="autosave-indicator">
            <span className="autosave-icon">💾</span>
            <span className="autosave-text">Draft saved</span>
            <button 
              type="button" 
              className="clear-draft-btn"
              onClick={clearSavedData}
              title="Clear saved draft"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      
      <div className="quick-start-presets">
        <p className="presets-label">🚀 Popular meal plans:</p>
        <div className="preset-grid">
          <button 
            type="button" 
            className="preset-card"
            onClick={() => {
              setPreferences('budget-friendly family meals with chicken, pasta, rice');
              setServings(4);
              setBudgetMin('80');
              setBudgetMax('120');
            }}
            disabled={loading}
          >
            <span className="preset-icon">👨‍👩‍👧‍👦</span>
            <h3>Budget Family</h3>
            <p>4 people · $80-120/week</p>
            <span className="preset-tag">Most Popular</span>
          </button>
          
          <button 
            type="button" 
            className="preset-card"
            onClick={() => {
              setPreferences('quick 30-minute healthy meals for busy professionals');
              setServings(2);
              setHealthGoal('maintain');
            }}
            disabled={loading}
          >
            <span className="preset-icon">⚡</span>
            <h3>Quick & Healthy</h3>
            <p>2 people · 30 min meals</p>
            <span className="preset-tag">Time Saver</span>
          </button>
          
          <button 
            type="button" 
            className="preset-card"
            onClick={() => {
              setPreferences('high protein low carb meals for fitness');
              setServings(1);
              setHealthGoal('lose');
              setActivityLevel('active');
            }}
            disabled={loading}
          >
            <span className="preset-icon">💪</span>
            <h3>Fitness Focus</h3>
            <p>1 person · High protein</p>
            <span className="preset-tag">Gym Ready</span>
          </button>
          
          <button 
            type="button" 
            className="preset-card"
            onClick={() => {
              setPreferences('healthy mediterranean diet with vegetables, fish, olive oil');
              setServings(2);
              setHealthGoal('maintain');
            }}
            disabled={loading}
          >
            <span className="preset-icon">🥗</span>
            <h3>Mediterranean</h3>
            <p>2 people · Heart healthy</p>
            <span className="preset-tag">Trending</span>
          </button>
        </div>
        
        <div className="preset-divider">
          <span>or customize below</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Essential Information */}
        <div className="form-section essential">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="servings">How many people?</label>
              <select
                id="servings"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                disabled={loading}
              >
                <option value={1}>1 person</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4 people</option>
                <option value={5}>5 people</option>
                <option value={6}>6 people</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferences">What do you like to eat?</label>
              <input
                type="text"
                id="preferences"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g., chicken, pasta, asian food..."
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="restrictions">Any dietary restrictions?</label>
              <input
                type="text"
                id="restrictions"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="e.g., vegetarian, gluten-free (leave blank if none)"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Any allergies?</label>
              <input
                type="text"
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g., nuts, shellfish (leave blank if none)"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          className="toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>{showAdvanced ? '🔽' : '🔼'} {showAdvanced ? 'Less' : 'More'} Options</span>
          <span className="optional-badge">{showAdvanced ? 'Hide' : 'Customize'}</span>
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <>
            <div className="form-section advanced">
              <h3 className="section-title">Health & Fitness Goals</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="healthGoal">Health Goal</label>
                  <select
                    id="healthGoal"
                    value={healthGoal}
                    onChange={(e) => setHealthGoal(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">General Health</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="maintenance">Weight Maintenance</option>
                    <option value="energy">Increase Energy</option>
                    <option value="heart-health">Heart Health</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="activityLevel">Activity Level</label>
                  <select
                    id="activityLevel"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    disabled={loading}
                  >
                    <option value="sedentary">Sedentary (little exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="very-active">Very Active (athlete)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight">
                    Current Weight (kg)
                    <span className="optional-hint"> • Optional</span>
                  </label>
                  <input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 70 kg (adults: 50-100 kg)"
                    min="20"
                    max="300"
                    step="0.5"
                    disabled={loading}
                  />
                  {errors.weight && <span className="error-hint">{errors.weight}</span>}
                </div>
              </div>
            </div>

            <div className="form-section advanced">
              <h3 className="section-title">Budget Range</h3>
              
              <div className="form-group">
                <label htmlFor="budgetMin">Weekly Grocery Budget (AUD)</label>
                <div className="budget-inputs">
                  <input
                    type="number"
                    id="budgetMin"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="Min"
                    min="0"
                    disabled={loading}
                  />
                  <span className="budget-divider">to</span>
                  <input
                    type="number"
                    id="budgetMax"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="Max"
                    min="0"
                    disabled={loading}
                  />
                </div>
                {errors.budget && <span className="error-hint">{errors.budget}</span>}
              </div>
            </div>
          </>
        )}

        <button type="submit" className="generate-btn" disabled={loading}>
          <span className="btn-icon">{loading ? '⏳' : '✨'}</span>
          <span className="btn-text">
            {loading ? 'Creating Your Perfect Week...' : 'Generate My Meal Plan'}
          </span>
          {!loading && <span className="btn-arrow">→</span>}
        </button>
      </form>
    </div>
  );
}

export default MealPlanForm;

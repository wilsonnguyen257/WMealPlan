import React, { useState } from 'react';
import './MealPlanForm.css';

function MealPlanForm({ onGenerate, loading }) {
  const [preferences, setPreferences] = useState('');
  const [servings, setServings] = useState(2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [healthGoal, setHealthGoal] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(preferences, servings, dietaryRestrictions, budgetMin, budgetMax, allergies, healthGoal, weight, activityLevel);
  };

  return (
    <div className="meal-plan-form">
      <h2>Create Your Weekly Meal Plan</h2>
      <p className="form-subtitle">Fill in the essentials, expand for more options</p>
      
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
          {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Options
          <span className="optional-badge">Optional</span>
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <>
            <div className="form-section advanced">
              <h3 className="section-title">🎯 Health & Fitness Goals</h3>
              
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
                  <label htmlFor="weight">Current Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 70"
                    min="0"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-section advanced">
              <h3 className="section-title">💰 Budget Range</h3>
              
              <div className="budget-inputs">
                <input
                  type="number"
                  id="budgetMin"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="Min (AUD)"
                  min="0"
                  disabled={loading}
                />
                <span className="budget-divider">to</span>
                <input
                  type="number"
                  id="budgetMax"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="Max (AUD)"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>
          </>
        )}

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? '🔄 Generating Your Plan...' : '✨ Generate Meal Plan'}
        </button>
      </form>
    </div>
  );
}

export default MealPlanForm;

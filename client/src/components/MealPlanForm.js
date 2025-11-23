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

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(preferences, servings, dietaryRestrictions, budgetMin, budgetMax, allergies, healthGoal, weight, activityLevel);
  };

  return (
    <div className="meal-plan-form">
      <h2>Create Your Weekly Meal Plan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">📋 Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="servings">Servings per Meal</label>
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
              <label htmlFor="activityLevel">Activity Level</label>
              <select
                id="activityLevel"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                disabled={loading}
              >
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very-active">Very Active (athlete)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">🎯 Health & Fitness</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">
                Current Weight (Optional)
                <span className="hint">Used for calorie calculations</span>
              </label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 70 kg"
                min="0"
                disabled={loading}
              />
            </div>

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
          </div>

          <div className="form-group">
            <label htmlFor="preferences">
              Meal Preferences
              <span className="hint">e.g., high protein, low carb, mediterranean</span>
            </label>
            <input
              type="text"
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Enter your meal preferences..."
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">⚠️ Dietary Restrictions & Allergies</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="restrictions">
                Dietary Restrictions
                <span className="hint">e.g., vegetarian, vegan, halal</span>
              </label>
              <input
                type="text"
                id="restrictions"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="e.g., gluten-free, dairy-free, keto"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="allergies">
                Food Allergies
                <span className="hint">Important for safety!</span>
              </label>
              <input
                type="text"
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g., nuts, shellfish, eggs"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">💰 Budget</h3>
          
          <div className="form-group">
            <label htmlFor="budgetMin">
              Weekly Grocery Budget (AUD)
              <span className="hint">Optional - set your budget range</span>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                id="budgetMin"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Min $"
                min="0"
                disabled={loading}
                style={{ flex: 1 }}
              />
              <span>to</span>
              <input
                type="number"
                id="budgetMax"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max $"
                min="0"
                disabled={loading}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? '🔄 Generating Your Personalized Plan...' : '✨ Generate My Meal Plan'}
        </button>
      </form>
    </div>
  );
}

export default MealPlanForm;

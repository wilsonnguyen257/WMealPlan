import React, { useState } from 'react';
import './MealPlanForm.css';

function MealPlanForm({ onGenerate, loading }) {
  const [preferences, setPreferences] = useState('');
  const [servings, setServings] = useState(2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(preferences, servings, dietaryRestrictions);
  };

  return (
    <div className="meal-plan-form">
      <h2>Create Your Weekly Meal Plan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="preferences">
            Meal Preferences
            <span className="hint">e.g., high protein, vegetarian, mediterranean</span>
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
            <label htmlFor="restrictions">Dietary Restrictions</label>
            <input
              type="text"
              id="restrictions"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="e.g., gluten-free, dairy-free"
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? 'Generating...' : '✨ Generate Weekly Meal Plan'}
        </button>
      </form>
    </div>
  );
}

export default MealPlanForm;

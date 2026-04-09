// src/components/PreferencesForm.tsx
import React from 'react';
import { Preferences } from '../types/mealPlan';
import './PreferencesForm.css';

interface PreferencesFormProps {
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  setPreferences,
  onSubmit,
  loading,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: name === 'days' || name === 'people' || name === 'budget' 
        ? parseInt(value) || 0 
        : value,
    }));
  };

  return (
    <section id="form-section" className="form-section">
      <div className="form-card">
        <h2 className="form-title">Your Preferences</h2>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="days">Number of Days</label>
              <select id="days" name="days" value={preferences.days} onChange={handleChange}>
                <option value={3}>3 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="people">Number of People</label>
              <input
                type="number"
                id="people"
                name="people"
                value={preferences.people}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal">Health Goal</label>
              <select id="goal" name="goal" value={preferences.goal} onChange={handleChange}>
                <option>Normal eating</option>
                <option>Weight loss</option>
                <option>Muscle gain</option>
                <option>Meat lover</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="budget">Budget (AUD)</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={preferences.budget}
                onChange={handleChange}
                min="10"
                step="10"
                placeholder="e.g., 200"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="diet">Dietary Preferences</label>
            <textarea
              id="diet"
              name="diet"
              value={preferences.diet}
              onChange={handleChange}
              placeholder="e.g., vegetarian, no seafood, gluten-free"
              rows={3}
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Meal Plan'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PreferencesForm;

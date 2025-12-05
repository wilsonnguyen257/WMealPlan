// src/App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';
import PreferencesForm from './components/PreferencesForm';
import Results from './components/Results';
import { Preferences, MealPlanResponse } from './types/mealPlan';
import { generateMealPlanWithGemini } from './api/gemini';

function App() {
  const [preferences, setPreferences] = useState<Preferences>({
    days: 7,
    people: 2,
    goal: 'Normal eating',
    diet: '',
    budget: 200,
  });
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [mealPlanKey, setMealPlanKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load shared meal plan from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shortCode = params.get('id');
    
    if (shortCode) {
      // Load from backend using short code
      fetch(`/api/share/${shortCode}`)
        .then(res => {
          if (!res.ok) throw new Error('Plan not found');
          return res.json();
        })
        .then(data => {
          setMealPlan(data.mealPlan);
          setPreferences(data.preferences);
        })
        .catch(err => {
          console.error('Failed to load shared plan:', err);
          setError('Shared meal plan not found or expired');
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const plan = await generateMealPlanWithGemini(preferences);
      setMealPlan(plan);
      setMealPlanKey(prev => prev + 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Meal Planner</h1>
      </header>
      
      <main className="container">
        <PreferencesForm
          preferences={preferences}
          setPreferences={setPreferences}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generating your meal plan...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {mealPlan && (
          <Results 
            key={mealPlanKey}
            mealPlan={mealPlan} 
            preferences={preferences}
          />
        )}
      </main>
    </div>
  );
}

export default App;

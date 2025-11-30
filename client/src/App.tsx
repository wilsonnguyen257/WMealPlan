// src/App.tsx
import React, { useState, useRef } from 'react';
import './App.css';
import Hero from './components/Hero';
import PreferencesForm from './components/PreferencesForm';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';
import { Preferences, MealPlanResponse } from './types/mealPlan';
import { generateMealPlanWithGemini } from './api/gemini';

function App() {
  const [preferences, setPreferences] = useState<Preferences>({
    days: 7,
    people: 1,
    goal: 'Normal eating',
    diet: '',
    budget: 'Medium',
  });
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef<HTMLElement>(null);

  const handleStartClick = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const plan = await generateMealPlanWithGemini(preferences);
      setMealPlan(plan);
    } catch (err) {
      setError('Failed to generate meal plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateDay = async (dayToRegenerate: string) => {
    // TODO: Implement logic to regenerate only a single day.
    // For now, it just shows an alert.
    alert(`Regenerate functionality for ${dayToRegenerate} is not yet implemented.`);
  };

  return (
    <div className="App">
      <Hero onStartClick={handleStartClick} />
      
      <main className="container" ref={formRef}>
        <PreferencesForm
          preferences={preferences}
          setPreferences={setPreferences}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {loading && <LoadingSpinner />}

        {error && <div className="error-message">{error}</div>}

        {mealPlan && (
          <Results mealPlan={mealPlan} onRegenerateDay={handleRegenerateDay} />
        )}
      </main>
    </div>
  );
}

export default App;

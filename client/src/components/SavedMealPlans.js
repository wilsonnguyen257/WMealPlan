import React, { useState, useEffect } from 'react';
import './SavedMealPlans.css';

function SavedMealPlans({ onLoadPlan }) {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/meal-plans');
      const data = await response.json();
      if (data.success) {
        setSavedPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching saved plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const handleLoad = async (id) => {
    try {
      const response = await fetch(`/api/meal-plans/${id}`);
      const data = await response.json();
      if (data.success) {
        onLoadPlan(data.data);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }
    
    try {
      await fetch(`/api/meal-plans/${id}`, { method: 'DELETE' });
      fetchSavedPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  return (
    <div className="saved-meal-plans">
      <h2>📚 Saved Meal Plans</h2>
      {loading && <p>Loading...</p>}
      {!loading && savedPlans.length === 0 && (
        <p className="no-plans">No saved meal plans yet. Generate one and save it!</p>
      )}
      {!loading && savedPlans.length > 0 && (
        <div className="plans-list">
          {savedPlans.map(plan => (
            <div key={plan.id} className="plan-card">
              <h3>{plan.name}</h3>
              <p className="plan-details">
                {plan.preferences && <span>🍽️ {plan.preferences}</span>}
                {plan.servings && <span>👥 {plan.servings} servings</span>}
              </p>
              <p className="plan-date">{new Date(plan.created_at).toLocaleDateString()}</p>
              <div className="plan-actions">
                <button onClick={() => handleLoad(plan.id)} className="load-btn">
                  Load
                </button>
                <button onClick={() => handleDelete(plan.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedMealPlans;

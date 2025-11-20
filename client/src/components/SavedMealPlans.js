import React, { useState, useEffect } from 'react';
import './SavedMealPlans.css';

function SavedMealPlans({ onLoadPlan, onClose }) {
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
    <div className="saved-meal-plans-modal" onClick={onClose}>
      <div className="saved-plans-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Saved Meal Plans</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        {loading && (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Loading saved plans...</p>
          </div>
        )}
        
        {!loading && savedPlans.length === 0 && (
          <div className="no-plans">
            <span className="empty-icon">📋</span>
            <p>No saved meal plans yet</p>
            <p className="empty-subtitle">Generate a meal plan and save it for later!</p>
          </div>
        )}
        
        {!loading && savedPlans.length > 0 && (
          <div className="plans-grid">
            {savedPlans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <span className="plan-date">
                    {new Date(plan.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="plan-details">
                  {plan.preferences && (
                    <span className="detail-tag">
                      <span className="tag-icon">🍽️</span>
                      {plan.preferences}
                    </span>
                  )}
                  {plan.servings && (
                    <span className="detail-tag">
                      <span className="tag-icon">👥</span>
                      {plan.servings} servings
                    </span>
                  )}
                  {plan.dietaryRestrictions && (
                    <span className="detail-tag">
                      <span className="tag-icon">⚕️</span>
                      {plan.dietaryRestrictions}
                    </span>
                  )}
                </div>
                <div className="plan-actions">
                  <button onClick={() => handleLoad(plan.id)} className="load-btn">
                    📂 Load Plan
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="delete-btn">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedMealPlans;

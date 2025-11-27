import React, { useState, useEffect } from 'react';
import './SavedMealPlans.css';
import ProgressBar from './ProgressBar';
import EmptyState from './EmptyState';

function SavedMealPlans({ onLoadPlan, onClose }) {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiet, setFilterDiet] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [progress, setProgress] = useState(0);

  const fetchSavedPlans = async () => {
    setLoading(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 200);
    
    try {
      const response = await fetch('/api/meal-plans');
      const data = await response.json();
      clearInterval(progressInterval);
      
      if (data.success) {
        setProgress(100);
        setTimeout(() => {
          setSavedPlans(data.data);
        }, 300);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error fetching saved plans:', error);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  // Get unique dietary restrictions from all plans
  const getDietaryOptions = () => {
    const diets = new Set();
    savedPlans.forEach(plan => {
      if (plan.dietaryRestrictions) {
        // Split multiple restrictions and add each one
        plan.dietaryRestrictions.split(',').forEach(diet => {
          diets.add(diet.trim());
        });
      }
    });
    return Array.from(diets).sort();
  };

  // Filter and sort plans
  const getFilteredPlans = () => {
    let filtered = [...savedPlans];

    // Filter by search term (name or preferences)
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.preferences && plan.preferences.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plan.dietaryRestrictions && plan.dietaryRestrictions.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by dietary restriction
    if (filterDiet !== 'all') {
      filtered = filtered.filter(plan => 
        plan.dietaryRestrictions && plan.dietaryRestrictions.includes(filterDiet)
      );
    }

    // Sort plans
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredPlans = getFilteredPlans();
  const dietaryOptions = getDietaryOptions();

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
          <h2>Saved Meal Plans</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        {!loading && savedPlans.length > 0 && (
          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name or preference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="diet-filter">Diet:</label>
                <select 
                  id="diet-filter"
                  value={filterDiet} 
                  onChange={(e) => setFilterDiet(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Diets</option>
                  {dietaryOptions.map(diet => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="sort-by">Sort:</label>
                <select 
                  id="sort-by"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterDiet !== 'all') && (
              <div className="active-filters">
                <span className="results-count">
                  {filteredPlans.length} of {savedPlans.length} plans
                </span>
                {(searchTerm || filterDiet !== 'all') && (
                  <button 
                    className="clear-all-filters"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterDiet('all');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {loading && (
          <ProgressBar 
            progress={progress} 
            message="Loading your saved plans..."
          />
        )}
        
        {!loading && savedPlans.length === 0 && (
          <EmptyState
            icon="saved-plans"
            title="No saved meal plans yet"
            message="Start by generating a personalized meal plan and save it for later!"
            tips={[
              'Try our Weekly Meal Planner with your preferences',
              'Each saved plan includes recipes and grocery lists',
              'Access your plans anytime from this page'
            ]}
            action={onClose}
            actionText="Create Your First Plan"
          />
        )}

        {!loading && savedPlans.length > 0 && filteredPlans.length === 0 && (
          <EmptyState
            icon="filter"
            title="No plans match your filters"
            message="Try adjusting your search terms or filters to find what you're looking for."
            tips={[
              'Check for typos in your search',
              'Try using different keywords',
              'Clear filters to see all plans'
            ]}
            action={() => {
              setSearchTerm('');
              setFilterDiet('all');
            }}
            actionText="Clear All Filters"
          />
        )}
        
        {!loading && filteredPlans.length > 0 && (
          <div className="plans-grid">
            {filteredPlans.map(plan => (
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
                      {plan.preferences}
                    </span>
                  )}
                  {plan.servings && (
                    <span className="detail-tag">
                      {plan.servings} servings
                    </span>
                  )}
                  {plan.dietaryRestrictions && (
                    <span className="detail-tag">
                      {plan.dietaryRestrictions}
                    </span>
                  )}
                </div>
                <div className="plan-actions">
                  <button onClick={() => handleLoad(plan.id)} className="load-btn">
                    Load Plan
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="delete-btn" title="Delete plan">
                    ×
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

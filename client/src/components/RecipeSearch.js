import React, { useState, useEffect, useRef } from 'react';
import './RecipeSearch.css';
import ProgressBar from './ProgressBar';
import EmptyState from './EmptyState';

const AUTOSAVE_KEY = 'recipeSearchFormData';
const AUTOSAVE_DELAY = 1000;

function RecipeSearch() {
  // Initialize from localStorage
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading saved form data:', error);
      return null;
    }
  };

  const savedData = getSavedData();

  const [searchQuery, setSearchQuery] = useState(savedData?.searchQuery || '');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [lastSaved, setLastSaved] = useState(savedData ? new Date(savedData.timestamp) : null);
  
  const saveTimeoutRef = useRef(null);

  // Autosave effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const formData = {
        searchQuery,
        timestamp: new Date().toISOString()
      };

      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Clear saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing saved data:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a recipe name or ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);
    setProgress(0);
    setProgressStage('Searching recipes...');
    clearSavedData(); // Clear autosaved data on search

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const newProgress = Math.min(prev + 20, 90);
        
        if (newProgress < 40) {
          setProgressStage('Searching recipes...');
        } else if (newProgress < 70) {
          setProgressStage('Analyzing matches...');
        } else {
          setProgressStage('Preparing results...');
        }
        
        return newProgress;
      });
    }, 400);

    try {
      const response = await fetch('/api/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success) {
        setProgress(100);
        setProgressStage('Complete!');
        setTimeout(() => {
          setRecipes(data.recipes);
          if (data.recipes.length === 0) {
            setError('No recipes found. Try a different search term.');
          }
        }, 300);
      } else {
        setError(data.message || 'Failed to search recipes');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('Error searching recipes. Please try again.');
      console.error('Search error:', err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const viewRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeDetails = () => {
    setSelectedRecipe(null);
  };

  // Handle ESC key to close recipe modal
  React.useEffect(() => {
    if (selectedRecipe) {
      const handleEscKey = (e) => {
        if (e.key === 'Escape') {
          closeRecipeDetails();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [selectedRecipe]);

  return (
    <div className="recipe-search">
      <div className="search-header">
        <div>
          <h2>Find Your Perfect Recipe</h2>
          <p className="search-subtitle">Search by recipe name, ingredient, or cuisine type</p>
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

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., chicken pasta, chocolate cake, thai curry..."
            disabled={loading}
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="search-error">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <ProgressBar 
          progress={progress} 
          message="Finding delicious recipes..."
          stage={progressStage}
        />
      )}

      {!loading && !error && recipes.length === 0 && !searchQuery && (
        <EmptyState
          icon="search"
          title="Discover Amazing Recipes"
          message="Search for recipes by name, ingredient, or cuisine type to get started."
          tips={[
            'Try searching for "chicken pasta" or "chocolate cake"',
            'Search by cuisine: "thai curry", "italian", "mexican"',
            'Find recipes by ingredient: "salmon", "tofu", "quinoa"'
          ]}
        />
      )}

      {!loading && recipes.length === 0 && searchQuery && !error && (
        <EmptyState
          icon="search"
          title="No recipes found"
          message={`We couldn't find any recipes matching "${searchQuery}". Try different keywords!`}
          tips={[
            'Check your spelling',
            'Try more general terms (e.g., "pasta" instead of specific dish)',
            'Search for main ingredients or cuisine types'
          ]}
          action={() => setSearchQuery('')}
          actionText="Clear Search"
        />
      )}

      {recipes.length > 0 && (
        <div className="recipes-grid">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <div className="recipe-card-header">
                <h3>{recipe.name}</h3>
                {recipe.cookTime && (
                  <span className="cook-time">{recipe.cookTime}</span>
                )}
              </div>
              
              {recipe.description && (
                <p className="recipe-description">{recipe.description}</p>
              )}

              <div className="recipe-tags">
                {recipe.cuisine && (
                  <span className="recipe-tag">{recipe.cuisine}</span>
                )}
                {recipe.difficulty && (
                  <span className="recipe-tag">{recipe.difficulty}</span>
                )}
                {recipe.servings && (
                  <span className="recipe-tag">{recipe.servings} servings</span>
                )}
              </div>

              <button 
                onClick={() => viewRecipeDetails(recipe)}
                className="view-recipe-btn"
              >
                View Recipe
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <div className="recipe-modal" onClick={closeRecipeDetails}>
          <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="recipe-modal-header">
              <h2>{selectedRecipe.name}</h2>
              <button className="close-btn" onClick={closeRecipeDetails}>×</button>
            </div>

            <div className="recipe-modal-body">
              {selectedRecipe.cookTime && (
                <div className="recipe-info-row">
                  <strong>Cook Time:</strong> {selectedRecipe.cookTime}
                </div>
              )}
              {selectedRecipe.servings && (
                <div className="recipe-info-row">
                  <strong>Servings:</strong> {selectedRecipe.servings}
                </div>
              )}
              {selectedRecipe.difficulty && (
                <div className="recipe-info-row">
                  <strong>Difficulty:</strong> {selectedRecipe.difficulty}
                </div>
              )}

              {selectedRecipe.ingredients && (
                <div className="recipe-section">
                  <h3>Ingredients</h3>
                  <ul className="ingredients-list">
                    {selectedRecipe.ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecipe.instructions && (
                <div className="recipe-section">
                  <h3>Instructions</h3>
                  <ol className="instructions-list">
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedRecipe.nutrition && (
                <div className="recipe-section">
                  <h3>Nutrition Information</h3>
                  <div className="nutrition-grid">
                    {Object.entries(selectedRecipe.nutrition).map(([key, value]) => (
                      <div key={key} className="nutrition-item">
                        <span className="nutrition-label">{key}:</span>
                        <span className="nutrition-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeSearch;

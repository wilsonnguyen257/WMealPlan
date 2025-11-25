import React, { useState } from 'react';
import './RecipeSearch.css';

function RecipeSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a recipe name or ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);

    try {
      const response = await fetch('/api/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();

      if (data.success) {
        setRecipes(data.recipes);
        if (data.recipes.length === 0) {
          setError('No recipes found. Try a different search term.');
        }
      } else {
        setError(data.message || 'Failed to search recipes');
      }
    } catch (err) {
      setError('Error searching recipes. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeDetails = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="recipe-search">
      <div className="search-header">
        <h2>Find Your Perfect Recipe</h2>
        <p className="search-subtitle">Search by recipe name, ingredient, or cuisine type</p>
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
        <div className="search-loading">
          <div className="spinner"></div>
          <p>Finding delicious recipes...</p>
        </div>
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

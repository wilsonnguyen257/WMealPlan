import React, { useState } from 'react';
import './PantryMeals.css';
import ProgressBar from './ProgressBar';
import EmptyState from './EmptyState';

function PantryMeals() {
  const [pantryItems, setPantryItems] = useState('');
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');

  const generateFromPantry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMeals(null);
    setProgress(0);
    setProgressStage('Analyzing your ingredients...');

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const newProgress = Math.min(prev + 12, 90);
        
        if (newProgress < 30) {
          setProgressStage('Analyzing your ingredients...');
        } else if (newProgress < 60) {
          setProgressStage('Finding recipe combinations...');
        } else {
          setProgressStage('Creating meal ideas...');
        }
        
        return newProgress;
      });
    }, 600);

    try {
      const response = await fetch('/api/generate-from-pantry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pantryItems,
          servings,
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success) {
        setProgress(100);
        setProgressStage('Complete!');
        setTimeout(() => {
          setMeals(data.data);
        }, 400);
      } else {
        setError(data.error || 'Failed to generate meals from pantry');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('Network error. Please try again.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="pantry-meals-section">
      <div className="pantry-header">
        <h2>Cook from Pantry</h2>
        <p>Enter what you have, get instant meal ideas</p>
      </div>

      <form onSubmit={generateFromPantry} className="pantry-form">
        <div className="form-group">
          <label htmlFor="pantryItems">
            What's in your kitchen?
            <span className="hint">List ingredients you have (e.g., chicken, rice, tomatoes, onions)</span>
          </label>
          <textarea
            id="pantryItems"
            value={pantryItems}
            onChange={(e) => setPantryItems(e.target.value)}
            placeholder="chicken breast, rice, tomatoes, garlic, olive oil, eggs..."
            rows="4"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pantryServings">Servings</label>
          <select
            id="pantryServings"
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

        <button type="submit" className="pantry-generate-btn" disabled={loading}>
          {loading ? 'Finding Recipes...' : 'Generate Meal Ideas'}
        </button>
      </form>

      {error && (
        <div className="pantry-error">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <ProgressBar 
          progress={progress} 
          message="Creating meal ideas from your ingredients..."
          stage={progressStage}
        />
      )}

      {!loading && !error && !meals && (
        <EmptyState
          icon="pantry"
          title="Turn Ingredients into Meals"
          message="Enter what you have in your kitchen, and we'll create delicious meal ideas for you."
          tips={[
            'List at least 3-4 ingredients for best results',
            'Include proteins, vegetables, and pantry staples',
            'Be specific: "chicken breast" vs just "chicken"'
          ]}
        />
      )}
      )}

      {meals && (
        <div className="pantry-results">
          <h3>Your Meal Ideas ({meals.recipes.length} recipes)</h3>
          
          <div className="recipe-cards-grid">
            {meals.recipes.map((recipe, index) => (
              <div 
                key={index} 
                className="pantry-recipe-card"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <h4>{recipe.name}</h4>
                <div className="recipe-meta">
                  <span>⏱️ {recipe.prepTime + recipe.cookTime}</span>
                  <span>🍽️ {recipe.servings} servings</span>
                </div>
                <div className="match-indicator">
                  {recipe.missingIngredients?.length > 0 ? (
                    <span className="missing-items">
                      Missing {recipe.missingIngredients.length} item(s)
                    </span>
                  ) : (
                    <span className="perfect-match">✓ Perfect match!</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {meals.shoppingList && meals.shoppingList.length > 0 && (
            <div className="missing-items-section">
              <h4>Additional Items Needed</h4>
              <ul>
                {meals.shoppingList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedRecipe && (
        <div className="recipe-modal" onClick={() => setSelectedRecipe(null)}>
          <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedRecipe(null)}>×</button>
            
            <h2>{selectedRecipe.name}</h2>
            
            <div className="recipe-info">
              <span><strong>Prep:</strong> {selectedRecipe.prepTime}</span>
              <span><strong>Cook:</strong> {selectedRecipe.cookTime}</span>
              <span><strong>Servings:</strong> {selectedRecipe.servings}</span>
            </div>

            <div className="recipe-section">
              <h3>Ingredients</h3>
              <ul>
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>

            {selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0 && (
              <div className="recipe-section missing-alert">
                <h3>Missing Ingredients</h3>
                <ul>
                  {selectedRecipe.missingIngredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="recipe-section">
              <h3>Instructions</h3>
              <ol>
                {selectedRecipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {selectedRecipe.tips && (
              <div className="recipe-section tips">
                <h3>Tips</h3>
                <p>{selectedRecipe.tips}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PantryMeals;

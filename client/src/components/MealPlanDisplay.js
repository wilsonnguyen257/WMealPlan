import React, { useState } from 'react';
import './MealPlanDisplay.css';

function MealPlanDisplay({ mealPlan, recipes }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  const findRecipe = (mealName) => {
    return recipes.find(recipe => 
      recipe.name.toLowerCase() === mealName.toLowerCase()
    );
  };

  const handleMealClick = (mealName) => {
    const recipe = findRecipe(mealName);
    if (recipe) {
      setSelectedRecipe(recipe);
    }
  };

  const generateShareText = () => {
    let text = "Check out my 7-Day Meal Plan! 🍽️\n\n";
    days.forEach(day => {
      text += `${day}:\n`;
      mealTypes.forEach(mealType => {
        const capitalizedMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1);
        text += `  ${capitalizedMeal}: ${mealPlan[day][mealType]}\n`;
      });
      text += '\n';
    });
    return text;
  };

  const handleCopyLink = async () => {
    try {
      const shareText = generateShareText();
      await navigator.clipboard.writeText(shareText);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent("Just created my personalized 7-day meal plan! 🍽️✨");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("My 7-Day Meal Plan");
    const body = encodeURIComponent(generateShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="meal-plan-display">
      <div className="plan-header">
        <h2>Your 7-Day Meal Plan</h2>
        <div className="share-buttons">
          <button className="share-btn copy-btn" onClick={handleCopyLink} title="Copy meal plan to clipboard">
            <span className="share-icon">📋</span>
            <span className="share-label">Copy</span>
          </button>
          <button className="share-btn twitter-btn" onClick={handleShareTwitter} title="Share on Twitter">
            <span className="share-icon">𝕏</span>
            <span className="share-label">Twitter</span>
          </button>
          <button className="share-btn facebook-btn" onClick={handleShareFacebook} title="Share on Facebook">
            <span className="share-icon">f</span>
            <span className="share-label">Facebook</span>
          </button>
          <button className="share-btn whatsapp-btn" onClick={handleShareWhatsApp} title="Share on WhatsApp">
            <span className="share-icon">📱</span>
            <span className="share-label">WhatsApp</span>
          </button>
          <button className="share-btn email-btn" onClick={handleShareEmail} title="Share via Email">
            <span className="share-icon">✉️</span>
            <span className="share-label">Email</span>
          </button>
        </div>
      </div>

      {showShareToast && (
        <div className="share-toast">
          ✓ Meal plan copied to clipboard!
        </div>
      )}
      
      <div className="meal-grid">
        {days.map(day => (
          <div key={day} className="day-card">
            <h3>{day}</h3>
            {mealTypes.map(mealType => (
              <div key={mealType} className="meal-item">
                <span className="meal-type">{mealType}</span>
                <span 
                  className="meal-name"
                  onClick={() => handleMealClick(mealPlan[day][mealType])}
                >
                  {mealPlan[day][mealType]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedRecipe && (
        <div className="recipe-modal" onClick={() => setSelectedRecipe(null)}>
          <div className="recipe-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="recipe-modal-header">
              <div className="recipe-header-content">
                <h2>{selectedRecipe.name}</h2>
                <div className="recipe-meta">
                  <span>🍽️ {selectedRecipe.servings} servings</span>
                  <span>⏱️ Prep: {selectedRecipe.prepTime}</span>
                  <span>🔥 Cook: {selectedRecipe.cookTime}</span>
                </div>
              </div>
              <button 
                className="close-btn" 
                onClick={() => setSelectedRecipe(null)}
                aria-label="Close recipe details"
              >
                ×
              </button>
            </div>
            
            <div className="recipe-modal-body">
              <div className="recipe-section">
                <h3>Ingredients</h3>
                <ul>
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="recipe-section">
                <h3>Instructions</h3>
                <ol>
                  {selectedRecipe.instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.storageInstructions && (
                <div className="recipe-section storage">
                  <h3>Storage & Reheating</h3>
                  <p>{selectedRecipe.storageInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="recipes-section">
        <h2>All Recipes</h2>
        <div className="recipes-list">
          {recipes.map((recipe, idx) => (
            <div className="recipe-card" onClick={() => setSelectedRecipe(recipe)}>
              <h4>{recipe.name}</h4>
              <div className="recipe-quick-info">
                <span>{recipe.servings} servings</span>
                <span>{recipe.prepTime}</span>
                <span>{recipe.cookTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MealPlanDisplay;

// src/components/Results.tsx
import React, { useState, useEffect } from 'react';
import { MealPlanResponse, Preferences } from '../types/mealPlan';
import MealPlanView from './MealPlanView';
import ShoppingListView from './ShoppingListView';
import { exportToPDF } from '../utils/pdfExport';
import { estimatePrices } from '../api/gemini';
import './Results.css';

interface ResultsProps {
  mealPlan: MealPlanResponse;
  preferences?: Preferences;
}

type View = 'plan' | 'shopping' | 'prices';

const Results: React.FC<ResultsProps> = ({ mealPlan: initialMealPlan, preferences }) => {
  const [activeView, setActiveView] = useState<View>('plan');
  const [mealPlan, setMealPlan] = useState<MealPlanResponse>(initialMealPlan);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Reset state when a new meal plan is passed in (new customer/visitor)
  useEffect(() => {
    setMealPlan(initialMealPlan);
    setActiveView('plan');
    setPriceError(null);
    setPriceLoading(false);
    setCopySuccess(false);
  }, [initialMealPlan]);

  const handleShareLink = async () => {
    try {
      const data = {
        mealPlan,
        preferences
      };
      
      // Call backend to save and get short code
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }
      
      const { shortCode } = await response.json();
      const url = `${window.location.origin}?id=${shortCode}`;
      
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleExportPDF = () => {
    if (preferences) {
      exportToPDF(mealPlan, preferences);
    }
  };

  const handleCalculatePrices = async () => {
    setPriceLoading(true);
    setPriceError(null);

    try {
      // Collect all ingredients from the meal plan
      const allIngredients: string[] = [];
      mealPlan.days.forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          const meal = day.meals[mealType as keyof typeof day.meals];
          meal.ingredients.forEach(ing => {
            allIngredients.push(`${ing.amount} ${ing.item}`);
          });
        });
      });

      // Remove duplicates
      const uniqueIngredients = Array.from(new Set(allIngredients));
      
      const { estimates, total } = await estimatePrices(uniqueIngredients);
      
      // Update meal plan with prices
      setMealPlan({
        ...mealPlan,
        estimatedCost: total,
        priceBreakdown: estimates
      });
    } catch (error) {
      console.error('Price calculation failed:', error);
      setPriceError(error instanceof Error ? error.message : 'Failed to calculate prices');
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <section className="results-section">
      <div className="results-header">
        <div className="tabs">
          <button
            className={`tab-btn ${activeView === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveView('plan')}
          >
            Meal Plan
          </button>
          <button
            className={`tab-btn ${activeView === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveView('shopping')}
          >
            Shopping List
          </button>
          <button
            className={`tab-btn ${activeView === 'prices' ? 'active' : ''}`}
            onClick={() => setActiveView('prices')}
          >
            Prices
          </button>
        </div>
        <div className="action-buttons">
          <button className="share-btn" onClick={handleShareLink}>
            {copySuccess ? 'Link Copied!' : 'Share Link'}
          </button>
          <button className="export-btn" onClick={handleExportPDF}>
            Download PDF
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeView === 'plan' ? (
          <MealPlanView days={mealPlan.days} servings={preferences?.people || 2} />
        ) : activeView === 'shopping' ? (
          <ShoppingListView 
            mealPlan={mealPlan} 
            servings={preferences?.people || 2}
            days={preferences?.days || 7}
          />
        ) : (
          <div className="price-view">
            {priceLoading ? (
              <div className="price-loading">
                <div className="loading-spinner"></div>
                <p>Calculating prices from Australian supermarkets...</p>
                <p className="loading-note">Checking Coles, Woolworths & Aldi prices</p>
              </div>
            ) : mealPlan.estimatedCost !== undefined && mealPlan.priceBreakdown ? (
              <>
                <div className="total-cost">
                  <h3>Total Estimated Cost</h3>
                  <div className="cost-amount">${mealPlan.estimatedCost.toFixed(2)} AUD</div>
                  {preferences?.budget && (
                    <p className="budget-info">
                      Budget: ${preferences.budget} AUD
                      {mealPlan.estimatedCost <= preferences.budget ? (
                        <span className="within-budget"> ✓ Within budget</span>
                      ) : (
                        <span className="over-budget"> ⚠ Over budget by ${(mealPlan.estimatedCost - preferences.budget).toFixed(2)}</span>
                      )}
                    </p>
                  )}
                </div>
                
                <div className="price-breakdown">
                  <h4>Itemized Breakdown</h4>
                  <div className="price-list">
                    {mealPlan.priceBreakdown.map((item, idx) => (
                      <div key={idx} className="price-item">
                        <div className="item-details">
                          <span className="item-name">{item.item}</span>
                          <span className="item-qty">{item.quantity}</span>
                        </div>
                        <span className="item-price">${item.estimatedPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="recalculate-btn"
                  onClick={handleCalculatePrices}
                >
                  Recalculate Prices
                </button>
              </>
            ) : (
              <div className="price-prompt">
                <h3>Calculate Price Estimate</h3>
                <p>Get estimated prices for all ingredients based on current Australian supermarket prices.</p>
                {priceError && (
                  <p className="price-error-msg">{priceError}</p>
                )}
                <button 
                  className="calculate-btn"
                  onClick={handleCalculatePrices}
                  disabled={priceLoading}
                >
                  Calculate Prices
                </button>
                <p className="price-note">Prices based on Coles, Woolworths & Aldi</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Results;

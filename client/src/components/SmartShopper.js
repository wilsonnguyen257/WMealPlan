import React, { useState } from 'react';
import './SmartShopper.css';

function SmartShopper({ groceryList }) {
  const [estimates, setEstimates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEstimatePrices = async () => {
    setLoading(true);
    setError(null);
    setEstimates(null);

    try {
      const response = await fetch('/api/estimate-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groceryList }),
      });

      const data = await response.json();

      if (data.success) {
        setEstimates(data.data);
      } else {
        setError(data.error || 'Failed to get price estimates.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-shopper">
      <h2>Smart Shopper</h2>
      <p>Get AI-powered price estimates for your grocery list from Coles, Woolworths, and Aldi.</p>
      
      <button onClick={handleEstimatePrices} disabled={loading} className="estimate-btn">
        {loading ? 'Estimating...' : 'Estimate Prices'}
      </button>

      {error && <div className="shopper-error">{error}</div>}

      {loading && (
        <div className="shopper-loading">
          <div className="spinner"></div>
          <p>Analyzing prices...</p>
        </div>
      )}

      {estimates && (
        <div className="estimates-result">
          <h3>Price Estimates</h3>
          
          {estimates.totalEstimatedCost !== undefined && (
            <div className="total-cost">
              <strong>Total Estimated Cost:</strong> A${typeof estimates.totalEstimatedCost === 'number' 
                ? estimates.totalEstimatedCost.toFixed(2) 
                : estimates.totalEstimatedCost}
            </div>
          )}
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Est. Price</th>
                <th>Cheapest Store</th>
              </tr>
            </thead>
            <tbody>
              {estimates.priceEstimates && estimates.priceEstimates.map((item, index) => (
                <tr key={index}>
                  <td>{item.item}</td>
                  <td>A${typeof item.estimatedPrice === 'number' 
                    ? item.estimatedPrice.toFixed(2) 
                    : item.estimatedPrice}</td>
                  <td>{item.suggestedStore}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {estimates.shoppingTips && (
            <div className="shopping-tips">
              <h4>Shopping Tips</h4>
              <p>{estimates.shoppingTips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartShopper;

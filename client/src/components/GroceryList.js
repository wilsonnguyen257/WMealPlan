import React, { useState } from 'react';
import './GroceryList.css';

function GroceryList({ groceryList }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      produce: '🥬',
      proteins: '🥩',
      dairy: '🥛',
      pantry: '🥫',
      other: '🛒'
    };
    return icons[category] || '📦';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grocery-list">
      <div className="grocery-header">
        <h2>Grocery List</h2>
        <button onClick={handlePrint} className="print-btn">
          Print
        </button>
      </div>

      {Object.entries(groceryList).map(([category, items]) => (
        items && items.length > 0 && (
          <div key={category} className="grocery-category">
            <h3>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <ul>
              {items.map((item, index) => (
                <li key={index} className={checkedItems[`${category}-${index}`] ? 'checked' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checkedItems[`${category}-${index}`] || false}
                      onChange={() => toggleItem(category, index)}
                    />
                    <span>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
}

export default GroceryList;

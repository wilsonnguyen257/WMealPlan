// src/components/ShoppingListView.tsx
import React, { useMemo } from 'react';
import { MealPlanResponse, MealIngredient } from '../types/mealPlan';
import './ShoppingListView.css';

interface ShoppingListViewProps {
  mealPlan: MealPlanResponse;
  servings: number;
  days: number;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ mealPlan, servings, days }) => {
  const shoppingList = useMemo(() => {
    const allIngredients: MealIngredient[] = [];
    mealPlan.days.forEach((day) => {
      Object.values(day.meals).forEach((meal) => {
        allIngredients.push(...meal.ingredients);
      });
    });

    // Group by item and show combined amount
    const grouped = allIngredients.reduce((acc, ingredient) => {
      const key = ingredient.item.toLowerCase();
      if (!acc[key]) {
        acc[key] = { 
          item: ingredient.item, 
          amounts: [ingredient.amount]
        };
      } else if (!acc[key].amounts.includes(ingredient.amount)) {
        acc[key].amounts.push(ingredient.amount);
      }
      return acc;
    }, {} as Record<string, { item: string; amounts: string[] }>);

    return Object.values(grouped).map(({ item, amounts }) => ({
      item,
      amount: amounts.join(' + ')
    }));
  }, [mealPlan]);

  return (
    <div className="shopping-list-view">
      <h3 className="shopping-list-title">Shopping List</h3>
      <div className="shopping-info">
        <span className="info-badge">{days} days</span>
        <span className="info-badge">{servings} {servings === 1 ? 'person' : 'people'}</span>
      </div>
      <p className="shopping-note">Store-ready quantities for your entire meal plan</p>
      
      <ul className="shopping-list">
        {shoppingList.map(({ item, amount }) => (
          <li key={item} className="shopping-list-item">
            <span className="item-name">{item}</span>
            <span className="item-amount">{amount}</span>
          </li>
        ))}
      </ul>

      {mealPlan.pantryItems && mealPlan.pantryItems.length > 0 && (
        <div className="pantry-section">
          <h4 className="pantry-title">Pantry Items (check if you have)</h4>
          <ul className="pantry-list">
            {mealPlan.pantryItems.map((item, index) => (
              <li key={index} className="pantry-item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShoppingListView;

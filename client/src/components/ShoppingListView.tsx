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
          amount: ingredient.amount
        };
      } else {
        // For duplicate items, append amount (AI should handle totaling)
        acc[key].amount = ingredient.amount; // Use last occurrence (AI provides totals)
      }
      return acc;
    }, {} as Record<string, { item: string; amount: string }>);

    return Object.values(grouped);
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
    </div>
  );
};

export default ShoppingListView;

// src/components/ShoppingListView.tsx
import React, { useMemo } from 'react';
import { MealPlanResponse, MealIngredient } from '../types/mealPlan';
import './ShoppingListView.css';

interface ShoppingListViewProps {
  mealPlan: MealPlanResponse;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ mealPlan }) => {
  const shoppingList = useMemo(() => {
    const allIngredients: MealIngredient[] = [];
    mealPlan.days.forEach((day) => {
      Object.values(day.meals).forEach((meal) => {
        allIngredients.push(...meal.ingredients);
      });
    });

    // Group ingredients by item name
    const grouped = allIngredients.reduce((acc, ingredient) => {
      const key = ingredient.item.toLowerCase();
      if (!acc[key]) {
        acc[key] = { item: ingredient.item, amounts: [] };
      }
      acc[key].amounts.push(ingredient.amount);
      return acc;
    }, {} as Record<string, { item: string; amounts: string[] }>);

    return Object.values(grouped);
  }, [mealPlan]);

  return (
    <div className="shopping-list-view">
      <h3 className="shopping-list-title">Shopping List</h3>
      <ul className="shopping-list">
        {shoppingList.map(({ item, amounts }) => (
          <li key={item} className="shopping-list-item">
            <span className="item-name">{item}</span>
            <span className="item-amount">{amounts.join(', ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingListView;

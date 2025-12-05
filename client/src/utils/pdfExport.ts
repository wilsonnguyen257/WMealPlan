// src/utils/pdfExport.ts
import jsPDF from 'jspdf';
import { MealPlanResponse } from '../types/mealPlan';

// Helper to clean text for PDF (remove special chars that cause encoding issues)
const cleanText = (text: string): string => {
  return text
    .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII chars
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .trim();
};

export const exportToPDF = (mealPlan: MealPlanResponse, preferences: any) => {
  const doc = new jsPDF();
  let y = 20;
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Meal Plan', 105, y, { align: 'center' });
  y += 15;
  
  // Preferences summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${preferences.days} days | ${preferences.people} people | Budget: $${preferences.budget} AUD`, 105, y, { align: 'center' });
  y += 10;
  
  // Meal Plan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Weekly Meal Plan', 20, y);
  y += 8;
  
  doc.setFontSize(9);
  mealPlan.days.forEach(day => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(day.day, 20, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Breakfast: ${day.meals.breakfast.name}`, 25, y);
    y += 5;
    doc.text(`Lunch: ${day.meals.lunch.name}`, 25, y);
    y += 5;
    doc.text(`Dinner: ${day.meals.dinner.name}`, 25, y);
    y += 8;
  });

  // Detailed Recipes
  doc.addPage();
  y = 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Recipes', 20, y);
  y += 12;

  mealPlan.days.forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = day.meals[mealType as keyof typeof day.meals];
      
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Recipe title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${day.day} - ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`, 20, y);
      y += 6;
      
      doc.setFontSize(11);
      doc.text(cleanText(meal.name), 20, y);
      y += 6;

      // Recipe stats
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Prep: ${meal.prepTime} | Cook: ${meal.cookTime} | ${meal.difficulty}`, 20, y);
      y += 6;

      // Ingredients
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Ingredients:', 20, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      meal.ingredients.forEach(ing => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`- ${cleanText(ing.amount)} ${cleanText(ing.item)}`, 25, y);
        y += 4;
      });
      y += 2;

      // Instructions
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 20, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      const instructions = cleanText(meal.instructions);
      const steps = instructions.split(/\d+\./).filter(s => s.trim());
      
      steps.forEach((step, idx) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        
        const stepText = `${idx + 1}. ${step.trim()}`;
        const lines = doc.splitTextToSize(stepText, 170);
        
        lines.forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 25, y);
          y += 4;
        });
        y += 2;
      });
      
      y += 8; // Space between recipes
    });
  });
  
  // Shopping List
  doc.addPage();
  y = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Shopping List', 20, y);
  y += 10;
  
  // Collect all unique ingredients
  const ingredientsSet = new Set<string>();
  mealPlan.days.forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = day.meals[mealType as keyof typeof day.meals];
      meal.ingredients.forEach(ing => {
        ingredientsSet.add(`${ing.amount} ${ing.item}`);
      });
    });
  });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const ingredients = Array.from(ingredientsSet).sort();
  ingredients.forEach(item => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    // Use simple bullet instead of checkbox emoji (causes encoding issues)
    doc.text(`- ${cleanText(item)}`, 25, y);
    y += 6;
  });
  
  // Price Estimate
  if (mealPlan.estimatedCost) {
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Price Estimate', 20, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text(`Total: $${mealPlan.estimatedCost.toFixed(2)} AUD`, 20, y);
    y += 8;
    
    if (mealPlan.priceBreakdown) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      mealPlan.priceBreakdown.forEach(item => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${item.item} (${item.quantity})`, 25, y);
        doc.text(`$${item.estimatedPrice.toFixed(2)}`, 180, y, { align: 'right' });
        y += 6;
      });
    }
  }
  
  // Save the PDF
  doc.save('meal-plan.pdf');
};

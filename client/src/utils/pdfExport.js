import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export complete meal plan as PDF
export const exportMealPlanToPDF = (mealPlan, recipes, groceryList, prepInstructions, formData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(76, 175, 80);
  doc.text('WMealPlan - Weekly Meal Plan', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  if (formData?.servings) {
    doc.text(`Servings: ${formData.servings} | Preferences: ${formData.preferences || 'None'}`, pageWidth / 2, yPos, { align: 'center' });
  }

  yPos += 15;

  // Weekly Meal Plan Table
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('7-Day Meal Plan', 14, yPos);
  yPos += 5;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const mealPlanData = days.map(day => [
    day,
    mealPlan[day]?.breakfast || '',
    mealPlan[day]?.lunch || '',
    mealPlan[day]?.dinner || ''
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Day', 'Breakfast', 'Lunch', 'Dinner']],
    body: mealPlanData,
    theme: 'striped',
    headStyles: { fillColor: [76, 175, 80], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 50 }
    }
  });

  // New page for recipes
  doc.addPage();
  yPos = 20;
  doc.setFontSize(18);
  doc.text('Recipes', 14, yPos);
  yPos += 10;

  recipes.forEach((recipe, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(76, 175, 80);
    doc.text(`${index + 1}. ${recipe.name}`, 14, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Servings: ${recipe.servings} | Prep: ${recipe.prepTime} | Cook: ${recipe.cookTime}`, 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Ingredients:', 14, yPos);
    yPos += 5;

    doc.setFont(undefined, 'normal');
    recipe.ingredients.forEach(ingredient => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${ingredient}`, 18, yPos);
      yPos += 5;
    });

    yPos += 3;
    doc.setFont(undefined, 'bold');
    doc.text('Instructions:', 14, yPos);
    yPos += 5;

    doc.setFont(undefined, 'normal');
    recipe.instructions.forEach((instruction, idx) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`${idx + 1}. ${instruction}`, 180);
      doc.text(lines, 18, yPos);
      yPos += lines.length * 5;
    });

    yPos += 5;
  });

  // New page for grocery list
  doc.addPage();
  yPos = 20;
  doc.setFontSize(18);
  doc.text('Grocery List', 14, yPos);
  yPos += 10;

  Object.entries(groceryList).forEach(([category, items]) => {
    if (items && items.length > 0) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(76, 175, 80);
      doc.setFont(undefined, 'bold');
      doc.text(category.charAt(0).toUpperCase() + category.slice(1), 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      items.forEach(item => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`☐ ${item}`, 18, yPos);
        yPos += 5;
      });
      yPos += 3;
    }
  });

  // Save the PDF
  const filename = `WMealPlan_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Export grocery list only as PDF
export const exportGroceryListToPDF = (groceryList) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(76, 175, 80);
  doc.text('Grocery Shopping List', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  Object.entries(groceryList).forEach(([category, items]) => {
    if (items && items.length > 0) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(76, 175, 80);
      doc.setFont(undefined, 'bold');
      doc.text(category.charAt(0).toUpperCase() + category.slice(1), 14, yPos);
      yPos += 7;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      items.forEach(item => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`☐ ${item}`, 18, yPos);
        yPos += 6;
      });
      yPos += 5;
    }
  });

  // Save the PDF
  const filename = `GroceryList_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

import React, { useState, useEffect } from 'react';
import type { DailyLog, NutritionLog } from '../types';

interface NutritionLoggerProps {
  selectedDateLog: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
  goBack: () => void;
}

const NutritionLogger: React.FC<NutritionLoggerProps> = ({ selectedDateLog, onUpdateLog, goBack }) => {
  const [nutrition, setNutrition] = useState<NutritionLog>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    sugar: 0,
  });

  useEffect(() => {
    if (selectedDateLog.nutrition) {
      setNutrition(selectedDateLog.nutrition);
    } else {
      setNutrition({ calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0 });
    }
  }, [selectedDateLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNutrition(prev => ({ ...prev, [name]: value === '' ? 0 : parseInt(value, 10) }));
  };

  const handleSave = () => {
    onUpdateLog({ ...selectedDateLog, nutrition });
    goBack();
  };
  
  const StatCard: React.FC<{label: string; value: number; unit: string;}> = ({label, value, unit}) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-lg flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-primary dark:text-dark-primary">{value}</span>
        <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{label} ({unit})</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-base dark:text-dark-text-base">Nutrition Log</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Calories" value={nutrition.calories} unit="kcal" />
        <StatCard label="Protein" value={nutrition.protein} unit="g" />
        <StatCard label="Carbs" value={nutrition.carbs} unit="g" />
        <StatCard label="Fats" value={nutrition.fats} unit="g" />
        <StatCard label="Sugar" value={nutrition.sugar} unit="g" />
      </div>

      <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-text-base dark:text-dark-text-base">Log Intake</h3>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Calories (kcal)</label>
          <input type="number" name="calories" value={nutrition.calories || ''} onChange={handleChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Protein (g)</label>
          <input type="number" name="protein" value={nutrition.protein || ''} onChange={handleChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Carbohydrates (g)</label>
          <input type="number" name="carbs" value={nutrition.carbs || ''} onChange={handleChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Fats (g)</label>
          <input type="number" name="fats" value={nutrition.fats || ''} onChange={handleChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary" />
        </div>
         <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Sugar (g)</label>
          <input type="number" name="sugar" value={nutrition.sugar || ''} onChange={handleChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary" />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-bold py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Save Nutrition
        </button>
      </div>
    </div>
  );
};

export default NutritionLogger;
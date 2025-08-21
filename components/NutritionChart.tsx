import React, { useState, useMemo } from 'react';
import type { DailyLog, NutritionLog } from '../types';

interface NutritionChartProps {
  logs: DailyLog[];
}

const NutritionChart: React.FC<NutritionChartProps> = ({ logs }) => {
    const [period, setPeriod] = useState<'week' | 'month'>('week');

    const data = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysToFilter = period === 'week' ? 7 : 30;

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (daysToFilter - 1));

        const relevantLogs = logs.filter(log => {
            if (!log.nutrition) return false;
            const logDate = new Date(log.date + 'T00:00:00');
            return logDate >= startDate && logDate <= today;
        });

        if (relevantLogs.length === 0) {
            return null;
        }

        const totals: NutritionLog = relevantLogs.reduce((acc, log) => {
            if (log.nutrition) {
                acc.calories += log.nutrition.calories;
                acc.protein += log.nutrition.protein;
                acc.carbs += log.nutrition.carbs;
                acc.fats += log.nutrition.fats;
                acc.sugar += log.nutrition.sugar;
            }
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0 });

        const logCount = relevantLogs.length;
        return {
            calories: Math.round(totals.calories / logCount),
            protein: Math.round(totals.protein / logCount),
            carbs: Math.round(totals.carbs / logCount),
            fats: Math.round(totals.fats / logCount),
            sugar: Math.round(totals.sugar / logCount),
        };
    }, [logs, period]);
    
    const Bar: React.FC<{ label: string; value: number; unit: string; color: string; maxValue: number; }> = ({ label, value, unit, color, maxValue }) => {
        const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
            <div className="flex flex-col items-center flex-1">
                <div className="w-full h-40 bg-dark-card rounded-t-md flex items-end">
                    <div style={{ height: `${heightPercentage}%`, backgroundColor: color }} className="w-full rounded-t-md transition-all duration-500 ease-out"></div>
                </div>
                <p className="mt-2 text-sm font-bold text-white">{value.toLocaleString()}{unit}</p>
                <p className="text-xs text-dark-text-secondary">{label}</p>
            </div>
        );
    };

    const maxMacros = data ? Math.max(data.protein, data.carbs, data.fats, data.sugar, 1) * 1.2 : 1;
    const maxCalories = data ? data.calories * 1.2 : 1;

    return (
        <div className="bg-dark-surface p-4 rounded-lg h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-white">Nutrition Averages</h3>
                <div className="flex gap-1 bg-dark-card p-1 rounded-md">
                    <button onClick={() => setPeriod('week')} className={`px-3 py-1 text-xs rounded transition-colors ${period === 'week' ? 'bg-brand-secondary text-white' : 'text-dark-text-secondary'}`}>Week</button>
                    <button onClick={() => setPeriod('month')} className={`px-3 py-1 text-xs rounded transition-colors ${period === 'month' ? 'bg-brand-secondary text-white' : 'text-dark-text-secondary'}`}>Month</button>
                </div>
            </div>

            {data ? (
                <div className="flex gap-3 justify-around items-end pt-4">
                    <Bar label="Calories" value={data.calories} unit="k" color="#00F5D4" maxValue={maxCalories} />
                    <Bar label="Protein" value={data.protein} unit="g" color="#9B5DE5" maxValue={maxMacros} />
                    <Bar label="Carbs" value={data.carbs} unit="g" color="#F15BB5" maxValue={maxMacros} />
                    <Bar label="Fats" value={data.fats} unit="g" color="#FEE440" maxValue={maxMacros} />
                    <Bar label="Sugar" value={data.sugar} unit="g" color="#00BBF9" maxValue={maxMacros} />
                </div>
            ) : (
                <div className="h-56 flex items-center justify-center text-center">
                    <p className="text-dark-text-secondary text-sm">No nutrition data available for the<br/>selected period.</p>
                </div>
            )}
        </div>
    );
};

export default NutritionChart;

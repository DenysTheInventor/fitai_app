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

        const logCount = relevantLogs.length;

        if (logCount === 0) {
            return { averages: null, logCount: 0 };
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

        const averages = {
            calories: Math.round(totals.calories / logCount),
            protein: Math.round(totals.protein / logCount),
            carbs: Math.round(totals.carbs / logCount),
            fats: Math.round(totals.fats / logCount),
            sugar: Math.round(totals.sugar / logCount),
        };
        return { averages, logCount };
    }, [logs, period]);
    
    const YAxis: React.FC<{ maxValue: number; steps?: number; }> = ({ maxValue, steps = 4 }) => {
        const labels = Array.from({ length: steps + 1 }).map((_, i) => {
            const value = (maxValue / steps) * i;
            return Math.round(value);
        }).reverse();
    
        return (
            <div className="flex flex-col justify-between text-right h-full text-xs text-dark-text-secondary pr-2">
                {labels.map((label, index) => <span key={index}>{label.toLocaleString()}</span>)}
            </div>
        );
    };

    const ChartGrid: React.FC<{ steps?: number }> = ({ steps = 4 }) => (
        <div className="absolute inset-y-0 left-0 right-0 grid grid-rows-4 -z-10">
            {Array.from({ length: steps }).map((_, i) => (
                <div key={i} className="border-t border-white/10 first:border-none"></div>
            ))}
        </div>
    );

    const Bar: React.FC<{ label: string; value: number; unit: string; color: string; maxValue: number; }> = ({ label, value, unit, color, maxValue }) => {
        const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
            <div className="flex flex-col items-center w-full h-full">
                <div className="w-full h-full bg-dark-card rounded-t-md flex items-end">
                    <div style={{ height: `${heightPercentage}%`, backgroundColor: color }} className="w-full rounded-t-md transition-all duration-500 ease-out"></div>
                </div>
                <p className="mt-2 text-sm font-bold text-white text-center">{value.toLocaleString()}{unit}</p>
                <p className="text-xs text-dark-text-secondary text-center">{label}</p>
            </div>
        );
    };

    const niceMaxMacros = useMemo(() => {
        if (!data.averages) return 100;
        const { protein, carbs, fats, sugar } = data.averages;
        const maxVal = Math.max(protein, carbs, fats, sugar, 1);
        return Math.ceil(maxVal * 1.25 / 10) * 10;
    }, [data]);

    const niceMaxCalories = useMemo(() => {
        if (!data.averages) return 2000;
        const { calories } = data.averages;
        return Math.ceil(calories * 1.25 / 100) * 100;
    }, [data]);

    return (
        <div className="bg-dark-surface p-4 rounded-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="font-semibold text-lg text-white">Nutrition Averages</h3>
                <div className="flex gap-1 bg-dark-card p-1 rounded-md">
                    <button onClick={() => setPeriod('week')} className={`px-3 py-1 text-xs rounded transition-colors ${period === 'week' ? 'bg-brand-secondary text-white' : 'text-dark-text-secondary'}`}>Week</button>
                    <button onClick={() => setPeriod('month')} className={`px-3 py-1 text-xs rounded transition-colors ${period === 'month' ? 'bg-brand-secondary text-white' : 'text-dark-text-secondary'}`}>Month</button>
                </div>
            </div>

            {data.averages ? (
                <div className="space-y-6 flex-grow">
                    <div>
                        <h4 className="text-md font-semibold text-white text-center mb-2">Average Calories (kcal)</h4>
                        <div className="flex h-32">
                            <YAxis maxValue={niceMaxCalories} />
                            <div className="flex-grow border-b border-l border-white/10 p-2 relative flex justify-center">
                                <ChartGrid />
                                <div className="w-1/4 h-full z-20">
                                    <Bar label="" value={data.averages.calories} unit="" color="#00F5D4" maxValue={niceMaxCalories} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-md font-semibold text-white text-center mb-2">Average Macronutrients (g)</h4>
                        <div className="flex h-32">
                            <YAxis maxValue={niceMaxMacros} />
                            <div className="flex-grow border-b border-l border-white/10 p-2 relative flex justify-around gap-3">
                                <ChartGrid />
                                <div className="flex-1 h-full z-20"><Bar label="Protein" value={data.averages.protein} unit="g" color="#9B5DE5" maxValue={niceMaxMacros} /></div>
                                <div className="flex-1 h-full z-20"><Bar label="Carbs" value={data.averages.carbs} unit="g" color="#F15BB5" maxValue={niceMaxMacros} /></div>
                                <div className="flex-1 h-full z-20"><Bar label="Fats" value={data.averages.fats} unit="g" color="#FEE440" maxValue={niceMaxMacros} /></div>
                                <div className="flex-1 h-full z-20"><Bar label="Sugar" value={data.averages.sugar} unit="g" color="#00BBF9" maxValue={niceMaxMacros} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center text-center">
                    <p className="text-dark-text-secondary text-sm">No nutrition data available for the<br/>selected period.</p>
                </div>
            )}
        </div>
    );
};

export default NutritionChart;
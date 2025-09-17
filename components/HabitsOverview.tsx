
import React from 'react';
import type { DailyLog, HabitType } from '../types';

interface HabitsOverviewProps {
  allLogs: DailyLog[];
}

const HabitsOverview: React.FC<HabitsOverviewProps> = ({ allLogs }) => {
    const habitData = allLogs.reduce<Record<HabitType, number>>((acc, log) => {
        (log.habits || []).forEach(habit => {
            if (!acc[habit.type]) {
                acc[habit.type] = 0;
            }
            acc[habit.type] += habit.durationMinutes;
        });
        return acc;
    }, {} as Record<HabitType, number>);

    return (
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base mb-3">Habits Summary</h3>
            {Object.keys(habitData).length > 0 ? (
                 <div className="space-y-2">
                    {Object.entries(habitData).map(([habit, totalMinutes]) => (
                        <div key={habit}>
                            <p className="text-sm font-medium text-text-base dark:text-dark-text-base">{habit}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total time logged: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary text-center py-4">No habit data logged yet.</p>
            )}
        </div>
    );
};

export default HabitsOverview;

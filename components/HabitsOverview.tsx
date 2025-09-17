import React from 'react';
import type { DailyLog, CustomHabit, ReadingHabitLog, GenericHabitLog } from '../types';
import { HabitType } from '../types';
import { BookOpenIcon, LanguageIcon, PencilSquareIcon, SparklesIcon } from '../constants';

interface HabitsOverviewProps {
  logs: DailyLog[];
  customHabits: CustomHabit[];
}

const getHabitStats = (logs: DailyLog[], habitType: HabitType, customHabitId?: string) => {
    let totalMinutes = 0;
    let daysTracked = 0;
    const trackedDates = new Set<string>();
  
    logs.forEach(log => {
      const habitsForDay = log.habits.filter(h => {
        if (h.type !== habitType) return false;
        if (habitType === HabitType.Custom) {
            return (h as GenericHabitLog).customHabitId === customHabitId;
        }
        return true;
      });
  
      if (habitsForDay.length > 0) {
        trackedDates.add(log.date);
        habitsForDay.forEach(h => {
          totalMinutes += h.durationMinutes;
        });
      }
    });
  
    daysTracked = trackedDates.size;
  
    // Calculate streak
    let currentStreak = 0;
    if (daysTracked > 0) {
        const sortedDates = Array.from(trackedDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        let lastDate = new Date(sortedDates[0] + 'T00:00:00');
        
        if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
            currentStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const currentDate = new Date(sortedDates[i] + 'T00:00:00');
                const expectedPreviousDate = new Date(lastDate);
                expectedPreviousDate.setDate(lastDate.getDate() - 1);

                if (currentDate.getTime() === expectedPreviousDate.getTime()) {
                    currentStreak++;
                    lastDate = currentDate;
                } else {
                    break;
                }
            }
        }
    }
    
    // Total pages for reading
    let totalPagesRead = 0;
    if (habitType === HabitType.Reading) {
        logs.forEach(log => {
            log.habits.forEach(h => {
                if (h.type === HabitType.Reading) {
                    totalPagesRead += (h as ReadingHabitLog).pagesRead;
                }
            });
        });
    }

    return { totalMinutes, daysTracked, currentStreak, totalPagesRead };
};

const StatCard: React.FC<{ label: string; value: string | number; unit?: string; }> = ({ label, value, unit }) => (
    <div className="bg-card dark:bg-dark-card p-3 rounded-md text-center">
        <p className="font-bold text-xl text-primary dark:text-dark-primary">
            {value}
            {unit && <span className="text-sm text-text-secondary dark:text-dark-text-secondary ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{label}</p>
    </div>
);

const HabitOverviewCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    stats: ReturnType<typeof getHabitStats>;
}> = ({ title, icon, stats }) => (
    <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="font-bold text-lg text-text-base dark:text-dark-text-base">{title}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Current Streak" value={stats.currentStreak} unit="days" />
            <StatCard label="Total Days" value={stats.daysTracked} />
            <StatCard label="Total Time" value={Math.round(stats.totalMinutes / 60)} unit="hours" />
            {stats.totalPagesRead > 0 && (
                <StatCard label="Pages Read" value={stats.totalPagesRead} />
            )}
        </div>
    </div>
);


const HabitsOverview: React.FC<HabitsOverviewProps> = ({ logs, customHabits }) => {
    
    const readingStats = getHabitStats(logs, HabitType.Reading);
    const englishStats = getHabitStats(logs, HabitType.English);
    const bloggingStats = getHabitStats(logs, HabitType.Blogging);
    
    const customHabitStats = customHabits.map(habit => ({
        ...habit,
        stats: getHabitStats(logs, HabitType.Custom, habit.id)
    }));

    const hasAnyHabits = readingStats.daysTracked > 0 || englishStats.daysTracked > 0 || bloggingStats.daysTracked > 0 || customHabitStats.some(h => h.stats.daysTracked > 0);

    if (!hasAnyHabits) {
        return (
            <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg">
              <p className="text-text-secondary dark:text-dark-text-secondary">No habit data found.</p>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Log some habits to see an overview here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {readingStats.daysTracked > 0 && (
                <HabitOverviewCard 
                    title="Reading"
                    icon={<BookOpenIcon className="w-6 h-6 text-yellow-500"/>}
                    stats={readingStats}
                />
            )}
            {englishStats.daysTracked > 0 && (
                 <HabitOverviewCard 
                    title="English"
                    icon={<LanguageIcon className="w-6 h-6 text-blue-500"/>}
                    stats={englishStats}
                />
            )}
            {bloggingStats.daysTracked > 0 && (
                 <HabitOverviewCard 
                    title="Blogging"
                    icon={<PencilSquareIcon className="w-6 h-6 text-green-500"/>}
                    stats={bloggingStats}
                />
            )}
            {customHabitStats.filter(h => h.stats.daysTracked > 0).map(habit => (
                 <HabitOverviewCard 
                    key={habit.id}
                    title={habit.name}
                    icon={<SparklesIcon className="w-6 h-6 text-secondary dark:text-dark-secondary"/>}
                    stats={habit.stats}
                />
            ))}
        </div>
    );
};

export default HabitsOverview;

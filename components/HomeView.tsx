import React from 'react';
import type { DailyLog, View } from '../types';
import { DumbbellIcon, ForkKnifeIcon, MoonIcon } from '../constants';

interface HomeViewProps {
    todayLog: DailyLog;
    allLogs: DailyLog[];
    setView: (view: View) => void;
    setSelectedDate: (date: string) => void;
}

const calculateStreak = (logs: DailyLog[]): number => {
    if (logs.length === 0) return 0;
    
    const activityDates = new Set(
      logs
        .filter(log => log.workouts.length > 0 || log.nutrition !== null || log.sleep !== null)
        .map(log => log.date)
    );
    
    if (activityDates.size === 0) return 0;

    const sortedDates = Array.from(activityDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mostRecentLogDate = new Date(sortedDates[0]);
    mostRecentLogDate.setHours(0,0,0,0);
    
    const diffDays = (today.getTime() - mostRecentLogDate.getTime()) / (1000 * 3600 * 24);
    
    if (diffDays > 1) return 0;

    let streak = 0;
    if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const currentLog = new Date(sortedDates[i]);
            const previousLog = new Date(sortedDates[i + 1]);
            const dayDiff = (currentLog.getTime() - previousLog.getTime()) / (1000 * 3600 * 24);
            if (dayDiff === 1) {
                streak++;
            } else {
                break;
            }
        }
    }
    
    return streak;
}


const HomeView: React.FC<HomeViewProps> = ({ todayLog, allLogs, setView, setSelectedDate }) => {
    
    const streak = calculateStreak(allLogs);
    const today = new Date().toISOString().split('T')[0];

    const navigateToLogger = (view: 'routine' | 'nutrition' | 'sleep') => {
        setSelectedDate(today);
        setView(view);
    };

    return (
        <div className="space-y-6">
            
            <div className="bg-gradient-to-br from-brand-secondary to-purple-800 p-6 rounded-xl flex items-center justify-between text-white shadow-lg">
                <div>
                    <p className="text-lg font-medium">Consistency Streak</p>
                    <p className="text-sm opacity-80">Keep the flame alive!</p>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-5xl font-bold">{streak}</span>
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-orange-400">
                        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071 1.052A9.75 9.75 0 0 1 12 12.75v7.5a.75.75 0 0 1-1.5 0v-7.5a9.75 9.75 0 0 1-1.071-1.052.75.75 0 0 0-1.071-1.052c-1.22.822-2.13 2.13-2.13 3.714v5.25a2.25 2.25 0 0 0 2.25 2.25h3a2.25 2.25 0 0 0 2.25-2.25v-5.25c0-1.584-.91-2.892-2.13-3.714Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            
            <div className="bg-dark-surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-white">Today's Sleep</h3>
                     <button onClick={() => navigateToLogger('sleep')} className="text-sm text-brand-primary font-semibold">Log Sleep</button>
                </div>
                 {todayLog.sleep ? (
                    <div className="bg-dark-card p-3 rounded-md flex items-center gap-3">
                        <MoonIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-dark-text text-sm font-medium">{todayLog.sleep.durationHours} hours</span>
                    </div>
                ) : (
                    <p className="text-center text-dark-text-secondary py-4 text-sm">No sleep logged for today.</p>
                )}
            </div>

            <div className="bg-dark-surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-white">Today's Workout</h3>
                    <button onClick={() => navigateToLogger('routine')} className="text-sm text-brand-primary font-semibold">Log Workout</button>
                </div>
                {todayLog.workouts.length > 0 ? (
                    <ul className="space-y-2">
                        {todayLog.workouts.map(w => (
                           <li key={w.id} className="bg-dark-card p-3 rounded-md flex items-center gap-3">
                                <DumbbellIcon className="w-5 h-5 text-brand-secondary" />
                                <span className="text-dark-text text-sm font-medium">{w.name}</span>
                           </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-dark-text-secondary py-4 text-sm">No workout logged for today.</p>
                )}
            </div>

            <div className="bg-dark-surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-white">Today's Nutrition</h3>
                    <button onClick={() => navigateToLogger('nutrition')} className="text-sm text-brand-primary font-semibold">Log Nutrition</button>
                </div>
                 {todayLog.nutrition ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-brand-primary">{todayLog.nutrition.calories}</p>
                            <p className="text-xs text-dark-text-secondary">Calories</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-white">{todayLog.nutrition.protein}g</p>
                            <p className="text-xs text-dark-text-secondary">Protein</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-white">{todayLog.nutrition.carbs}g</p>
                            <p className="text-xs text-dark-text-secondary">Carbs</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-white">{todayLog.nutrition.fats}g</p>
                            <p className="text-xs text-dark-text-secondary">Fats</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-dark-text-secondary py-4 text-sm">No nutrition logged for today.</p>
                )}
            </div>
        </div>
    );
}

export default HomeView;
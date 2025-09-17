
import React from 'react';
import type { DailyLog, UserSettings, View } from '../types';
import { DumbbellIcon, ForkKnifeIcon, MoonIcon, SparklesIcon } from '../constants';

interface HomeViewProps {
  todayLog: DailyLog | undefined;
  userSettings: UserSettings;
  setView: (view: View) => void;
}

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; onClick?: () => void }> = ({ label, value, icon, onClick }) => (
    <div onClick={onClick} className={`bg-card dark:bg-dark-card p-4 rounded-lg flex items-center gap-4 ${onClick ? 'cursor-pointer hover:bg-card-hover dark:hover:bg-dark-card-hover' : ''}`}>
        <div className="text-primary dark:text-dark-primary">{icon}</div>
        <div>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{label}</p>
            <p className="font-bold text-lg text-text-base dark:text-dark-text-base">{value}</p>
        </div>
    </div>
);

const HomeView: React.FC<HomeViewProps> = ({ todayLog, userSettings, setView }) => {
    const workoutCount = todayLog?.workouts.length || 0;
    const calories = todayLog?.nutrition?.calories || 0;
    const sleepHours = todayLog?.sleep?.durationHours || 0;
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-base dark:text-dark-text-base">Hello, {userSettings.name}!</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary">Here's your summary for today.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard 
                    label="Workouts" 
                    value={`${workoutCount} logged`} 
                    icon={<DumbbellIcon className="h-8 w-8 text-secondary dark:text-dark-secondary" />}
                    onClick={() => { setView('calendar'); }}
                />
                <StatCard 
                    label="Calories" 
                    value={`${calories} kcal`} 
                    icon={<ForkKnifeIcon className="h-8 w-8 text-primary dark:text-dark-primary" />}
                    onClick={() => { setView('calendar'); }}
                />
                <StatCard 
                    label="Sleep" 
                    value={`${sleepHours} hours`} 
                    icon={<MoonIcon className="h-8 w-8 text-blue-500" />}
                    onClick={() => { setView('calendar'); }}
                />
            </div>
            
            <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg text-center">
                <h2 className="font-semibold text-xl text-text-base dark:text-dark-text-base">Ready for your analysis?</h2>
                <p className="text-text-secondary dark:text-dark-text-secondary mt-2 mb-4">Get AI-powered insights on your progress and personalized recommendations.</p>
                <button onClick={() => setView('analysis')} className="inline-flex items-center gap-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-bold py-3 px-6 rounded-md hover:opacity-90 transition-opacity">
                    <SparklesIcon className="w-5 h-5" />
                    Analyze My Data
                </button>
            </div>
        </div>
    );
};

export default HomeView;

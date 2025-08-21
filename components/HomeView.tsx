import React, { useState, useRef } from 'react';
import type { DailyLog, View, CheckIn } from '../types';
import { DumbbellIcon, ForkKnifeIcon, MoonIcon } from '../constants';
import NutritionChart from './NutritionChart';

interface HomeViewProps {
    todayLog: DailyLog;
    allLogs: DailyLog[];
    setView: (view: View) => void;
    setSelectedDate: (date: string) => void;
    checkIns: CheckIn[];
}

const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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


const HomeView: React.FC<HomeViewProps> = ({ todayLog, allLogs, setView, setSelectedDate, checkIns }) => {
    
    const streak = calculateStreak(allLogs);
    const today = getLocalDateString();
    const isMonday = new Date().getDay() === 1;
    const latestCheckIn = checkIns?.[0];

    const [activeSlide, setActiveSlide] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (sliderRef.current) {
            const scrollLeft = sliderRef.current.scrollLeft;
            const slideWidth = sliderRef.current.clientWidth;
            const newActiveSlide = Math.round(scrollLeft / slideWidth);
            if (newActiveSlide !== activeSlide) {
                setActiveSlide(newActiveSlide);
            }
        }
    };

    const scrollToSlide = (index: number) => {
        if (sliderRef.current) {
            const slideWidth = sliderRef.current.clientWidth;
            sliderRef.current.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth',
            });
        }
    };

    const navigateToLogger = (view: 'routine' | 'nutrition' | 'sleep') => {
        setSelectedDate(today);
        setView(view);
    };
    
    const navigateToCheckInForm = () => {
        setSelectedDate(today);
        setView('check-in-form');
    }

    const CheckInCard = () => {
        if (isMonday) {
            return (
                 <div onClick={navigateToCheckInForm} className="bg-yellow-500/20 border border-yellow-400 p-4 rounded-lg text-center cursor-pointer hover:bg-yellow-500/30 transition-colors">
                    <h3 className="font-semibold text-lg text-yellow-300">It's Check-in Day!</h3>
                    <p className="text-sm text-yellow-400">Time to log your weekly progress.</p>
                </div>
            )
        }
        
        if (latestCheckIn) {
            return (
                 <div onClick={() => setView('check-ins')} className="bg-dark-surface p-4 rounded-lg cursor-pointer">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-white">Latest Check-in</h3>
                        <p className="text-sm text-dark-text-secondary">{new Date(latestCheckIn.date+'T00:00:00').toLocaleDateString()}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-brand-primary">{latestCheckIn.weight} <span className="text-sm text-dark-text-secondary">kg</span></p>
                            <p className="text-xs text-dark-text-secondary">Weight</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-white">{latestCheckIn.waist} <span className="text-sm text-dark-text-secondary">cm</span></p>
                            <p className="text-xs text-dark-text-secondary">Waist</p>
                        </div>
                        <div className="bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-white">{latestCheckIn.chest} <span className="text-sm text-dark-text-secondary">cm</span></p>
                            <p className="text-xs text-dark-text-secondary">Chest</p>
                        </div>
                    </div>
                </div>
            )
        }

        return null;
    }

    return (
        <div className="space-y-6">
            
            <div className="bg-gradient-to-br from-brand-secondary to-purple-800 p-6 rounded-xl flex items-center justify-between text-white shadow-lg">
                <div>
                    <p className="text-lg font-medium">Cерия</p>
                    <p className="text-sm opacity-80">Поддерживай свой прогресс!</p>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-bold">{streak}</p>
                    <p className="text-sm opacity-80 -mt-1">дней подряд</p>
                </div>
            </div>
            
            <CheckInCard />
            
            <div className="relative pb-6">
                 <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-4 px-4" onScroll={handleScroll}>
                    {/* Slide 1: Logs */}
                    <div className="w-full flex-shrink-0 snap-center space-y-4 pr-4">
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
                    {/* Slide 2: Chart */}
                     <div className="w-full flex-shrink-0 snap-center pr-4">
                        <NutritionChart logs={allLogs} />
                    </div>
                </div>

                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                    <button aria-label="Go to logs slide" onClick={() => scrollToSlide(0)} className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 0 ? 'bg-brand-primary' : 'bg-dark-card'}`}></button>
                    <button aria-label="Go to chart slide" onClick={() => scrollToSlide(1)} className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 1 ? 'bg-brand-primary' : 'bg-dark-card'}`}></button>
                </div>
            </div>

        </div>
    );
}

export default HomeView;
import React, { useState } from 'react';
import type { DailyLog, View, CheckIn } from '../types';
import { DumbbellIcon, ForkKnifeIcon, MoonIcon, CheckBadgeIcon } from '../constants';

interface CalendarViewProps {
  logs: DailyLog[];
  checkIns: CheckIn[];
  setSelectedDate: (date: string) => void;
  setView: (view: View) => void;
  setSelectedCheckInId: (id: string | null) => void;
}

const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddLogChoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onChoice: (view: 'routine' | 'nutrition' | 'sleep' | 'check-in-form') => void;
    isMonday: boolean;
    canAddCheckIn: boolean;
}> = ({ isOpen, onClose, onChoice, isMonday, canAddCheckIn }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dark-surface rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6 text-center text-white">What would you like to log?</h2>
                <div className="space-y-4">
                     {isMonday && canAddCheckIn && (
                        <button
                            onClick={() => onChoice('check-in-form')}
                            className="w-full flex items-center justify-center gap-3 text-lg bg-dark-card p-4 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <CheckBadgeIcon className="w-8 h-8 text-green-400" />
                            <span>Add Check-in</span>
                        </button>
                    )}
                    <button
                        onClick={() => onChoice('routine')}
                        className="w-full flex items-center justify-center gap-3 text-lg bg-dark-card p-4 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <DumbbellIcon className="w-8 h-8 text-brand-secondary" />
                        <span>Workout</span>
                    </button>
                    <button
                        onClick={() => onChoice('nutrition')}
                        className="w-full flex items-center justify-center gap-3 text-lg bg-dark-card p-4 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ForkKnifeIcon className="w-8 h-8 text-brand-primary" />
                        <span>Nutrition</span>
                    </button>
                    <button
                        onClick={() => onChoice('sleep')}
                        className="w-full flex items-center justify-center gap-3 text-lg bg-dark-card p-4 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <MoonIcon className="w-8 h-8 text-blue-400" />
                        <span>Sleep</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


const CalendarView: React.FC<CalendarViewProps> = ({ logs, checkIns, setSelectedDate, setView, setSelectedCheckInId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isDayMonday, setIsDayMonday] = useState(false);
  const [canAddCheckInForSelectedDate, setCanAddCheckInForSelectedDate] = useState(true);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  const logsByDate = new Map(logs.map(log => [log.date, log]));
  const checkInsByDate = new Map(checkIns.map(ci => [ci.date, ci]));

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    setIsDayMonday(date.getDay() === 1); 
    setCanAddCheckInForSelectedDate(!checkInsByDate.has(dateString));
    
    setSelectedDate(dateString);
    setIsChoiceModalOpen(true);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const handleChoice = (view: 'routine' | 'nutrition' | 'sleep' | 'check-in-form') => {
    if (view === 'check-in-form') {
      setSelectedCheckInId(null); // Ensure we're creating a new one
    }
    setView(view);
    setIsChoiceModalOpen(false);
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-full aspect-square"></div>);
    }
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const isToday = dateString === getLocalDateString();
        const logForDay = logsByDate.get(dateString);
        const hasCheckIn = checkInsByDate.has(dateString);
        const hasWorkout = logForDay && logForDay.workouts.length > 0;
        const hasNutrition = logForDay && logForDay.nutrition;
        const hasSleep = logForDay && logForDay.sleep;

        days.push(
            <div key={day} onClick={() => handleDayClick(day)} className="relative w-full aspect-square flex flex-col items-center justify-center cursor-pointer rounded-lg hover:bg-dark-card transition-colors p-1">
                {hasCheckIn && <CheckBadgeIcon className="absolute top-0.5 right-0.5 w-4 h-4 text-green-400" />}
                <span className={`flex items-center justify-center rounded-full w-8 h-8 text-sm ${isToday ? 'bg-brand-primary text-dark-bg font-bold' : 'text-dark-text'}`}>
                    {day}
                </span>
                <div className="flex gap-1 mt-1 h-3">
                    {hasWorkout && <DumbbellIcon className="w-3 h-3 text-brand-secondary" />}
                    {hasNutrition && <ForkKnifeIcon className="w-3 h-3 text-brand-primary" />}
                    {hasSleep && <MoonIcon className="w-3 h-3 text-blue-400" />}
                </div>
            </div>
        );
    }
    return days;
  };

  return (
    <>
      <div className="bg-dark-surface p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-dark-card transition-colors" aria-label="Previous month">&lt;</button>
          <h2 className="text-lg font-bold text-white">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-dark-card transition-colors" aria-label="Next month">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-dark-text-secondary text-xs mb-2">
          {daysOfWeek.map((day, index) => <div key={index}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>
      <AddLogChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onChoice={handleChoice}
        isMonday={isDayMonday}
        canAddCheckIn={canAddCheckInForSelectedDate}
       />
    </>
  );
};

export default CalendarView;
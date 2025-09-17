import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { DailyLog, View, CheckIn, ReadingHabitLog } from '../types';
import { HabitType } from '../types';
import { PlusIcon, DumbbellIcon, ForkKnifeIcon, MoonIcon, CheckBadgeIcon, CalendarIcon, CalendarWeekIcon, LanguageIcon, BookOpenIcon, PencilSquareIcon } from '../constants';
// FIX: Import HabitToLogType to correctly type the setHabitToLog prop.
import type { HabitToLogType } from '../App';

interface CalendarViewProps {
  logs: DailyLog[];
  checkIns: CheckIn[];
  setSelectedDate: (date: string) => void;
  setView: (view: View) => void;
  setSelectedCheckInId: (id: string | null) => void;
  // FIX: Update prop type to match the state setter from App.tsx.
  setHabitToLog: (habit: HabitToLogType | null) => void;
}

const getLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddLogChoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onChoice: (view: 'routine' | 'nutrition' | 'sleep' | 'check-in-form' | HabitType) => void;
    isMonday: boolean;
    canAddCheckIn: boolean;
}> = ({ isOpen, onClose, onChoice, isMonday, canAddCheckIn }) => {
    if (!isOpen) return null;

    const LogChoiceButton: React.FC<{
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
    }> = ({ icon, label, onClick }) => (
        <button 
            onClick={onClick} 
            className="flex flex-col items-center justify-center gap-2 bg-card dark:bg-dark-card p-4 rounded-lg hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors aspect-square"
        >
            {icon}
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6 text-center text-text-base dark:text-dark-text-base">What do you want to log?</h2>
                <div className="grid grid-cols-2 gap-3">
                     {isMonday && canAddCheckIn && (
                        <LogChoiceButton
                            label="Check-in"
                            icon={<CheckBadgeIcon className="w-8 h-8 text-green-500" />}
                            onClick={() => onChoice('check-in-form')}
                        />
                    )}
                    <LogChoiceButton 
                        label="Workout" 
                        icon={<DumbbellIcon className="w-8 h-8 text-secondary dark:text-dark-secondary" />}
                        onClick={() => onChoice('routine')}
                    />
                    <LogChoiceButton 
                        label="Nutrition" 
                        icon={<ForkKnifeIcon className="w-8 h-8 text-primary dark:text-dark-primary" />}
                        onClick={() => onChoice('nutrition')}
                    />
                     <LogChoiceButton 
                        label="Sleep" 
                        icon={<MoonIcon className="w-8 h-8 text-blue-500" />}
                        onClick={() => onChoice('sleep')}
                    />
                    <LogChoiceButton 
                        label="Reading" 
                        icon={<BookOpenIcon className="w-8 h-8 text-yellow-500"/>}
                        onClick={() => onChoice(HabitType.Reading)}
                    />
                    <LogChoiceButton 
                        label="English" 
                        icon={<LanguageIcon className="w-8 h-8 text-blue-500"/>}
                        onClick={() => onChoice(HabitType.English)}
                    />
                     <LogChoiceButton 
                        label="Blogging" 
                        icon={<PencilSquareIcon className="w-8 h-8 text-green-500"/>}
                        onClick={() => onChoice(HabitType.Blogging)}
                    />
                </div>
            </div>
        </div>
    );
};

const WeeklyScroller: React.FC<{
    selectedDate: string;
    onDateSelect: (date: string) => void;
    logsByDate: Map<string, DailyLog>;
    checkInsByDate: Map<string, CheckIn>;
}> = ({ selectedDate, onDateSelect, logsByDate, checkInsByDate }) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const todayRef = useRef<HTMLButtonElement>(null);

    const dates = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = -180; i <= 180; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    }, []);

    useEffect(() => {
        if (todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }
    }, []);

    const todayString = getLocalDateString(new Date());

    return (
        <div ref={scrollerRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-4 px-4 py-2">
            {dates.map((date, index) => {
                const dateString = getLocalDateString(date);
                const isSelected = dateString === selectedDate;
                const logForDay = logsByDate.get(dateString);
                const hasCheckIn = checkInsByDate.has(dateString);
                const hasWorkout = logForDay && logForDay.workouts.length > 0;
                const hasNutrition = logForDay && logForDay.nutrition;
                const hasSleep = logForDay && logForDay.sleep;
                const hasHabits = logForDay && (logForDay.habits || []).length > 0;

                return (
                    <button
                        key={index}
                        ref={dateString === todayString ? todayRef : null}
                        onClick={() => onDateSelect(dateString)}
                        className={`flex-shrink-0 w-16 h-24 snap-center flex flex-col items-center justify-center rounded-xl transition-all duration-200 
                            ${isSelected 
                                ? 'bg-primary dark:bg-dark-secondary text-white dark:text-dark-text-base' 
                                : 'bg-surface dark:bg-dark-surface hover:bg-card-hover dark:hover:bg-dark-card'}`
                        }
                    >
                        <span className="text-sm font-medium opacity-80">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                        <span className="text-2xl font-bold">{date.getDate()}</span>
                        <div className="flex gap-1 mt-1 h-2">
                            {(hasWorkout || hasNutrition || hasSleep || hasHabits || hasCheckIn) &&
                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/50 dark:bg-dark-text-base/50' : 'bg-secondary dark:bg-dark-secondary'}`}></div>
                            }
                        </div>
                    </button>
                )
            })}
        </div>
    );
};

const LogSummaryCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ icon, title, onClick, children }) => (
    <div onClick={onClick} className="bg-surface dark:bg-dark-surface p-4 rounded-lg cursor-pointer hover:bg-card-hover dark:hover:bg-dark-card transition-colors shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <h3 className="font-semibold text-text-base dark:text-dark-text-base">{title}</h3>
        </div>
        <div className="pl-9 text-sm text-text-secondary dark:text-dark-text-secondary space-y-1">
            {children}
        </div>
    </div>
);

const DayLogDisplay: React.FC<{
    selectedDate: string;
    log: DailyLog | undefined;
    checkIn: CheckIn | undefined;
    onNavigate: (view: View) => void;
}> = ({ selectedDate, log, checkIn, onNavigate }) => {
    
    const hasAnyLogs = log && (log.workouts.length > 0 || log.nutrition || log.sleep || (log.habits || []).length > 0) || checkIn;

    if (!hasAnyLogs) {
        return (
            <div className="text-center py-16 px-4 bg-surface dark:bg-dark-surface rounded-lg mt-6 shadow-sm dark:shadow-none">
                <p className="text-text-secondary dark:text-dark-text-secondary">No logs for this day.</p>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Tap the '+' button to add one.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-3">
            {checkIn && (
                 <LogSummaryCard icon={<CheckBadgeIcon className="w-6 h-6 text-green-500" />} title="Check-in" onClick={() => onNavigate('check-ins')}>
                    <p>Weight: {checkIn.weight}kg, Waist: {checkIn.waist}cm, Chest: {checkIn.chest}cm</p>
                 </LogSummaryCard>
            )}
            {log?.sleep && (
                <LogSummaryCard icon={<MoonIcon className="w-6 h-6 text-blue-500" />} title="Sleep" onClick={() => onNavigate('sleep')}>
                    <p>{log.sleep.durationHours} hours</p>
                </LogSummaryCard>
            )}
            {log?.nutrition && (
                 <LogSummaryCard icon={<ForkKnifeIcon className="w-6 h-6 text-primary dark:text-dark-primary" />} title="Nutrition" onClick={() => onNavigate('nutrition')}>
                    <p>{log.nutrition.calories} kcal, {log.nutrition.protein}g P, {log.nutrition.carbs}g C, {log.nutrition.fats}g F</p>
                 </LogSummaryCard>
            )}
             {log?.workouts && log.workouts.length > 0 && (
                 <LogSummaryCard icon={<DumbbellIcon className="w-6 h-6 text-secondary dark:text-dark-secondary" />} title="Workout" onClick={() => onNavigate('routine')}>
                    {log.workouts.map(w => <p key={w.id}>{w.name}</p>)}
                 </LogSummaryCard>
            )}
            {log?.habits && log.habits.length > 0 && (
                <LogSummaryCard icon={<CheckBadgeIcon className="w-6 h-6 text-yellow-500" />} title="Habits" onClick={() => {}}>
                    {log.habits.map(h => {
                        const iconMap = {
                            [HabitType.English]: <LanguageIcon className="w-4 h-4 text-blue-500 inline mr-2"/>,
                            [HabitType.Reading]: <BookOpenIcon className="w-4 h-4 text-yellow-500 inline mr-2"/>,
                            [HabitType.Blogging]: <PencilSquareIcon className="w-4 h-4 text-green-500 inline mr-2"/>
                        };
                        const readingDetails = h.type === HabitType.Reading ? `(${(h as ReadingHabitLog).pagesRead} pages)` : '';
                        return <div key={h.id} className="flex items-center">{iconMap[h.type]} {h.type}: {h.durationMinutes} min {readingDetails}</div>
                    })}
                </LogSummaryCard>
            )}
        </div>
    );
};


const MonthView: React.FC<{
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    onDayClick: (dateString: string) => void;
    logsByDate: Map<string, DailyLog>;
    checkInsByDate: Map<string, CheckIn>;
}> = ({ currentDate, setCurrentDate, onDayClick, logsByDate, checkInsByDate }) => {
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();
    const todayString = getLocalDateString(new Date());

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-full aspect-square"></div>);
        }
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateString = getLocalDateString(date);
            const isToday = dateString === todayString;
            const logForDay = logsByDate.get(dateString);
            const hasCheckIn = checkInsByDate.has(dateString);
            const hasWorkout = logForDay && logForDay.workouts.length > 0;
            const hasNutrition = logForDay && logForDay.nutrition;
            const hasSleep = logForDay && logForDay.sleep;

            days.push(
                <div key={day} onClick={() => onDayClick(dateString)} className="relative w-full aspect-square flex flex-col items-center justify-center cursor-pointer rounded-lg hover:bg-card dark:hover:bg-dark-card transition-colors p-1">
                    {hasCheckIn && <CheckBadgeIcon className="absolute top-0.5 right-0.5 w-4 h-4 text-green-500" />}
                    <span className={`flex items-center justify-center rounded-full w-8 h-8 text-sm ${isToday ? 'bg-warning text-text-base font-bold' : 'text-text-base dark:text-dark-text-base'}`}>
                        {day}
                    </span>
                    <div className="flex gap-1 mt-1 h-3">
                        {hasWorkout && <DumbbellIcon className="w-3 h-3 text-secondary dark:text-dark-secondary" />}
                        {hasNutrition && <ForkKnifeIcon className="w-3 h-3 text-primary dark:text-dark-primary" />}
                        {hasSleep && <MoonIcon className="w-3 h-3 text-blue-500" />}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-card dark:hover:bg-dark-card transition-colors" aria-label="Previous month">&lt;</button>
              <h2 className="text-lg font-bold text-text-base dark:text-dark-text-base">
                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
              </h2>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-card dark:hover:bg-dark-card transition-colors" aria-label="Next month">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-text-secondary dark:text-dark-text-secondary text-xs mb-2">
              {daysOfWeek.map((day, index) => <div key={index}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
        </div>
    )
};


const CalendarView: React.FC<CalendarViewProps> = ({ logs, checkIns, setSelectedDate, setView, setSelectedCheckInId, setHabitToLog }) => {
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');
  const [selectedDateInternal, setSelectedDateInternal] = useState(getLocalDateString(new Date()));
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  
  const logsByDate = useMemo(() => new Map(logs.map(log => [log.date, log])), [logs]);
  const checkInsByDate = useMemo(() => new Map(checkIns.map(ci => [ci.date, ci])), [checkIns]);

  const openAddLogModal = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedDateInternal(dateString);
    setIsChoiceModalOpen(true);
  };
  
  const handleChoice = (choice: 'routine' | 'nutrition' | 'sleep' | 'check-in-form' | HabitType) => {
    if (Object.values(HabitType).includes(choice as HabitType)) {
        // FIX: Pass a HabitToLogType object instead of just the HabitType string.
        setHabitToLog({ type: choice as HabitType });
    } else if (choice === 'check-in-form') {
      setSelectedCheckInId(null);
      setView(choice);
    } else {
        setView(choice as 'routine' | 'nutrition' | 'sleep');
    }
    setIsChoiceModalOpen(false);
  };

  const isMondayForSelected = new Date(`${selectedDateInternal}T00:00:00`).getDay() === 1;
  const canAddCheckInForSelected = !checkInsByDate.has(selectedDateInternal);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div />
        <button onClick={() => setCalendarMode(m => m === 'week' ? 'month' : 'week')} className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:text-text-base dark:hover:text-dark-text-base hover:bg-card dark:hover:bg-dark-surface transition-colors">
          {calendarMode === 'week' ? <CalendarIcon className="w-6 h-6" /> : <CalendarWeekIcon className="w-6 h-6" />}
        </button>
      </div>

      {calendarMode === 'week' ? (
        <div className="flex-grow">
          <WeeklyScroller selectedDate={selectedDateInternal} onDateSelect={setSelectedDateInternal} logsByDate={logsByDate} checkInsByDate={checkInsByDate} />
          <DayLogDisplay 
            selectedDate={selectedDateInternal} 
            log={logsByDate.get(selectedDateInternal)}
            checkIn={checkInsByDate.get(selectedDateInternal)}
            onNavigate={(view) => {
                setSelectedDate(selectedDateInternal);
                setView(view);
            }}
          />
          <button onClick={() => openAddLogModal(selectedDateInternal)} className="fixed bottom-24 right-4 bg-secondary dark:bg-dark-secondary rounded-full p-4 shadow-lg hover:scale-105 transition-transform">
             <PlusIcon className="w-8 h-8 text-white"/>
          </button>
        </div>
      ) : (
        <MonthView 
            currentDate={displayMonth}
            setCurrentDate={setDisplayMonth}
            onDayClick={openAddLogModal}
            logsByDate={logsByDate}
            checkInsByDate={checkInsByDate}
        />
      )}

      <AddLogChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onChoice={handleChoice}
        isMonday={isMondayForSelected}
        canAddCheckIn={canAddCheckInForSelected}
       />
    </div>
  );
};

export default CalendarView;

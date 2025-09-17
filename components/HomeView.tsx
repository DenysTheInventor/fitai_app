import React, { useState, useRef, useMemo } from 'react';
import type { DailyLog, View, CheckIn, HabitLog, Book, ReadingHabitLog } from '../types';
import { HabitType } from '../types';
import { DumbbellIcon, ForkKnifeIcon, MoonIcon, LanguageIcon, BookOpenIcon, PencilSquareIcon } from '../constants';
import NutritionChart from './NutritionChart';

interface HomeViewProps {
    todayLog: DailyLog;
    allLogs: DailyLog[];
    setView: (view: View) => void;
    setSelectedDate: (date: string) => void;
    checkIns: CheckIn[];
    onSaveHabit: (habitLog: HabitLog) => void;
    books: Book[];
}

const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LogHabitModal: React.FC<{
    habitType: HabitType;
    onClose: () => void;
    onSave: (habitLog: HabitLog) => void;
    books: Book[];
    allLogs: DailyLog[];
}> = ({ habitType, onClose, onSave, books, allLogs }) => {
    const [duration, setDuration] = useState(30);
    const [pages, setPages] = useState(10);
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    
    const unfinishedBooks = useMemo(() => books.filter(b => !b.isFinished), [books]);
    
    const selectedBook = useMemo(() => books.find(b => b.id === selectedBookId), [books, selectedBookId]);

    const currentPagesRead = useMemo(() => {
        if (!selectedBookId) return 0;
        return allLogs.reduce((total, log) => {
            const pagesInLog = log.habits
                .filter(h => h.type === HabitType.Reading && (h as ReadingHabitLog).bookId === selectedBookId)
                .reduce((sum, h) => sum + (h as ReadingHabitLog).pagesRead, 0);
            return total + pagesInLog;
        }, 0);
    }, [allLogs, selectedBookId]);

    const handleSubmit = () => {
        let newLog: HabitLog;
        if (habitType === HabitType.Reading) {
            if (!selectedBookId) {
                alert("Please select a book.");
                return;
            }
            newLog = { id: new Date().toISOString(), type: HabitType.Reading, durationMinutes: duration, pagesRead: pages, bookId: selectedBookId };
        } else {
            newLog = { id: new Date().toISOString(), type: habitType, durationMinutes: duration };
        }
        onSave(newLog);
        onClose();
    };
    
    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-text-base dark:text-dark-text-base">Log {habitType}</h2>
                <div className="space-y-4">
                    {habitType === HabitType.Reading && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Book</label>
                            <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2">
                                <option value="">Select a book...</option>
                                {unfinishedBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                            </select>
                            {selectedBook && (
                                <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
                                    Progress: {currentPagesRead} / {selectedBook.totalPages} pages read
                                </div>
                            )}
                        </div>
                    )}
                    
                     {habitType === HabitType.Reading && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Pages Read</label>
                            <input type="number" value={pages} onChange={e => setPages(+e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Duration (minutes)</label>
                        <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base hover:bg-card-hover dark:hover:bg-dark-card-hover">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-primary text-white dark:text-dark-bg-base font-semibold">Save Log</button>
                </div>
            </div>
         </div>
    );
};

const HomeView: React.FC<HomeViewProps> = ({ todayLog, allLogs, setView, setSelectedDate, checkIns, onSaveHabit, books }) => {
    
    const today = getLocalDateString();
    const isMonday = new Date().getDay() === 1;
    const latestCheckIn = checkIns?.[0];

    const [activeSlide, setActiveSlide] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState<HabitType | null>(null);

    const englishLog = todayLog.habits.find(h => h.type === HabitType.English);
    const readingLog = todayLog.habits.find(h => h.type === HabitType.Reading) as ReadingHabitLog | undefined;
    const bloggingLog = todayLog.habits.find(h => h.type === HabitType.Blogging);

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

    const openHabitModal = (habitType: HabitType) => {
        setSelectedHabit(habitType);
        setIsHabitModalOpen(true);
    };
    
    const CheckInCard = () => {
        if (isMonday) {
            return (
                 <div onClick={navigateToCheckInForm} className="bg-yellow-500/10 border border-yellow-400 p-4 rounded-lg text-center cursor-pointer hover:bg-yellow-500/20 transition-colors">
                    <h3 className="font-semibold text-lg text-yellow-600 dark:text-yellow-300">It's Check-in Day!</h3>
                    <p className="text-sm text-yellow-500 dark:text-yellow-400">Time to log your weekly progress.</p>
                </div>
            )
        }
        
        if (latestCheckIn) {
            return (
                 <div onClick={() => setView('check-ins')} className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg cursor-pointer">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base">Latest Check-in</h3>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{new Date(latestCheckIn.date+'T00:00:00').toLocaleDateString()}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-primary dark:text-dark-primary">{latestCheckIn.weight} <span className="text-sm text-text-secondary dark:text-dark-text-secondary">kg</span></p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Weight</p>
                        </div>
                        <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-text-base dark:text-dark-text-base">{latestCheckIn.waist} <span className="text-sm text-text-secondary dark:text-dark-text-secondary">cm</span></p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Waist</p>
                        </div>
                        <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                            <p className="font-bold text-xl text-text-base dark:text-dark-text-base">{latestCheckIn.chest} <span className="text-sm text-text-secondary dark:text-dark-text-secondary">cm</span></p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Chest</p>
                        </div>
                    </div>
                </div>
            )
        }

        return null;
    }

    return (
        <div className="space-y-6">
            
            <CheckInCard />
            
            {/* English Habit Card */}
            <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base">English Learning</h3>
                    <button onClick={() => openHabitModal(HabitType.English)} className="text-sm text-primary dark:text-dark-primary font-semibold">Log English</button>
                </div>
                {englishLog ? (
                    <div className="bg-card dark:bg-dark-card p-3 rounded-md flex items-center gap-3">
                        <LanguageIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-text-base dark:text-dark-text-base text-sm font-medium">{englishLog.durationMinutes} minutes</span>
                    </div>
                ) : (
                    <p className="text-center text-text-secondary dark:text-dark-text-secondary py-4 text-sm">Not logged for today.</p>
                )}
            </div>
            
            {/* Reading Habit Card */}
            <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base">Reading</h3>
                    <button onClick={() => openHabitModal(HabitType.Reading)} className="text-sm text-primary dark:text-dark-primary font-semibold">Log Reading</button>
                </div>
                {readingLog ? (
                    <div className="bg-card dark:bg-dark-card p-3 rounded-md flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                            <BookOpenIcon className="w-5 h-5 text-yellow-500" />
                            <span className="text-text-base dark:text-dark-text-base text-sm font-medium">{readingLog.durationMinutes} minutes</span>
                        </div>
                        <span className="text-text-secondary dark:text-dark-text-secondary text-sm">{readingLog.pagesRead} pages</span>
                    </div>
                ) : (
                    <p className="text-center text-text-secondary dark:text-dark-text-secondary py-4 text-sm">Not logged for today.</p>
                )}
            </div>
            
            {/* Blogging Habit Card */}
            <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base">Blogging</h3>
                    <button onClick={() => openHabitModal(HabitType.Blogging)} className="text-sm text-primary dark:text-dark-primary font-semibold">Log Blogging</button>
                </div>
                {bloggingLog ? (
                    <div className="bg-card dark:bg-dark-card p-3 rounded-md flex items-center gap-3">
                        <PencilSquareIcon className="w-5 h-5 text-green-500" />
                        <span className="text-text-base dark:text-dark-text-base text-sm font-medium">{bloggingLog.durationMinutes} minutes</span>
                    </div>
                ) : (
                    <p className="text-center text-text-secondary dark:text-dark-text-secondary py-4 text-sm">Not logged for today.</p>
                )}
            </div>

            <div className="relative pb-6">
                 <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-4 px-4" onScroll={handleScroll}>
                    {/* Slide 1: Logs */}
                    <div className="w-full flex-shrink-0 snap-center space-y-4 pr-4">
                        <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base">Today's Sleep</h3>
                                <button onClick={() => navigateToLogger('sleep')} className="text-sm text-primary dark:text-dark-primary font-semibold">Log Sleep</button>
                            </div>
                            {todayLog.sleep ? (
                                <div className="bg-card dark:bg-dark-card p-3 rounded-md flex items-center gap-3">
                                    <MoonIcon className="w-5 h-5 text-blue-500" />
                                    <span className="text-text-base dark:text-dark-text-base text-sm font-medium">{todayLog.sleep.durationHours} hours</span>
                                </div>
                            ) : (
                                <p className="text-center text-text-secondary dark:text-dark-text-secondary py-4 text-sm">No sleep logged for today.</p>
                            )}
                        </div>

                        <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base">Today's Workout</h3>
                                <button onClick={() => navigateToLogger('routine')} className="text-sm text-primary dark:text-dark-primary font-semibold">Log Workout</button>
                            </div>
                            {todayLog.workouts.length > 0 ? (
                                <div className="relative cursor-pointer mt-2" onClick={() => navigateToLogger('routine')}>
                                    {/* Stack effect */}
                                    {todayLog.workouts.length > 2 && (
                                        <div className="absolute top-3 left-0 right-0 h-full bg-card/30 dark:bg-dark-card/30 rounded-lg -z-20 transform scale-90" />
                                    )}
                                    {todayLog.workouts.length > 1 && (
                                        <div className="absolute top-1.5 left-0 right-0 h-full bg-card/60 dark:bg-dark-card/60 rounded-lg -z-10 transform scale-95" />
                                    )}

                                    {/* Top card content */}
                                    <div className="relative bg-card dark:bg-dark-card p-3 rounded-md flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <DumbbellIcon className="w-5 h-5 text-secondary dark:text-dark-secondary flex-shrink-0" />
                                            <span className="text-text-base dark:text-dark-text-base text-sm font-medium truncate">{todayLog.workouts[0].name}</span>
                                        </div>
                                        {todayLog.workouts.length > 1 && (
                                            <span className="flex-shrink-0 text-xs font-semibold bg-secondary dark:bg-dark-secondary text-white rounded-full px-2 py-0.5">
                                                +{todayLog.workouts.length - 1} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-text-secondary dark:text-dark-text-secondary py-4 text-sm">No workout logged for today.</p>
                            )}
                        </div>

                        <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base">Today's Nutrition</h3>
                                <button onClick={() => navigateToLogger('nutrition')} className="text-sm text-primary dark:text-dark-primary font-semibold">Log Nutrition</button>
                            </div>
                            {todayLog.nutrition ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                    <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                                        <p className="font-bold text-xl text-primary dark:text-dark-primary">{todayLog.nutrition.calories}</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Calories</p>
                                    </div>
                                    <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                                        <p className="font-bold text-xl text-text-base dark:text-dark-text-base">{todayLog.nutrition.protein}g</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Protein</p>
                                    </div>
                                    <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                                        <p className="font-bold text-xl text-text-base dark:text-dark-text-base">{todayLog.nutrition.carbs}g</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Carbs</p>
                                    </div>
                                    <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                                        <p className="font-bold text-xl text-text-base dark:text-dark-text-base">{todayLog.nutrition.fats}g</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Fats</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-text-secondary dark:text-dark-text-secondary py-4 text-sm">No nutrition logged for today.</p>
                            )}
                        </div>
                    </div>
                    {/* Slide 2: Chart */}
                     <div className="w-full flex-shrink-0 snap-center pr-4">
                        <NutritionChart logs={allLogs} />
                    </div>
                </div>

                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                    <button aria-label="Go to logs slide" onClick={() => scrollToSlide(0)} className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 0 ? 'bg-primary dark:bg-dark-primary' : 'bg-card dark:bg-dark-card'}`}></button>
                    <button aria-label="Go to chart slide" onClick={() => scrollToSlide(1)} className={`w-2 h-2 rounded-full transition-colors ${activeSlide === 1 ? 'bg-primary dark:bg-dark-primary' : 'bg-card dark:bg-dark-card'}`}></button>
                </div>
            </div>
            
            {isHabitModalOpen && selectedHabit && (
                <LogHabitModal 
                    habitType={selectedHabit}
                    onClose={() => setIsHabitModalOpen(false)}
                    onSave={onSaveHabit}
                    books={books}
                    allLogs={allLogs}
                />
            )}

        </div>
    );
}

export default HomeView;
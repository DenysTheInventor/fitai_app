
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { View, DailyLog, CustomExercise, UserSettings, WorkoutActivity, ExerciseSet, CheckIn, HabitType, Book } from './types';
import { ActivityType } from './types';

// Components
import HomeView from './components/HomeView';
import CalendarView from './components/CalendarView';
import WorkoutLogger from './components/WorkoutLogger';
import NutritionLogger from './components/NutritionLogger';
import SleepLogger from './components/SleepLogger';
import AnalysisDashboard from './components/AnalysisDashboard';
import BottomNav from './components/BottomNav';
import ExerciseHubView from './components/ExerciseHubView';
import ExerciseLibrary from './components/ExerciseLibrary';
import SetsListView from './components/SetsListView';
import SetFormView from './components/SetFormView';
import CheckInsView from './components/CheckInsView';
import CheckInFormView from './components/CheckInFormView';
import CheckInDetailView from './components/CheckInDetailView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import MapView from './components/MapView';
import ActivitySummaryView from './components/ActivitySummaryView';
import LogHabitModal from './components/LogHabitModal';
import HabitsLibraryView from './components/HabitsLibraryView';
import ReadingLibraryView from './components/ReadingLibraryView';
import BookFormView from './components/BookFormView';

const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const defaultSettings: UserSettings = {
  name: 'User',
  weight: 70,
  height: 175,
  goal: 'Stay healthy and active',
};

function App() {
  const [logs, setLogs] = useLocalStorage<DailyLog[]>('fitai-logs', []);
  const [customExercises, setCustomExercises] = useLocalStorage<CustomExercise[]>('fitai-custom-exercises', []);
  const [exerciseSets, setExerciseSets] = useLocalStorage<ExerciseSet[]>('fitai-exercise-sets', []);
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>('fitai-checkins', []);
  const [books, setBooks] = useLocalStorage<Book[]>('fitai-books', []);
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('fitai-settings', defaultSettings);
  
  // Data migration for backward compatibility
  useEffect(() => {
    // Check if any log is missing the 'habits' array and add it.
    // This prevents crashes when using data from older versions of the app.
    if (logs.some(log => typeof log.habits === 'undefined')) {
      const migratedLogs = logs.map(log => ({
        ...log,
        habits: log.habits || [],
      }));
      setLogs(migratedLogs);
    }
  }, [logs, setLogs]);

  const [view, setView] = useState<View>('home');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [habitToLog, setHabitToLog] = useState<HabitType | null>(null);

  const selectedDateLog = useMemo(() => {
    return logs.find(log => log.date === selectedDate) || { date: selectedDate, workouts: [], nutrition: null, sleep: null, habits: [] };
  }, [logs, selectedDate]);

  const updateLog = (updatedLog: DailyLog) => {
    const newLogs = logs.filter(log => log.date !== updatedLog.date);
    // Only add log if it has data
    const hasData = updatedLog.workouts.length > 0 || updatedLog.nutrition || updatedLog.sleep || (updatedLog.habits && updatedLog.habits.length > 0);
    if (hasData) {
        setLogs([...newLogs, updatedLog]);
    } else {
        setLogs(newLogs);
    }
    if (view !== 'calendar') {
        setView('calendar');
    }
  };

  const handleSaveSet = (set: ExerciseSet | Omit<ExerciseSet, 'id'>) => {
    if ('id' in set) {
        setExerciseSets(sets => sets.map(s => s.id === set.id ? set : s));
    } else {
        setExerciseSets(sets => [...sets, { ...set, id: new Date().toISOString() }]);
    }
    setView('sets');
  };
  
  const handleDeleteSet = (id: string) => {
      if (window.confirm("Are you sure you want to delete this set?")) {
        setExerciseSets(sets => sets.filter(s => s.id !== id));
      }
  }

  const handleSaveCheckIn = (checkIn: CheckIn | Omit<CheckIn, 'id' | 'date'> & { date: string }) => {
      if ('id' in checkIn) {
          setCheckIns(cis => cis.map(ci => ci.id === checkIn.id ? checkIn : ci));
      } else {
          setCheckIns(cis => [...cis, { ...checkIn, id: new Date().toISOString() }]);
      }
      setView('calendar');
  };
  
  const handleDeleteCheckIn = (id: string) => {
      if (window.confirm("Are you sure you want to delete this check-in?")) {
        setCheckIns(cis => cis.filter(ci => ci.id !== id));
      }
  };

  const handleSaveBook = (book: Book | Omit<Book, 'id'>) => {
    if ('id' in book) {
        setBooks(bs => bs.map(b => b.id === book.id ? book : b));
    } else {
        setBooks(bs => [...bs, { ...book, id: new Date().toISOString() }]);
    }
    setView('reading-library');
  };

  const handleDeleteBook = (id: string) => {
    if (window.confirm("Are you sure you want to delete this book from your library?")) {
      setBooks(bs => bs.filter(b => b.id !== id));
    }
  };

  const goBackToCalendar = () => setView('calendar');
  const goBackToExercises = () => setView('exercises');
  const goBackToSets = () => setView('sets');
  const goBackToCheckIns = () => setView('check-ins');
  const goBackToHabits = () => setView('habits');
  const goBackToReadingLibrary = () => setView('reading-library');

  const setToEdit = useMemo(() => exerciseSets.find(s => s.id === selectedSetId), [selectedSetId, exerciseSets]);
  const checkInToEdit = useMemo(() => checkIns.find(ci => ci.id === selectedCheckInId), [selectedCheckInId, checkIns]);
  const checkInToView = useMemo(() => checkIns.find(ci => ci.id === selectedCheckInId), [selectedCheckInId, checkIns]);
  const activityToView = useMemo(() => {
    for (const log of logs) {
        const activity = log.workouts.find(w => w.id === selectedActivityId && w.type === ActivityType.OutdoorRun);
        if (activity) return activity as WorkoutActivity & { type: ActivityType.OutdoorRun };
    }
    return undefined;
  }, [selectedActivityId, logs]);
  const bookToEdit = useMemo(() => books.find(b => b.id === selectedBookId), [selectedBookId, books]);

  const todayLog = useMemo(() => logs.find(log => log.date === getLocalDateString()), [logs]);

  const renderView = () => {
    // Quick nav components
    const backButton = (goBack: () => void) => (
         <button onClick={goBack} className="text-text-secondary dark:text-dark-text-secondary mb-4 hover:text-text-base dark:hover:text-dark-text-base">&larr; Back</button>
    );

    switch(view) {
      case 'home': return <HomeView todayLog={todayLog} userSettings={userSettings} setView={setView} />;
      case 'calendar': return <CalendarView logs={logs} checkIns={checkIns} setSelectedDate={setSelectedDate} setView={setView} setSelectedCheckInId={setSelectedCheckInId} setHabitToLog={setHabitToLog} />;
      case 'history': return <HistoryView allLogs={logs} />;
      case 'exercises': return <ExerciseHubView setView={setView} />;
      case 'analysis': return <AnalysisDashboard allLogs={logs} userSettings={userSettings} checkIns={checkIns} />;
      case 'settings': return <SettingsView userSettings={userSettings} onSave={setUserSettings} />;
      
      // Sub-views with back buttons
      case 'routine': return <><div className="mb-4 flex justify-between items-center">{backButton(goBackToCalendar)} <button onClick={() => setView('map')} className="px-4 py-2 text-sm rounded-md bg-secondary dark:bg-dark-secondary text-white font-semibold">Start Outdoor Run</button></div> <WorkoutLogger selectedDateLog={selectedDateLog} onUpdateLog={updateLog} customExercises={customExercises} allLogs={logs} exerciseSets={exerciseSets} /></>;
      case 'nutrition': return <>{backButton(goBackToCalendar)} <NutritionLogger selectedDateLog={selectedDateLog} onUpdateLog={updateLog} goBack={goBackToCalendar} /></>;
      case 'sleep': return <>{backButton(goBackToCalendar)} <SleepLogger selectedDateLog={selectedDateLog} onUpdateLog={updateLog} goBack={goBackToCalendar} /></>;
      case 'exercise-library': return <>{backButton(goBackToExercises)} <ExerciseLibrary exercises={customExercises} setExercises={setCustomExercises} allLogs={logs} /></>;
      case 'sets': return <>{backButton(goBackToExercises)} <SetsListView sets={exerciseSets} setView={setView} setSelectedSetId={setSelectedSetId} onDelete={handleDeleteSet} /></>;
      case 'set-form': return <>{backButton(goBackToSets)} <SetFormView onSave={handleSaveSet} goBack={goBackToSets} customExercises={customExercises} setToEdit={setToEdit} /></>;
      case 'check-ins': return <>{backButton(goBackToCalendar)} <CheckInsView checkIns={checkIns} setView={setView} setSelectedCheckInId={setSelectedCheckInId} onDelete={handleDeleteCheckIn} /></>;
      case 'check-in-form': return <>{backButton(checkInToEdit ? goBackToCheckIns : goBackToCalendar)} <CheckInFormView onSave={handleSaveCheckIn} goBack={checkInToEdit ? goBackToCheckIns : goBackToCalendar} date={selectedDate} checkInToEdit={checkInToEdit} /></>;
      case 'check-in-detail': return <>{backButton(goBackToCheckIns)} <CheckInDetailView checkIn={checkInToView} goBack={goBackToCheckIns} /></>;
      case 'map': return <MapView selectedDateLog={selectedDateLog} onUpdateLog={updateLog} setView={setView} setSelectedActivityId={setSelectedActivityId} />;
      case 'activity-summary': return <>{backButton(goBackToCalendar)} <ActivitySummaryView activity={activityToView} goBack={goBackToCalendar} userSettings={userSettings} /></>;
      case 'habits': return <>{backButton(goBackToCalendar)}<HabitsLibraryView setView={setView} /></>;
      case 'reading-library': return <>{backButton(goBackToHabits)}<ReadingLibraryView books={books} allLogs={logs} setView={setView} setSelectedBookId={setSelectedBookId} onDelete={handleDeleteBook} /></>;
      case 'book-form': return <>{backButton(goBackToReadingLibrary)}<BookFormView onSave={handleSaveBook} goBack={goBackToReadingLibrary} bookToEdit={bookToEdit} /></>;
      default: return <HomeView todayLog={todayLog} userSettings={userSettings} setView={setView} />;
    }
  };
  
  const showBottomNav = ![
    'map', 'activity-summary', 'set-form', 'check-in-form', 'book-form',
  ].includes(view);

  return (
    <div className="bg-bg-base dark:bg-dark-bg-base min-h-screen text-text-base dark:text-dark-text-base font-sans">
      <main className="max-w-md mx-auto p-4 pb-24">
        {renderView()}
      </main>
      {showBottomNav && <BottomNav currentView={view} setView={setView} />}
      {habitToLog && <LogHabitModal habitToLog={habitToLog} selectedDate={selectedDate} onClose={() => setHabitToLog(null)} onUpdateLog={updateLog} selectedDateLog={selectedDateLog} books={books} />}
    </div>
  );
}

export default App;
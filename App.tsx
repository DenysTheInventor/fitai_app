import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DailyLog, View, CustomExercise, UserSettings, AppData, CheckIn } from './types';
import { ActivityType } from './types';
import BottomNav from './components/BottomNav';
import WorkoutLogger from './components/WorkoutLogger';
import NutritionLogger from './components/NutritionLogger';
import AnalysisDashboard from './components/AnalysisDashboard';
import CalendarView from './components/CalendarView';
import ExerciseLibrary from './components/ExerciseLibrary';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import HomeView from './components/HomeView';
import SleepLogger from './components/SleepLogger';
import CheckInFormView from './components/CheckInFormView';
import CheckInsView from './components/CheckInsView';
import CheckInDetailView from './components/CheckInDetailView';
import { UserCircleIcon, ChevronLeftIcon } from './constants';

const initialSettings: UserSettings = { 
    name: 'User', 
    photo: null,
    weight: null,
    height: null,
    age: null,
    gender: null,
    goal: null,
    bio: '',
    lastBackupDate: null
};

function App() {
  const [viewHistory, setViewHistory] = useState<View[]>(['home']);
  const view = viewHistory[viewHistory.length - 1];

  const [logs, setLogs] = useLocalStorage<DailyLog[]>('fitai-logs', []);
  const [customExercises, setCustomExercises] = useLocalStorage<CustomExercise[]>('fitai-exercises', []);
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('fitai-settings', initialSettings);
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>('fitai-checkins', []);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  
  const setView = (newView: View, options?: { replace?: boolean }) => {
    setViewHistory(prev => {
        if (options?.replace) {
            return [...prev.slice(0, -1), newView];
        }
        return [...prev, newView];
    });
  };

  const goBack = () => {
      if (viewHistory.length > 1) {
          setViewHistory(prev => prev.slice(0, -1));
      }
  };

  const [historyFilters, setHistoryFilters] = useState<{
    dateFrom: string;
    dateTo: string;
    activityTypes: ActivityType[];
  }>({ dateFrom: '', dateTo: '', activityTypes: [] });

  const getLogForDate = (date: string): DailyLog => {
    return logs.find(log => log.date === date) || { date, workouts: [], nutrition: null, sleep: null };
  };

  const updateLogForDate = (updatedLog: DailyLog) => {
    const otherLogs = logs.filter(log => log.date !== updatedLog.date);
    const finalLog = (updatedLog.workouts.length === 0 && updatedLog.nutrition === null && updatedLog.sleep === null)
        ? []
        : [updatedLog];

    setLogs([...otherLogs, ...finalLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const handleSaveCheckIn = (checkIn: CheckIn | Omit<CheckIn, 'id' | 'date'> & {date: string}) => {
    if ('id' in checkIn) { // Update existing
      setCheckIns(prev => prev.map(ci => ci.id === checkIn.id ? checkIn : ci).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else { // Create new
      const checkInWithId: CheckIn = { ...checkIn, id: new Date().toISOString() };
      setCheckIns(prev => [...prev, checkInWithId].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    goBack();
  };
  
  const handleDeleteCheckIn = (id: string) => {
    if(window.confirm("Are you sure you want to delete this check-in? This action cannot be undone.")) {
      setCheckIns(prev => prev.filter(ci => ci.id !== id));
    }
  };


  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.date);
      if (historyFilters.dateFrom && logDate < new Date(historyFilters.dateFrom)) return false;
      if (historyFilters.dateTo && logDate > new Date(historyFilters.dateTo)) return false;
      if (historyFilters.activityTypes.length > 0) {
        const hasActivity = log.workouts.some(w => historyFilters.activityTypes.includes(w.type));
        if (!hasActivity) return false;
      }
      return true;
    });
  }, [logs, historyFilters]);

  const handleImportData = (data: AppData) => {
    setLogs(data.logs);
    setCustomExercises(data.customExercises);
    setUserSettings(data.userSettings);
    setCheckIns(data.checkIns || []);
  }

  const renderView = () => {
    const today = new Date().toISOString().split('T')[0];
    const logForSelectedDate = getLogForDate(selectedDate);
    
    switch (view) {
      case 'home':
        return <HomeView todayLog={getLogForDate(today)} allLogs={logs} setView={setView} setSelectedDate={setSelectedDate} checkIns={checkIns} />;
      case 'calendar':
        return <CalendarView logs={logs} checkIns={checkIns} setSelectedDate={setSelectedDate} setView={setView} setSelectedCheckInId={setSelectedCheckInId} />;
      case 'routine':
        return <WorkoutLogger selectedDateLog={logForSelectedDate} onUpdateLog={updateLogForDate} customExercises={customExercises} />;
      case 'nutrition':
        return <NutritionLogger selectedDateLog={logForSelectedDate} onUpdateLog={updateLogForDate} goBack={goBack} />;
      case 'sleep':
        return <SleepLogger selectedDateLog={logForSelectedDate} onUpdateLog={updateLogForDate} goBack={goBack} />;
      case 'history':
        return <HistoryView logs={filteredLogs} filters={historyFilters} setFilters={setHistoryFilters} />;
      case 'exercises':
        return <ExerciseLibrary exercises={customExercises} setExercises={setCustomExercises} />;
      case 'analysis':
        return <AnalysisDashboard allLogs={logs} userSettings={userSettings} checkIns={checkIns} />;
      case 'settings':
        const appData: AppData = { logs, customExercises, userSettings, checkIns };
        return <SettingsView settings={userSettings} setSettings={setUserSettings} appData={appData} onImport={handleImportData} />;
      case 'check-in-form':
        const checkInToEdit = checkIns.find(ci => ci.id === selectedCheckInId);
        return <CheckInFormView onSave={handleSaveCheckIn} goBack={goBack} date={selectedDate} checkInToEdit={checkInToEdit} />;
      case 'check-ins':
        return <CheckInsView checkIns={checkIns} setView={setView} setSelectedCheckInId={setSelectedCheckInId} onDelete={handleDeleteCheckIn} />;
      case 'check-in-detail':
        const selectedCheckIn = checkIns.find(ci => ci.id === selectedCheckInId);
        return <CheckInDetailView checkIn={selectedCheckIn} goBack={goBack} />;
      default:
        return <HomeView todayLog={getLogForDate(today)} allLogs={logs} setView={setView} setSelectedDate={setSelectedDate} checkIns={checkIns} />;
    }
  };

  const getHeaderText = () => {
    switch(view) {
        case 'home': return `Hello, ${userSettings.name}!`;
        case 'routine':
        case 'nutrition':
        case 'sleep':
            const date = new Date(`${selectedDate}T00:00:00`);
            const isToday = selectedDate === new Date().toISOString().split('T')[0];
            return isToday ? 'Today\'s Log' : date.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
        case 'calendar': return 'Calendar';
        case 'history': return 'Log History';
        case 'exercises': return 'Exercise Library';
        case 'analysis': return 'AI Analysis';
        case 'settings': return 'Settings';
        case 'check-ins': return 'Check-in History';
        case 'check-in-form':
            const checkInToEdit = checkIns.find(ci => ci.id === selectedCheckInId);
            const formDate = checkInToEdit ? checkInToEdit.date : selectedDate;
            const titlePrefix = checkInToEdit ? 'Edit Check-in' : 'New Check-in';
            return `${titlePrefix} for ${new Date(formDate+'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
        case 'check-in-detail': 
            const checkIn = checkIns.find(ci => ci.id === selectedCheckInId);
            return checkIn ? `Check-in: ${new Date(checkIn.date+'T00:00:00').toLocaleDateString()}` : 'Check-in Details';
        default: return 'FitAI Coach'
    }
  }
  
  const mainViews: View[] = ['home', 'calendar', 'history', 'exercises', 'analysis'];
  const showBackButton = !mainViews.includes(view);
  const showProfileButton = !showBackButton;

  return (
    <div className="bg-dark-bg text-dark-text font-sans min-h-screen flex flex-col antialiased">
      <header className="p-4 text-center sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-lg border-b border-white/10">
         <div className="flex items-center justify-between">
            <div className="w-10">
              {showBackButton && (
                <button onClick={goBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-dark-surface transition-colors" aria-label="Go back">
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
              )}
            </div>
            <h1 className="text-xl font-bold text-dark-text">{getHeaderText()}</h1>
            <div className="w-10">
              {showProfileButton && (
                <button onClick={() => setView('settings')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-dark-surface transition-colors" aria-label="Settings">
                    {userSettings.photo ? (
                        <img src={userSettings.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-8 h-8 text-dark-text-secondary" />
                    )}
                </button>
              )}
            </div>
         </div>
      </header>
      
      <main className="flex-grow p-4 pb-28">
        {renderView()}
      </main>
      
      <BottomNav currentView={view} setView={setView} />
    </div>
  );
}

export default App;
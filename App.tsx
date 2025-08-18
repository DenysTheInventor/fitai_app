import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DailyLog, View, CustomExercise, UserSettings, AppData } from './types';
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
import { UserCircleIcon } from './constants';

const initialSettings: UserSettings = { 
    name: 'User', 
    photo: null,
    weight: null,
    height: null,
    age: null,
    goal: null,
    bio: '',
    lastBackupDate: null
};

function App() {
  const [view, setView] = useState<View>('home');
  const [logs, setLogs] = useLocalStorage<DailyLog[]>('fitai-logs', []);
  const [customExercises, setCustomExercises] = useLocalStorage<CustomExercise[]>('fitai-exercises', []);
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('fitai-settings', initialSettings);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
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
  }

  const renderView = () => {
    const today = new Date().toISOString().split('T')[0];
    const logForSelectedDate = getLogForDate(selectedDate);
    
    switch (view) {
      case 'home':
        return <HomeView todayLog={getLogForDate(today)} allLogs={logs} setView={setView} setSelectedDate={setSelectedDate} />;
      case 'calendar':
        return <CalendarView logs={logs} setSelectedDate={setSelectedDate} setView={setView} />;
      case 'routine':
        return <WorkoutLogger selectedDateLog={logForSelectedDate} onUpdateLog={updateLogForDate} customExercises={customExercises} />;
      case 'nutrition':
        return <NutritionLogger selectedDateLog={logForSelectedDate} onUpdateLog={updateLogForDate} setView={setView} />;
      case 'sleep':
        return <SleepLogger selectedDateLog={logForSelectedDate} onUpdateLog={updateLogForDate} setView={setView} />;
      case 'history':
        return <HistoryView logs={filteredLogs} filters={historyFilters} setFilters={setHistoryFilters} />;
      case 'exercises':
        return <ExerciseLibrary exercises={customExercises} setExercises={setCustomExercises} />;
      case 'analysis':
        return <AnalysisDashboard allLogs={logs} userSettings={userSettings} />;
      case 'settings':
        const appData: AppData = { logs, customExercises, userSettings };
        return <SettingsView settings={userSettings} setSettings={setUserSettings} appData={appData} onImport={handleImportData} />;
      default:
        return <HomeView todayLog={getLogForDate(today)} allLogs={logs} setView={setView} setSelectedDate={setSelectedDate} />;
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
        default: return 'FitAI Coach'
    }
  }

  return (
    <div className="bg-dark-bg text-dark-text font-sans min-h-screen flex flex-col antialiased">
      <header className="p-4 text-center sticky top-0 z-40 bg-dark-bg/90 backdrop-blur-lg border-b border-white/10">
         <div className="flex items-center justify-between">
            <div className="w-10"></div>
            <h1 className="text-xl font-bold text-dark-text">{getHeaderText()}</h1>
            <button onClick={() => setView('settings')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-dark-surface transition-colors" aria-label="Settings">
                {userSettings.photo ? (
                    <img src={userSettings.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <UserCircleIcon className="w-8 h-8 text-dark-text-secondary" />
                )}
            </button>
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
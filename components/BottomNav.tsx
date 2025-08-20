import React from 'react';
import type { View } from '../types';
import { HomeIcon, CalendarIcon, ListBulletIcon, SparklesIcon, DumbbellIcon } from '../constants';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-brand-primary';
  const inactiveClasses = 'text-dark-text-secondary hover:text-dark-text';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-full p-2 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={label}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const isActivityView = currentView === 'routine' || currentView === 'nutrition';
  const isExerciseView = ['exercises', 'exercise-library', 'sets', 'set-form'].includes(currentView);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-dark-surface/80 backdrop-blur-lg border-t border-white/10 z-50">
      <nav className="flex justify-around items-center h-full max-w-md mx-auto">
        <NavButton
          label="Home"
          icon={<HomeIcon className="w-6 h-6" />}
          isActive={currentView === 'home'}
          onClick={() => setView('home')}
        />
        <NavButton
          label="Calendar"
          icon={<CalendarIcon className="w-6 h-6" />}
          isActive={currentView === 'calendar' || isActivityView}
          onClick={() => setView('calendar')}
        />
         <NavButton
          label="History"
          icon={<ListBulletIcon className="w-6 h-6" />}
          isActive={currentView === 'history'}
          onClick={() => setView('history')}
        />
        <NavButton
          label="Exercises"
          icon={<DumbbellIcon className="w-6 h-6" />}
          isActive={isExerciseView}
          onClick={() => setView('exercises')}
        />
        <NavButton
          label="Analysis"
          icon={<SparklesIcon className="w-6 h-6" />}
          isActive={currentView === 'analysis'}
          onClick={() => setView('analysis')}
        />
      </nav>
    </footer>
  );
};

export default BottomNav;


import React from 'react';
import type { View } from '../types';
import { BookOpenIcon } from '../constants';

interface HabitsLibraryViewProps {
  setView: (view: View) => void;
}

const HubCard: React.FC<{label: string, icon: React.ReactNode, onClick: () => void}> = ({label, icon, onClick}) => (
    <div onClick={onClick} className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg text-center cursor-pointer hover:bg-card-hover dark:hover:bg-dark-card transition-colors">
        <div className="w-16 h-16 mx-auto text-primary dark:text-dark-primary flex items-center justify-center">{icon}</div>
        <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base mt-4">{label}</h3>
    </div>
);

const HabitsLibraryView: React.FC<HabitsLibraryViewProps> = ({ setView }) => {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-base dark:text-dark-text-base">Habits</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HubCard label="Reading Library" icon={<BookOpenIcon className="w-12 h-12" />} onClick={() => setView('reading-library')} />
            {/* Future habits can be added here */}
        </div>
    </div>
  );
};

export default HabitsLibraryView;

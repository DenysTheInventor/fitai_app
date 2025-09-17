
import React from 'react';
import type { DailyLog } from '../types';
import { DumbbellIcon, ForkKnifeIcon, MoonIcon, CheckBadgeIcon } from '../constants'; 

interface HistoryViewProps {
  allLogs: DailyLog[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ allLogs }) => {
  const sortedLogs = [...allLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedLogs.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg">
        <p className="text-text-secondary dark:text-dark-text-secondary">No history found.</p>
        <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Start logging your activities to see your history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-base dark:text-dark-text-base">Activity History</h1>
      {sortedLogs.map(log => (
        <div key={log.date} className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow-sm">
          <h2 className="font-bold text-lg text-text-base dark:text-dark-text-base">{new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
          <div className="mt-3 space-y-2 text-sm text-text-secondary dark:text-dark-text-secondary">
            {log.workouts.length > 0 && (
              <div className="flex items-start gap-3">
                <DumbbellIcon className="w-5 h-5 text-secondary dark:text-dark-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-text-base dark:text-dark-text-base">Workouts</p>
                  <ul className="list-disc list-inside">
                    {log.workouts.map(w => <li key={w.id}>{w.name}</li>)}
                  </ul>
                </div>
              </div>
            )}
            {log.nutrition && (
              <div className="flex items-center gap-3">
                <ForkKnifeIcon className="w-5 h-5 text-primary dark:text-dark-primary flex-shrink-0" />
                <p><span className="font-semibold text-text-base dark:text-dark-text-base">Nutrition:</span> {log.nutrition.calories} kcal</p>
              </div>
            )}
            {log.sleep && (
              <div className="flex items-center gap-3">
                <MoonIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p><span className="font-semibold text-text-base dark:text-dark-text-base">Sleep:</span> {log.sleep.durationHours} hours</p>
              </div>
            )}
            {log.habits && log.habits.length > 0 && (
                <div className="flex items-start gap-3">
                    <CheckBadgeIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                     <div>
                        <p className="font-semibold text-text-base dark:text-dark-text-base">Habits</p>
                        <ul className="list-disc list-inside">
                            {log.habits.map(h => <li key={h.id}>{h.type} ({h.durationMinutes} min)</li>)}
                        </ul>
                    </div>
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryView;

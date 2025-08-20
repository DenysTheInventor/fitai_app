import React, { useState } from 'react';
import type { DailyLog, WorkoutActivity } from '../types';
import { ActivityType } from '../types';
import { FilterIcon, DumbbellIcon, ForkKnifeIcon, MoonIcon, TrashIcon } from '../constants';

interface HistoryViewProps {
  logs: DailyLog[];
  filters: { dateFrom: string; dateTo: string; activityTypes: ActivityType[] };
  setFilters: React.Dispatch<React.SetStateAction<{ dateFrom: string; dateTo: string; activityTypes: ActivityType[] }>>;
  onUpdateLog: (updatedLog: DailyLog) => void;
}

const FilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    filters: { dateFrom: string; dateTo: string; activityTypes: ActivityType[] };
    onApply: (newFilters: { dateFrom: string; dateTo: string; activityTypes: ActivityType[] }) => void;
}> = ({ isOpen, onClose, filters, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleTypeToggle = (type: ActivityType) => {
        const newTypes = localFilters.activityTypes.includes(type)
            ? localFilters.activityTypes.filter(t => t !== type)
            : [...localFilters.activityTypes, type];
        setLocalFilters({ ...localFilters, activityTypes: newTypes });
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-white">Filter History</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Date From</label>
                        <input type="date" value={localFilters.dateFrom} onChange={e => setLocalFilters({...localFilters, dateFrom: e.target.value})} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Date To</label>
                        <input type="date" value={localFilters.dateTo} onChange={e => setLocalFilters({...localFilters, dateTo: e.target.value})} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Workout Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {Object.values(ActivityType).map(type => (
                                <button key={type} onClick={() => handleTypeToggle(type)} className={`px-3 py-1 text-sm rounded-full border transition-colors ${localFilters.activityTypes.includes(type) ? 'bg-brand-secondary border-brand-secondary text-white' : 'bg-dark-card border-white/20 text-dark-text-secondary'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-dark-card text-dark-text hover:bg-white/10 transition-colors">Cancel</button>
                    <button onClick={handleApply} className="px-4 py-2 rounded-md bg-brand-primary text-dark-bg font-semibold hover:opacity-90 transition-opacity">Apply Filters</button>
                </div>
            </div>
        </div>
    );
};

const HistoryView: React.FC<HistoryViewProps> = ({ logs, filters, setFilters, onUpdateLog }) => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(`${dateString}T00:00:00`);
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    const handleDeleteSleep = (log: DailyLog) => {
        if (window.confirm("Are you sure you want to remove the sleep log for this day?")) {
            onUpdateLog({ ...log, sleep: null });
        }
    };
    
    const handleDeleteNutrition = (log: DailyLog) => {
        if (window.confirm("Are you sure you want to remove the nutrition log for this day?")) {
            onUpdateLog({ ...log, nutrition: null });
        }
    };
    
    const handleDeleteWorkout = (log: DailyLog, workoutId: string) => {
        if (window.confirm("Are you sure you want to remove this workout?")) {
            onUpdateLog({ ...log, workouts: log.workouts.filter(w => w.id !== workoutId) });
        }
    };

    return (
        <div className="space-y-4">
            {logs.length > 0 ? (
                logs.map(log => (
                    <div key={log.date} className="bg-dark-surface rounded-lg p-4">
                        <h3 className="font-bold text-white mb-3">{formatDate(log.date)}</h3>
                        <div className="space-y-3">
                             {log.sleep && (
                                <div className="bg-dark-card p-3 rounded-md flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MoonIcon className="w-5 h-5 text-blue-400" />
                                            <h4 className="font-semibold text-dark-text">Sleep</h4>
                                        </div>
                                        <p className="text-sm text-dark-text-secondary pl-7">
                                            {log.sleep.durationHours} hours
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteSleep(log)} className="text-dark-text-secondary hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            )}
                            {log.workouts.length > 0 && (
                                <div className="bg-dark-card p-3 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DumbbellIcon className="w-5 h-5 text-brand-secondary" />
                                        <h4 className="font-semibold text-dark-text">Workouts</h4>
                                    </div>
                                    <ul className="space-y-2 text-sm text-dark-text-secondary pl-7">
                                        {log.workouts.map(w => (
                                            <li key={w.id} className="flex justify-between items-center">
                                                - {w.name}
                                                <button onClick={() => handleDeleteWorkout(log, w.id)} className="text-dark-text-secondary hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {log.nutrition && (
                                <div className="bg-dark-card p-3 rounded-md flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <ForkKnifeIcon className="w-5 h-5 text-brand-primary" />
                                            <h4 className="font-semibold text-dark-text">Nutrition</h4>
                                        </div>
                                        <p className="text-sm text-dark-text-secondary pl-7">
                                            {log.nutrition.calories} kcal, {log.nutrition.protein}g P, {log.nutrition.carbs}g C, {log.nutrition.fats}g F
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteNutrition(log)} className="text-dark-text-secondary hover:text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 px-4 bg-dark-surface rounded-lg">
                    <p className="text-dark-text-secondary">No logs found.</p>
                    <p className="text-dark-text-secondary text-sm">Try adjusting your filters or add some new logs!</p>
                </div>
            )}

            <button onClick={() => setIsFilterModalOpen(true)} className="fixed bottom-24 right-4 bg-brand-secondary rounded-full p-4 shadow-lg hover:scale-105 transition-transform z-40" aria-label="Filter history">
                <FilterIcon className="w-8 h-8 text-white"/>
            </button>
            
            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} filters={filters} onApply={setFilters} />
        </div>
    );
};

export default HistoryView;

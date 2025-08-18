import React, { useState } from 'react';
import type { DailyLog, WorkoutActivity, Set, CustomExercise } from '../types';
import { ActivityType } from '../types';
import { PlusIcon, TrashIcon } from '../constants';

interface WorkoutLoggerProps {
  selectedDateLog: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
  customExercises: CustomExercise[];
}

const WorkoutCard: React.FC<{ activity: WorkoutActivity, onDelete: () => void }> = ({ activity, onDelete }) => {
    return (
        <div className="bg-dark-card p-4 rounded-lg shadow-md relative">
            <button onClick={onDelete} className="absolute top-2 right-2 text-dark-text-secondary hover:text-red-500 transition-colors">
                <TrashIcon className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-brand-primary mb-2">{activity.name}</h3>
            {activity.type === ActivityType.WeightLifting && (
                <ul className="space-y-1 text-sm">
                    {activity.sets.map((set, index) => (
                        <li key={index} className="flex justify-between">
                            <span>Set {index + 1}</span>
                            <span className="text-dark-text-secondary">{set.reps} reps @ {set.weight} kg</span>
                        </li>
                    ))}
                </ul>
            )}
            {(activity.type === ActivityType.Cardio || activity.type === ActivityType.Sport) && (
                 <p className="text-dark-text-secondary">{activity.durationMinutes} minutes {activity.type === ActivityType.Cardio && activity.distanceKm ? ` / ${activity.distanceKm} km` : ''}</p>
            )}
        </div>
    );
};


const AddWorkoutModal: React.FC<{onClose: () => void; onAdd: (activity: WorkoutActivity) => void; customExercises: CustomExercise[]}> = ({ onClose, onAdd, customExercises }) => {
    const [activityType, setActivityType] = useState<ActivityType>(ActivityType.WeightLifting);
    const [name, setName] = useState('');
    const [sets, setSets] = useState<Set[]>([{ reps: 8, weight: 20 }]);
    const [duration, setDuration] = useState(30);
    const [distance, setDistance] = useState(5);

    const addSet = () => setSets([...sets, { reps: 8, weight: 20 }]);
    const updateSet = <K extends keyof Set>(index: number, field: K, value: Set[K]) => {
        const newSets = [...sets];
        newSets[index][field] = value;
        setSets(newSets);
    };

    const handleSubmit = () => {
        if (!name) return;
        let newActivity: WorkoutActivity;
        const id = new Date().toISOString();

        switch (activityType) {
            case ActivityType.WeightLifting:
                newActivity = { id, name, type: ActivityType.WeightLifting, sets };
                break;
            case ActivityType.Cardio:
                newActivity = { id, name, type: ActivityType.Cardio, durationMinutes: duration, distanceKm: distance };
                break;
            case ActivityType.Sport:
                newActivity = { id, name, type: ActivityType.Sport, durationMinutes: duration };
                break;
        }
        onAdd(newActivity);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-white">Add New Workout</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Activity Type</label>
                    <select value={activityType} onChange={e => setActivityType(e.target.value as ActivityType)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary">
                        <option value={ActivityType.WeightLifting}>Weight Lifting</option>
                        <option value={ActivityType.Cardio}>Cardio</option>
                        <option value={ActivityType.Sport}>Sport</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Name</label>
                    {activityType === ActivityType.WeightLifting ? (
                        <>
                            <select value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary">
                                <option value="" disabled>Select an exercise</option>
                                {customExercises.map(ex => (
                                    <option key={ex.id} value={ex.name}>{ex.name}</option>
                                ))}
                            </select>
                            {customExercises.length === 0 && (
                                <p className="text-xs text-dark-text-secondary mt-1">No exercises found. Add some in the 'Exercises' tab.</p>
                            )}
                        </>
                    ) : (
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={activityType === ActivityType.Cardio ? "e.g., Treadmill Run" : "e.g., Football"} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary" />
                    )}
                </div>
                
                {activityType === ActivityType.WeightLifting && (
                   <div className="space-y-2">
                     <div className="flex gap-2 items-center text-sm text-dark-text-secondary">
                        <label className="w-full">Reps</label>
                        <label className="w-full">Weight (kg)</label>
                     </div>
                     {sets.map((set, i) => (
                        <div key={i} className="flex gap-2 items-center">
                           <input type="number" value={set.reps} onChange={e => updateSet(i, 'reps', +e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text" placeholder="Reps" />
                           <input type="number" value={set.weight} onChange={e => updateSet(i, 'weight', +e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text" placeholder="Weight (kg)" />
                        </div>
                     ))}
                     <button onClick={addSet} className="text-sm text-brand-primary hover:underline">Add Set</button>
                   </div>
                )}
                
                {(activityType === ActivityType.Cardio || activityType === ActivityType.Sport) && (
                   <div className="flex gap-2">
                      <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text" placeholder="Duration (min)" />
                      {activityType === ActivityType.Cardio && (
                         <input type="number" value={distance} onChange={e => setDistance(+e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text" placeholder="Distance (km)" />
                      )}
                   </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-dark-card text-dark-text hover:bg-white/10 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-brand-primary text-dark-bg font-semibold hover:opacity-90 transition-opacity">Add Activity</button>
                </div>
            </div>
        </div>
    )
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ selectedDateLog, onUpdateLog, customExercises }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const addActivity = (activity: WorkoutActivity) => {
        const updatedLog = { ...selectedDateLog, workouts: [...selectedDateLog.workouts, activity] };
        onUpdateLog(updatedLog);
    };

    const deleteActivity = (id: string) => {
        const updatedWorkouts = selectedDateLog.workouts.filter(w => w.id !== id);
        onUpdateLog({ ...selectedDateLog, workouts: updatedWorkouts });
    };

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-semibold text-white">Workout Routine</h2>
             {selectedDateLog.workouts.length > 0 ? (
                <div className="space-y-3">
                    {selectedDateLog.workouts.map((activity) => (
                        <WorkoutCard key={activity.id} activity={activity} onDelete={() => deleteActivity(activity.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 bg-dark-surface rounded-lg">
                    <p className="text-dark-text-secondary">No workouts logged for this day.</p>
                    <p className="text-dark-text-secondary text-sm">Tap the button below to add one.</p>
                </div>
            )}
             
             <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-4 bg-brand-secondary rounded-full p-4 shadow-lg hover:scale-105 transition-transform">
                <PlusIcon className="w-8 h-8 text-white"/>
             </button>

             {isModalOpen && <AddWorkoutModal onClose={() => setIsModalOpen(false)} onAdd={addActivity} customExercises={customExercises}/>}
        </div>
    );
};

export default WorkoutLogger;
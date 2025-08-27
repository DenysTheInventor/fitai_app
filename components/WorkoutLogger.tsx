import React, { useState, useMemo, useEffect } from 'react';
import type { DailyLog, WorkoutActivity, Set, CustomExercise, ExerciseSet } from '../types';
import { ActivityType } from '../types';
import { PlusIcon, TrashIcon } from '../constants';

interface WorkoutLoggerProps {
  selectedDateLog: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
  customExercises: CustomExercise[];
  allLogs: DailyLog[];
  exerciseSets: ExerciseSet[];
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
            {activity.type === ActivityType.Cardio && (
                 <p className="text-dark-text-secondary">{activity.steps} steps</p>
            )}
            {activity.type === ActivityType.Sport && (
                 <p className="text-dark-text-secondary">{activity.durationMinutes} minutes</p>
            )}
        </div>
    );
};

const findLastPerformance = (exerciseName: string, allLogs: DailyLog[], currentDate: string): Set[] | null => {
    const currentJsDate = new Date(currentDate + 'T00:00:00');
    
    // Filter logs to be strictly before the current date
    const pastLogs = allLogs.filter(log => new Date(log.date + 'T00:00:00') < currentJsDate);

    // Sort past logs in descending order to find the most recent one first
    const sortedLogs = pastLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const log of sortedLogs) {
        for (const workout of log.workouts) {
            if (workout.name === exerciseName && workout.type === ActivityType.WeightLifting) {
                return workout.sets;
            }
        }
    }
    return null;
};


const AddWorkoutModal: React.FC<{
    onClose: () => void; 
    onAdd: (activity: WorkoutActivity[]) => void; 
    customExercises: CustomExercise[];
    allLogs: DailyLog[];
    exerciseSets: ExerciseSet[];
    selectedDate: string;
}> = ({ onClose, onAdd, customExercises, allLogs, exerciseSets, selectedDate }) => {
    const [logMode, setLogMode] = useState<'single' | 'set'>('single');
    
    // State for single exercise
    const [activityType, setActivityType] = useState<ActivityType>(ActivityType.WeightLifting);
    const [name, setName] = useState('');
    const [singleExSets, setSingleExSets] = useState<Set[]>([{ reps: 8, weight: 20 }]);
    const [duration, setDuration] = useState(30);
    const [steps, setSteps] = useState(10000);

    // State for set logging
    const [selectedSetId, setSelectedSetId] = useState<string>('');
    const [setPerformances, setSetPerformances] = useState<Record<string, Set[]>>({});

    const selectedSet = useMemo(() => exerciseSets.find(s => s.id === selectedSetId), [selectedSetId, exerciseSets]);
    const exercisesInSet = useMemo(() => {
        return selectedSet?.exerciseIds.map(id => customExercises.find(ex => ex.id === id)).filter(Boolean) as CustomExercise[] || [];
    }, [selectedSet, customExercises]);
    
    const lastPerformance = useMemo(() => {
        if (logMode === 'single' && activityType === ActivityType.WeightLifting && name) {
            return findLastPerformance(name, allLogs, selectedDate);
        }
        return null;
    }, [name, activityType, allLogs, logMode, selectedDate]);

    useEffect(() => {
        if (activityType === ActivityType.WeightLifting) {
            setName(customExercises.length > 0 ? customExercises[0].name : '');
        } else {
            setName('');
        }
    }, [activityType, customExercises]);


    const handleActivityTypeChange = (newType: ActivityType) => {
        setActivityType(newType);
    };

    const handleSetSelection = (setId: string) => {
        setSelectedSetId(setId);
        const set = exerciseSets.find(s => s.id === setId);
        if (set) {
            const initialPerformances: Record<string, Set[]> = {};
            set.exerciseIds.forEach(exId => {
                initialPerformances[exId] = [{ reps: 8, weight: 20 }];
            });
            setSetPerformances(initialPerformances);
        }
    };
    
    const updateSetPerformance = (exId: string, setIndex: number, field: keyof Set, value: number) => {
        const newPerformances = { ...setPerformances };
        newPerformances[exId][setIndex][field] = value;
        setSetPerformances(newPerformances);
    };

    const addSetToPerformance = (exId: string) => {
        const newPerformances = { ...setPerformances };
        newPerformances[exId].push({ reps: 8, weight: 20 });
        setSetPerformances(newPerformances);
    };

    const handleSubmit = () => {
        const newActivities: WorkoutActivity[] = [];
        const idBase = new Date().toISOString();

        if (logMode === 'single') {
            if (!name) {
                if (activityType === ActivityType.WeightLifting) {
                     alert("Please add an exercise to your library first.");
                } else {
                     alert("Please enter a name for the activity.");
                }
                return;
            }
            let newActivity: WorkoutActivity;
            switch (activityType) {
                case ActivityType.WeightLifting: newActivity = { id: idBase, name, type: ActivityType.WeightLifting, sets: singleExSets }; break;
                case ActivityType.Cardio: newActivity = { id: idBase, name, type: ActivityType.Cardio, steps }; break;
                case ActivityType.Sport: newActivity = { id: idBase, name, type: ActivityType.Sport, durationMinutes: duration }; break;
            }
            newActivities.push(newActivity);
        } else { // logMode === 'set'
            if (!selectedSet) return;
            exercisesInSet.forEach((ex, index) => {
                newActivities.push({
                    id: `${idBase}-${index}`,
                    name: ex.name,
                    type: ActivityType.WeightLifting,
                    sets: setPerformances[ex.id]
                });
            });
        }
        onAdd(newActivities);
        onClose();
    };

    const LastPerformanceHint: React.FC<{perf: Set[] | null}> = ({perf}) => {
        if (!perf || perf.length === 0) return null;
        const summary = `${perf.length} sets of ${perf[0].reps} reps @ ${perf[0].weight}kg`;
        return <p className="text-xs text-dark-text-secondary mt-1">Last: {summary}</p>;
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-white">Add New Workout</h2>
                
                <div className="flex gap-2 mb-4 bg-dark-card p-1 rounded-md">
                    <button onClick={() => setLogMode('single')} className={`w-full p-2 rounded text-sm font-semibold ${logMode === 'single' ? 'bg-brand-secondary text-white' : 'text-dark-text-secondary'}`}>Single Exercise</button>
                    <button onClick={() => setLogMode('set')} className={`w-full p-2 rounded text-sm font-semibold ${logMode === 'set' ? 'bg-brand-secondary text-white' : 'text-dark-text-secondary'}`}>From Set</button>
                </div>

                {logMode === 'single' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-1">Activity Type</label>
                            <select value={activityType} onChange={e => handleActivityTypeChange(e.target.value as ActivityType)} className="w-full bg-dark-card border border-white/20 rounded-md p-2">
                                <option value={ActivityType.WeightLifting}>Weight Lifting</option>
                                <option value={ActivityType.Cardio}>Cardio</option>
                                <option value={ActivityType.Sport}>Sport</option>
                            </select>
                        </div>

                        {activityType === ActivityType.WeightLifting ? (
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Exercise</label>
                                <select 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full bg-dark-card border border-white/20 rounded-md p-2"
                                    disabled={customExercises.length === 0}
                                >
                                    {customExercises.length > 0 ? 
                                        customExercises.map(ex => <option key={ex.id} value={ex.name}>{ex.name}</option>) :
                                        <option value="" disabled>Go to Exercises to add one</option>
                                    }
                                </select>
                                <LastPerformanceHint perf={lastPerformance} />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full bg-dark-card border border-white/20 rounded-md p-2" 
                                    placeholder={activityType === ActivityType.Cardio ? "e.g., Treadmill" : "e.g., Basketball"}
                                />
                            </div>
                        )}

                        {activityType === ActivityType.WeightLifting && (
                           <div className="space-y-2">
                             {singleExSets.map((set, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                   <input type="number" value={set.reps} onChange={e => setSingleExSets(s => s.map((x, j) => j === i ? {...x, reps: +e.target.value} : x))} className="w-full bg-dark-card border border-white/20 rounded-md p-2" placeholder="Reps" />
                                   <input type="number" value={set.weight} onChange={e => setSingleExSets(s => s.map((x, j) => j === i ? {...x, weight: +e.target.value} : x))} className="w-full bg-dark-card border border-white/20 rounded-md p-2" placeholder="Weight (kg)" />
                                </div>
                             ))}
                             <button onClick={() => setSingleExSets(s => [...s, {reps: 8, weight: 20}])} className="text-sm text-brand-primary hover:underline">Add Set</button>
                           </div>
                        )}
                        {activityType === ActivityType.Cardio && (
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Steps</label>
                                <input type="number" value={steps} onChange={e => setSteps(+e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2" placeholder="Steps" />
                            </div>
                        )}
                        {activityType === ActivityType.Sport && (
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Duration (Minutes)</label>
                                <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2" placeholder="Duration (mins)" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <select value={selectedSetId} onChange={e => handleSetSelection(e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2">
                            <option value="">Select a Set</option>
                            {exerciseSets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {selectedSet && exercisesInSet.map(ex => (
                            <div key={ex.id} className="bg-dark-card p-3 rounded-lg space-y-2">
                                <h4 className="font-semibold text-white">{ex.name}</h4>
                                <LastPerformanceHint perf={findLastPerformance(ex.name, allLogs, selectedDate)} />
                                {setPerformances[ex.id]?.map((set, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input type="number" value={set.reps} onChange={e => updateSetPerformance(ex.id, i, 'reps', +e.target.value)} className="w-full bg-dark-surface border border-white/20 rounded-md p-2" placeholder="Reps" />
                                        <input type="number" value={set.weight} onChange={e => updateSetPerformance(ex.id, i, 'weight', +e.target.value)} className="w-full bg-dark-surface border border-white/20 rounded-md p-2" placeholder="Weight (kg)" />
                                    </div>
                                ))}
                                <button onClick={() => addSetToPerformance(ex.id)} className="text-sm text-brand-primary hover:underline">Add Set</button>
                            </div>
                        ))}
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

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ selectedDateLog, onUpdateLog, customExercises, allLogs, exerciseSets }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const addActivity = (activities: WorkoutActivity[]) => {
        const updatedLog = { ...selectedDateLog, workouts: [...selectedDateLog.workouts, ...activities] };
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

             {isModalOpen && <AddWorkoutModal onClose={() => setIsModalOpen(false)} onAdd={addActivity} customExercises={customExercises} allLogs={allLogs} exerciseSets={exerciseSets} selectedDate={selectedDateLog.date} />}
        </div>
    );
};

export default WorkoutLogger;
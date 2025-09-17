import React, { useState, useMemo } from 'react';
import type { CustomExercise, DailyLog, Set } from '../types';
import { TrashIcon } from '../constants';

interface ExerciseLibraryProps {
  exercises: CustomExercise[];
  setExercises: React.Dispatch<React.SetStateAction<CustomExercise[]>>;
  allLogs: DailyLog[];
}

const ExerciseHistory: React.FC<{ exerciseName: string; allLogs: DailyLog[] }> = ({ exerciseName, allLogs }) => {
    const performances = useMemo(() => {
        const history: { date: string; sets: Set[] }[] = [];
        const sortedLogs = [...allLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        sortedLogs.forEach(log => {
            log.workouts.forEach(workout => {
                if (workout.name === exerciseName && workout.type === 'WeightLifting') {
                    history.push({ date: log.date, sets: workout.sets });
                }
            });
        });
        return history;
    }, [exerciseName, allLogs]);

    if (performances.length === 0) {
        return <div className="p-4 border-t border-border-base dark:border-dark-border-base text-center text-sm text-text-secondary dark:text-dark-text-secondary">No performance history found.</div>;
    }

    return (
        <div className="p-4 border-t border-border-base dark:border-dark-border-base space-y-3 max-h-60 overflow-y-auto">
            {performances.map((perf, index) => (
                <div key={index}>
                    <p className="font-semibold text-sm text-text-base dark:text-dark-text-base">{new Date(perf.date + 'T00:00:00').toLocaleDateString()}</p>
                    <ul className="text-xs list-disc list-inside ml-2 mt-1 text-text-secondary dark:text-dark-text-secondary">
                        {perf.sets.map((set, i) => <li key={i}>{set.reps} reps @ {set.weight} kg</li>)}
                    </ul>
                </div>
            ))}
        </div>
    );
};


const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ exercises, setExercises, allLogs }) => {
  const [newExerciseName, setNewExerciseName] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const handleToggleHistory = (id: string) => {
    setExpandedExerciseId(prevId => (prevId === id ? null : id));
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExerciseName.trim() === '') return;
    const newExercise: CustomExercise = {
      id: new Date().toISOString(),
      name: newExerciseName.trim(),
    };
    setExercises(prev => [...prev, newExercise].sort((a,b) => a.name.localeCompare(b.name)));
    setNewExerciseName('');
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-base dark:text-dark-text-base">My Exercises</h2>
      
      <form onSubmit={handleAddExercise} className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg flex gap-2">
        <input 
          type="text"
          value={newExerciseName}
          onChange={e => setNewExerciseName(e.target.value)}
          placeholder="e.g., Barbell Squats"
          className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
          aria-label="New exercise name"
        />
        <button 
          type="submit"
          className="bg-secondary dark:bg-dark-secondary text-white rounded-md p-2 px-4 font-semibold hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {exercises.length > 0 ? (
          exercises.map(ex => (
            <div key={ex.id} className="bg-card dark:bg-dark-card rounded-lg transition-shadow shadow-sm hover:shadow-md">
              <div
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => handleToggleHistory(ex.id)}
                  aria-expanded={expandedExerciseId === ex.id}
                  aria-controls={`history-${ex.id}`}
              >
                  <span className="font-medium text-text-base dark:text-dark-text-base">{ex.name}</span>
                  <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteExercise(ex.id); }} className="text-text-secondary dark:text-dark-text-secondary hover:text-danger" aria-label={`Delete ${ex.name}`}>
                          <TrashIcon className="w-5 h-5" />
                      </button>
                      <svg className={`w-5 h-5 text-text-secondary dark:text-dark-text-secondary transition-transform ${expandedExerciseId === ex.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                  </div>
              </div>
              {expandedExerciseId === ex.id && (
                  <div id={`history-${ex.id}`}>
                      <ExerciseHistory exerciseName={ex.name} allLogs={allLogs} />
                  </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg">
            <p className="text-text-secondary dark:text-dark-text-secondary">Your exercise library is empty.</p>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Add a new exercise above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
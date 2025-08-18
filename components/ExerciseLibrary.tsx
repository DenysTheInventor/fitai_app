import React, { useState } from 'react';
import type { CustomExercise } from '../types';
import { TrashIcon } from '../constants';

interface ExerciseLibraryProps {
  exercises: CustomExercise[];
  setExercises: React.Dispatch<React.SetStateAction<CustomExercise[]>>;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ exercises, setExercises }) => {
  const [newExerciseName, setNewExerciseName] = useState('');

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
      <h2 className="text-xl font-semibold text-white">My Exercises</h2>
      
      <form onSubmit={handleAddExercise} className="bg-dark-surface p-4 rounded-lg flex gap-2">
        <input 
          type="text"
          value={newExerciseName}
          onChange={e => setNewExerciseName(e.target.value)}
          placeholder="e.g., Barbell Squats"
          className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text focus:ring-brand-primary focus:border-brand-primary"
          aria-label="New exercise name"
        />
        <button 
          type="submit"
          className="bg-brand-secondary text-white rounded-md p-2 px-4 font-semibold hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {exercises.length > 0 ? (
          exercises.map(ex => (
            <div key={ex.id} className="bg-dark-card p-4 rounded-lg flex justify-between items-center">
              <span className="font-medium text-dark-text">{ex.name}</span>
              <button onClick={() => handleDeleteExercise(ex.id)} className="text-dark-text-secondary hover:text-red-500" aria-label={`Delete ${ex.name}`}>
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 px-4 bg-dark-surface rounded-lg">
            <p className="text-dark-text-secondary">Your exercise library is empty.</p>
            <p className="text-dark-text-secondary text-sm">Add a new exercise above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
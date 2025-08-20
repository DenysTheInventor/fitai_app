import React, { useState, useEffect } from 'react';
import type { ExerciseSet, CustomExercise } from '../types';
import { TrashIcon } from '../constants';

interface SetFormViewProps {
  onSave: (set: ExerciseSet | Omit<ExerciseSet, 'id'>) => void;
  goBack: () => void;
  customExercises: CustomExercise[];
  setToEdit?: ExerciseSet;
}

const SetFormView: React.FC<SetFormViewProps> = ({ onSave, goBack, customExercises, setToEdit }) => {
  const [name, setName] = useState('');
  const [exerciseIds, setExerciseIds] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    if (setToEdit) {
      setName(setToEdit.name);
      setExerciseIds(setToEdit.exerciseIds);
    }
  }, [setToEdit]);

  const handleAddExercise = () => {
    if (selectedExercise && !exerciseIds.includes(selectedExercise)) {
      setExerciseIds([...exerciseIds, selectedExercise]);
    }
    setSelectedExercise('');
  };

  const handleRemoveExercise = (id: string) => {
    setExerciseIds(exerciseIds.filter(exId => exId !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || exerciseIds.length === 0) {
      alert('Please provide a name and add at least one exercise.');
      return;
    }
    const setData = { name, exerciseIds };
    if (setToEdit) {
      onSave({ ...setData, id: setToEdit.id });
    } else {
      onSave(setData);
    }
  };
  
  const getExerciseName = (id: string) => customExercises.find(ex => ex.id === id)?.name || 'Unknown Exercise';

  const availableExercises = customExercises.filter(ex => !exerciseIds.includes(ex.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-dark-surface p-6 rounded-lg space-y-4">
        <div>
          <label htmlFor="setName" className="block text-sm font-medium text-dark-text-secondary mb-1">Set Name</label>
          <input id="setName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Push Day A" className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text" required />
        </div>
      </div>

      <div className="bg-dark-surface p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-white">Exercises in this Set</h3>
        <div className="flex gap-2">
            <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text">
                <option value="">{availableExercises.length > 0 ? 'Select an exercise to add' : 'No more exercises available'}</option>
                {availableExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
            <button type="button" onClick={handleAddExercise} disabled={!selectedExercise} className="bg-brand-secondary text-white rounded-md p-2 px-4 font-semibold hover:opacity-90 disabled:opacity-50">Add</button>
        </div>
        <div className="space-y-2">
            {exerciseIds.length > 0 ? exerciseIds.map(id => (
                <div key={id} className="bg-dark-card p-3 rounded-lg flex justify-between items-center">
                    <span>{getExerciseName(id)}</span>
                    <button type="button" onClick={() => handleRemoveExercise(id)} className="text-dark-text-secondary hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                </div>
            )) : <p className="text-sm text-center text-dark-text-secondary py-2">No exercises added yet.</p>}
        </div>
      </div>
      
      <div className="flex gap-4">
        <button type="button" onClick={goBack} className="w-full bg-dark-card text-dark-text font-bold py-3 rounded-md hover:bg-white/10">Cancel</button>
        <button type="submit" className="w-full bg-brand-primary text-dark-bg font-bold py-3 rounded-md hover:opacity-90">{setToEdit ? 'Update Set' : 'Save Set'}</button>
      </div>
    </form>
  );
};

export default SetFormView;

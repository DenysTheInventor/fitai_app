import React, { useState } from 'react';
import type { CustomHabit } from '../types';
import { TrashIcon } from '../constants';

interface HabitsLibraryViewProps {
  habits: CustomHabit[];
  setHabits: React.Dispatch<React.SetStateAction<CustomHabit[]>>;
}

const HabitsLibraryView: React.FC<HabitsLibraryViewProps> = ({ habits, setHabits }) => {
  const [newHabitName, setNewHabitName] = useState('');

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim() === '') return;
    const newHabit: CustomHabit = {
      id: new Date().toISOString(),
      name: newHabitName.trim(),
    };
    setHabits(prev => [...prev, newHabit].sort((a,b) => a.name.localeCompare(b.name)));
    setNewHabitName('');
  };

  const handleDeleteHabit = (id: string) => {
    if (window.confirm("Are you sure you want to delete this habit? All associated logs will remain but will be marked as 'Custom Habit'.")) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddHabit} className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg flex gap-2">
        <input 
          type="text"
          value={newHabitName}
          onChange={e => setNewHabitName(e.target.value)}
          placeholder="e.g., Meditate"
          className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary"
          aria-label="New habit name"
        />
        <button 
          type="submit"
          className="bg-secondary dark:bg-dark-secondary text-white rounded-md p-2 px-4 font-semibold hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </form>

      <div className="space-y-3">
        {habits.length > 0 ? (
          habits.map(habit => (
            <div key={habit.id} className="bg-card dark:bg-dark-card rounded-lg p-4 flex justify-between items-center">
              <span className="font-medium text-text-base dark:text-dark-text-base">{habit.name}</span>
              <button onClick={() => handleDeleteHabit(habit.id)} className="text-text-secondary dark:text-dark-text-secondary hover:text-danger" aria-label={`Delete ${habit.name}`}>
                  <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg">
            <p className="text-text-secondary dark:text-dark-text-secondary">Your habit library is empty.</p>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Add a new habit above to start tracking it.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitsLibraryView;
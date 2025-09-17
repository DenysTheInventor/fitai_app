import React from 'react';
import type { ExerciseSet, View } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../constants';

interface SetsListViewProps {
  sets: ExerciseSet[];
  setView: (view: View) => void;
  setSelectedSetId: (id: string | null) => void;
  onDelete: (id: string) => void;
}

const SetsListView: React.FC<SetsListViewProps> = ({ sets, setView, setSelectedSetId, onDelete }) => {
  const handleCreate = () => {
    setSelectedSetId(null);
    setView('set-form');
  };

  const handleEdit = (id: string) => {
    setSelectedSetId(id);
    setView('set-form');
  };

  return (
    <div className="space-y-4">
      {sets.length > 0 ? (
        sets.map(set => (
          <div key={set.id} className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg flex justify-between items-center">
            <span className="font-medium text-text-base dark:text-dark-text-base">{set.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(set.id)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-base dark:hover:text-dark-text-base" aria-label={`Edit ${set.name}`}>
                <PencilIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(set.id)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-danger" aria-label={`Delete ${set.name}`}>
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg">
          <p className="text-text-secondary dark:text-dark-text-secondary">You haven't created any sets yet.</p>
          <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Create a set to group exercises for your workouts.</p>
        </div>
      )}
      <button onClick={handleCreate} className="fixed bottom-24 right-4 bg-secondary dark:bg-dark-secondary rounded-full p-4 shadow-lg hover:scale-105 transition-transform">
        <PlusIcon className="w-8 h-8 text-white"/>
      </button>
    </div>
  );
};

export default SetsListView;
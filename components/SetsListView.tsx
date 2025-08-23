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
          <div key={set.id} className="bg-dark-surface p-4 rounded-lg flex justify-between items-center">
            <span className="font-medium text-dark-text">{set.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(set.id)} className="p-2 text-dark-text-secondary hover:text-white" aria-label={`Edit ${set.name}`}>
                <PencilIcon className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(set.id)} className="p-2 text-dark-text-secondary hover:text-red-500" aria-label={`Delete ${set.name}`}>
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 px-4 bg-dark-surface rounded-lg">
          <p className="text-dark-text-secondary">You haven't created any sets yet.</p>
          <p className="text-dark-text-secondary text-sm">Create a set to group exercises for your workouts.</p>
        </div>
      )}
      <button onClick={handleCreate} className="fixed bottom-24 right-4 bg-brand-secondary rounded-full p-4 shadow-lg hover:scale-105 transition-transform">
        <PlusIcon className="w-8 h-8 text-white"/>
      </button>
    </div>
  );
};

export default SetsListView;
import React from 'react';
import type { CheckIn, View } from '../types';
import { PencilIcon, TrashIcon } from '../constants';

interface CheckInsViewProps {
  checkIns: CheckIn[];
  setView: (view: View) => void;
  setSelectedCheckInId: (id: string) => void;
  onDelete: (id: string) => void;
}

const CheckInsView: React.FC<CheckInsViewProps> = ({ checkIns, setView, setSelectedCheckInId, onDelete }) => {

  const handleSelect = (id: string) => {
    setSelectedCheckInId(id);
    setView('check-in-detail');
  };
  
  const handleEdit = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedCheckInId(id);
      setView('check-in-form');
  }
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDelete(id);
  }

  if (checkIns.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg">
        <p className="text-text-secondary dark:text-dark-text-secondary">No check-ins have been logged yet.</p>
        <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Log your first check-in from the calendar on a Monday.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkIns.map(checkIn => (
        <div key={checkIn.id} onClick={() => handleSelect(checkIn.id)} className="bg-surface dark:bg-dark-surface p-4 rounded-lg cursor-pointer hover:bg-card-hover dark:hover:bg-dark-card transition-colors shadow-sm dark:shadow-none">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-text-base dark:text-dark-text-base">{new Date(checkIn.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              <span className="text-xs text-primary dark:text-dark-primary font-semibold">View Details &rarr;</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={(e) => handleEdit(e, checkIn.id)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-base dark:hover:text-dark-text-base transition-colors" aria-label="Edit check-in">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={(e) => handleDelete(e, checkIn.id)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-danger transition-colors" aria-label="Delete check-in">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                <p className="font-bold text-lg text-primary dark:text-dark-primary">{checkIn.weight} <span className="text-xs text-text-secondary dark:text-dark-text-secondary">kg</span></p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Weight</p>
            </div>
            <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                <p className="font-bold text-lg text-text-base dark:text-dark-text-base">{checkIn.waist} <span className="text-xs text-text-secondary dark:text-dark-text-secondary">cm</span></p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Waist</p>
            </div>
             <div className="bg-card dark:bg-dark-card p-3 rounded-md">
                <p className="font-bold text-lg text-text-base dark:text-dark-text-base">{checkIn.chest} <span className="text-xs text-text-secondary dark:text-dark-text-secondary">cm</span></p>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Chest</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CheckInsView;
import React from 'react';
import type { CheckIn, View } from '../types';

interface CheckInsViewProps {
  checkIns: CheckIn[];
  setView: (view: View) => void;
  setSelectedCheckInId: (id: string) => void;
}

const CheckInsView: React.FC<CheckInsViewProps> = ({ checkIns, setView, setSelectedCheckInId }) => {

  const handleSelect = (id: string) => {
    setSelectedCheckInId(id);
    setView('check-in-detail');
  };

  if (checkIns.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-dark-surface rounded-lg">
        <p className="text-dark-text-secondary">No check-ins have been logged yet.</p>
        <p className="text-dark-text-secondary text-sm">Log your first check-in from the calendar on a Monday.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checkIns.map(checkIn => (
        <div key={checkIn.id} onClick={() => handleSelect(checkIn.id)} className="bg-dark-surface p-4 rounded-lg cursor-pointer hover:bg-dark-card transition-colors">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">{new Date(checkIn.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
             <span className="text-xs text-brand-primary font-semibold">View Details &rarr;</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-dark-card p-3 rounded-md">
                <p className="font-bold text-lg text-brand-primary">{checkIn.weight} <span className="text-xs text-dark-text-secondary">kg</span></p>
                <p className="text-xs text-dark-text-secondary">Weight</p>
            </div>
            <div className="bg-dark-card p-3 rounded-md">
                <p className="font-bold text-lg text-white">{checkIn.waist} <span className="text-xs text-dark-text-secondary">cm</span></p>
                <p className="text-xs text-dark-text-secondary">Waist</p>
            </div>
             <div className="bg-dark-card p-3 rounded-md">
                <p className="font-bold text-lg text-white">{checkIn.chest} <span className="text-xs text-dark-text-secondary">cm</span></p>
                <p className="text-xs text-dark-text-secondary">Chest</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CheckInsView;

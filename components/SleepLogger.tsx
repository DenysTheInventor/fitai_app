import React, { useState, useEffect } from 'react';
import type { DailyLog, SleepLog } from '../types';
import { MoonIcon } from '../constants';

interface SleepLoggerProps {
  selectedDateLog: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
}

const SleepLogger: React.FC<SleepLoggerProps> = ({ selectedDateLog, onUpdateLog }) => {
  const [duration, setDuration] = useState<number>(8);

  useEffect(() => {
    if (selectedDateLog.sleep) {
      setDuration(selectedDateLog.sleep.durationHours);
    } else {
      setDuration(8);
    }
  }, [selectedDateLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDuration(value === '' ? 0 : parseFloat(value));
  };

  const handleSave = () => {
    const sleepLog: SleepLog = { durationHours: duration };
    onUpdateLog({ ...selectedDateLog, sleep: sleepLog });
    alert("Sleep saved!");
  };
  
  const handleRemove = () => {
    onUpdateLog({ ...selectedDateLog, sleep: null });
    setDuration(8);
    alert("Sleep log removed.");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Sleep Log</h2>
      
      <div className="bg-dark-surface p-6 rounded-lg space-y-4 max-w-md mx-auto">
        <div className="text-center">
            <MoonIcon className="w-16 h-16 text-blue-400 mx-auto mb-4"/>
            <h3 className="font-semibold text-white text-lg">Log Your Sleep</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">Total Sleep Duration (hours)</label>
          <input 
            type="number" 
            name="duration" 
            value={duration || ''} 
            onChange={handleChange}
            step="0.5"
            min="0"
            max="24"
            className="w-full bg-dark-card border border-white/20 rounded-md p-3 text-dark-text text-center text-xl focus:ring-brand-primary focus:border-brand-primary" 
          />
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-brand-primary text-dark-bg font-bold py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Save Sleep
            </button>
            {selectedDateLog.sleep && (
                <button
                    onClick={handleRemove}
                    className="w-full bg-dark-card text-red-400 font-semibold py-2 rounded-md hover:bg-red-900/20 transition-colors"
                >
                    Remove Log
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SleepLogger;
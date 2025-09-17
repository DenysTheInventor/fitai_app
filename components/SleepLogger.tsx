import React, { useState, useEffect } from 'react';
import type { DailyLog, SleepLog } from '../types';
import { MoonIcon } from '../constants';

interface SleepLoggerProps {
  selectedDateLog: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
  goBack: () => void;
}

const SleepLogger: React.FC<SleepLoggerProps> = ({ selectedDateLog, onUpdateLog, goBack }) => {
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
    goBack();
  };
  
  const handleRemove = () => {
    onUpdateLog({ ...selectedDateLog, sleep: null });
    setDuration(8);
    goBack();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-text-base dark:text-dark-text-base">Sleep Log</h2>
      
      <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg space-y-4 max-w-md mx-auto">
        <div className="text-center">
            <MoonIcon className="w-16 h-16 text-blue-500 mx-auto mb-4"/>
            <h3 className="font-semibold text-text-base dark:text-dark-text-base text-lg">Log Your Sleep</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Total Sleep Duration (hours)</label>
          <input 
            type="number" 
            name="duration" 
            value={duration || ''} 
            onChange={handleChange}
            step="0.5"
            min="0"
            max="24"
            className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-3 text-text-base dark:text-dark-text-base text-center text-xl focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary" 
          />
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-bold py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Save Sleep
            </button>
            {selectedDateLog.sleep && (
                <button
                    onClick={handleRemove}
                    className="w-full bg-card dark:bg-dark-card text-danger font-semibold py-2 rounded-md hover:bg-danger/10 dark:hover:bg-danger/20 transition-colors"
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
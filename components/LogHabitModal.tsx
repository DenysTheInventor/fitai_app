
import React, { useState, useEffect } from 'react';
import type { DailyLog, HabitType, HabitLog, Book } from '../types';
import { HabitType as HabitTypeEnum } from '../types';

interface LogHabitModalProps {
  habitToLog: HabitType;
  selectedDate: string;
  onClose: () => void;
  onUpdateLog: (updatedLog: DailyLog) => void;
  selectedDateLog: DailyLog;
  books: Book[];
}

const LogHabitModal: React.FC<LogHabitModalProps> = ({ habitToLog, selectedDate, onClose, onUpdateLog, selectedDateLog, books }) => {
  const [duration, setDuration] = useState(30);
  const [pagesRead, setPagesRead] = useState<number | ''>(10);
  const [selectedBookId, setSelectedBookId] = useState<string>('');

  const unfinishedBooks = books.filter(b => !b.isFinished);
  
  useEffect(() => {
    if (habitToLog === HabitTypeEnum.Reading && unfinishedBooks.length > 0) {
        setSelectedBookId(unfinishedBooks[0].id);
    }
  }, [habitToLog, books]);

  const handleSubmit = () => {
    let newHabitLog: HabitLog;
    const id = new Date().toISOString();

    switch(habitToLog) {
        case HabitTypeEnum.Reading:
            if (!selectedBookId || pagesRead === '') {
                alert('Please select a book and enter pages read.');
                return;
            }
            newHabitLog = { id, type: HabitTypeEnum.Reading, durationMinutes: duration, bookId: selectedBookId, pagesRead: +pagesRead };
            break;
        case HabitTypeEnum.English:
            newHabitLog = { id, type: HabitTypeEnum.English, durationMinutes: duration };
            break;
        case HabitTypeEnum.Blogging:
            newHabitLog = { id, type: HabitTypeEnum.Blogging, durationMinutes: duration };
            break;
        default:
            return;
    }
    
    const updatedHabits = [...(selectedDateLog.habits || []), newHabitLog];
    onUpdateLog({ ...selectedDateLog, habits: updatedHabits });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-text-base dark:text-dark-text-base">Log {habitToLog}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Duration (minutes)</label>
                    <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" />
                </div>
                {habitToLog === HabitTypeEnum.Reading && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Book</label>
                            <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2">
                                {unfinishedBooks.length > 0 ? (
                                    unfinishedBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)
                                ) : (
                                    <option value="" disabled>Add a book to your library first</option>
                                )}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Pages Read</label>
                            <input type="number" value={pagesRead} onChange={e => setPagesRead(e.target.value === '' ? '' : +e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" />
                        </div>
                    </>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-md bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-semibold hover:opacity-90 transition-opacity">Log Habit</button>
            </div>
        </div>
    </div>
  );
};

export default LogHabitModal;

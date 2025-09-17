import React, { useState, useMemo, useEffect } from 'react';
import type { DailyLog, HabitLog, Book, ReadingHabitLog, GenericHabitLog } from '../types';
import { HabitType } from '../types';

interface LogHabitModalProps {
    habitType: HabitType;
    onClose: () => void;
    onSave: (habitLog: HabitLog) => void;
    books: Book[];
    allLogs: DailyLog[];
}

const LogHabitModal: React.FC<LogHabitModalProps> = ({ habitType, onClose, onSave, books, allLogs }) => {
    const [duration, setDuration] = useState(30);
    const [pages, setPages] = useState(10);
    const [notes, setNotes] = useState('');
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    
    const unfinishedBooks = useMemo(() => books.filter(b => !b.isFinished), [books]);
    
    useEffect(() => {
        if (habitType === HabitType.Reading && unfinishedBooks.length > 0) {
            setSelectedBookId(unfinishedBooks[0].id);
        }
    }, [habitType, unfinishedBooks]);

    const selectedBook = useMemo(() => books.find(b => b.id === selectedBookId), [books, selectedBookId]);

    const currentPagesRead = useMemo(() => {
        if (!selectedBookId) return 0;
        return allLogs.reduce((total, log) => {
            const pagesInLog = log.habits
                .filter(h => h.type === HabitType.Reading && (h as ReadingHabitLog).bookId === selectedBookId)
                .reduce((sum, h) => sum + (h as ReadingHabitLog).pagesRead, 0);
            return total + pagesInLog;
        }, 0);
    }, [allLogs, selectedBookId]);

    const handleSubmit = () => {
        let newLog: HabitLog;
        if (habitType === HabitType.Reading) {
            if (!selectedBookId) {
                alert("Please select a book.");
                return;
            }
            newLog = { id: new Date().toISOString(), type: HabitType.Reading, durationMinutes: duration, pagesRead: pages, bookId: selectedBookId };
        } else {
            newLog = { id: new Date().toISOString(), type: habitType, durationMinutes: duration, notes: notes } as GenericHabitLog;
        }
        onSave(newLog);
        onClose();
    };
    
    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface dark:bg-dark-surface rounded-lg p-6 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-text-base dark:text-dark-text-base">Log {habitType}</h2>
                <div className="space-y-4">
                    {habitType === HabitType.Reading && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Book</label>
                            <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2">
                                <option value="">Select a book...</option>
                                {unfinishedBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                            </select>
                            {selectedBook && (
                                <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
                                    Progress: {currentPagesRead} / {selectedBook.totalPages} pages read
                                </div>
                            )}
                        </div>
                    )}
                    
                     {habitType === HabitType.Reading && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Pages Read</label>
                            <input type="number" value={pages} onChange={e => setPages(+e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" />
                        </div>
                    )}
                    
                    {(habitType === HabitType.English || habitType === HabitType.Blogging) && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">What did you do?</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" placeholder="e.g., Watched a movie, wrote a blog post draft..." />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Duration (minutes)</label>
                        <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base hover:bg-card-hover dark:hover:bg-dark-card-hover">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-semibold">Save Log</button>
                </div>
            </div>
         </div>
    );
};

export default LogHabitModal;
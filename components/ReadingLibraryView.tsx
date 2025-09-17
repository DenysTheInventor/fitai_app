import React, { useMemo } from 'react';
import type { Book, View, DailyLog, ReadingHabitLog } from '../types';
import { HabitType } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckBadgeIcon, BookOpenIcon } from '../constants';

interface ReadingLibraryViewProps {
  books: Book[];
  allLogs: DailyLog[];
  setView: (view: View) => void;
  setSelectedBookId: (id: string | null) => void;
  onDelete: (id: string) => void;
}

const ReadingLibraryView: React.FC<ReadingLibraryViewProps> = ({ books, allLogs, setView, setSelectedBookId, onDelete }) => {
  
  const booksWithProgress = useMemo(() => {
    return books.map(book => {
        const pagesRead = allLogs.reduce((total, log) => {
            const pagesInLog = (log.habits || [])
                .filter(h => h.type === HabitType.Reading && (h as ReadingHabitLog).bookId === book.id)
                .reduce((sum, h) => sum + (h as ReadingHabitLog).pagesRead, 0);
            return total + pagesInLog;
        }, 0);
        return { ...book, pagesRead };
    });
  }, [books, allLogs]);

  const handleCreate = () => {
    setSelectedBookId(null);
    setView('book-form');
  };

  const handleEdit = (id: string) => {
    setSelectedBookId(id);
    setView('book-form');
  };

  return (
    <div className="space-y-4">
      {booksWithProgress.length > 0 ? (
        booksWithProgress.map(book => {
          const progressPercent = book.totalPages > 0 ? (book.pagesRead / book.totalPages) * 100 : 0;
          return (
            <div key={book.id} className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg flex gap-4 items-center">
              {book.coverPhoto ? (
                  <img src={book.coverPhoto} alt={book.title} className="w-16 h-24 object-cover rounded-md flex-shrink-0" />
              ) : (
                <div className="w-16 h-24 bg-card dark:bg-dark-card rounded-md flex items-center justify-center flex-shrink-0">
                    <BookOpenIcon className="w-8 h-8 text-text-secondary dark:text-dark-text-secondary" />
                </div>
              )}
              <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-text-base dark:text-dark-text-base truncate">{book.title}</h3>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{book.author}</p>
                    </div>
                     {book.isFinished && (
                        <div className="flex items-center gap-1 text-success text-xs font-semibold flex-shrink-0 ml-2">
                           <CheckBadgeIcon className="w-5 h-5" />
                           <span>Read</span>
                        </div>
                    )}
                </div>
                
                {!book.isFinished && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
                            <span>Progress</span>
                            <span>{Math.min(book.pagesRead, book.totalPages)} / {book.totalPages}</span>
                        </div>
                        <div className="w-full bg-card dark:bg-dark-card rounded-full h-2">
                            <div className="bg-secondary dark:bg-dark-secondary h-2 rounded-full" style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
                        </div>
                    </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleEdit(book.id)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-text-base dark:hover:text-dark-text-base" aria-label={`Edit ${book.title}`}>
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(book.id)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-danger" aria-label={`Delete ${book.title}`}>
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })
      ) : (
        <div className="text-center py-10 px-4 bg-surface dark:bg-dark-surface rounded-lg">
          <p className="text-text-secondary dark:text-dark-text-secondary">Your reading library is empty.</p>
          <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Add a book to start tracking your reading habit.</p>
        </div>
      )}
      <button onClick={handleCreate} className="fixed bottom-24 right-4 bg-secondary dark:bg-dark-secondary rounded-full p-4 shadow-lg hover:scale-105 transition-transform">
        <PlusIcon className="w-8 h-8 text-white"/>
      </button>
    </div>
  );
};

export default ReadingLibraryView;
import React, { useState, useEffect, useRef } from 'react';
import type { Book } from '../types';
import { CameraIcon } from '../constants';

interface BookFormViewProps {
  onSave: (book: Book | Omit<Book, 'id'>) => void;
  goBack: () => void;
  bookToEdit?: Book;
}

const BookFormView: React.FC<BookFormViewProps> = ({ onSave, goBack, bookToEdit }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<number | ''>('');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setTotalPages(bookToEdit.totalPages);
      setCoverPhoto(bookToEdit.coverPhoto);
    }
  }, [bookToEdit]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || totalPages === '' || totalPages <= 0) {
      alert('Please fill out all fields correctly.');
      return;
    }

    const bookData = {
      title,
      author,
      totalPages: +totalPages,
      coverPhoto,
      isFinished: bookToEdit?.isFinished || false
    };
    
    if (bookToEdit) {
      onSave({ ...bookData, id: bookToEdit.id });
    } else {
      onSave(bookData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg space-y-4">
        <div className="flex flex-col items-center gap-4">
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handlePhotoUpload}/>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-32 h-48 bg-card dark:bg-dark-card rounded-lg flex items-center justify-center border-2 border-dashed border-border-base dark:border-dark-border-base hover:border-primary dark:hover:border-dark-primary transition-colors">
                {coverPhoto ? (
                    <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover rounded-lg"/>
                ) : (
                    <div className="text-center text-text-secondary dark:text-dark-text-secondary p-2">
                        <CameraIcon className="w-10 h-10 mx-auto"/>
                        <span className="text-sm mt-1">Add Cover</span>
                    </div>
                )}
            </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Author</label>
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Total Pages</label>
          <input type="number" value={totalPages} onChange={e => setTotalPages(e.target.value === '' ? '' : +e.target.value)} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" required />
        </div>
      </div>
      
      <div className="flex gap-4">
        <button type="button" onClick={goBack} className="w-full bg-card dark:bg-dark-card font-bold py-3 rounded-md hover:bg-card-hover dark:hover:bg-dark-card-hover">Cancel</button>
        <button type="submit" className="w-full bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-bold py-3 rounded-md hover:opacity-90">{bookToEdit ? 'Update Book' : 'Add Book'}</button>
      </div>
    </form>
  );
};

export default BookFormView;
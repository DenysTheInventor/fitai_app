import React, { useState, useRef, useEffect } from 'react';
import type { CheckIn } from '../types';
import { CameraIcon } from '../constants';

interface CheckInFormViewProps {
  onSave: (checkIn: CheckIn | Omit<CheckIn, 'id' | 'date'> & { date: string }) => void;
  goBack: () => void;
  date: string;
  checkInToEdit?: CheckIn;
}

const PhotoUpload: React.FC<{ label: string; photo: string | null; onUpload: (base64: string) => void;}> = ({ label, photo, onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleUpload}/>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-square bg-card dark:bg-dark-card rounded-lg flex items-center justify-center border-2 border-dashed border-border-base dark:border-dark-border-base hover:border-primary dark:hover:border-dark-primary transition-colors">
                {photo ? (
                    <img src={photo} alt={label} className="w-full h-full object-cover rounded-lg"/>
                ) : (
                    <div className="text-center text-text-secondary dark:text-dark-text-secondary">
                        <CameraIcon className="w-10 h-10 mx-auto"/>
                        <span className="text-sm mt-1">Add Photo</span>
                    </div>
                )}
            </button>
        </div>
    )
}

const CheckInFormView: React.FC<CheckInFormViewProps> = ({ onSave, goBack, date, checkInToEdit }) => {
  const [weight, setWeight] = useState<number | ''>('');
  const [waist, setWaist] = useState<number | ''>('');
  const [chest, setChest] = useState<number | ''>('');
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);

  useEffect(() => {
    if (checkInToEdit) {
        setWeight(checkInToEdit.weight);
        setWaist(checkInToEdit.waist);
        setChest(checkInToEdit.chest);
        setPhoto1(checkInToEdit.photo1);
        setPhoto2(checkInToEdit.photo2);
    }
  }, [checkInToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight === '' || waist === '' || chest === '') {
        alert('Please fill out all measurement fields.');
        return;
    }

    const checkInData = {
        date: checkInToEdit ? checkInToEdit.date : date,
        weight: +weight,
        waist: +waist,
        chest: +chest,
        photo1,
        photo2,
    };
    
    if (checkInToEdit) {
        onSave({ ...checkInData, id: checkInToEdit.id });
    } else {
        onSave(checkInData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : +e.target.value)} step="0.1" className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Waist (cm)</label>
          <input type="number" value={waist} onChange={e => setWaist(e.target.value === '' ? '' : +e.target.value)} step="0.1" className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Chest (cm)</label>
          <input type="number" value={chest} onChange={e => setChest(e.target.value === '' ? '' : +e.target.value)} step="0.1" className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base" required />
        </div>
      </div>
      
       <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-text-base dark:text-dark-text-base">Progress Photos (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
            <PhotoUpload label="Photo 1 (e.g., Front)" photo={photo1} onUpload={setPhoto1} />
            <PhotoUpload label="Photo 2 (e.g., Side)" photo={photo2} onUpload={setPhoto2} />
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={goBack} className="w-full bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base font-bold py-3 rounded-md hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors">
          Cancel
        </button>
        <button type="submit" className="w-full bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-bold py-3 rounded-md hover:opacity-90 transition-opacity">
          {checkInToEdit ? 'Update Check-in' : 'Save Check-in'}
        </button>
      </div>
    </form>
  );
};

export default CheckInFormView;
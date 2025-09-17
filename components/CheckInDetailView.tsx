import React from 'react';
import type { CheckIn } from '../types';
import { CameraIcon } from '../constants';

interface CheckInDetailViewProps {
  checkIn: CheckIn | undefined;
  goBack: () => void;
}

const PhotoDisplay: React.FC<{photo: string | null}> = ({ photo }) => {
    return (
        <div className="w-full aspect-square bg-card dark:bg-dark-card rounded-lg flex items-center justify-center border-2 border-dashed border-border-base dark:border-dark-border-base">
            {photo ? (
                <img src={photo} alt="Progress" className="w-full h-full object-cover rounded-lg"/>
            ) : (
                <div className="text-center text-text-secondary dark:text-dark-text-secondary">
                    <CameraIcon className="w-10 h-10 mx-auto"/>
                    <span className="text-sm mt-1">No Photo</span>
                </div>
            )}
        </div>
    )
}

const CheckInDetailView: React.FC<CheckInDetailViewProps> = ({ checkIn, goBack }) => {
  if (!checkIn) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary dark:text-dark-text-secondary">Check-in not found.</p>
        <button onClick={goBack} className="text-primary dark:text-dark-primary mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg">
             <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-card dark:bg-dark-card p-4 rounded-md">
                    <p className="font-bold text-xl text-primary dark:text-dark-primary">{checkIn.weight} <span className="text-sm text-text-secondary dark:text-dark-text-secondary">kg</span></p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Weight</p>
                </div>
                <div className="bg-card dark:bg-dark-card p-4 rounded-md">
                    <p className="font-bold text-xl text-text-base dark:text-dark-text-base">{checkIn.waist} <span className="text-sm text-text-secondary dark:text-dark-text-secondary">cm</span></p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Waist</p>
                </div>
                 <div className="bg-card dark:bg-dark-card p-4 rounded-md">
                    <p className="font-bold text-xl text-text-base dark:text-dark-text-base">{checkIn.chest} <span className="text-sm text-text-secondary dark:text-dark-text-secondary">cm</span></p>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Chest</p>
                </div>
          </div>
        </div>

        <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-text-base dark:text-dark-text-base">Progress Photos</h3>
            <div className="grid grid-cols-2 gap-4">
                <PhotoDisplay photo={checkIn.photo1} />
                <PhotoDisplay photo={checkIn.photo2} />
            </div>
        </div>
    </div>
  );
};

export default CheckInDetailView;
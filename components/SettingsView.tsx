import React, { useState, useRef, useEffect } from 'react';
import type { UserSettings, AppData, UserGoal, UserGender } from '../types';
import { UserCircleIcon, DownloadIcon, UploadIcon, ArrowPathIcon } from '../constants';

interface SettingsViewProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  appData: AppData;
  onImport: (data: AppData) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, appData, onImport }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({...prev, photo: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSettings(localSettings);
    alert("Settings saved!");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['age', 'weight', 'height'].includes(name);
    setLocalSettings(prev => ({...prev, [name]: isNumeric && value !== '' ? parseFloat(value) : value }));
  }
  
  const handleExport = () => {
    try {
        const jsonString = JSON.stringify(appData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitai-coach-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSettings(prev => ({...prev, lastBackupDate: new Date().toISOString()}));
    } catch(error) {
        console.error("Failed to export data", error);
        alert("Error exporting data. See console for details.");
    }
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if(!window.confirm("Are you sure? This will overwrite all current data in the app.")) {
              return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const importedData = JSON.parse(event.target?.result as string) as AppData;
                  // Basic validation
                  if (importedData.logs && importedData.customExercises && importedData.userSettings) {
                      onImport(importedData);
                      alert("Data imported successfully!");
                  } else {
                      alert("Invalid backup file format.");
                  }
              } catch(error) {
                  console.error("Failed to parse imported file", error);
                  alert("Failed to read backup file. It might be corrupted.");
              }
          };
          reader.readAsText(file);
      }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getBackupReminder = () => {
      if (!settings.lastBackupDate) {
          return <p className="text-xs text-center text-yellow-400">You haven't backed up your data yet. It's a good idea to export it periodically.</p>;
      }
      const daysSinceBackup = (new Date().getTime() - new Date(settings.lastBackupDate).getTime()) / (1000 * 3600 * 24);
      if (daysSinceBackup > 7) {
          return <p className="text-xs text-center text-yellow-400">It's been over a week since your last backup. Consider exporting your data.</p>;
      }
      return <p className="text-xs text-center text-gray-500">Last backup: {new Date(settings.lastBackupDate).toLocaleDateString()}</p>;
  }

  const goalOptions: {value: UserGoal, label: string}[] = [
    { value: 'lose', label: 'Lose Weight' },
    { value: 'maintain', label: 'Maintain Weight' },
    { value: 'gain', label: 'Gain Muscle' },
  ];
  
  const genderOptions: {value: UserGender, label: string}[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>
            <div className="bg-dark-surface p-6 rounded-lg space-y-4">
                <div className="flex flex-col items-center gap-4">
                    <input type="file" accept="image/*" hidden ref={photoFileInputRef} onChange={handlePhotoUpload}/>
                    <button onClick={() => photoFileInputRef.current?.click()} className="relative group">
                        {localSettings.photo ? <img src={localSettings.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover"/> : <UserCircleIcon className="w-24 h-24 text-dark-text-secondary"/>}
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">Change</div>
                    </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-1">Name</label>
                  <input type="text" name="name" value={localSettings.name} onChange={handleInputChange} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text"/>
                </div>
                
                 <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-1">Gender</label>
                  <select name="gender" value={localSettings.gender || ''} onChange={handleInputChange} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text">
                      <option value="">Prefer not to say</option>
                      {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Age</label>
                    <input type="number" name="age" value={localSettings.age || ''} onChange={handleInputChange} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text"/>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Weight (kg)</label>
                    <input type="number" name="weight" value={localSettings.weight || ''} onChange={handleInputChange} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text"/>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Height (cm)</label>
                    <input type="number" name="height" value={localSettings.height || ''} onChange={handleInputChange} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-1">Primary Goal</label>
                  <select name="goal" value={localSettings.goal || ''} onChange={handleInputChange} className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text">
                      <option value="">Select a goal</option>
                      {goalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-1">My Sport History</label>
                  <textarea name="bio" value={localSettings.bio} onChange={handleInputChange} rows={3} placeholder="e.g., Former football player, now focused on strength training..." className="w-full bg-dark-card border border-white/20 rounded-md p-2 text-dark-text"></textarea>
                </div>
                
                <button onClick={handleSave} className="w-full bg-brand-primary text-dark-bg font-bold py-3 rounded-md hover:opacity-90 transition-opacity">Save Profile</button>
            </div>
        </div>

        <div>
            <h2 className="text-xl font-semibold text-white mb-4">System Settings</h2>
            <div className="bg-dark-surface p-6 rounded-lg space-y-4">
                <button onClick={handleRefresh} className="w-full flex items-center justify-center gap-2 bg-dark-card text-dark-text font-semibold py-3 rounded-md hover:bg-white/10 transition-colors">
                    <ArrowPathIcon className="w-5 h-5"/>
                    Force App Update
                </button>
                <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-dark-card text-dark-text font-semibold py-3 rounded-md hover:bg-white/10 transition-colors">
                    <DownloadIcon className="w-5 h-5"/>
                    Export Data (JSON)
                </button>
                 <button onClick={() => jsonFileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-dark-card text-dark-text font-semibold py-3 rounded-md hover:bg-white/10 transition-colors">
                    <UploadIcon className="w-5 h-5"/>
                    Import Data (JSON)
                </button>
                <input type="file" accept=".json" hidden ref={jsonFileInputRef} onChange={handleImport} />
                <div className="pt-2">{getBackupReminder()}</div>
            </div>
        </div>
    </div>
  );
};

export default SettingsView;
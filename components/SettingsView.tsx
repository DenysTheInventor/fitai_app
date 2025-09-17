import React, { useState, useRef, useEffect } from 'react';
import type { View, UserSettings, AppData, UserGoal, UserGender } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { UserCircleIcon, DownloadIcon, UploadIcon, ArrowPathIcon, CogIcon, RunningIcon, BookOpenIcon, SunIcon, MoonIcon, BookIcon } from '../constants';


// Hub Card Component
const HubCard: React.FC<{label: string, icon: React.ReactNode, onClick: () => void}> = ({label, icon, onClick}) => (
    <div onClick={onClick} className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg text-center cursor-pointer hover:bg-card-hover dark:hover:bg-dark-card transition-colors">
        <div className="w-12 h-12 mx-auto text-secondary dark:text-dark-secondary flex items-center justify-center">{icon}</div>
        <h3 className="font-semibold text-lg text-text-base dark:text-dark-text-base mt-3">{label}</h3>
    </div>
);

// 1. Settings Hub Component
interface SettingsHubProps {
  setView: (view: View) => void;
}
export const SettingsHub: React.FC<SettingsHubProps> = ({ setView }) => {
  return (
    <div className="space-y-4">
      <HubCard label="Profile" icon={<UserCircleIcon className="w-12 h-12" />} onClick={() => setView('profile-settings')} />
      <HubCard label="Habits" icon={<BookOpenIcon className="w-12 h-12" />} onClick={() => setView('habits-hub')} />
      <HubCard label="Track" icon={<RunningIcon className="w-12 h-12" />} onClick={() => setView('tracking')} />
      <HubCard label="System" icon={<CogIcon className="w-12 h-12" />} onClick={() => setView('system-settings')} />
    </div>
  );
};

// 2. Habits Hub Component
interface HabitsHubProps {
  setView: (view: View) => void;
}
export const HabitsHub: React.FC<HabitsHubProps> = ({ setView }) => {
  return (
    <div className="space-y-4">
      <HubCard label="Reading Library" icon={<BookOpenIcon className="w-12 h-12" />} onClick={() => setView('reading-library')} />
      <HubCard label="Manage Habits" icon={<BookIcon className="w-12 h-12" />} onClick={() => setView('habits-library')} />
    </div>
  );
};

// 3. Profile Settings Component
interface ProfileSettingsProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}
export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ settings, setSettings }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg space-y-4">
          <div className="flex flex-col items-center gap-4">
              <input type="file" accept="image/*" hidden ref={photoFileInputRef} onChange={handlePhotoUpload}/>
              <button onClick={() => photoFileInputRef.current?.click()} className="relative group">
                  {localSettings.photo ? <img src={localSettings.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover"/> : <UserCircleIcon className="w-24 h-24 text-text-secondary dark:text-dark-text-secondary"/>}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">Change</div>
              </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Name</label>
            <input type="text" name="name" value={localSettings.name} onChange={handleInputChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base"/>
          </div>
          
           <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Gender</label>
            <select name="gender" value={localSettings.gender || ''} onChange={handleInputChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base">
                <option value="">Prefer not to say</option>
                {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Age</label>
              <input type="number" name="age" value={localSettings.age || ''} onChange={handleInputChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Weight (kg)</label>
              <input type="number" name="weight" value={localSettings.weight || ''} onChange={handleInputChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Height (cm)</label>
              <input type="number" name="height" value={localSettings.height || ''} onChange={handleInputChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Primary Goal</label>
            <select name="goal" value={localSettings.goal || ''} onChange={handleInputChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base">
                <option value="">Select a goal</option>
                {goalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">My Sport History</label>
            <textarea name="bio" value={localSettings.bio} onChange={handleInputChange} rows={3} placeholder="e.g., Former football player, now focused on strength training..." className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base"></textarea>
          </div>
          
          <button onClick={handleSave} className="w-full bg-primary text-white dark:text-dark-bg-base font-bold py-3 rounded-md hover:opacity-90 transition-opacity">Save Profile</button>
      </div>
  );
};


// 4. System Settings Component
interface SystemSettingsProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  appData: AppData;
  onImport: (data: AppData) => void;
}
export const SystemSettings: React.FC<SystemSettingsProps> = ({ settings, setSettings, appData, onImport }) => {
  const { theme, setTheme } = useTheme();
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

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
          return <p className="text-xs text-center text-warning dark:text-yellow-400">You haven't backed up your data yet. It's a good idea to export it periodically.</p>;
      }
      const daysSinceBackup = (new Date().getTime() - new Date(settings.lastBackupDate).getTime()) / (1000 * 3600 * 24);
      if (daysSinceBackup > 7) {
          return <p className="text-xs text-center text-warning dark:text-yellow-400">It's been over a week since your last backup. Consider exporting your data.</p>;
      }
      return <p className="text-xs text-center text-text-secondary dark:text-dark-text-secondary">Last backup: {new Date(settings.lastBackupDate).toLocaleDateString()}</p>;
  }

  return (
      <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-6 rounded-lg space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Theme</label>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-full flex items-center justify-between bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base font-semibold py-3 px-4 rounded-md hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors">
              <span className="capitalize">{theme} Mode</span>
              <div className="relative w-12 h-6 rounded-full bg-surface dark:bg-dark-surface p-1 flex items-center transition-colors">
                  <div className={`absolute w-5 h-5 rounded-full bg-secondary dark:bg-dark-secondary transform transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  <div className="w-full flex justify-between px-0.5">
                    <SunIcon className="w-3 h-3 text-warning"/>
                    <MoonIcon className="w-3 h-3 text-blue-400"/>
                  </div>
              </div>
            </button>
          </div>

          <button onClick={handleRefresh} className="w-full flex items-center justify-center gap-2 bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base font-semibold py-3 rounded-md hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors">
              <ArrowPathIcon className="w-5 h-5"/>
              Force App Update
          </button>
          <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base font-semibold py-3 rounded-md hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors">
              <DownloadIcon className="w-5 h-5"/>
              Export Data (JSON)
          </button>
           <button onClick={() => jsonFileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base font-semibold py-3 rounded-md hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors">
              <UploadIcon className="w-5 h-5"/>
              Import Data (JSON)
          </button>
          <input type="file" accept=".json" hidden ref={jsonFileInputRef} onChange={handleImport} />
          <div className="pt-2">{getBackupReminder()}</div>
      </div>
  );
};
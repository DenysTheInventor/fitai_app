
import React, { useState } from 'react';
import type { UserSettings } from '../types';

interface SettingsViewProps {
  userSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userSettings, onSave }) => {
  const [settings, setSettings] = useState<UserSettings>(userSettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'height' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    alert('Settings saved!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold text-text-base dark:text-dark-text-base">Settings</h1>
      <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Name</label>
          <input type="text" name="name" value={settings.name} onChange={handleChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Weight (kg)</label>
          <input type="number" name="weight" value={settings.weight} onChange={handleChange} step="0.1" className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Height (cm)</label>
          <input type="number" name="height" value={settings.height} onChange={handleChange} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">Your Goal</label>
          <textarea name="goal" value={settings.goal} onChange={handleChange} rows={3} className="w-full bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2" placeholder="e.g., build muscle, lose fat..." />
        </div>
      </div>
      <button type="submit" className="w-full bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-bold py-3 rounded-md hover:opacity-90 transition-opacity">Save Changes</button>
    </form>
  );
};

export default SettingsView;

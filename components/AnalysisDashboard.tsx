

import React, { useState, useCallback } from 'react';
import { getAiAnalysis } from '../services/geminiService';
// FIX: Import CustomHabit to use it in the component's props.
import type { DailyLog, UserSettings, CheckIn, CustomHabit } from '../types';
import { SparklesIcon } from '../constants';

interface AnalysisDashboardProps {
  allLogs: DailyLog[];
  userSettings: UserSettings;
  checkIns: CheckIn[];
  // FIX: Add customHabits to the props interface to accept it from App.tsx.
  customHabits: CustomHabit[];
}

const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type Period = 'day' | 'week' | 'month';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderContent = () => {
    return content
      .split('\n')
      .map((line, index) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary dark:text-dark-primary">$1</strong>');
        if (line.trim().startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: line.replace('* ', '') }} />;
        }
         if (line.match(/^\*\*(.*?)\*\*/)) {
           return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-text-base dark:text-dark-text-base" dangerouslySetInnerHTML={{ __html: line }} />;
        }
        return <p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: line }} />;
      });
  };

  return <div className="prose prose-invert text-text-secondary dark:text-dark-text-secondary space-y-2">{renderContent()}</div>;
};

// FIX: Accept customHabits in the component's props destructuring.
const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ allLogs, userSettings, checkIns, customHabits }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [period, setPeriod] = useState<Period>('week');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setAnalysis('');
    
    let logsForAnalysis: DailyLog[] = [];
    let periodDescription = '';

    const today = new Date();
    today.setHours(0,0,0,0);

    switch (period) {
        case 'day':
            logsForAnalysis = allLogs.filter(log => log.date === selectedDate);
            periodDescription = `the specific day: ${new Date(selectedDate+'T00:00:00').toLocaleDateString()}`;
            break;
        case 'week':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6); // Include today + 6 previous days
            logsForAnalysis = allLogs.filter(log => {
                const logDate = new Date(log.date + 'T00:00:00');
                return logDate >= sevenDaysAgo && logDate <= today;
            });
            periodDescription = 'the last 7 days';
            break;
        case 'month':
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 29); // Include today + 29 previous days
            logsForAnalysis = allLogs.filter(log => {
                const logDate = new Date(log.date + 'T00:00:00');
                return logDate >= thirtyDaysAgo && logDate <= today;
            });
            periodDescription = 'the last 30 days';
            break;
    }

    if (logsForAnalysis.length === 0) {
        setError('No data found for the selected period. Please log some activity first.');
        setIsLoading(false);
        return;
    }

    try {
      // FIX: Pass the customHabits prop to the getAiAnalysis function call.
      const result = await getAiAnalysis(logsForAnalysis, userSettings, checkIns, customHabits, periodDescription);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
    // FIX: Add customHabits to the dependency array of useCallback.
  }, [allLogs, userSettings, checkIns, customHabits, period, selectedDate]);
  
  const PeriodButton: React.FC<{label: string, value: Period}> = ({label, value}) => (
    <button onClick={() => setPeriod(value)} className={`px-4 py-2 text-sm rounded-md transition-colors ${period === value ? 'bg-secondary dark:bg-dark-secondary text-white font-semibold' : 'bg-card dark:bg-dark-card text-text-secondary dark:text-dark-text-secondary hover:bg-card-hover dark:hover:bg-dark-card-hover'}`}>
        {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none p-4 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-text-base dark:text-dark-text-base">Get Your AI Analysis</h2>
        <p className="text-text-secondary dark:text-dark-text-secondary mt-1 text-sm">Select a period to receive personalized feedback.</p>
        
        <div className="my-4 flex justify-center gap-2">
            <PeriodButton label="Day" value="day" />
            <PeriodButton label="Last 7 Days" value="week" />
            <PeriodButton label="Last 30 Days" value="month" />
        </div>

        {period === 'day' && (
            <div className="mb-4">
                 <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full max-w-xs mx-auto bg-card dark:bg-dark-card border border-border-base dark:border-dark-border-base rounded-md p-2 text-text-base dark:text-dark-text-base focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary" />
            </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isLoading || allLogs.length === 0}
          className="inline-flex items-center gap-2 bg-primary dark:bg-dark-primary text-white dark:text-dark-bg-base font-bold py-3 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
             <>
                <SparklesIcon className="w-5 h-5"/>
                Analyze My Data
            </>
          )}
        </button>
        {allLogs.length === 0 && <p className="text-xs text-yellow-500 mt-2">Log some data first to get an analysis.</p>}
      </div>

      {error && <div className="bg-danger/10 border border-danger text-danger p-4 rounded-lg">{error}</div>}

      {analysis && (
        <div className="bg-card dark:bg-dark-card p-4 rounded-lg">
          <MarkdownRenderer content={analysis} />
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;
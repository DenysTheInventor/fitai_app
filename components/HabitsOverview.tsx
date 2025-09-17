import React, { useState, useMemo } from 'react';
import type { DailyLog, CustomHabit, GenericHabitLog } from '../types';
import { HabitType } from '../types';
import { CheckIcon, XIcon, DownloadIcon } from '../constants';

// Make jsPDF available from the global scope (since it's loaded via CDN)
declare const jspdf: any;

interface HabitsOverviewProps {
  logs: DailyLog[];
  customHabits: CustomHabit[];
}

const HabitsOverview: React.FC<HabitsOverviewProps> = ({ logs, customHabits }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const { daysInMonth, monthName, year, habitData } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const habitList = [
      { id: HabitType.English, name: 'English Learning' },
      { id: HabitType.Reading, name: 'Reading' },
      { id: HabitType.Blogging, name: 'Blogging' },
      ...customHabits,
    ];

    const logsForMonth = logs.filter(log => {
        const logDate = new Date(log.date + 'T00:00:00');
        return logDate.getFullYear() === year && logDate.getMonth() === month;
    });

    const logsByDate = new Map(logsForMonth.map(log => [new Date(log.date + 'T00:00:00').getDate(), log]));

    const habitData = habitList.map(habit => {
        const statuses: boolean[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const log = logsByDate.get(day);
            if (log) {
                const isLogged = log.habits.some(h => {
                    if (h.type === HabitType.Custom) {
                        return (h as GenericHabitLog).customHabitId === habit.id;
                    }
                    return h.type === habit.id;
                });
                statuses.push(isLogged);
            } else {
                statuses.push(false);
            }
        }
        return { ...habit, statuses };
    });

    return { daysInMonth, monthName, year, habitData };
  }, [currentDate, logs, customHabits]);
  
  const handleExportPdf = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const title = `Habit Overview - ${monthName} ${year}`;
    const cellPadding = 5;
    const headerHeight = 30;
    const rowHeight = 25;
    const habitColWidth = 150;
    const dateColWidth = 20;
    const margin = 40;
    
    // Title
    doc.setFontSize(18);
    doc.text(title, margin, margin + 10);
    
    // Table Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let x = margin + habitColWidth;
    doc.text('Habit', margin + cellPadding, margin + headerHeight - cellPadding);
    for (let day = 1; day <= daysInMonth; day++) {
        doc.text(String(day), x + dateColWidth / 2, margin + headerHeight - cellPadding, { align: 'center' });
        x += dateColWidth;
    }
    
    // Table Body
    doc.setFont('helvetica', 'normal');
    let y = margin + headerHeight;
    habitData.forEach(habit => {
        doc.text(habit.name, margin + cellPadding, y + rowHeight / 2 + 5);
        let x = margin + habitColWidth;
        habit.statuses.forEach(isLogged => {
            if(isLogged) {
                doc.setTextColor('#10B981');
                doc.text('✔', x + dateColWidth / 2, y + rowHeight / 2 + 5, { align: 'center' });
            } else {
                 doc.setTextColor('#EF4444');
                 doc.text('❌', x + dateColWidth / 2, y + rowHeight / 2 + 5, { align: 'center' });
            }
            doc.setTextColor('#000000');
            x += dateColWidth;
        });
        y += rowHeight;
    });

    doc.save(`habit-overview-${year}-${monthName}.pdf`);
  };

  return (
    <div className="bg-surface dark:bg-dark-surface shadow-sm dark:shadow-none rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-card dark:hover:bg-dark-card transition-colors" aria-label="Previous month">&lt;</button>
        <h2 className="text-lg font-bold text-text-base dark:text-dark-text-base">
          {monthName} {year}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-card dark:hover:bg-dark-card transition-colors" aria-label="Next month">&gt;</button>
      </div>
      
      <button onClick={handleExportPdf} className="w-full flex items-center justify-center gap-2 mb-4 bg-card dark:bg-dark-card text-text-base dark:text-dark-text-base font-semibold py-2 rounded-md hover:bg-card-hover dark:hover:bg-dark-card-hover transition-colors">
          <DownloadIcon className="w-5 h-5"/>
          Export as PDF
      </button>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex bg-card dark:bg-dark-card rounded-t-lg sticky top-0">
            <div className="p-2 text-sm font-semibold text-text-base dark:text-dark-text-base sticky left-0 z-10 bg-card dark:bg-dark-card w-32 md:w-40 flex-shrink-0">Habit</div>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <div key={day} className="w-9 flex-shrink-0 text-center p-2 text-sm font-semibold text-text-base dark:text-dark-text-base">{day}</div>
            ))}
          </div>
          {/* Body Rows */}
          {habitData.map((habit, index) => (
            <div key={habit.id} className={`flex ${index === habitData.length - 1 ? 'rounded-b-lg' : ''}`}>
              <div className="p-2 text-sm font-medium text-text-base dark:text-dark-text-base sticky left-0 z-10 bg-surface dark:bg-dark-surface border-b border-r border-border-base dark:border-dark-border-base w-32 md:w-40 flex-shrink-0 truncate">{habit.name}</div>
              {habit.statuses.map((isLogged, dayIndex) => (
                <div key={dayIndex} className="w-9 flex-shrink-0 flex items-center justify-center p-2 border-b border-border-base dark:border-dark-border-base">
                  {isLogged ? <CheckIcon className="w-5 h-5 text-success" /> : <XIcon className="w-4 h-4 text-danger opacity-50" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitsOverview;
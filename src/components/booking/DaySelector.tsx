'use client';

import { DayOption } from '@/lib/types';

interface DaySelectorProps {
  days: DayOption[];
  selectedDate: string;
  onSelect: (isoDate: string) => void;
}

export function DaySelector({ days, selectedDate, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 py-1">
      {days.map((day) => {
        const active = day.isoDate === selectedDate;
        return (
          <button
            key={day.isoDate}
            onClick={() => onSelect(day.isoDate)}
            className={`flex shrink-0 flex-col items-center rounded-md px-4 py-2.5 transition-colors ${
              active
                ? 'bg-barber-red text-white'
                : 'bg-barber-surface text-barber-muted hover:bg-barber-surface2'
            }`}
          >
            <span className="text-[10px] font-semibold tracking-wide">
              {day.isToday ? 'HOJE' : day.weekdayLabel}
            </span>
            <span className="text-sm font-bold">{day.dayNumber}</span>
          </button>
        );
      })}
    </div>
  );
}

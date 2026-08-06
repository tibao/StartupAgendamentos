'use client';

import { TimeSlot } from '@/lib/types';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlotGrid({ slots, selectedTime, onSelect }: TimeSlotGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2 px-6 sm:grid-cols-5">
      {slots.map((slot) => {
        const active = slot.time === selectedTime;
        return (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => onSelect(slot.time)}
            className={`rounded-md py-2.5 text-xs font-semibold transition-colors ${
              !slot.available
                ? 'cursor-not-allowed bg-barber-surface/40 text-barber-muted/40 line-through'
                : active
                ? 'bg-barber-red text-white'
                : 'bg-barber-surface text-white hover:bg-barber-surface2'
            }`}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}

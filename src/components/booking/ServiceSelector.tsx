'use client';

import { Check, Clock } from 'lucide-react';
import { Service } from '@/lib/types';
import { formatCentsToBRL } from '@/lib/utils';

interface ServiceSelectorProps {
  services: Service[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function ServiceSelector({ services, selectedIds, onToggle }: ServiceSelectorProps) {
  return (
    <div className="space-y-2.5 px-6">
      {services.map((service) => {
        const active = selectedIds.includes(service.id);
        return (
          <button
            key={service.id}
            onClick={() => onToggle(service.id)}
            className={`flex w-full items-center justify-between rounded-md px-4 py-3.5 text-left transition-colors ${
              active
                ? 'bg-barber-surface2 ring-1 ring-barber-red'
                : 'bg-barber-surface hover:bg-barber-surface2'
            }`}
          >
            <div>
              <p className="text-sm font-semibold">{service.name}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-barber-muted">
                <Clock size={12} />
                <span>{service.durationMinutes} min</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-barber-muted">
                {formatCentsToBRL(service.priceCents)}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                  active
                    ? 'border-barber-red bg-barber-red'
                    : 'border-barber-border'
                }`}
              >
                {active && <Check size={14} className="text-white" />}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

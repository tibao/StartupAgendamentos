'use client';

import Image from 'next/image';
import { Professional } from '@/lib/types';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ProfessionalSelector({
  professionals,
  selectedId,
  onSelect,
}: ProfessionalSelectorProps) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 py-1">
      {professionals.map((pro) => {
        const active = selectedId === pro.id;
        const ringColor = pro.accentColor === 'red' ? 'ring-barber-red' : 'ring-barber-blue';
        return (
          <button
            key={pro.id}
            onClick={() => onSelect(pro.id)}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full p-0.5 transition-all ${
                active ? `ring-2 ${ringColor} ring-offset-2 ring-offset-barber-bg` : 'ring-1 ring-barber-border'
              }`}
            >
              <span className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={pro.avatarUrl}
                  alt={pro.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
            </span>
            <span className={`text-xs font-medium ${active ? 'text-white' : 'text-barber-muted'}`}>
              {pro.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { formatCentsToBRL } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ConfirmBarProps {
  totalPriceCents: number;
  totalDurationMinutes: number;
  disabled: boolean;
  onConfirm: () => void;
}

export function ConfirmBar({
  totalPriceCents,
  totalDurationMinutes,
  disabled,
  onConfirm,
}: ConfirmBarProps) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-barber-border/60 bg-barber-bg/95 px-6 pb-4 pt-3 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wide text-barber-muted">Total</p>
          <p className="text-lg font-bold">
            {formatCentsToBRL(totalPriceCents)}{' '}
            <span className="text-xs font-normal text-barber-muted">
              · {totalDurationMinutes} min
            </span>
          </p>
        </div>
        <Button disabled={disabled} onClick={onConfirm} className="!px-8">
          Confirmar Agendamento
        </Button>
      </div>
    </div>
  );
}

'use client';

import { Calendar, Check, Clock, MessageCircle, Scissors, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCentsToBRL } from '@/lib/utils';

interface SuccessScreenProps {
  barbershopName: string;
  serviceNames: string[];
  professionalName: string;
  dayLabel: string;
  time: string;
  totalPriceCents: number;
  onNewBooking: () => void;
}

export function SuccessScreen({
  barbershopName,
  serviceNames,
  professionalName,
  dayLabel,
  time,
  totalPriceCents,
  onNewBooking,
}: SuccessScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-barber-bg px-6 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center border border-barber-red text-barber-red">
        <Check size={28} strokeWidth={3} />
      </div>

      <h1 className="mt-6 text-2xl font-extrabold">Agendamento confirmado!</h1>
      <p className="mt-1 text-sm text-barber-muted">
        Enviamos a confirmação para o seu WhatsApp.
      </p>

      <div className="mt-8 w-full max-w-sm space-y-3 border border-barber-border bg-barber-surface p-5 text-left">
        <Row icon={<Scissors size={16} className="text-barber-red" />} label={barbershopName} />
        <Row
          icon={<Calendar size={16} className="text-barber-blue" />}
          label={dayLabel}
        />
        <Row icon={<Clock size={16} className="text-barber-blue" />} label={time} />
        <Row
          icon={<User size={16} className="text-barber-red" />}
          label={professionalName}
        />
        <div className="border-t border-barber-border/60 pt-3">
          <p className="text-xs text-barber-muted">{serviceNames.join(' + ')}</p>
          <p className="mt-1 text-lg font-bold">{formatCentsToBRL(totalPriceCents)}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-barber-muted">
        <MessageCircle size={14} className="text-barber-blue" />
        Confirmação enviada via WhatsApp
      </div>

      <Button className="mt-8" onClick={onNewBooking}>
        Fazer novo agendamento
      </Button>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center bg-barber-surface2">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

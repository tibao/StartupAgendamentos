'use client';

import { useState } from 'react';
import { Clock, Scissors, User } from 'lucide-react';
import { Barbershop, Booking, Professional, Service } from '@/lib/types';
import { formatCentsToBRL } from '@/lib/utils';
import { BarberStripe } from '@/components/BarberStripe';

type Tab = 'agenda' | 'servicos' | 'caixa';

interface AdminDashboardProps {
  barbershop: Barbershop;
  todayBookings: Booking[];
  services: Service[];
  professionals: Professional[];
}

export function AdminDashboard({
  barbershop,
  todayBookings,
  services,
  professionals,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('agenda');

  const totalCaixaCents = todayBookings.reduce((sum, b) => sum + b.totalPriceCents, 0);

  function serviceNames(ids: string[]) {
    return ids
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(' + ');
  }

  function professionalName(id: string) {
    return professionals.find((p) => p.id === id)?.name ?? '—';
  }

  return (
    <div className="min-h-screen bg-barber-bg pb-16">
      <BarberStripe />

      {/* HEADER */}
      <div className="border-b border-barber-border px-6 py-6">
        <div className="flex items-center gap-2">
          <Scissors size={16} className="text-barber-red" />
          <h1 className="text-sm font-bold uppercase tracking-wide">{barbershop.name}</h1>
        </div>
        <p className="mt-1 text-xs text-barber-muted">
          Assinatura:{' '}
          <span className={barbershop.status === 'active' ? 'text-white' : 'text-barber-red'}>
            {barbershop.status === 'active' ? 'em dia' : 'pendente'}
          </span>
        </p>
      </div>

      {/* TABS — abas sublinhadas, sem pílula colorida */}
      <div className="flex border-b border-barber-border px-6">
        <TabButton active={tab === 'agenda'} onClick={() => setTab('agenda')}>
          Agenda
        </TabButton>
        <TabButton active={tab === 'servicos'} onClick={() => setTab('servicos')}>
          Serviços
        </TabButton>
        <TabButton active={tab === 'caixa'} onClick={() => setTab('caixa')}>
          Caixa
        </TabButton>
      </div>

      <div className="px-6 py-5">
        {tab === 'agenda' && (
          <div className="divide-y divide-barber-border">
            {todayBookings.length === 0 && (
              <EmptyState message="Nenhum agendamento para hoje ainda." />
            )}
            {todayBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-barber-red">{booking.time}</span>
                  <div>
                    <p className="text-sm font-semibold">{serviceNames(booking.serviceIds)}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-barber-muted">
                      <User size={10} /> {professionalName(booking.professionalId)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-barber-muted">
                  {formatCentsToBRL(booking.totalPriceCents)}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'servicos' && (
          <div>
            <div className="divide-y divide-barber-border">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-barber-muted" />
                    <div>
                      <p className="text-sm font-semibold">{service.name}</p>
                      <p className="text-xs text-barber-muted">{service.durationMinutes} min</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-barber-muted">
                    {formatCentsToBRL(service.priceCents)}
                  </span>
                </div>
              ))}
            </div>
            <p className="pt-4 text-xs text-barber-muted">
              Edição de serviços disponível em breve.
            </p>
          </div>
        )}

        {tab === 'caixa' && (
          <div className="space-y-4">
            <div className="border border-barber-border p-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-barber-muted">
                Faturamento de hoje
              </p>
              <p className="mt-2 text-3xl font-black">{formatCentsToBRL(totalCaixaCents)}</p>
              <p className="mt-1 text-xs text-barber-muted">
                {todayBookings.length} atendimento(s) confirmado(s)
              </p>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-barber-border py-2 text-xs text-barber-muted">
              <span>Próxima cobrança da assinatura</span>
              <span className="font-mono text-white">
                {new Date(barbershop.nextBillingDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-0 py-3 mr-6 text-xs font-bold uppercase tracking-wide transition-colors ${
        active ? 'border-barber-red text-white' : 'border-transparent text-barber-muted'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-barber-border py-10 text-center text-sm text-barber-muted">
      {message}
    </div>
  );
}

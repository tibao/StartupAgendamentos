'use client';

import { useEffect, useMemo, useState } from 'react';
import { Scissors } from 'lucide-react';
import { Barbershop, Professional, Service, TimeSlot } from '@/lib/types';
import { buildNextDays, createBooking, getAvailableSlots } from '@/lib/db';
import { DaySelector } from './DaySelector';
import { ServiceSelector } from './ServiceSelector';
import { ProfessionalSelector } from './ProfessionalSelector';
import { TimeSlotGrid } from './TimeSlotGrid';
import { ConfirmBar } from './ConfirmBar';
import { WhatsAppModal } from './WhatsAppModal';
import { SuccessScreen } from './SuccessScreen';

interface BookingFlowProps {
  barbershop: Barbershop;
  services: Service[];
  professionals: Professional[];
}

export function BookingFlow({ barbershop, services, professionals }: BookingFlowProps) {
  const days = useMemo(() => buildNextDays(10), []);

  const [selectedDate, setSelectedDate] = useState(days[0].isoDate);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    dayLabel: string;
    time: string;
  } | null>(null);

  // Recarrega os horários sempre que dia ou profissional mudam.
  // Chama o Supabase direto do navegador com a chave pública (anon) —
  // seguro porque a leitura de disponibilidade passa por uma function
  // no banco que só devolve horários ocupados, nunca dado do cliente.
  useEffect(() => {
    if (!selectedProfessionalId) return;
    setSelectedTime(null);
    getAvailableSlots(barbershop.id, selectedProfessionalId, selectedDate).then(setSlots);
  }, [barbershop.id, selectedDate, selectedProfessionalId]);

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPriceCents = selectedServices.reduce((sum, s) => sum + s.priceCents, 0);
  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const canConfirm =
    selectedServiceIds.length > 0 && !!selectedProfessionalId && !!selectedTime;

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleWhatsappSubmit(whatsapp: string) {
    if (!selectedProfessionalId || !selectedTime) return;

    await createBooking({
      barbershopId: barbershop.id,
      serviceIds: selectedServiceIds,
      professionalId: selectedProfessionalId,
      clientWhatsapp: whatsapp,
      date: selectedDate,
      time: selectedTime,
      totalPriceCents,
      totalDurationMinutes,
    });

    const day = days.find((d) => d.isoDate === selectedDate)!;
    setConfirmedBooking({
      dayLabel: `${day.weekdayLabel} ${day.dayNumber}`,
      time: selectedTime,
    });
    setShowWhatsappModal(false);
  }

  function resetFlow() {
    setSelectedServiceIds([]);
    setSelectedProfessionalId(null);
    setSelectedTime(null);
    setConfirmedBooking(null);
  }

  if (confirmedBooking) {
    const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId);
    return (
      <SuccessScreen
        barbershopName={barbershop.name}
        serviceNames={selectedServices.map((s) => s.name)}
        professionalName={selectedProfessional?.name ?? ''}
        dayLabel={confirmedBooking.dayLabel}
        time={confirmedBooking.time}
        totalPriceCents={totalPriceCents}
        onNewBooking={resetFlow}
      />
    );
  }

  return (
    <div className="min-h-screen bg-barber-bg pb-32">
      {/* HEADER */}
      <div className="px-6 pb-4 pt-8">
        <div className="flex items-center gap-2">
          <Scissors size={16} className="text-barber-red" />
          <div>
            <h1 className="text-base font-bold uppercase tracking-wide leading-tight">
              {barbershop.name}
            </h1>
            <p className="text-xs text-barber-muted">Agende seu horário</p>
          </div>
        </div>
      </div>

      <div className="space-y-7">
        <Section title="1. Escolha o dia">
          <DaySelector days={days} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </Section>

        <Section title="2. Escolha o serviço">
          <ServiceSelector
            services={services}
            selectedIds={selectedServiceIds}
            onToggle={toggleService}
          />
        </Section>

        <Section title="3. Escolha o profissional">
          <ProfessionalSelector
            professionals={professionals}
            selectedId={selectedProfessionalId}
            onSelect={setSelectedProfessionalId}
          />
        </Section>

        {selectedProfessionalId && (
          <Section title="4. Escolha o horário">
            <TimeSlotGrid slots={slots} selectedTime={selectedTime} onSelect={setSelectedTime} />
          </Section>
        )}
      </div>

      <ConfirmBar
        totalPriceCents={totalPriceCents}
        totalDurationMinutes={totalDurationMinutes}
        disabled={!canConfirm}
        onConfirm={() => setShowWhatsappModal(true)}
      />

      {showWhatsappModal && (
        <WhatsAppModal
          onClose={() => setShowWhatsappModal(false)}
          onSubmit={handleWhatsappSubmit}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 px-6 text-xs font-semibold uppercase tracking-wide text-barber-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

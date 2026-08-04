import { Barbershop, Booking, DayOption, Professional, Service, TimeSlot } from './types';

/**
 * ------------------------------------------------------------------
 * CAMADA DE DADOS (MOCK)
 * ------------------------------------------------------------------
 * Em produção, substitua estas funções por chamadas reais ao banco
 * (ex: Prisma + PostgreSQL/Supabase). A assinatura das funções foi
 * pensada para já refletir o formato de uma camada de repositório,
 * facilitando a troca posterior sem impactar as páginas/componentes.
 * ------------------------------------------------------------------
 */

export const barbershops: Barbershop[] = [
  {
    id: 'bs_1',
    slug: 'barbearia-do-ze',
    name: 'Barbearia do Zé',
    ownerWhatsapp: '5511999990000',
    status: 'active',
    planPriceCents: 1990,
    nextBillingDate: '2026-08-10',
    createdAt: '2026-01-05',
  },
  {
    id: 'bs_2',
    slug: 'barbearia-inadimplente',
    name: 'Barbearia Exemplo Suspensa',
    ownerWhatsapp: '5511988880000',
    status: 'suspended',
    planPriceCents: 1990,
    nextBillingDate: '2026-07-10',
    createdAt: '2025-11-20',
  },
];

export const services: Service[] = [
  { id: 'sv_1', barbershopId: 'bs_1', name: 'Corte', durationMinutes: 30, priceCents: 4000 },
  { id: 'sv_2', barbershopId: 'bs_1', name: 'Barba', durationMinutes: 20, priceCents: 3000 },
  { id: 'sv_3', barbershopId: 'bs_1', name: 'Combo (Corte + Barba)', durationMinutes: 50, priceCents: 6500 },
  { id: 'sv_4', barbershopId: 'bs_1', name: 'Sobrancelha', durationMinutes: 15, priceCents: 1500 },
];

export const professionals: Professional[] = [
  {
    id: 'pf_1',
    barbershopId: 'bs_1',
    name: 'Zé Carlos',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    accentColor: 'red',
  },
  {
    id: 'pf_2',
    barbershopId: 'bs_1',
    name: 'Diego',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    accentColor: 'blue',
  },
  {
    id: 'pf_3',
    barbershopId: 'bs_1',
    name: 'Marcos',
    avatarUrl: 'https://i.pravatar.cc/150?img=51',
    accentColor: 'red',
  },
];

const todayIso = new Date().toISOString().slice(0, 10);

// Alguns agendamentos de exemplo para popular o painel administrativo (demo)
export const bookings: Booking[] = [
  {
    id: 'bk_seed_1',
    barbershopId: 'bs_1',
    serviceIds: ['sv_3'],
    professionalId: 'pf_1',
    clientWhatsapp: '(11) 98765-4321',
    date: todayIso,
    time: '09:00',
    totalPriceCents: 6500,
    totalDurationMinutes: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk_seed_2',
    barbershopId: 'bs_1',
    serviceIds: ['sv_1'],
    professionalId: 'pf_2',
    clientWhatsapp: '(11) 91234-5678',
    date: todayIso,
    time: '11:00',
    totalPriceCents: 4000,
    totalDurationMinutes: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk_seed_3',
    barbershopId: 'bs_1',
    serviceIds: ['sv_2', 'sv_4'],
    professionalId: 'pf_3',
    clientWhatsapp: '(11) 99999-1111',
    date: todayIso,
    time: '15:30',
    totalPriceCents: 4500,
    totalDurationMinutes: 35,
    createdAt: new Date().toISOString(),
  },
];

/** Busca a barbearia pelo slug (simula query async ao banco). */
export async function getBarbershopBySlug(slug: string): Promise<Barbershop | null> {
  await simulateLatency();
  return barbershops.find((b) => b.slug === slug) ?? null;
}

/** Regra de negócio central: acesso liberado apenas se status permitir. */
export function isAccessAllowed(status: Barbershop['status']): boolean {
  return status === 'active' || status === 'trial';
}

export async function getServicesByBarbershop(barbershopId: string): Promise<Service[]> {
  await simulateLatency();
  return services.filter((s) => s.barbershopId === barbershopId);
}

export async function getProfessionalsByBarbershop(barbershopId: string): Promise<Professional[]> {
  await simulateLatency();
  return professionals.filter((p) => p.barbershopId === barbershopId);
}

/** Gera horários fixos de funcionamento e marca alguns como indisponíveis (mock). */
export async function getAvailableSlots(
  _barbershopId: string,
  _professionalId: string,
  _isoDate: string
): Promise<TimeSlot[]> {
  await simulateLatency();
  const slots: TimeSlot[] = [];
  const busy = new Set(['09:30', '10:30', '14:00', '16:30']);
  for (let hour = 9; hour <= 19; hour++) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({ time, available: !busy.has(time) });
    }
  }
  return slots;
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  await simulateLatency();
  const saved: Booking = {
    ...booking,
    id: `bk_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  bookings.push(saved);

  // --- Automação (bastidores) ---
  // Em produção: disparar mensagem via API do WhatsApp (ex: Z-API / Twilio / Meta Cloud API)
  notifyClientWhatsapp(saved);
  // Em produção: emitir evento em tempo real para o painel (ex: Supabase Realtime / Pusher / WebSocket)
  notifyBarberDashboard(saved);

  return saved;
}

function notifyClientWhatsapp(booking: Booking) {
  console.log(`[WhatsApp] Confirmação enviada para ${booking.clientWhatsapp} sobre agendamento ${booking.id}`);
}

function notifyBarberDashboard(booking: Booking) {
  console.log(`[Realtime] Novo agendamento notificado ao painel: ${booking.id}`);
}

export async function getBookingsByBarbershopAndDate(
  barbershopId: string,
  isoDate: string
): Promise<Booking[]> {
  await simulateLatency();
  return bookings
    .filter((b) => b.barbershopId === barbershopId && b.date === isoDate)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function simulateLatency() {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

/** Gera os próximos N dias a partir de hoje, no formato usado pelo seletor de dias. */
export function buildNextDays(count = 10): DayOption[] {
  const weekdayLabels = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const days: DayOption[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      isoDate: date.toISOString().slice(0, 10),
      weekdayLabel: weekdayLabels[date.getDay()],
      dayNumber: String(date.getDate()).padStart(2, '0'),
      isToday: i === 0,
    });
  }
  return days;
}

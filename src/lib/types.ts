export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'suspended';

export interface Barbershop {
  id: string;
  slug: string;
  name: string;
  ownerWhatsapp: string;
  status: SubscriptionStatus;
  planPriceCents: number; // 1990 = R$ 19,90
  nextBillingDate: string; // ISO date
  createdAt: string;
}

export interface Service {
  id: string;
  barbershopId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

export interface Professional {
  id: string;
  barbershopId: string;
  name: string;
  avatarUrl: string;
  accentColor: 'red' | 'blue';
}

export interface TimeSlot {
  time: string; // "14:30"
  available: boolean;
}

export interface Client {
  id: string;
  whatsapp: string;
  name?: string;
}

export interface Booking {
  id: string;
  barbershopId: string;
  serviceIds: string[];
  professionalId: string;
  clientWhatsapp: string;
  date: string; // ISO date (dia selecionado)
  time: string; // "14:30"
  totalPriceCents: number;
  totalDurationMinutes: number;
  createdAt: string;
}

export interface DayOption {
  isoDate: string;
  weekdayLabel: string; // "SEG"
  dayNumber: string; // "25"
  isToday: boolean;
}

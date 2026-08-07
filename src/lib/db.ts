import type { SupabaseClient } from '@supabase/supabase-js';
import { createPublicSupabaseClient } from './supabase/public-client';
import {
  Barbershop,
  Booking,
  DayOption,
  Professional,
  Service,
  SubscriptionStatus,
  TimeSlot,
} from './types';

/**
 * ------------------------------------------------------------------
 * CAMADA DE DADOS — Supabase (Postgres)
 * ------------------------------------------------------------------
 * Todas as funções aqui usam a chave PÚBLICA (anon), então tudo
 * respeita as policies de Row Level Security definidas em
 * supabase/schema.sql. Isso é o que é seguro chamar a partir de
 * páginas públicas ([slug]) e Server Actions do cliente final.
 *
 * O painel admin usa um cliente separado com a service_role key
 * (veja src/lib/supabase/admin-client.ts), que ignora RLS.
 * ------------------------------------------------------------------
 */

// ---- Mapeadores: snake_case (banco) -> camelCase (app) ----

function mapBarbershop(row: any): Barbershop {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ownerWhatsapp: row.owner_whatsapp,
    status: row.status,
    planPriceCents: row.plan_price_cents,
    nextBillingDate: row.next_billing_date,
    createdAt: row.created_at,
  };
}

function mapService(row: any): Service {
  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents,
  };
}

function mapProfessional(row: any): Professional {
  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    name: row.name,
    avatarUrl: row.avatar_url,
    accentColor: row.accent_color,
  };
}

function mapBooking(row: any): Booking {
  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    serviceIds: (row.booking_services ?? []).map((bs: any) => bs.service_id),
    professionalId: row.professional_id,
    clientWhatsapp: row.client_whatsapp,
    date: row.booking_date,
    time: row.booking_time,
    totalPriceCents: row.total_price_cents,
    totalDurationMinutes: row.total_duration_minutes,
    createdAt: row.created_at,
  };
}

// ---- Leitura ----

/** Busca a barbearia pelo slug. */
export async function getBarbershopBySlug(slug: string): Promise<Barbershop | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('barbershops')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapBarbershop(data) : null;
}

/** Regra de negócio central: acesso liberado apenas se status permitir. */
export function isAccessAllowed(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trial';
}

export async function getServicesByBarbershop(barbershopId: string): Promise<Service[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('price_cents', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapService);
}

export async function getProfessionalsByBarbershop(barbershopId: string): Promise<Professional[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProfessional);
}

/**
 * Gera os horários de funcionamento e marca como indisponíveis os
 * que já têm agendamento confirmado para aquele profissional/dia.
 */
export async function getAvailableSlots(
  _barbershopId: string,
  professionalId: string,
  isoDate: string
): Promise<TimeSlot[]> {
  const supabase = createPublicSupabaseClient();

  // Lê os horários já ocupados via RPC — veja nota no schema.sql:
  // a leitura direta de `bookings` é bloqueada por RLS para a chave
  // pública, então usamos uma function no banco (security definer)
  // que expõe só os horários ocupados, sem vazar dado do cliente.
  const { data, error } = await supabase.rpc('get_busy_times', {
    p_professional_id: professionalId,
    p_date: isoDate,
  });

  if (error) throw error;
  const busy = new Set<string>((data ?? []).map((r: any) => r.booking_time));

  const slots: TimeSlot[] = [];
  for (let hour = 9; hour <= 19; hour++) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({ time, available: !busy.has(time) });
    }
  }
  return slots;
}

/** Usado pelo painel admin (chave service_role, ignora RLS) — veja admin/page.tsx */
export async function getBookingsByBarbershopAndDate(
  barbershopId: string,
  isoDate: string,
  supabaseAdminClient: SupabaseClient
): Promise<Booking[]> {
  const { data, error } = await supabaseAdminClient
    .from('bookings')
    .select('*, booking_services(service_id)')
    .eq('barbershop_id', barbershopId)
    .eq('booking_date', isoDate)
    .order('booking_time', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

// ---- Escrita ----

export async function createBarbershop(input: {
  name: string;
  slug: string;
  ownerWhatsapp: string;
}): Promise<Barbershop> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('barbershops')
    .insert({
      name: input.name,
      slug: input.slug,
      owner_whatsapp: input.ownerWhatsapp,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBarbershop(data);
}

// A criação de agendamento virou uma Server Action — veja
// src/lib/actions.ts — porque, além de gravar no banco, ela também
// dispara a confirmação via WhatsApp usando uma credencial secreta
// (Z-API) que não pode existir no navegador.

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

export { mapBarbershop, mapService, mapProfessional, mapBooking };

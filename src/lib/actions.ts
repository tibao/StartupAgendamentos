'use server';

import { createPublicSupabaseClient } from './supabase/public-client';
import { mapBooking } from './db';
import { sendWhatsAppMessage } from './whatsapp/send-message';
import { buildBookingConfirmationMessage } from './whatsapp/templates';
import { Booking } from './types';

interface CreateBookingActionInput {
  barbershopId: string;
  barbershopName: string;
  serviceIds: string[];
  serviceNames: string[];
  professionalId: string;
  professionalName: string;
  clientWhatsapp: string;
  date: string;
  dateLabel: string;
  time: string;
  totalPriceCents: number;
  totalDurationMinutes: number;
}

export async function createBookingAction(
  input: CreateBookingActionInput
): Promise<Booking> {
  const supabase = createPublicSupabaseClient();

  const { data: inserted, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      barbershop_id: input.barbershopId,
      professional_id: input.professionalId,
      client_whatsapp: input.clientWhatsapp,
      booking_date: input.date,
      booking_time: input.time,
      total_price_cents: input.totalPriceCents,
      total_duration_minutes: input.totalDurationMinutes,
    })
    .select()
    .single();

  if (bookingError) throw bookingError;

  const { error: linkError } = await supabase.from('booking_services').insert(
    input.serviceIds.map((serviceId) => ({
      booking_id: inserted.id,
      service_id: serviceId,
    }))
  );

  if (linkError) throw linkError;

  const saved = mapBooking({
    ...inserted,
    booking_services: input.serviceIds.map((id) => ({ service_id: id })),
  });

  // Confirmação via WhatsApp é "best-effort": se a Z-API falhar, o
  // agendamento já está garantido no banco, não faz sentido derrubar
  // a reserva do cliente por causa disso. O erro só fica logado.
  const message = buildBookingConfirmationMessage({
    barbershopName: input.barbershopName,
    serviceNames: input.serviceNames,
    professionalName: input.professionalName,
    dateLabel: input.dateLabel,
    time: input.time,
    totalPriceCents: input.totalPriceCents,
  });

  const notification = await sendWhatsAppMessage({
    to: input.clientWhatsapp,
    message,
  });

  if (!notification.ok) {
    console.error(
      `[WhatsApp] Agendamento ${saved.id} criado, mas a confirmação não foi enviada (${notification.error}).`
    );
  }

  return saved;
}

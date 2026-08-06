import { notFound } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/admin-client';
import {
  getBookingsByBarbershopAndDate,
  getProfessionalsByBarbershop,
  getServicesByBarbershop,
  mapBarbershop,
} from '@/lib/db';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

// Sem autenticação ainda: por enquanto o painel sempre abre a
// barbearia de demonstração. Quando o login do barbeiro (Supabase
// Auth) existir, troque isso pela barbearia da sessão logada.
const DEMO_SLUG = 'barbearia-do-ze';

// Dados do dia mudam o tempo todo — nunca cachear/prerenderizar.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabaseAdmin = createAdminSupabaseClient();

  const { data: barbershopRow, error } = await supabaseAdmin
    .from('barbershops')
    .select('*')
    .eq('slug', DEMO_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!barbershopRow) notFound();

  const barbershop = mapBarbershop(barbershopRow);
  const todayIso = new Date().toISOString().slice(0, 10);

  const [services, professionals, todayBookings] = await Promise.all([
    getServicesByBarbershop(barbershop.id),
    getProfessionalsByBarbershop(barbershop.id),
    getBookingsByBarbershopAndDate(barbershop.id, todayIso, supabaseAdmin),
  ]);

  return (
    <AdminDashboard
      barbershop={barbershop}
      todayBookings={todayBookings}
      services={services}
      professionals={professionals}
    />
  );
}

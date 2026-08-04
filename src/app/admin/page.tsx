import {
  barbershops,
  getBookingsByBarbershopAndDate,
  getProfessionalsByBarbershop,
  getServicesByBarbershop,
} from '@/lib/mock-db';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

// NOTA: em produção, a barbearia autenticada viria da sessão/token do
// barbeiro logado (ex: NextAuth / Supabase Auth), não de um índice fixo.
export default async function AdminPage() {
  const barbershop = barbershops[0];
  const todayIso = new Date().toISOString().slice(0, 10);

  const [services, professionals, todayBookings] = await Promise.all([
    getServicesByBarbershop(barbershop.id),
    getProfessionalsByBarbershop(barbershop.id),
    getBookingsByBarbershopAndDate(barbershop.id, todayIso),
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

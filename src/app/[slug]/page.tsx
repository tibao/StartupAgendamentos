import { notFound } from 'next/navigation';
import {
  getBarbershopBySlug,
  getProfessionalsByBarbershop,
  getServicesByBarbershop,
} from '@/lib/db';
import { BookingFlow } from '@/components/booking/BookingFlow';

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const barbershop = await getBarbershopBySlug(params.slug);
  if (!barbershop) notFound();

  const [services, professionals] = await Promise.all([
    getServicesByBarbershop(barbershop.id),
    getProfessionalsByBarbershop(barbershop.id),
  ]);

  return (
    <BookingFlow barbershop={barbershop} services={services} professionals={professionals} />
  );
}

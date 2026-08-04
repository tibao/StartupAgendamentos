import { notFound } from 'next/navigation';
import { getBarbershopBySlug, isAccessAllowed } from '@/lib/mock-db';
import { SuspendedScreen } from '@/components/SuspendedScreen';

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const barbershop = await getBarbershopBySlug(params.slug);

  if (!barbershop) {
    notFound();
  }

  // Regra de negócio central: se a barbearia estiver inadimplente/suspensa,
  // bloqueia completamente o acesso à página pública de agendamento.
  if (!isAccessAllowed(barbershop.status)) {
    return <SuspendedScreen barbershopName={barbershop.name} status={barbershop.status} />;
  }

  return <>{children}</>;
}

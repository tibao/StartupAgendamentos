interface BookingConfirmationParams {
  barbershopName: string;
  serviceNames: string[];
  professionalName: string;
  dateLabel: string;
  time: string;
  totalPriceCents: number;
}

export function buildBookingConfirmationMessage({
  barbershopName,
  serviceNames,
  professionalName,
  dateLabel,
  time,
  totalPriceCents,
}: BookingConfirmationParams): string {
  const price = (totalPriceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return [
    `Seu horário na *${barbershopName}* foi confirmado ✅`,
    '',
    `📅 ${dateLabel} às ${time}`,
    `✂️ ${serviceNames.join(' + ')}`,
    `💈 Profissional: ${professionalName}`,
    `💰 Valor: ${price}`,
    '',
    'Até breve!',
  ].join('\n');
}

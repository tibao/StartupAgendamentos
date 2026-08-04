import { AlertTriangle } from 'lucide-react';
import { SubscriptionStatus } from '@/lib/types';

export function SuspendedScreen({
  barbershopName,
  status,
}: {
  barbershopName: string;
  status: SubscriptionStatus;
}) {
  const message =
    status === 'past_due'
      ? 'O pagamento da assinatura está em atraso.'
      : 'O acesso a esta página foi suspenso pelo administrador.';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-barber-bg px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center border border-barber-red text-barber-red">
        <AlertTriangle size={26} />
      </div>
      <h1 className="mt-6 text-xl font-bold">Agenda indisponível</h1>
      <p className="mt-2 max-w-xs text-sm text-barber-muted">
        {barbershopName} está temporariamente fora do ar. {message}
      </p>
      <p className="mt-6 max-w-xs text-xs text-barber-muted">
        Se você é o proprietário, regularize sua assinatura para reativar o
        link imediatamente.
      </p>
    </main>
  );
}

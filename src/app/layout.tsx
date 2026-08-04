import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'App Agendamentos | Sistema de agendamento para barbearias',
  description:
    'A forma mais simples de agendar clientes na sua barbearia. Assine por R$ 19,90/mês.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-barber-bg font-sans antialiased text-white">
        {children}
      </body>
    </html>
  );
}

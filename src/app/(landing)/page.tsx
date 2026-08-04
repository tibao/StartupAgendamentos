import Link from 'next/link';
import { Scissors, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BarberStripe } from '@/components/BarberStripe';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-barber-bg">
      <BarberStripe />

      {/* MARCA */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Scissors size={16} className="text-barber-red" />
          <span className="text-sm font-bold uppercase tracking-wide">
            App Agendamentos
          </span>
        </div>
        <Link
          href="/cadastro"
          className="text-xs font-bold uppercase tracking-wide text-barber-muted underline underline-offset-4"
        >
          Entrar
        </Link>
      </div>

      {/* HERO */}
      <section className="px-6 pb-10 pt-6">
        <h1 className="text-[13vw] font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
          Sua
          <br />
          barbearia
          <br />
          <span className="text-barber-red">sem fila</span>
          <br />
          de WhatsApp
        </h1>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-barber-muted">
          O cliente escolhe o dia, o serviço e o horário sozinho. Você só
          precisa aparecer e cortar. Um link, uma agenda, R$ 19,90 por mês.
        </p>
        <Link href="/cadastro" className="mt-7 inline-block">
          <Button>
            Criar minha barbearia <ArrowRight size={14} />
          </Button>
        </Link>
      </section>

      <BarberStripe className="opacity-60" />

      {/* COMO FUNCIONA — lista numerada de um processo real, não decoração */}
      <section className="px-6 py-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-barber-muted">
          Como funciona
        </h2>
        <ol className="mt-5 divide-y divide-barber-border">
          <Step n="01" title="Cadastre sua barbearia">
            Nome, WhatsApp e o endereço que vai virar seu link.
          </Step>
          <Step n="02" title="Assine por R$ 19,90/mês">
            Sem contrato. Cancela quando quiser, direto pelo painel.
          </Step>
          <Step n="03" title="Compartilhe seu link">
            appagendamentos.com/sua-barbearia — cole no Instagram e pronto.
          </Step>
          <Step n="04" title="Clientes agendam sozinhos">
            Você recebe a confirmação e a agenda do dia já organizada.
          </Step>
        </ol>
      </section>

      <BarberStripe className="opacity-60" />

      {/* QUADRO DE PREÇO — estilo cardápio/quadro de barbearia, não card de pricing genérico */}
      <section className="px-6 py-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-barber-muted">
          Assinatura
        </h2>
        <div className="mt-5 border border-barber-border p-5 font-mono text-sm">
          <PriceLine label="Agendamento online" value="ilimitado" />
          <PriceLine label="Link exclusivo da barbearia" value="incluso" />
          <PriceLine label="Confirmação por WhatsApp" value="incluso" />
          <PriceLine label="Painel de agenda e caixa" value="incluso" />
          <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-barber-border pt-3">
            <span className="font-sans text-xs font-bold uppercase tracking-wide text-barber-muted">
              Mensalidade
            </span>
            <span className="text-2xl font-bold text-white">R$ 19,90</span>
          </div>
        </div>
        <Link href="/cadastro" className="mt-5 block">
          <Button fullWidth>Assinar agora</Button>
        </Link>
        <p className="mt-3 text-center text-[11px] text-barber-muted">
          Atraso no pagamento suspende o link automaticamente até a
          regularização.
        </p>
      </section>

      <footer className="px-6 py-8 text-center text-[11px] text-barber-muted">
        © {new Date().getFullYear()} App Agendamentos
      </footer>
      <BarberStripe />
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 py-4">
      <span className="font-mono text-xs text-barber-red">{n}</span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-sm text-barber-muted">{children}</p>
      </div>
    </li>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 py-1 text-barber-muted">
      <span>{label}</span>
      <span className="flex-1 border-b border-dotted border-barber-border" />
      <span className="text-white">{value}</span>
    </div>
  );
}

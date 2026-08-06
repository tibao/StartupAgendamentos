'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Scissors, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BarberStripe } from '@/components/BarberStripe';
import { slugify, formatWhatsappInput } from '@/lib/utils';
import { createBarbershop, getBarbershopBySlug } from '@/lib/db';

type Step = 'dados' | 'plano' | 'processando' | 'sucesso' | 'erro';
type SlugCheck = 'idle' | 'checking' | 'available' | 'taken';

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('dados');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [slugCheck, setSlugCheck] = useState<SlugCheck>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const finalSlug = slugTouched ? slug : slugify(name);

  // Verifica disponibilidade do slug no banco, com debounce, sempre
  // que ele muda. Isso é uma checagem de conveniência para a UI —
  // a garantia de verdade é a constraint UNIQUE no banco.
  useEffect(() => {
    if (finalSlug.length < 3) {
      setSlugCheck('idle');
      return;
    }
    setSlugCheck('checking');
    const timeout = setTimeout(async () => {
      try {
        const existing = await getBarbershopBySlug(finalSlug);
        setSlugCheck(existing ? 'taken' : 'available');
      } catch {
        setSlugCheck('idle');
      }
    }, 450);
    return () => clearTimeout(timeout);
  }, [finalSlug]);

  const canContinueDados =
    name.trim().length >= 3 &&
    whatsapp.replace(/\D/g, '').length >= 10 &&
    slugCheck === 'available';

  async function handleSubscribe() {
    setStep('processando');
    try {
      // NOTA: aqui ainda não existe integração real de pagamento.
      // Em produção, este passo chamaria o checkout do gateway
      // (Stripe/Mercado Pago) e o status só viraria 'active' quando
      // o webhook de pagamento confirmado chegasse. Por enquanto,
      // toda barbearia nasce como 'trial' — a trigger do banco
      // garante isso mesmo que o código do front tente outra coisa.
      await createBarbershop({ name, slug: finalSlug, ownerWhatsapp: whatsapp });
      setStep('sucesso');
    } catch (err: any) {
      setErrorMessage(
        err?.code === '23505'
          ? 'Esse link acabou de ser registrado por outra pessoa. Escolha outro.'
          : 'Não foi possível concluir o cadastro. Tente novamente.'
      );
      setStep('erro');
    }
  }

  return (
    <main className="min-h-screen bg-barber-bg">
      <BarberStripe />

      <div className="mx-auto max-w-sm px-6 py-10">
        <div className="mb-8 flex items-center gap-2">
          <Scissors size={16} className="text-barber-red" />
          <span className="text-sm font-bold uppercase tracking-wide">
            App Agendamentos
          </span>
        </div>

        {step === 'dados' && (
          <div>
            <p className="font-mono text-xs text-barber-red">01 / 02</p>
            <h1 className="mt-2 text-2xl font-black uppercase leading-tight">
              Crie sua barbearia
            </h1>
            <p className="mt-2 text-sm text-barber-muted">
              Menos de um minuto. Depois é só assinar.
            </p>

            <div className="mt-7 space-y-5">
              <Field label="Nome da barbearia">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Barbearia do Zé"
                  className="input-field"
                />
              </Field>

              <Field label="Seu link">
                <div className="flex items-center border-b border-barber-border py-2 text-sm">
                  <span className="text-barber-muted">appagendamentos.com/</span>
                  <input
                    value={finalSlug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="sua-barbearia"
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
                {slugCheck === 'checking' && (
                  <p className="mt-1.5 text-xs text-barber-muted">Verificando...</p>
                )}
                {slugCheck === 'taken' && (
                  <p className="mt-1.5 text-xs text-barber-red">
                    Esse link já está em uso.
                  </p>
                )}
                {slugCheck === 'available' && (
                  <p className="mt-1.5 text-xs text-white">Link disponível.</p>
                )}
              </Field>

              <Field label="Seu WhatsApp">
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatWhatsappInput(e.target.value))}
                  placeholder="(11) 99999-0000"
                  className="input-field"
                />
              </Field>
            </div>

            <Button
              fullWidth
              className="mt-8"
              disabled={!canContinueDados}
              onClick={() => setStep('plano')}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 'plano' && (
          <div>
            <p className="font-mono text-xs text-barber-red">02 / 02</p>
            <h1 className="mt-2 text-2xl font-black uppercase leading-tight">
              Assine o plano
            </h1>
            <p className="mt-2 text-sm text-barber-muted">{finalSlug}</p>

            <div className="mt-6 border border-barber-border p-5 font-mono text-sm">
              <PriceLine label="Agendamento online" value="ilimitado" />
              <PriceLine label="Painel administrativo" value="incluso" />
              <PriceLine label="Confirmação por WhatsApp" value="incluso" />
              <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-barber-border pt-3">
                <span className="font-sans text-xs font-bold uppercase tracking-wide text-barber-muted">
                  Mensalidade
                </span>
                <span className="text-2xl font-bold text-white">R$ 19,90</span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-barber-muted">
              Pagamento recorrente processado com segurança. Assinatura em
              atraso suspende seu link até a regularização.
            </p>

            <Button fullWidth className="mt-7" onClick={handleSubscribe}>
              Confirmar assinatura
            </Button>
            <button
              onClick={() => setStep('dados')}
              className="mt-4 w-full text-center text-xs text-barber-muted underline underline-offset-4"
            >
              Voltar
            </button>
          </div>
        )}

        {step === 'processando' && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Loader2 className="animate-spin text-barber-red" size={28} />
            <p className="text-sm text-barber-muted">Criando sua barbearia...</p>
          </div>
        )}

        {step === 'erro' && (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center border border-barber-red text-barber-red">
              <AlertCircle size={26} />
            </span>
            <h1 className="mt-6 text-xl font-black uppercase">Algo deu errado</h1>
            <p className="mt-2 text-sm text-barber-muted">{errorMessage}</p>
            <Button fullWidth className="mt-8" onClick={() => setStep('dados')}>
              Tentar de novo
            </Button>
          </div>
        )}

        {step === 'sucesso' && (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center border border-barber-red text-barber-red">
              <Check size={26} strokeWidth={3} />
            </span>
            <h1 className="mt-6 text-2xl font-black uppercase">
              Barbearia criada
            </h1>
            <p className="mt-2 text-sm text-barber-muted">Seu link já está no ar:</p>
            <p className="mt-3 font-mono text-sm text-barber-red">
              appagendamentos.com/{finalSlug}
            </p>
            <Button fullWidth className="mt-8" onClick={() => router.push('/admin')}>
              Ir para o meu painel
            </Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: none;
          border-bottom: 1px solid #2a2a2e;
          background: transparent;
          padding: 0.5rem 0;
          font-size: 0.9375rem;
          color: white;
          outline: none;
        }
        .input-field::placeholder {
          color: #8a8a93;
        }
        .input-field:focus {
          border-bottom-color: #dc2626;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-barber-muted">
        {label}
      </span>
      {children}
    </label>
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

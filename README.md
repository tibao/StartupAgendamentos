# App Agendamentos

Vertical Micro-SaaS de agendamento para barbearias locais, com assinatura mensal de **R$ 19,90**, onboarding 100% self-service e suspensão automática de acesso em caso de inadimplência.

## Stack

- **Next.js 14 (App Router)** — front-end e back-end no mesmo projeto
- **TypeScript**
- **Tailwind CSS** — mobile-first, tema dark sofisticado inspirado no "Barber Pole" (vermelho `#dc2626` + azul `#2563eb` sobre fundo `#121214`)
- **lucide-react** — ícones

## Estrutura de rotas

```
src/app/
  (landing)/
    page.tsx              -> Site institucional de vendas do SaaS
    cadastro/page.tsx      -> Onboarding: dados da barbearia, slug e assinatura de R$ 19,90
  [slug]/
    layout.tsx             -> Valida status da assinatura (active/trial/past_due/suspended)
    page.tsx                -> Tela pública de agendamento (mobile-first)
  admin/
    page.tsx                -> Painel do barbeiro: agenda do dia, serviços e caixa
```

## Regra de negócio central (inadimplência)

Toda requisição para `src/app/[slug]/*` passa pelo `layout.tsx`, que busca a barbearia pelo slug e verifica `isAccessAllowed(status)`. Se o status for `past_due` ou `suspended`, o cliente final vê a `SuspendedScreen` em vez da agenda — bloqueando 100% do fluxo de reserva até a regularização do pagamento.

## Camada de dados (mock)

Todo o "banco de dados" está simulado em `src/lib/mock-db.ts`, com funções assíncronas já no formato de um repositório (`getBarbershopBySlug`, `createBooking`, etc). Isso torna trivial a troca futura por uma camada real, por exemplo:

- **Banco:** Prisma + PostgreSQL (Supabase/Neon/Railway)
- **Pagamentos recorrentes:** Stripe Billing, Mercado Pago Assinaturas ou Pagar.me — com webhook que atualiza `status` para `past_due`/`suspended` automaticamente quando uma cobrança falha
- **WhatsApp:** Meta Cloud API, Twilio ou Z-API para disparo de confirmação (`notifyClientWhatsapp`)
- **Realtime no painel:** Supabase Realtime, Pusher ou WebSocket (`notifyBarberDashboard`)
- **Autenticação do barbeiro:** NextAuth ou Supabase Auth para proteger `/admin`

## Tipografia

O projeto usa a stack de fontes nativas do sistema (`system-ui`) para não depender de fetch externo durante o build. Se preferir a fonte Inter, basta reativar `next/font/google` em `src/app/layout.tsx` (removido aqui apenas por restrição de rede do ambiente de geração deste projeto).

## Rodando localmente

```bash
npm install
npm run dev
```

Rotas de demonstração:

- `/` — landing page
- `/cadastro` — onboarding do barbeiro
- `/barbearia-do-ze` — agenda pública ativa
- `/barbearia-inadimplente` — exemplo de acesso bloqueado por inadimplência
- `/admin` — painel do barbeiro (dados da barbearia demo)
# StartupAgendamentos

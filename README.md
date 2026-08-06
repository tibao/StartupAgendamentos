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

## Banco de dados: Supabase (PostgreSQL)

O projeto está conectado a um banco real — não é mais mock.

### 1. Rodar o schema

No seu projeto Supabase, abra **SQL Editor** → **New query**, cole o conteúdo de `supabase/schema.sql` e rode. Isso cria as tabelas (`barbershops`, `services`, `professionals`, `bookings`, `booking_services`), as policies de Row Level Security, a function `get_busy_times` e insere duas barbearias de exemplo (`barbearia-do-ze` ativa, `barbearia-inadimplente` suspensa) com serviços e profissionais.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha com os valores de **Project Settings → API** do seu projeto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

A `SUPABASE_SERVICE_ROLE_KEY` **nunca** deve ter o prefixo `NEXT_PUBLIC_` — ela só é usada em `src/lib/supabase/admin-client.ts`, que tem `import 'server-only'` para o build quebrar caso algum componente client tente importá-la por engano.

### 3. Como a arquitetura de dados funciona

- **`src/lib/db.ts`** — todas as leituras/escritas públicas (ler barbearia por slug, serviços, profissionais, checar horários disponíveis, criar agendamento, cadastrar barbearia). Usa a chave `anon`, então tudo passa pelas regras de Row Level Security do `schema.sql`.
- **`src/lib/supabase/admin-client.ts`** — cliente com `service_role`, ignora RLS. Usado só pelo painel `/admin` para ler os agendamentos do dia (a chave pública não tem permissão de `SELECT` em `bookings`, de propósito, pra não vazar o WhatsApp de um cliente para o outro).
- **Segurança da assinatura**: uma trigger no banco (`enforce_new_barbershop_status`) força toda barbearia recém-cadastrada a nascer com `status = 'trial'`, mesmo que alguém tente inserir `status = 'active'` direto pela chave pública. Só um webhook de pagamento rodando com `service_role` deve poder promover para `active`.

### O que ainda falta pra produção

- **Pagamento recorrente**: `handleSubscribe` em `cadastro/page.tsx` hoje só cria a barbearia como `trial`. Falta o checkout do gateway (Stripe/Mercado Pago) e um webhook (Route Handler em `src/app/api/webhooks/...`) que atualiza `status` conforme o pagamento.
- **WhatsApp**: `notifyClientWhatsapp` em `db.ts` só faz `console.log`. Trocar pela Meta Cloud API, Twilio ou Z-API.
- **Autenticação do barbeiro**: `/admin` ainda abre sempre a barbearia de demonstração (`DEMO_SLUG`). Falta Supabase Auth pra saber qual barbearia pertence a quem está logado.
- **Realtime no painel**: o schema já suporta (basta assinar `postgres_changes` na tabela `bookings` filtrando por `barbershop_id`), mas o componente do admin ainda carrega os dados só na abertura da página.

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

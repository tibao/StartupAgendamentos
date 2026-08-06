-- ============================================================
-- App Agendamentos — schema inicial
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Dashboard → SQL Editor → New query → colar → Run)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- BARBEARIAS
-- ------------------------------------------------------------
create table if not exists barbershops (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  owner_whatsapp text not null,
  status text not null default 'trial'
    check (status in ('active', 'trial', 'past_due', 'suspended')),
  plan_price_cents int not null default 1990,
  next_billing_date date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SERVIÇOS
-- ------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops(id) on delete cascade,
  name text not null,
  duration_minutes int not null,
  price_cents int not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PROFISSIONAIS
-- ------------------------------------------------------------
create table if not exists professionals (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops(id) on delete cascade,
  name text not null,
  avatar_url text,
  accent_color text not null default 'red' check (accent_color in ('red', 'blue')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- AGENDAMENTOS
-- Preço/duração ficam "congelados" na linha (snapshot no momento
-- da reserva), pois o preço do serviço pode mudar depois.
-- ------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references barbershops(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete restrict,
  client_whatsapp text not null,
  booking_date date not null,
  booking_time text not null,
  total_price_cents int not null,
  total_duration_minutes int not null,
  created_at timestamptz not null default now()
);

-- Tabela de junção: quais serviços compõem cada agendamento
create table if not exists booking_services (
  booking_id uuid not null references bookings(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  primary key (booking_id, service_id)
);

create index if not exists idx_services_barbershop on services(barbershop_id);
create index if not exists idx_professionals_barbershop on professionals(barbershop_id);
create index if not exists idx_bookings_barbershop_date on bookings(barbershop_id, booking_date);
create index if not exists idx_bookings_professional_date on bookings(professional_id, booking_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table barbershops enable row level security;
alter table services enable row level security;
alter table professionals enable row level security;
alter table bookings enable row level security;
alter table booking_services enable row level security;

-- Barbearia, serviços e profissionais são "vitrine pública":
-- qualquer cliente final precisa poder ler para montar a agenda.
create policy "Publico pode ver barbearias" on barbershops
  for select using (true);

-- Cadastro é self-service (o barbeiro se registra sozinho), então
-- a chave pública precisa poder inserir. Para não deixar ninguém
-- "ativar a própria assinatura" direto pelo insert, uma trigger
-- abaixo força toda barbearia nova a nascer como 'trial' — só o
-- webhook de pagamento (rodando com service_role) pode promovê-la
-- para 'active'.
create policy "Qualquer um pode cadastrar sua barbearia" on barbershops
  for insert with check (true);

create or replace function enforce_new_barbershop_status()
returns trigger
language plpgsql
as $$
begin
  new.status := 'trial';
  new.next_billing_date := null;
  return new;
end;
$$;

drop trigger if exists trg_enforce_new_barbershop_status on barbershops;
create trigger trg_enforce_new_barbershop_status
  before insert on barbershops
  for each row execute function enforce_new_barbershop_status();

create policy "Publico pode ver servicos" on services
  for select using (true);

create policy "Publico pode ver profissionais" on professionals
  for select using (true);

-- Qualquer pessoa pode CRIAR um agendamento (é o cliente final
-- reservando um horário), mas ninguém consegue LER agendamentos
-- pela chave pública — só o painel admin, via service_role key,
-- que ignora RLS. Assim a agenda de um cliente não vaza pra outro.
create policy "Qualquer um pode criar agendamento" on bookings
  for insert with check (true);

create policy "Qualquer um pode vincular servicos ao agendamento" on booking_services
  for insert with check (true);

-- ------------------------------------------------------------
-- FUNÇÃO: horários ocupados de um profissional em um dia
-- ------------------------------------------------------------
-- A tabela `bookings` não tem policy de SELECT para a chave
-- pública (de propósito, protege o WhatsApp do cliente). Mas o
-- site público precisa saber QUAIS horários já estão ocupados
-- para desenhar a grade de horários. Esta function roda com
-- privilégio elevado (security definer) e devolve só o horário,
-- nada de dado do cliente.
create or replace function get_busy_times(p_professional_id uuid, p_date date)
returns table (booking_time text)
language sql
security definer
set search_path = public
as $$
  select booking_time
  from bookings
  where professional_id = p_professional_id
    and booking_date = p_date;
$$;

grant execute on function get_busy_times(uuid, date) to anon, authenticated;

-- ============================================================
-- DADOS DE EXEMPLO (equivalentes ao mock anterior)
-- Rode só se quiser começar com dados de teste.
-- ============================================================
insert into barbershops (slug, name, owner_whatsapp, status, plan_price_cents, next_billing_date)
values
  ('barbearia-do-ze', 'Barbearia do Zé', '5511999990000', 'active', 1990, '2026-09-10'),
  ('barbearia-inadimplente', 'Barbearia Exemplo Suspensa', '5511988880000', 'suspended', 1990, '2026-07-10')
on conflict (slug) do nothing;

insert into services (barbershop_id, name, duration_minutes, price_cents)
select id, s.name, s.duration_minutes, s.price_cents
from barbershops, (values
  ('Corte', 30, 4000),
  ('Barba', 20, 3000),
  ('Combo (Corte + Barba)', 50, 6500),
  ('Sobrancelha', 15, 1500)
) as s(name, duration_minutes, price_cents)
where barbershops.slug = 'barbearia-do-ze';

insert into professionals (barbershop_id, name, avatar_url, accent_color)
select id, p.name, p.avatar_url, p.accent_color
from barbershops, (values
  ('Zé Carlos', 'https://i.pravatar.cc/150?img=12', 'red'),
  ('Diego', 'https://i.pravatar.cc/150?img=33', 'blue'),
  ('Marcos', 'https://i.pravatar.cc/150?img=51', 'red')
) as p(name, avatar_url, accent_color)
where barbershops.slug = 'barbearia-do-ze';

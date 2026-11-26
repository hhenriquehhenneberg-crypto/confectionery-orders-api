-- Execute somente no banco que já contém customers e orders.
-- Esta atualização adiciona payments sem apagar ou recriar os registros existentes.
begin;
create table public.payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete restrict,
    amount numeric(10,2) not null check (amount > 0),
    method varchar(20) not null check (method in ('pix','cash','credit_card','debit_card')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index idx_payments_order_id on public.payments(order_id);
create trigger payments_updated_at before update on public.payments
for each row execute function public.set_confectionery_updated_at();
alter table public.payments enable row level security;
commit;

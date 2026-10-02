begin;

-- Clientes
create table public.customers (
    id uuid primary key default gen_random_uuid(),
    name varchar(120) not null check (length(btrim(name)) > 0),
    phone varchar(30) not null check (length(btrim(phone)) > 0),
    email varchar(150),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Encomendas
create table public.orders (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null,
    title varchar(150) not null check (length(btrim(title)) > 0),
    description varchar(500),
    occasion varchar(30),
    delivery_date timestamptz not null,
    total_price numeric(10,2) not null,
    status varchar(30) not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_orders_customer foreign key (customer_id) references public.customers(id) on delete restrict,
    constraint chk_orders_price check (total_price >= 0),
    constraint chk_orders_status check (status in ('pending','confirmed','in_production','ready','delivered','cancelled')),
    constraint chk_orders_occasion check (occasion is null or occasion in ('birthday','wedding','party','corporate','other'))
);
create index idx_orders_customer_id on public.orders(customer_id);
-- Atualiza updated_at
create function public.set_confectionery_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
    new.updated_at = clock_timestamp();
    return new;
end;
$$;
create trigger customers_updated_at before update on public.customers
for each row execute function public.set_confectionery_updated_at();
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_confectionery_updated_at();
alter table public.customers enable row level security;
alter table public.orders enable row level security;
commit;

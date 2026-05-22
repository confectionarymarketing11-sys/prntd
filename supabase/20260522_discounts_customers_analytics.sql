create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'discount_type') then
    create type public.discount_type as enum ('percentage', 'fixed_amount', 'free_shipping');
  end if;

  if not exists (select 1 from pg_type where typname = 'discount_status') then
    create type public.discount_status as enum ('active', 'inactive', 'expired', 'scheduled');
  end if;
end $$;

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text unique,
  discount_type public.discount_type not null,
  value integer not null default 0 check (value >= 0),
  status public.discount_status not null default 'inactive',
  automatic boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  once_per_customer boolean not null default false,
  minimum_order_cents integer not null default 0 check (minimum_order_cents >= 0),
  minimum_quantity integer not null default 0 check (minimum_quantity >= 0),
  eligible_customer_ids uuid[] not null default '{}',
  eligible_product_ids text[] not null default '{}',
  combinable boolean not null default false,
  analytics jsonb not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discounts(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_email text,
  code text,
  discount_amount_cents integer not null default 0 check (discount_amount_cents >= 0),
  shipping_discount_cents integer not null default 0 check (shipping_discount_cents >= 0),
  currency text not null default 'CAD',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.increment_discount_usage(discount_id_input uuid)
returns void
language sql
security definer
as $$
  update public.discounts
  set usage_count = usage_count + 1,
      updated_at = now()
  where id = discount_id_input;
$$;

alter table public.customers
  add column if not exists account_status text not null default 'active',
  add column if not exists notes text,
  add column if not exists total_spend_cents integer not null default 0,
  add column if not exists order_count integer not null default 0,
  add column if not exists last_order_at timestamptz;

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  author_email text,
  note text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null default 'Shipping',
  name text,
  company text,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country text not null default 'CA',
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discounts_code_idx on public.discounts(lower(code));
create index if not exists discounts_status_idx on public.discounts(status);
create index if not exists discounts_automatic_idx on public.discounts(automatic);
create index if not exists discounts_active_window_idx on public.discounts(starts_at, ends_at);
create index if not exists discount_redemptions_discount_id_idx on public.discount_redemptions(discount_id);
create index if not exists discount_redemptions_customer_id_idx on public.discount_redemptions(customer_id);
create index if not exists discount_redemptions_created_at_idx on public.discount_redemptions(created_at desc);
create index if not exists customer_notes_customer_id_idx on public.customer_notes(customer_id);
create index if not exists customer_addresses_customer_id_idx on public.customer_addresses(customer_id);
create index if not exists customers_email_trgm_idx on public.customers using gin (email gin_trgm_ops);

create or replace function public.refresh_customer_commerce_metrics(customer_id_input uuid)
returns void
language sql
security definer
as $$
  update public.customers
  set total_spend_cents = coalesce((
        select sum(total_cents)::integer
        from public.orders
        where customer_id = customer_id_input
          and payment_status = 'paid'
      ), 0),
      order_count = coalesce((
        select count(*)::integer
        from public.orders
        where customer_id = customer_id_input
      ), 0),
      last_order_at = (
        select max(created_at)
        from public.orders
        where customer_id = customer_id_input
      ),
      updated_at = now()
  where id = customer_id_input;
$$;

create or replace function public.orders_refresh_customer_metrics()
returns trigger
language plpgsql
as $$
begin
  if new.customer_id is not null then
    perform public.refresh_customer_commerce_metrics(new.customer_id);
  end if;
  if tg_op = 'UPDATE' and old.customer_id is not null and old.customer_id <> new.customer_id then
    perform public.refresh_customer_commerce_metrics(old.customer_id);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_refresh_customer_metrics on public.orders;
create trigger orders_refresh_customer_metrics
after insert or update on public.orders
for each row execute function public.orders_refresh_customer_metrics();

drop trigger if exists discounts_set_updated_at on public.discounts;
create trigger discounts_set_updated_at
before update on public.discounts
for each row execute function public.set_updated_at();

drop trigger if exists customer_notes_set_updated_at on public.customer_notes;
create trigger customer_notes_set_updated_at
before update on public.customer_notes
for each row execute function public.set_updated_at();

drop trigger if exists customer_addresses_set_updated_at on public.customer_addresses;
create trigger customer_addresses_set_updated_at
before update on public.customer_addresses
for each row execute function public.set_updated_at();

alter table public.discounts enable row level security;
alter table public.discount_redemptions enable row level security;
alter table public.customer_notes enable row level security;
alter table public.customer_addresses enable row level security;

drop policy if exists "Admins can manage discounts" on public.discounts;
create policy "Admins can manage discounts"
on public.discounts for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage discount redemptions" on public.discount_redemptions;
create policy "Admins can manage discount redemptions"
on public.discount_redemptions for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Customers can read own discount redemptions" on public.discount_redemptions;
create policy "Customers can read own discount redemptions"
on public.discount_redemptions for select
using (
  exists (
    select 1 from public.customers
    where customers.id = discount_redemptions.customer_id
      and customers.auth_user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage customer notes" on public.customer_notes;
create policy "Admins can manage customer notes"
on public.customer_notes for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage customer addresses" on public.customer_addresses;
create policy "Admins can manage customer addresses"
on public.customer_addresses for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Customers can read own addresses" on public.customer_addresses;
create policy "Customers can read own addresses"
on public.customer_addresses for select
using (
  exists (
    select 1 from public.customers
    where customers.id = customer_addresses.customer_id
      and customers.auth_user_id = auth.uid()
  )
);

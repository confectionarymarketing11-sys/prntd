create extension if not exists pgcrypto;

create table if not exists public.shipping_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  product_types text[] not null default '{}',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.shipping_profiles(id) on delete cascade,
  code text not null unique,
  name text not null,
  description text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'CAD',
  method_type text not null check (method_type in ('lettermail', 'tracked', 'local_pickup')),
  min_subtotal_cents integer not null default 0 check (min_subtotal_cents >= 0),
  free_over_cents integer check (free_over_cents is null or free_over_cents >= 0),
  requires_tracking boolean not null default false,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shipping_rates enable row level security;

drop policy if exists "Public can read active shipping rates" on public.shipping_rates;
create policy "Public can read active shipping rates"
on public.shipping_rates for select using (active = true);

drop policy if exists "Admins can manage shipping rates" on public.shipping_rates;
create policy "Admins can manage shipping rates"
on public.shipping_rates for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

create index if not exists shipping_rates_active_idx on public.shipping_rates(active);
create index if not exists shipping_rates_method_type_idx on public.shipping_rates(method_type);

insert into public.shipping_rates (code, name, description, amount_cents, currency, method_type, requires_tracking, free_over_cents, active)
values
  ('lettermail', 'Lettermail', 'Economy shipping for business cards and stickers.', 295, 'CAD', 'lettermail', false, 7500, true),
  ('tracked', 'Tracked Shipping', 'Tracked parcel shipping for apparel and mixed carts.', 1095, 'CAD', 'tracked', true, 12500, true),
  ('local_pickup', 'Local Pickup', 'Pick up locally when your order is ready.', 0, 'CAD', 'local_pickup', false, null, true)
on conflict (code) do nothing;

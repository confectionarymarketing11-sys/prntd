create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.orders
  add column if not exists discount_cents integer not null default 0,
  add column if not exists tax_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists shipping_method text,
  add column if not exists shipping_cost_cents integer,
  add column if not exists tracking_number text,
  add column if not exists carrier text,
  add column if not exists shipped_at timestamptz,
  add column if not exists checkout_session_id text,
  add column if not exists guest_checkout boolean not null default false,
  add column if not exists confirmation_email_sent_at timestamptz;

create unique index if not exists orders_checkout_session_id_uidx
  on public.orders(checkout_session_id)
  where checkout_session_id is not null;

create table if not exists public.shipping_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  product_types text[] not null default '{}',
  active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.shipping_profiles(id) on delete cascade,
  code text not null unique,
  name text not null,
  description text,
  amount_cents integer not null default 0,
  currency text not null default 'CAD',
  method_type text not null check (method_type in ('lettermail', 'tracked', 'local_pickup')),
  min_subtotal_cents integer not null default 0,
  free_over_cents integer,
  requires_tracking boolean not null default false,
  active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  carrier text,
  service text,
  tracking_number text,
  tracking_url text,
  label_url text,
  shipment_status text not null default 'not_started',
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  email_type text not null,
  recipient text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null default 'pending',
  error text,
  error_message text,
  metadata jsonb not null default '{}',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.email_events
  add column if not exists error_message text;

alter table public.uploads
  add column if not exists print_side text,
  add column if not exists asset_role text,
  add column if not exists placement jsonb not null default '{}'::jsonb;

create index if not exists shipping_rates_active_idx on public.shipping_rates(active);
create index if not exists order_shipments_order_id_idx on public.order_shipments(order_id);
create index if not exists email_events_type_idx on public.email_events(email_type);
create index if not exists uploads_asset_role_idx on public.uploads(asset_role);

drop trigger if exists shipping_profiles_set_updated_at on public.shipping_profiles;
create trigger shipping_profiles_set_updated_at before update on public.shipping_profiles
for each row execute function public.set_updated_at();

drop trigger if exists shipping_rates_set_updated_at on public.shipping_rates;
create trigger shipping_rates_set_updated_at before update on public.shipping_rates
for each row execute function public.set_updated_at();

drop trigger if exists order_shipments_set_updated_at on public.order_shipments;
create trigger order_shipments_set_updated_at before update on public.order_shipments
for each row execute function public.set_updated_at();

alter table public.shipping_profiles enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.order_shipments enable row level security;
alter table public.email_events enable row level security;

drop policy if exists "Public can read active shipping rates" on public.shipping_rates;
create policy "Public can read active shipping rates"
on public.shipping_rates for select using (active = true);

drop policy if exists "Admins can manage shipping profiles" on public.shipping_profiles;
create policy "Admins can manage shipping profiles"
on public.shipping_profiles for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage shipping rates" on public.shipping_rates;
create policy "Admins can manage shipping rates"
on public.shipping_rates for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage order shipments" on public.order_shipments;
create policy "Admins can manage order shipments"
on public.order_shipments for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Customers can read own order shipments" on public.order_shipments;
create policy "Customers can read own order shipments"
on public.order_shipments for select
using (exists (select 1 from public.orders where orders.id = order_shipments.order_id and orders.auth_user_id = auth.uid()));

insert into public.shipping_profiles (name, description, product_types)
values
  ('Letter products', 'Business cards and stickers eligible for lettermail.', array['business-cards','die-cut-stickers']),
  ('Apparel', 'Tracked shipping required for apparel.', array['classic-tee'])
on conflict do nothing;

insert into public.shipping_rates (code, name, description, amount_cents, method_type, requires_tracking, free_over_cents)
values
  ('lettermail', 'Lettermail', 'Economy shipping for cards and stickers.', 295, 'lettermail', false, 7500),
  ('tracked', 'Tracked Shipping', 'Tracked parcel shipping for apparel and mixed carts.', 1095, 'tracked', true, 12500),
  ('local_pickup', 'Local Pickup', 'Pick up locally when your order is ready.', 0, 'local_pickup', false, null)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  amount_cents = excluded.amount_cents,
  method_type = excluded.method_type,
  requires_tracking = excluded.requires_tracking,
  free_over_cents = excluded.free_over_cents,
  updated_at = now();

insert into public.products (title, slug, description, status, visibility, product_type, vendor, tags, price_cents, currency, seo_title, seo_description, published_at)
values
  ('Classic Tee', 'classic-tee', 'Everyday cotton tee for merch drops, crews, and events.', 'active', 'online', 'Apparel', 'PRNTD', array['shirt','apparel','custom'], 3500, 'CAD', 'Custom Classic Tee', 'Customize and order PRNTD classic tees.', now()),
  ('Die Cut Stickers', 'die-cut-stickers', 'Weather-resistant vinyl stickers for packaging and promos.', 'active', 'online', 'Stickers', 'PRNTD', array['stickers','vinyl','custom'], 800, 'CAD', 'Custom Die Cut Stickers', 'Order custom die cut stickers from PRNTD.', now()),
  ('Business Cards', 'business-cards', 'Premium custom business cards with front and back design support.', 'active', 'online', 'Business Cards', 'PRNTD', array['business cards','print','custom'], 3200, 'CAD', 'Custom Business Cards', 'Create and order premium custom business cards.', now())
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  visibility = excluded.visibility,
  product_type = excluded.product_type,
  vendor = excluded.vendor,
  tags = excluded.tags,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  updated_at = now();

insert into public.product_variants (product_id, title, sku, price_cents, inventory_quantity, inventory_policy, active, position)
select id, 'Default Title', 'PRNTD-' || upper(replace(slug, '-', '-')), price_cents, 9999, 'continue', true, 0
from public.products
where slug in ('classic-tee','die-cut-stickers','business-cards')
on conflict do nothing;

insert into public.discounts (title, code, discount_type, value, status, automatic, minimum_quantity, eligible_product_ids, metadata)
values ('Shirt bulk discount', null, 'fixed_amount', 1100, 'active', true, 2, array['classic-tee'], '{"description":"Editable automatic shirt discount. Current launch rule starts at 2 shirts."}'::jsonb)
on conflict do nothing;

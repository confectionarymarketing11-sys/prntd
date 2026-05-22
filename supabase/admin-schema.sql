create extension if not exists "pgcrypto";

create type public.production_status_value as enum (
  'pending',
  'approved',
  'printing',
  'cutting',
  'packing',
  'shipped',
  'completed'
);

create type public.payment_status as enum (
  'unpaid',
  'authorized',
  'paid',
  'refunded',
  'failed'
);

create type public.shipment_status as enum (
  'not_started',
  'label_created',
  'in_transit',
  'delivered',
  'exception',
  'returned'
);

create type public.shipment_provider as enum (
  'shippo',
  'shipstation',
  'easypost',
  'canada_post',
  'manual'
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'fulfillment' check (role in ('owner', 'manager', 'fulfillment', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  phone text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_email text not null,
  customer_name text,
  customer_phone text,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb,
  production_status public.production_status_value not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'CAD',
  notes text,
  source text not null default 'storefront' check (source in ('storefront', 'shopify', 'manual', 'api')),
  external_order_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null default 0,
  line_total_cents integer not null default 0,
  customization jsonb not null default '{}'::jsonb,
  production_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  design_id uuid,
  file_name text,
  file_type text,
  storage_bucket text not null default 'uploads',
  storage_path text,
  preview_url text,
  print_ready_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider public.shipment_provider default 'manual',
  carrier text,
  service_level text,
  tracking_number text,
  tracking_url text,
  label_url text,
  status public.shipment_status not null default 'not_started',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id)
);

create table if not exists public.production_status (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.production_status_value not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_email_idx on public.orders(customer_email);
create index if not exists orders_status_idx on public.orders(production_status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists uploads_order_id_idx on public.uploads(order_id);
create index if not exists shipments_order_id_idx on public.shipments(order_id);
create index if not exists production_status_order_id_idx on public.production_status(order_id);

alter table public.admin_users enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.uploads enable row level security;
alter table public.shipments enable row level security;
alter table public.production_status enable row level security;

-- All operational tables are read/written server-side with SUPABASE_SERVICE_ROLE_KEY.
-- Keep RLS enabled and avoid broad anon policies for internal fulfillment data.

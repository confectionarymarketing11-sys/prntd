-- Optional customer auth relationship tables.
-- Not applied automatically.
--
-- This avoids altering legacy/forbidden tables such as bg_users, bg_orders,
-- cart_designs, designs, qr_links, qr_scans, rate_limit, or uploads.
-- Apply only after confirming these new relationship tables fit production.

create table if not exists public.customer_auth_links (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (auth_user_id),
  unique (customer_id)
);

create table if not exists public.customer_order_links (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (auth_user_id, order_id)
);

create table if not exists public.customer_design_links (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  design_path text not null,
  created_at timestamptz not null default now(),
  unique (auth_user_id, design_path)
);

create table if not exists public.customer_upload_links (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  upload_id uuid not null references public.uploads(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (auth_user_id, upload_id)
);

alter table public.customer_auth_links enable row level security;
alter table public.customer_order_links enable row level security;
alter table public.customer_design_links enable row level security;
alter table public.customer_upload_links enable row level security;

create policy "customers can read own customer link"
  on public.customer_auth_links
  for select
  using (auth.uid() = auth_user_id);

create policy "customers can read own order links"
  on public.customer_order_links
  for select
  using (auth.uid() = auth_user_id);

create policy "customers can read own design links"
  on public.customer_design_links
  for select
  using (auth.uid() = auth_user_id);

create policy "customers can read own upload links"
  on public.customer_upload_links
  for select
  using (auth.uid() = auth_user_id);

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum ('draft', 'active', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'product_visibility') then
    create type public.product_visibility as enum ('online', 'hidden');
  end if;

  if not exists (select 1 from pg_type where typname = 'inventory_policy') then
    create type public.inventory_policy as enum ('deny', 'continue');
  end if;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  status public.product_status not null default 'draft',
  visibility public.product_visibility not null default 'hidden',
  product_type text,
  vendor text,
  tags text[] not null default '{}',
  featured_image_url text,
  price_cents integer not null default 0 check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  currency text not null default 'CAD',
  seo_title text,
  seo_description text,
  view_count bigint not null default 0,
  conversion_count bigint not null default 0,
  sales_count bigint not null default 0,
  metadata jsonb not null default '{}',
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null default 'Default Title',
  sku text,
  barcode text,
  option1_name text,
  option1_value text,
  option2_name text,
  option2_value text,
  option3_name text,
  option3_value text,
  price_cents integer not null default 0 check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  inventory_quantity integer not null default 0,
  inventory_policy public.inventory_policy not null default 'deny',
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  taxable boolean not null default true,
  active boolean not null default true,
  position integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  url text not null,
  storage_path text,
  alt_text text,
  position integer not null default 0,
  is_featured boolean not null default false,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  dominant_color text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  status public.product_status not null default 'draft',
  featured_image_url text,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create index if not exists products_status_idx on public.products(status);
create index if not exists products_visibility_idx on public.products(visibility);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists products_title_trgm_idx on public.products using gin (title gin_trgm_ops);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_variants_sku_idx on public.product_variants(sku);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists collections_status_idx on public.collections(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;

drop policy if exists "Public can read active visible products" on public.products;
create policy "Public can read active visible products"
on public.products for select
using (status = 'active' and visibility = 'online');

drop policy if exists "Public can read active product variants" on public.product_variants;
create policy "Public can read active product variants"
on public.product_variants for select
using (
  active = true and exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and products.status = 'active'
      and products.visibility = 'online'
  )
);

drop policy if exists "Public can read active product images" on public.product_images;
create policy "Public can read active product images"
on public.product_images for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.status = 'active'
      and products.visibility = 'online'
  )
);

drop policy if exists "Public can read active collections" on public.collections;
create policy "Public can read active collections"
on public.collections for select
using (status = 'active');

drop policy if exists "Public can read active collection products" on public.collection_products;
create policy "Public can read active collection products"
on public.collection_products for select
using (
  exists (
    select 1 from public.collections
    where collections.id = collection_products.collection_id
      and collections.status = 'active'
  )
);

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage product variants" on public.product_variants;
create policy "Admins can manage product variants"
on public.product_variants for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images"
on public.product_images for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage collections" on public.collections;
create policy "Admins can manage collections"
on public.collections for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Admins can manage collection products" on public.collection_products;
create policy "Admins can manage collection products"
on public.collection_products for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

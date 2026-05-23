create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'global',
  test_mode_enabled boolean not null default false,
  test_mode_notice text not null default 'Test mode is enabled. Orders and checkout flows are for testing only.',
  announcement_enabled boolean not null default true,
  announcement_text text not null default 'Free design tools and secure checkout are live.',
  announcement_link text,
  logo_text text not null default 'PRNTD',
  logo_subtitle text not null default 'Custom print shop',
  logo_image_url text,
  contact_email text not null default 'hello@prntd.ca',
  contact_phone text,
  contact_address text,
  contact_hours text,
  contact_body text,
  terms_body text,
  privacy_body text,
  refund_body text,
  shipping_body text,
  default_currency text not null default 'CAD',
  supported_currencies text[] not null default array['CAD','USD'],
  supported_languages text[] not null default array['en','fr'],
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  product_id text,
  customer_name text,
  customer_email text,
  rating integer not null default 5 check (rating between 1 and 5),
  title text,
  body text not null,
  status text not null default 'pending' check (status in ('pending','published','hidden','flagged')),
  source text not null default 'storefront',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists test_mode_enabled boolean not null default false,
  add column if not exists test_mode_notice text not null default 'Test mode is enabled. Orders and checkout flows are for testing only.';

alter table public.reviews
  add column if not exists product_id text;

create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists reviews_order_id_idx on public.reviews(order_id);
create index if not exists reviews_product_id_idx on public.reviews(product_id);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

drop policy if exists "Public can read published reviews" on public.reviews;
create policy "Public can read published reviews"
on public.reviews for select using (status = 'published');

drop policy if exists "Admins can manage reviews" on public.reviews;
create policy "Admins can manage reviews"
on public.reviews for all
using (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true))
with check (exists (select 1 from public.admin_users where admin_users.user_id = auth.uid() and admin_users.active = true));

insert into public.site_settings (singleton_key)
values ('global')
on conflict (singleton_key) do nothing;

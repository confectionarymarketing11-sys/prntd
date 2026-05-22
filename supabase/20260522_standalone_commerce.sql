-- PRNTD standalone commerce evolution.
-- Migration-safe additive changes only.
-- Apply in Supabase SQL editor or your migration runner after backing up production.

create extension if not exists "pgcrypto";

alter table public.customers
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists stripe_customer_id text,
  add column if not exists shopify_customer_id text,
  add column if not exists credits_balance integer not null default 0 check (credits_balance >= 0),
  add column if not exists subscription_status text not null default 'inactive',
  add column if not exists plan_tier text not null default 'none',
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_current_period_end timestamptz;

alter table public.orders
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.uploads
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists customers_auth_user_id_uidx
  on public.customers(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists customers_stripe_customer_id_uidx
  on public.customers(stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists customers_plan_tier_idx on public.customers(plan_tier);
create index if not exists customers_subscription_status_idx on public.customers(subscription_status);
create index if not exists orders_auth_user_id_idx on public.orders(auth_user_id);
create index if not exists uploads_auth_user_id_idx on public.uploads(auth_user_id);

update public.customers c
set auth_user_id = u.id,
    updated_at = now()
from auth.users u
where c.auth_user_id is null
  and lower(c.email) = lower(u.email);

update public.orders o
set auth_user_id = c.auth_user_id
from public.customers c
where o.auth_user_id is null
  and o.customer_id = c.id
  and c.auth_user_id is not null;

update public.uploads u
set auth_user_id = c.auth_user_id
from public.customers c
where u.auth_user_id is null
  and u.customer_id = c.id
  and c.auth_user_id is not null;

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  amount integer not null,
  reason text not null check (reason in ('subscription_grant', 'top_up', 'usage', 'refund', 'admin_adjustment')),
  source text not null default 'system',
  stripe_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_customer_id_idx on public.credit_transactions(customer_id);
create index if not exists credit_transactions_auth_user_id_idx on public.credit_transactions(auth_user_id);
create index if not exists credit_transactions_created_at_idx on public.credit_transactions(created_at desc);
create unique index if not exists credit_transactions_stripe_event_reason_uidx
  on public.credit_transactions(stripe_event_id, reason)
  where stripe_event_id is not null;

create table if not exists public.stripe_events (
  id text primary key,
  event_type text not null,
  livemode boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists stripe_events_event_type_idx on public.stripe_events(event_type);
create index if not exists stripe_events_processed_at_idx on public.stripe_events(processed_at);

alter table public.credit_transactions enable row level security;
alter table public.stripe_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'customers_select_own'
  ) then
    create policy customers_select_own
      on public.customers
      for select
      using (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_select_own'
  ) then
    create policy orders_select_own
      on public.orders
      for select
      using (auth.uid() = auth_user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'order_items_select_own'
  ) then
    create policy order_items_select_own
      on public.order_items
      for select
      using (
        exists (
          select 1
          from public.orders o
          where o.id = order_items.order_id
            and o.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'uploads' and policyname = 'uploads_select_own'
  ) then
    create policy uploads_select_own
      on public.uploads
      for select
      using (
        auth.uid() = auth_user_id
        or exists (
          select 1
          from public.customers c
          where c.id = uploads.customer_id
            and c.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'shipments' and policyname = 'shipments_select_own'
  ) then
    create policy shipments_select_own
      on public.shipments
      for select
      using (
        exists (
          select 1
          from public.orders o
          where o.id = shipments.order_id
            and o.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'production_status_history' and policyname = 'production_status_history_select_own'
  ) then
    create policy production_status_history_select_own
      on public.production_status_history
      for select
      using (
        exists (
          select 1
          from public.orders o
          where o.id = production_status_history.order_id
            and o.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'credit_transactions' and policyname = 'credit_transactions_select_own'
  ) then
    create policy credit_transactions_select_own
      on public.credit_transactions
      for select
      using (auth.uid() = auth_user_id);
  end if;
end $$;

-- Optional compatibility policy for the legacy designs table. It is only created
-- when the table and email-based user_id column exist.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'designs'
      and column_name = 'user_id'
  ) and not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'designs' and policyname = 'designs_select_own_by_email'
  ) then
    execute 'create policy designs_select_own_by_email on public.designs for select using (lower(user_id::text) = lower((auth.jwt() ->> ''email'')::text))';
  end if;
end $$;

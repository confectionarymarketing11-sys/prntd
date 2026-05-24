create table if not exists public.storefront_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'page_view',
      'added_to_cart',
      'reached_checkout',
      'checkout_completed'
    )
  ),
  visitor_id text not null,
  session_id text not null,
  customer_email text,
  pathname text,
  referrer text,
  user_agent text,
  ip_hash text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists storefront_events_created_at_idx
  on public.storefront_events(created_at desc);

create index if not exists storefront_events_event_type_created_at_idx
  on public.storefront_events(event_type, created_at desc);

create index if not exists storefront_events_session_created_at_idx
  on public.storefront_events(session_id, created_at desc);

create index if not exists storefront_events_visitor_created_at_idx
  on public.storefront_events(visitor_id, created_at desc);

alter table public.storefront_events enable row level security;

drop policy if exists "Admins can read storefront events" on public.storefront_events;
create policy "Admins can read storefront events"
on public.storefront_events for select
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.active = true
  )
);

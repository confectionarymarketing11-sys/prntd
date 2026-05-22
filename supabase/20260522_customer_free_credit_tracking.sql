-- Tracks one-time free customer credits without altering legacy/forbidden tables.
alter table public.customers
  add column if not exists has_received_free_credits boolean not null default false,
  add column if not exists free_credits_granted_at timestamp with time zone;

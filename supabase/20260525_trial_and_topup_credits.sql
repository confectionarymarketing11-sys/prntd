-- Trial credits and top-up credit product support.
-- Apply after backing up production. Additive and migration-safe.

alter table public.bg_users
  add column if not exists trial_credits integer not null default 0 check (trial_credits >= 0),
  add column if not exists trial_credits_expires_at timestamptz,
  add column if not exists trial_credits_granted_at timestamptz,
  add column if not exists trial_stripe_subscription_id text,
  add column if not exists trial_used boolean not null default false,
  add column if not exists total_credits integer not null default 0 check (total_credits >= 0);

create index if not exists bg_users_trial_expires_at_idx
  on public.bg_users(trial_credits_expires_at)
  where trial_credits > 0;

create index if not exists bg_users_trial_stripe_subscription_id_idx
  on public.bg_users(trial_stripe_subscription_id)
  where trial_stripe_subscription_id is not null;

update public.bg_users
set total_credits = greatest(
  0,
  coalesce(credits, 0) +
  coalesce(subscription_credits, 0) +
  case
    when trial_credits_expires_at is not null
      and trial_credits_expires_at > now()
    then coalesce(trial_credits, 0)
    else 0
  end
);

do $$
declare
  credits_product_id uuid;
begin
  insert into public.products (
    title,
    slug,
    description,
    status,
    visibility,
    product_type,
    vendor,
    tags,
    price_cents,
    currency,
    seo_title,
    seo_description,
    metadata,
    published_at
  )
  values (
    'Top-Up Credits',
    'top-up-credits',
    'Non-expiring PRNTD credits for the design creator, image editor, and background remover.',
    'active',
    'hidden',
    'digital_credits',
    'PRNTD',
    array['credits', 'digital', 'top-up'],
    700,
    'CAD',
    'Top-Up Credits',
    'Buy non-expiring PRNTD credits for creator tools.',
    jsonb_build_object(
      'credit_product', true,
      'fulfillment_required', false,
      'admin_editable', true
    ),
    now()
  )
  on conflict (slug) do update
  set title = excluded.title,
      description = excluded.description,
      product_type = excluded.product_type,
      vendor = excluded.vendor,
      tags = excluded.tags,
      status = excluded.status,
      visibility = excluded.visibility,
      price_cents = excluded.price_cents,
      currency = excluded.currency,
      seo_title = excluded.seo_title,
      seo_description = excluded.seo_description,
      metadata = public.products.metadata || excluded.metadata,
      updated_at = now()
  returning id into credits_product_id;

  update public.product_variants
  set product_id = credits_product_id,
      title = '25 Credits',
      option1_name = 'Credits',
      option1_value = '25',
      price_cents = 700,
      inventory_quantity = 999999,
      inventory_policy = 'continue',
      taxable = false,
      active = true,
      position = 1,
      metadata = jsonb_build_object('credits', 25, 'credit_pack', 'credits_25'),
      updated_at = now()
  where sku = 'PRNTD-CREDITS-25';

  if not found then
    insert into public.product_variants (
      product_id,
      title,
      sku,
      option1_name,
      option1_value,
      price_cents,
      inventory_quantity,
      inventory_policy,
      taxable,
      active,
      position,
      metadata
    )
    values (
      credits_product_id,
      '25 Credits',
      'PRNTD-CREDITS-25',
      'Credits',
      '25',
      700,
      999999,
      'continue',
      false,
      true,
      1,
      jsonb_build_object('credits', 25, 'credit_pack', 'credits_25')
    );
  end if;

  update public.product_variants
  set product_id = credits_product_id,
      title = '50 Credits',
      option1_name = 'Credits',
      option1_value = '50',
      price_cents = 1100,
      inventory_quantity = 999999,
      inventory_policy = 'continue',
      taxable = false,
      active = true,
      position = 2,
      metadata = jsonb_build_object('credits', 50, 'credit_pack', 'credits_50'),
      updated_at = now()
  where sku = 'PRNTD-CREDITS-50';

  if not found then
    insert into public.product_variants (
      product_id,
      title,
      sku,
      option1_name,
      option1_value,
      price_cents,
      inventory_quantity,
      inventory_policy,
      taxable,
      active,
      position,
      metadata
    )
    values (
      credits_product_id,
      '50 Credits',
      'PRNTD-CREDITS-50',
      'Credits',
      '50',
      1100,
      999999,
      'continue',
      false,
      true,
      2,
      jsonb_build_object('credits', 50, 'credit_pack', 'credits_50')
    );
  end if;

  update public.product_variants
  set product_id = credits_product_id,
      title = '100 Credits',
      option1_name = 'Credits',
      option1_value = '100',
      price_cents = 1900,
      inventory_quantity = 999999,
      inventory_policy = 'continue',
      taxable = false,
      active = true,
      position = 3,
      metadata = jsonb_build_object('credits', 100, 'credit_pack', 'credits_100'),
      updated_at = now()
  where sku = 'PRNTD-CREDITS-100';

  if not found then
    insert into public.product_variants (
      product_id,
      title,
      sku,
      option1_name,
      option1_value,
      price_cents,
      inventory_quantity,
      inventory_policy,
      taxable,
      active,
      position,
      metadata
    )
    values (
      credits_product_id,
      '100 Credits',
      'PRNTD-CREDITS-100',
      'Credits',
      '100',
      1900,
      999999,
      'continue',
      false,
      true,
      3,
      jsonb_build_object('credits', 100, 'credit_pack', 'credits_100')
    );
  end if;
end $$;

-- Adds editable print-side variants for the Classic Tee without relying on hardcoded UUIDs.
-- The storefront shirt customizer reads these by option name/value:
--   Print Sides = 1 Side
--   Print Sides = 2 Side

with classic_tee as (
  select id, price_cents
  from public.products
  where slug = 'classic-tee'
  limit 1
)
insert into public.product_variants (
  product_id,
  title,
  sku,
  option1_name,
  option1_value,
  option2_name,
  option2_value,
  option3_name,
  option3_value,
  price_cents,
  inventory_quantity,
  inventory_policy,
  active,
  position
)
select
  classic_tee.id,
  'Single-sided print',
  'PRNTD-CLASSIC-TEE-1-SIDE',
  'Print Sides',
  '1 Side',
  null,
  null,
  null,
  null,
  classic_tee.price_cents,
  9999,
  'continue',
  true,
  0
from classic_tee
where not exists (
  select 1
  from public.product_variants existing
  where existing.product_id = classic_tee.id
    and (
      (lower(coalesce(existing.option1_name, '')) = 'print sides' and lower(coalesce(existing.option1_value, '')) = '1 side')
      or (lower(coalesce(existing.option2_name, '')) = 'print sides' and lower(coalesce(existing.option2_value, '')) = '1 side')
      or (lower(coalesce(existing.option3_name, '')) = 'print sides' and lower(coalesce(existing.option3_value, '')) = '1 side')
    )
);

with classic_tee as (
  select id, price_cents
  from public.products
  where slug = 'classic-tee'
  limit 1
)
insert into public.product_variants (
  product_id,
  title,
  sku,
  option1_name,
  option1_value,
  option2_name,
  option2_value,
  option3_name,
  option3_value,
  price_cents,
  inventory_quantity,
  inventory_policy,
  active,
  position
)
select
  classic_tee.id,
  'Double-sided print',
  'PRNTD-CLASSIC-TEE-2-SIDE',
  'Print Sides',
  '2 Side',
  null,
  null,
  null,
  null,
  classic_tee.price_cents + 1000,
  9999,
  'continue',
  true,
  1
from classic_tee
where not exists (
  select 1
  from public.product_variants existing
  where existing.product_id = classic_tee.id
    and (
      (lower(coalesce(existing.option1_name, '')) = 'print sides' and lower(coalesce(existing.option1_value, '')) = '2 side')
      or (lower(coalesce(existing.option2_name, '')) = 'print sides' and lower(coalesce(existing.option2_value, '')) = '2 side')
      or (lower(coalesce(existing.option3_name, '')) = 'print sides' and lower(coalesce(existing.option3_value, '')) = '2 side')
    )
);

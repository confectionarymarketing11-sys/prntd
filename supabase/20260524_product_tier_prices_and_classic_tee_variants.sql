-- Launch pricing refresh for sticker/card fixed tiers and Classic Tee print-side variants.
-- Uses slugs instead of hardcoded product ids so it is safe across environments.

update public.products
set price_cents = 774, currency = 'CAD', updated_at = now()
where slug = 'die-cut-stickers';

update public.products
set price_cents = 2386, currency = 'CAD', updated_at = now()
where slug = 'business-cards';

update public.products
set currency = 'CAD', updated_at = now()
where slug = 'classic-tee';

with classic_tee as (
  select id, price_cents
  from public.products
  where slug = 'classic-tee'
  limit 1
)
delete from public.product_variants pv
using classic_tee
where pv.product_id = classic_tee.id;

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
  'One-sided printing',
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
union all
select
  classic_tee.id,
  'Double-sided printing',
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
from classic_tee;

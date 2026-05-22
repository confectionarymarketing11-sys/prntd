# PRNTD Internal Admin Dashboard

This admin area is for internal fulfillment operations only. It is intentionally separated from the customer storefront and portal.

## Architecture

- `app/admin/login` handles Supabase Auth sign-in.
- `app/admin/(dashboard)` contains protected fulfillment routes.
- `features/admin/data` owns database reads/writes and business logic.
- `features/admin/actions` owns server actions for mutations.
- `features/admin/components` owns dashboard-only UI.
- `components/ui` contains shadcn/ui-style reusable primitives.
- `supabase/admin-schema.sql` contains the Postgres schema for fulfillment operations.

## Environment

Required in production:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
SUPABASE_JWT_SECRET=
OPENAI_API_KEY=
OPENAI_IMAGE_TIMEOUT_MS=
OPENAI_MAX_RETRIES=
PRNTD_GENERATE_DESIGN_TIMEOUT_MS=
REMOVE_BG_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SHOPIFY_WEBHOOK_SECRET=
ALLOWED_ORIGIN=
CRON_SECRET=
```

`NEXT_PUBLIC_*` is used for Supabase Auth session handling. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is used after the admin user is authenticated and authorized.

## Data Flow

1. Admin signs in with Supabase Auth at `/admin/login`.
2. Protected admin layout calls `requireAdmin()`.
3. `requireAdmin()` verifies the Supabase Auth user and checks `admin_users.active = true`.
4. Dashboard pages read operational data through server-only Supabase service-role queries.
5. Mutations use server actions, revalidate admin routes, and use optimistic UI where fast status changes happen.
6. Storefront checkout calls `persistStorefrontOrder()` to insert orders, customers, order items, and the first production event.

## Core Tables

- `admin_users`: internal authorization allow-list.
- `customers`: fulfillment customer records.
- `orders`: order header, payment status, production status, totals, shipping address.
- `order_items`: line items and customization JSON.
- `uploads`: artwork and print-ready files.
- `shipments`: provider, label URL, tracking, shipment status.
- `production_status_history`: timeline/activity history.

## Shipping Strategy

The `shipments` table is provider-neutral. Use `provider` plus metadata fields to integrate:

- Shippo
- ShipStation
- EasyPost
- Canada Post API

Future provider adapters should live under `features/admin/shipping/providers/*` and return a normalized shipment payload for `upsertShipment()`.

## Production Workflow

Allowed workflow statuses:

- Pending
- Approved
- Printing
- Cutting
- Packing
- Shipped
- Completed

Each status update inserts a row into `production_status_history` for timeline visibility.

## First Admin User

1. Create a Supabase Auth user.
2. Run `supabase/admin-schema.sql`.
3. Insert the auth user into `admin_users`:

```sql
insert into public.admin_users (user_id, email, role, active)
values ('AUTH_USER_UUID', 'admin@prntd.ca', 'owner', true);
```

Operational tables keep RLS enabled and are accessed from server-side code only.

# PRNTD API Migration Report

## Current Status

- Active Next.js API routes live under `app/api/prntd`.
- Legacy business logic is preserved under `features/prntd-api/legacy`.
- Compatibility adapters remain in place for complex OpenAI, QR, design, upload, Stripe, and Shopify webhook flows.
- Build and lint pass after the incremental hardening pass.

## Completed Fixes

- Added route-specific timeout control for `/api/prntd/generate-design` via `PRNTD_GENERATE_DESIGN_TIMEOUT_MS`.
- Added OpenAI SDK timeout/retry controls for generation flows via `OPENAI_IMAGE_TIMEOUT_MS` and `OPENAI_MAX_RETRIES`.
- Added structured timing logs to `generate-design` covering auth, rate-limit checks, credit/design lookups, prompt enhancement, image generation, storage upload, signed URL creation, DB insert, credit deduction, and total request completion.
- Skipped the prompt-enhancement chat call for Ultra mode because the existing business logic already ignores the enhanced prompt and uses a simplified original prompt for Ultra.
- Added shared API utilities:
  - `lib/api-response.ts` for JSON responses, safe error responses, and timeout wrappers.
  - `lib/cors.ts` for centralized CORS behavior.
  - `lib/env.ts` for safer environment variable access.
  - `lib/auth/jwt.ts` for PRNTD JWT bearer-token validation.
  - `lib/rate-limit.ts` for in-memory request limiting.
  - `lib/supabase/service.ts` for service-role Supabase access.
- Hardened `lib/prntdLegacyRoute.ts` so compatibility-wrapped routes now catch import/runtime errors and apply timeout protection.
- Converted these low-risk APIs to native Next.js route handlers:
  - `/api/prntd/auth`
  - `/api/prntd/credits`
  - `/api/prntd/use-credits`
  - `/api/prntd/cleanup-designs`
  - `/api/prntd/url-health-check`
- Added `zod` validation to native request-body routes.
- Added optional `CRON_SECRET` protection for cleanup and URL-health cron routes. If unset, those routes preserve the previous open behavior.
- Removed build-time dynamic import exposure from legacy-backed routes by passing lazy import promises into the adapter.
- Set `turbopack.root` in `next.config.ts` to stop Next.js from choosing the parent workspace lockfile.

## Native APIs

These routes no longer depend on Remix compatibility modules:

- `auth`
- `credits`
- `use-credits`
- `cleanup-designs`
- `url-health-check`

## APIs Still Using Compatibility Adapters

These routes still call preserved legacy modules. They are stable enough for deploy but should be migrated carefully later:

- `create-qr`
- `create-user`
- `custom-qr`
- `delete-design`
- `delete-qr`
- `edit-design`
- `edit-image`
- `generate-design`
- `get-designs`
- `get-subscription`
- `my-qrs`
- `qr-analytics`
- `remove-bg`
- `save-design`
- `scan-trends`
- `stripe-webhook`
- `update-qr`
- `upload-logo`
- `webhooks/orders/create`

The catch-all proxy route `app/api/prntd/[...path]/route.ts` also remains as a fallback for unknown PRNTD API paths.

## Risky Areas

- The old reference file `api.remove-bg.ts.js` contains a hardcoded Remove.bg API key. It was not migrated. Production must use `REMOVE_BG_API_KEY`.
- Some legacy modules still import `@remix-run/node`, especially QR customization, upload logo, update QR, cleanup reference code, and Shopify webhook code.
- The Shopify order webhook remains intentionally Shopify-specific because it validates `x-shopify-hmac-sha256`.
- OpenAI/image-generation routes are still legacy-backed because they have higher business-logic risk.
- The in-memory rate limiter works per server instance. For multi-instance Render scaling, move rate limits to Redis, Upstash, or Supabase with strict RLS/service-role-only access.
- `cleanup-designs` and `url-health-check` preserve open access when `CRON_SECRET` is unset. Set `CRON_SECRET` in production and send `Authorization: Bearer <CRON_SECRET>`.

## Supabase Security Findings

- `public.rate_limits` has RLS disabled. Enable RLS before exposing this project broadly:

```sql
alter table public.rate_limits enable row level security;
```

- Several service-role-only operational tables have RLS enabled but no policies. That is acceptable only when they are accessed exclusively from server-side service-role code:
  - `admin_users`
  - `customers`
  - `orders`
  - `order_items`
  - `uploads`
  - `shipments`
  - `production_status_history`
  - `qr_links`
  - `qr_scans`
- `bg_users` has permissive public update/select policies. Tighten or remove broad `USING (true)` update policies before allowing direct browser access.
- `designs` allows anonymous insert/select. This may be intentional for public design flows, but it should be narrowed if designs are user-private.
- Public storage bucket `design-assets` allows broad listing. Public object URLs do not require broad list access.
- Several `SECURITY DEFINER` credit functions are executable by anon/authenticated roles. Revoke direct execution if credits should only be mutated through server APIs.

## Unused Or Transitional Dependencies

- `@remix-run/node` is still required while some compatibility modules import `json`, `ActionFunctionArgs`, or `LoaderFunctionArgs`.
- `dotenv` appears transitional in the Next app and is probably removable once all legacy references are gone.
- `canvas`, `jsdom`, `qrcode`, and `qr-code-styling-node` are still used by QR/image flows and should stay until those routes are audited individually.
- `npm audit --omit=dev` reports a moderate PostCSS advisory through Next.js. Do not run `npm audit fix --force`; it proposes a breaking downgrade. Track the next safe Next.js patch instead.

## Recommended Next Migrations

1. Convert `remove-bg` natively next. Keep its current environment-based key handling and add file-size/type validation.
2. Convert `get-designs`, `delete-design`, and `save-design` as a group because they share JWT and Supabase design ownership logic.
3. Convert QR read-only routes (`my-qrs`, `qr-analytics`, `scan-trends`) before QR write routes.
4. Leave `generate-design`, `edit-design`, and `edit-image` until the OpenAI request/credit flow can be tested end-to-end.
5. Keep Shopify webhook code isolated until the store webhook payload is confirmed in production.

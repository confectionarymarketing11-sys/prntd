# PRNTD Print Shop

A self-contained Shopify replacement for a custom print shop, built with Next.js.

## What Works

- Product catalog with base pricing, colors, sizes, production windows, and quantity breaks.
- Browser-based customizer for text, uploaded artwork, front/back print areas, PNG export, and saved designs.
- Cart with customer checkout details, shipping, estimated tax, and editable quantities.
- Checkout API that falls back to a local manual order flow when Stripe is not configured.
- Receipt page and local production order desk for tracking order status.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Optional Stripe Checkout

Manual checkout works without keys. To use Stripe-hosted card checkout, set:

```bash
STRIPE_SECRET_KEY=sk_test_...
```

The app uses Stripe's REST API directly, so no Stripe SDK package is required.

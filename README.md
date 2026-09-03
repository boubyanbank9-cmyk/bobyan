# Al Ain Water — Website + Dashboard

Frontend replica of [alainwater.com](https://alainwater.com) built with the same stack as Oasis / Town Tech:

- React + Vite + Tailwind CSS v4
- React Router
- Supabase (admin, products, orders)
- Admin dashboard at `/admin`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

### Storefront (Al Ain style)
- White header with logo, products dropdown, search, cart badge, AR/EN switch
- Hero image carousel
- Circular category cards
- Bestsellers grid + add to cart
- Brand story + news section
- Cart page (`/cart`), products, collections, product details
- WhatsApp float + footer matching reference

### Admin (same as Oasis)
- Products, orders, payments, reports
- Site settings & content
- Contact messages

## Supabase

1. Copy `.env.example` → `.env`
2. Add Supabase URL + key
3. Run `supabase/schema.sql` in SQL Editor

## Build

```bash
npm run build
npm run preview
```

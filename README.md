# M.S. Spices Store

A Next.js storefront for M.S. Spices with a PostgreSQL/Prisma catalog, persistent browser cart, COD checkout, and a protected store dashboard.

## Run locally

Requirements: Node.js 20 or newer and PostgreSQL.

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, a unique `ADMIN_PASSWORD`, and a random `SESSION_SECRET` of at least 32 characters.
2. Install dependencies with `npm install`.
3. Generate the Prisma client and apply the schema with `npx prisma generate` and `npx prisma db push`.
4. Seed the catalog and admin account with `npm run db:seed`.
5. Start the app with `npm run dev`.

The six seeded products remain available as a catalog fallback when `DATABASE_URL` is unset. Database-backed checkout, contact submissions, and admin operations require a reachable PostgreSQL database and seeded data. PIN-code delivery checks use the India Post postal lookup service and require outbound network access.

The admin email and password are the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values used while seeding. Sign in at `/admin/login`.

## Product imagery

Product cards, product details, and the cart use local files in `public/images/spices/`. The six product SVGs are original illustrative placeholders, labeled as artwork and not as real packaging or photography. Replace each product SVG with an actual M.S. Traders product photo using the same filename and a 4:5 crop, or update that product's `imageUrl` to another local `/images/spices/...` asset. The homepage hero uses `hero-spices.svg`; `placeholder.svg` is the missing-image fallback. The uploaded Jeera package reference is not present as a workspace asset, so it has not been inserted into the site.

| Product | Local placeholder |
| --- | --- |
| Jeera Powder | `public/images/spices/jeera-powder.svg` |
| Garam Masala | `public/images/spices/garam-masala.svg` |
| Dhaniya Powder | `public/images/spices/dhaniya-powder.svg` |
| Mix Masala | `public/images/spices/mix-masala.svg` |
| Haldi Powder | `public/images/spices/haldi-powder.svg` |
| Mirchi Powder | `public/images/spices/mirchi-powder.svg` |

## Checks

- `npm test` runs the pricing and COD format tests.
- `npm run build` generates Prisma Client and builds the production app.
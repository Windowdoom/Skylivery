# Sky Livery LLC

Luxury SUV service — New Orleans. Next.js 14 App Router, Tailwind, Framer Motion.

## Run locally

```bash
npm install
cp .env.local.example .env.local  # fill in Supabase + Google keys
npm run dev
```

## Deploy (Vercel)

1. Import `windowdoom/skylivery` in Vercel.
2. **Root Directory: blank** (repo root). Production branch: `main`.
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_MAPS_API_KEY`.
4. Deploy. Add `skylivery.llc` under Settings → Domains.

## Notes

- Zone pricing is **internal only** (`lib/zones.ts`); customers only ever see the final dollar amount.
- `/api/quote` returns the flat rate. `/api/book` inserts into Supabase `bookings`.
- 8 SEO landing pages under `/app/*`.
- JSON-LD `LimousineService` + `FAQPage` schema in `app/layout.tsx`.

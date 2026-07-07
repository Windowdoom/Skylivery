# Sky Livery LLC - Website

Luxury SUV service, New Orleans. Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion.

## Deploy to Vercel (5 minutes)

1. Push this folder to a GitHub repository
2. Go to vercel.com, sign in with GitHub
3. Click "New Project", select the sky-livery repo
4. Add environment variables (see .env.local.example)
5. Click "Deploy"
6. Connect your domain (skylivery.llc) in Vercel dashboard > Settings > Domains

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

- GOOGLE_MAPS_API_KEY: Get from Google Cloud Console > APIs > Geocoding API
- NEXT_PUBLIC_SUPABASE_URL: From your Supabase project settings
- NEXT_PUBLIC_SUPABASE_ANON_KEY: From your Supabase project settings
- STRIPE_SECRET_KEY: From Stripe dashboard
- RESEND_API_KEY: From Resend dashboard

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project structure

```
app/
  layout.tsx              # Root layout, fonts, SEO metadata, schema markup
  page.tsx                # Homepage
  globals.css             # Global styles
  api/quote/route.ts      # Zone calculator API (internal, not customer-facing)
  airport-transfer-msy/   # SEO landing page
  french-quarter-car-service/
  metairie-car-service/
  garden-district-car-service/
  wedding-limo-new-orleans/
  corporate-transportation-new-orleans/
  mardi-gras-transportation/
  jazz-fest-transportation/
components/
  Navbar.tsx               # Fixed nav with phone + book button
  Hero.tsx                 # Hero section with tagline + stats
  BookingForm.tsx          # Booking form (zones hidden from customer)
  WhySection.tsx           # Benefits strip
  Vehicle.tsx              # SUV showcase
  Services.tsx             # Service cards (airport, corporate, wedding, etc)
  Areas.tsx                # Service area cards
  TrustBar.tsx             # CPNC, insured, no surge strip
  CTA.tsx                  # Call to action
  Footer.tsx               # Footer with NAP, links, GTB language
  FadeIn.tsx               # Scroll animation wrapper
lib/
  zones.ts                 # INTERNAL zone pricing logic (never shown to customer)
public/
  logo.png                 # Add your Sky Livery shield logo here
```

## Add your logo

Place your Sky Livery shield logo as `public/logo.png`

## SEO checklist after deploy

- [ ] Set up Google Business Profile
- [ ] Submit sitemap to Google Search Console (auto-generated at /sitemap.xml)
- [ ] Create listings on Yelp, Apple Maps, Bing Places, Facebook
- [ ] Verify NAP is identical everywhere
- [ ] Start collecting Google reviews

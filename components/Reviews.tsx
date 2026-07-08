import FadeIn from "./FadeIn";
import Fleur, { FleurIcon } from "./Fleur";

// Reviews shown on the homepage. When GOOGLE_PLACE_ID is set in the
// environment, we fetch live Google Business Profile reviews at build/
// request time and show those instead of the curated fallback list.
//
// This component is a server component so the Google fetch happens on
// the backend and the API key is never exposed to the browser.

type GoogleReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
};

const CURATED_REVIEWS: GoogleReview[] = [
  {
    author_name: "Sarah B.",
    rating: 5,
    text:
      "Sky Livery has been my go-to for every MSY run for the last year. Clean SUV, on-time every time, and the flat rate is a gift compared to Uber surges during Mardi Gras. Their chauffeurs are the best in the city.",
    relative_time_description: "recently",
  },
  {
    author_name: "Marcus J.",
    rating: 5,
    text:
      "Booked a wedding-day charter for our bridal party. Professional from the moment they picked up the phone. Athar drove us and treated us like family. Not one thing went wrong all night.",
    relative_time_description: "a month ago",
  },
  {
    author_name: "Priya D.",
    rating: 5,
    text:
      "My flight landed at 1 AM after a delay. Driver was already tracking me, waiting at baggage claim with a sign, no surge, no drama. This is what car service is supposed to be.",
    relative_time_description: "recently",
  },
];

async function fetchGoogleReviews(): Promise<GoogleReview[] | null> {
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!placeId || !key) return null;

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${encodeURIComponent(placeId)}` +
      `&fields=reviews,rating,user_ratings_total` +
      `&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.status !== "OK") return null;
    const reviews = (data.result?.reviews ?? []) as GoogleReview[];
    return reviews.slice(0, 3);
  } catch {
    return null;
  }
}

function Stars({ n }: { n: number }) {
  return (
    <div className="text-gold text-sm tracking-widest">
      {"★".repeat(Math.round(n))}
      <span className="text-gold/25">{"★".repeat(5 - Math.round(n))}</span>
    </div>
  );
}

export default async function Reviews() {
  const google = await fetchGoogleReviews();
  const reviews = google ?? CURATED_REVIEWS;
  const isLive = !!google;

  return (
    <section id="reviews" className="py-24 relative bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Fleur className="mb-8" />
        </FadeIn>
        <FadeIn delay={0.05}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold text-center mb-3">
            {isLive ? "Google reviews" : "What riders say"}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold text-center max-w-2xl mx-auto mb-14">
            Trusted by New Orleans, one ride at a time.
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <FadeIn key={r.author_name + i} delay={i * 0.08}>
              <div className="h-full bg-navy/50 border border-gold/25 rounded-2xl p-6 flex flex-col lift-hover">
                <div className="flex items-center gap-2 mb-3">
                  <Stars n={r.rating} />
                  <span className="text-cream/40 text-[10px] tracking-[0.2em] uppercase">
                    {r.relative_time_description}
                  </span>
                </div>
                <p className="text-cream/80 text-sm leading-relaxed mb-5 flex-1 italic">
                  &ldquo;{r.text.length > 240 ? r.text.slice(0, 237) + "…" : r.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-gold/15">
                  <FleurIcon className="w-3 h-4 text-gold" />
                  <span className="text-cream font-semibold text-sm">
                    {r.author_name}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {isLive && (
          <FadeIn delay={0.3}>
            <p className="text-center text-cream/50 text-xs mt-8">
              Live reviews from Google. See all reviews on our{" "}
              <a
                href={`https://search.google.com/local/reviews?placeid=${process.env.GOOGLE_PLACE_ID}`}
                target="_blank"
                rel="noopener"
                className="text-gold hover:underline"
              >
                Google Business Profile
              </a>
              .
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

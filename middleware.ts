import { NextRequest, NextResponse } from "next/server";

// ============================================================
// MAINTENANCE / "NOT IN SERVICE" GATE
// ------------------------------------------------------------
// When active, EVERY route — public site, /admin, /driver/*, and all
// /api endpoints — is intercepted and returns the "Not in Service"
// page. Nothing behind it runs. This is a hard, site-wide shutter.
//
// TO BRING THE SITE BACK: either
//   (a) set the Vercel env var  MAINTENANCE_MODE=off  and redeploy, or
//   (b) change MAINTENANCE_DEFAULT below to false and push.
// TO TAKE IT DOWN AGAIN: MAINTENANCE_MODE=on (or default true) + deploy.
//
// The env var, when present, always wins over the code default, so the
// owner can flip it from Vercel without a code change once this ships.
// ============================================================

const MAINTENANCE_DEFAULT = true;

function maintenanceActive(): boolean {
  const flag = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  if (flag === "on" || flag === "true" || flag === "1") return true;
  if (flag === "off" || flag === "false" || flag === "0") return false;
  return MAINTENANCE_DEFAULT;
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Sky Livery LLC</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    background: #0A1628;
    color: #F2E9D2;
    font-family: Georgia, "Times New Roman", serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    text-align: center;
  }
  .wrap { max-width: 420px; }
  img { width: 76px; height: 76px; object-fit: contain; margin: 0 auto 24px; display: block; opacity: 0.95; }
  .kicker {
    font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase;
    color: #C9A961; margin-bottom: 14px;
  }
  h1 { font-size: 2rem; font-weight: 400; letter-spacing: 0.02em; margin-bottom: 16px; }
  .rule { width: 48px; height: 1px; background: #C9A961; margin: 0 auto 16px; opacity: 0.6; }
  p {
    font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 0.9rem; line-height: 1.6; color: rgba(242,233,210,0.7);
  }
  a { color: #C9A961; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <div class="wrap">
    <img src="/logo-emblem.png" alt="Sky Livery LLC" />
    <div class="kicker">Sky Livery LLC &middot; New Orleans</div>
    <h1>Not in Service</h1>
    <div class="rule"></div>
    <p>Our booking service is temporarily unavailable. For questions, please contact us at <a href="tel:+15043396861">(504)&nbsp;339-6861</a>.</p>
  </div>
</body>
</html>`;

export function middleware(_req: NextRequest) {
  if (!maintenanceActive()) return NextResponse.next();
  return new NextResponse(PAGE, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      "retry-after": "3600",
    },
  });
}

// Match everything EXCEPT the few static assets the "Not in Service"
// page itself needs to render (the logo and favicons). Without these
// exclusions the gate would also swallow its own logo request.
export const config = {
  matcher: [
    "/((?!logo-emblem.png|favicon-16.png|favicon-32.png|apple-icon.png|icon-192.png|icon-512.png).*)",
  ],
};

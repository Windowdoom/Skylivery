import { NextRequest, NextResponse } from "next/server";

// ============================================================
// SITE-WIDE 404 SHUTTER
// ------------------------------------------------------------
// When active, EVERY route — public site, /admin, /driver/*, and all
// /api endpoints — returns a bare 404 "Not Found". No branding, no
// company name, no phone number, no acknowledgement that any service
// exists. The site reads as simply not there.
//
// TO BRING THE SITE BACK: either
//   (a) set the Vercel env var  MAINTENANCE_MODE=off  and redeploy, or
//   (b) change MAINTENANCE_DEFAULT below to false and push.
// TO TAKE IT DOWN AGAIN: MAINTENANCE_MODE=on (or default true) + deploy.
//
// The env var, when present, always wins over the code default.
// ============================================================

const MAINTENANCE_DEFAULT = true;

function shuttered(): boolean {
  const flag = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  if (flag === "on" || flag === "true" || flag === "1") return true;
  if (flag === "off" || flag === "false" || flag === "0") return false;
  return MAINTENANCE_DEFAULT;
}

const NOT_FOUND = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>404 - Not Found</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    background: #ffffff;
    color: #111;
    font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .box { display: flex; align-items: center; gap: 16px; }
  .code { font-size: 22px; font-weight: 600; padding-right: 16px; border-right: 1px solid rgba(0,0,0,0.2); }
  .msg { font-size: 14px; color: #555; }
</style>
</head>
<body>
  <div class="box">
    <div class="code">404</div>
    <div class="msg">This page could not be found.</div>
  </div>
</body>
</html>`;

export function middleware(_req: NextRequest) {
  if (!shuttered()) return NextResponse.next();
  return new NextResponse(NOT_FOUND, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
    },
  });
}

// Catch every route. Nothing is excluded, so even direct asset URLs
// return 404 while the shutter is up.
export const config = {
  matcher: ["/:path*"],
};

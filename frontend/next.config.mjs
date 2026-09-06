/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// The browser must be allowed to reach the backend. Derive that origin from the
// same variable the app uses, so a deployment cannot end up with a CSP that
// silently blocks its own API.
function apiOrigin() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

const connectSrc = ["'self'", apiOrigin()].filter(Boolean);

const scriptSrc = ["'self'", "'unsafe-inline'"];
// Turbopack's dev runtime needs eval; production does not, so do not grant it.
if (isDev) scriptSrc.push("'unsafe-eval'");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(" ")}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  `connect-src ${connectSrc.join(" ")}`,
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The résumé is a static asset that changes rarely; let browsers and
        // CDNs cache it instead of re-downloading on every visit.
        source: "/resume.pdf",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

// Derive Supabase hostname from env so a host swap (Cloud → self-hosted) needs no code change.
// Build fails fast if the env var is missing — preferred over a silent fallback to a stale host.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is not set. Required for image domains and CSP at build time."
  );
}
const supabaseHost = new URL(supabaseUrl).host;

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' removed — not needed for production Next.js 16 builds.
  // 'unsafe-inline' remains (required for Next.js flight manifest + inline
  // bootstrap scripts); removing it requires a per-request nonce middleware
  // which is tracked as a separate hardening task.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // `blob:` is required so the admin product form can preview uploaded color pictograms
  // via URL.createObjectURL before they are resized and sent to Supabase Storage.
  `img-src 'self' data: blob: https://${supabaseHost}`,
  `connect-src 'self' https://${supabaseHost} https://generativelanguage.googleapis.com`,
  "font-src 'self' https://fonts.gstatic.com",
  // Google Maps embed on the admin customer page (no API key, just the
  // `?output=embed` iframe URL). Both google.com and maps.google.com redirect
  // targets must be allowed; www-prefixed hosts covered by *.google.com.
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;

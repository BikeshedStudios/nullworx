import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  trailingSlash: false,
  async rewrites() {
    // The release builder supplies reviewed public metadata. Staging streams
    // through Caddy without copying the video into the application artifact.
    return process.env.NEXT_PUBLIC_ASCII_FEATURED_MEDIA ? [{
      source: "/media/ascii/loop30-v2-807bb27e.mp4",
      destination: "http://127.0.0.1:3403/media/ascii/loop30-v2-807bb27e.mp4",
    }] : [];
  },
  async headers() {
    return [
      {source: "/media/production/:version/:path*", headers: [{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]},
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/lab/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/drops/confirmed",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/drops/unsubscribed",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/downloads/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

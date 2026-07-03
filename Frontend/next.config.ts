import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Specific auth route first: keeps baseURL path-free in auth-client.ts,
      // which matters because better-auth's client only auto-appends its
      // default "/api/auth" base path when the given baseURL has NO path of
      // its own (see better-auth's withPath() in utils/url.ts) — a baseURL of
      // ".../api/backend" would be used as-is with no "/api/auth" appended.
      {
        source: '/api/auth/:path*',
        destination: `${process.env.BACKEND_INTERNAL_URL}/api/auth/:path*`,
      },
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_INTERNAL_URL}/:path*`,
      },
    ]
  },
};

export default nextConfig;

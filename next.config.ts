import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const BUILD_OUTPUT = process.env.NEXT_STANDALONE_OUTPUT
  ? "standalone"
  : undefined;

export default () => {
  const nextConfig: NextConfig = {
    output: BUILD_OUTPUT,
    cleanDistDir: true,
    devIndicators: {
      position: "bottom-right",
    },
    env: {
      NO_HTTPS: process.env.NO_HTTPS,
    },
    experimental: {
      taint: true,
    },
    // iOS Safari compatibility
    compiler: {
      removeConsole:
        process.env.NODE_ENV === "production"
          ? {
              exclude: ["error", "warn"],
            }
          : false,
    },
    // Headers for iOS compatibility and CSP
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value:
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'none'; base-uri 'self';",
            },
            {
              key: "X-Frame-Options",
              value: "SAMEORIGIN",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            // iOS Safari specific headers
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
            // Prevent iOS Safari from auto-detecting content
            {
              key: "X-UA-Compatible",
              value: "IE=edge",
            },
          ],
        },
        // Specific caching for static assets on iOS
        {
          source: "/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ];
    },
    // Webpack config for iOS compatibility
    webpack: (config, { isServer }) => {
      // iOS Safari compatibility fixes
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }

      return config;
    },
  };
  const withNextIntl = createNextIntlPlugin();
  return withNextIntl(nextConfig);
};

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
    // Add browser compatibility for older devices
    transpilePackages: [],
    compiler: {
      // Remove console.logs in production for better performance
      removeConsole: process.env.NODE_ENV === "production",
    },
    // Ensure compatibility with older browsers
    swcMinify: false, // Use Babel instead for better compatibility
  };
  const withNextIntl = createNextIntlPlugin();
  return withNextIntl(nextConfig);
};

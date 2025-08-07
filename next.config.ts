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
    // Comprehensive iOS WebKit compatibility
    webpack: (config, { isServer, dev }) => {
      if (!isServer) {
        // Fix iOS WebKit module resolution issues
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
        };

        // Optimize chunks for iOS
        if (!dev) {
          config.optimization = {
            ...config.optimization,
            splitChunks: {
              chunks: "all",
              minSize: 20000,
              maxSize: 244000,
              cacheGroups: {
                default: {
                  minChunks: 2,
                  priority: -20,
                  reuseExistingChunk: true,
                },
                vendor: {
                  test: /[\\/]node_modules[\\/]/,
                  name: "vendors",
                  priority: -10,
                  chunks: "all",
                },
                // Separate chunk for iOS-problematic modules
                ios: {
                  test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
                  name: "ios-core",
                  priority: 10,
                  chunks: "all",
                },
              },
            },
          };
        }
      }
      return config;
    },
    // Enhanced iOS compatibility settings
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    compress: true,
  };
  const withNextIntl = createNextIntlPlugin();
  return withNextIntl(nextConfig);
};

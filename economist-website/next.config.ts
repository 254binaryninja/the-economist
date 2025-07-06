import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages for server-side rendering
  serverExternalPackages: [
    "keyv",
    "@keyv/redis",
    "redis",
    "office-text-extractor",
    "got",
    "cacheable-request",
  ],

  // Turbopack configuration
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },

  // Webpack fallback (when not using turbopack)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark packages as external to avoid bundling issues
      config.externals = config.externals || [];
      config.externals.push({
        keyv: "keyv",
        "@keyv/redis": "@keyv/redis",
        "@keyv/mongo": "@keyv/mongo",
        "@keyv/sqlite": "@keyv/sqlite",
        "@keyv/postgres": "@keyv/postgres",
        "@keyv/mysql": "@keyv/mysql",
        "@keyv/etcd": "@keyv/etcd",
        "@keyv/offline": "@keyv/offline",
        "@keyv/tiered": "@keyv/tiered",
        "office-text-extractor": "office-text-extractor",
        got: "got",
        "cacheable-request": "cacheable-request",
      });

      // Handle dynamic imports
      config.resolve = config.resolve || {};
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "@keyv/redis": false,
        "@keyv/mongo": false,
        "@keyv/sqlite": false,
        "@keyv/postgres": false,
        "@keyv/mysql": false,
        "@keyv/etcd": false,
        "@keyv/offline": false,
        "@keyv/tiered": false,
      };
    }
    return config;
  },
};

export default nextConfig;

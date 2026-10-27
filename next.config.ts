import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Redirect "/" before rendering; a page calling redirect() never renders
  // and fails instant-navigation validation under cacheComponents.
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: false },
      // The home story is served at the locale root; avoid a duplicate URL.
      { source: "/:locale(en|es)/home", destination: "/:locale", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

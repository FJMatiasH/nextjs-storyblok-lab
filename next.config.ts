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
    // Storyblok's image service does the resizing (see the loader file).
    loader: "custom",
    loaderFile: "./src/lib/storyblok-image-loader.ts",
    // Only read by the default loader; kept so switching back stays limited
    // to Storyblok assets.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
        pathname: "/f/**",
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

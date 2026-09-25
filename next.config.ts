import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export so the site can be hosted anywhere (Cloudflare Pages / Vercel / Netlify).
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  experimental: {
    // Inlines the page's CSS into the HTML, removing a render-blocking
    // round trip before the hero headline can paint.
    inlineCss: true,
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;

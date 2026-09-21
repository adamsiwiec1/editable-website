import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['editable-website'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'github.com' }],
  },
};

export default nextConfig;

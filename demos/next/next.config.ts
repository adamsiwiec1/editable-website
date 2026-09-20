import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['editable-website'],
  agentRules: false,
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true, // ✅ moved out of experimental

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sinlessgamesllc.com',
        pathname: '/Helix-AI/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sinlessgamesllc.com',
        pathname: '/Sinless-Games/images/**',
      },
      {
        protocol: 'https',
        hostname: 'optimum-dinosaur-24.clerk.accounts.dev',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [100, 75, 50, 25],
  },
};

export default nextConfig;

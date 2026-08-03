import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['protobufjs', '@grpc/grpc-js'],
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;

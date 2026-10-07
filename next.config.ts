import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/downloads/stage2-covert-transmissions.zip',
        destination: '/api/challenges/2/download',
      },
    ];
  },
};

export default nextConfig;

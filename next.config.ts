import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  serverExternalPackages: ['geoip-lite'],
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: "/archives", destination: "/notes", permanent: true },
      { source: "/archives/:slug", destination: "/notes/:slug", permanent: true },
    ];
  },
};

export default nextConfig;

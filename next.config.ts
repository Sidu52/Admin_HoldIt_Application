import type { NextConfig } from "next";

const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/v1/admin/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:5000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // If you're using Next.js API routes as proxy
  async rewrites() {
    return [
      {
        source: '/api/v1/admin/:path*',
        destination: 'http://localhost:5000/api/v1/admin/:path*', // Your production backend
      },
    ];
  },
};


export default nextConfig;

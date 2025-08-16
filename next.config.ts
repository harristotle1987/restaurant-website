/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic image configuration
  images: {
    domains: ['localhost', 'vercel.app', 'your-domain.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Only add experimental config in development
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedDevOrigins: ['192.168.160.114'],
    },
  }),
  
  // Basic CORS headers for development
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/_next/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization',
            },
          ],
        },
      ];
    }
    return [];
  },
};
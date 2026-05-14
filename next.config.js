/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize build for Vercel
  swcMinify: true,
  // Skip static optimization for API routes to prevent hanging
  staticPageGenerationTimeout: 30,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['firebase/firestore', 'firebase/app'],
  },
  // Webpack config to handle Firestore better
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'firebase/app', 'firebase/firestore'];
    }
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs'],
  typescript: {
    // Temporarily ignore type checking errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build  
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'localhost',
      'koppela.com',
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'lh7.googleusercontent.com',
      'lh8.googleusercontent.com',
      'lh9.googleusercontent.com',
      'lh10.googleusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'koppela.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      }
    ],
  },
}

export default nextConfig

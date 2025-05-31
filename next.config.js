/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['gateway.lighthouse.storage', 'images.unsplash.com'],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig; 
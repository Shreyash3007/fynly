/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.dicebear.com', 'i.pravatar.cc'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig


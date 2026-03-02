/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep this for Mongoose compatibility on Serverless
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'cdn-icons-png.flaticon.com' },
      { protocol: 'https', hostname: 'www.transparenttextures.com' },
    ],
  },
};

module.exports = nextConfig;
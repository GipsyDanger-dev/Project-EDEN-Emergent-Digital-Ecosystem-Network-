/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@eden/core',
    '@eden/ai',
    '@eden/citizen',
    '@eden/engine',
    '@eden/history',
    '@eden/db',
  ],
};

module.exports = nextConfig;

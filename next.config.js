/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Exclude Supabase functions from build
    ignoreBuildErrors: false,
  },
  // Ensure all routes are treated as dynamic for SSR
  output: 'standalone',
};

module.exports = nextConfig;


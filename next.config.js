/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out 'output: export' to enable API routes
  // output: 'export',
  
  // Suppress Supabase webpack warnings
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase/ },
    ];
    return config;
  },
}

module.exports = nextConfig

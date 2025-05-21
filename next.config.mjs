import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Webpack modifications
    if (!isServer) {
      const emptyModulePath = path.join(__dirname, 'empty-module.js');
      
      // Ensure resolve and alias objects exist
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }
      
      // Alias 'canvas' and Konva's Node.js specific index file to an empty module
      // to prevent them from being bundled and causing errors on the client-side.
      config.resolve.alias['canvas'] = emptyModulePath;
      config.resolve.alias['konva/lib/index-node.js'] = emptyModulePath;
    }
    return config;
  },
}

export default nextConfig

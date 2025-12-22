import path from "path";
import { fileURLToPath } from "url";

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
  env: {
    CODESPACE_NAME: process.env.CODESPACE_NAME,
  },
  // Configure webpack to handle the shared directory
  webpack: (config, { isServer }) => {
    // Add the shared directory to be transpiled
    config.module.rules.push({
      test: /\.ts$/,
      include: [path.resolve(__dirname, "../shared")],
      use: [
        {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      ],
    });

    return config;
  },
  // Allow imports from outside the src directory
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;

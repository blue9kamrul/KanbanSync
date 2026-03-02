import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this block to fix the Vercel internal output error!
  serverExternalPackages: ['pg', '@prisma/client', '@auth/prisma-adapter'],

  // (Keep any other config you already had here)
};

export default nextConfig;
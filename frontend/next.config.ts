import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ITEMS_PER_PAGE: process.env.ITEMS_PER_PAGE,
  },
};

export default nextConfig;

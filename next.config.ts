import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/signin", destination: "/", permanent: false }];
  },
};

export default nextConfig;

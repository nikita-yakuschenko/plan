import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/object/:id",
        destination: "/object/:id",
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

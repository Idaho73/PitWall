import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {hostname: "encrypted-tbn0.gstatic.com"},
      {hostname: "cdn.cms.mtv.hu"},
    ]
  }
};

export default nextConfig;

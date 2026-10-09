/** @type {import('next').NextConfig} */

const nextConfig = {
  allowedDevOrigins: ["dev-org.orgatick.site"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "assets.orgatick.in", pathname: "/**" }],
  },
};

export default nextConfig;

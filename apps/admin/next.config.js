/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["dev-admin.orgatick.site"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "assets.orgatick.in", pathname: "/**" }],
  },
};

export default nextConfig;

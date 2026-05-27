/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@job-portal/ui", "@job-portal/utils", "@job-portal/types"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@job-portal/ui", "@job-portal/utils", "@job-portal/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "media.licdn.com" },
    ],
  },
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },
};

export default nextConfig;

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  throw new Error("API_URL is required. Set it in Dokploy build/runtime envs.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

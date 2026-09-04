import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf2json", "mammoth", "@prisma/client"],
};

export default nextConfig;

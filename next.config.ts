import type { NextConfig } from "next";

const repo = "pivot-design";
const onPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: onPages ? `/${repo}` : undefined,
  assetPrefix: onPages ? `/${repo}/` : undefined,
};

export default nextConfig;

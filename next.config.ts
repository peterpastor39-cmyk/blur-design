import type { NextConfig } from "next";

// Pages named `*.dev.tsx` (the variant preview tools) only exist in `next dev`,
// so the deployed site ships just the homepage.
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  pageExtensions: isDev ? ["dev.tsx", "tsx", "ts"] : ["tsx", "ts"],
  output: isDev ? undefined : "export",
  trailingSlash: !isDev,
};

export default nextConfig;

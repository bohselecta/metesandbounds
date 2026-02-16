import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@parcel-link/data"]
};

export default config;

initOpenNextCloudflareForDev();

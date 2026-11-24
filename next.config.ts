import type { NextConfig } from "next";

// Runs as a Node server (API routes + SQLite). Set KAMAI_DATA_DIR to a persistent disk in production.
const config: NextConfig = {
  trailingSlash: false,
  agentRules: false,
} as NextConfig;
export default config;

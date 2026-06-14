import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// ESM-safe __dirname (works on all Node 18+ without import.meta.dirname).
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    // Pin the workspace root to THIS app. Without this, the root-level
    // package-lock.json (used by the dev launcher) makes Turbopack infer the
    // whole monorepo as the root and try to watch/compile the .NET API, the
    // Python service and the root node_modules — which exhausts memory and
    // stalls the first route compile (port 3000 never finishes loading).
    root: __dirname,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app lives in a subfolder of a repo with its own lockfile at the root; trace files from here.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  // Loaded at runtime from node_modules instead of being bundled (PGlite ships WASM, pg has optional native bindings).
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

module.exports = nextConfig;

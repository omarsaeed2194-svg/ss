/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Loaded at runtime from node_modules instead of being bundled (PGlite ships WASM, pg has optional native bindings).
    serverComponentsExternalPackages: ["@electric-sql/pglite", "pg"],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const removeImports = require("next-remove-imports")();

const nextConfig = {
  reactStrictMode: true,
  experimental: { esmExternals: true }
}

module.exports = removeImports(nextConfig)

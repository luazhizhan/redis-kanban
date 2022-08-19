/** @type {import('next').NextConfig} */

// Required by @uiw/react-md-editor
// https://www.npmjs.com/package/@uiw/react-md-editor#support-nextjs
const removeImports = require('next-remove-imports')()

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = removeImports(nextConfig)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // 確保環境變數能夠注入
  env: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'https://yearprogres.azndev.com'
  },
  // 忽略ESLint错误
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig

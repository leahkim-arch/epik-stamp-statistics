/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages는 basePath가 필요합니다 (저장소 이름이 URL에 포함됨)
  basePath: '/epik-stamp-statistics',
  trailingSlash: true,
}

module.exports = nextConfig

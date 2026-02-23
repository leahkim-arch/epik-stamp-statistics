/** @type {import('next').NextConfig} */
const basePath = '/epik-stamp-statistics';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages는 basePath가 필요합니다 (저장소 이름이 URL에 포함됨)
  basePath: basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

module.exports = nextConfig

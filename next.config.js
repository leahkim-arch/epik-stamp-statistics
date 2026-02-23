/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages는 basePath가 필요할 수 있습니다 (저장소 이름이 URL에 포함되는 경우)
  // basePath: '/stamp_2026', // 필요시 주석 해제
  // trailingSlash: true,
}

module.exports = nextConfig

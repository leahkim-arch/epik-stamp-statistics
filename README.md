# EPIK STAMP - Stamp Performance Dashboard

2026년 1월 EPIK Stamp 성과 통계 대시보드

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React Icons

## 주요 기능

- 📁 Summary: 전체 스탬프 성과 통계 (주차별 분류)
- 🌏 Country Ranking: 국가별 랭킹 (한국, 일본, Non Asia)
- ✨ Monthly statistics: 신규 스탬프 팩 통계

## 로컬 개발

```bash
npm install
npm run dev
```

## 데이터 처리

```bash
# 메인 데이터 처리
node scripts/process-data.js

# 주차별 데이터 처리
node scripts/process-weekly-data.js

# 국가별 랭킹 데이터 처리
node scripts/process-country-ranking.js

# 신규 스탬프 팩 데이터 처리
node scripts/process-new-stamp-pack.js
```

## 배포

GitHub Pages를 통해 자동 배포됩니다.

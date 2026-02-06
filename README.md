# Stamp Performance Dashboard

2026년 1월 스탬프 성과를 시각화하는 대시보드입니다.

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (아이콘)
- **XLSX** (Excel 파일 처리)

## 기능

- 📊 전체 Select, Save, Subscribe 합계 요약
- 📈 Subscribe 기준 정렬된 스탬프 목록
- 🎨 다크 모드 기반의 모던한 디자인
- 📱 반응형 Bento Grid 레이아웃
- 🔄 데이터 중복 제거 및 통합
- 🌏 국가별 랭킹
- ✨ 신규 스탬프 팩 분석

## 배포 방법

### Vercel로 배포 (추천)

1. **GitHub에 코드 업로드**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Vercel에 배포**
   - [Vercel](https://vercel.com)에 가입/로그인
   - "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - "Deploy" 클릭

3. **배포 완료**
   - 몇 분 후 자동으로 배포 완료
   - `https://your-project-name.vercel.app` 형태의 URL 제공
   - 커스텀 도메인도 설정 가능

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 데이터 처리

Excel 파일을 JSON으로 변환:

```bash
node scripts/process-data.js
node scripts/process-country-ranking.js
node scripts/process-weekly-data.js
node scripts/process-new-stamp-pack.js
```

처리된 데이터는 `public/` 폴더에 저장됩니다.

## 프로젝트 구조

```
stamp_2026/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지
│   └── api/                # API 라우트
├── components/             # React 컴포넌트
├── contexts/               # React Context
├── scripts/                # 데이터 처리 스크립트
├── public/                 # 정적 파일 및 JSON 데이터
└── package.json
```

## 라이선스

Private

# 배포 가이드

이 프로젝트를 Vercel을 통해 무료로 배포하는 방법입니다.

## 🚀 Vercel로 배포하기 (가장 쉬운 방법)

### 1단계: GitHub에 코드 업로드

터미널에서 다음 명령어를 실행하세요:

```bash
# Git 저장소 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Stamp Performance Dashboard"

# GitHub에 새 저장소 생성 후, 아래 명령어 실행
# (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**GitHub 저장소 생성 방법:**
1. [GitHub](https://github.com)에 로그인
2. 우측 상단 "+" 버튼 클릭 → "New repository"
3. 저장소 이름 입력 (예: `stamp-performance-dashboard`)
4. Public 또는 Private 선택
5. "Create repository" 클릭
6. 나오는 명령어 중 `git remote add origin` 부분 사용

### 2단계: Vercel에 배포

1. **Vercel 가입/로그인**
   - [Vercel](https://vercel.com) 접속
   - "Sign Up" 클릭 → GitHub 계정으로 로그인

2. **프로젝트 배포**
   - 대시보드에서 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택 (방금 만든 저장소)
   - "Import" 클릭

3. **프로젝트 설정** (자동으로 설정됨)
   - Framework Preset: **Next.js** (자동 감지)
   - Root Directory: `./`
   - Build Command: `npm run build` (자동)
   - Output Directory: `.next` (자동)
   - Install Command: `npm install` (자동)

4. **배포 시작**
   - "Deploy" 버튼 클릭
   - 2-3분 정도 기다리기

5. **배포 완료!**
   - 배포가 완료되면 `https://your-project-name.vercel.app` 형태의 URL이 생성됩니다
   - 이 URL을 누구에게나 공유할 수 있습니다!

### 3단계: 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Domains" 메뉴
3. 원하는 도메인 입력
4. DNS 설정 안내에 따라 도메인 설정

## 📝 주의사항

- **데이터 파일**: `public/` 폴더의 JSON 파일들이 포함되어야 합니다
- **이미지 파일**: `public/thumbnails/`와 `public/new-stamp-assets/` 폴더의 이미지들이 포함되어야 합니다
- **Excel 파일**: 배포에는 필요 없지만, 데이터 업데이트 시 필요합니다

## 🔄 데이터 업데이트 방법

데이터를 업데이트하려면:

1. 로컬에서 Excel 파일 처리:
   ```bash
   node scripts/process-data.js
   node scripts/process-country-ranking.js
   node scripts/process-weekly-data.js
   node scripts/process-new-stamp-pack.js
   ```

2. 변경된 JSON 파일들을 Git에 커밋:
   ```bash
   git add public/*.json
   git commit -m "Update data"
   git push
   ```

3. Vercel이 자동으로 재배포합니다!

## 💡 다른 배포 옵션

### Netlify
- Vercel과 유사한 과정
- GitHub 저장소 연결 → 자동 배포

### Railway
- 더 많은 제어 옵션
- 데이터베이스 연동 가능

## ❓ 문제 해결

**빌드 실패 시:**
- Vercel 대시보드의 "Logs" 탭에서 에러 확인
- 로컬에서 `npm run build` 실행하여 에러 확인

**이미지가 안 보일 때:**
- `public/` 폴더의 이미지 파일들이 Git에 포함되었는지 확인
- 이미지 경로가 올바른지 확인

**데이터가 안 보일 때:**
- `public/*.json` 파일들이 Git에 포함되었는지 확인
- 브라우저 콘솔에서 404 에러 확인

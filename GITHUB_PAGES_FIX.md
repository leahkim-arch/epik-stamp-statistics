# GitHub Pages 404 에러 해결 방법

## 문제 원인
1. 워크플로우 파일이 GitHub에 없음 (workflow 권한 필요)
2. basePath 설정이 필요함 (저장소 이름이 URL에 포함됨)

## 해결 방법

### 1단계: basePath 설정 (완료됨 ✅)
- `next.config.js`에 `basePath: '/epik-stamp-statistics'` 추가됨
- 이제 다시 빌드하고 푸시해야 합니다

### 2단계: 워크플로우 파일을 GitHub에 추가

**방법 A: GitHub 웹에서 직접 추가 (권장)**

1. https://github.com/leahkim-arch/epik-stamp-statistics 접속
2. "Add file" → "Create new file" 클릭
3. 파일 경로 입력: `.github/workflows/deploy.yml`
4. 아래 내용을 복사해서 붙여넣기:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './out'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. "Commit new file" 클릭

**방법 B: 새 토큰으로 푸시**

1. https://github.com/settings/tokens/new 에서 새 토큰 생성
2. **"repo"**와 **"workflow"** 권한 모두 체크
3. 새 토큰으로 푸시

### 3단계: GitHub Pages 설정

1. 저장소 → **Settings** → **Pages** 접속
2. **Source**: "GitHub Actions" 선택
3. 저장

### 4단계: 배포 확인

1. **Actions** 탭에서 워크플로우 실행 확인
2. 완료 후 접속: **https://leahkim-arch.github.io/epik-stamp-statistics/**

⚠️ **중요**: URL에 저장소 이름(`/epik-stamp-statistics`)이 포함되어야 합니다!

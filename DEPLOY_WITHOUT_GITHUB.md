# GitHub 없이 배포하는 방법

## 방법 1: Vercel CLI로 직접 배포 (가장 쉬움! ⭐)

### 1단계: Vercel CLI 설치

터미널에서:
```bash
npm install -g vercel
```

### 2단계: Vercel 로그인

```bash
vercel login
```
브라우저가 열리면 Vercel 계정으로 로그인하세요.

### 3단계: 프로젝트 디렉토리로 이동

```bash
cd /Users/grim/Documents/stamp_2026
```

### 4단계: 배포!

```bash
vercel
```

질문이 나오면:
- Set up and deploy? → **Y**
- Which scope? → 본인 계정 선택
- Link to existing project? → **N** (처음이면)
- Project name? → 원하는 이름 입력 (또는 엔터)
- Directory? → **./** (엔터)
- Override settings? → **N** (엔터)

### 5단계: 완료! 🎉

배포가 완료되면 URL이 표시됩니다!

---

## 방법 2: Netlify Drop (드래그 앤 드롭)

### 1단계: 프로젝트 빌드

```bash
cd /Users/grim/Documents/stamp_2026
npm run build
```

### 2단계: .next 폴더 압축

`.next` 폴더를 ZIP으로 압축

### 3단계: Netlify Drop에 업로드

1. [Netlify Drop](https://app.netlify.com/drop) 접속
2. ZIP 파일을 드래그 앤 드롭
3. 자동으로 배포됨!

---

## 방법 3: GitLab 사용

GitHub 대신 GitLab 사용:
- [GitLab.com](https://gitlab.com) 가입
- GitHub와 동일한 방식으로 사용 가능

---

## 추천: 방법 1 (Vercel CLI)

가장 간단하고 빠릅니다! GitHub 계정도 필요 없고, 명령어 몇 개면 끝납니다.

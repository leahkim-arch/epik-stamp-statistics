# Vercel CLI로 배포하기

## 방법 1: npx 사용 (권장)

터미널에서 실행:

```bash
cd /Users/grim/Documents/stamp_2026

# Vercel 로그인 (처음 한 번만)
npx vercel login

# 배포
npx vercel
```

## 방법 2: 로컬 설치 후 사용

터미널에서 실행:

```bash
cd /Users/grim/Documents/stamp_2026

# 로컬에 설치 (이미 완료됨)
# npm install vercel --save-dev

# 배포
npx vercel
```

## 배포 과정

`npx vercel` 실행 후:

1. **Set up and deploy?** → `Y` 입력
2. **Which scope?** → 본인 계정 선택 (엔터)
3. **Link to existing project?** → `N` 입력 (처음이면)
4. **What's your project's name?** → 원하는 이름 입력 또는 엔터
5. **In which directory is your code located?** → `./` 입력 또는 엔터
6. **Want to override the settings?** → `N` 입력 또는 엔터

그러면 자동으로 빌드하고 배포합니다!

## 완료 후

배포가 완료되면:
- `https://your-project-name.vercel.app` URL이 표시됩니다
- 이 URL을 누구에게나 공유할 수 있습니다!

## 업데이트 방법

코드를 수정한 후:
```bash
npx vercel --prod
```

하면 프로덕션에 바로 반영됩니다!

# 🚀 배포 단계별 가이드

터미널에서 다음 명령어를 순서대로 실행하세요!

## 1단계: Git 저장소 초기화 및 커밋

```bash
cd /Users/grim/Documents/stamp_2026

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Stamp Performance Dashboard"
```

## 2단계: GitHub에 저장소 생성

1. [GitHub.com](https://github.com) 접속 후 로그인
2. 우측 상단 **"+"** 버튼 클릭 → **"New repository"**
3. 저장소 이름 입력 (예: `stamp-performance-dashboard`)
4. **Public** 또는 **Private** 선택
5. **"Create repository"** 클릭
6. 생성된 페이지에서 나오는 명령어 중 아래 부분 복사:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

## 3단계: GitHub에 푸시

터미널에서:

```bash
# GitHub 저장소 연결 (위에서 복사한 명령어 사용)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 브랜치 이름 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

## 4단계: Vercel에 배포

1. [Vercel.com](https://vercel.com) 접속
2. **"Sign Up"** 클릭 → **GitHub 계정으로 로그인**
3. 대시보드에서 **"Add New..."** → **"Project"** 클릭
4. 방금 만든 GitHub 저장소 선택
5. **"Import"** 클릭
6. 설정 확인 (자동으로 설정됨):
   - Framework Preset: **Next.js** ✅
   - Root Directory: `./` ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅
7. **"Deploy"** 버튼 클릭
8. 2-3분 기다리기...

## 5단계: 완료! 🎉

배포가 완료되면:
- `https://your-project-name.vercel.app` 형태의 URL이 생성됩니다
- 이 URL을 누구에게나 공유할 수 있습니다!

## 🔄 이후 업데이트 방법

코드를 수정한 후:

```bash
git add .
git commit -m "수정 내용 설명"
git push
```

Vercel이 자동으로 감지하고 재배포합니다! (약 2-3분 소요)

## ❓ 문제 해결

**Git 푸시가 안 될 때:**
- GitHub에 로그인되어 있는지 확인
- 저장소 URL이 정확한지 확인

**Vercel 빌드 실패 시:**
- Vercel 대시보드의 "Logs" 탭에서 에러 확인
- 로컬에서 `npm run build` 실행해서 에러 확인

**이미지나 데이터가 안 보일 때:**
- `public/` 폴더의 파일들이 Git에 포함되었는지 확인
- `git add public/` 실행 후 다시 커밋

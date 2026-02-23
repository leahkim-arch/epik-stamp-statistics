# ✅ Git 준비 완료!

Git 저장소가 초기화되고 모든 파일이 커밋되었습니다.

## 다음 단계 (2분이면 완료!)

### 1. GitHub 저장소 생성 (웹에서)

1. [GitHub.com](https://github.com) 접속 → 로그인
2. 우측 상단 **"+"** → **"New repository"**
3. 저장소 이름 입력 (예: `stamp-performance-dashboard`)
4. **Public** 또는 **Private** 선택
5. **"Create repository"** 클릭
6. **중요:** "Initialize this repository with" 옵션들은 모두 체크 해제!
7. 생성된 페이지에서 나오는 명령어 중 아래 부분을 복사:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

### 2. 터미널에서 실행

터미널을 열고 아래 명령어를 실행하세요:

```bash
cd /Users/grim/Documents/stamp_2026

# 위에서 복사한 명령어 실행 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# GitHub에 푸시
git branch -M main
git push -u origin main
```

### 3. Vercel에 배포 (웹에서)

1. [Vercel.com](https://vercel.com) 접속
2. **"Sign Up"** → **GitHub로 로그인**
3. **"Add New..."** → **"Project"**
4. 방금 만든 GitHub 저장소 선택
5. **"Import"** 클릭
6. 설정 확인 (자동 설정됨) → **"Deploy"** 클릭
7. 2-3분 기다리면 완료! 🎉

## 완료 후

배포가 완료되면 `https://your-project-name.vercel.app` URL이 생성됩니다!

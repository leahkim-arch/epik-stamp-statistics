# GitHub 저장소 설정하기

현재 상태: Git 커밋은 완료되었지만 GitHub에 연결되지 않았습니다.

## 지금 해야 할 일:

### 1. GitHub에서 저장소 생성 (1분)

1. [GitHub.com](https://github.com) 접속 → 로그인
2. 우측 상단 **"+"** 버튼 클릭 → **"New repository"**
3. 저장소 이름 입력 (예: `stamp-performance-dashboard`)
4. **Public** 또는 **Private** 선택
5. ⚠️ **중요:** 아래 옵션들은 모두 **체크 해제**:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. **"Create repository"** 클릭

### 2. GitHub URL 복사

생성된 페이지에서 보이는 명령어 중:
```
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```
이 부분의 URL을 복사하세요.

### 3. 터미널에서 실행

터미널에서 아래 명령어를 실행하세요:

```bash
# 1. GitHub 저장소 연결 (위에서 복사한 URL 사용)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 2. 브랜치 이름 설정
git branch -M main

# 3. GitHub에 푸시
git push -u origin main
```

### 4. 확인

다시 확인:
```bash
git remote -v
```

이제 GitHub URL이 보여야 합니다!

## 다음 단계

GitHub 푸시가 완료되면 Vercel에 배포하면 됩니다.

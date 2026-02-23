# GitHub에 코드 푸시하기

## 빠른 방법 (약 2분)

### 1단계: Personal Access Token 생성
1. 브라우저에서 https://github.com/settings/tokens/new 접속
2. "Note"에 `epik-stamp-push` 입력
3. "Expiration"을 원하는 기간으로 선택 (예: 90 days)
4. **"repo" 체크박스 선택** (전체 권한)
5. 맨 아래 "Generate token" 클릭
6. **생성된 토큰을 복사** (한 번만 보여줍니다!)

### 2단계: 터미널에서 푸시
터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/grim/Documents/stamp_2026
git push -u origin main
```

**입력 요청 시:**
- Username: `leahkim-arch`
- Password: **복사한 토큰을 붙여넣기** (비밀번호가 아닙니다!)

### 3단계: 완료 확인
푸시가 성공하면 GitHub 저장소 페이지에서 코드가 보입니다.

---

## 대안: GitHub CLI 사용

```bash
gh auth login
# 브라우저에서 로그인 후
git push -u origin main
```

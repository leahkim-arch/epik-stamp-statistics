# 빠른 GitHub Pages 배포

## 자동 배포 스크립트 실행

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/grim/Documents/stamp_2026
./setup-github-pages.sh
```

스크립트가 GitHub 사용자명과 저장소 이름을 물어볼 것입니다.

## 또는 수동으로 진행

### 1. GitHub 저장소 생성
- https://github.com/new 접속
- 저장소 이름 입력 (예: `stamp-2026`)
- **"Initialize this repository with a README" 체크 해제**
- "Create repository" 클릭

### 2. 원격 저장소 추가 및 푸시
```bash
cd /Users/grim/Documents/stamp_2026
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

### 3. GitHub Pages 활성화
1. 저장소 → Settings → Pages
2. Source: **"GitHub Actions"** 선택
3. 저장

### 4. 배포 확인
- Actions 탭에서 배포 진행 상황 확인
- 완료 후 `https://사용자명.github.io/저장소명/` 접속

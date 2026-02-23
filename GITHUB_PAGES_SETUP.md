# GitHub Pages 배포 가이드

## 1단계: GitHub 저장소 생성

1. https://github.com/new 접속
2. 저장소 이름 입력 (예: `stamp-2026` 또는 `epik-stamp-statistics`)
3. Public 또는 Private 선택
4. **"Initialize this repository with a README" 체크 해제** (이미 코드가 있으므로)
5. "Create repository" 클릭

## 2단계: 저장소 URL 확인

저장소 생성 후 나타나는 URL을 복사하세요:
- 예: `https://github.com/사용자명/저장소명.git`

## 3단계: 원격 저장소 추가 및 푸시

터미널에서 다음 명령어 실행:

```bash
cd /Users/grim/Documents/stamp_2026
git remote add origin https://github.com/사용자명/저장소명.git
git branch -M main
git push -u origin main
```

## 4단계: GitHub Pages 활성화

1. GitHub 저장소 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **Source** 섹션에서:
   - "Deploy from a branch" 선택
   - Branch: `gh-pages` 또는 **"GitHub Actions"** 선택 (권장)
4. 저장

## 5단계: 자동 배포 확인

- GitHub Actions 탭에서 배포 진행 상황 확인
- 배포 완료 후 `https://사용자명.github.io/저장소명/` 에서 사이트 확인

## 참고사항

- GitHub Pages는 정적 사이트만 호스팅 가능합니다
- API 라우트(`/api/upload-thumbnail`)는 작동하지 않습니다
- 썸네일 업로드 기능은 로컬 개발 환경에서만 사용 가능합니다

#!/bin/bash

# GitHub Pages 배포 자동화 스크립트

echo "🚀 GitHub Pages 배포 설정 시작..."
echo ""

# GitHub 사용자명 입력
read -p "GitHub 사용자명을 입력하세요: " GITHUB_USERNAME

# 저장소 이름 입력
read -p "저장소 이름을 입력하세요 (예: stamp-2026): " REPO_NAME

# 저장소 URL
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "📦 원격 저장소 추가 중..."
git remote remove origin 2>/dev/null
git remote add origin "${REPO_URL}"

echo "📤 코드 푸시 중..."
git push -u origin main

echo ""
echo "✅ 완료!"
echo ""
echo "다음 단계:"
echo "1. https://github.com/${GITHUB_USERNAME}/${REPO_NAME} 에서 저장소 생성 확인"
echo "2. Settings → Pages → Source를 'GitHub Actions'로 설정"
echo "3. 배포 완료 후 https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/ 에서 확인"
echo ""

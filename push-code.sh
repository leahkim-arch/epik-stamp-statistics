#!/bin/bash

echo "=========================================="
echo "GitHub에 코드 푸시하기"
echo "=========================================="
echo ""
echo "1단계: Personal Access Token이 필요합니다."
echo "   브라우저에서 https://github.com/settings/tokens/new 접속"
echo "   - Note: epik-stamp-push"
echo "   - Expiration: 90 days"
echo "   - repo 권한 체크"
echo "   - Generate token 클릭 후 토큰 복사"
echo ""
read -p "토큰을 복사하셨나요? (y/n): " token_ready

if [ "$token_ready" != "y" ]; then
    echo "토큰을 먼저 생성해주세요."
    exit 1
fi

echo ""
echo "2단계: 푸시 진행..."
echo ""

cd /Users/grim/Documents/stamp_2026

# Username을 미리 설정
git config --local credential.helper '!f() { echo "username=leahkim-arch"; echo "password=$GITHUB_TOKEN"; }; f'

read -sp "GitHub 토큰을 입력하세요: " GITHUB_TOKEN
echo ""

export GITHUB_TOKEN

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 성공! 코드가 GitHub에 푸시되었습니다."
    echo "   https://github.com/leahkim-arch/epik-stamp-statistics 에서 확인하세요."
else
    echo ""
    echo "❌ 실패했습니다. 토큰을 다시 확인해주세요."
fi

#!/bin/bash

echo "=========================================="
echo "GitHub 워크플로우 파일 추가 스크립트"
echo "=========================================="
echo ""
echo "현재 토큰에는 'workflow' 권한이 없어서"
echo "자동으로 추가할 수 없습니다."
echo ""
echo "다음 방법 중 하나를 선택하세요:"
echo ""
echo "방법 1: 새 토큰 생성 (권장)"
echo "  1. https://github.com/settings/tokens/new 접속"
echo "  2. 'repo'와 'workflow' 권한 모두 체크"
echo "  3. 새 토큰 생성 후 이 스크립트에 입력"
echo ""
echo "방법 2: GitHub 웹에서 직접 추가"
echo "  아래 명령어로 워크플로우 파일 내용을 확인하세요:"
echo "  cat .github/workflows/deploy.yml"
echo ""

# 워크플로우 파일 내용 표시
echo "=========================================="
echo "워크플로우 파일 내용:"
echo "=========================================="
cat .github/workflows/deploy.yml

echo ""
echo "=========================================="
echo "이 내용을 복사해서 GitHub 웹에 추가하세요:"
echo "https://github.com/leahkim-arch/epik-stamp-statistics"
echo "Add file → Create new file"
echo "경로: .github/workflows/deploy.yml"
echo "=========================================="

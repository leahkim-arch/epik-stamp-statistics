import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const stampName = formData.get('stampName') as string;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (!stampName) {
      return NextResponse.json({ error: '스탬프 이름이 없습니다.' }, { status: 400 });
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 });
    }

    // 파일명 생성 (안전한 파일명)
    const safeFileName = stampName.replace(/[^a-zA-Z0-9._-]/g, '_') + '.png';
    
    // thumbnails 디렉토리 경로
    const thumbnailsDir = join(process.cwd(), 'public', 'thumbnails');
    
    // 디렉토리가 없으면 생성
    if (!existsSync(thumbnailsDir)) {
      await mkdir(thumbnailsDir, { recursive: true });
    }

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(thumbnailsDir, safeFileName);
    
    await writeFile(filePath, buffer);

    // 썸네일 URL 반환
    const thumbnailUrl = `/thumbnails/${safeFileName}`;

    return NextResponse.json({
      success: true,
      thumbnailUrl,
      message: '썸네일이 성공적으로 업로드되었습니다.',
    });
  } catch (error) {
    console.error('업로드 오류:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

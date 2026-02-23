const fs = require('fs');
const path = require('path');

const basePath = '/epik-stamp-statistics';
const outDir = path.join(__dirname, '..', 'out');
const basePathDir = path.join(outDir, basePath.replace(/^\//, ''));

// basePath 디렉토리 생성
if (!fs.existsSync(basePathDir)) {
  fs.mkdirSync(basePathDir, { recursive: true });
}

// JSON 파일들을 basePath 폴더로 복사
const jsonFiles = [
  'new-stamp-pack.json',
  'country-ranking.json',
  'weekly-data.json',
  'data.json'
];

console.log('📁 JSON 파일들을 basePath 폴더로 복사 중...');

jsonFiles.forEach(file => {
  const source = path.join(outDir, file);
  const dest = path.join(basePathDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`  ✅ ${file} 복사 완료`);
  } else {
    console.warn(`  ⚠️  ${file} 파일을 찾을 수 없습니다.`);
  }
});

// 썸네일 폴더를 basePath 폴더로 복사
const thumbnailsSource = path.join(outDir, 'thumbnails');
const thumbnailsDest = path.join(basePathDir, 'thumbnails');

if (fs.existsSync(thumbnailsSource)) {
  console.log('📁 썸네일 폴더를 basePath 폴더로 복사 중...');
  
  // 목적지 디렉토리 생성
  if (!fs.existsSync(thumbnailsDest)) {
    fs.mkdirSync(thumbnailsDest, { recursive: true });
  }
  
  // 썸네일 파일들 복사
  const files = fs.readdirSync(thumbnailsSource);
  let copiedCount = 0;
  
  files.forEach(file => {
    const sourceFile = path.join(thumbnailsSource, file);
    const destFile = path.join(thumbnailsDest, file);
    
    if (fs.statSync(sourceFile).isFile()) {
      fs.copyFileSync(sourceFile, destFile);
      copiedCount++;
    }
  });
  
  console.log(`  ✅ ${copiedCount}개의 썸네일 파일 복사 완료`);
} else {
  console.warn('  ⚠️  thumbnails 폴더를 찾을 수 없습니다.');
}

// new-stamp-assets 폴더도 복사 (Monthly statistics용)
const assetsSource = path.join(outDir, 'new-stamp-assets');
const assetsDest = path.join(basePathDir, 'new-stamp-assets');

if (fs.existsSync(assetsSource)) {
  console.log('📁 new-stamp-assets 폴더를 basePath 폴더로 복사 중...');
  
  // 목적지 디렉토리 생성
  if (!fs.existsSync(assetsDest)) {
    fs.mkdirSync(assetsDest, { recursive: true });
  }
  
  // 에셋 파일들 복사
  const files = fs.readdirSync(assetsSource);
  let copiedCount = 0;
  
  files.forEach(file => {
    const sourceFile = path.join(assetsSource, file);
    const destFile = path.join(assetsDest, file);
    
    if (fs.statSync(sourceFile).isFile()) {
      fs.copyFileSync(sourceFile, destFile);
      copiedCount++;
    }
  });
  
  console.log(`  ✅ ${copiedCount}개의 에셋 파일 복사 완료`);
}

console.log('✅ 모든 파일 복사 완료!');

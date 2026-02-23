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

console.log('✅ 모든 파일 복사 완료!');

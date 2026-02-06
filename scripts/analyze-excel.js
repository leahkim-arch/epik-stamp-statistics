const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = [
  '2026년1월전체지표.xlsx',
  '2026년1월국가별랭킹.xlsx',
  '2026년1월신규스탬프팩.xlsx',
  '2026년1월전체팩별사용량.xlsx'
];

console.log('Excel 파일 분석 시작...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`\n=== ${file} ===`);
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log(`시트 개수: ${sheetNames.length}`);
    console.log(`시트 이름: ${sheetNames.join(', ')}`);
    
    sheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`\n[${sheetName}]`);
      console.log(`행 수: ${data.length}`);
      if (data.length > 0) {
        console.log('첫 5행:');
        data.slice(0, 5).forEach((row, idx) => {
          console.log(`  ${idx + 1}:`, row);
        });
      }
    });
  } else {
    console.log(`파일을 찾을 수 없습니다: ${file}`);
  }
});

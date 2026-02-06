const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '2026년1월신규스탬프팩.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

console.log('파일 구조 분석\n' + '='.repeat(70));

// 주차 헤더 찾기
const weekHeaders = [];
data.forEach((row, i) => {
  const firstCell = row[0] ? row[0].toString().trim() : '';
  if (firstCell.includes('1월') && (firstCell.includes('주') || firstCell.includes('합산'))) {
    weekHeaders.push({ row: i, index: i+1, text: firstCell });
  }
});

console.log('\n주차/합산 헤더:');
weekHeaders.forEach(h => {
  console.log(`Row ${h.index}: "${h.text}"`);
  // 다음 5행 출력
  console.log('  다음 5행:');
  for (let j = 1; j <= 5; j++) {
    const nextRow = data[h.row + j];
    if (nextRow) {
      const rowStr = nextRow.slice(0, 10).map(cell => {
        if (cell === null || cell === undefined) return '';
        const str = cell.toString();
        return str.length > 15 ? str.substring(0, 15) + '...' : str;
      }).join(' | ');
      console.log(`    Row ${h.index + j}: ${rowStr}`);
    }
  }
  console.log('');
});

// BEST PACK 섹션 찾기
console.log('\nBEST PACK 섹션:');
let bestPackStart = -1;
data.forEach((row, i) => {
  const rowStr = row.join(' | ');
  if (rowStr.includes('BEST PACK') && rowStr.includes('Thumnail')) {
    bestPackStart = i;
    console.log(`Row ${i+1}: BEST PACK 헤더`);
    console.log(`  헤더: ${row.slice(0, 12).join(' | ')}`);
  }
});

// 개별 스탬프 에셋 섹션 찾기 (IMG, Title, Categories)
console.log('\n개별 스탬프 에셋 섹션:');
data.forEach((row, i) => {
  const rowStr = row.join(' | ');
  if (rowStr.includes('IMG') && rowStr.includes('Title') && rowStr.includes('Categories')) {
    console.log(`Row ${i+1}: 개별 에셋 헤더`);
    console.log(`  헤더: ${row.slice(0, 8).join(' | ')}`);
    // 다음 5개 샘플 출력
    console.log('  샘플 데이터 (5개):');
    for (let j = 1; j <= 5; j++) {
      const nextRow = data[i + j];
      if (nextRow && nextRow[0] && nextRow[0].toString().trim() !== '') {
        console.log(`    Row ${i+j+1}: ${nextRow.slice(0, 8).join(' | ')}`);
      }
    }
  }
});

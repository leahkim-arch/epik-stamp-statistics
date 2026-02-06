const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '2026년1월신규스탬프팩.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

console.log('신규 스탬프 팩 파일 구조 분석\n' + '='.repeat(70));

// 모든 행에서 "1월"과 "주"가 포함된 셀 찾기
const weekMarkers = [];
data.forEach((row, i) => {
  row.forEach((cell, j) => {
    if (cell) {
      const cellStr = cell.toString().trim();
      if ((cellStr.includes('1월') && cellStr.includes('주')) || cellStr.includes('합산')) {
        weekMarkers.push({ row: i, col: j, index: i+1, text: cellStr });
      }
    }
  });
});

console.log('\n주차/합산 마커:');
weekMarkers.forEach(m => {
  console.log(`Row ${m.index}, Col ${m.col}: "${m.text}"`);
  // 해당 행 전체 출력
  const row = data[m.row];
  console.log(`  전체 행: ${row.slice(0, 15).map(c => c ? c.toString().substring(0, 20) : '').join(' | ')}`);
  
  // 다음 3행도 확인
  if (m.row + 1 < data.length) {
    const nextRow = data[m.row + 1];
    console.log(`  다음 행: ${nextRow ? nextRow.slice(0, 15).map(c => c ? c.toString().substring(0, 20) : '').join(' | ') : ''}`);
  }
  console.log('');
});

// BEST PACK 데이터 샘플
console.log('\nBEST PACK 데이터 샘플 (Row 13-25):');
for (let i = 12; i < 25; i++) {
  const row = data[i];
  if (row && row[2]) {
    console.log(`Row ${i+1}: ${row.slice(0, 12).map(c => c ? c.toString().substring(0, 15) : '').join(' | ')}`);
  }
}

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '2026년1월신규스탬프팩.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('시트 이름:', workbook.SheetNames);
console.log('\n' + '='.repeat(70));

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n[시트: ${sheetName}]`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  
  console.log(`총 행 수: ${data.length}`);
  console.log('\n첫 80행 샘플:');
  
  data.slice(0, 80).forEach((row, i) => {
    const rowStr = row.slice(0, 20).map(cell => {
      if (cell === null || cell === undefined) return '';
      const str = cell.toString();
      return str.length > 20 ? str.substring(0, 20) + '...' : str;
    }).join(' | ');
    console.log(`Row ${i+1}: ${rowStr}`);
  });
});

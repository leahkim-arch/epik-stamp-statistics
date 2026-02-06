const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const COUNTRY_RANKING_FILE = '2026년1월국가별랭킹.xlsx';

console.log('='.repeat(70));
console.log('국가별 랭킹 데이터 처리 시작');
console.log('='.repeat(70));

const filePath = path.join(__dirname, '..', COUNTRY_RANKING_FILE);
if (!fs.existsSync(filePath)) {
  throw new Error(`${COUNTRY_RANKING_FILE} 파일을 찾을 수 없습니다!`);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

console.log(`\n시트명: ${sheetName}`);
console.log(`전체 행 수: ${data.length}`);

// 국가별 랭킹 데이터 구조
// - 행 3: "1주차"
// - 행 4: "KR Save" (국가명 + 지표명)
// - 행 5: 헤더 (No., CategoryID, CategoryName, Type, Position, Select, Save, Subscribe, Save%)
// - 행 6부터: 데이터

const countryRankingData = {
  weeks: []
};

let currentWeek = null;
let currentCountry = null;
let headerRow = null;

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const firstCell = row[0];
  
  // 주차 헤더 찾기 (예: "1주차")
  if (firstCell && typeof firstCell === 'string' && firstCell.includes('주차')) {
    const weekNum = firstCell.match(/(\d+)주차/)?.[1];
    if (weekNum) {
      currentWeek = {
        week: parseInt(weekNum),
        countries: []
      };
      countryRankingData.weeks.push(currentWeek);
      console.log(`\n${firstCell} 발견`);
    }
    continue;
  }
  
  // 국가 헤더 찾기 (예: "KR Save", "JP Save", "Non Asia Save")
  if (firstCell && typeof firstCell === 'string' && 
      (firstCell.includes('KR') || firstCell.includes('JP') || firstCell.includes('Non Asia') || 
       firstCell.includes('US') || firstCell.includes('CN')) && firstCell.includes('Save')) {
    if (currentWeek) {
      const countryMatch = firstCell.match(/([A-Za-z\s]+)\s+Save/);
      const countryName = countryMatch ? countryMatch[1].trim() : firstCell.replace(' Save', '');
      
      currentCountry = {
        country: countryName,
        headerRow: i + 1, // 다음 행이 헤더 (행 5)
        dataStartRow: i + 2, // 그 다음 행부터 데이터 (행 6)
        stamps: []
      };
      currentWeek.countries.push(currentCountry);
      headerRow = i + 1;
      console.log(`  ${countryName} 섹션 발견 (국가 헤더 행: ${i}, 헤더 행: ${i + 1}, 데이터 시작: ${i + 2})`);
    }
    continue;
  }
  
  // 헤더 행 처리 (건너뛰기) - "No."가 포함된 행
  if (headerRow !== null && i === headerRow) {
    continue;
  }
  
  // 데이터 행 처리
  if (currentCountry && i >= currentCountry.dataStartRow) {
    // 다음 국가 섹션이나 주차 섹션이 시작되면 중단
    if (row[0] && typeof row[0] === 'string' && 
        (row[0].includes('주차') || 
         ((row[0].includes('KR') || row[0].includes('JP') || row[0].includes('Non Asia') || 
          row[0].includes('US') || row[0].includes('CN')) && (row[0].includes('Save') || row[0].includes('Subs'))))) {
      currentCountry = null;
      headerRow = null;
      continue;
    }
    
    // 빈 행이면 스킵 (CategoryName이 없으면)
    // 실제 데이터 구조: [0]=No., [1]=No.(중복?), [2]=CategoryID, [3]=CategoryName, [4]=Type, [5]=Position, [6]=Select, [7]=Save, [8]=Subscribe, [9]=Save%
    const categoryName = row[3] || null;
    if (!categoryName) continue;
    
    // 숫자로 시작하는 행만 처리 (No. 컬럼이 숫자)
    if (row[0] && typeof row[0] !== 'number' && isNaN(parseInt(row[0]))) {
      continue;
    }
    
    // 데이터 추출
    const select = row[6] != null ? parseFloat(row[6]) || 0 : 0;
    const save = row[7] != null ? parseFloat(row[7]) || 0 : 0;
    const subscribe = row[8] != null ? parseFloat(row[8]) || 0 : 0;
    const savePercent = row[9] != null ? parseFloat(row[9]) || 0 : 0;
    
    // Select가 0이면 제외
    if (select === 0) continue;
    
    currentCountry.stamps.push({
      categoryId: row[2] ? row[2].toString().trim() : '',
      categoryName: categoryName.toString().trim(),
      type: row[4] ? row[4].toString().trim() : '',
      position: row[5] ? row[5].toString().trim() : '',
      select,
      save,
      subscribe,
      savePercent: Math.round(savePercent * 100) / 100,
      rank: currentCountry.stamps.length + 1
    });
  }
}

// 통계 출력
console.log('\n' + '='.repeat(70));
console.log('처리 결과');
console.log('='.repeat(70));

countryRankingData.weeks.forEach(week => {
  console.log(`\n${week.week}주차:`);
  week.countries.forEach(country => {
    console.log(`  ${country.country}: ${country.stamps.length}개 스탬프`);
  });
});

// JSON 파일로 저장
const outputPath = path.join(__dirname, '..', 'public', 'country-ranking.json');
fs.writeFileSync(outputPath, JSON.stringify(countryRankingData, null, 2), 'utf-8');
console.log(`\n✓ 국가별 랭킹 데이터 저장 완료: ${outputPath}`);

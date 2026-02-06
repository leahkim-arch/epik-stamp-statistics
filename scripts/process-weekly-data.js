const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const MAIN_DATA_FILE = '2026년1월전체팩별사용량.xlsx';
const NEW_STAMP_FILE = '2026년1월신규스탬프팩.xlsx';
const MASTER_LIST_FILE = '전체스탬프리스트.xlsx';

console.log('='.repeat(70));
console.log('주차별 데이터 처리 시작');
console.log('='.repeat(70));

// 마스터 리스트 맵
const masterListMap = new Map();
const masterListOrder = new Map();

// 신규 스탬프 목록
const newStampSet = new Set();

// 정규화 함수
function normalizeKey(categoryId, categoryName) {
  if (categoryName) {
    return categoryName.toString().trim().toLowerCase();
  }
  if (categoryId) {
    return categoryId.toString().trim().toLowerCase();
  }
  return null;
}

// 썸네일 URL 생성
function generateThumbnailUrl(categoryName) {
  if (!categoryName || categoryName.trim() === '') return null;
  const cleanName = categoryName.toString().trim();
  return `/thumbnails/${cleanName}.png`;
}

// 마스터 리스트 추출
function extractMasterList() {
  const filePath = path.join(__dirname, '..', MASTER_LIST_FILE);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${MASTER_LIST_FILE} 파일을 찾을 수 없습니다.`);
    return;
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  let headerRow = -1;
  let headers = [];

  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i];
    if (row && row.some(cell => cell && cell.toString().includes('CategoryName'))) {
      headerRow = i;
      headers = row;
      break;
    }
  }

  if (headerRow === -1) return;

  const categoryNameIdx = headers.findIndex(h => h && h.toString().includes('CategoryName'));

  let count = 0;
  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const categoryName = row[categoryNameIdx] || null;
    if (!categoryName) continue;

    const key = normalizeKey(null, categoryName);
    masterListMap.set(key, {
      categoryName: categoryName.toString().trim(),
      thumbnail: generateThumbnailUrl(categoryName)
    });
    masterListOrder.set(key, count);
    count++;
  }
}

// 신규 스탬프 추출
function extractNewStamps() {
  const filePath = path.join(__dirname, '..', NEW_STAMP_FILE);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const workbook = XLSX.readFile(filePath);
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    let headerRow = -1;
    let headers = [];

    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i];
      if (row && row.some(cell => cell && (cell.toString().includes('CategoryName') || cell.toString().includes('CategoryID')))) {
        headerRow = i;
        headers = row;
        break;
      }
    }

    if (headerRow === -1) return;

    const categoryNameIdx = headers.findIndex(h => h && h.toString().includes('CategoryName'));

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const categoryName = row[categoryNameIdx] || null;
      if (categoryName) {
        const key = normalizeKey(null, categoryName);
        newStampSet.add(key);
      }
    }
  });
}

// 주차별 데이터 추출
const filePath = path.join(__dirname, '..', MAIN_DATA_FILE);
if (!fs.existsSync(filePath)) {
  throw new Error(`${MAIN_DATA_FILE} 파일을 찾을 수 없습니다!`);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

const weekHeaders = data[0] || [];
const weekPositions = [];

weekHeaders.forEach((h, i) => {
  if (h && h.toString().includes('주차')) {
    weekPositions.push({ index: i, name: h });
  }
});

console.log(`\n발견된 주차: ${weekPositions.length}개`);
weekPositions.forEach(w => console.log(`  - ${w.name} (인덱스 ${w.index})`));

extractMasterList();
extractNewStamps();

const weeklyData = {
  weeks: []
};

weekPositions.forEach((week, weekIdx) => {
  const startIdx = week.index;
  const indices = {
    categoryName: startIdx + 1,
    type: startIdx + 2,
    position: startIdx + 3,
    select: startIdx + 4,
    save: startIdx + 5,
    subscribe: startIdx + 6,
    savePercent: startIdx + 7
  };

  const weekStamps = [];
  const stampMap = new Map();

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const categoryName = row[indices.categoryName] || null;
    if (!categoryName) continue;

    const select = row[indices.select] != null ? parseFloat(row[indices.select]) || 0 : 0;
    const save = row[indices.save] != null ? parseFloat(row[indices.save]) || 0 : 0;
    const subscribe = row[indices.subscribe] != null ? parseFloat(row[indices.subscribe]) || 0 : 0;
    const type = row[indices.type] || '';
    const position = row[indices.position] || '';

    if (select === 0) continue;

    // 개별 스탬프 필터링
    const nameStr = categoryName.toString().trim();
    const nameWithoutDate = nameStr.replace(/^\d{6}_/, '');
    const individualPattern = /[a-zA-Z]+\d+_pro$/i;
    if (individualPattern.test(nameWithoutDate)) {
      continue;
    }

    if (select > 0 && subscribe >= select) continue;
    if (select > 0 && subscribe > select * 0.3) continue;

    const nameKey = normalizeKey(null, categoryName);
    if (!stampMap.has(nameKey)) {
      const savePercent = (save / select) * 100;
      const isNew = newStampSet.has(nameKey);
      const thumbnailUrl = generateThumbnailUrl(categoryName);

      stampMap.set(nameKey, {
        categoryId: '',
        categoryName: categoryName.toString().trim(),
        type,
        position,
        select,
        save,
        subscribe,
        savePercent: Math.round(savePercent * 100) / 100,
        thumbnail: thumbnailUrl,
        isNew,
        source: '전체팩별사용량',
        priority: 1
      });
    }
  }

  const stamps = Array.from(stampMap.values())
    .sort((a, b) => b.subscribe - a.subscribe);

  const totals = {
    select: stamps.reduce((sum, s) => sum + s.select, 0),
    save: stamps.reduce((sum, s) => sum + s.save, 0),
    subscribe: stamps.reduce((sum, s) => sum + s.subscribe, 0)
  };

  weeklyData.weeks.push({
    week: weekIdx + 1,
    weekName: week.name,
    totals,
    stamps
  });

  console.log(`\n${week.name}:`);
  console.log(`  스탬프 수: ${stamps.length}개`);
  console.log(`  Select: ${totals.select.toLocaleString()}, Save: ${totals.save.toLocaleString()}, Subscribe: ${totals.subscribe.toLocaleString()}`);
});

const outputPath = path.join(__dirname, '..', 'public', 'weekly-data.json');
fs.writeFileSync(outputPath, JSON.stringify(weeklyData, null, 2), 'utf-8');
console.log(`\n✓ 주차별 데이터 저장 완료: ${outputPath}`);

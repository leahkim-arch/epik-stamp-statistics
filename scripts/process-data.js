const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 전체팩별사용량 파일을 메인 데이터 소스로 사용
const MAIN_DATA_FILE = '2026년1월전체팩별사용량.xlsx';
// 보완 파일은 사용하지 않음
const SUPPLEMENT_FILES = [
  // { name: '2026년1월전체지표.xlsx', source: '전체지표', priority: 2 },
  // { name: '2026년1월국가별랭킹.xlsx', source: '국가별랭킹', priority: 3 }
];
const NEW_STAMP_FILE = '2026년1월신규스탬프팩.xlsx';
const MASTER_LIST_FILE = '전체스탬프리스트.xlsx';

// 스탬프 데이터 맵 (정규화된 키 사용)
const stampMap = new Map();
// 마스터 리스트 맵 (CategoryName -> 썸네일 정보)
const masterListMap = new Map();
// 마스터 리스트 순서 (CategoryName -> 순서 인덱스)
const masterListOrder = new Map();
// 신규 스탬프 목록 (NEW 태그용)
const newStampSet = new Set();

// 통계 추적
const stats = {
  mainFile: { processed: 0, skipped: 0 },
  supplementFiles: {},
  masterList: { total: 0, matched: 0 },
  final: { total: 0, fromMain: 0, fromSupplement: 0, missingInMaster: [] }
};

console.log('='.repeat(70));
console.log('데이터 처리 시작 (마스터 리스트 조인 모드)');
console.log('='.repeat(70));

// 키 정규화 함수 (공백 제거, 소문자 변환)
function normalizeKey(categoryId, categoryName) {
  const key = (categoryId || categoryName || '').toString().trim().toLowerCase();
  return key;
}

// 0. 마스터 리스트에서 스탬프 메타데이터 추출
function extractMasterList() {
  const filePath = path.join(__dirname, '..', MASTER_LIST_FILE);
  if (!fs.existsSync(filePath)) {
    console.log(`\n⚠️  ${MASTER_LIST_FILE} 파일을 찾을 수 없습니다. 썸네일 정보를 건너뜁니다.`);
    return;
  }

  console.log(`\n[0단계] 마스터 리스트 추출: ${MASTER_LIST_FILE}`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  
  console.log(`   시트명: ${sheetName}`);
  console.log(`   전체 행 수: ${data.length}`);
  
  // 헤더 행 찾기
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
  
  if (headerRow === -1) {
    console.log('   ⚠️  헤더를 찾을 수 없습니다.');
    return;
  }
  
  const categoryNameIdx = headers.findIndex(h => h && h.toString().includes('CategoryName'));
  const thumbnailIdx = headers.findIndex(h => h && (h.toString().includes('Thumbnail') || h.toString().includes('thumbnail')));
  
  console.log(`   CategoryName 컬럼: 인덱스 ${categoryNameIdx}`);
  console.log(`   Thumbnail 컬럼: 인덱스 ${thumbnailIdx}`);
  
  let count = 0;
  
  // 데이터 행 처리
  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const categoryName = row[categoryNameIdx] || null;
    const thumbnail = thumbnailIdx >= 0 ? row[thumbnailIdx] || null : null;
    
    if (!categoryName) continue;
    
    const key = normalizeKey(null, categoryName);
    
    // 썸네일 URL 생성 - 항상 플레이스홀더 사용
    const thumbnailUrl = 'https://via.placeholder.com/280x280.png?text=Loading';
    
    masterListMap.set(key, {
      categoryName: categoryName.toString().trim(),
      thumbnail: thumbnailUrl
    });
    
    // 마스터 리스트 순서 저장 (나중에 정렬에 사용)
    masterListOrder.set(key, count);
    
    count++;
  }
  
  stats.masterList.total = count;
  console.log(`   ✓ 마스터 리스트에서 ${count}개 스탬프 추출 완료`);
}

// 썸네일 URL 생성 함수 (CategoryName 기반)
function generateThumbnailUrl(categoryName) {
  if (!categoryName || categoryName.trim() === '') return null;
  
  // 로컬 썸네일 이미지 경로 생성
  // Next.js에서 public 폴더는 루트 경로(/)로 접근 가능
  const cleanName = categoryName.toString().trim();
  return `/thumbnails/${cleanName}.png`;
}

// 1. 신규 스탬프 파일에서 NEW 태그용 목록 추출
function extractNewStamps() {
  const filePath = path.join(__dirname, '..', NEW_STAMP_FILE);
  if (!fs.existsSync(filePath)) {
    console.log(`\n⚠️  ${NEW_STAMP_FILE} 파일을 찾을 수 없습니다. NEW 태그 기능을 건너뜁니다.`);
    return;
  }

  console.log(`\n[1단계] 신규 스탬프 목록 추출: ${NEW_STAMP_FILE}`);
  const workbook = XLSX.readFile(filePath);
  let count = 0;
  
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
    const categoryIdIdx = headers.findIndex(h => h && h.toString().includes('CategoryID'));
    
    const dataSetStarts = [];
    headers.forEach((h, idx) => {
      if (h && h.toString().includes('CategoryName')) {
        dataSetStarts.push(idx);
      }
    });
    
    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      dataSetStarts.forEach(startIdx => {
        if (row.length <= startIdx) return;
        
        const categoryId = categoryIdIdx >= 0 && categoryIdIdx >= startIdx ? row[categoryIdIdx] : null;
        const categoryName = categoryNameIdx >= 0 && categoryNameIdx >= startIdx ? row[categoryNameIdx] : null;
        
        const key = normalizeKey(categoryId, categoryName);
        if (key && !newStampSet.has(key)) {
          newStampSet.add(key);
          count++;
        }
      });
    }
  });
  
  console.log(`   ✓ 신규 스탬프 ${count}개 추출 완료`);
}

// 2. 전체팩별사용량 파일에서 메인 데이터 추출 (모든 주차 합산)
function extractMainData() {
  const filePath = path.join(__dirname, '..', MAIN_DATA_FILE);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${MAIN_DATA_FILE} 파일을 찾을 수 없습니다!`);
  }

  console.log(`\n[2단계] 메인 데이터 추출: ${MAIN_DATA_FILE}`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  
  console.log(`   시트명: ${sheetName}`);
  console.log(`   전체 행 수: ${data.length}`);
  
  // 행 0: 주차 헤더 (1월 1주차, 1월 2주차 등)
  // 행 1: 컬럼 헤더 (Thumbnail, CategoryName, Type, Position, Select, Save, Subscribe, Save%)
  // 행 2부터: 데이터
  
  const weekHeaders = data[0] || [];
  const columnHeaders = data[1] || [];
  
  // 주차 위치 찾기
  const weekPositions = [];
  weekHeaders.forEach((h, i) => {
    if (h && h.toString().includes('주차')) {
      weekPositions.push({ index: i, name: h });
    }
  });
  
  console.log(`   발견된 주차: ${weekPositions.length}개`);
  weekPositions.forEach(w => console.log(`     - ${w.name} (인덱스 ${w.index})`));
  
  // 각 주차의 컬럼 인덱스 정의
  const weekDataSets = weekPositions.map((week, idx) => {
    const startIdx = week.index;
    return {
      weekName: week.name,
      indices: {
        thumbnail: startIdx + 0,
        categoryName: startIdx + 1,
        type: startIdx + 2,
        position: startIdx + 3,
        select: startIdx + 4,
        save: startIdx + 5,
        subscribe: startIdx + 6,
        savePercent: startIdx + 7
      }
    };
  });
  
  let processedCount = 0;
  let skippedCount = 0;
  
  // 스탬프별 데이터 누적 맵 (모든 주차 합산)
  const stampDataMap = new Map(); // nameKey -> { select, save, subscribe, type, position }
  
  // 데이터 행 처리 (인덱스 2부터)
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    // 모든 주차의 데이터 처리 및 합산
    weekDataSets.forEach((weekDataSet) => {
      const indices = weekDataSet.indices;
      const categoryName = row[indices.categoryName] || null;
      
      if (!categoryName) return;
      
      const select = row[indices.select] != null ? parseFloat(row[indices.select]) || 0 : 0;
      const save = row[indices.save] != null ? parseFloat(row[indices.save]) || 0 : 0;
      const subscribe = row[indices.subscribe] != null ? parseFloat(row[indices.subscribe]) || 0 : 0;
      const type = row[indices.type] || '';
      const position = row[indices.position] || '';
      
      // 데이터 검증 1: Select가 0이면 제외
      if (select === 0) {
        skippedCount++;
        return;
      }
      
      // 데이터 검증 2: 개별 스탬프 필터링
      const nameStr = categoryName.toString().trim();
      const nameWithoutDate = nameStr.replace(/^\d{6}_/, '');
      const individualPattern = /[a-zA-Z]+\d+_pro$/i;
      if (individualPattern.test(nameWithoutDate)) {
        skippedCount++;
        return;
      }
      
      // 데이터 검증 3: Subscribe가 Select보다 크거나 같으면 제외
      if (select > 0 && subscribe >= select) {
        skippedCount++;
        return;
      }
      
      // 데이터 검증 4: Subscribe가 비정상적으로 높은 경우 필터링
      if (select > 0 && subscribe > select * 0.3) {
        skippedCount++;
        return;
      }
      
      // 스탬프 데이터 누적 (모든 주차 합산)
      const nameKey = normalizeKey(null, categoryName);
      if (!stampDataMap.has(nameKey)) {
        stampDataMap.set(nameKey, {
          categoryName: categoryName.toString().trim(),
          type: type,
          position: position,
          select: 0,
          save: 0,
          subscribe: 0
        });
      }
      
      const stampData = stampDataMap.get(nameKey);
      stampData.select += select;
      stampData.save += save;
      stampData.subscribe += subscribe;
      
      // Type과 Position은 첫 번째 발견된 값 사용 (보통 동일함)
      if (!stampData.type && type) stampData.type = type;
      if (!stampData.position && position) stampData.position = position;
    });
  }
  
  // 누적된 데이터를 stampMap에 저장
  stampDataMap.forEach((stampData, nameKey) => {
    const savePercent = (stampData.save / stampData.select) * 100;
    const isNew = newStampSet.has(nameKey);
    
    // 마스터 리스트에서 썸네일 정보 가져오기
    const thumbnailUrl = generateThumbnailUrl(stampData.categoryName);
    
    stampMap.set(nameKey, {
      categoryId: '',
      categoryName: stampData.categoryName,
      type: stampData.type,
      position: stampData.position,
      select: stampData.select,
      save: stampData.save,
      subscribe: stampData.subscribe,
      savePercent: Math.round(savePercent * 100) / 100,
      thumbnail: thumbnailUrl,
      isNew,
      source: '전체팩별사용량',
      priority: 1
    });
    
    processedCount++;
  });
  
  stats.mainFile.processed = processedCount;
  stats.mainFile.skipped = skippedCount;
  
  console.log(`\n   처리 결과:`);
  console.log(`   ✓ 처리된 스탬프: ${processedCount}개`);
  console.log(`   ⚠️  제외된 스탬프: ${skippedCount}개`);
  console.log(`   ✓ 최종 유니크 스탬프: ${stampMap.size}개`);
  
  return processedCount;
}

// 3. 보완 파일에서 데이터 추출 (전체지표에 없는 것만 추가)
function extractSupplementData() {
  console.log(`\n[3단계] 보완 데이터 추출 (Outer Join)`);
  
  SUPPLEMENT_FILES.forEach(file => {
    const filePath = path.join(__dirname, '..', file.name);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  ${file.name} 파일을 찾을 수 없습니다.`);
      return;
    }
    
    console.log(`\n   처리 중: ${file.name} (${file.source})`);
    const workbook = XLSX.readFile(filePath);
    
    let fileProcessed = 0;
    let fileAdded = 0;
    let fileSkipped = 0;
    
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
      
      const dataSetStarts = [];
      headers.forEach((h, idx) => {
        if (h && h.toString().includes('CategoryName')) {
          dataSetStarts.push(idx);
        }
      });
      
      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        dataSetStarts.forEach(startIdx => {
          if (row.length <= startIdx) return;
          
          const setHeaders = headers.slice(startIdx);
          const categoryIdIdx = setHeaders.findIndex(h => h && h.toString().includes('CategoryID'));
          const categoryNameIdx = setHeaders.findIndex(h => h && h.toString().includes('CategoryName'));
          const typeIdx = setHeaders.findIndex(h => h && h.toString().includes('Type'));
          const positionIdx = setHeaders.findIndex(h => h && h.toString().includes('Position'));
          const selectIdx = setHeaders.findIndex(h => h && h.toString().includes('Select') && !h.toString().includes('%'));
          const saveIdx = setHeaders.findIndex(h => h && h.toString().includes('Save') && !h.toString().includes('%'));
          const subscribeIdx = setHeaders.findIndex(h => h && h.toString().includes('Subscribe'));
          
          const absCategoryIdIdx = categoryIdIdx >= 0 ? startIdx + categoryIdIdx : -1;
          const absCategoryNameIdx = categoryNameIdx >= 0 ? startIdx + categoryNameIdx : -1;
          const absTypeIdx = typeIdx >= 0 ? startIdx + typeIdx : -1;
          const absPositionIdx = positionIdx >= 0 ? startIdx + positionIdx : -1;
          const absSelectIdx = selectIdx >= 0 ? startIdx + selectIdx : -1;
          const absSaveIdx = saveIdx >= 0 ? startIdx + saveIdx : -1;
          const absSubscribeIdx = subscribeIdx >= 0 ? startIdx + subscribeIdx : -1;
          
          const categoryId = absCategoryIdIdx >= 0 ? row[absCategoryIdIdx] || null : null;
          const categoryName = absCategoryNameIdx >= 0 ? row[absCategoryNameIdx] || null : null;
          
          if (!categoryName && !categoryId) return;
          
          const nameKey = normalizeKey(null, categoryName);
          fileProcessed++;
          
          // 이미 전체지표에 있으면 스킵 (전체지표가 우선)
          // CategoryName 기준으로만 체크 (같은 스탬프 중복 방지)
          const existingStamps = Array.from(stampMap.values()).filter(s => normalizeKey(null, s.categoryName) === nameKey);
          if (existingStamps.length > 0) {
            // 전체지표에 이미 있으면 스킵
            return;
          }
          
          const select = absSelectIdx >= 0 && row[absSelectIdx] != null ? parseFloat(row[absSelectIdx]) || 0 : 0;
          const save = absSaveIdx >= 0 && row[absSaveIdx] != null ? parseFloat(row[absSaveIdx]) || 0 : 0;
          const subscribe = absSubscribeIdx >= 0 && row[absSubscribeIdx] != null ? parseFloat(row[absSubscribeIdx]) || 0 : 0;
          
          // Select가 0이면 제외
          if (select === 0) {
            fileSkipped++;
            return;
          }
          
          const type = absTypeIdx >= 0 ? row[absTypeIdx] || '' : '';
          const position = absPositionIdx >= 0 ? row[absPositionIdx] || '' : '';
          // CategoryName이 없으면 스킵 (필수 조건)
          if (!categoryName || categoryName.toString().trim() === '') {
            return;
          }
          
          const savePercent = (save / select) * 100;
          const isNew = newStampSet.has(nameKey);
          
          // 마스터 리스트에서 썸네일 정보 가져오기 (CategoryName만 사용)
          const masterKey = normalizeKey(null, categoryName);
          const masterInfo = masterListMap.get(masterKey);
          
          // 썸네일 URL 생성 - 로컬 썸네일 이미지 경로 사용
          const thumbnailUrl = generateThumbnailUrl(categoryName);
          
          stampMap.set(nameKey, {
            categoryId: categoryId || '',
            categoryName: categoryName.toString().trim(),
            type,
            position,
            select,
            save,
            subscribe,
            savePercent: Math.round(savePercent * 100) / 100,
            thumbnail: thumbnailUrl,
            isNew,
            source: file.source,
            priority: file.priority
          });
          
          fileAdded++;
        });
      }
    });
    
    stats.supplementFiles[file.source] = {
      processed: fileProcessed,
      added: fileAdded,
      skipped: fileSkipped
    };
    
    console.log(`   ✓ 처리된 스탬프: ${fileProcessed}개`);
    console.log(`   ✓ 새로 추가된 스탬프: ${fileAdded}개`);
    console.log(`   ⚠️  Select=0으로 제외: ${fileSkipped}개`);
  });
}

// 실행
extractMasterList();
extractNewStamps();
extractMainData();
extractSupplementData();

// 배열로 변환 및 중복 제거 (CategoryName 기준)
const stampsArray = Array.from(stampMap.values());
const uniqueStampsMap = new Map();

  // CategoryName을 기준으로 중복 제거 (전체지표 우선, Select 값이 큰 것 선택)
  stampsArray.forEach(stamp => {
    const nameKey = normalizeKey(null, stamp.categoryName);
    const existing = uniqueStampsMap.get(nameKey);
    
    if (!existing) {
      // 없으면 추가
      uniqueStampsMap.set(nameKey, stamp);
    } else {
      // 있으면 전체팩별사용량 우선, 그 다음 Select 값이 큰 것 선택
      if (stamp.source === '전체팩별사용량' && existing.source !== '전체팩별사용량') {
        // 전체팩별사용량이 우선
        uniqueStampsMap.set(nameKey, stamp);
      } else if (stamp.source === '전체팩별사용량' && existing.source === '전체팩별사용량') {
        // 둘 다 전체팩별사용량이면 Select 값이 큰 것 선택 (더 정확한 데이터)
        if (stamp.select > existing.select) {
          uniqueStampsMap.set(nameKey, stamp);
        }
      } else if (stamp.source !== '전체팩별사용량' && existing.source === '전체팩별사용량') {
        // 전체팩별사용량이 이미 있으면 보완 파일 데이터는 무시
        return;
      } else if (stamp.select > existing.select && existing.source !== '전체팩별사용량') {
        // 둘 다 전체팩별사용량이 아니면 Select 값이 큰 것 선택
        uniqueStampsMap.set(nameKey, stamp);
      }
    }
  });

// 구독자수(Subscribe) 기준 내림차순 정렬
const stamps = Array.from(uniqueStampsMap.values())
  .sort((a, b) => b.subscribe - a.subscribe);

// 통계 계산
stats.final.total = stamps.length;
stats.final.fromMain = stamps.filter(s => s.source === '전체팩별사용량').length;
stats.final.fromSupplement = stamps.filter(s => s.source !== '전체지표').length;

// 마스터 리스트에 없는 스탬프 찾기
stamps.forEach(stamp => {
  const masterKey = normalizeKey(null, stamp.categoryName);
  if (!masterListMap.has(masterKey)) {
    stats.final.missingInMaster.push(stamp.categoryName);
  } else {
    stats.masterList.matched++;
  }
});

// 전체 합계 계산
const totals = {
  select: stamps.reduce((sum, s) => sum + s.select, 0),
  save: stamps.reduce((sum, s) => sum + s.save, 0),
  subscribe: stamps.reduce((sum, s) => sum + s.subscribe, 0)
};

console.log(`\n${'='.repeat(70)}`);
console.log('최종 통계');
console.log('='.repeat(70));
console.log(`\n[파일별 처리 결과]`);
console.log(`마스터 리스트:`);
console.log(`  - 총 스탬프: ${stats.masterList.total}개`);
console.log(`  - 매칭된 스탬프: ${stats.masterList.matched}개`);

console.log(`\n전체지표:`);
console.log(`  - 처리된 스탬프: ${stats.mainFile.processed}개`);
console.log(`  - 제외된 스탬프 (Select=0): ${stats.mainFile.skipped}개`);

Object.keys(stats.supplementFiles).forEach(source => {
  const fileStats = stats.supplementFiles[source];
  console.log(`\n${source}:`);
  console.log(`  - 처리된 스탬프: ${fileStats.processed}개`);
  console.log(`  - 새로 추가된 스탬프: ${fileStats.added}개`);
  console.log(`  - 제외된 스탬프 (Select=0): ${fileStats.skipped}개`);
});

console.log(`\n[최종 결과]`);
console.log(`총 스탬프 수: ${stats.final.total}개`);
console.log(`  - 전체지표에서: ${stats.final.fromMain}개`);
console.log(`  - 보완 파일에서: ${stats.final.fromSupplement}개`);
console.log(`전체 Select: ${totals.select.toLocaleString()}`);
console.log(`전체 Save: ${totals.save.toLocaleString()}`);
console.log(`전체 Subscribe: ${totals.subscribe.toLocaleString()}`);
console.log(`평균 Save%: ${totals.select > 0 ? ((totals.save / totals.select) * 100).toFixed(2) : 0}%`);
console.log(`NEW 태그 스탬프: ${stamps.filter(s => s.isNew).length}개`);

if (stats.final.missingInMaster.length > 0) {
  console.log(`\n⚠️  성과 데이터에는 있지만 마스터 리스트에 없는 스탬프 ${stats.final.missingInMaster.length}개:`);
  stats.final.missingInMaster.slice(0, 10).forEach(name => {
    console.log(`  - ${name}`);
  });
  if (stats.final.missingInMaster.length > 10) {
    console.log(`  ... 외 ${stats.final.missingInMaster.length - 10}개`);
  }
} else {
  console.log(`\n✓ 모든 성과 데이터 스탬프가 마스터 리스트에 있습니다.`);
}

// 260105_winterangeldoodle_pro 확인
const targetStamp = stamps.find(s => s.categoryName && s.categoryName.includes('260105_winterangeldoodle_pro'));
if (targetStamp) {
  console.log(`\n[검증] 260105_winterangeldoodle_pro:`);
  console.log(`  Subscribe: ${targetStamp.subscribe.toLocaleString()}명`);
  console.log(`  Select: ${targetStamp.select.toLocaleString()}`);
  console.log(`  Save: ${targetStamp.save.toLocaleString()}`);
  console.log(`  Save%: ${targetStamp.savePercent.toFixed(2)}%`);
  console.log(`  썸네일: ${targetStamp.thumbnail}`);
  console.log(`  소스: ${targetStamp.source}`);
} else {
  console.log(`\n⚠️  260105_winterangeldoodle_pro를 찾을 수 없습니다.`);
}

console.log(`\n상위 10개 스탬프 (구독자수 기준):`);
stamps.slice(0, 10).forEach((stamp, idx) => {
  console.log(`${idx + 1}. ${stamp.categoryName}${stamp.isNew ? ' [NEW]' : ''} (${stamp.source})`);
  console.log(`   Subscribe: ${stamp.subscribe.toLocaleString()}, Select: ${stamp.select.toLocaleString()}, Save: ${stamp.save.toLocaleString()}, Save%: ${stamp.savePercent.toFixed(2)}%`);
  console.log(`   썸네일: ${stamp.thumbnail}`);
});

// JSON 파일로 저장
const output = {
  totals,
  stamps,
  generatedAt: new Date().toISOString(),
  source: MAIN_DATA_FILE,
  masterListFile: MASTER_LIST_FILE,
  stats: {
    mainFile: stats.mainFile,
    supplementFiles: stats.supplementFiles,
    masterList: stats.masterList,
    final: stats.final
  }
};

fs.writeFileSync(
  path.join(__dirname, '..', 'public', 'data.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log(`\n✓ 데이터 파일 저장 완료: public/data.json`);

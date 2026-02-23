const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const NEW_STAMP_FILE = '2026년1월신규스탬프팩.xlsx';

console.log('='.repeat(70));
console.log('신규 스탬프 팩 데이터 처리 시작');
console.log('='.repeat(70));

const filePath = path.join(__dirname, '..', NEW_STAMP_FILE);
if (!fs.existsSync(filePath)) {
  throw new Error(`${NEW_STAMP_FILE} 파일을 찾을 수 없습니다!`);
}

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

// 썸네일 URL 생성
function generateThumbnailUrl(categoryName) {
  if (!categoryName || categoryName.trim() === '') return null;
  const cleanName = categoryName.toString().trim();
  return `/thumbnails/${cleanName}.png`;
}

const result = {
  bestPack: {
    packs: []
  },
  weeks: []
};

// 1. BEST PACK (1월 합산) 데이터 추출
console.log('\n[1단계] BEST PACK (1월 합산) 데이터 추출');
const bestPackHeaderRow = 11; // Row 12 (0-indexed)
const bestPackHeaders = data[bestPackHeaderRow] || [];

// 헤더 인덱스 찾기
const bestPackIndices = {
  no: bestPackHeaders.findIndex(h => h && h.toString().includes('No.')),
  thumbnail: bestPackHeaders.findIndex(h => h && h.toString().includes('Thumnail')),
  name: bestPackHeaders.findIndex(h => h && h.toString().includes('Name')),
  assetCount: bestPackHeaders.findIndex(h => h && h.toString().includes('Asset Count')),
  releaseWeek: bestPackHeaders.findIndex(h => h && h.toString().includes('Release Week')),
  nonSubsSelect: bestPackHeaders.findIndex(h => h && h.toString().includes('NonSubs Select')),
  nonSubsSubsView: bestPackHeaders.findIndex(h => h && h.toString().includes('NonSubs SubsView')),
  nonSubsSubsSuccess: bestPackHeaders.findIndex(h => h && h.toString().includes('NonSubs SubsSuccess')),
  subsSelect: bestPackHeaders.findIndex(h => h && h.toString().includes('Subs select')),
  subsSave: bestPackHeaders.findIndex(h => h && h.toString().includes('Subs save'))
};

let currentPack = null;
for (let i = bestPackHeaderRow + 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;

  const no = row[bestPackIndices.no];
  const name = row[bestPackIndices.name];
  const releaseWeek = row[bestPackIndices.releaseWeek];
  const period = row[bestPackIndices.releaseWeek + 1]; // "출시주" 또는 "1주경과"

  // 새로운 팩 시작 (No.가 있고 Name이 있는 경우)
  if (no && name && releaseWeek) {
    if (currentPack) {
      result.bestPack.packs.push(currentPack);
    }
    currentPack = {
      no: parseInt(no) || 0,
      name: name.toString().trim(),
      thumbnail: generateThumbnailUrl(name),
      assetCount: row[bestPackIndices.assetCount] ? parseInt(row[bestPackIndices.assetCount]) : 0,
      releaseWeek: releaseWeek.toString().trim(),
      periods: []
    };
  }

  // 기간별 데이터 추가
  if (currentPack && period && (period.toString().includes('출시주') || period.toString().includes('1주경과'))) {
    currentPack.periods.push({
      period: period.toString().trim(),
      nonSubsSelect: row[bestPackIndices.nonSubsSelect] ? parseInt(row[bestPackIndices.nonSubsSelect]) : 0,
      nonSubsSubsView: row[bestPackIndices.nonSubsSubsView] ? parseInt(row[bestPackIndices.nonSubsSubsView]) : 0,
      nonSubsSubsSuccess: row[bestPackIndices.nonSubsSubsSuccess] ? parseInt(row[bestPackIndices.nonSubsSubsSuccess]) : 0,
      subsSelect: row[bestPackIndices.subsSelect] ? parseInt(row[bestPackIndices.subsSelect]) : 0,
      subsSave: row[bestPackIndices.subsSave] ? parseInt(row[bestPackIndices.subsSave]) : 0
    });
  }

  // 주차 섹션 시작 전까지 (Row 59 이전)
  if (row[1] && row[1].toString().includes('2026년 1월') && row[1].toString().includes('주')) {
    if (currentPack) {
      result.bestPack.packs.push(currentPack);
      currentPack = null;
    }
    break;
  }
}

if (currentPack) {
  result.bestPack.packs.push(currentPack);
}

console.log(`  ✓ BEST PACK ${result.bestPack.packs.length}개 추출 완료`);

// 2. 주차별 데이터 추출
console.log('\n[2단계] 주차별 데이터 추출');

// 주차 헤더 찾기
const weekHeaders = [];
data.forEach((row, i) => {
  if (row[1] && row[1].toString().includes('2026년 1월') && row[1].toString().includes('주')) {
    weekHeaders.push({ row: i, weekName: row[1].toString().trim() });
  }
});

console.log(`  발견된 주차: ${weekHeaders.length}개`);

weekHeaders.forEach((weekHeader, weekIdx) => {
  const startRow = weekHeader.row;
  const weekName = weekHeader.weekName;
  const weekNum = weekIdx + 1;

  console.log(`\n  [${weekName}]`);

  // 패키지 결산 헤더 (주차 헤더 다음 행)
  const packageHeaderRow = startRow + 1;
  const packageHeaders = data[packageHeaderRow] || [];
  
  const packageIndices = {
    no: packageHeaders.findIndex(h => h && h.toString().includes('No.')),
    thumbnail: packageHeaders.findIndex(h => h && h.toString().includes('Thumnail')),
    name: packageHeaders.findIndex(h => h && h.toString().includes('Name')),
    assetCount: packageHeaders.findIndex(h => h && h.toString().includes('Asset Count')),
    nonSubsSelect: packageHeaders.findIndex(h => h && h.toString().includes('NonSubs Select')),
    nonSubsSubsView: packageHeaders.findIndex(h => h && h.toString().includes('NonSubs SubsView')),
    nonSubsSubsSuccess: packageHeaders.findIndex(h => h && h.toString().includes('NonSubs SubsSuccess')),
    select: packageHeaders.findIndex(h => h && h.toString().includes('select')),
    save: packageHeaders.findIndex(h => h && h.toString().includes('save'))
  };

  // 패키지 결산 데이터 추출
  const packages = [];
  let packageDataStartRow = packageHeaderRow + 1;
  
  for (let i = packageDataStartRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    // 개별 에셋 헤더 시작 (IMG, Title, Categories)를 만나면 중단
    if (row[2] && row[2].toString().includes('IMG') && row[3] && row[3].toString().includes('Title')) {
      break;
    }

    const no = row[packageIndices.no];
    const name = row[packageIndices.name];
    
    if (no && name) {
      packages.push({
        no: parseInt(no) || 0,
        name: name.toString().trim(),
        thumbnail: generateThumbnailUrl(name),
        assetCount: row[packageIndices.assetCount] ? parseInt(row[packageIndices.assetCount]) : 0,
        nonSubsSelect: row[packageIndices.nonSubsSelect] ? parseInt(row[packageIndices.nonSubsSelect]) : 0,
        nonSubsSubsView: row[packageIndices.nonSubsSubsView] ? parseInt(row[packageIndices.nonSubsSubsView]) : 0,
        nonSubsSubsSuccess: row[packageIndices.nonSubsSubsSuccess] ? parseInt(row[packageIndices.nonSubsSubsSuccess]) : 0,
        select: row[packageIndices.select] ? parseInt(row[packageIndices.select]) : 0,
        save: row[packageIndices.save] ? parseInt(row[packageIndices.save]) : 0
      });
    }
  }

  console.log(`    패키지 결산: ${packages.length}개`);

  // 개별 스탬프 에셋 헤더 찾기
  let assetHeaderRow = -1;
  for (let i = startRow + 1; i < data.length; i++) {
    const row = data[i];
    if (row[2] && row[2].toString().includes('IMG') && row[3] && row[3].toString().includes('Title')) {
      assetHeaderRow = i;
      break;
    }
  }

  if (assetHeaderRow === -1) {
    console.log(`    ⚠️  개별 에셋 헤더를 찾을 수 없습니다.`);
    result.weeks.push({
      week: weekNum,
      weekName,
      packages,
      topAssets: []
    });
  } else {

  const assetHeaders = data[assetHeaderRow] || [];
  const assetIndices = {
    img: assetHeaders.findIndex(h => h && h.toString().includes('IMG')),
    title: assetHeaders.findIndex(h => h && h.toString().includes('Title')),
    categories: assetHeaders.findIndex(h => h && h.toString().includes('Categories')),
    select: assetHeaders.findIndex(h => h && h.toString().includes('Select')),
    save: assetHeaders.findIndex(h => h && h.toString().includes('Save')),
    savePercent: assetHeaders.findIndex(h => h && h.toString().includes('Save%')),
    editorFavorite: assetHeaders.findIndex(h => h && h.toString().includes('EditorFavorite'))
  };

  // 개별 스탬프 에셋 데이터 추출 (최대 20개)
  const topAssets = [];
  const assetDataStartRow = assetHeaderRow + 1;
  const nextWeekStartRow = weekIdx < weekHeaders.length - 1 ? weekHeaders[weekIdx + 1].row : data.length;

  for (let i = assetDataStartRow; i < nextWeekStartRow && topAssets.length < 20; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    // 다음 주차 헤더를 만나면 중단
    if (row[1] && row[1].toString().includes('2026년 1월') && row[1].toString().includes('주')) {
      break;
    }

    const title = row[assetIndices.title];
    const categories = row[assetIndices.categories];
    
    if (title) {
      const select = row[assetIndices.select] ? parseFloat(row[assetIndices.select]) : 0;
      const save = row[assetIndices.save] ? parseFloat(row[assetIndices.save]) : 0;
      const savePercent = row[assetIndices.savePercent] ? parseFloat(row[assetIndices.savePercent]) : 0;
      const editorFavorite = row[assetIndices.editorFavorite] ? parseInt(row[assetIndices.editorFavorite]) : 0;

      // 개별 에셋 이미지 경로 생성 (Categories 기반, 없으면 Title 사용)
      const thumbnailName = (categories || title).toString().trim();
      const safeName = thumbnailName.replace(/[^\w\-_.]/g, '_');
      const assetImagePath = `/new-stamp-assets/${safeName}.png`;
      
      topAssets.push({
        rank: topAssets.length + 1,
        title: title.toString().trim(),
        categories: categories ? categories.toString().trim() : '',
        thumbnail: assetImagePath, // 개별 에셋 이미지 경로 사용
        select,
        save,
        savePercent: Math.round(savePercent * 100) / 100,
        editorFavorite
      });
    }
  }

    console.log(`    개별 에셋 Top 20: ${topAssets.length}개`);

    result.weeks.push({
      week: weekNum,
      weekName,
      packages,
      topAssets
    });
  }
});

// BEST PACK 재계산: 주차별 데이터를 합산하여 1월 합산 순위 계산
console.log('\n[3단계] BEST PACK 재계산 (주차별 데이터 합산)');

// 주차별 데이터에서 팩별 합산 데이터 생성
const weekPackMap = new Map();
result.weeks.forEach((week) => {
  week.packages.forEach((pkg) => {
    const packName = pkg.name;
    if (!weekPackMap.has(packName)) {
      weekPackMap.set(packName, {
        nonSubsSubsSuccess: 0,
        save: 0
      });
    }
    const weekData = weekPackMap.get(packName);
    weekData.nonSubsSubsSuccess += pkg.nonSubsSubsSuccess;
    weekData.save += pkg.save;
  });
});

// BEST PACK의 모든 팩에 대해 1월 합산 계산
// 주차별 데이터에 나타나는 팩도 원본 BEST PACK에서 periods 데이터를 가져와야 함
const originalBestPackMap = new Map();
result.bestPack.packs.forEach((pack) => {
  originalBestPackMap.set(pack.name, pack);
});

// 주차별 데이터에 있는 팩도 원본 BEST PACK에서 periods 가져오기
weekPackMap.forEach((weekData, packName) => {
  const originalPack = originalBestPackMap.get(packName);
  if (originalPack && originalPack.periods) {
    // periods 데이터 보존
    weekData.periods = originalPack.periods;
  }
});

// BEST PACK의 모든 팩에 대해 1월 합산 계산
result.bestPack.packs.forEach((pack) => {
  const weekData = weekPackMap.get(pack.name);
  
  // 주차별 데이터에 있으면 주차별 합산 사용, 없으면 출시주+1주경과 합산 사용
  if (weekData) {
    pack.nonSubsSubsSuccess = weekData.nonSubsSubsSuccess;
    pack.save = weekData.save;
    // periods 데이터는 원본 유지 (이미 pack에 있음)
  } else {
    // 주차별 데이터에 없으면 출시주+1주경과 합산
    pack.nonSubsSubsSuccess = pack.periods.reduce((sum, p) => sum + p.nonSubsSubsSuccess, 0);
    pack.save = pack.periods.reduce((sum, p) => sum + p.subsSave, 0);
  }
});

// 구독성공 수 기준으로 정렬 (모든 팩 포함)
const sortedBestPacks = result.bestPack.packs
  .sort((a, b) => b.nonSubsSubsSuccess - a.nonSubsSubsSuccess)
  .map((pack, index) => ({
    ...pack,
    no: index + 1 // 순위 재할당
  }));

// BEST PACK 업데이트 (모든 팩 유지)
result.bestPack.packs = sortedBestPacks;

console.log(`  ✓ BEST PACK ${sortedBestPacks.length}개 재계산 완료`);
console.log(`  상위 5개:`);
sortedBestPacks.slice(0, 5).forEach((pack, idx) => {
  console.log(`    ${idx + 1}. ${pack.name}: 구독성공=${pack.nonSubsSubsSuccess}, Save=${pack.save}`);
});

// 결과 저장
const outputPath = path.join(__dirname, '..', 'public', 'new-stamp-pack.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

console.log(`\n✓ 신규 스탬프 팩 데이터 저장 완료: ${outputPath}`);
console.log(`  - BEST PACK: ${result.bestPack.packs.length}개`);
console.log(`  - 주차별 데이터: ${result.weeks.length}개 주차`);

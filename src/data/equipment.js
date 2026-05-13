/**
 * 기구별 데이터.
 * markerPreset: AR.js의 마커 식별자 ('hiro' | 'kanji' | 'custom URL')
 * primary: 주동근 (빨강으로 하이라이트)
 * secondary: 협응근 (노랑으로 하이라이트)
 * 추후 .patt 파일로 기구마다 고유 마커 만들 수 있음
 */
export const equipmentList = [
  {
    id: 'bench-press',
    name: '벤치프레스',
    markerPreset: 'hiro',
    routine: '가슴 + 삼두',
    primary: ['chest'],     // 대흉근
    secondary: ['triceps'], // 삼두근
    tips: '바벨을 내릴 때 팔꿈치를 몸쪽으로 내리며, 허리가 과도하게 들리지 않도록 주의하세요.',
    videoUrl: '/videos/bench-press.mp4',
  },
  {
    id: 'lat-pulldown',
    name: '랫풀다운',
    markerPreset: 'kanji',
    routine: '등 + 이두',
    primary: ['back'],
    secondary: ['biceps'],
    tips: '어깨를 내리고 가슴을 펴며, 팔이 아닌 등으로 당긴다는 느낌으로 수행하세요.',
    videoUrl: '/videos/lat-pulldown.mp4',
  },
]

// 발표 데모에선 첫 번째 기구 하나만 잘 작동시키는 게 핵심
export const demoEquipment = equipmentList[0]

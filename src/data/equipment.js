/**
 * 기구별 데이터.
 * marker.type: 'preset' (hiro/kanji) 또는 'pattern' (.patt 파일)
 * marker.value: preset 이름 또는 .patt 파일 URL
 */
export const equipmentList = [
  {
    id: 'dumbbell-curl',
    name: '덤벨 컬',
    marker: {
      type: 'pattern',
      value: '/markers/dumbbell-curl.patt',
    },
    routine: '팔 + 이두',
    primary: ['이두근'],
    secondary: ['전완근'],
    tips: '팔꿈치를 몸통에 고정하고 흔들리지 않도록 합니다. 반동을 사용하지 않고, 덤벨을 내릴 때도 천천히 통제하며 내려야 효과적입니다.',
    videoUrl: 'https://www.youtube.com/shorts/eyyesvSOg4A',
  },
  {
    id: 'pull-up',
    name: '풀업 (턱걸이)',
    marker: {
      type: 'pattern',
      value: '/markers/pull-up.patt',
    },
    routine: '등 + 이두',
    primary: ['광배근'],
    secondary: ['이두근', '후면 삼각근'],
    tips: '어깨를 끌어내리고 가슴을 펴며, 가슴을 바에 가까이 가져간다는 느낌으로 당깁니다. 반동을 사용하지 않습니다.',
    videoUrl: 'https://www.youtube.com/shorts/Ka1uGBFHoRU',
  },
]

export const demoEquipment = equipmentList[0]
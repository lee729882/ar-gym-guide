import { useEffect, useRef, useState } from 'react'
import { demoEquipment } from '../data/equipment'
import TopHeader from '../components/TopHeader'
import FloatingGuideBar from '../components/FloatingGuideBar'
import MusclePopup from '../components/MusclePopup'
import VideoModal from '../components/VideoModal'

// 근육 이름을 받아 equipment 데이터에 따라 색상 결정
// - primary 배열에 있으면 빨강 (주동근)
// - secondary 배열에 있으면 노랑 (협응근)
// - 둘 다 아니면 기본 피부색
function getMuscleColor(muscleName, equipment) {
  if (equipment.primary.includes(muscleName)) return '#EF4444'
  if (equipment.secondary.includes(muscleName)) return '#FACC15'
  return '#E8C7A0'
}

const SKIN = '#E8C7A0'

/**
 * AR 씬의 HTML을 문자열로 생성.
 * AR.js는 <a-marker> 요소가 DOM에 삽입되는 즉시 attribute를 읽어 초기화하므로,
 * React의 useEffect(마운트 이후)로 setAttribute 하면 이미 늦습니다.
 * dangerouslySetInnerHTML로 처음부터 올바른 attribute가 포함된 HTML을 삽입합니다.
 */
function buildSceneHTML(equipment, colors) {
  const { marker } = equipment
  const markerAttr =
    marker.type === 'pattern'
      ? `type="pattern" url="${marker.value}"`
      : `preset="${marker.value}"`

  const fd = colors.frontDelt !== SKIN ? colors.frontDelt : colors.delt
  const rd = colors.rearDelt !== SKIN ? colors.rearDelt : colors.delt

  return `
    <a-scene
      embedded
      arjs="sourceType: webcam; debugUIEnabled: false;"
      renderer="logarithmicDepthBuffer: true; antialias: true;"
      vr-mode-ui="enabled: false">

      <a-marker ${markerAttr} id="equipment-marker">
        <!-- 머리 -->
        <a-sphere position="0 1.95 0" radius="0.18" color="${SKIN}"></a-sphere>

        <!-- 몸통 -->
        <a-box position="0 1.2 0" depth="0.22" height="0.65" width="0.48" color="${SKIN}"></a-box>

        <!-- 가슴 (대흉근) -->
        <a-box position="0 1.32 0.115" depth="0.02" height="0.24" width="0.4" color="${colors.chest}"></a-box>

        <!-- 등 (광배근) -->
        <a-box position="0 1.18 -0.115" depth="0.02" height="0.42" width="0.42" color="${colors.back}"></a-box>

        <!-- 어깨 -->
        <a-sphere position="-0.27 1.5 0.05" radius="0.07" color="${fd}"></a-sphere>
        <a-sphere position="0.27 1.5 0.05" radius="0.07" color="${fd}"></a-sphere>
        <a-sphere position="-0.27 1.5 -0.05" radius="0.07" color="${rd}"></a-sphere>
        <a-sphere position="0.27 1.5 -0.05" radius="0.07" color="${rd}"></a-sphere>

        <!-- 왼쪽 상완 + 이두/삼두 -->
        <a-cylinder position="-0.32 1.2 0" radius="0.07" height="0.5" color="${SKIN}"></a-cylinder>
        <a-box position="-0.32 1.2 0.07" depth="0.02" height="0.34" width="0.1" color="${colors.bicep}"></a-box>
        <a-box position="-0.32 1.2 -0.07" depth="0.02" height="0.34" width="0.1" color="${colors.tricep}"></a-box>

        <!-- 오른쪽 상완 -->
        <a-cylinder position="0.32 1.2 0" radius="0.07" height="0.5" color="${SKIN}"></a-cylinder>
        <a-box position="0.32 1.2 0.07" depth="0.02" height="0.34" width="0.1" color="${colors.bicep}"></a-box>
        <a-box position="0.32 1.2 -0.07" depth="0.02" height="0.34" width="0.1" color="${colors.tricep}"></a-box>

        <!-- 전완 -->
        <a-cylinder position="-0.32 0.75 0" radius="0.06" height="0.45" color="${colors.forearm}"></a-cylinder>
        <a-cylinder position="0.32 0.75 0" radius="0.06" height="0.45" color="${colors.forearm}"></a-cylinder>

        <!-- 다리 -->
        <a-cylinder position="-0.12 0.4 0" radius="0.09" height="0.7" color="${SKIN}"></a-cylinder>
        <a-cylinder position="0.12 0.4 0" radius="0.09" height="0.7" color="${SKIN}"></a-cylinder>
      </a-marker>

      <a-entity camera></a-entity>
    </a-scene>
  `
}

export default function ExperiencePhase({ onComplete }) {
  const [markerDetected, setMarkerDetected] = useState(false)
  const [activeMuscle, setActiveMuscle] = useState(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const equipment = demoEquipment
  const sceneContainerRef = useRef(null)

  // 근육 부위별 색상을 미리 계산
  const c = {
    chest: getMuscleColor('대흉근', equipment),
    back: getMuscleColor('광배근', equipment),
    bicep: getMuscleColor('이두근', equipment),
    tricep: getMuscleColor('삼두근', equipment),
    forearm: getMuscleColor('전완근', equipment),
    frontDelt: getMuscleColor('전면 삼각근', equipment),
    rearDelt: getMuscleColor('후면 삼각근', equipment),
    delt: getMuscleColor('삼각근', equipment),
  }

  // markerFound / markerLost 이벤트 리스너 등록
  useEffect(() => {
    const container = sceneContainerRef.current
    if (!container) return

    // DOM이 innerHTML로 이미 생성된 뒤이므로 querySelector로 찾을 수 있음
    const marker = container.querySelector('#equipment-marker')
    if (!marker) return

    const onFound = () => setMarkerDetected(true)
    const onLost = () => setMarkerDetected(false)
    marker.addEventListener('markerFound', onFound)
    marker.addEventListener('markerLost', onLost)
    return () => {
      marker.removeEventListener('markerFound', onFound)
      marker.removeEventListener('markerLost', onLost)
    }
  }, [])

  return (
    <div className="fixed inset-0">
      {/* AR 레이어 - dangerouslySetInnerHTML로 a-scene을 렌더링하여
          AR.js가 초기화 시 올바른 marker attribute(type/url)를 읽을 수 있게 함 */}
      <div
        ref={sceneContainerRef}
        dangerouslySetInnerHTML={{ __html: buildSceneHTML(equipment, c) }}
      />

      {/* UI 오버레이 */}
      <div className="absolute inset-0 pointer-events-none">
        <TopHeader
          equipmentName={equipment.name}
          detected={markerDetected}
          onClose={() => onComplete(null)}
        />

        {!markerDetected && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-slate-900/85 backdrop-blur-md border border-white/10
                            text-white text-center px-5 py-3 rounded-2xl">
              <p className="text-sm animate-pulse">마커를 비춰주세요</p>
            </div>
          </div>
        )}

        {markerDetected && (
          <FloatingGuideBar
            equipment={equipment}
            onMuscleClick={(muscle) => setActiveMuscle(muscle)}
            onShowVideo={() => setVideoOpen(true)}
            onComplete={() => onComplete(equipment)}
          />
        )}
      </div>

      {activeMuscle && (
        <MusclePopup
          muscle={activeMuscle}
          equipment={equipment}
          onClose={() => setActiveMuscle(null)}
        />
      )}

      {videoOpen && (
        <VideoModal
          videoUrl={equipment.videoUrl}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </div>
  )
}


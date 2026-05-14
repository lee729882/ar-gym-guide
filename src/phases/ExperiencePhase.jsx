import { useEffect, useRef, useState } from 'react'
import { equipmentList } from '../data/equipment'
import TopHeader from '../components/TopHeader'
import FloatingGuideBar from '../components/FloatingGuideBar'
import MusclePopup from '../components/MusclePopup'
import VideoModal from '../components/VideoModal'

const SKIN = '#E8C7A0'

function getMuscleColor(name, eq) {
  if (eq.primary.includes(name)) return '#EF4444'
  if (eq.secondary.includes(name)) return '#FACC15'
  return SKIN
}

/**
 * 기구별 근육 색상에 맞춘 인체 HTML 생성.
 * 스틱맨 → 머리/목/어깨/가슴/팔/다리/발 모두 포함한 실루엣.
 */
function buildBodyHTML(eq) {
  const chest = getMuscleColor('대흉근', eq)
  const back = getMuscleColor('광배근', eq)
  const bicep = getMuscleColor('이두근', eq)
  const tricep = getMuscleColor('삼두근', eq)
  const forearm = getMuscleColor('전완근', eq)
  const delt = getMuscleColor('삼각근', eq)
  const frontDelt = getMuscleColor('전면 삼각근', eq) !== SKIN ? getMuscleColor('전면 삼각근', eq) : delt
  const rearDelt = getMuscleColor('후면 삼각근', eq) !== SKIN ? getMuscleColor('후면 삼각근', eq) : delt

  return `
    <!-- ── 머리 / 목 ── -->
    <a-sphere position="0 2.05 0" radius="0.18" color="${SKIN}"></a-sphere>
    <a-cylinder position="0 1.88 0" radius="0.055" height="0.12" color="${SKIN}"></a-cylinder>

    <!-- ── 몸통 (어깨→허리→골반 테이퍼) ── -->
    <a-box position="0 1.62 0" width="0.60" height="0.18" depth="0.26" color="${SKIN}"></a-box>
    <a-box position="0 1.43 0" width="0.50" height="0.22" depth="0.24" color="${SKIN}"></a-box>
    <a-box position="0 1.23 0" width="0.42" height="0.20" depth="0.22" color="${SKIN}"></a-box>
    <a-box position="0 1.07 0" width="0.50" height="0.16" depth="0.26" color="${SKIN}"></a-box>

    <!-- ── 근육 패치: 가슴(앞) / 등(뒤) ── -->
    <a-box position="0 1.52 0.13" width="0.44" height="0.26" depth="0.02" color="${chest}"></a-box>
    <a-box position="0 1.40 -0.13" width="0.44" height="0.40" depth="0.02" color="${back}"></a-box>

    <!-- ── 어깨(삼각근) ── -->
    <a-sphere position="-0.33 1.65 0" radius="0.10" color="${frontDelt}"></a-sphere>
    <a-sphere position=" 0.33 1.65 0" radius="0.10" color="${frontDelt}"></a-sphere>

    <!-- ── 왼팔: 상완 + 이두(앞) + 삼두(뒤) ── -->
    <a-cylinder position="-0.39 1.38 0" radius="0.068" height="0.44" color="${SKIN}"></a-cylinder>
    <a-box position="-0.39 1.38  0.073" width="0.10" height="0.34" depth="0.02" color="${bicep}"></a-box>
    <a-box position="-0.39 1.38 -0.073" width="0.10" height="0.34" depth="0.02" color="${tricep}"></a-box>
    <!-- 팔꿈치 -->
    <a-sphere position="-0.39 1.14 0" radius="0.052" color="${SKIN}"></a-sphere>

    <!-- ── 오른팔 ── -->
    <a-cylinder position=" 0.39 1.38 0" radius="0.068" height="0.44" color="${SKIN}"></a-cylinder>
    <a-box position=" 0.39 1.38  0.073" width="0.10" height="0.34" depth="0.02" color="${bicep}"></a-box>
    <a-box position=" 0.39 1.38 -0.073" width="0.10" height="0.34" depth="0.02" color="${tricep}"></a-box>
    <a-sphere position=" 0.39 1.14 0" radius="0.052" color="${SKIN}"></a-sphere>

    <!-- ── 전완 + 손 ── -->
    <a-cylinder position="-0.39 0.90 0" radius="0.052" height="0.40" color="${forearm}"></a-cylinder>
    <a-cylinder position=" 0.39 0.90 0" radius="0.052" height="0.40" color="${forearm}"></a-cylinder>
    <a-box position="-0.39 0.65 0" width="0.08" height="0.12" depth="0.05" color="${SKIN}"></a-box>
    <a-box position=" 0.39 0.65 0" width="0.08" height="0.12" depth="0.05" color="${SKIN}"></a-box>

    <!-- ── 허벅지 ── -->
    <a-cylinder position="-0.15 0.72 0" radius="0.098" height="0.44" color="${SKIN}"></a-cylinder>
    <a-cylinder position=" 0.15 0.72 0" radius="0.098" height="0.44" color="${SKIN}"></a-cylinder>
    <!-- 무릎 -->
    <a-sphere position="-0.15 0.48 0" radius="0.065" color="${SKIN}"></a-sphere>
    <a-sphere position=" 0.15 0.48 0" radius="0.065" color="${SKIN}"></a-sphere>

    <!-- ── 종아리 + 발 ── -->
    <a-cylinder position="-0.14 0.22 0" radius="0.062" height="0.40" color="${SKIN}"></a-cylinder>
    <a-cylinder position=" 0.14 0.22 0" radius="0.062" height="0.40" color="${SKIN}"></a-cylinder>
    <a-box position="-0.13 0.02 0.06" width="0.10" height="0.06" depth="0.22" color="${SKIN}"></a-box>
    <a-box position=" 0.13 0.02 0.06" width="0.10" height="0.06" depth="0.22" color="${SKIN}"></a-box>
  `
}

/**
 * equipmentList 전체를 순회해 마커+몸통 HTML을 생성.
 * → DC 마커, PU 마커 동시에 씬에 등록.
 */
function buildSceneHTML(items) {
  const markersHTML = items.map(eq => {
    const { marker } = eq
    const markerAttr = marker.type === 'pattern'
      ? `type="pattern" url="${marker.value}"`
      : `preset="${marker.value}"`
    return `
      <a-marker ${markerAttr} id="marker-${eq.id}">
        ${buildBodyHTML(eq)}
      </a-marker>
    `
  }).join('')

  return `
  <a-scene
    embedded
    arjs="sourceType: webcam; debugUIEnabled: false;"
    renderer="logarithmicDepthBuffer: false; antialias: false;"
    vr-mode-ui="enabled: false">
    <a-light type="ambient" color="#ffffff" intensity="1.0"></a-light>
    <a-light type="directional" color="#ffffff" intensity="0.8" position="1 2 1"></a-light>
    ${markersHTML}
    <a-entity camera></a-entity>
  </a-scene>
`
}

export default function ExperiencePhase({ onComplete }) {
  const [activeEquipment, setActiveEquipment] = useState(null)
  const [activeMuscle, setActiveMuscle] = useState(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const containerRef = useRef(null)

  // 각 마커에 이벤트 등록
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const listeners = []

    equipmentList.forEach(eq => {
      const marker = container.querySelector(`#marker-${eq.id}`)
      if (!marker) return

      const onFound = () => setActiveEquipment(eq)
      const onLost = () => setActiveEquipment(prev =>
        prev?.id === eq.id ? null : prev
      )

      marker.addEventListener('markerFound', onFound)
      marker.addEventListener('markerLost', onLost)
      listeners.push({ marker, onFound, onLost })
    })

    return () => {
      listeners.forEach(({ marker, onFound, onLost }) => {
        marker.removeEventListener('markerFound', onFound)
        marker.removeEventListener('markerLost', onLost)
      })
    }
  }, [])

  return (
    <div className="fixed inset-0">
      {/* AR 레이어 */}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: buildSceneHTML(equipmentList) }}
      />

      {/* UI 오버레이 */}
      <div className="absolute inset-0 pointer-events-none">
        <TopHeader
          equipmentName={activeEquipment?.name}
          detected={!!activeEquipment}
          onClose={() => onComplete(null)}
        />

        {!activeEquipment && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-slate-900/85 backdrop-blur-md border border-white/10
                            text-white text-center px-5 py-3 rounded-2xl">
              <p className="text-sm animate-pulse">마커를 비춰주세요</p>
            </div>
          </div>
        )}

        {activeEquipment && (
          <FloatingGuideBar
            equipment={activeEquipment}
            onMuscleClick={muscle => setActiveMuscle(muscle)}
            onShowVideo={() => setVideoOpen(true)}
            onComplete={() => onComplete(activeEquipment)}
          />
        )}
      </div>

      {activeMuscle && activeEquipment && (
        <MusclePopup
          muscle={activeMuscle}
          equipment={activeEquipment}
          onClose={() => setActiveMuscle(null)}
        />
      )}

      {videoOpen && activeEquipment && (
        <VideoModal
          videoUrl={activeEquipment.videoUrl}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </div>
  )
}

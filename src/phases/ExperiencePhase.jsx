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
  const color = eq.primary[0] === '이두근' ? '#EF4444' : '#3B82F6'
  return `<a-sphere position="0 1 0" radius="0.5" material="color: ${color}; shader: flat;"></a-sphere>`
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

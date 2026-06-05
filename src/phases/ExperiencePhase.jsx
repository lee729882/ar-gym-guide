import { useEffect, useRef, useState } from 'react'
import { equipmentList } from '../data/equipment'
import TopHeader from '../components/TopHeader'
import FloatingGuideBar from '../components/FloatingGuideBar'
import MusclePopup from '../components/MusclePopup'
import VideoModal from '../components/VideoModal'

function getMuscleColor(name, eq) {
  if (eq.primary.includes(name)) return '#EF4444'
  if (eq.secondary.includes(name)) return '#FACC15'
  return null
}

/**
 * GLB 하이브리드 모델 v2
 * - rotation="0 180 0" : 모델이 카메라를 정면으로 바라보도록 수정
 * - 앞/뒤 오버레이 Z 좌표 교정 (180도 회전 후 앞=+Z, 뒤=-Z)
 */
function buildBodyHTML(eq) {
  const c = (name) => getMuscleColor(name, eq)

  const chest = c('대흉근')
  const back = c('광배근')
  const delt = c('삼각근') ?? c('전면 삼각근') ?? c('후면 삼각근')
  const upperArm = c('이두근') ?? c('삼두근')
  const forearm = c('전완근')
  const abs = c('복근') ?? c('복부')
  const thigh = c('대퇴사두근') ?? c('햄스트링') ?? c('둔근')
  const calf = c('종아리') ?? c('비복근')

  const ov = (col) =>
    col
      ? `color="${col}" material="opacity: 0.58; transparent: true; depthWrite: false"`
      : `material="opacity: 0; transparent: true"`

  return `
    <!-- ══ GLB 인체 모델 (rotation 180° → 카메라 정면) ══ -->
    <a-entity
      gltf-model="/models/man.glb"
      scale="1.153 1.153 1.153"
      position="0 -2.864 0"
      rotation="0 180 0">
    </a-entity>

    <!-- ══ 근육 오버레이 ══ -->

    <!-- 가슴 (대흉근) : 모델 앞 → +Z -->
    <a-sphere position="0 1.31 0.22" radius="0.26"
      ${ov(chest)}></a-sphere>

    <!-- 광배근 : 모델 뒤 → -Z -->
    <a-sphere position="0 1.22 -0.22" radius="0.28"
      ${ov(back)}></a-sphere>

    <!-- 어깨 (삼각근) -->
    <a-sphere position="-0.44 1.50 0" radius="0.14"
      ${ov(delt)}></a-sphere>
    <a-sphere position=" 0.44 1.50 0" radius="0.14"
      ${ov(delt)}></a-sphere>

    <!-- 상완 (이두/삼두) - T포즈 수평 -->
    <a-cylinder position="-0.64 1.38 0" radius="0.10" height="0.32"
      rotation="0 0 90" ${ov(upperArm)}></a-cylinder>
    <a-cylinder position=" 0.64 1.38 0" radius="0.10" height="0.32"
      rotation="0 0 90" ${ov(upperArm)}></a-cylinder>

    <!-- 전완 -->
    <a-cylinder position="-0.84 1.38 0" radius="0.07" height="0.26"
      rotation="0 0 90" ${ov(forearm)}></a-cylinder>
    <a-cylinder position=" 0.84 1.38 0" radius="0.07" height="0.26"
      rotation="0 0 90" ${ov(forearm)}></a-cylinder>

    <!-- 복근 : 앞 → +Z -->
    <a-sphere position="0 1.08 0.18" radius="0.19"
      ${ov(abs)}></a-sphere>

    <!-- 허벅지 -->
    <a-cylinder position="-0.17 0.73 0" radius="0.13" height="0.44"
      ${ov(thigh)}></a-cylinder>
    <a-cylinder position=" 0.17 0.73 0" radius="0.13" height="0.44"
      ${ov(thigh)}></a-cylinder>

    <!-- 종아리 -->
    <a-cylinder position="-0.155 0.25 0" radius="0.085" height="0.36"
      ${ov(calf)}></a-cylinder>
    <a-cylinder position=" 0.155 0.25 0" radius="0.085" height="0.36"
      ${ov(calf)}></a-cylinder>
  `
}

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
      <div
        ref={containerRef}
        className="fixed inset-0"
        dangerouslySetInnerHTML={{ __html: buildSceneHTML(equipmentList) }}
      />

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

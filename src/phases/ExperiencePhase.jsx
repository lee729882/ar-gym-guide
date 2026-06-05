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
 * 개선: 패치 제거 → 세그먼트 직접 채색 / roughness 피부 재질 / 자연스러운 팔 각도
 */
function buildBodyHTML(eq) {
  const c = (name) => getMuscleColor(name, eq)

  // ── 각 세그먼트에 적용할 색상 결정 ──────────────────────────
  const chestCol = c('대흉근')
  const backCol = c('광배근')
  const deltCol = [c('삼각근'), c('전면 삼각근'), c('후면 삼각근')]
    .find(v => v !== SKIN) ?? SKIN
  // 상완: 이두 우선, 없으면 삼두, 없으면 피부색
  const upperArmCol = c('이두근') !== SKIN ? c('이두근')
    : c('삼두근') !== SKIN ? c('삼두근')
      : SKIN
  const forearmCol = c('전완근')
  // 허벅지: 대퇴사두 > 햄스트링 > 둔근
  const thighCol = [c('대퇴사두근'), c('햄스트링'), c('둔근')]
    .find(v => v !== SKIN) ?? SKIN
  const calfCol = [c('종아리'), c('비복근')].find(v => v !== SKIN) ?? SKIN
  // 몸통 앞면 색 (가슴 우선, 없으면 등)
  const torsoCol = chestCol !== SKIN ? chestCol
    : backCol !== SKIN ? backCol
      : SKIN

  // 공통 피부 재질 (매트한 느낌)
  const mat = `material="roughness: 0.85; metalness: 0.0; shader: standard"`

  return `
    <!-- ── 머리 ── -->
    <a-sphere position="0 2.08 0" radius="0.195" color="${SKIN}" ${mat}></a-sphere>
    <!-- 귀 (볼륨감) -->
    <a-sphere position="-0.195 2.08 0" radius="0.045" color="${SKIN}" ${mat}></a-sphere>
    <a-sphere position=" 0.195 2.08 0" radius="0.045" color="${SKIN}" ${mat}></a-sphere>
    <!-- 목 -->
    <a-cylinder position="0 1.89 0" radius="0.068" height="0.14" color="${SKIN}" ${mat}></a-cylinder>

    <!-- ── 어깨 (삼각근) ── -->
    <a-sphere position="-0.36 1.75 0" radius="0.115" color="${deltCol}" ${mat}></a-sphere>
    <a-sphere position=" 0.36 1.75 0" radius="0.115" color="${deltCol}" ${mat}></a-sphere>

    <!-- ── 몸통 ── -->
    <!-- 상부 (가슴/광배) -->
    <a-cylinder position="0 1.60 0" radius="0.275" height="0.30" color="${torsoCol}" ${mat}></a-cylinder>
    <!-- 복부 -->
    <a-cylinder position="0 1.32 0" radius="0.240" height="0.28" color="${SKIN}" ${mat}></a-cylinder>
    <!-- 골반 -->
    <a-cylinder position="0 1.10 0" radius="0.265" height="0.22" color="${SKIN}" ${mat}></a-sphere>

    <!-- ── 왼팔 (약간 벌린 자연스러운 자세) ── -->
    <!-- 상완 -->
    <a-cylinder position="-0.48 1.50 0" radius="0.078" height="0.42"
      rotation="0 0 18" color="${upperArmCol}" ${mat}></a-cylinder>
    <!-- 팔꿈치 -->
    <a-sphere position="-0.535 1.27 0" radius="0.060" color="${SKIN}" ${mat}></a-sphere>
    <!-- 전완 -->
    <a-cylinder position="-0.575 1.02 0" radius="0.058" height="0.42"
      rotation="0 0 10" color="${forearmCol}" ${mat}></a-cylinder>
    <!-- 손목·손 -->
    <a-sphere position="-0.605 0.79 0" radius="0.046" color="${SKIN}" ${mat}></a-sphere>
    <a-box position="-0.610 0.70 0" width="0.090" height="0.115" depth="0.055"
      color="${SKIN}" ${mat}></a-box>

    <!-- ── 오른팔 ── -->
    <a-cylinder position=" 0.48 1.50 0" radius="0.078" height="0.42"
      rotation="0 0 -18" color="${upperArmCol}" ${mat}></a-cylinder>
    <a-sphere position=" 0.535 1.27 0" radius="0.060" color="${SKIN}" ${mat}></a-sphere>
    <a-cylinder position=" 0.575 1.02 0" radius="0.058" height="0.42"
      rotation="0 0 -10" color="${forearmCol}" ${mat}></a-cylinder>
    <a-sphere position=" 0.605 0.79 0" radius="0.046" color="${SKIN}" ${mat}></a-sphere>
    <a-box position=" 0.610 0.70 0" width="0.090" height="0.115" depth="0.055"
      color="${SKIN}" ${mat}></a-box>

    <!-- ── 허벅지 ── -->
    <a-cylinder position="-0.155 0.76 0" radius="0.102" height="0.46"
      color="${thighCol}" ${mat}></a-cylinder>
    <a-cylinder position=" 0.155 0.76 0" radius="0.102" height="0.46"
      color="${thighCol}" ${mat}></a-cylinder>
    <!-- 무릎 -->
    <a-sphere position="-0.155 0.51 0" radius="0.068" color="${SKIN}" ${mat}></a-sphere>
    <a-sphere position=" 0.155 0.51 0" radius="0.068" color="${SKIN}" ${mat}></a-sphere>

    <!-- ── 종아리 ── -->
    <a-cylinder position="-0.145 0.26 0" radius="0.065" height="0.44"
      color="${calfCol}" ${mat}></a-cylinder>
    <a-cylinder position=" 0.145 0.26 0" radius="0.065" height="0.44"
      color="${calfCol}" ${mat}></a-cylinder>
    <!-- 발목·발 -->
    <a-sphere position="-0.145 0.03 0" radius="0.050" color="${SKIN}" ${mat}></a-sphere>
    <a-sphere position=" 0.145 0.03 0" radius="0.050" color="${SKIN}" ${mat}></a-sphere>
    <a-box position="-0.135 0.015 0.075" width="0.105" height="0.065" depth="0.235"
      color="${SKIN}" ${mat}></a-box>
    <a-box position=" 0.135 0.015 0.075" width="0.105" height="0.065" depth="0.235"
      color="${SKIN}" ${mat}></a-box>
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
        className="fixed inset-0"
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

import { useEffect, useRef, useState } from 'react'
import { equipmentList } from '../data/equipment'
import TopHeader from '../components/TopHeader'
import FloatingGuideBar from '../components/FloatingGuideBar'
import MusclePopup from '../components/MusclePopup'
import VideoModal from '../components/VideoModal'

// 근육 활성화 여부만 판별 (색 불필요)
function getMuscleColor(name, eq) {
  if (eq.primary.includes(name)) return '#EF4444'
  if (eq.secondary.includes(name)) return '#FACC15'
  return null // null = 비활성
}

/**
 * GLB 기반 하이브리드 모델.
 * ① /models/man.glb  → 인체 실루엣 (사실감)
 * ② 반투명 오버레이  → 근육 활성화 시각화
 *
 * 좌표 근거: Man.glb 바운딩박스 분석 결과
 *   - 모델 높이 1.561 entity unit → scale 1.153 → 1.8 A-Frame m
 *   - 발 Y 오프셋: -2.864 (발이 마커 위에 정확히 닿도록)
 *   - T포즈: 팔이 수평으로 펼쳐진 해부학적 자세
 */
function buildBodyHTML(eq) {
  const c = (name) => getMuscleColor(name, eq)

  // ── 각 근육 그룹 활성 색상 ─────────────────────────
  const chest    = c('대흉근')
  const back     = c('광배근')
  const delt     = c('삼각근') ?? c('전면 삼각근') ?? c('후면 삼각근')
  const upperArm = c('이두근') ?? c('삼두근')
  const forearm  = c('전완근')
  const abs      = c('복근') ?? c('복부')
  const thigh    = c('대퇴사두근') ?? c('햄스트링') ?? c('둔근')
  const calf     = c('종아리') ?? c('비복근')

  // ── 오버레이 헬퍼: 비활성 시 완전 투명 ──────────────
  const ov = (col, extra = '') =>
    col
      ? `color="${col}" material="opacity: 0.58; transparent: true; depthWrite: false" ${extra}`
      : `material="opacity: 0; transparent: true"`

  return `
    <!-- ══ ① GLB 인체 모델 ══════════════════════════════════ -->
    <a-entity
      gltf-model="/models/man.glb"
      scale="1.153 1.153 1.153"
      position="0 -2.864 0">
    </a-entity>

    <!-- ══ ② 근육 오버레이 (활성화 시만 불투명) ════════════ -->

    <!-- 가슴 (대흉근) - 앞쪽 -->
    <a-sphere position="0 1.31 -0.22" radius="0.26"
      ${ov(chest)}></a-sphere>

    <!-- 광배근 - 뒤쪽 -->
    <a-sphere position="0 1.22 0.22" radius="0.28"
      ${ov(back)}></a-sphere>

    <!-- 어깨 (삼각근) - 좌우 -->
    <a-sphere position="-0.44 1.50 0" radius="0.14"
      ${ov(delt)}></a-sphere>
    <a-sphere position=" 0.44 1.50 0" radius="0.14"
      ${ov(delt)}></a-sphere>

    <!-- 상완 (이두/삼두) - T포즈 수평, 좌우 -->
    <a-cylinder position="-0.64 1.38 0" radius="0.10" height="0.32"
      rotation="0 0 90" ${ov(upperArm)}></a-cylinder>
    <a-cylinder position=" 0.64 1.38 0" radius="0.10" height="0.32"
      rotation="0 0 90" ${ov(upperArm)}></a-cylinder>

    <!-- 전완 - 수평, 좌우 -->
    <a-cylinder position="-0.84 1.38 0" radius="0.07" height="0.26"
      rotation="0 0 90" ${ov(forearm)}></a-cylinder>
    <a-cylinder position=" 0.84 1.38 0" radius="0.07" height="0.26"
      rotation="0 0 90" ${ov(forearm)}></a-cylinder>

    <!-- 복근 - 앞쪽 -->
    <a-sphere position="0 1.08 -0.18" radius="0.19"
      ${ov(abs)}></a-sphere>

    <!-- 허벅지 (대퇴사두근 등) - 좌우 -->
    <a-cylinder position="-0.17 0.73 0" radius="0.13" height="0.44"
      ${ov(thigh)}></a-cylinder>
    <a-cylinder position=" 0.17 0.73 0" radius="0.13" height="0.44"
      ${ov(thigh)}></a-cylinder>

    <!-- 종아리 - 좌우 -->
    <a-cylinder position="-0.155 0.25 0" radius="0.085" height="0.36"
      ${ov(calf)}></a-cylinder>
    <a-cylinder position=" 0.155 0.25 0" radius="0.085" height="0.36"
      ${ov(calf)}></a-cylinder>
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

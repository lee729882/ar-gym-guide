import { useEffect, useState, useRef } from 'react'
import { demoEquipment } from '../data/equipment'
import TopHeader from '../components/TopHeader'
import FloatingGuideBar from '../components/FloatingGuideBar'
import MusclePopup from '../components/MusclePopup'
import VideoModal from '../components/VideoModal'

/**
 * 진행 단계: 실제 AR이 동작하는 메인 무대.
 *
 * 구조:
 *   [AR 레이어]  ← A-Frame이 그리는 카메라 + 3D
 *   [정보 레이어] ← React가 그리는 UI 오버레이
 *
 * 두 레이어는 같은 화면을 공유하지만, AR.js는 DOM을 직접 만들고
 * React UI는 그 위에 absolute로 떠 있는 구조입니다.
 */
export default function ExperiencePhase({ onComplete }) {
  const [markerDetected, setMarkerDetected] = useState(false)
  const [activeMuscle, setActiveMuscle] = useState(null) // 터치한 근육 정보
  const [videoOpen, setVideoOpen] = useState(false)
  const sceneRef = useRef(null)

  // AR.js 마커 이벤트를 React 상태로 연결
  useEffect(() => {
    const marker = document.querySelector('#equipment-marker')
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
      {/* ===== AR 레이어 ===== */}
      {/* a-scene은 React가 모르는 custom element지만 그대로 렌더링됨 */}
      <a-scene
        ref={sceneRef}
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false;"
        renderer="logarithmicDepthBuffer: true; antialias: true;"
        vr-mode-ui="enabled: false">

        <a-marker preset={demoEquipment.markerPreset} id="equipment-marker">
          {/* 임시 인체 표현: 스틱 피규어 (나중에 .glb 모델로 교체) */}
          {/* 머리 */}
          <a-sphere position="0 1.8 0" radius="0.2" color="#E8C7A0"></a-sphere>
          {/* 몸통 - 가슴(주동근)을 빨갛게 */}
          <a-box position="0 1.1 0" depth="0.25" height="0.7" width="0.5"
                 color="#E8C7A0"></a-box>
          {/* 가슴 하이라이트 (대흉근) - 주동근 빨강 */}
          <a-box position="0 1.25 0.13" depth="0.02" height="0.25" width="0.4"
                 color="#FF2D2D"
                 onClick={() => setActiveMuscle({ name: '대흉근', role: '주동근' })}
                 class="clickable"></a-box>
          {/* 팔 - 삼두근(협응근)을 노랗게 */}
          <a-cylinder position="-0.4 1.1 0" radius="0.07" height="0.6"
                      color="#FFC93D"
                      onClick={() => setActiveMuscle({ name: '삼두근', role: '협응근' })}
                      class="clickable"></a-cylinder>
          <a-cylinder position="0.4 1.1 0" radius="0.07" height="0.6"
                      color="#FFC93D"
                      onClick={() => setActiveMuscle({ name: '삼두근', role: '협응근' })}
                      class="clickable"></a-cylinder>
          {/* 다리 */}
          <a-cylinder position="-0.15 0.4 0" radius="0.1" height="0.7"
                      color="#E8C7A0"></a-cylinder>
          <a-cylinder position="0.15 0.4 0" radius="0.1" height="0.7"
                      color="#E8C7A0"></a-cylinder>

          {/* 기구명 라벨 */}
          <a-text value={demoEquipment.name} position="0 2.3 0"
                  align="center" color="#FFFFFF"
                  geometry="primitive: plane; width: auto; height: auto"
                  material="color: #000000; opacity: 0.6"></a-text>
        </a-marker>

        <a-entity camera></a-entity>
      </a-scene>

      {/* ===== 정보 레이어 (React UI 오버레이) ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <TopHeader
          equipmentName={demoEquipment.name}
          detected={markerDetected}
          onClose={() => onComplete(null)}
        />

        {!markerDetected && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          glass-dark text-white text-center px-6 py-4">
            <p className="text-sm">기구의 마커를 비춰주세요</p>
          </div>
        )}

        {markerDetected && (
          <FloatingGuideBar
            equipment={demoEquipment}
            onShowVideo={() => setVideoOpen(true)}
            onComplete={() => onComplete(demoEquipment)}
          />
        )}
      </div>

      {/* ===== 모달 레이어 ===== */}
      {activeMuscle && (
        <MusclePopup
          muscle={activeMuscle}
          equipment={demoEquipment}
          onClose={() => setActiveMuscle(null)}
        />
      )}

      {videoOpen && (
        <VideoModal
          videoUrl={demoEquipment.videoUrl}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </div>
  )
}

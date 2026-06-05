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

// 쉽게 근육 오버레이를 추가할 수 있는 설정 딕셔너리
const MUSCLE_OVERLAYS = [
  // 단일 근육 (가운데)
  { names: ['대흉근'], position: '0 1.35 0.17', radius: '0.18', scale: '1.1 0.8 0.4' },
  { names: ['복근', '복부'], position: '0 1.05 0.15', radius: '0.16', scale: '1 1.2 0.5' },

  // 좌우 대칭 근육 (mirror: true 시 오른쪽 좌표 자동 생성)
  { names: ['광배근'], position: '-0.232 1.118 0.24', radius: '0.22', scale: '1.1 1.7 0.4', mirror: true },
  { names: ['삼각근'], position: '-0.26 1.42 0', radius: '0.1', scale: '1 1.2 1', mirror: true },
  { names: ['전면 삼각근'], position: '-0.24 1.42 0.08', radius: '0.08', scale: '1 1.2 1', mirror: true },
  { names: ['후면 삼각근'], position: '0.665 1.48 0.128', radius: '0.08', scale: '1 1.2 1', mirror: true },
  { names: ['이두근', '삼두근'], position: '0.664 0.996 -0.313', radius: '0.08', scale: '2 2 1', rotation: '0 0 10', mirror: true, mirrorRot: '0 0 -10' },
  // 자동 대칭(mirror)을 지우고 좌/우를 직접 지정합니다!
  { names: ['전완근'], position: '0.648 0.505 -0.257 ', radius: '0.06', scale: '1 5 1', rotation: '0 0 5' },
  { names: ['전완근'], position: '-0.666 0.457 -0.195', radius: '0.06', scale: '1 5 1', rotation: '0 0 -5' },
  { names: ['대퇴사두근', '햄스트링', '둔근'], position: '-0.14 0.65 0', radius: '0.11', scale: '1 2 1', mirror: true },
  { names: ['종아리', '비복근'], position: '-0.14 0.25 -0.04', radius: '0.08', scale: '1 1.8 1', mirror: true },

  // 💡 새로운 부위를 원하시면 아래에 추가하세요!
  // 예: { names: ['새로운근육'], position: 'x y z', radius: '0.1', scale: '1 1 1' }
]

function buildBodyHTML(eq) {
  const getCol = (names) => {
    for (const name of names) {
      const col = getMuscleColor(name, eq)
      if (col) return col
    }
    return null
  }

  const ov = (col) => col
    ? `color="${col}" material="opacity: 0.58; transparent: true; depthWrite: false"`
    : `material="opacity: 0; transparent: true"`

  let overlaysHTML = ''

  MUSCLE_OVERLAYS.forEach(m => {
    const col = getCol(m.names)
    const rot = m.rotation ? `rotation="${m.rotation}"` : ''

    // 왼쪽 (또는 중앙)
    overlaysHTML += `<a-sphere position="${m.position}" radius="${m.radius}" scale="${m.scale}" ${rot} ${ov(col)}></a-sphere>\n`

    // 오른쪽 대칭 처리
    if (m.mirror) {
      const [x, y, z] = m.position.split(' ').map(parseFloat)
      const mirrorPos = `${-x} ${y} ${z}`
      const mirrorRot = m.mirrorRot ? `rotation="${m.mirrorRot}"` : ''
      overlaysHTML += `<a-sphere position="${mirrorPos}" radius="${m.radius}" scale="${m.scale}" ${mirrorRot} ${ov(col)}></a-sphere>\n`
    }
  })

  return `
    <a-entity class="rotatable-model" rotation="0 0 0">
      <!-- ══ GLB 인체 모델 ══ -->
      <a-entity
        gltf-model="/models/man.glb"
        scale="1.153 1.153 1.153"
        position="0 -2.864 0"
        rotation="0 180 0">
      </a-entity>
  
      <!-- ══ 근육 오버레이 ══ -->
      ${overlaysHTML}
    </a-entity>
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
    drag-rotate
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

export default function ExperiencePhase({ onComplete, isActive = true }) {
  const [activeEquipment, setActiveEquipment] = useState(null)
  const [activeMuscle, setActiveMuscle] = useState(null)
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setActiveEquipment(null)
      setActiveMuscle(null)
      setVideoOpen(false)
    }
  }, [isActive])

  const containerRef = useRef(null)

  // 터치/마우스 드래그로 3D 모델 회전 기능
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AFRAME && !window.AFRAME.components['drag-rotate']) {
      window.AFRAME.registerComponent('drag-rotate', {
        schema: { speed: { default: 0.5 } },
        init: function () {
          this.isDragging = false;
          this.previousPosition = { x: 0, y: 0 };
          this.targetEls = [];

          this.onPointerDown = this.onPointerDown.bind(this);
          this.onPointerMove = this.onPointerMove.bind(this);
          this.onPointerUp = this.onPointerUp.bind(this);

          const canvas = this.el.sceneEl.canvas;
          if (canvas) {
            canvas.addEventListener('mousedown', this.onPointerDown);
            canvas.addEventListener('touchstart', this.onPointerDown);
          } else {
            this.el.sceneEl.addEventListener('loaded', () => {
              this.el.sceneEl.canvas.addEventListener('mousedown', this.onPointerDown);
              this.el.sceneEl.canvas.addEventListener('touchstart', this.onPointerDown);
            });
          }
          
          window.addEventListener('mousemove', this.onPointerMove);
          window.addEventListener('touchmove', this.onPointerMove, { passive: false });
          window.addEventListener('mouseup', this.onPointerUp);
          window.addEventListener('touchend', this.onPointerUp);
        },
        updateTargetElements: function () {
          this.targetEls = Array.from(document.querySelectorAll('.rotatable-model'));
        },
        onPointerDown: function (evt) {
          if (evt.target.nodeName !== 'CANVAS') return;
          this.isDragging = true;
          this.updateTargetElements();
          const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
          const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
          this.previousPosition = { x: clientX, y: clientY };
        },
        onPointerMove: function (evt) {
          if (!this.isDragging) return;
          if (evt.touches) evt.preventDefault(); // 화면 스크롤 방지
          
          const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
          const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
          
          const deltaX = clientX - this.previousPosition.x;
          const deltaY = clientY - this.previousPosition.y;
          
          this.previousPosition = { x: clientX, y: clientY };

          this.targetEls.forEach(el => {
            const rotation = el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
            // 가로로 드래그하면 Y축 중심 회전, 세로로 드래그하면 X축 중심 회전
            el.setAttribute('rotation', {
              x: rotation.x + deltaY * this.data.speed,
              y: rotation.y + deltaX * this.data.speed,
              z: rotation.z
            });
          });
        },
        onPointerUp: function () {
          this.isDragging = false;
        },
        remove: function () {
          if (this.el.sceneEl && this.el.sceneEl.canvas) {
            this.el.sceneEl.canvas.removeEventListener('mousedown', this.onPointerDown);
            this.el.sceneEl.canvas.removeEventListener('touchstart', this.onPointerDown);
          }
          window.removeEventListener('mousemove', this.onPointerMove);
          window.removeEventListener('touchmove', this.onPointerMove);
          window.removeEventListener('mouseup', this.onPointerUp);
          window.removeEventListener('touchend', this.onPointerUp);
        }
      });
    }
  }, []);

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
        dangerouslySetInnerHTML={{
          __html: buildSceneHTML(equipmentList)
        }}
      />

      <div className="absolute inset-0 pointer-events-none z-50">

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

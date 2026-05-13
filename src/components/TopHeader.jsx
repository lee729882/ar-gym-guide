/**
 * 상단 헤더: 마커 인식 상태를 시각적으로 보여줌.
 * pointer-events-auto는 부모가 none이라서 명시적으로 켜야 클릭됨.
 */
export default function TopHeader({ equipmentName, detected, onClose }) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
      <div className="glass-dark flex items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            detected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
          }`}></span>
          <span className="text-sm font-medium">
            {detected ? `인식됨: ${equipmentName}` : '마커 인식 중...'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center
                     rounded-full bg-white/10 active:bg-white/20"
          aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  )
}

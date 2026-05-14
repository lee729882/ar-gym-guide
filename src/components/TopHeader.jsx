/**
 * 상단 헤더: 마커 인식 상태 표시 + 닫기.
 */
export default function TopHeader({ equipmentName, detected, onClose }) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
      <div className="bg-slate-900/85 backdrop-blur-md border border-white/10
                      flex items-center justify-between px-4 py-2.5 text-white rounded-2xl">
        <div className="flex items-center gap-2">
          {/* 상태 표시등 (인식 시 ping 애니메이션) */}
          <span className="relative flex w-2 h-2">
            {detected && (
              <span className="absolute inline-flex w-full h-full rounded-full
                               bg-emerald-400 opacity-75 animate-ping"></span>
            )}
            <span className={`relative inline-flex w-2 h-2 rounded-full ${
              detected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}></span>
          </span>
          <span className="text-xs font-medium">
            {detected ? equipmentName : '마커 인식 중'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full
                     bg-white/10 hover:bg-white/15 transition-colors"
          aria-label="닫기">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

/**
 * 하단 플로팅 바: 마커 인식 후에만 등장.
 * 핵심 동작 2가지만 노출 - 자세 영상, 운동 완료.
 */
export default function FloatingGuideBar({ equipment, onShowVideo, onComplete }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
      <div className="glass-dark text-white p-4 space-y-3">

        <div>
          <p className="text-xs text-white/60 mb-1">운동 팁 & 가이드</p>
          <p className="text-sm leading-relaxed">{equipment.tips}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onShowVideo}
            className="flex-1 bg-blue-500 active:bg-blue-600
                       py-3 rounded-xl font-bold text-sm
                       flex items-center justify-center gap-2">
            ▶ 올바른 자세 영상 보기
          </button>
          <button
            onClick={onComplete}
            className="flex-1 bg-amber-400 text-slate-900 active:bg-amber-500
                       py-3 rounded-xl font-bold text-sm">
            운동 완료
          </button>
        </div>
      </div>
    </div>
  )
}

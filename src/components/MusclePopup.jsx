/**
 * 근육 상세 팝업.
 * 바깥 영역 탭으로 닫기. 모달 안에서 e.stopPropagation으로 닫힘 방지.
 */
export default function MusclePopup({ muscle, equipment, onClose }) {
  const isPrimary = muscle.role === '주동근'
  const badgeClass = isPrimary
    ? 'bg-red-500/20 text-red-300 border-red-500/30'
    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'

  return (
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50
                 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div
        className="bg-slate-900 border border-white/10 text-white
                   rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        {/* 역할 배지 */}
        <div className={`inline-flex items-center gap-2 ${badgeClass} border
                         px-3 py-1 rounded-full text-xs font-medium`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isPrimary ? 'bg-red-500' : 'bg-amber-400'
          }`}></span>
          {muscle.role}
        </div>

        {/* 근육명 */}
        <h3 className="text-2xl font-bold tracking-tight">{muscle.name}</h3>

        {/* 주의사항 */}
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">운동 시 주의</p>
          <p className="text-sm text-slate-300 leading-relaxed">{equipment.tips}</p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.98]
                     py-3 rounded-xl text-sm font-medium transition-all">
          닫기
        </button>
      </div>
    </div>
  )
}

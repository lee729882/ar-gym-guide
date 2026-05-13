/**
 * 3D 근육 터치 시 팝업.
 * AR 화면을 가리되, 닫으면 즉시 복귀할 수 있도록 가볍게 처리.
 */
export default function MusclePopup({ muscle, equipment, onClose }) {
  const isPrimary = muscle.role === '주동근'

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-slate-800 text-white rounded-2xl w-full max-w-sm p-5 space-y-3"
           onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            isPrimary ? 'bg-red-500' : 'bg-yellow-400'
          }`}></span>
          <span className="text-xs text-white/60">{muscle.role}</span>
        </div>

        <h3 className="text-2xl font-bold">{muscle.name}</h3>

        <p className="text-sm text-white/80 leading-relaxed">
          {equipment.tips}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-white/10 active:bg-white/20 py-3 rounded-xl text-sm">
          닫기
        </button>
      </div>
    </div>
  )
}

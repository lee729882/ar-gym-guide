/**
 * 하단 가이드 바: 자극 근육 칩 + 운동 팁 + 액션 버튼.
 * 근육 칩을 탭하면 해당 근육의 상세 팝업이 뜸 (3D 모델 터치보다 터치 면적이 커서 모바일에서 안정적).
 */
export default function FloatingGuideBar({ equipment, onMuscleClick, onShowVideo, onComplete }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
      <div className="bg-slate-900/85 backdrop-blur-md border border-white/10
                      text-white rounded-2xl p-4 space-y-4">

        {/* 근육 칩들 */}
        <div className="flex flex-wrap gap-2">
          {equipment.primary.map(muscle => (
            <button
              key={muscle}
              onClick={() => onMuscleClick({ name: muscle, role: '주동근' })}
              className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40
                         hover:bg-red-500/30 text-red-200
                         px-3 py-1.5 rounded-full text-xs font-medium transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {muscle}
            </button>
          ))}
          {equipment.secondary.map(muscle => (
            <button
              key={muscle}
              onClick={() => onMuscleClick({ name: muscle, role: '협응근' })}
              className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30
                         hover:bg-amber-500/25 text-amber-200
                         px-3 py-1.5 rounded-full text-xs font-medium transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {muscle}
            </button>
          ))}
        </div>

        {/* 운동 팁 */}
        <p className="text-sm text-slate-300 leading-relaxed">{equipment.tips}</p>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={onShowVideo}
            className="flex-1 bg-white/10 hover:bg-white/15 text-white
                       py-3 rounded-xl text-sm font-medium
                       flex items-center justify-center gap-2 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            자세 영상 보기
          </button>
          <button
            onClick={onComplete}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950
                       py-3 rounded-xl text-sm font-semibold transition-colors">
            운동 완료
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 종료 단계: "끝났다"는 느낌을 명확히 주는 화면.
 * 발표 안내문 핵심: 요약 / 성취 / 다시하기 / 공유 중 하나는 반드시 있어야 함.
 */
export default function ExitPhase({ equipment, onRestart, onNext }) {
  // 마커 인식 없이 닫혔을 때는 단순 종료 화면
  if (!equipment) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <p className="mb-4">세션이 종료되었습니다</p>
        <button
          onClick={onRestart}
          className="bg-amber-400 text-slate-900 font-bold px-8 py-3 rounded-2xl">
          다시 시작
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 flex flex-col">

      {/* 성취 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-6xl">💪</div>
        <h2 className="text-3xl font-bold">완료!</h2>
        <p className="text-white/70">{equipment.name} 가이드를 마쳤습니다</p>

        {/* 자극한 근육 요약 */}
        <div className="glass w-full max-w-sm p-5 text-left space-y-3">
          <p className="text-xs text-white/60">오늘 자극한 근육</p>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="font-bold">주동근</span>
            <span className="text-white/70">{equipment.primary.join(', ')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="font-bold">협응근</span>
            <span className="text-white/70">{equipment.secondary.join(', ')}</span>
          </div>
          <p className="text-xs text-white/50 pt-2 border-t border-white/10">
            루틴: {equipment.routine}
          </p>
        </div>
      </div>

      {/* 다음 행동 유도 */}
      <div className="space-y-3 max-w-sm w-full mx-auto">
        <button
          onClick={onNext}
          className="w-full bg-amber-400 text-slate-900 font-bold py-4 rounded-2xl active:scale-95 transition-transform">
          다음 기구로 이동 →
        </button>
        <button
          onClick={onRestart}
          className="w-full bg-white/10 text-white py-3 rounded-2xl">
          처음 화면으로
        </button>
      </div>
    </div>
  )
}

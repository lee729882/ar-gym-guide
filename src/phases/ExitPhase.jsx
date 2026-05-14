/**
 * 종료 단계: 성취감 + 다음 행동 유도.
 */
export default function ExitPhase({ equipment, onRestart, onNext }) {
  if (!equipment) {
    return (
      <div className="fixed inset-0 bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-6 text-sm">세션이 종료되었습니다</p>
        <button
          onClick={onRestart}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold px-8 py-3 rounded-xl transition-colors">
          다시 시작
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-md mx-auto h-full flex flex-col px-6 py-8">

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          {/* 완료 아이콘 */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30
                          flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                 strokeLinejoin="round" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          {/* 헤딩 */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">완료했어요</h2>
            <p className="text-sm text-slate-400">{equipment.name} 가이드를 마쳤습니다</p>
          </div>

          {/* 자극 근육 요약 카드 */}
          <div className="w-full bg-slate-800/40 border border-white/10 rounded-2xl p-5 text-left space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">오늘 자극한 근육</p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span className="text-xs text-slate-400">주동근</span>
                </div>
                <p className="text-sm font-medium pl-3.5">{equipment.primary.join(', ')}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-xs text-slate-400">협응근</span>
                </div>
                <p className="text-sm font-medium pl-3.5">{equipment.secondary.join(', ')}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-slate-500">
                루틴 · <span className="text-slate-300">{equipment.routine}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-2">
          <button
            onClick={onNext}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950
                       font-semibold py-4 rounded-xl active:scale-[0.98] transition-all">
            다음 기구로 이동
          </button>
          <button
            onClick={onRestart}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300
                       py-3 rounded-xl text-sm transition-colors">
            처음으로
          </button>
        </div>
      </div>
    </div>
  )
}

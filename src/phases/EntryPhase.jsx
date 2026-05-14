/**
 * 입장 단계: 첫 5초 안에 무엇을 해야 하는지 명확히 보여줌.
 * 디자인 방향: 다크 모드, 따뜻한 앰버 액센트, 충분한 여백.
 */
export default function EntryPhase({ onStart }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-md mx-auto h-full flex flex-col justify-center px-6 py-8">

        {/* 히어로 아이콘 */}
        <div className="mb-10 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/30
                          flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                 strokeLinejoin="round" className="text-amber-400">
              <path d="M9 4h6l2 2h4a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1h4l2-2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>

        {/* 타이틀 */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AR 헬스 가이드</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            마커를 비추면 자극할 근육이 보입니다
          </p>
        </div>

        {/* 단계 안내 */}
        <ol className="space-y-5 mb-10">
          <li className="flex gap-4">
            <span className="flex-none w-7 h-7 rounded-full bg-slate-800
                             text-amber-400 text-xs font-semibold
                             flex items-center justify-center">1</span>
            <p className="text-sm text-slate-300 leading-relaxed pt-0.5">
              다음 화면에서 <span className="text-white font-medium">카메라 권한</span>을 허용해 주세요
            </p>
          </li>
          <li className="flex gap-4">
            <span className="flex-none w-7 h-7 rounded-full bg-slate-800
                             text-amber-400 text-xs font-semibold
                             flex items-center justify-center">2</span>
            <p className="text-sm text-slate-300 leading-relaxed pt-0.5">
              운동할 기구의 <span className="text-white font-medium">마커</span>를 카메라로 비춰주세요
            </p>
          </li>
          <li className="flex gap-4">
            <span className="flex-none w-7 h-7 rounded-full bg-slate-800
                             text-amber-400 text-xs font-semibold
                             flex items-center justify-center">3</span>
            <p className="text-sm text-slate-300 leading-relaxed pt-0.5">
              <span className="text-red-400 font-medium">빨간색</span>은 주동근,
              <span className="text-amber-300 font-medium"> 노란색</span>은 협응근입니다
            </p>
          </li>
        </ol>

        {/* CTA 버튼 */}
        <button
          onClick={onStart}
          className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-500
                     text-slate-950 font-semibold py-4 rounded-xl
                     active:scale-[0.98] transition-all">
          시작하기
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          처음 사용 시 브라우저가 카메라 권한을 요청합니다
        </p>
      </div>
    </div>
  )
}

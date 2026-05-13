/**
 * 입장 단계: 사용자가 첫 5초 안에 무엇을 해야 하는지 명확히 보여줌.
 * 발표 안내문의 핵심: "어디서 시작하고, 무엇을 보며, 무엇을 해야 하는지"
 */
export default function EntryPhase({ onStart }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">

        {/* 큰 안내 아이콘 자리 (실제론 SVG나 이미지) */}
        <div className="text-7xl">📷</div>

        <h1 className="text-2xl font-bold">AR 헬스 가이드</h1>

        <ol className="text-left space-y-3 bg-white/10 rounded-2xl p-5 text-sm">
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">1.</span>
            <span>다음 화면에서 <b>카메라 권한</b>을 허용해 주세요</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">2.</span>
            <span>운동할 기구의 <b>마커(QR 패턴)</b>를 비춰주세요</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-400">3.</span>
            <span>3D 인체 모델 위에 표시되는 <b>빨간색</b>이 오늘 자극할 근육입니다</span>
          </li>
        </ol>

        <button
          onClick={onStart}
          className="w-full bg-amber-400 text-slate-900 font-bold py-4 rounded-2xl active:scale-95 transition-transform"
        >
          시작하기
        </button>

        <p className="text-xs text-white/50">
          ※ 첫 사용 시 브라우저가 카메라 권한을 요청합니다
        </p>
      </div>
    </div>
  )
}

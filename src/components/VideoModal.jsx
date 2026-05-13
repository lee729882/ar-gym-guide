/**
 * 시범 영상 모달. 영상 파일이 없으면 placeholder로 보여줌.
 * 실제 영상은 public/videos/ 에 mp4 또는 gif로 넣으면 됨.
 */
export default function VideoModal({ videoUrl, onClose }) {
  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden"
           onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-bold">올바른 자세 시범</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center
                       rounded-full bg-white/10 text-white">
            ✕
          </button>
        </div>

        {/* aspect-video로 16:9 박스 유지 */}
        <div className="aspect-video bg-black flex items-center justify-center">
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none' }}>
          </video>
          <p className="absolute text-white/40 text-sm">
            영상 파일을 public/videos/ 에 추가하세요
          </p>
        </div>
      </div>
    </div>
  )
}

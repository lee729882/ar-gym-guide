/**
 * 시범 영상 모달.
 * public/videos/ 에 영상 파일을 추가하면 자동 재생.
 * 없으면 placeholder 텍스트 표시.
 */
export default function VideoModal({ videoUrl, onClose }) {
  // 유튜브 URL인지 확인하고 iframe용 embed URL로 변환
  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');
  let embedUrl = videoUrl;
  
  if (isYouTube && videoUrl) {
    let videoId = '';
    if (videoUrl.includes('/shorts/')) {
      videoId = videoUrl.split('/shorts/')[1].split('?')[0];
    } else if (videoUrl.includes('watch?v=')) {
      videoId = videoUrl.split('watch?v=')[1].split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    }
    // loop 속성을 위해 playlist 파라미터도 동일한 ID로 추가
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&playlist=${videoId}`;
  }

  return (
    <div
      className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50
                 flex items-center justify-center p-4"
      onClick={onClose}>
      <div
        className="bg-slate-900 border border-white/10 rounded-2xl
                   w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white text-sm font-medium">올바른 자세 시범</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full
                       bg-white/10 text-white hover:bg-white/15 transition-colors"
            aria-label="닫기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 영상 영역 */}
        <div className="aspect-video bg-black relative flex items-center justify-center">
          {isYouTube ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            ></iframe>
          ) : (
            <>
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none' }}>
              </video>
              <p className="absolute text-slate-500 text-xs -z-10">
                영상 파일을 public/videos/ 에 추가하세요
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

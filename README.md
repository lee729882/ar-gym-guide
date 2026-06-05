💪 AR Gym Guide: Web 기반 AR 헬스 기구 가이드
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![A-Frame](https://img.shields.io/badge/A--Frame-EF2D5E?style=for-the-badge&logo=a-frame&logoColor=white)
![AR.js](https://img.shields.io/badge/AR.js-FF6B35?style=for-the-badge&logo=javascript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
> **"기구 앞에서 스마트폰을 들면, 자극할 근육이 3D로 보입니다."**
> <br/>앱 설치 없이 브라우저만으로 실행되는 Web AR 헬스 가이드.
> 기구별 커스텀 마커를 인식하면 **Low-poly 3D 인체 모델** 위에 주동근·협응근이 실시간으로 하이라이트되며, 터치 드래그로 360° 탐색할 수 있는 **올인원 운동 자세 가이드**
🔗 배포 URL: https://ar-gym-guide.vercel.app
<br/>
📸 프로젝트 시연 (Screenshots)
시작 화면	AR 인식 (풀업)	AR 인식 (덤벨컬)	영상 모달
EntryPhase	광배근 하이라이트	이두근 하이라이트	YouTube 시범 영상
<br/>
📌 주요 기능 (Key Features)
🎯 기구별 Web AR 근육 시각화
`generate-patt.js`로 직접 생성한 커스텀 AR 마커(DC: 덤벨컬, PU: 풀업)를 카메라로 인식하면, Quaternius Low-poly GLB 인체 모델이 마커 위에 실시간 증강됨
`MUSCLE_OVERLAYS` 딕셔너리로 근육 11그룹(주동근 빨강·협응근 노랑)의 3D 좌표·크기·방향을 실기기 반복 테스트로 수동 캘리브레이션
🔄 터치 드래그 3D 회전 (drag-rotate)
A-Frame 커스텀 컴포넌트 `drag-rotate`를 직접 구현하여 사용자가 3D 인체 모델을 앞·뒤·옆 방향으로 자유롭게 탐색 가능
AR 마커 트래킹과 완전히 분리된 독립 회전 처리
▶️ YouTube 운동 시범 영상 모달
`자세 영상 보기` 버튼 클릭 시 기구별 올바른 운동 자세 YouTube 영상이 모달로 즉시 재생
📱 3단계 UX 플로우
`EntryPhase`(권한 안내) → `ExperiencePhase`(AR 체험) → `ExitPhase`(근육 요약)의 단방향 State Machine으로 명확한 사용 흐름 제공
<br/>
🛠 시스템 구조 (System Architecture)
React 기반 UI 레이어 위에 A-Frame + AR.js AR 엔진을 `dangerouslySetInnerHTML`로 단일 마운트하여 React 가상 DOM과 A-Frame WebComponent의 충돌 없이 공존하도록 설계했습니다.
```
[EntryPhase]  →  [ExperiencePhase]  →  [ExitPhase]
                      │
          ┌───────────┼────────────────┐
          │           │                │
    A-Frame Scene  MUSCLE_OVERLAYS  React UI
    (AR.js + GLB)  (11그룹 좌표)   (Popup / Modal)
          │
    drag-rotate
    (커스텀 컴포넌트)
```
<br/>
⚡ 기술적 도전 및 해결 (Troubleshooting)
1. GLB 모델 좌표계 분석 및 AR 정렬
Issue: Blender Z-up 좌표계로 저장된 `Man.glb`를 AR.js 마커 위에 세우면 모델이 뒤집히거나 지면 아래로 가라앉는 문제 발생
Solution:
`Python pygltflib`로 바운딩박스를 직접 추출 (`Y: 2.484 ~ 4.045`)하여 Blender Z-up 좌표계임을 확인
목표 신장 1.8m 기준 `scale=1.153`, 발 정렬을 위한 `position Y=-2.864`, 카메라 방향 보정을 위한 `rotation='0 180 0'`을 수치로 산출하여 적용
2. MUSCLE_OVERLAYS 수동 좌표 캘리브레이션
Issue: GLB 모델 위에 근육 오버레이를 올릴 때, 오버레이가 엉뚱한 위치에 렌더링되거나 모델 밖으로 벗어나는 문제
Solution:
`MUSCLE_OVERLAYS` 딕셔너리를 정의하고 `position(x y z)·radius·scale·rotation·mirror` 파라미터를 실기기 반복 테스트로 미세조정
`mirror: true` 속성 구현으로 광배근·삼각근·이두근 등 양측 근육의 X좌표 자동 반전 처리, 코드 중복 제거
3. A-Frame과 React 가상 DOM 충돌
Issue: React가 컴포넌트를 재렌더링할 때 `<a-scene>`이 DOM에 재삽입되어 AR.js 카메라 초기화가 중복 실행되고, 카메라 피드가 끊기는 문제 발생
Solution:
`useEffect` 내에서 `dangerouslySetInnerHTML`로 `<a-scene>`을 단 한 번만 마운트
React의 컴포넌트 생명주기와 A-Frame의 WebComponent 초기화를 완전히 분리하여 해결
<br/>
⚙️ 기술 스택 (Tech Stack)
Category	Technology
Language	JavaScript (ES6+)
Framework	React 18, Vite 6
AR / 3D	A-Frame 1.x, AR.js (Marker Tracking)
3D Asset	Quaternius Man.glb (CC0, poly.pizza)
Styling	TailwindCSS 3, CSS Glassmorphism
Deployment	Vercel (HTTPS, GitHub 연동 자동 배포)
Tools	generate-patt.js (커스텀 마커 생성), pygltflib (GLB 분석)
<br/>
📂 프로젝트 구조
```
src/
├── phases/
│   ├── EntryPhase.jsx       # 시작 화면 (카메라 권한 안내)
│   ├── ExperiencePhase.jsx  # AR 체험 화면 (핵심 로직)
│   └── ExitPhase.jsx        # 종료 화면 (근육 요약)
├── components/
│   ├── TopHeader.jsx        # 인식 기구명 헤더
│   ├── FloatingGuideBar.jsx # 하단 가이드 바
│   ├── MusclePopup.jsx      # 근육 상세 팝업
│   └── VideoModal.jsx       # YouTube 영상 모달
├── data/
│   └── equipment.js         # 기구별 근육 데이터 및 마커 설정
public/
└── models/
    └── man.glb              # Quaternius Low-poly 인체 모델
```
<br/>
🚀 실행 방법
```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행 (모바일 테스트 시 --host 필수)
npm run dev --host

# 3. HIRO 마커 또는 커스텀 마커(DC/PU)를 화면에 띄우고 접속
```
> ⚠️ 카메라 API는 **HTTPS 환경에서만 작동**합니다. 모바일 테스트 시 Vercel 배포 URL(`https://ar-gym-guide.vercel.app`)을 사용하세요.
<br/>
👤 개발자
이름	소속	역할
이승철	국립목포대학교 컴퓨터공학과	전체 설계 및 개발

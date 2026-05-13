# Web AR 헬스 가이드 - 스타터

기획서 기반 MVP 스타터 프로젝트.
입장(EntryPhase) → 진행(ExperiencePhase, AR) → 종료(ExitPhase) 3단계 구조로 작성됨.

---

## 0. 사전 준비 (10분)

### Node.js 설치 확인
```bash
node -v   # v18 이상이면 OK
npm -v
```
없다면 https://nodejs.org 에서 LTS 버전 설치.

### HIRO 마커 인쇄
첫 데모는 AR.js 기본 마커인 HIRO를 사용합니다.
- https://stemkoski.github.io/AR-Examples/markers/hiro.png 다운로드 후 A4로 인쇄
- 또는 휴대폰 화면에 띄워두고 다른 폰으로 비춰도 됨

---

## 1. 설치 (5분)

```bash
cd starter
npm install
```

---

## 2. 로컬 실행 (PC 브라우저에서 확인)

```bash
npm run dev
```
`http://localhost:5173` 열고 카메라 권한 허용.
HIRO 마커를 비추면 3D 스틱맨이 떠야 함.

---

## 3. 폰에서 테스트 ⚠️ 중요

**카메라는 HTTPS에서만 동작합니다.** 로컬 IP(http://192.168.x.x) 로는 iOS에서 안 됩니다.
다음 둘 중 하나:

### 방법 A: Vercel 무료 배포 (추천, 5분)
1. GitHub에 repo 만들고 푸시
2. https://vercel.com 가입 → "Import Project" → 해당 repo 선택
3. Framework Preset을 **Vite**로 자동 인식, Deploy 클릭
4. 생성된 `https://xxx.vercel.app` URL을 폰에서 열기

### 방법 B: ngrok (임시 터널)
```bash
npm install -g ngrok
npm run dev
# 새 터미널에서:
ngrok http 5173
```
ngrok이 제공하는 https URL을 폰에서 열기.

---

## 4. 코드 구조

```
src/
├── App.jsx                       ← phase 상태머신
├── phases/
│   ├── EntryPhase.jsx            ← 입장: 안내 + 시작 버튼
│   ├── ExperiencePhase.jsx       ← 진행: AR 메인 ⭐ 핵심
│   └── ExitPhase.jsx             ← 종료: 요약 + 다음
├── components/
│   ├── TopHeader.jsx
│   ├── FloatingGuideBar.jsx
│   ├── MusclePopup.jsx
│   └── VideoModal.jsx
└── data/
    └── equipment.js              ← 기구별 데이터
```

---

## 5. 다음 단계 - 발전시킬 부분

### (1) 진짜 3D 인체 모델로 교체
현재는 a-sphere/a-box로 만든 스틱맨. Sketchfab에서 CC0 라이선스 .glb 모델 받아서:
```jsx
<a-entity gltf-model="url(/models/body.glb)" position="0 0 0" scale="0.5 0.5 0.5"></a-entity>
```
public/models/ 에 파일 넣고 위처럼 사용.

### (2) 기구별 커스텀 마커
HIRO 말고 기구마다 다른 마커 쓰려면:
- https://ar-js-org.github.io/AR.js-Docs/marker-based/ 의 마커 생성기로 .patt 파일 만들기
- public/markers/bench-press.patt 으로 저장
- 코드에서 `preset="custom"` `url="/markers/bench-press.patt"` 사용

### (3) 시범 영상 추가
public/videos/bench-press.mp4 파일 넣기. 자동으로 모달에 로드됨.

### (4) 근육 색상을 동적으로 (선택)
지금은 색상이 하드코딩. 기구가 바뀌면 자동으로 다른 근육이 빨개지게 하려면 ExperiencePhase에서 equipment.primary 배열을 보고 ref로 모델 material을 바꾸는 로직 추가.

---

## 6. 발표 시연 시나리오 (30초)

1. **0-5초** EntryPhase: "시작하기" 누르며 권한 허용
2. **5-15초** ExperiencePhase: 마커 비추기 → 3D 인체 등장 → 빨간 가슴/노란 팔 강조
3. **15-22초** 가슴 터치 → 팝업 → 닫기, 자세 영상 버튼 → 모달 → 닫기
4. **22-30초** "운동 완료" → ExitPhase 요약 화면 → 다음 기구

이 흐름이 끊김 없이 한 번에 보여지면 발표는 성공.

---

## 7. 흔한 문제 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 폰에서 카메라가 안 켜짐 | HTTP 접속 | HTTPS 필수 (Vercel/ngrok) |
| 마커는 인식되는데 3D 모델 안 보임 | scale이 너무 작거나 큼 | scale="0.5 0.5 0.5" 부터 조정 |
| 마커가 자꾸 놓침 | 조명 반사, 패턴 흐림 | 무광 인쇄, 균일한 조명 |
| iOS Safari에서 검은 화면 | 카메라 권한 거부 | 설정 → Safari → 카메라 → 허용 |
| `a-scene`에서 React 경고 | custom element 인식 | 무시해도 됨 (작동에 영향 없음) |

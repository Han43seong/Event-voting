# 🗳️ 실시간 투표 시스템

행사장에서 사용할 수 있는 실시간 투표 웹 애플리케이션입니다.

## ✨ 주요 기능

### 참가자 기능 (/vote)
- 📱 모바일 최적화 투표 UI
- 🔒 중복 투표 방지 (세션 기반)
- ✅ 투표 완료 후 실시간 결과 확인 (옵션)
- 💡 직관적인 터치 인터페이스

### 관리자 기능 (/admin)
- 📝 투표 생성 (질문 + 최대 6개 선택지)
- 📊 실시간 투표 결과 차트
- ⏯️ 투표 시작/중지 제어
- 👁️ 결과 공개/비공개 설정
- 🔄 투표 초기화
- 📈 선택지별 득표수 및 비율 표시

## 🚀 빠른 시작

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: event-voting)
4. Google 애널리틱스는 선택사항 (비활성화 가능)

### 2. Firebase Realtime Database 설정

1. Firebase Console에서 좌측 메뉴 "빌드" → "Realtime Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 위치 선택 (asia-southeast1 추천)
4. 보안 규칙: **"테스트 모드에서 시작"** 선택
   - ⚠️ 일회성 행사용이므로 테스트 모드 사용
   - 행사 후에는 데이터베이스 삭제 권장

### 3. Firebase 설정 정보 가져오기

1. Firebase Console 프로젝트 설정 (⚙️ 아이콘)
2. "내 앱" 섹션에서 웹 앱 추가 (</>)
3. 앱 닉네임 입력 (예: Event Voting Web)
4. "Firebase SDK 스니펫" → "구성" 선택
5. 설정 정보 복사

### 4. 프로젝트에 Firebase 설정 적용

`src/firebase.js` 파일을 열고 Firebase 설정 정보를 입력하세요:

```javascript
const firebaseConfig = {
  apiKey: "여기에_API_KEY_입력",
  authDomain: "프로젝트ID.firebaseapp.com",
  databaseURL: "https://프로젝트ID-default-rtdb.firebaseio.com",
  projectId: "프로젝트ID",
  storageBucket: "프로젝트ID.appspot.com",
  messagingSenderId: "숫자",
  appId: "앱ID"
};
```

### 5. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 📦 배포하기

### Vercel 배포 (추천)

1. [Vercel](https://vercel.com) 가입/로그인
2. GitHub에 코드 업로드
3. Vercel에서 "New Project" → 저장소 선택
4. Framework Preset: **Vite** 선택
5. Deploy 클릭

### Netlify 배포

1. [Netlify](https://netlify.com) 가입/로그인
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 연결
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy 클릭

## 🎯 사용 방법

### 행사 전 준비
1. 관리자 페이지(`/admin`)에서 투표 생성
2. 투표 URL(`/vote`) QR 코드 생성
3. 행사장 스크린에 QR 코드 표시

### 행사 중
1. 참가자들이 QR 코드로 `/vote` 접속
2. 관리자는 `/admin`을 프로젝터에 연결
3. 투표 시작 버튼 클릭
4. 실시간으로 결과 모니터링

### 관리자 로그인
- 기본 비밀번호: `admin1234`
- 배포 전 `src/pages/HomePage.jsx`에서 비밀번호 변경 권장

## 🔧 커스터마이징

### 디자인 색상 변경
각 페이지의 CSS 파일에서 색상 변경 가능:
- `src/pages/HomePage.css`
- `src/pages/VotePage.css`
- `src/pages/AdminPage.css`

기본 그라데이션 색상:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 관리자 비밀번호 변경
`src/pages/HomePage.jsx` 파일:
```javascript
if (password === 'admin1234') {  // 여기를 변경
  navigate('/admin');
}
```

## 📱 접속 URL 구조

- `/` - 메인 (참가자/관리자 선택)
- `/vote` - 투표 참여 페이지 (모바일 최적화)
- `/admin` - 관리자 대시보드 (PC/태블릿 최적화)

## ⚠️ 주의사항

### 보안
- Firebase를 테스트 모드로 사용 중이므로 **행사 후 즉시 데이터베이스 삭제** 필요
- 관리자 비밀번호를 반드시 변경하세요
- 일회성 행사용이므로 프로덕션 보안 설정은 적용되지 않았습니다

### 성능
- 100명 동시 접속은 Firebase 무료 플랜으로 충분
- 실시간 업데이트로 자동 새로고침 불필요

### 중복 투표 방지
- 현재는 세션 기반으로 구현 (브라우저 재시작 시 초기화)
- 더 강력한 방지가 필요한 경우:
  - IP 기반 제한 추가
  - 디바이스 ID 활용
  - 이메일/전화번호 인증

## 🛠️ 기술 스택

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Database**: Firebase Realtime Database
- **Charts**: Recharts
- **Styling**: CSS Modules

## 📝 라이선스

MIT License - 자유롭게 사용 및 수정 가능

## 🤝 문의

행사에서 성공적으로 사용하세요! 🎉

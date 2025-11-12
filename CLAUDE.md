# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

React + Vite + Firebase Realtime Database로 구축된 행사용 실시간 투표 시스템. 세션 기반 중복 투표 방지로 100명 이상의 동시 사용자 지원.

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 코드 린트
npm run lint

# 프로덕션 빌드 미리보기
npm run preview
```

## 아키텍처

### 라우트 구조
- `/` - [HomePage.jsx](src/pages/HomePage.jsx) - 참가자/관리자 선택 랜딩 페이지
- `/vote` - [VotePage.jsx](src/pages/VotePage.jsx) - 모바일 최적화 투표 인터페이스
- `/admin` - [AdminPage.jsx](src/pages/AdminPage.jsx) - 실시간 차트가 있는 관리자 대시보드

### Firebase 통합
- **설정**: [src/firebase.js](src/firebase.js) - Firebase 프로젝트 인증 정보로 업데이트 필요
- **데이터베이스 구조**: Realtime Database의 단일 `currentPoll` 노드
  ```
  currentPoll/
    ├── question: string
    ├── isActive: boolean
    ├── showResults: boolean
    ├── totalVotes: number
    ├── createdAt: timestamp
    └── options: array
        └── [index]
            ├── text: string
            └── votes: number
  ```

### 상태 관리
- **투표 방지**: sessionStorage 키 `hasVoted` (브라우저 재시작 시 초기화됨)
- **실시간 업데이트**: VotePage와 AdminPage 모두에서 Firebase `onValue()` 리스너 사용
- **원자적 트랜잭션**: 경쟁 상태 방지를 위해 `runTransaction()`으로 투표 수 집계

### 관리자 인증
- [HomePage.jsx:12](src/pages/HomePage.jsx#L12)에 하드코딩된 비밀번호 체크
- 현재 비밀번호: `hshs0508` (참고: README는 `admin1234`를 표시하지만 실제 코드는 `hshs0508` 사용)
- 배포 전 비밀번호 변경 필요

## 주요 구현 세부사항

### 투표 트랜잭션 흐름
1. 사용자가 선택지 선택 → [VotePage.jsx:30](src/pages/VotePage.jsx#L30) `handleVote()`
2. `runTransaction()`을 사용한 `options[index].votes` 원자적 증가
3. `totalVotes` 원자적 증가
4. `sessionStorage.hasVoted` 플래그 설정
5. `poll.showResults === true`인 경우 UI가 결과 뷰로 전환

### 관리자 대시보드 기능
- 투표 생성: 질문 + 2-6개 선택지
- 투표 활성/비활성 상태 토글
- 참가자에게 결과 표시/숨김 토글
- Recharts 라이브러리를 사용한 실시간 막대 차트
- 현재 투표 초기화/삭제

### 모바일 우선 디자인
- VotePage: 큰 터치 영역, 세로 레이아웃
- AdminPage: 차트가 있는 데스크톱/태블릿 최적화
- CSS 그라데이션 테마: `#667eea`에서 `#764ba2`

## 중요 사항

### 보안 고려사항
- Firebase는 테스트 모드로 구성됨 (보안 규칙 없음) - 일회성 행사용으로만 적합
- 관리자 비밀번호는 클라이언트 측에만 존재 (백엔드 검증 없음)
- firebase.js의 API 키는 공개됨 (클라이언트 측 앱) - 코드가 아닌 Firebase 규칙으로 보안 유지

### 투표 무결성
- 세션 기반 방지만 사용 (브라우저 재시작 시 초기화)
- 더 엄격한 제어가 필요한 경우 IP 추적 또는 디바이스 지문 구현

### Firebase 설정 필요
1. console.firebase.google.com에서 Firebase 프로젝트 생성
2. Realtime Database 활성화 (asia-southeast1 권장)
3. [src/firebase.js](src/firebase.js)에 인증 정보 업데이트
4. 행사용으로 테스트 모드 규칙 사용, 행사 후 데이터베이스 삭제

## 배포
- Vite 빌드는 `dist/`로 출력
- Vercel, Netlify (정적 호스팅) 호환
- 환경 변수 필요 없음 (firebase.js에 설정 하드코딩)
- 선택사항: [.env.example](.env.example)에 표시된 대로 Vite 환경 변수 (VITE_FIREBASE_*) 사용 가능

# Firebase 설정 가이드

## 1단계: Firebase 프로젝트 만들기

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: event-voting-2024)
4. Google 애널리틱스 비활성화 (선택사항)
5. "프로젝트 만들기" 클릭

## 2단계: Realtime Database 설정

1. 좌측 메뉴에서 "빌드" → "Realtime Database" 선택
2. "데이터베이스 만들기" 클릭
3. 데이터베이스 위치 선택:
   - 한국: asia-southeast1 (싱가포르) 추천
   - 일본: asia-northeast1
4. 보안 규칙: **"테스트 모드에서 시작"** 선택
   - 주의: 일회성 행사용이므로 테스트 모드 사용
   - 행사 종료 후 데이터베이스 삭제 필요

## 3단계: 웹 앱 등록

1. Firebase Console 프로젝트 설정 (⚙️ 아이콘)
2. "일반" 탭 선택
3. "내 앱" 섹션에서 웹 아이콘 (</>) 클릭
4. 앱 닉네임 입력: "Event Voting Web"
5. "Firebase Hosting 설정" 체크 해제
6. "앱 등록" 클릭

## 4단계: Firebase 설정 정보 복사

"Firebase SDK 스니펫" 섹션에서:
1. "구성" 선택 (npm 아님!)
2. firebaseConfig 객체 내용 복사

예시:
```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "event-voting-2024.firebaseapp.com",
  databaseURL: "https://event-voting-2024-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "event-voting-2024",
  storageBucket: "event-voting-2024.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
}
```

## 5단계: 프로젝트에 설정 적용

1. `src/firebase.js` 파일 열기
2. firebaseConfig 객체의 내용을 복사한 설정으로 교체
3. 파일 저장

## 보안 규칙 설정 (테스트 모드)

Firebase Console → Realtime Database → "규칙" 탭:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **주의**: 이 설정은 누구나 읽고 쓸 수 있습니다. 일회성 행사용으로만 사용하고 행사 종료 후 즉시 데이터베이스를 삭제하세요.

## 행사 후 정리

1. Firebase Console → Realtime Database
2. 데이터베이스 설정 (⚙️) → "데이터베이스 삭제"
3. 또는 프로젝트 전체 삭제: 프로젝트 설정 → "프로젝트 삭제"

## 문제 해결

### "Permission denied" 오류
- Realtime Database 규칙이 테스트 모드인지 확인
- databaseURL이 올바른지 확인

### 데이터가 저장되지 않음
- Firebase 설정이 올바르게 입력되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### CORS 오류
- Firebase는 자동으로 CORS를 처리하므로 발생하지 않아야 함
- apiKey가 올바른지 재확인

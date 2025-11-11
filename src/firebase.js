import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase 설정 (사용자가 자신의 Firebase 프로젝트 정보로 교체해야 함)
const firebaseConfig = {
  apiKey: "AIzaSyCkVQBPQBDnKvDKbQDE5JfqgrKc7f7xsaw",
  authDomain: "event-voting-830fd.firebaseapp.com",
  databaseURL: "https://event-voting-830fd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "event-voting-830fd",
  storageBucket: "event-voting-830fd.firebasestorage.app",
  messagingSenderId: "780964887167",
  appId: "1:780964887167:web:365f4fc035b5860cd31d4a",
  measurementId: "G-JWNFR7NL7S"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

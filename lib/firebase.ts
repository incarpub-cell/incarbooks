// 파일: lib/firebase.ts  (Firestore 연결 안정화 버전)
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// 환경 변수에서 개행·따옴표 등을 정리하는 헬퍼
const sanitizeEnv = (val: string | undefined) =>
  val?.replace(/[\r\n"']/g, '').trim() || undefined;

const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (firebaseConfig.apiKey) {
  try {
    const app: FirebaseApp =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // 핵심 변경: long polling 강제.
    // 일부 네트워크/백신/프록시가 Firestore 기본 연결(WebChannel 스트리밍)을 붙잡아 두면
    // 연결은 열렸는데 응답이 안 와서 "client is offline"이 되고, 쓰기(addDoc 등)가 끝나지 않는다.
    // long polling은 이런 환경에서도 동작한다.
    try {
      db = initializeFirestore(app, { experimentalForceLongPolling: true });
    } catch {
      // 이미 초기화된 경우(개발 중 핫리로드 등)에는 기존 인스턴스를 사용
      db = getFirestore(app);
    }

    auth = getAuth(app);
    storage = getStorage(app);

    console.log('✅ Firebase initialized', {
      projectId: firebaseConfig.projectId,
      dbInitialized: !!db,
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase config missing apiKey – Firebase not initialized');
}

export { db, auth, storage };

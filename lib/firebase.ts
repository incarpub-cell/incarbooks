import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const sanitizeEnv = (val: string | undefined) => val?.replace(/[\r\n"']/g, '').trim() || undefined;

const firebaseConfig = {
    apiKey: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// Only initialize Firebase if we have a valid API key (avoids build-time crashes)
let db: Firestore | null = null;
let auth: Auth | null = null;

if (firebaseConfig.apiKey) {
    try {
        const app: FirebaseApp = getApps().length === 0
            ? initializeApp(firebaseConfig)
            : getApps()[0];
        db = getFirestore(app);
        auth = getAuth(app);
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

export { db, auth };

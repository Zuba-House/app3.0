import { initializeApp, getApps } from 'firebase/app';

// zubahouse-admin-backend — Firebase web app (zuba-house-019)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let firebaseApp = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('Firebase initialization skipped:', err?.message || err);
  }
}

export { firebaseApp };

/** Lazy auth — avoids crashing the app when Firebase env vars are missing. */
export async function getFirebaseAuth() {
  if (!firebaseApp) return null;
  const { getAuth } = await import('firebase/auth');
  return getAuth(firebaseApp);
}

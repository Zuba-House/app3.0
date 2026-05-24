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

const appIdProjectNumber = firebaseConfig.appId?.split(':')[1];

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

/** Mismatched Vercel env (apiKey from one web app, appId from another) breaks Google sign-in. */
export const isFirebaseConfigConsistent = Boolean(
  isFirebaseConfigured &&
    appIdProjectNumber &&
    firebaseConfig.messagingSenderId &&
    appIdProjectNumber === firebaseConfig.messagingSenderId
);

let firebaseApp = null;

if (isFirebaseConfigured && !isFirebaseConfigConsistent) {
  console.error(
    'Firebase env mismatch: VITE_FIREBASE_APP_ID and VITE_FIREBASE_MESSAGING_SENDER_ID must be from the same web app. ' +
      'Update Vercel env vars from admin/.env.example and redeploy.'
  );
}

if (isFirebaseConfigured && isFirebaseConfigConsistent) {
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

const VITE_FIREBASE_APP_API_KEY = import.meta.env.VITE_FIREBASE_APP_API_KEY;
const VITE_FIREBASE_APP_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_APP_AUTH_DOMAIN;
const VITE_FIREBASE_APP_PROJECT_ID = import.meta.env.VITE_FIREBASE_APP_PROJECT_ID;
const VITE_FIREBASE_APP_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_APP_STORAGE_BUCKET;
const VITE_FIREBASE_APP_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_APP_MESSAGING_SENDER_ID;
const VITE_FIREBASE_APP_APP_ID = import.meta.env.VITE_FIREBASE_APP_APP_ID;

import { initializeApp } from "firebase/app";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: VITE_FIREBASE_APP_API_KEY || 'demo-api-key',
  authDomain: VITE_FIREBASE_APP_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: VITE_FIREBASE_APP_PROJECT_ID || 'demo-project',
  storageBucket: VITE_FIREBASE_APP_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: VITE_FIREBASE_APP_MESSAGING_SENDER_ID || '123456',
  appId: VITE_FIREBASE_APP_APP_ID || '1:123456:web:abc'
};

// Initialize Firebase (with fallback for missing config)
let firebaseApp = null;
try {
  if (VITE_FIREBASE_APP_API_KEY) {
    firebaseApp = initializeApp(firebaseConfig);
  }
} catch (e) {
  console.warn('Firebase initialization skipped:', e.message);
}

export { firebaseApp };
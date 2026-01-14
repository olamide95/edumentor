import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDIHrhYMLr17OvI2vs6ntf_mV_qrG7LLU4",
  authDomain: "edumentor-401e3.firebaseapp.com",
  projectId: "edumentor-401e3",
  storageBucket: "edumentor-401e3.firebasestorage.app",
  messagingSenderId: "612469876248",
  appId: "1:612469876248:web:62c562208d915b67f2856d",
  measurementId: "G-Q1FJ96FVTG"
};

// Initialize Firebase
let firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export default firebaseApp;
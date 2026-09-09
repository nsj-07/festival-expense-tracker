import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGDe47YBBiwneJ4GQ6_kvKL7kBog2dEPs",
  authDomain: "festival-tracker-fc131.firebaseapp.com",
  projectId: "festival-tracker-fc131",
  storageBucket: "festival-tracker-fc131.firebasestorage.app",
  messagingSenderId: "62817578802",
  appId: "1:62817578802:web:ba478e422da2422251f12b",
  measurementId: "G-ZYZKBGFC5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with Multi-Tab Offline Persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});

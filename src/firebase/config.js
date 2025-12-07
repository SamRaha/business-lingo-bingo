import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqPgO3oeGy8e0Wvb5UkPKf_tbTPIR0S3o",
  authDomain: "business-lingo-bingo-2f4fe.firebaseapp.com",
  projectId: "business-lingo-bingo-2f4fe",
  storageBucket: "business-lingo-bingo-2f4fe.firebasestorage.app",
  messagingSenderId: "600231026362",
  appId: "1:600231026362:web:ee73e076c7c0e166916c83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
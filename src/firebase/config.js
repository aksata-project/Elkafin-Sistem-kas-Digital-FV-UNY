import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const devFirebaseConfig = {
    apiKey: "AIzaSyBX9ry7AySb7UHF0hlQgjeAiZcNf2ysR1A",
    authDomain: "elkafin-3829a.firebaseapp.com",
    projectId: "elkafin-3829a",
    storageBucket: "elkafin-3829a.firebasestorage.app",
    messagingSenderId: "48821569422",
    appId: "1:48821569422:web:0e6097d92795fc19e3c6df",
    measurementId: "G-S97XRSN8J9"
};

const firebaseConfig = devFirebaseConfig;

console.warn("🟢 MODE DEVELOPMENT AKTIF - Terhubung ke Database Dev (elkafin-3829a)");

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();


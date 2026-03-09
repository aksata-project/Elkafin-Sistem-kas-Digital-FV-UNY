import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA6OoKEDECUhf9kzTXPDVybXQnx3Oor9xM",
    authDomain: "elka-financial-app.firebaseapp.com",
    projectId: "elka-financial-app",
    storageBucket: "elka-financial-app.appspot.com",
    messagingSenderId: "754443991037",
    appId: "1:754443991037:web:62f9b95b4a39370577cb94"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: "hamstar-40e17.firebaseapp.com",
  projectId: "hamstar-40e17",
  storageBucket: "hamstar-40e17.firebasestorage.app",
  messagingSenderId: "1008976262348",
  appId: "1:1008976262348:web:86f1ee4b533ca882473e69",
  measurementId: "G-D48N4P2RHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
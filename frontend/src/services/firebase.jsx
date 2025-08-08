import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnvmioj7XjQKvaJ2XbRVGHTez6QETVyuk",
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
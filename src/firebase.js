
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";  
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYArO4wPUyW60I_hrBRz4WIXT7SWhY9Tg",
  authDomain: "pulse-point-1af37.firebaseapp.com",
  projectId: "pulse-point-1af37",
  storageBucket: "pulse-point-1af37.firebasestorage.app",
  messagingSenderId: "1070273196779",
  appId: "1:1070273196779:web:0d7595f7559f69466844ae",
  measurementId: "G-X9LXRNPG8V"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
export const db = getFirestore(app);

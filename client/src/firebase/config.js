// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEqWB6Rb6dMusF7WzSB80_ISkSHo_4V-w",
  authDomain: "auto24-ar.firebaseapp.com",
  projectId: "auto24-ar",
  storageBucket: "auto24-ar.firebasestorage.app",
  messagingSenderId: "31185639165",
  appId: "1:31185639165:web:d04b878e1e04dface5d094",
  measurementId: "G-538H1DDHPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
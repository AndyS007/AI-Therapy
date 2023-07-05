// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, signInWithEmailAndPassword, signOut, GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithPopup} from "firebase/auth";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAi9xwMSL4ZkBTJGV1LlxGgtqPlsEN2ZTI",
  authDomain: "petamory-dev.firebaseapp.com",
  databaseURL:
    "https://petamory-dev-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "petamory-dev",
  storageBucket: "petamory-dev.appspot.com",
  messagingSenderId: "385270964130",
  appId: "1:385270964130:web:19c464d869f7e452181cfb",
  measurementId: "G-KGWKWVKWLW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export const signInUser = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
}

export const signUpUser = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
}

export const signInWithGoogle = () => {
    return signInWithPopup(auth, provider);
}

export const signOutUser = () => {
  return signOut(auth);
}

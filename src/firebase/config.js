// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDG524W5nxpWtk5vs_p_FUEQn_NJp1oo-w",
  authDomain: "nearby-pm-20a9e.firebaseapp.com",
  projectId: "nearby-pm-20a9e",
  storageBucket: "nearby-pm-20a9e.appspot.com",
  messagingSenderId: "328272019093",
  appId: "1:328272019093:web:50c5d0cc6548d65ac2e59c",
  measurementId: "G-7MX2YTJ1SE",
};

// Initialize Firebase
initializeApp(firebaseConfig);

const functions = getFunctions();

const db = getFirestore()

export { functions, db };


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
//for accessing the firestore database
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAEywUkDc7Hf25dBtex0Nc_fzMteQZoi8k",
  authDomain: "blockchain-hem.firebaseapp.com",
  projectId: "blockchain-hem",
  storageBucket: "blockchain-hem.firebasestorage.app",
  messagingSenderId: "462739984623",
  appId: "1:462739984623:web:6843df9e6dde52d70a4b1a",
  measurementId: "G-PJJK9FG6FJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
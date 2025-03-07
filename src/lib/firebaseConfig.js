// lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBIGD99Q4TZfLTmCG9cZipdv0xLcrZ9m2A",
    authDomain: "bevgo-returnable-tracke-kfgzl2.firebaseapp.com",
    projectId: "bevgo-returnable-tracke-kfgzl2",
    storageBucket: "bevgo-returnable-tracke-kfgzl2.firebasestorage.app",
    messagingSenderId: "1096122008552",
    appId: "1:1096122008552:web:26da0becf914f2d78f9a5d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Authentication

export { db, auth };

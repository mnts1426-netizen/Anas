import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";

// إعدادات Firebase الخاصة بمشروعك (anas-3e236)
const firebaseConfig = {
  apiKey: "AIzaSyBKWaKvTPlbi7AgU72oCcAyC-ZHl29u_RI",
  authDomain: "anas-3e236.firebaseapp.com",
  projectId: "anas-3e236",
  storageBucket: "anas-3e236.firebasestorage.app",
  messagingSenderId: "424870653268",
  appId: "1:424870653268:web:ffd845a9eefbd783086cc1",
  measurementId: "G-0GF476E3T0"
};

// تهيئة المشروع
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, collection, getDocs, addDoc, updateDoc, doc, query, where, onAuthStateChanged, signInWithEmailAndPassword, signOut };
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0RpSF2FGvGQLC0qGAR4vR7GaQKWFGKpE",
  authDomain: "starrysky-77610.firebaseapp.com",
  projectId: "starrysky-77610",
  storageBucket: "starrysky-77610.firebasestorage.app",
  messagingSenderId: "683351652563",
  appId: "1:683351652563:web:daad932cf52af836b67c26",
  measurementId: "G-8GW11Z2MTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Example: Load puzzles
async function loadPuzzles() {
  const snapshot = await getDocs(collection(db, "puzzles"));
  snapshot.forEach(doc => {
    console.log(doc.id, " => ", doc.data());
  });
}

loadPuzzles();


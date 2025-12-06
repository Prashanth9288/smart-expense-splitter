import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDAg4ztB_ELgIjPAipSPR6NgkVjAEsvGTw",
  authDomain: "rudo-wealth-819eb.firebaseapp.com",
  databaseURL: "https://rudo-wealth-819eb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rudo-wealth-819eb",
  storageBucket: "rudo-wealth-819eb.firebasestorage.app",
  messagingSenderId: "495874705202",
  appId: "1:495874705202:web:3de128c252a29c7490392b",
  measurementId: "G-8331QPZ2DZ"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

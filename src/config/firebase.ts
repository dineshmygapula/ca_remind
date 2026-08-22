import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAn6Ugs-Pk9CeeNUNVw39N7PKcPGsXkzLg",
  authDomain: "remindca.firebaseapp.com",
  projectId: "remindca",
  storageBucket: "remindca.appspot.com",
  messagingSenderId: "162055898279",
  appId: "1:162055898279:android:dae80a1a9f37b3eb9d0782",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
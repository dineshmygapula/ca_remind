// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAn6Ugs-Pk9CeeNUNVw39N7PKcPGsXkzLg",
    authDomain: "remindca.firebaseapp.com",
    projectId: "remindca",
    storageBucket: "remindca.appspot.com",
    messagingSenderId: "162055898279",
    appId: "1:162055898279:android:dae80a1a9f37b3eb9d0782",
};
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApps()[0];

export const adminAuth = getAuth(app);
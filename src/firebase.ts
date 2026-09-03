import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDNFpP70xh6upj_FlGfhsoTm-NFZq28MYs",
  authDomain: "divachic123-7e2c9.firebaseapp.com",
  projectId: "divachic123-7e2c9",
  storageBucket: "divachic123-7e2c9.firebasestorage.app",
  messagingSenderId: "407806871673",
  appId: "1:407806871673:web:dd9702578b36ebfa9c2ca8",
  measurementId: "G-JGWMX68JYX"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export let analytics: Analytics | any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics not supported in this environment:", err);
  });
}

export { app };


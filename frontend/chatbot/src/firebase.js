// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const isE2EAuthEnabled = import.meta.env.VITE_E2E_AUTH === "true";

const firebaseConfig = isE2EAuthEnabled
  ? {
      apiKey: "e2e-api-key",
      authDomain: "e2e.localhost",
      projectId: "e2e-project",
      storageBucket: "e2e-project.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:e2e",
      measurementId: "G-E2E",
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const analytics = isE2EAuthEnabled ? null : getAnalytics(app);

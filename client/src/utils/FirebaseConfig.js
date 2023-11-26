// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCi9RnKGlQ_OjkXcIG1v1I3CkzJD_x7BdI",
  authDomain: "my-whatsapp-bee6c.firebaseapp.com",
  projectId: "my-whatsapp-bee6c",
  storageBucket: "my-whatsapp-bee6c.appspot.com",
  messagingSenderId: "675303376529",
  appId: "1:675303376529:web:b5c31012b3dfd33329e130",
  measurementId: "G-8QJVHDKVPH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const firebaseAuth = getAuth(app);

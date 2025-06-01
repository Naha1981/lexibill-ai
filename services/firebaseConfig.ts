// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHPYMvynlovPTKafhU3ylU-RW74lNzng8",
  authDomain: "lexibill-ai.firebaseapp.com",
  projectId: "lexibill-ai",
  storageBucket: "lexibill-ai.firebasestorage.app",
  messagingSenderId: "226217940474",
  appId: "1:226217940474:web:a90f91d402b1ab2ad90043",
  measurementId: "G-QVN5D4PN94"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

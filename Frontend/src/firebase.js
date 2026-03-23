import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCCjhThDQuoF5XO8pFZFt51JbXdpD9mbhk",
  authDomain: "ontask-c8d08.firebaseapp.com",
  projectId: "ontask-c8d08",
  storageBucket: "ontask-c8d08.firebasestorage.app",
  messagingSenderId: "524549832040",
  appId: "1:524549832040:web:41ce11f36f77c477f1aadd",
  measurementId: "G-48PN32JJ6R"
};

const app = initializeApp(firebaseConfig);

let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging not supported:", error);
}

export { app, messaging };

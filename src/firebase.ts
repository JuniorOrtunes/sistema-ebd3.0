import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEM0xPhpOJEDg6yDMaBI7Vk-CMp6v1yBI",
  authDomain: "sistema-ebd-3.firebaseapp.com",
  projectId: "sistema-ebd-3",
  storageBucket: "sistema-ebd-3.firebasestorage.app",
  messagingSenderId: "38826502840",
  appId: "1:38826502840:web:f2d932fdeb2030bedba24d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
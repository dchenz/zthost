import { initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_NnInIsJNlZPwvTXexBS9dkl47p3nAes",
  authDomain: "zthost-firebase.firebaseapp.com",
  projectId: "zthost-firebase",
  storageBucket: "zthost-firebase.appspot.com",
  messagingSenderId: "203474789030",
  appId: "1:203474789030:web:022d2e12925531854b8a67",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.setPersistence(inMemoryPersistence);
export const fstore = getFirestore(app);

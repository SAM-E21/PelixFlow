
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "pelixflow",
  appId: "1:682405280325:web:c20ffec8db0a00041a812c",
  storageBucket: "pelixflow.firebasestorage.app",
  apiKey: "AIzaSyDUF3FAafwHKDJUm5gj0euJYHQtAJg17DU",
  authDomain: "pelixflow.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "682405280325",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
try {
    enableIndexedDbPersistence(db);
} catch (err: any) {
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence.');
    }
}


export { app, auth, db, storage };

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDIf9Iz8dd6rnC_v2oSfLmVn5ecwxd0FIE",
    authDomain: "db-sertifikat.firebaseapp.com",
    projectId: "db-sertifikat",
    storageBucket: "db-sertifikat.firebasestorage.app",
    messagingSenderId: "891565855827",
    appId: "1:891565855827:web:6d3d0bd2d8bcbfd10f62a6",
    measurementId: "G-QHSWD4LTFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
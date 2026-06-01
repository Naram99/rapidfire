// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBEFVMytz9tBMujzyknPqQFbGAPuqbqAok",
    authDomain: "rapidfire-6d629.firebaseapp.com",
    databaseURL:
        "https://rapidfire-6d629-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "rapidfire-6d629",
    storageBucket: "rapidfire-6d629.firebasestorage.app",
    messagingSenderId: "1043317421564",
    appId: "1:1043317421564:web:e69effc71c38bc84e72e79",
    measurementId: "G-RZP904ZDCQ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

import firebase from "firebase/compat/app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export const firebaseConfig = {
  apiKey: "AIzaSyASSrM0qPoWRnB7lZE5-Hl98yb6Mo9XYYc",
  authDomain: "orders-78c1c.firebaseapp.com",
  databaseURL: "https://orders-78c1c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "orders-78c1c",
  storageBucket: "orders-78c1c.appspot.com",
  messagingSenderId: "604190082036",
  appId: "1:604190082036:web:505488318b424555daefa1",
  measurementId: "G-3P0YBJ9FP6",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();

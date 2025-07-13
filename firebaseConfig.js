import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyASSrM0qPoWRnB7lZE5-Hl98yb6Mo9XYYc",
  authDomain: "orders-78c1c.firebaseapp.com",
  databaseURL: "https://orders-78c1c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "orders-78c1c",
  storageBucket: "orders-78c1c.appspot.com",
  messagingSenderId: "604190082036",
  appId: "1:604190082036:web:505488318b424555daefa1",
  measurementId: "G-3P0YBJ9FP6",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

const db = getFirestore(app);
const database = getDatabase(app);

export { app, auth, db, database };

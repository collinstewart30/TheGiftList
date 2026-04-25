// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
// @ts-ignore: getReactNativePersistence exists in the RN bundle
// but is often missing from public TypeScript definitions.
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhAj4Thujf_DHaOW3BPN-fbpo1jwdOE2Y",
  authDomain: "thegiftlist-49b94.firebaseapp.com",
  projectId: "thegiftlist-49b94",
  storageBucket: "thegiftlist-49b94.firebasestorage.app",
  messagingSenderId: "381626411663",
  appId: "1:381626411663:web:35815ec9f7227d129f5efa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

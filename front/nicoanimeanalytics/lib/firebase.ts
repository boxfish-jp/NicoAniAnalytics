const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

import { initializeApp } from "firebase-admin/app";
initializeApp(firebaseConfig);
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

const main = async () => {
  const data = await db.collection("dbConfig").doc("NowSeason").get();
  console.log(data);
};

main();

export default db;

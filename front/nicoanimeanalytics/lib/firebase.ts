import admin from "firebase-admin";
import { cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = require("@/serviceAccountKey.json");
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: cert(serviceAccount),
  });
}

export const db = getFirestore();

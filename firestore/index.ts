import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firebase-git-action.firebaseio.com"
});

export const db = getFirestore();

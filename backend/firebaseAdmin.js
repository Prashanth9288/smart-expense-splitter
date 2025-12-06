const admin = require('firebase-admin');
require('dotenv').config();


const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'rudo-wealth-819eb', 
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };

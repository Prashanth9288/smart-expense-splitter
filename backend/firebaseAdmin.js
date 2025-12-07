const admin = require('firebase-admin');
require('dotenv').config();


// Try to get credentials from environment variable first (for Render)
let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        serviceAccount = require('./serviceAccountKey.json');
    }
} catch (error) {
    console.error('Failed to load credentials:', error);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'rudo-wealth-819eb', 
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };

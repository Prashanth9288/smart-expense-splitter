const admin = require('firebase-admin');
require('dotenv').config();

console.log('Testing Firebase Admin Initialization...');

let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('Trying env var FIREBASE_SERVICE_ACCOUNT...');
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        console.log('Trying file ./serviceAccountKey.json...');
        try {
            serviceAccount = require('./serviceAccountKey.json');
        } catch (e) {
            console.error('Error requiring file:', e.message);
        }
    }
} catch (error) {
    console.error('Failed to load credentials:', error);
}

if (serviceAccount) {
    console.log('Service Account Object Found.');
    console.log('Project ID:', serviceAccount.project_id);
    console.log('Client Email:', serviceAccount.client_email);
    // console.log('Private Key:', serviceAccount.private_key); // DO NOT LOG
} else {
    console.error('Service Account is UNDEFINED.');
}

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID || 'rudo-wealth-819eb', 
        });
        console.log('admin.initializeApp() called successfully.');
    }
} catch(e) {
    console.error('admin.initializeApp() FAILED:', e.message);
}

// Try to make a dummy call
const db = admin.firestore();
console.log('Attempting to list collections...');
db.listCollections().then(collections => {
    console.log('Collections:', collections.map(c => c.id));
}).catch(e => {
    console.error('Firestore Error:', e.message);
});

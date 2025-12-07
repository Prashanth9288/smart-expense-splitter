const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log("Initializing Firebase Admin...");
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Initialization successful.");
} catch (e) {
    console.error("Initialization failed:", e);
}

async function testConnection() {
  try {
    console.log("Attempting to list users...");
    const listUsersResult = await admin.auth().listUsers(1);
    console.log("Successfully listed users. Count:", listUsersResult.users.length);
  } catch (error) {
    console.error("Error listing users:", error.code, error.message);
  }

  try {
    console.log("Attempting to read Firestore...");
    const db = admin.firestore();
    const snapshot = await db.collection('users').limit(1).get(); 
    console.log("Successfully read Firestore. Documents:", snapshot.size);
  } catch (error) {
    console.error("Error reading Firestore:", error.code, error.message);
  }
}

testConnection();

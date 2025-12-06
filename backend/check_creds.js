const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');

const output = [
    "Project ID from Key: " + serviceAccount.project_id,
    "Client Email: " + serviceAccount.client_email,
    "System Time: " + new Date().toISOString(),
    "Auth Emulator Host: " + (process.env.FIREBASE_AUTH_EMULATOR_HOST || 'Not Set'),
    "Firestore Emulator Host: " + (process.env.FIRESTORE_EMULATOR_HOST || 'Not Set')
].join('\n');

fs.writeFileSync('debug_output.txt', output);
console.log("Done writing debug_output.txt");

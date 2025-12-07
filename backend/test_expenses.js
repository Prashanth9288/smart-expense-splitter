const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function testQuery() {
    try {
        console.log("Testing Expenses Query...");
        const groupId = '18412901-61b5-4ecb-a0ec-a56be0ccf19f'; 
        
        const snapshot = await db.collection('expenses')
            .where('group_id', '==', groupId)
            .orderBy('created_at', 'desc')
            .get();
            
        console.log(`Success! Found ${snapshot.size} docs.`);
    } catch (error) {
        console.error("QUERY FAILED!");
        console.error(error.code);
        console.error(error.message);
        console.error(JSON.stringify(error, null, 2));
    }
}

testQuery();

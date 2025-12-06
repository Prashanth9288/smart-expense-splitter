const { db } = require('./firebaseAdmin');

const collections = {
    users: db.collection('users'),
    groups: db.collection('groups'),
    expenses: db.collection('expenses'),
    ledger: db.collection('ledger'),
    settlements: db.collection('settlements')
};

module.exports = { db, collections };

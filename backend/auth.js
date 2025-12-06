const { auth } = require('./firebaseAdmin');
const { collections } = require('./db');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;

        const userRef = collections.users.doc(decodedToken.uid);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            await userRef.set({
                firebase_uid: decodedToken.uid,
                name: decodedToken.name || 'Anonymous',
                email: decodedToken.email || '',
                avatar_url: decodedToken.picture || '',
                created_at: new Date()
            });
        }

        next();
    } catch (error) {
        console.error('Error verifying token/upserting user:', error.code, error.message);
        return res.status(403).json({ error: 'Unauthorized: ' + error.message, code: error.code });
    }
};

module.exports = verifyToken;

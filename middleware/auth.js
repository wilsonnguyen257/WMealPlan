const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For Vercel, use environment variables
  // For local development, you can use a service account JSON file
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } else {
    // Fallback for development - Firebase will use default credentials
    admin.initializeApp();
  }
}

// Middleware to verify Firebase ID token
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateToken
};

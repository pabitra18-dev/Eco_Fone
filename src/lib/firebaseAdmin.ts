import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!rawKey) {
      console.warn("Firebase private key environment variable is missing.");
    } else {
      const serviceAccount = JSON.parse(rawKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export { db };
export default admin;

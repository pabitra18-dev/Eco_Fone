import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Initialize the Firestore Admin instance
const db = admin.firestore();

// Export both the main admin instance and the db instance
export { db };
export default admin;

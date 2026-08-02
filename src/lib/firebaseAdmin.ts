import admin from 'firebase-admin';

if (!admin.apps.length) {
  // Parse the service account details from an environment variable string
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://your-database-name.firebaseio.com" // include if needed
  });
}

export default admin;

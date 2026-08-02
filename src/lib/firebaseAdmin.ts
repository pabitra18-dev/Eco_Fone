
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeApp, cert, App, getApps, getApp } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import serviceAccount from '@/../eco-fone-nepal-firebase-adminsdk-fbsvc-96b8840e2e.json';

let firebaseAdminApp: App;

const firebaseConfig = {
  credential: cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'eco-fone-nepal.appspot.com',
};


if (getApps().length === 0) {
  firebaseAdminApp = initializeApp(firebaseConfig);
} else {
  firebaseAdminApp = getApp();
}

export const db: Firestore = getFirestore(firebaseAdminApp);
export const storage: Storage = getStorage(firebaseAdminApp);
export { firebaseAdminApp as admin };

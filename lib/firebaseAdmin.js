import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  type: process.env.FIREBASE_ADMIN_SDK_TYPE,
  project_id: process.env.FIREBASE_ADMIN_SDK_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_SDK_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_SDK_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_SDK_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_SDK_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_SDK_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_SDK_CLIENT_CERT_URL,
};

// Only initialize if Admin SDK key is configured
let adminApp = null;
let adminDb = null;

if (process.env.FIREBASE_ADMIN_SDK_PROJECT_ID && process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY) {
  try {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(firebaseAdminConfig),
      });
    } else {
      adminApp = getApps()[0];
    }
    adminDb = getFirestore(adminApp);
  } catch (error) {
    console.warn('Firebase Admin SDK initialization failed:', error?.message);
    adminDb = null;
  }
}

export { adminDb };

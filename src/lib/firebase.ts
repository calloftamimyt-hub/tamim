import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getDocFromServer, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';
import firebaseConfig from '../../firebase-applet-config.json';

// Log the config being used (redacted API key for safety)
console.log("Firebase Initializing with Project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Handle optional custom database ID for Enterprise projects
const databaseId = (firebaseConfig as any).firestoreDatabaseId;

// Use initializeFirestore instead of getFirestore to pass settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: Capacitor.isNativePlatform(),
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  ...(databaseId && databaseId !== '(default)' ? { databaseId } : {})
});

export const storage = getStorage(app);

// Initialize messaging only if supported
export const messaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  READ = 'read',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      email: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  console.log("Testing Firebase connection...");
  try {
    // Attempt to fetch a document from a test collection to test connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection test successful.");
  } catch (error) {
    console.error("Firebase connection test failed!");
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Initial connection test
testConnection();

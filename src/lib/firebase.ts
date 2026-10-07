import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Silence unnecessary Firestore connection warning logs in console
try {
  setLogLevel("silent");
} catch (_e) {
  // Ignore
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(
  app,
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId
);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Authentication Provider
export const googleProvider = new GoogleAuthProvider();

// Export Firebase Authentication methods
export {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
};

// Firestore operation types
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

// Firestore error information
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Handle Firestore errors
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),

    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },

    operationType,
    path,
  };

  console.error("Firestore Error: ", JSON.stringify(errInfo));

  throw new Error(JSON.stringify(errInfo));
}

// Test Firestore connection
export async function testFirestoreConnection() {
  // SmartShop primary database is PostgreSQL (Supabase) via Prisma.
  // Firestore operates in seamless offline/cached mode
  // without forcing blocking pings.
  return true;
}
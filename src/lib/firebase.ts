import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const readEnvStr = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const val = (import.meta.env as Record<string, unknown>)[key];
    if (typeof val === 'string') return val.trim();
  }
  return '';
};

const envProjectId = readEnvStr('VITE_FIREBASE_PROJECT_ID');
const envApiKey = readEnvStr('VITE_FIREBASE_API_KEY');
const envAppId = readEnvStr('VITE_FIREBASE_APP_ID');
const envAuthDomain = readEnvStr('VITE_FIREBASE_AUTH_DOMAIN');
const envDatabaseId = readEnvStr('VITE_FIREBASE_DATABASE_ID');

const configProjectId = (firebaseConfig?.projectId || '').trim();
const hasCompleteEnvOverride = Boolean(envProjectId && envApiKey && envAppId);
const canUseAppletConfig = Boolean(firebaseConfig?.apiKey && configProjectId);

let resolvedFirebaseConfig: {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  appId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  firestoreDatabaseId?: string;
} | null = null;

if (envProjectId && envProjectId !== configProjectId) {
  if (hasCompleteEnvOverride) {
    resolvedFirebaseConfig = {
      apiKey: envApiKey,
      appId: envAppId,
      projectId: envProjectId,
      authDomain: envAuthDomain || `${envProjectId}.firebaseapp.com`,
      storageBucket: `${envProjectId}.firebasestorage.app`,
      ...(envDatabaseId ? { firestoreDatabaseId: envDatabaseId } : {}),
    };
  } else if (canUseAppletConfig) {
    console.warn(
      `FIREBASE_PROJECT_ID ("${envProjectId}") differs from firebase-applet-config.json ("${configProjectId}") without matching VITE_FIREBASE_API_KEY/APP_ID; using provisioned applet config so Firestore DB "${firebaseConfig.firestoreDatabaseId}" stays connected.`
    );
    resolvedFirebaseConfig = { ...firebaseConfig };
  }
} else if (canUseAppletConfig) {
  resolvedFirebaseConfig = {
    ...firebaseConfig,
    ...(envProjectId ? { projectId: envProjectId } : {}),
    ...(envDatabaseId ? { firestoreDatabaseId: envDatabaseId } : {}),
  };
} else if (hasCompleteEnvOverride) {
  resolvedFirebaseConfig = {
    apiKey: envApiKey,
    appId: envAppId,
    projectId: envProjectId,
    authDomain: envAuthDomain || `${envProjectId}.firebaseapp.com`,
    storageBucket: `${envProjectId}.firebasestorage.app`,
    ...(envDatabaseId ? { firestoreDatabaseId: envDatabaseId } : {}),
  };
}

const resolvedProjectId = resolvedFirebaseConfig?.projectId || '';

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

if (resolvedFirebaseConfig && resolvedFirebaseConfig.apiKey && resolvedFirebaseConfig.projectId) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(resolvedFirebaseConfig);
    dbInstance = resolvedFirebaseConfig.firestoreDatabaseId
      ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    authInstance = getAuth(app);
    const emulatorHost = readEnvStr('VITE_FIREBASE_AUTH_EMULATOR_HOST');
    const isBrowserLoopback =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (emulatorHost && isBrowserLoopback) {
      const normalizedUrl = emulatorHost.startsWith('http')
        ? emulatorHost
        : `http://${emulatorHost}`;
      connectAuthEmulator(authInstance, normalizedUrl, { disableWarnings: true });
    }
  } catch (err) {
    console.warn('Client Firebase initialization skipped due to incomplete config:', err);
    app = null;
    dbInstance = null;
    authInstance = null;
  }
} else {
  console.warn(
    'Firebase client SDK disabled: FIREBASE_PROJECT_ID / firebase-applet-config.json is missing.'
  );
}

export const db = dbInstance;
export const auth = authInstance;
const googleProvider = new GoogleAuthProvider();

export function isFirebaseClientConfigured(): boolean {
  return Boolean(app && authInstance);
}

export function getClientFirebaseProjectId(): string | null {
  return resolvedProjectId || null;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid,
      email: authInstance?.currentUser?.email,
      emailVerified: authInstance?.currentUser?.emailVerified,
      isAnonymous: authInstance?.currentUser?.isAnonymous,
      tenantId: authInstance?.currentUser?.tenantId,
      providerInfo:
        authInstance?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot (safe no-op if unconfigured)
async function testConnection() {
  if (!dbInstance) return;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogleFirebase() {
  if (!authInstance) {
    throw new Error(
      'Firebase Authentication is not configured. Please verify FIREBASE_PROJECT_ID.'
    );
  }
  const cred = await signInWithPopup(authInstance, googleProvider);
  const user = cred.user;
  if (dbInstance) {
    const userPath = `users/${user.uid}`;
    try {
      const snap = await getDoc(doc(dbInstance, 'users', user.uid));
      if (!snap.exists()) {
        await setDoc(doc(dbInstance, 'users', user.uid), {
          uid: user.uid,
          name: (user.displayName || 'WorldLeo User').slice(0, 120),
          email: (user.email || '').slice(0, 180),
          role: 'customer',
          city: 'Toronto',
          savedProviderIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  }
  return user;
}

export async function signOutFirebase() {
  if (!authInstance) return;
  await signOut(authInstance);
}

export async function saveRequestToFirestore(payload: {
  requestId: string;
  referenceCode: string;
  requestType: 'marketplace' | 'direct';
  serviceName: string;
  problemSummary: string;
  city: string;
  status: string;
}) {
  const currentUser = authInstance?.currentUser;
  if (!currentUser || !dbInstance) return;
  const path = `service_requests/${payload.requestId}`;
  try {
    await setDoc(doc(dbInstance, 'service_requests', payload.requestId), {
      requestId: payload.requestId.slice(0, 128),
      referenceCode: payload.referenceCode.slice(0, 32),
      customerUid: currentUser.uid,
      requestType: payload.requestType,
      serviceName: payload.serviceName.slice(0, 120),
      problemSummary: payload.problemSummary.slice(0, 400),
      city: payload.city.slice(0, 80),
      status: payload.status.slice(0, 40),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function loadFirestoreRequestsForUser() {
  const currentUser = authInstance?.currentUser;
  if (!currentUser || !dbInstance) return [];
  const path = 'service_requests';
  try {
    const q = query(
      collection(dbInstance, 'service_requests'),
      where('customerUid', '==', currentUser.uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveReviewToFirestore(payload: {
  reviewId: string;
  jobId: string;
  customerName: string;
  providerId: string;
  rating: number;
  comment: string;
  serviceName?: string;
}) {
  const currentUser = authInstance?.currentUser;
  if (!currentUser || !dbInstance) return;
  const path = `reviews/${payload.reviewId}`;
  try {
    await setDoc(doc(dbInstance, 'reviews', payload.reviewId), {
      reviewId: payload.reviewId.slice(0, 128),
      jobId: payload.jobId.slice(0, 128),
      customerUid: currentUser.uid,
      customerName: payload.customerName.slice(0, 120),
      providerId: payload.providerId.slice(0, 128),
      rating: Math.max(1, Math.min(5, Math.round(payload.rating))),
      comment: payload.comment.trim().slice(0, 1000),
      ...(payload.serviceName ? { serviceName: payload.serviceName.slice(0, 120) } : {}),
      isVerifiedJob: true,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function loadProviderReviewsFromFirestore(providerId: string) {
  if (!dbInstance) return [];
  const path = 'reviews';
  try {
    const q = query(collection(dbInstance, 'reviews'), where('providerId', '==', providerId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const createdAtIso =
        data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : typeof data.createdAt === 'string'
            ? data.createdAt
            : new Date().toISOString();
      return {
        id: String(data.reviewId || d.id),
        job_id: String(data.jobId || ''),
        customer_id: String(data.customerUid || ''),
        customer_name: String(data.customerName || 'Verified Customer'),
        provider_id: String(data.providerId || providerId),
        rating: Number(data.rating || 5),
        comment: String(data.comment || ''),
        service_name: data.serviceName ? String(data.serviceName) : undefined,
        verified_job: Boolean(data.isVerifiedJob ?? true),
        created_at: createdAtIso,
      };
    });
  } catch (error) {
    console.warn('Firestore reviews read skipped:', error);
    return [];
  }
}

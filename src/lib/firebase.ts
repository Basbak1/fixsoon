import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
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
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogleFirebase() {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;
  const userPath = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: (user.displayName || 'FixSoon User').slice(0, 120),
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
  return user;
}

export async function signOutFirebase() {
  await signOut(auth);
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
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const path = `service_requests/${payload.requestId}`;
  try {
    await setDoc(doc(db, 'service_requests', payload.requestId), {
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
  const currentUser = auth.currentUser;
  if (!currentUser) return [];
  const path = 'service_requests';
  try {
    const q = query(collection(db, 'service_requests'), where('customerUid', '==', currentUser.uid));
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
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const path = `reviews/${payload.reviewId}`;
  try {
    await setDoc(doc(db, 'reviews', payload.reviewId), {
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
  const path = 'reviews';
  try {
    const q = query(collection(db, 'reviews'), where('providerId', '==', providerId));
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

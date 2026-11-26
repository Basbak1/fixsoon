import fs from 'node:fs';
import path from 'node:path';
import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export interface VerifiedFirebaseClaims {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

export type FirebaseTokenVerifier = (idToken: string) => Promise<VerifiedFirebaseClaims>;

let customTestVerifier: FirebaseTokenVerifier | null = null;
let warnedMissingProjectId = false;

function readConfigFileProjectId(): string | null {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8')) as { projectId?: string };
      const fileProjectId = parsed.projectId?.trim();
      if (fileProjectId) return fileProjectId;
    } catch {
      // fall through cleanly
    }
  }
  return null;
}

export function resolveFirebaseProjectId(allowConfigFallback = true): string | null {
  const envProjectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (envProjectId) {
    return envProjectId;
  }
  if (!allowConfigFallback) {
    return null;
  }
  return readConfigFileProjectId();
}

function getOrInitAppForProject(projectId: string): App | null {
  try {
    const existing = getApps().find((a) => a.options.projectId === projectId);
    if (existing) return existing;
    if (getApps().length === 0) {
      return initializeApp({ projectId });
    }
    return initializeApp({ projectId }, `worldleo-${projectId}`);
  } catch (err) {
    console.warn('Failed to initialize Firebase Admin SDK cleanly:', err);
    return null;
  }
}

export function getServerFirebaseApp(): App | null {
  const projectId = resolveFirebaseProjectId();
  if (!projectId) {
    if (!warnedMissingProjectId) {
      warnedMissingProjectId = true;
      console.warn(
        'Firebase server SDK disabled: FIREBASE_PROJECT_ID is not set and firebase-applet-config.json has no projectId.'
      );
    }
    return null;
  }

  return getOrInitAppForProject(projectId);
}

export function isFirebaseServerConfigured(): boolean {
  return Boolean(getServerFirebaseApp());
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseClaims> {
  if (customTestVerifier) {
    return customTestVerifier(idToken);
  }

  if (!idToken || typeof idToken !== 'string') {
    throw Object.assign(new Error('Missing Firebase ID token.'), { status: 401 });
  }

  const primaryApp = getServerFirebaseApp();
  if (!primaryApp) {
    throw Object.assign(
      new Error('Firebase Authentication is not configured on the server (missing FIREBASE_PROJECT_ID).'),
      { status: 503 }
    );
  }

  let decoded;
  try {
    decoded = await getAuth(primaryApp).verifyIdToken(idToken);
  } catch (primaryErr) {
    const msg = primaryErr instanceof Error ? primaryErr.message : 'Invalid Firebase ID token.';
    const isAudienceMismatch =
      msg.includes('aud') || msg.includes('iss') || msg.includes('Firebase ID token has');
    const configProjectId = readConfigFileProjectId();
    const fallbackApp =
      isAudienceMismatch && configProjectId && configProjectId !== primaryApp.options.projectId
        ? getOrInitAppForProject(configProjectId)
        : null;

    if (!fallbackApp) {
      throw Object.assign(new Error(msg), { status: 401 });
    }

    try {
      decoded = await getAuth(fallbackApp).verifyIdToken(idToken);
    } catch (fallbackErr) {
      const fallbackMsg =
        fallbackErr instanceof Error ? fallbackErr.message : 'Invalid Firebase ID token.';
      throw Object.assign(new Error(fallbackMsg), { status: 401 });
    }
  }

  if (!decoded.uid || typeof decoded.uid !== 'string' || decoded.uid.length > 128) {
    throw Object.assign(new Error('Firebase ID token missing valid subject.'), { status: 401 });
  }
  if (!decoded.email || typeof decoded.email !== 'string') {
    throw Object.assign(new Error('Firebase account must include an email address.'), { status: 401 });
  }
  if (decoded.email_verified !== true) {
    throw Object.assign(new Error('Firebase account email must be verified.'), { status: 401 });
  }

  return {
    uid: decoded.uid,
    email: decoded.email.trim().toLowerCase(),
    emailVerified: true,
    name: typeof decoded.name === 'string' ? decoded.name.trim() : undefined,
  };
}

export function setFirebaseTokenVerifierForTests(verifier: FirebaseTokenVerifier | null): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test verifier hook cannot be used in production.');
  }
  customTestVerifier = verifier;
}

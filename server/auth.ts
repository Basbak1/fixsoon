import crypto from 'node:crypto';
import type express from 'express';
import type { UserRole } from '../src/types/fixsoon.js';

const INSECURE_PLACEHOLDERS = new Set([
  'fixsoon-dev-session-secret-change-in-prod',
  'changeme',
  'secret',
  'dev-secret',
  'test-secret',
]);

export interface SessionSecretResolution {
  secret: string;
  configured: boolean;
}

export function resolveSessionSecretForEnv(
  rawSecret: string | undefined = process.env.SESSION_SECRET,
  nodeEnv: string | undefined = process.env.NODE_ENV
): SessionSecretResolution {
  const envSecret = rawSecret?.trim();
  const isPlaceholder = Boolean(envSecret && INSECURE_PLACEHOLDERS.has(envSecret.toLowerCase()));

  if (envSecret && !isPlaceholder && envSecret.length >= 32) {
    return { secret: envSecret, configured: true };
  }

  if (envSecret && !isPlaceholder && envSecret.length >= 16 && nodeEnv !== 'production') {
    console.warn(
      'SESSION_SECRET is shorter than recommended 32 characters; consider using a longer secret.'
    );
    return { secret: envSecret, configured: true };
  }

  if (nodeEnv === 'production') {
    console.warn(
      'SESSION_SECRET is missing or weak in production. Using an ephemeral cryptographic secret for this process so the server stays online; set SESSION_SECRET (>= 32 chars) for persistent multi-instance sessions.'
    );
  } else {
    console.warn(
      'SESSION_SECRET not set; using an ephemeral per-process cryptographic secret for local sessions.'
    );
  }

  return {
    secret: crypto.randomBytes(32).toString('hex'),
    configured: false,
  };
}

const SESSION_SECRET_STATE = resolveSessionSecretForEnv();
const TOKEN_SECRET = SESSION_SECRET_STATE.secret;

export function isSessionSecretConfigured(): boolean {
  return SESSION_SECRET_STATE.configured;
}

export const SESSION_COOKIE_NAME = 'worldleo_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const keyBuf = Buffer.from(key, 'hex');
  const derivedBuf = Buffer.from(derived, 'hex');
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti: string;
}

export function signSessionToken(userId: string, role: UserRole): string {
  const now = Date.now();
  const payload: SessionPayload = {
    userId,
    role,
    iat: now,
    exp: now + SESSION_TTL_MS,
    jti: crypto.randomBytes(12).toString('hex'),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.userId || !payload.role || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx <= 0) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

export function extractTokenFromRequest(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookieHeader(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME];
}

function isSecureRequest(req: express.Request): boolean {
  const xfProto = req.headers['x-forwarded-proto'];
  if (typeof xfProto === 'string' && xfProto.toLowerCase().includes('https')) return true;
  return Boolean(req.secure);
}

export function setSessionCookie(req: express.Request, res: express.Response, token: string): void {
  const secure = isSecureRequest(req) || process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(req: express.Request, res: express.Response): void {
  const secure = isSecureRequest(req) || process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
  ];
  if (secure) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

// Short-lived single-use SSE stream tickets (avoids putting long-lived bearer tokens in URLs)
interface SseTicketEntry {
  userId: string;
  expiresAt: number;
}
const sseTickets = new Map<string, SseTicketEntry>();

export function issueSseTicket(userId: string): string {
  const now = Date.now();
  for (const [k, v] of sseTickets.entries()) {
    if (v.expiresAt <= now) sseTickets.delete(k);
  }
  const ticket = crypto.randomBytes(24).toString('base64url');
  sseTickets.set(ticket, { userId, expiresAt: now + 30_000 });
  return ticket;
}

export function consumeSseTicket(ticket: string | undefined): string | null {
  if (!ticket) return null;
  const entry = sseTickets.get(ticket);
  if (!entry) return null;
  sseTickets.delete(ticket);
  if (entry.expiresAt <= Date.now()) return null;
  return entry.userId;
}

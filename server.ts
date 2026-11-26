import express from 'express';
import crypto from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { db, type UserRecord } from './server/db.js';
import {
  clearSessionCookie,
  consumeSseTicket,
  extractTokenFromRequest,
  hashPassword,
  isSessionSecretConfigured,
  issueSseTicket,
  setSessionCookie,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from './server/auth.js';
import {
  getServerFirebaseApp,
  isFirebaseServerConfigured,
  resolveFirebaseProjectId,
  verifyFirebaseIdToken,
} from './server/firebaseAuth.js';
import { classifyProblemText, createMatchesForRequest } from './server/matching.js';
import { notificationService } from './server/notifications.js';
import type {
  JobStatus,
  ProviderProfile,
  ProviderStatus,
  ServiceCategory,
  ServiceDivision,
  UserRole,
} from './src/types/fixsoon.js';

dotenv.config();

let cachedAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!cachedAiClient) {
    cachedAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedAiClient;
}

const GTA_CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  Toronto: { latitude: 43.6532, longitude: -79.3832 },
  Mississauga: { latitude: 43.589, longitude: -79.6441 },
  Brampton: { latitude: 43.7315, longitude: -79.7624 },
  Markham: { latitude: 43.8561, longitude: -79.337 },
  Vaughan: { latitude: 43.8361, longitude: -79.4983 },
  Oakville: { latitude: 43.4675, longitude: -79.6877 },
};

const ALLOWED_JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  assigned: ['on_the_way', 'cancelled'],
  on_the_way: ['arrived', 'cancelled'],
  arrived: ['work_in_progress', 'cancelled'],
  work_in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  disputed: [],
};

const VALID_PROVIDER_STATUSES = new Set<ProviderStatus>([
  'draft',
  'submitted',
  'pending_verification',
  'approved',
  'rejected',
  'suspended',
]);

const PORT = Number(process.env.PORT || 3000);

function isLoopbackHostHeader(req?: express.Request): boolean {
  if (!req) return true;
  const rawHost =
    (typeof req.headers['x-forwarded-host'] === 'string' && req.headers['x-forwarded-host']) ||
    req.headers.host ||
    '';
  const hostname = rawHost.split(',')[0].trim().split(':')[0].toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function isLocalEmulatorAuthAllowed(req?: express.Request): boolean {
  // Demo / synthetic accounts are strictly prohibited in production and hosted Cloud Run previews
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.K_SERVICE || process.env.CLOUD_RUN_JOB) return false;
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(appUrl)) {
    return false;
  }
  if (!isLoopbackHostHeader(req)) return false;

  const hasEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim());
  const isAutomatedTestRunner =
    process.env.NODE_ENV === 'test' || process.env.WORLDLEO_ALLOW_TEST_SEEDS === 'true';
  return hasEmulator || isAutomatedTestRunner;
}

function getConfiguredAdminEmailSet(): Set<string> {
  const raw = `${process.env.ADMIN_EMAIL || ''},${process.env.ADMIN_EMAILS || ''}`;
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isOpsStaff(user: UserRecord): boolean {
  return user.role === 'admin' || user.role === 'coordinator';
}

function canAccessFinancialFunctions(user: UserRecord): boolean {
  return user.role === 'admin' || user.role === 'finance';
}

function getOwnedOrScopedProviderProfile(user: UserRecord, requestedProviderId?: string): ProviderProfile | null {
  if (requestedProviderId) {
    const target = db.data.provider_profiles.find((p) => p.id === requestedProviderId);
    if (!target) return null;
    if (target.user_id === user.id) return target;
    if (
      user.role === 'company_member' &&
      Boolean(user.company_id) &&
      target.company_id === user.company_id
    ) {
      return target;
    }
    return null;
  }

  const own = db.data.provider_profiles.find((p) => p.user_id === user.id);
  if (own) return own;
  if (user.role === 'company_member' && user.company_id) {
    return db.data.provider_profiles.find((p) => p.company_id === user.company_id) || null;
  }
  return null;
}

function getAuthUser(req: express.Request): UserRecord | null {
  const token = extractTokenFromRequest(req);
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const user = db.data.users.find((u) => u.id === payload.userId);
  if (!user || user.is_active === false) return null;
  if (user.role !== payload.role) return null;
  return user;
}

function verifySameOriginForCookieMutation(req: express.Request): boolean {
  // Requests carrying an explicit Authorization Bearer token are not vulnerable to ambient cookie CSRF
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return true;
  }
  // If no cookie is present, let auth middleware return 401
  if (!req.headers.cookie) {
    return true;
  }
  const origin = req.headers.origin;
  if (!origin) {
    return true;
  }
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const hostHeader = (
      (typeof req.headers['x-forwarded-host'] === 'string' && req.headers['x-forwarded-host']) ||
      req.headers.host ||
      ''
    )
      .split(',')[0]
      .trim()
      .toLowerCase();
    return Boolean(hostHeader && originHost === hostHeader);
  } catch {
    return false;
  }
}

function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    company_id: user.company_id ?? null,
    saved_provider_ids: user.saved_provider_ids,
    is_demo: Boolean(user.is_demo),
  };
}

function canAccessRequestThread(user: UserRecord, requestId: string): boolean {
  if (isOpsStaff(user)) return true;
  const reqRecord = db.data.service_requests.find((r) => r.id === requestId);
  if (!reqRecord) return false;
  if (reqRecord.customer_id === user.id) return true;

  const prov = getOwnedOrScopedProviderProfile(user);
  if (!prov) return false;

  const activeJob = db.data.jobs.find(
    (j) => j.request_id === requestId && j.status !== 'cancelled'
  );
  if (activeJob) {
    // Once assigned, strictly customer, assigned provider, or staff can access the thread
    return activeJob.provider_id === prov.id;
  }

  return db.data.request_matches.some(
    (m) =>
      m.request_id === requestId &&
      m.provider_id === prov.id &&
      (m.status === 'pending' || m.status === 'quoted')
  );
}

export function createApp(): express.Express {
  // Eagerly attempt Firebase Admin SDK initialization (non-crashing if FIREBASE_PROJECT_ID is unset)
  getServerFirebaseApp();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '4mb' }));

  // Support versioned /api/v1 alias
  app.use((req, _res, next) => {
    if (req.url === '/api/v1' || req.url.startsWith('/api/v1/')) {
      req.url = req.url.replace(/^\/api\/v1/, '/api');
    }
    next();
  });

  // CSRF / Origin check on cookie-authenticated mutations
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (!verifySameOriginForCookieMutation(req)) {
        return res.status(403).json({ error: 'Cross-origin mutation blocked.' });
      }
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      platform: 'WorldLeo',
      divisions: ['home', 'auto'],
      autoSubFeature: 'FixSoon',
      environment: process.env.NODE_ENV || 'development',
      persistenceMode: 'atomic_json_transactional',
      firebaseConfigured: isFirebaseServerConfigured(),
      sessionSecretConfigured: isSessionSecretConfigured(),
      firebaseEmulatorActive: Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim()),
    });
  });

  app.get('/api/config', (req, res) => {
    res.json({
      platformName: 'WorldLeo',
      tagline: 'Your Home. Your Vehicle. One Trusted Place for Help.',
      subBrandAutoEmergency: 'FixSoon',
      apiVersion: 'v1',
      planningPackPriceCad: 39,
      firebaseProjectId: resolveFirebaseProjectId(),
      regions: ['Greater Toronto Area', 'Greater Hamilton Area', 'Niagara Region'],
      featureFlags: {
        livePayments: false,
        realGpsTracking: false,
        aiDesignGeneration: false,
        paidPlanningPacks: false,
        liveProviderRegistration: true,
        localEmulatorAuthEnabled: isLocalEmulatorAuthAllowed(req),
        firebaseConfigured: isFirebaseServerConfigured(),
      },
    });
  });

  // ==========================================
  // SEO ROUTES: robots.txt & dynamic sitemap.xml
  // ==========================================
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /customer-dashboard\nDisallow: /provider-dashboard\nDisallow: /admin\nDisallow: /dashboard\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const urls: string[] = [
      '/',
      '/home',
      '/home/repairs',
      '/home/renovations',
      '/home/ai-design',
      '/home/kitchen-renovation',
      '/home/bathroom-renovation',
      '/home/backyard-design',
      '/auto',
      '/auto/fixsoon',
      '/request-service',
      '/services',
      '/professionals',
      '/how-it-works',
      '/for-professionals',
      '/coverage-areas',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
    ];

    const activeCategories = db.data.service_categories.filter((c) => c.is_active);
    const activeCatIds = new Set(activeCategories.map((c) => c.id));
    const activeSubcategories = db.data.service_subcategories.filter((s) =>
      activeCatIds.has(s.category_id)
    );

    for (const cat of activeCategories) {
      urls.push(`/categories/${cat.slug}`);
    }
    for (const sub of activeSubcategories) {
      urls.push(`/services/${sub.slug}`);
    }
    for (const prov of db.data.provider_profiles.filter((p) => p.status === 'approved')) {
      urls.push(`/professionals/${prov.slug}`);
    }
    for (const loc of db.data.gta_locations) {
      for (const sub of activeSubcategories) {
        const hasCoverage = db.data.provider_profiles.some(
          (p) =>
            p.status === 'approved' &&
            p.subcategory_ids.includes(sub.id) &&
            p.coverage_cities.some((c) => c.toLowerCase() === loc.name.toLowerCase())
        );
        if (hasCoverage) {
          urls.push(`/locations/${loc.slug}/${sub.slug}`);
        }
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${baseUrl}${u}</loc><changefreq>weekly</changefreq></url>`)
      .join('\n')}\n</urlset>`;
    res.type('application/xml').send(xml);
  });

  // ==========================================
  // PUBLIC CATALOG & DISCOVERY API
  // ==========================================
  app.get('/api/catalog', (_req, res) => {
    const activeCategories = db.data.service_categories.filter((c) => c.is_active);
    const activeCatIds = new Set(activeCategories.map((c) => c.id));
    res.json({
      categories: activeCategories,
      subcategories: db.data.service_subcategories.filter((s) => activeCatIds.has(s.category_id)),
      locations: db.data.gta_locations,
    });
  });

  app.get('/api/faqs', (_req, res) => {
    const activeCategories = db.data.service_categories.filter((c) => c.is_active);
    const activeCatIds = new Set(activeCategories.map((c) => c.id));
    const activeSubs = db.data.service_subcategories.filter((s) => activeCatIds.has(s.category_id));
    const cityList = db.data.gta_locations.map((l) => l.name).join(', ');
    const approvedCount = db.data.provider_profiles.filter((p) => p.status === 'approved').length;

    const faqs = [
      {
        id: 'faq_worldleo_ecosystem',
        category: 'Platform',
        question: 'How do WorldLeo Home, WorldLeo Auto, and FixSoon work together?',
        answer:
          'WorldLeo is the parent marketplace for both home and vehicle services across Ontario. WorldLeo Home focuses on repairs, renovations, trades, and the AI Design Studio planning experience, while WorldLeo Auto and its rapid roadside feature FixSoon handle mobile mechanics, tire service, battery boosts, and urgent roadside help.',
      },
      {
        id: 'faq_coverage',
        category: 'Coverage',
        question: 'Which areas and highways does WorldLeo currently cover?',
        answer: `WorldLeo serves the Greater Toronto Area, Greater Hamilton Area, and Niagara Region—including ${cityList}—along the QEW, 401, 403, 407, and 400-series corridors. Availability depends on approved independent professionals covering your municipality.`,
      },
      {
        id: 'faq_vehicles_equipment',
        category: 'Auto & FixSoon',
        question: 'What vehicles and equipment can I request under WorldLeo Auto & FixSoon?',
        answer: `Our active services span ${activeSubs.length} Home and Auto specialties—including cars, SUVs, pickup and commercial trucks, Bobcats/skid steers, utility trailers, and residential property trades.`,
      },
      {
        id: 'faq_two_methods',
        category: 'Process',
        question: 'What is the difference between a Direct Request and a Marketplace Quote Request?',
        answer:
          'A General Marketplace Request matches your issue with qualified professionals in your area so you can compare written quotes side by side. A Direct Request lets you pick a specific professional from the directory and send your job straight to them.',
      },
      {
        id: 'faq_ai_design',
        category: 'AI Design Studio',
        question: 'How does WorldLeo AI Design Studio work right now?',
        answer:
          'WorldLeo AI Design Studio helps homeowners visualize renovation concepts, organize preliminary project scopes (kitchen, bathroom, backyard, interior), and send structured briefs to qualified contractors for on-site verification and written quotes.',
      },
      {
        id: 'faq_verification',
        category: 'Verification',
        question: 'How does WorldLeo verify service professionals and reviews?',
        answer: `WorldLeo separates self-reported profile info from verified checks. Operations reviews contact reachability, business identity, commercial liability insurance, and trade licences before marking a provider as WorldLeo Verified. Currently ${approvedCount} approved demo profile(s) demonstrate how verified credentials appear.`,
      },
      {
        id: 'faq_privacy_pricing',
        category: 'Pricing & Privacy',
        question: 'When is my exact street address shared, and how do quotes work?',
        answer:
          'Professionals only see your city or neighbourhood while reviewing a request and submitting a written quote. Your exact street address and direct contact details stay private until you accept a quote.',
      },
    ];

    res.json({ faqs });
  });

  app.post('/api/classify-problem', (req, res) => {
    const { query } = req.body as { query?: string };
    const result = classifyProblemText(query || '');
    res.json(result);
  });

  app.get('/api/providers', (req, res) => {
    const { category, subcategory, city, verifiedOnly, availableNow, q } = req.query as Record<
      string,
      string | undefined
    >;

    let list = db.data.provider_profiles.filter((p) => p.status === 'approved');

    if (category) {
      list = list.filter((p) => p.category_ids.includes(category));
    }
    if (subcategory) {
      list = list.filter((p) => p.subcategory_ids.includes(subcategory));
    }
    if (city) {
      list = list.filter(
        (p) =>
          p.primary_city.toLowerCase() === city.toLowerCase() ||
          p.coverage_cities.some((c) => c.toLowerCase() === city.toLowerCase())
      );
    }
    if (verifiedOnly === 'true') {
      list = list.filter(
        (p) =>
          p.verifications.business_verified &&
          p.verifications.insurance_verified &&
          p.verifications.profile_reviewed
      );
    }
    if (availableNow === 'true') {
      list = list.filter((p) => p.is_available_now);
    }
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.display_name.toLowerCase().includes(term) ||
          p.business_name.toLowerCase().includes(term) ||
          p.bio.toLowerCase().includes(term) ||
          p.coverage_cities.some((c) => c.toLowerCase().includes(term))
      );
    }

    res.json({ providers: list });
  });

  app.get('/api/providers/:slug', (req, res) => {
    const provider = db.data.provider_profiles.find(
      (p) => (p.slug === req.params.slug || p.id === req.params.slug) && p.status === 'approved'
    );
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    const reviews = db.data.reviews.filter((r) => r.provider_id === provider.id);
    const services = db.data.service_subcategories.filter((s) =>
      provider.subcategory_ids.includes(s.id)
    );
    res.json({ provider, reviews, services });
  });

  // ==========================================
  // AUTHENTICATION API
  // ==========================================
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, role, city } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
      city?: string;
    };

    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Name, valid email, and password (6+ chars) are required.' });
    }

    if (role !== undefined && role !== 'customer' && role !== 'provider') {
      return res
        .status(403)
        .json({ error: 'Public registration only supports customer or provider accounts.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole: UserRole = role === 'provider' ? 'provider' : 'customer';

    try {
      const user = await db.runTransaction(() => {
        if (db.data.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
          throw Object.assign(new Error('An account with this email already exists.'), { status: 409 });
        }

        const created: UserRecord = {
          id: db.newId('usr'),
          name: name.trim(),
          email: normalizedEmail,
          phone: (phone || '').trim(),
          role: assignedRole,
          password_hash: hashPassword(password),
          city: (city || 'Toronto').trim(),
          company_id: null,
          is_demo: false,
          is_active: true,
          saved_provider_ids: [],
          created_at: new Date().toISOString(),
        };

        db.data.users.push(created);
        return created;
      });

      const token = signSessionToken(user.id, user.role);
      setSessionCookie(req, res, token);
      res.status(201).json({ token, user: toPublicUser(user) });
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.data.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || user.is_active === false || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.is_demo && !isLocalEmulatorAuthAllowed(req)) {
      return res.status(403).json({
        error:
          'Synthetic demo accounts are disabled outside local Firebase Auth Emulator or test environments. Please sign in with Firebase Authentication.',
      });
    }

    const token = signSessionToken(user.id, user.role);
    setSessionCookie(req, res, token);
    const providerProfile = getOwnedOrScopedProviderProfile(user);
    res.json({ token, user: toPublicUser(user), providerProfile });
  });

  app.post('/api/auth/demo', (req, res) => {
    if (!isLocalEmulatorAuthAllowed(req)) {
      return res.status(403).json({
        error:
          'Demo authentication is disabled outside local Firebase Auth Emulator or test environments. Use Firebase Authentication.',
      });
    }

    const { email, role } = req.body as { email?: string; role?: string };
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRole = role?.trim().toLowerCase();

    const demoUser = db.data.users.find((u) => {
      if (!u.is_demo || u.is_active === false) return false;
      if (normalizedEmail) return u.email.toLowerCase() === normalizedEmail;
      if (normalizedRole) return u.role.toLowerCase() === normalizedRole;
      return u.role === 'customer';
    });

    if (!demoUser) {
      return res.status(404).json({ error: 'Matching synthetic emulator test account not found.' });
    }

    const token = signSessionToken(demoUser.id, demoUser.role);
    setSessionCookie(req, res, token);
    const providerProfile = getOwnedOrScopedProviderProfile(demoUser);
    res.json({ token, user: toPublicUser(demoUser), providerProfile });
  });

  app.post('/api/auth/logout', (req, res) => {
    clearSessionCookie(req, res);
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const providerProfile = getOwnedOrScopedProviderProfile(user);
    res.json({ user: toPublicUser(user), providerProfile });
  });

  app.post('/api/auth/firebase', async (req, res) => {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken || typeof idToken !== 'string') {
      return res.status(401).json({ error: 'Valid Firebase ID token is required.' });
    }

    let claims;
    try {
      claims = await verifyFirebaseIdToken(idToken);
    } catch (err) {
      const status = (err as { status?: number }).status || 401;
      return res.status(status).json({
        error: err instanceof Error ? err.message : 'Invalid Firebase ID token.',
      });
    }

    try {
      const adminEmails = getConfiguredAdminEmailSet();
      const isVerifiedAdminEmail = claims.emailVerified && adminEmails.has(claims.email.toLowerCase());

      const user = await db.runTransaction(() => {
        // Match strictly by server-verified firebase_uid; never trust client uid/email/role
        let existing = db.data.users.find((u) => u.firebase_uid === claims.uid);

        if (!existing) {
          const byEmail = db.data.users.find(
            (u) => u.email.toLowerCase() === claims.email.toLowerCase()
          );
          if (byEmail) {
            if (
              byEmail.is_demo ||
              byEmail.role === 'admin' ||
              byEmail.role === 'coordinator' ||
              byEmail.role === 'finance' ||
              !byEmail.id.startsWith('usr_fb_')
            ) {
              throw Object.assign(
                new Error(
                  'An account with this email already exists with password credentials. Sign in with email and password.'
                ),
                { status: 403 }
              );
            }
            byEmail.firebase_uid = claims.uid;
            existing = byEmail;
          }
        }

        if (!existing) {
          existing = {
            id: `usr_fb_${claims.uid.slice(0, 12)}_${crypto.randomBytes(3).toString('hex')}`,
            firebase_uid: claims.uid,
            name: claims.name || 'WorldLeo User',
            email: claims.email,
            phone: '',
            role: isVerifiedAdminEmail ? 'admin' : 'customer',
            password_hash: hashPassword(crypto.randomBytes(32).toString('hex')),
            city: 'Toronto',
            company_id: null,
            is_demo: false,
            is_active: true,
            saved_provider_ids: [],
            created_at: new Date().toISOString(),
          };
          db.data.users.push(existing);
        } else if (isVerifiedAdminEmail && !existing.is_demo && existing.role === 'customer') {
          existing.role = 'admin';
        }

        if (existing.is_active === false) {
          throw Object.assign(new Error('Account is inactive.'), { status: 403 });
        }

        return existing;
      });

      const token = signSessionToken(user.id, user.role);
      setSessionCookie(req, res, token);
      const providerProfile = getOwnedOrScopedProviderProfile(user);
      res.json({ token, user: toPublicUser(user), providerProfile });
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Firebase login failed.' });
    }
  });

  // ==========================================
  // GEMINI SEARCH & MAPS GROUNDING API
  // ==========================================
  app.post('/api/grounding/search', async (req, res) => {
    const { query } = req.body as { query?: string };
    if (!query?.trim()) {
      return res.status(400).json({ error: 'Search query is required.' });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured on the server.' });
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Provide concise, practical, safety-first guidance for a customer in Ontario, Canada asking: ${query.trim()}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .filter((c: { web?: { uri?: string; title?: string } }) => c.web?.uri)
        .map((c: { web?: { uri?: string; title?: string } }) => ({
          title: c.web?.title || 'Web Source',
          uri: c.web?.uri || '',
        }));

      res.json({ text: response.text || 'No grounded results returned.', sources });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Search grounding failed' });
    }
  });

  app.post('/api/grounding/maps', async (req, res) => {
    const { query, city, lat, lng } = req.body as {
      query?: string;
      city?: string;
      lat?: number;
      lng?: number;
    };
    if (!query?.trim()) {
      return res.status(400).json({ error: 'Location query is required.' });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured on the server.' });
    }
    const fallbackCoords = GTA_CITY_COORDS[city || 'Toronto'] || GTA_CITY_COORDS.Toronto;
    const latLng =
      typeof lat === 'number' && typeof lng === 'number'
        ? { latitude: lat, longitude: lng }
        : fallbackCoords;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${query.trim()} near ${city || 'Toronto'}, Ontario, Canada`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng,
            },
          },
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .filter((c: { maps?: { uri?: string; title?: string } }) => c.maps?.uri)
        .map((c: { maps?: { uri?: string; title?: string } }) => ({
          title: c.maps?.title || 'Google Maps Place',
          uri: c.maps?.uri || '',
        }));

      res.json({ text: response.text || 'No nearby places returned.', sources });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Maps grounding failed' });
    }
  });

  app.post('/api/customer/saved-providers/:providerId', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Sign in required' });

    const { providerId } = req.params;
    const providerExists = db.data.provider_profiles.some(
      (p) => p.id === providerId && p.status === 'approved'
    );
    if (!providerExists) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const updated = await db.runTransaction(() => {
      const u = db.data.users.find((item) => item.id === user.id)!;
      const idx = u.saved_provider_ids.indexOf(providerId);
      if (idx >= 0) {
        u.saved_provider_ids.splice(idx, 1);
      } else {
        u.saved_provider_ids.push(providerId);
      }
      return u.saved_provider_ids;
    });

    res.json({ saved_provider_ids: updated });
  });

  // ==========================================
  // CUSTOMER REQUESTS, QUOTES & JOBS API
  // ==========================================
  app.post('/api/requests', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res
        .status(401)
        .json({ error: 'Please sign in or create an account to submit a request.' });
    }

    const {
      request_type,
      target_provider_id,
      category_id,
      subcategory_id,
      problem_summary,
      problem_details,
      dynamic_fields,
      city,
      neighbourhood,
      postal_code,
      exact_address,
      urgency,
    } = req.body;

    if (!category_id || !subcategory_id || !problem_summary?.trim() || !city?.trim()) {
      return res
        .status(400)
        .json({ error: 'Service category, problem summary, and city are required.' });
    }

    const category = db.data.service_categories.find(
      (c) => c.id === category_id && c.is_active
    );
    if (!category) {
      return res.status(400).json({ error: 'Selected service category is invalid or inactive.' });
    }

    const subcategory = db.data.service_subcategories.find(
      (s) => s.id === subcategory_id && s.category_id === category.id
    );
    if (!subcategory) {
      return res.status(400).json({ error: 'Selected service specialty does not match category.' });
    }

    const cleanUrgency =
      urgency === 'emergency' || urgency === 'today' || urgency === 'scheduled'
        ? urgency
        : 'today';

    const targetProvider = target_provider_id
      ? db.data.provider_profiles.find(
          (p) => p.id === target_provider_id && p.status === 'approved'
        )
      : null;

    if (request_type === 'direct' && !targetProvider) {
      return res.status(404).json({ error: 'Selected professional is not currently available.' });
    }
    if (targetProvider && targetProvider.user_id === user.id) {
      return res
        .status(400)
        .json({ error: 'You cannot send a direct service request to your own provider account.' });
    }

    const division: ServiceDivision = category.division || (category.id === 'cat_home' ? 'home' : 'auto');

    const { created, matchedCount } = await db.runTransaction(() => {
      const newRequest = {
        id: db.newId('req'),
        reference_code: db.newRefCode(),
        customer_id: user.id,
        customer_name: user.name,
        customer_phone: user.phone,
        division,
        request_type: request_type === 'direct' ? ('direct' as const) : ('marketplace' as const),
        target_provider_id: targetProvider ? targetProvider.id : null,
        target_provider_name: targetProvider ? targetProvider.business_name : null,
        category_id: category.id,
        category_name: category.name,
        subcategory_id: subcategory.id,
        subcategory_name: subcategory.name,
        problem_summary: String(problem_summary).trim().slice(0, 400),
        problem_details: String(problem_details || '').trim().slice(0, 2000),
        dynamic_fields:
          dynamic_fields && typeof dynamic_fields === 'object' ? dynamic_fields : {},
        city: String(city).trim().slice(0, 80),
        neighbourhood: String(neighbourhood || '').trim().slice(0, 80),
        postal_code: String(postal_code || '').trim().toUpperCase().slice(0, 12),
        exact_address: String(exact_address || '').trim().slice(0, 240),
        urgency: cleanUrgency as 'emergency' | 'today' | 'scheduled',
        status: 'open' as const,
        is_demo: Boolean(user.is_demo),
        created_at: new Date().toISOString(),
      };

      db.data.service_requests.unshift(newRequest);
      const matchedProviders = createMatchesForRequest(newRequest);
      return { created: newRequest, matchedCount: matchedProviders.length };
    });

    res.status(201).json({
      request: created,
      matched_count: matchedCount,
    });
  });

  // Fallback a declined/unanswered direct request to the general marketplace
  app.post('/api/requests/:id/convert-to-marketplace', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const { request, matchedCount } = await db.runTransaction(() => {
        const reqRecord = db.data.service_requests.find((r) => r.id === req.params.id);
        if (!reqRecord) {
          throw Object.assign(new Error('Request not found'), { status: 404 });
        }
        if (reqRecord.customer_id !== user.id) {
          throw Object.assign(new Error('Forbidden'), { status: 403 });
        }
        const hasActiveJob = db.data.jobs.some(
          (j) => j.request_id === reqRecord.id && j.status !== 'cancelled'
        );
        if (
          hasActiveJob ||
          ['assigned', 'in_progress', 'completed', 'cancelled'].includes(reqRecord.status)
        ) {
          throw Object.assign(
            new Error('Cannot convert a request that is already assigned, completed, or cancelled.'),
            { status: 409 }
          );
        }

        reqRecord.request_type = 'marketplace';
        reqRecord.target_provider_id = null;
        reqRecord.target_provider_name = null;
        reqRecord.status = 'open';

        const matchedProviders = createMatchesForRequest(reqRecord);
        return { request: reqRecord, matchedCount: matchedProviders.length };
      });

      res.json({ request, matched_count: matchedCount });
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Conversion failed' });
    }
  });

  app.get('/api/customer/dashboard', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const requests = db.data.service_requests.filter((r) => r.customer_id === user.id);
    const requestIds = new Set(requests.map((r) => r.id));

    const quotes = db.data.quotes
      .filter((q) => requestIds.has(q.request_id))
      .map((q) => {
        const prov = db.data.provider_profiles.find((p) => p.id === q.provider_id);
        return {
          ...q,
          provider_name: prov?.business_name || prov?.display_name || 'Service Provider',
          provider_slug: prov?.slug || '',
          provider_avatar: prov?.avatar_url || '',
          provider_rating: prov?.rating_avg || 0,
          provider_review_count: prov?.review_count || 0,
          provider_verified: Boolean(
            prov?.verifications.business_verified &&
              prov?.verifications.insurance_verified &&
              prov?.verifications.profile_reviewed
          ),
        };
      });

    const jobs = db.data.jobs.filter((j) => j.customer_id === user.id);
    const savedProviders = db.data.provider_profiles.filter((p) =>
      user.saved_provider_ids.includes(p.id)
    );
    const notifications = db.data.notifications.filter((n) => n.user_id === user.id).slice(0, 20);
    const reviews = db.data.reviews.filter((r) => r.customer_id === user.id);

    res.json({ requests, quotes, jobs, savedProviders, notifications, reviews });
  });

  app.post('/api/quotes/:quoteId/accept', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const result = await db.runTransaction(() => {
        const quote = db.data.quotes.find((q) => q.id === req.params.quoteId);
        if (!quote) {
          throw Object.assign(new Error('Quote not found'), { status: 404 });
        }

        const request = db.data.service_requests.find((r) => r.id === quote.request_id);
        if (!request) {
          throw Object.assign(new Error('Request not found'), { status: 404 });
        }
        if (request.customer_id !== user.id) {
          throw Object.assign(new Error('Forbidden'), { status: 403 });
        }

        if (quote.status !== 'pending') {
          throw Object.assign(new Error('Quote is no longer pending and cannot be accepted again.'), {
            status: 409,
          });
        }
        if (request.status !== 'open' && request.status !== 'quoted') {
          throw Object.assign(new Error('This service request already has an assigned or finalized status.'), {
            status: 409,
          });
        }

        const existingActiveJob = db.data.jobs.some(
          (j) =>
            (j.request_id === request.id || j.quote_id === quote.id) &&
            j.status !== 'cancelled'
        );
        if (existingActiveJob) {
          throw Object.assign(new Error('A job already exists for this request.'), { status: 409 });
        }

        const provider = db.data.provider_profiles.find(
          (p) => p.id === quote.provider_id && p.status === 'approved'
        );
        if (!provider) {
          throw Object.assign(new Error('Provider not available.'), { status: 404 });
        }
        if (provider.user_id === user.id) {
          throw Object.assign(new Error('Cannot accept your own provider quote.'), { status: 403 });
        }

        const now = new Date().toISOString();
        quote.status = 'accepted';

        for (const other of db.data.quotes) {
          if (other.request_id === request.id && other.id !== quote.id && other.status === 'pending') {
            other.status = 'rejected';
          }
        }
        for (const m of db.data.request_matches) {
          if (m.request_id === request.id && m.provider_id !== provider.id && m.status === 'pending') {
            m.status = 'expired';
          }
        }

        request.status = 'assigned';

        const job = {
          id: db.newId('job'),
          request_id: request.id,
          reference_code: request.reference_code,
          quote_id: quote.id,
          customer_id: user.id,
          customer_name: user.name,
          customer_phone: user.phone,
          exact_address:
            request.exact_address ||
            `${request.neighbourhood ? request.neighbourhood + ', ' : ''}${request.city}`,
          city: request.city,
          neighbourhood: request.neighbourhood,
          provider_id: provider.id,
          provider_name: provider.business_name || provider.display_name,
          provider_slug: provider.slug,
          service_name: request.subcategory_name || 'Service',
          problem_summary: request.problem_summary,
          estimated_price: quote.estimated_price,
          status: 'assigned' as const,
          status_history: [
            {
              status: 'assigned' as const,
              note: `Quote accepted ($${quote.estimated_price}). Job assigned to ${provider.business_name}.`,
              timestamp: now,
              actor_role: 'customer' as const,
            },
          ],
          review_submitted: false,
          is_demo: Boolean(user.is_demo || provider.is_demo),
          created_at: now,
          updated_at: now,
        };

        db.data.jobs.unshift(job);
        notificationService.onQuoteAccepted({
          providerUserId: provider.user_id,
          customerName: user.name,
          referenceCode: request.reference_code,
        });

        return { job, quote };
      });

      res.json(result);
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Unable to accept quote' });
    }
  });

  app.post('/api/jobs/:jobId/review', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { rating, comment } = req.body as { rating?: number; comment?: string };
    const rawRating = Number(rating ?? 5);
    if (!Number.isFinite(rawRating) || rawRating < 1 || rawRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }
    const numRating = Math.round(rawRating);
    const trimmedComment = (comment || '').trim();
    if (trimmedComment.length < 3 || trimmedComment.length > 1000) {
      return res
        .status(400)
        .json({ error: 'Please write a review comment between 3 and 1000 characters.' });
    }

    try {
      const review = await db.runTransaction(() => {
        const job = db.data.jobs.find((j) => j.id === req.params.jobId);
        if (!job) {
          throw Object.assign(new Error('Job not found'), { status: 404 });
        }
        if (job.customer_id !== user.id) {
          throw Object.assign(new Error('Forbidden'), { status: 403 });
        }
        if (job.status !== 'completed') {
          throw Object.assign(new Error('Reviews can only be submitted after job completion.'), {
            status: 400,
          });
        }
        if (job.review_submitted || db.data.reviews.some((r) => r.job_id === job.id)) {
          throw Object.assign(new Error('You have already reviewed this job.'), { status: 409 });
        }

        const created = {
          id: db.newId('rev'),
          job_id: job.id,
          customer_id: user.id,
          customer_name: user.name,
          provider_id: job.provider_id,
          rating: numRating,
          comment: trimmedComment,
          service_name: job.service_name,
          verified_job: true,
          is_demo: Boolean(user.is_demo),
          created_at: new Date().toISOString(),
        };

        db.data.reviews.unshift(created);
        job.review_submitted = true;

        const provider = db.data.provider_profiles.find((p) => p.id === job.provider_id);
        if (provider) {
          const provReviews = db.data.reviews.filter((r) => r.provider_id === provider.id);
          const total = provReviews.reduce((acc, r) => acc + r.rating, 0);
          provider.review_count = provReviews.length;
          provider.rating_avg = Math.round((total / provReviews.length) * 10) / 10;
        }

        return created;
      });

      res.status(201).json({ review });
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Review failed' });
    }
  });

  app.post('/api/jobs/:jobId/dispute', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { reason, details } = req.body as { reason?: string; details?: string };
    if (!reason?.trim() || reason.trim().length > 300) {
      return res.status(400).json({ error: 'Valid reason (1-300 chars) is required.' });
    }

    try {
      const dispute = await db.runTransaction(() => {
        const job = db.data.jobs.find((j) => j.id === req.params.jobId);
        if (!job) {
          throw Object.assign(new Error('Job not found'), { status: 404 });
        }

        const ownedProfile = getOwnedOrScopedProviderProfile(user);
        const isCustomerOwner = job.customer_id === user.id;
        const isAssignedProvider = Boolean(ownedProfile && job.provider_id === ownedProfile.id);

        if (!isCustomerOwner && !isAssignedProvider) {
          throw Object.assign(
            new Error('Forbidden: only the customer or assigned provider can report an issue for this job.'),
            { status: 403 }
          );
        }

        if (job.status === 'disputed' || job.status === 'cancelled') {
          throw Object.assign(
            new Error('A dispute cannot be opened on a cancelled or already disputed job.'),
            { status: 409 }
          );
        }
        if (db.data.disputes.some((d) => d.job_id === job.id && d.status !== 'resolved')) {
          throw Object.assign(new Error('An active dispute already exists for this job.'), {
            status: 409,
          });
        }

        const now = new Date().toISOString();
        const created = {
          id: db.newId('disp'),
          job_id: job.id,
          request_id: job.request_id,
          reference_code: job.reference_code,
          reporter_id: user.id,
          reporter_name: user.name,
          reason: reason.trim(),
          details: String(details || '').trim().slice(0, 2000),
          status: 'open' as const,
          created_at: now,
        };

        db.data.disputes.unshift(created);
        job.status = 'disputed';
        job.updated_at = now;
        job.status_history.push({
          status: 'disputed',
          note: `Report filed: ${reason.trim()}`,
          timestamp: now,
          actor_role: user.role,
        });

        return created;
      });

      res.status(201).json({ dispute });
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Unable to file dispute' });
    }
  });

  // ==========================================
  // MESSAGING API (Request / Job Thread)
  // ==========================================
  app.get('/api/requests/:requestId/messages', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const reqRecord = db.data.service_requests.find((r) => r.id === req.params.requestId);
    if (!reqRecord) return res.status(404).json({ error: 'Request not found' });
    if (!canAccessRequestThread(user, req.params.requestId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = db.data.messages.filter((m) => m.request_id === req.params.requestId);
    res.json({ messages });
  });

  app.post('/api/requests/:requestId/messages', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const reqRecord = db.data.service_requests.find((r) => r.id === req.params.requestId);
    if (!reqRecord) return res.status(404).json({ error: 'Request not found' });
    if (!canAccessRequestThread(user, req.params.requestId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { body } = req.body as { body?: string };
    const trimmed = (body || '').trim();
    if (!trimmed || trimmed.length > 2000) {
      return res.status(400).json({ error: 'Message body (1-2000 chars) is required.' });
    }

    const msg = await db.runTransaction(() => {
      const created = {
        id: db.newId('msg'),
        request_id: req.params.requestId,
        sender_id: user.id,
        sender_role: user.role,
        sender_name: user.name,
        body: trimmed,
        created_at: new Date().toISOString(),
      };

      db.data.messages.push(created);

      if (user.id === reqRecord.customer_id) {
        const assignedJob = db.data.jobs.find(
          (j) => j.request_id === reqRecord.id && j.status !== 'cancelled'
        );
        const targetProvId = assignedJob?.provider_id || reqRecord.target_provider_id;
        const prov = targetProvId
          ? db.data.provider_profiles.find((p) => p.id === targetProvId)
          : undefined;
        if (prov) {
          notificationService.onNewMessage({
            recipientUserId: prov.user_id,
            senderName: user.name,
            referenceCode: reqRecord.reference_code,
            recipientRole: 'provider',
          });
        }
      } else {
        notificationService.onNewMessage({
          recipientUserId: reqRecord.customer_id,
          senderName: user.name,
          referenceCode: reqRecord.reference_code,
          recipientRole: 'customer',
        });
      }

      return created;
    });

    res.status(201).json({ message: msg });
  });

  // ==========================================
  // NOTIFICATION SERVICE API (REST + SSE TICKETS)
  // ==========================================
  app.get('/api/notifications', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json(notificationService.listForUser(user.id));
  });

  app.post('/api/notifications/sse-ticket', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const ticket = issueSseTicket(user.id);
    res.json({ ticket });
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const notification = notificationService.markRead(user.id, req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification, unreadCount: notificationService.getUnreadCount(user.id) });
  });

  app.post('/api/notifications/read-all', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    notificationService.markAllRead(user.id);
    res.json({ unreadCount: 0 });
  });

  app.get('/api/notifications/stream', (req, res) => {
    // Reject long-lived bearer tokens passed in query string
    if (typeof req.query.token === 'string') {
      return res.status(401).json({ error: 'Query token authentication is disabled. Use cookie or SSE ticket.' });
    }

    let userId: string | null = getAuthUser(req)?.id || null;
    if (!userId && typeof req.query.ticket === 'string') {
      userId = consumeSseTicket(req.query.ticket);
    }

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const unsubscribe = notificationService.subscribe(userId, res);
    req.on('close', unsubscribe);
  });

  // ==========================================
  // PROVIDER ONBOARDING & DASHBOARD API
  // ==========================================
  app.post('/api/provider/onboarding', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const data = req.body as Partial<ProviderProfile>;
    if (!data.display_name?.trim() || !data.primary_city?.trim() || !data.category_ids?.length) {
      return res.status(400).json({
        error: 'Display name, primary city, and at least one service category are required.',
      });
    }

    const validCategoryIds = new Set(db.data.service_categories.map((c) => c.id));
    const filteredCategories = data.category_ids.filter((id) => validCategoryIds.has(id));
    if (filteredCategories.length === 0) {
      return res.status(400).json({ error: 'At least one valid service category is required.' });
    }

    const validSubIds = new Set(db.data.service_subcategories.map((s) => s.id));
    const filteredSubcategories = Array.isArray(data.subcategory_ids)
      ? data.subcategory_ids.filter((id) => validSubIds.has(id))
      : [];

    const coverageRadius = Math.max(5, Math.min(200, Number(data.coverage_radius_km || 25) || 25));
    const yearsExp = Math.max(0, Math.min(70, Number(data.years_experience || 1) || 1));

    const slugBase =
      (data.business_name || data.display_name || user.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'provider';
    const now = new Date().toISOString();

    const result = await db.runTransaction(() => {
      const dbUser = db.data.users.find((u) => u.id === user.id)!;
      let existing = db.data.provider_profiles.find((p) => p.user_id === user.id);

      if (existing) {
        Object.assign(existing, {
          display_name: data.display_name!.trim().slice(0, 120),
          business_name: (data.business_name || data.display_name!).trim().slice(0, 140),
          provider_type: data.provider_type || existing.provider_type,
          bio: (data.bio || existing.bio).trim().slice(0, 2000),
          primary_city: data.primary_city!.trim().slice(0, 80),
          coverage_cities: data.coverage_cities?.length
            ? data.coverage_cities.map((c) => String(c).trim()).filter(Boolean)
            : [data.primary_city!.trim()],
          coverage_radius_km: coverageRadius,
          category_ids: filteredCategories,
          subcategory_ids: filteredSubcategories,
          languages: data.languages?.length
            ? data.languages.map((l) => String(l).trim()).filter(Boolean)
            : ['English'],
          years_experience: yearsExp,
          starting_price:
            data.starting_price !== null && data.starting_price !== undefined
              ? Math.max(0, Number(data.starting_price) || 0)
              : null,
          diagnostic_fee:
            data.diagnostic_fee !== null && data.diagnostic_fee !== undefined
              ? Math.max(0, Number(data.diagnostic_fee) || 0)
              : null,
          free_estimates: Boolean(data.free_estimates),
          pricing_notes: (data.pricing_notes || '').trim().slice(0, 500),
          operating_hours: (data.operating_hours || 'Mon–Fri 8:00 AM – 6:00 PM')
            .trim()
            .slice(0, 140),
          emergency_available: Boolean(data.emergency_available),
          is_available_now: data.is_available_now ?? true,
          // Never allow client onboarding to self-approve or manipulate verification badges
          status:
            existing.status === 'draft' || existing.status === 'rejected'
              ? 'pending_verification'
              : existing.status,
        });
      } else {
        existing = {
          id: db.newId('prov'),
          user_id: user.id,
          company_id: dbUser.company_id ?? null,
          slug: `${slugBase}-${crypto.randomInt(100, 999)}`,
          display_name: data.display_name!.trim().slice(0, 120),
          business_name: (data.business_name || data.display_name!).trim().slice(0, 140),
          provider_type: data.provider_type || 'independent_professional',
          bio: (data.bio || '').trim().slice(0, 2000),
          avatar_url: '',
          primary_city: data.primary_city!.trim().slice(0, 80),
          coverage_cities: data.coverage_cities?.length
            ? data.coverage_cities.map((c) => String(c).trim()).filter(Boolean)
            : [data.primary_city!.trim()],
          coverage_radius_km: coverageRadius,
          category_ids: filteredCategories,
          subcategory_ids: filteredSubcategories,
          languages: data.languages?.length
            ? data.languages.map((l) => String(l).trim()).filter(Boolean)
            : ['English'],
          years_experience: yearsExp,
          starting_price:
            data.starting_price !== null && data.starting_price !== undefined
              ? Math.max(0, Number(data.starting_price) || 0)
              : null,
          diagnostic_fee:
            data.diagnostic_fee !== null && data.diagnostic_fee !== undefined
              ? Math.max(0, Number(data.diagnostic_fee) || 0)
              : null,
          free_estimates: Boolean(data.free_estimates),
          pricing_notes: (data.pricing_notes || '').trim().slice(0, 500),
          operating_hours: (data.operating_hours || 'Mon–Fri 8:00 AM – 6:00 PM')
            .trim()
            .slice(0, 140),
          emergency_available: Boolean(data.emergency_available),
          is_available_now: data.is_available_now ?? true,
          status: 'pending_verification',
          verifications: {
            email_verified: true,
            phone_verified: Boolean(user.phone),
            business_verified: false,
            license_verified: false,
            insurance_verified: false,
            profile_reviewed: false,
          },
          rating_avg: 0,
          review_count: 0,
          completed_jobs_count: 0,
          is_demo: false,
          created_at: now,
        };
        db.data.provider_profiles.push(existing);
        // Never demote admin/coordinator/finance/company_member roles
        if (dbUser.role === 'customer') {
          dbUser.role = 'provider';
        }
      }

      return { profile: existing, updatedUser: dbUser };
    });

    const refreshedToken = signSessionToken(result.updatedUser.id, result.updatedUser.role);
    setSessionCookie(req, res, refreshedToken);
    res.status(201).json({
      providerProfile: result.profile,
      token: refreshedToken,
      user: toPublicUser(result.updatedUser),
    });
  });

  app.get('/api/provider/dashboard', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const profile = getOwnedOrScopedProviderProfile(user);
    if (!profile) {
      return res.json({
        profile: null,
        matchedRequests: [],
        myQuotes: [],
        jobs: [],
        reviews: [],
        notifications: [],
      });
    }

    const myMatches = db.data.request_matches.filter((m) => m.provider_id === profile.id);
    const matchMap = new Map(myMatches.map((m) => [m.request_id, m]));
    const urgencyRank: Record<string, number> = { emergency: 0, today: 1, scheduled: 2 };

    const matchedRequests = db.data.service_requests
      .filter((r) => matchMap.has(r.id) && (r.status === 'open' || r.status === 'quoted'))
      .sort((a, b) => {
        const rankDiff = (urgencyRank[a.urgency] ?? 1) - (urgencyRank[b.urgency] ?? 1);
        if (rankDiff !== 0) return rankDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .map((r) => ({
        ...r,
        exact_address: undefined,
        customer_phone: undefined,
        match_status: matchMap.get(r.id)?.status || 'pending',
      }));

    const myQuotes = db.data.quotes
      .filter((q) => q.provider_id === profile.id)
      .map((q) => {
        const reqItem = db.data.service_requests.find((r) => r.id === q.request_id);
        return {
          ...q,
          request_reference: reqItem?.reference_code,
          request_summary: reqItem?.problem_summary,
          request_city: reqItem?.city,
        };
      });

    const jobs = db.data.jobs
      .filter((j) => j.provider_id === profile.id)
      .map((j) => {
        const reqItem = db.data.service_requests.find((r) => r.id === j.request_id);
        return {
          ...j,
          urgency: reqItem?.urgency || 'today',
        };
      })
      .sort((a, b) => (urgencyRank[a.urgency] ?? 1) - (urgencyRank[b.urgency] ?? 1));
    const reviews = db.data.reviews.filter((r) => r.provider_id === profile.id);
    const notifications = db.data.notifications.filter((n) => n.user_id === user.id).slice(0, 20);

    res.json({ profile, matchedRequests, myQuotes, jobs, reviews, notifications });
  });

  // Scoped company access check for company members
  app.get('/api/company/provider-profile/:providerId', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const profile = getOwnedOrScopedProviderProfile(user, req.params.providerId);
    if (!profile && !isOpsStaff(user)) {
      return res.status(403).json({
        error: 'Forbidden: company access is restricted to your assigned company profile.',
      });
    }
    const target =
      profile || db.data.provider_profiles.find((p) => p.id === req.params.providerId) || null;
    if (!target) return res.status(404).json({ error: 'Provider profile not found' });
    res.json({ providerProfile: target });
  });

  app.post('/api/provider/availability', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const owned = getOwnedOrScopedProviderProfile(user);
    if (!owned) return res.status(404).json({ error: 'Provider profile not found' });

    const updated = await db.runTransaction(() => {
      const profile = db.data.provider_profiles.find((p) => p.id === owned.id)!;
      if (req.body.is_available_now !== undefined) {
        profile.is_available_now = Boolean(req.body.is_available_now);
      }
      if (req.body.emergency_available !== undefined) {
        profile.emergency_available = Boolean(req.body.emergency_available);
      }
      return profile;
    });

    res.json({ providerProfile: updated });
  });

  app.post('/api/provider/requests/:requestId/quote', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const owned = getOwnedOrScopedProviderProfile(user);
    if (!owned) return res.status(404).json({ error: 'Provider profile not found' });
    if (owned.status !== 'approved') {
      return res.status(403).json({
        error: 'Only verified, approved providers can submit quotes.',
      });
    }

    const {
      estimate_template,
      service_fee,
      parts_line_items,
      estimated_price,
      labour_cost,
      parts_cost,
      parts_included,
      eta_text,
      estimated_duration,
      warranty_terms,
      message,
    } = req.body;

    const cleanPartsItems = Array.isArray(parts_line_items)
      ? parts_line_items
          .filter(
            (item: { label?: string; cost?: number | string }) =>
              item &&
              String(item.label || '').trim() &&
              Number.isFinite(Number(item.cost)) &&
              Number(item.cost) >= 0
          )
          .slice(0, 12)
          .map((item: { label: string; cost: number | string }) => ({
            label: String(item.label).trim().slice(0, 80),
            cost: Math.round(Number(item.cost) * 100) / 100,
          }))
      : [];

    const parsedServiceFee =
      service_fee !== undefined && service_fee !== '' && service_fee !== null
        ? Number(service_fee)
        : labour_cost !== undefined && labour_cost !== '' && labour_cost !== null
          ? Number(labour_cost)
          : null;

    if (parsedServiceFee !== null && (!Number.isFinite(parsedServiceFee) || parsedServiceFee < 0)) {
      return res.status(400).json({ error: 'Invalid service fee.' });
    }

    const parsedPartsCost =
      cleanPartsItems.length > 0
        ? cleanPartsItems.reduce((sum: number, item: { cost: number }) => sum + item.cost, 0)
        : parts_cost !== undefined && parts_cost !== '' && parts_cost !== null
          ? Number(parts_cost)
          : 0;

    if (!Number.isFinite(parsedPartsCost) || parsedPartsCost < 0) {
      return res.status(400).json({ error: 'Invalid parts cost.' });
    }

    const computedTotal =
      parsedServiceFee !== null && parsedServiceFee > 0
        ? Math.round((parsedServiceFee + parsedPartsCost) * 100) / 100
        : Math.round(Number(estimated_price || 0) * 100) / 100;

    if (!Number.isFinite(computedTotal) || computedTotal <= 0 || computedTotal > 250000 || !eta_text?.trim()) {
      return res.status(400).json({
        error: 'Valid finite service fee / estimated price ($1–$250,000) and ETA/availability are required.',
      });
    }

    try {
      const quote = await db.runTransaction(() => {
        const profile = db.data.provider_profiles.find((p) => p.id === owned.id)!;
        const match = db.data.request_matches.find(
          (m) => m.request_id === req.params.requestId && m.provider_id === profile.id
        );
        if (!match) {
          throw Object.assign(new Error('You are not matched to this request.'), { status: 403 });
        }
        if (match.status !== 'pending') {
          throw Object.assign(new Error('You have already responded to this request match.'), {
            status: 409,
          });
        }

        const request = db.data.service_requests.find((r) => r.id === req.params.requestId);
        if (!request) {
          throw Object.assign(new Error('Request not found'), { status: 404 });
        }
        if (request.status !== 'open' && request.status !== 'quoted') {
          throw Object.assign(new Error('This request is no longer accepting quotes.'), {
            status: 409,
          });
        }
        const activeJob = db.data.jobs.some(
          (j) => j.request_id === request.id && j.status !== 'cancelled'
        );
        if (activeJob) {
          throw Object.assign(new Error('This request has already been assigned.'), { status: 409 });
        }
        const existingQuote = db.data.quotes.some(
          (q) =>
            q.request_id === request.id &&
            q.provider_id === profile.id &&
            (q.status === 'pending' || q.status === 'accepted')
        );
        if (existingQuote) {
          throw Object.assign(new Error('A quote from your profile already exists for this request.'), {
            status: 409,
          });
        }

        const now = new Date().toISOString();
        const created = {
          id: db.newId('qt'),
          request_id: request.id,
          provider_id: profile.id,
          estimate_template: (estimate_template === 'flat_rate'
            ? 'flat_rate'
            : 'service_fee_plus_parts') as 'service_fee_plus_parts' | 'flat_rate',
          service_fee: parsedServiceFee,
          parts_line_items: cleanPartsItems,
          estimated_price: computedTotal,
          labour_cost: parsedServiceFee,
          parts_cost: parsedPartsCost > 0 || cleanPartsItems.length > 0 ? parsedPartsCost : null,
          parts_included:
            Boolean(parts_included) || parsedPartsCost > 0 || cleanPartsItems.length > 0,
          eta_text: String(eta_text).trim().slice(0, 120),
          estimated_duration: String(estimated_duration || '1–2 hours').trim().slice(0, 80),
          warranty_terms: String(warranty_terms || '90-day workmanship warranty')
            .trim()
            .slice(0, 160),
          message: String(message || '').trim().slice(0, 1000),
          status: 'pending' as const,
          is_demo: Boolean(profile.is_demo),
          created_at: now,
        };

        db.data.quotes.unshift(created);
        match.status = 'quoted';
        if (request.status === 'open') request.status = 'quoted';

        notificationService.onQuoteSubmitted({
          customerId: request.customer_id,
          providerBusinessName: profile.business_name,
          estimatedPrice: created.estimated_price,
          referenceCode: request.reference_code,
        });

        return created;
      });

      res.status(201).json({ quote });
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Unable to submit quote' });
    }
  });

  app.post('/api/provider/requests/:requestId/decline', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const owned = getOwnedOrScopedProviderProfile(user);
    if (!owned) return res.status(404).json({ error: 'Provider profile not found' });

    const { reason } = req.body as { reason?: string };

    try {
      await db.runTransaction(() => {
        const match = db.data.request_matches.find(
          (m) => m.request_id === req.params.requestId && m.provider_id === owned.id
        );
        if (!match) {
          throw Object.assign(new Error('Not matched to this request'), { status: 403 });
        }
        if (match.status !== 'pending') {
          throw Object.assign(new Error('Match is no longer pending.'), { status: 409 });
        }

        const request = db.data.service_requests.find((r) => r.id === req.params.requestId);
        if (request && !['open', 'quoted'].includes(request.status)) {
          throw Object.assign(new Error('Request can no longer be declined.'), { status: 409 });
        }

        match.status = 'declined';
        match.decline_reason = String(reason || 'Unavailable').trim().slice(0, 240);

        if (request && request.request_type === 'direct') {
          request.status = 'declined_by_provider';
          notificationService.onDirectRequestDeclined({
            customerId: request.customer_id,
            providerBusinessName: owned.business_name,
            referenceCode: request.reference_code,
          });
        }
      });

      res.json({ success: true });
    } catch (err) {
      const status = (err as { status?: number }).status || 500;
      res.status(status).json({ error: err instanceof Error ? err.message : 'Unable to decline request' });
    }
  });

  app.post('/api/provider/jobs/:jobId/status', async (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const owned = getOwnedOrScopedProviderProfile(user);
    if (!owned) return res.status(404).json({ error: 'Provider profile not found' });

    const { status, note } = req.body as { status?: JobStatus; note?: string };
    const validTargetStatuses: JobStatus[] = [
      'on_the_way',
      'arrived',
      'work_in_progress',
      'completed',
      'cancelled',
    ];
    if (!status || !validTargetStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid job status transition.' });
    }

    try {
      const updatedJob = await db.runTransaction(() => {
        const profile = db.data.provider_profiles.find((p) => p.id === owned.id)!;
        const job = db.data.jobs.find((j) => j.id === req.params.jobId);
        if (!job) {
          throw Object.assign(new Error('Job not found'), { status: 404 });
        }
        if (job.provider_id !== profile.id) {
          throw Object.assign(new Error('Forbidden'), { status: 403 });
        }

        const allowedNext = ALLOWED_JOB_TRANSITIONS[job.status] || [];
        if (!allowedNext.includes(status)) {
          throw Object.assign(
            new Error(`Invalid state transition from "${job.status}" to "${status}".`),
            { status: 409 }
          );
        }

        const now = new Date().toISOString();
        job.status = status;
        job.updated_at = now;
        job.status_history.push({
          status,
          note: String(note || `Status updated to ${status.replace(/_/g, ' ')}`)
            .trim()
            .slice(0, 400),
          timestamp: now,
          actor_role: user.role,
        });

        const request = db.data.service_requests.find((r) => r.id === job.request_id);
        if (request) {
          if (status === 'completed') {
            request.status = 'completed';
            profile.completed_jobs_count += 1;
          } else if (status === 'cancelled') {
            request.status = 'cancelled';
          } else {
            request.status = 'in_progress';
          }
        } else if (status === 'completed') {
          profile.completed_jobs_count += 1;
        }

        notificationService.onJobStatusUpdated({
          customerId: job.customer_id,
          providerBusinessName: profile.business_name,
          referenceCode: job.reference_code,
          status,
        });

        return job;
      });

      res.json({ job: updatedJob });
    } catch (err) {
      const statusCode = (err as { status?: number }).status || 500;
      res.status(statusCode).json({
        error: err instanceof Error ? err.message : 'Unable to update job status',
      });
    }
  });

  // ==========================================
  // ADMIN & OPERATIONS API (Strict RBAC)
  // ==========================================
  app.get('/api/admin/overview', (req, res) => {
    const user = getAuthUser(req);
    if (!user || !isOpsStaff(user)) {
      return res.status(403).json({ error: 'Operations or administrator access required.' });
    }

    res.json({
      providers: db.data.provider_profiles,
      categories: db.data.service_categories,
      subcategories: db.data.service_subcategories,
      requests: db.data.service_requests,
      jobs: db.data.jobs,
      disputes: db.data.disputes,
      audit_logs: db.data.audit_logs.slice(0, 50),
      stats: {
        total_customers: db.data.users.filter((u) => u.role === 'customer').length,
        total_providers: db.data.provider_profiles.length,
        pending_verifications: db.data.provider_profiles.filter(
          (p) => p.status === 'pending_verification' || p.status === 'submitted'
        ).length,
        open_requests: db.data.service_requests.filter(
          (r) => r.status === 'open' || r.status === 'quoted'
        ).length,
        active_jobs: db.data.jobs.filter(
          (j) => j.status !== 'completed' && j.status !== 'cancelled'
        ).length,
        open_disputes: db.data.disputes.filter((d) => d.status !== 'resolved').length,
      },
    });
  });

  app.get('/api/admin/financial-summary', (req, res) => {
    const user = getAuthUser(req);
    if (!user || !canAccessFinancialFunctions(user)) {
      return res.status(403).json({
        error: 'Restricted: administrator or finance role required for financial records.',
      });
    }

    const completedJobs = db.data.jobs.filter((j) => j.status === 'completed');
    const totalEstimatedVolumeCad = completedJobs.reduce(
      (sum, j) => sum + (Number(j.estimated_price) || 0),
      0
    );

    db.data.audit_logs.unshift({
      id: db.newId('aud'),
      actor_id: user.id,
      actor_name: user.name,
      action: 'FINANCIAL_SUMMARY_ACCESSED',
      target_type: 'finance',
      target_id: 'summary',
      details: `${user.role} accessed financial summary metrics.`,
      created_at: new Date().toISOString(),
    });
    db.save();

    res.json({
      livePaymentsEnabled: false,
      completedJobsCount: completedJobs.length,
      totalEstimatedVolumeCad: Math.round(totalEstimatedVolumeCad * 100) / 100,
    });
  });

  app.post('/api/admin/providers/:providerId/status', async (req, res) => {
    const user = getAuthUser(req);
    if (!user || !isOpsStaff(user)) {
      return res.status(403).json({ error: 'Operations or administrator access required.' });
    }

    const { status, verifications, note } = req.body as {
      status?: ProviderStatus;
      verifications?: Partial<ProviderProfile['verifications']>;
      note?: string;
    };

    if (status !== undefined && !VALID_PROVIDER_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid provider status value.' });
    }

    try {
      const provider = await db.runTransaction(() => {
        const target = db.data.provider_profiles.find((p) => p.id === req.params.providerId);
        if (!target) {
          throw Object.assign(new Error('Provider not found'), { status: 404 });
        }

        if (status) target.status = status;
        if (verifications && typeof verifications === 'object') {
          if (verifications.email_verified !== undefined) {
            target.verifications.email_verified = Boolean(verifications.email_verified);
          }
          if (verifications.phone_verified !== undefined) {
            target.verifications.phone_verified = Boolean(verifications.phone_verified);
          }
          if (verifications.business_verified !== undefined) {
            target.verifications.business_verified = Boolean(verifications.business_verified);
          }
          if (verifications.license_verified !== undefined) {
            target.verifications.license_verified = Boolean(verifications.license_verified);
          }
          if (verifications.insurance_verified !== undefined) {
            target.verifications.insurance_verified = Boolean(verifications.insurance_verified);
          }
          if (verifications.profile_reviewed !== undefined) {
            target.verifications.profile_reviewed = Boolean(verifications.profile_reviewed);
          }
        }

        const now = new Date().toISOString();
        db.data.audit_logs.unshift({
          id: db.newId('aud'),
          actor_id: user.id,
          actor_name: user.name,
          action: `PROVIDER_${(status || 'UPDATED').toUpperCase()}`,
          target_type: 'provider_profile',
          target_id: target.id,
          details:
            (note || `Updated ${target.business_name} status to ${target.status}.`).slice(0, 500),
          created_at: now,
        });

        notificationService.onProviderVerificationUpdated({
          providerUserId: target.user_id,
          status: target.status,
        });

        return target;
      });

      res.json({ provider });
    } catch (err) {
      const code = (err as { status?: number }).status || 500;
      res.status(code).json({ error: err instanceof Error ? err.message : 'Update failed' });
    }
  });

  app.post('/api/admin/categories', async (req, res) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }

    const { name, description, slug, division } = req.body as Partial<ServiceCategory>;
    if (!name?.trim()) return res.status(400).json({ error: 'Category name is required.' });

    const cleanSlug =
      (slug || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'category';

    try {
      const newCat = await db.runTransaction(() => {
        if (db.data.service_categories.some((c) => c.slug === cleanSlug)) {
          throw Object.assign(new Error('A category with this slug already exists.'), { status: 409 });
        }

        const created: ServiceCategory = {
          id: db.newId('cat'),
          slug: cleanSlug,
          division: division === 'auto' ? 'auto' : 'home',
          name: name.trim(),
          description: (description || '').trim(),
          image_url: '/src/assets/images/category_home_appliance_1794446298673.jpg',
          is_active: true,
          seo_title: `${name.trim()} Professionals in Ontario | WorldLeo`,
          seo_description: (
            description ||
            `Find independent ${name.trim()} professionals across the GTA, Hamilton, and Niagara.`
          ).trim(),
          dynamic_fields: [
            {
              key: 'item_description',
              label: 'Item, room, or vehicle needing service',
              type: 'text',
              required: true,
              placeholder: 'Describe item or scope',
            },
          ],
        };

        db.data.service_categories.push(created);
        db.data.audit_logs.unshift({
          id: db.newId('aud'),
          actor_id: user.id,
          actor_name: user.name,
          action: 'CATEGORY_CREATED',
          target_type: 'service_category',
          target_id: created.id,
          details: `Created service category: ${created.name}`,
          created_at: new Date().toISOString(),
        });
        return created;
      });

      res.status(201).json({ category: newCat });
    } catch (err) {
      const code = (err as { status?: number }).status || 500;
      res.status(code).json({ error: err instanceof Error ? err.message : 'Unable to create category' });
    }
  });

  app.post('/api/admin/disputes/:disputeId/resolve', async (req, res) => {
    const user = getAuthUser(req);
    if (!user || !isOpsStaff(user)) {
      return res.status(403).json({ error: 'Operations or administrator access required.' });
    }

    const { resolution_notes } = req.body as { resolution_notes?: string };

    try {
      const dispute = await db.runTransaction(() => {
        const target = db.data.disputes.find((d) => d.id === req.params.disputeId);
        if (!target) {
          throw Object.assign(new Error('Dispute not found'), { status: 404 });
        }
        target.status = 'resolved';
        target.resolution_notes = String(
          resolution_notes || 'Reviewed and resolved by WorldLeo Operations.'
        )
          .trim()
          .slice(0, 1000);

        db.data.audit_logs.unshift({
          id: db.newId('aud'),
          actor_id: user.id,
          actor_name: user.name,
          action: 'DISPUTE_RESOLVED',
          target_type: 'dispute',
          target_id: target.id,
          details: target.resolution_notes,
          created_at: new Date().toISOString(),
        });

        return target;
      });

      res.json({ dispute });
    } catch (err) {
      const code = (err as { status?: number }).status || 500;
      res.status(code).json({ error: err instanceof Error ? err.message : 'Unable to resolve dispute' });
    }
  });

  return app;
}

const app = createApp();
export { app };

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// ==========================================
async function startServer() {
  const httpServer = http.createServer(app);
  const disableHmr = process.env.DISABLE_HMR === 'true';

  if (process.env.NODE_ENV !== 'production') {
    if (disableHmr) {
      app.get('/@vite/client', (_req, res) => {
        res.type('application/javascript').send(`
const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    style.remove();
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  return {
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
    data: {},
  };
}
export function injectQuery(url, queryToInject) {
  if (!url || (url[0] !== '.' && url[0] !== '/')) return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');
}
export class ErrorOverlay extends HTMLElement {}
`);
      });
    }

    const vitePromise = createViteServer({
      server: {
        middlewareMode: true,
        hmr: !disableHmr,
        ws: disableHmr ? false : { server: httpServer },
      },
      appType: 'spa',
    });

    vitePromise.catch((err) => {
      console.error('Vite dev server initialization error:', err);
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`WorldLeo platform server listening on http://localhost:${PORT}`);
  });
}

if (process.env.WORLDLEO_SKIP_SERVER_LISTEN !== 'true') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

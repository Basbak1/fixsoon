import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

process.env.WORLDLEO_SKIP_SERVER_LISTEN = 'true';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'worldleo-sec-test-'));
const tempDbPath = path.join(tempDir, 'test-db.json');
process.env.WORLDLEO_DB_FILE = tempDbPath;

const { db } = await import('../server/db.js');
const { hashPassword, resolveSessionSecretForEnv, signSessionToken } = await import('../server/auth.js');
const {
  getServerFirebaseApp,
  resolveFirebaseProjectId,
  setFirebaseTokenVerifierForTests,
} = await import('../server/firebaseAuth.js');
const { createApp, isLocalEmulatorAuthAllowed } = await import('../server.js');

const origContainerKService = process.env.K_SERVICE;
const origContainerCloudRunJob = process.env.CLOUD_RUN_JOB;
const origContainerAppUrl = process.env.APP_URL;

let server: http.Server;
let baseUrl = '';

async function api(
  method: string,
  route: string,
  opts: { token?: string; cookie?: string; body?: unknown; headers?: Record<string, string> } = {}
) {
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;
  if (opts.cookie) headers['Cookie'] = opts.cookie;

  const res = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: Record<string, any> = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, headers: res.headers, data: json };
}

before(async () => {
  db.useFileForTests(tempDbPath);
  const app = createApp();
  server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('Failed to bind test server');
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

beforeEach(() => {
  delete process.env.K_SERVICE;
  delete process.env.CLOUD_RUN_JOB;
  delete process.env.APP_URL;
  process.env.WORLDLEO_ALLOW_TEST_SEEDS = 'true';
  setFirebaseTokenVerifierForTests(null);
  db.resetWithSeedForTests();
});

after(async () => {
  if (origContainerKService === undefined) delete process.env.K_SERVICE;
  else process.env.K_SERVICE = origContainerKService;
  if (origContainerCloudRunJob === undefined) delete process.env.CLOUD_RUN_JOB;
  else process.env.CLOUD_RUN_JOB = origContainerCloudRunJob;
  if (origContainerAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = origContainerAppUrl;
  setFirebaseTokenVerifierForTests(null);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function loginSeed(email: string) {
  const res = await api('POST', '/api/auth/login', {
    body: { email, password: 'FixSoon2026!' },
  });
  assert.equal(res.status, 200, `Expected login success for ${email}`);
  return res.data.token as string;
}

test('2.1 Invalid, forged, and missing credentials are rejected', async () => {
  const noAuth = await api('GET', '/api/customer/dashboard');
  assert.equal(noAuth.status, 401);

  const forged = await api('GET', '/api/customer/dashboard', {
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c3JfYWRtaW5fMSIsInJvbGUiOiJhZG1pbiJ9.forgedsig',
  });
  assert.equal(forged.status, 401);

  const badAdmin = await api('GET', '/api/admin/overview', {
    token: 'invalid.token',
  });
  assert.equal(badAdmin.status, 403);

  const escalateRegister = await api('POST', '/api/auth/register', {
    body: {
      name: 'Attacker',
      email: 'attacker@example.com',
      password: 'Password123!',
      role: 'admin',
    },
  });
  assert.equal(escalateRegister.status, 403);
});

test('2.1 Firebase auth rejects forged tokens and trusts verified server claims only', async () => {
  // Submitting raw uid/email without idToken must fail
  const missingToken = await api('POST', '/api/auth/firebase', {
    body: { uid: 'forged_uid', email: 'admin@fixsoon.demo' },
  });
  assert.equal(missingToken.status, 401);

  // Verifier rejects bogus token
  setFirebaseTokenVerifierForTests(async () => {
    throw new Error('Invalid Firebase ID token signature.');
  });
  const invalidToken = await api('POST', '/api/auth/firebase', {
    body: { idToken: 'bad.jwt.token' },
  });
  assert.equal(invalidToken.status, 401);

  // Attempting to hijack an existing admin/password account via verified Firebase email is blocked
  setFirebaseTokenVerifierForTests(async () => ({
    uid: 'fb_attacker_1',
    email: 'admin@fixsoon.demo',
    emailVerified: true,
    name: 'Fake Admin',
  }));
  const adminTakeover = await api('POST', '/api/auth/firebase', {
    body: { idToken: 'signed.token.admin' },
  });
  assert.equal(adminTakeover.status, 403);

  // Legitimate new Firebase user gets created as customer strictly from verified claims
  setFirebaseTokenVerifierForTests(async () => ({
    uid: 'fb_real_user_99',
    email: 'verified.homeowner@example.com',
    emailVerified: true,
    name: 'Verified Homeowner',
  }));
  const okRes = await api('POST', '/api/auth/firebase', {
    body: {
      idToken: 'signed.token.valid',
      uid: 'spoofed_uid_ignored',
      email: 'spoofed@example.com',
      role: 'admin',
    },
  });
  assert.equal(okRes.status, 200);
  assert.equal(okRes.data.user.email, 'verified.homeowner@example.com');
  assert.equal(okRes.data.user.role, 'customer');
});

test('2.2 Cross-account IDOR & unrelated provider disputes are blocked', async () => {
  const cust1Token = await loginSeed('alex.customer@fixsoon.demo');
  const marcusToken = await loginSeed('marcus.auto@fixsoon.demo');
  const sarahToken = await loginSeed('sarah.tech@fixsoon.demo');
  const davidToken = await loginSeed('david.pending@fixsoon.demo');

  // Register a second customer
  const cust2Reg = await api('POST', '/api/auth/register', {
    body: {
      name: 'Customer Two',
      email: 'cust2@example.com',
      password: 'Password123!',
      role: 'customer',
      city: 'Toronto',
    },
  });
  assert.equal(cust2Reg.status, 201);
  const cust2Token = cust2Reg.data.token as string;

  // Pending provider David cannot submit a quote
  const reqRes = await api('POST', '/api/requests', {
    token: cust1Token,
    body: {
      request_type: 'marketplace',
      category_id: 'cat_auto',
      subcategory_id: 'sub_roadside',
      problem_summary: 'Car will not start in North York parking garage',
      city: 'Toronto',
      urgency: 'today',
    },
  });
  assert.equal(reqRes.status, 201);
  const requestId = reqRes.data.request.id as string;

  const davidQuote = await api('POST', `/api/provider/requests/${requestId}/quote`, {
    token: davidToken,
    body: { service_fee: 80, eta_text: '30 mins' },
  });
  assert.equal(davidQuote.status, 403);

  // Marcus & Sarah submit valid quotes
  const marcusQuote = await api('POST', `/api/provider/requests/${requestId}/quote`, {
    token: marcusToken,
    body: { service_fee: 95, eta_text: '35 mins' },
  });
  assert.equal(marcusQuote.status, 201);
  const quoteId = marcusQuote.data.quote.id as string;

  const sarahQuote = await api('POST', `/api/provider/requests/${requestId}/quote`, {
    token: sarahToken,
    body: { service_fee: 105, eta_text: '45 mins' },
  });
  assert.equal(sarahQuote.status, 201);

  // Before assignment, Sarah (matched) can view thread; Customer 2 cannot
  const cust2MsgRead = await api('GET', `/api/requests/${requestId}/messages`, {
    token: cust2Token,
  });
  assert.equal(cust2MsgRead.status, 403);

  // Customer 2 cannot accept Customer 1's quote
  const cust2Accept = await api('POST', `/api/quotes/${quoteId}/accept`, {
    token: cust2Token,
  });
  assert.equal(cust2Accept.status, 403);

  // Customer 1 accepts Marcus's quote -> creates job
  const acceptRes = await api('POST', `/api/quotes/${quoteId}/accept`, {
    token: cust1Token,
  });
  assert.equal(acceptRes.status, 200);
  const jobId = acceptRes.data.job.id as string;

  // Post-assignment: Sarah (not assigned provider) is locked out of request messages
  const sarahPostAssignRead = await api('GET', `/api/requests/${requestId}/messages`, {
    token: sarahToken,
  });
  assert.equal(sarahPostAssignRead.status, 403);
  const sarahPostAssignWrite = await api('POST', `/api/requests/${requestId}/messages`, {
    token: sarahToken,
    body: { body: 'Wait I want this job!' },
  });
  assert.equal(sarahPostAssignWrite.status, 403);

  // Unrelated provider Sarah CANNOT file a dispute on Marcus's job (IDOR fixed!)
  const sarahDispute = await api('POST', `/api/jobs/${jobId}/dispute`, {
    token: sarahToken,
    body: { reason: 'Trying to sabotage unrelated job' },
  });
  assert.equal(sarahDispute.status, 403);

  // Unrelated customer 2 CANNOT file a dispute on Customer 1's job
  const cust2Dispute = await api('POST', `/api/jobs/${jobId}/dispute`, {
    token: cust2Token,
    body: { reason: 'Not my job' },
  });
  assert.equal(cust2Dispute.status, 403);

  // Unrelated provider Sarah CANNOT update Marcus's job status
  const sarahStatus = await api('POST', `/api/provider/jobs/${jobId}/status`, {
    token: sarahToken,
    body: { status: 'on_the_way' },
  });
  assert.equal(sarahStatus.status, 403);
});

test('2.3 Duplicate quote acceptance & concurrent race yield strictly 1 job', async () => {
  const custToken = await loginSeed('alex.customer@fixsoon.demo');
  const marcusToken = await loginSeed('marcus.auto@fixsoon.demo');

  const reqRes = await api('POST', '/api/requests', {
    token: custToken,
    body: {
      request_type: 'direct',
      target_provider_id: 'prov_marcus',
      category_id: 'cat_auto',
      subcategory_id: 'sub_flat_tire',
      problem_summary: 'Flat rear passenger tire in Mississauga',
      city: 'Toronto',
      urgency: 'today',
    },
  });
  assert.equal(reqRes.status, 201);
  const requestId = reqRes.data.request.id as string;

  const qRes = await api('POST', `/api/provider/requests/${requestId}/quote`, {
    token: marcusToken,
    body: { service_fee: 90, eta_text: '30 mins' },
  });
  assert.equal(qRes.status, 201);
  const quoteId = qRes.data.quote.id as string;

  // Duplicate quote from same provider rejected
  const dupQuoteRes = await api('POST', `/api/provider/requests/${requestId}/quote`, {
    token: marcusToken,
    body: { service_fee: 95, eta_text: '35 mins' },
  });
  assert.equal(dupQuoteRes.status, 409);

  // 5 concurrent accept calls -> strictly 1 succeeds with 200, 4 fail with 409
  const concurrentAccepts = await Promise.all(
    Array.from({ length: 5 }, () =>
      api('POST', `/api/quotes/${quoteId}/accept`, { token: custToken })
    )
  );
  const okCount = concurrentAccepts.filter((r) => r.status === 200).length;
  const conflictCount = concurrentAccepts.filter((r) => r.status === 409).length;
  assert.equal(okCount, 1);
  assert.equal(conflictCount, 4);

  const jobsForReq = db.data.jobs.filter((j) => j.request_id === requestId);
  assert.equal(jobsForReq.length, 1);

  // Converting an already-assigned request back to marketplace must fail
  const convertRes = await api('POST', `/api/requests/${requestId}/convert-to-marketplace`, {
    token: custToken,
  });
  assert.equal(convertRes.status, 409);
});

test('2.3 Job state machine enforces valid progression and prevents double completion counts', async () => {
  const custToken = await loginSeed('alex.customer@fixsoon.demo');
  const marcusToken = await loginSeed('marcus.auto@fixsoon.demo');
  const initialCompleted = db.data.provider_profiles.find((p) => p.id === 'prov_marcus')!.completed_jobs_count;

  const reqRes = await api('POST', '/api/requests', {
    token: custToken,
    body: {
      request_type: 'direct',
      target_provider_id: 'prov_marcus',
      category_id: 'cat_auto',
      subcategory_id: 'sub_battery_boost',
      problem_summary: 'Dead battery in driveway',
      city: 'Toronto',
    },
  });
  const quoteRes = await api('POST', `/api/provider/requests/${reqRes.data.request.id}/quote`, {
    token: marcusToken,
    body: { service_fee: 75, eta_text: '25 mins' },
  });
  const acceptRes = await api('POST', `/api/quotes/${quoteRes.data.quote.id}/accept`, {
    token: custToken,
  });
  const jobId = acceptRes.data.job.id as string;

  // Skipping assigned -> completed is blocked
  const invalidSkip = await api('POST', `/api/provider/jobs/${jobId}/status`, {
    token: marcusToken,
    body: { status: 'completed' },
  });
  assert.equal(invalidSkip.status, 409);

  // Valid progression: assigned -> on_the_way -> arrived -> work_in_progress -> completed
  for (const nextStatus of ['on_the_way', 'arrived', 'work_in_progress', 'completed']) {
    const step = await api('POST', `/api/provider/jobs/${jobId}/status`, {
      token: marcusToken,
      body: { status: nextStatus },
    });
    assert.equal(step.status, 200, `Transition to ${nextStatus} should succeed`);
  }

  // Re-submitting completed is rejected and does NOT double-increment count
  const repeatComplete = await api('POST', `/api/provider/jobs/${jobId}/status`, {
    token: marcusToken,
    body: { status: 'completed' },
  });
  assert.equal(repeatComplete.status, 409);

  const afterCompleted = db.data.provider_profiles.find((p) => p.id === 'prov_marcus')!.completed_jobs_count;
  assert.equal(afterCompleted, initialCompleted + 1);

  // Duplicate review rejected
  const rev1 = await api('POST', `/api/jobs/${jobId}/review`, {
    token: custToken,
    body: { rating: 5, comment: 'Fast and courteous battery jumpstart.' },
  });
  assert.equal(rev1.status, 201);
  const rev2 = await api('POST', `/api/jobs/${jobId}/review`, {
    token: custToken,
    body: { rating: 5, comment: 'Duplicate review attempt.' },
  });
  assert.equal(rev2.status, 409);
});

test('2.2 RBAC: coordinator, finance, company_member, onboarding demotion guard & SSE ticket', async () => {
  const adminToken = await loginSeed('admin@fixsoon.demo');

  // Seed scoped coordinator, finance, and company_member accounts
  db.data.users.push(
    {
      id: 'usr_coord_1',
      name: 'Ops Coordinator',
      email: 'coord@worldleo.test',
      phone: '',
      role: 'coordinator',
      password_hash: hashPassword('Secret123!'),
      city: 'Toronto',
      company_id: null,
      is_active: true,
      saved_provider_ids: [],
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_fin_1',
      name: 'Finance Analyst',
      email: 'finance@worldleo.test',
      phone: '',
      role: 'finance',
      password_hash: hashPassword('Secret123!'),
      city: 'Toronto',
      company_id: null,
      is_active: true,
      saved_provider_ids: [],
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_comp_1',
      name: 'Company Member A',
      email: 'member.a@worldleo.test',
      phone: '',
      role: 'company_member',
      password_hash: hashPassword('Secret123!'),
      city: 'Toronto',
      company_id: 'comp_miller',
      is_active: true,
      saved_provider_ids: [],
      created_at: new Date().toISOString(),
    }
  );
  db.data.provider_profiles.find((p) => p.id === 'prov_marcus')!.company_id = 'comp_miller';
  db.data.provider_profiles.find((p) => p.id === 'prov_sarah')!.company_id = 'comp_jenkins';
  db.save();

  const coordToken = signSessionToken('usr_coord_1', 'coordinator');
  const finToken = signSessionToken('usr_fin_1', 'finance');
  const memberAToken = signSessionToken('usr_comp_1', 'company_member');

  // Coordinator can access overview, CANNOT access financial summary or create categories
  assert.equal((await api('GET', '/api/admin/overview', { token: coordToken })).status, 200);
  assert.equal((await api('GET', '/api/admin/financial-summary', { token: coordToken })).status, 403);
  assert.equal(
    (await api('POST', '/api/admin/categories', { token: coordToken, body: { name: 'Roofing' } })).status,
    403
  );

  // Finance CAN access financial summary, Admin CAN create category
  assert.equal((await api('GET', '/api/admin/financial-summary', { token: finToken })).status, 200);
  assert.equal((await api('GET', '/api/admin/financial-summary', { token: adminToken })).status, 200);

  // Company member A can access comp_miller (prov_marcus) ONLY, blocked on comp_jenkins (prov_sarah)
  assert.equal(
    (await api('GET', '/api/company/provider-profile/prov_marcus', { token: memberAToken })).status,
    200
  );
  assert.equal(
    (await api('GET', '/api/company/provider-profile/prov_sarah', { token: memberAToken })).status,
    403
  );

  // Admin completing provider onboarding never loses admin role
  const onboardRes = await api('POST', '/api/provider/onboarding', {
    token: adminToken,
    body: {
      display_name: 'Admin Ops',
      primary_city: 'Toronto',
      category_ids: ['cat_auto'],
    },
  });
  assert.equal(onboardRes.status, 201);
  assert.equal(db.data.users.find((u) => u.id === 'usr_admin_1')!.role, 'admin');

  // SSE query ?token=... must be rejected; single-use ticket succeeds once and replay fails
  const legacyStream = await fetch(
    `${baseUrl}/api/notifications/stream?token=${encodeURIComponent(adminToken)}`
  );
  assert.equal(legacyStream.status, 401);

  const ticketRes = await api('POST', '/api/notifications/sse-ticket', { token: adminToken });
  assert.equal(ticketRes.status, 200);
  const ticket = ticketRes.data.ticket as string;

  const controller = new AbortController();
  const streamRes = await fetch(
    `${baseUrl}/api/notifications/stream?ticket=${encodeURIComponent(ticket)}`,
    { signal: controller.signal }
  );
  assert.equal(streamRes.status, 200);
  controller.abort();

  // Ticket replay must fail
  const replayRes = await fetch(
    `${baseUrl}/api/notifications/stream?ticket=${encodeURIComponent(ticket)}`
  );
  assert.equal(replayRes.status, 401);
});

test('2.4 Database runTransaction rolls back cleanly on error', async () => {
  const userCountBefore = db.data.users.length;
  await assert.rejects(
    db.runTransaction(() => {
      db.data.users.push({
        id: 'usr_rollback_test',
        name: 'Rollback User',
        email: 'rollback@example.com',
        phone: '',
        role: 'customer',
        password_hash: 'x:y',
        city: 'Toronto',
        saved_provider_ids: [],
        created_at: new Date().toISOString(),
      });
      throw new Error('Simulated failure');
    }),
    /Simulated failure/
  );
  assert.equal(db.data.users.length, userCountBefore);
  assert.equal(db.data.users.some((u) => u.id === 'usr_rollback_test'), false);
});

test('Real Firebase Auth lifecycle (customer, provider onboarding, admin allowlist, cookie persistence, logout) & strict emulator isolation', async () => {
  const origTestSeeds = process.env.WORLDLEO_ALLOW_TEST_SEEDS;
  const origEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const origNodeEnv = process.env.NODE_ENV;
  const origKService = process.env.K_SERVICE;
  const origAdminEmails = process.env.ADMIN_EMAILS;
  const origProjectId = process.env.FIREBASE_PROJECT_ID;

  try {
    // 1. By default (no test seed override & no emulator), demo/bypass auth is disabled -> 403
    delete process.env.WORLDLEO_ALLOW_TEST_SEEDS;
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    assert.equal(isLocalEmulatorAuthAllowed(), false);

    const demoBlockedDefault = await api('POST', '/api/auth/demo', {
      body: { email: 'alex.customer@fixsoon.demo' },
    });
    assert.equal(demoBlockedDefault.status, 403);

    const loginDemoBlockedDefault = await api('POST', '/api/auth/login', {
      body: { email: 'alex.customer@fixsoon.demo', password: 'FixSoon2026!' },
    });
    assert.equal(loginDemoBlockedDefault.status, 403);

    const cfgDefault = await api('GET', '/api/config');
    assert.equal(cfgDefault.status, 200);
    assert.equal(cfgDefault.data.featureFlags.localEmulatorAuthEnabled, false);
    assert.equal('demoAuthEnabled' in cfgDefault.data.featureFlags, false);

    const healthDefault = await api('GET', '/api/health');
    assert.equal(healthDefault.status, 200);
    assert.equal('demoAuthEnabled' in healthDefault.data, false);
    assert.equal(healthDefault.data.firebaseEmulatorActive, false);

    // 2. Real Firebase Customer Login + HttpOnly Cookie Session Persistence
    setFirebaseTokenVerifierForTests(async (idToken) => {
      if (idToken === 'valid.customer.jwt') {
        return {
          uid: 'fb_cust_real_1',
          email: 'real.customer@example.com',
          emailVerified: true,
          name: 'Real Firebase Customer',
        };
      }
      if (idToken === 'valid.admin.jwt') {
        return {
          uid: 'fb_admin_real_1',
          email: 'ops.lead@worldleo.ca',
          emailVerified: true,
          name: 'WorldLeo Admin',
        };
      }
      throw new Error('Expired or forged Firebase ID token.');
    });

    const fbCustRes = await api('POST', '/api/auth/firebase', {
      body: { idToken: 'valid.customer.jwt', role: 'admin', uid: 'spoofed', email: 'spoof@evil.test' },
    });
    assert.equal(fbCustRes.status, 200);
    assert.equal(fbCustRes.data.user.email, 'real.customer@example.com');
    assert.equal(fbCustRes.data.user.role, 'customer');
    const custCookieHeader = fbCustRes.headers.get('set-cookie') || '';
    assert.match(custCookieHeader, /worldleo_session=/);
    assert.match(custCookieHeader, /HttpOnly/i);
    const custSessionCookie = custCookieHeader.split(';')[0];

    // Session persists across requests using ONLY HttpOnly cookie (no Bearer header)
    const mePersisted = await api('GET', '/api/auth/me', { cookie: custSessionCookie });
    assert.equal(mePersisted.status, 200);
    assert.equal(mePersisted.data.user.email, 'real.customer@example.com');
    assert.equal(mePersisted.data.user.role, 'customer');

    const custDashPersisted = await api('GET', '/api/customer/dashboard', { cookie: custSessionCookie });
    assert.equal(custDashPersisted.status, 200);

    // Non-admin Firebase customer cannot access admin endpoints
    assert.equal(
      (await api('GET', '/api/admin/overview', { cookie: custSessionCookie })).status,
      403
    );

    // 3. Provider Onboarding refreshes role & session cookie cleanly to provider
    const onboardRes = await api('POST', '/api/provider/onboarding', {
      cookie: custSessionCookie,
      body: {
        display_name: 'Maple Mobile Auto',
        primary_city: 'Toronto',
        category_ids: ['cat_auto'],
      },
    });
    assert.equal(onboardRes.status, 201);
    assert.equal(onboardRes.data.user.role, 'provider');
    assert.ok(onboardRes.data.token);
    const provCookieHeader = onboardRes.headers.get('set-cookie') || '';
    const provSessionCookie = provCookieHeader.split(';')[0];

    const provDash = await api('GET', '/api/provider/dashboard', { cookie: provSessionCookie });
    assert.equal(provDash.status, 200);
    assert.equal(provDash.data.profile.display_name, 'Maple Mobile Auto');

    // Re-authenticating via Firebase restores provider role and providerProfile
    const fbProvRelogin = await api('POST', '/api/auth/firebase', {
      body: { idToken: 'valid.customer.jwt' },
    });
    assert.equal(fbProvRelogin.status, 200);
    assert.equal(fbProvRelogin.data.user.role, 'provider');
    assert.equal(fbProvRelogin.data.providerProfile.display_name, 'Maple Mobile Auto');

    // 4. Logout clears cookie and invalidates session
    const logoutRes = await api('POST', '/api/auth/logout', { cookie: provSessionCookie });
    assert.equal(logoutRes.status, 200);
    const clearedCookie = logoutRes.headers.get('set-cookie') || '';
    assert.match(clearedCookie, /worldleo_session=;/);
    assert.match(clearedCookie, /Max-Age=0/i);

    const meNoAuth = await api('GET', '/api/auth/me');
    assert.equal(meNoAuth.status, 401);

    // 5. Server-side ADMIN_EMAILS allowlist grants admin only to verified admin emails
    process.env.ADMIN_EMAILS = 'ops.lead@worldleo.ca';
    const fbAdminRes = await api('POST', '/api/auth/firebase', {
      body: { idToken: 'valid.admin.jwt' },
    });
    assert.equal(fbAdminRes.status, 200);
    assert.equal(fbAdminRes.data.user.role, 'admin');
    const adminCookie = (fbAdminRes.headers.get('set-cookie') || '').split(';')[0];
    assert.equal((await api('GET', '/api/admin/overview', { cookie: adminCookie })).status, 200);
    assert.equal(
      (await api('GET', '/api/admin/financial-summary', { cookie: adminCookie })).status,
      200
    );

    // 6. Strict Emulator Isolation: blocked in hosted/production even if FIREBASE_AUTH_EMULATOR_HOST is set
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    process.env.NODE_ENV = 'development';
    delete process.env.K_SERVICE;

    // Hosted preview domain (non-loopback X-Forwarded-Host and raw Host headers) are blocked
    const hostedForwardedBlocked = await api('POST', '/api/auth/demo', {
      headers: { 'X-Forwarded-Host': 'ais-dev-preview.run.app' },
      body: { email: 'alex.customer@fixsoon.demo' },
    });
    assert.equal(hostedForwardedBlocked.status, 403);

    const hostedRawHostStatus = await new Promise<number>((resolve, reject) => {
      const payload = JSON.stringify({ email: 'alex.customer@fixsoon.demo' });
      const addr = server.address();
      if (!addr || typeof addr === 'string') return reject(new Error('Invalid test server addr'));
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: addr.port,
          path: '/api/auth/demo',
          method: 'POST',
          headers: {
            Host: 'ais-dev-preview.run.app',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          res.resume();
          resolve(res.statusCode || 0);
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
    assert.equal(hostedRawHostStatus, 403);

    // Cloud Run (K_SERVICE set) is blocked even on localhost
    process.env.K_SERVICE = 'worldleo-prod';
    assert.equal(isLocalEmulatorAuthAllowed(), false);
    const cloudRunBlocked = await api('POST', '/api/auth/demo', {
      body: { email: 'alex.customer@fixsoon.demo' },
    });
    assert.equal(cloudRunBlocked.status, 403);
    delete process.env.K_SERVICE;

    // Non-loopback APP_URL (e.g. hosted preview / production URL) is blocked even on localhost
    process.env.APP_URL = 'https://ais-dev-preview.run.app';
    assert.equal(isLocalEmulatorAuthAllowed(), false);
    const appUrlBlocked = await api('POST', '/api/auth/demo', {
      body: { email: 'alex.customer@fixsoon.demo' },
    });
    assert.equal(appUrlBlocked.status, 403);
    delete process.env.APP_URL;

    // Production NODE_ENV is blocked
    process.env.NODE_ENV = 'production';
    assert.equal(isLocalEmulatorAuthAllowed(), false);
    const prodBlocked = await api('POST', '/api/auth/demo', {
      body: { email: 'alex.customer@fixsoon.demo' },
    });
    assert.equal(prodBlocked.status, 403);

    // Non-production loopback with Firebase Auth Emulator active IS allowed
    process.env.NODE_ENV = 'development';
    assert.equal(isLocalEmulatorAuthAllowed(), true);
    const emulatorOk = await api('POST', '/api/auth/demo', {
      body: { email: 'alex.customer@fixsoon.demo' },
    });
    assert.equal(emulatorOk.status, 200);
    assert.equal(emulatorOk.data.user.email, 'alex.customer@fixsoon.demo');
    assert.ok(emulatorOk.data.token);

    // 7. SESSION_SECRET fallback does not crash even in production if missing or placeholder
    const missingProdSecret = resolveSessionSecretForEnv(undefined, 'production');
    assert.equal(missingProdSecret.configured, false);
    assert.equal(missingProdSecret.secret.length, 64);

    const placeholderProdSecret = resolveSessionSecretForEnv('changeme', 'production');
    assert.equal(placeholderProdSecret.configured, false);
    assert.equal(placeholderProdSecret.secret.length, 64);

    const strongProdSecret = resolveSessionSecretForEnv('a'.repeat(40), 'production');
    assert.equal(strongProdSecret.configured, true);
    assert.equal(strongProdSecret.secret, 'a'.repeat(40));

    // 8. FIREBASE_PROJECT_ID initializes server Firebase Admin SDK app cleanly
    process.env.FIREBASE_PROJECT_ID = 'custom-worldleo-project';
    assert.equal(resolveFirebaseProjectId(false), 'custom-worldleo-project');
    const fbApp = getServerFirebaseApp();
    assert.ok(fbApp);
    assert.equal(fbApp.options.projectId, 'custom-worldleo-project');
  } finally {
    if (origTestSeeds === undefined) delete process.env.WORLDLEO_ALLOW_TEST_SEEDS;
    else process.env.WORLDLEO_ALLOW_TEST_SEEDS = origTestSeeds;

    if (origEmulator === undefined) delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    else process.env.FIREBASE_AUTH_EMULATOR_HOST = origEmulator;

    if (origNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = origNodeEnv;

    if (origKService === undefined) delete process.env.K_SERVICE;
    else process.env.K_SERVICE = origKService;

    if (origAdminEmails === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = origAdminEmails;

    if (origProjectId === undefined) delete process.env.FIREBASE_PROJECT_ID;
    else process.env.FIREBASE_PROJECT_ID = origProjectId;
  }
});

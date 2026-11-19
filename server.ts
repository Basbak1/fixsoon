import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { hashPassword, signSessionToken, verifyPassword, verifySessionToken } from './server/auth.js';
import { classifyProblemText, createMatchesForRequest } from './server/matching.js';
import { notificationService } from './server/notifications.js';
import type { JobStatus, ProviderProfile, ServiceCategory, UserRole } from './src/types/fixsoon.js';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const GTA_CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  Toronto: { latitude: 43.6532, longitude: -79.3832 },
  Mississauga: { latitude: 43.589, longitude: -79.6441 },
  Brampton: { latitude: 43.7315, longitude: -79.7624 },
  Markham: { latitude: 43.8561, longitude: -79.337 },
  Vaughan: { latitude: 43.8361, longitude: -79.4983 },
  Oakville: { latitude: 43.4675, longitude: -79.6877 },
};

const PORT = 3000;
const app = express();
app.use(express.json({ limit: '4mb' }));

// Helper to extract authenticated user from Authorization Bearer header
function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const user = db.data.users.find((u) => u.id === payload.userId);
  return user || null;
}

function toPublicUser(user: (typeof db.data.users)[number]) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    saved_provider_ids: user.saved_provider_ids,
  };
}

// ==========================================
// SEO ROUTES: robots.txt & dynamic sitemap.xml
// ==========================================
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /customer-dashboard\nDisallow: /provider-dashboard\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const urls: string[] = [
    '/',
    '/services',
    '/professionals',
    '/how-it-works',
    '/for-providers',
    '/coverage-areas',
    '/about',
  ];

  const activeCategories = db.data.service_categories.filter((c) => c.is_active);
  const activeCatIds = new Set(activeCategories.map((c) => c.id));
  const activeSubcategories = db.data.service_subcategories.filter((s) => activeCatIds.has(s.category_id));

  for (const cat of activeCategories) {
    urls.push(`/categories/${cat.slug}`);
  }
  for (const sub of activeSubcategories) {
    urls.push(`/services/${sub.slug}`);
  }
  for (const prov of db.data.provider_profiles.filter((p) => p.status === 'approved')) {
    urls.push(`/professionals/${prov.slug}`);
  }
  // Only generate location+service URLs where at least one approved provider covers that city & service
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
      id: 'faq_coverage',
      category: 'Coverage',
      question: 'Which areas and highways does FixSoon currently cover?',
      answer: `FixSoon serves the Greater Toronto Area, Greater Hamilton Area, and Niagara Region—including ${cityList}—along the QEW, 401, 403, 407, and 400-series corridors. Availability for each request depends on active independent professionals covering your municipality.`,
    },
    {
      id: 'faq_vehicles_equipment',
      category: 'Coverage',
      question: 'What vehicles and equipment can I request service for?',
      answer: `During our launch phase, FixSoon focuses on ${activeSubs.map((s) => s.name).join(', ')} for cars, SUVs, pickup and commercial trucks, Bobcats/skid steers, and utility or cargo trailers. Additional home-service categories will open in future phases.`,
    },
    {
      id: 'faq_two_methods',
      category: 'Process',
      question: 'What is the difference between a General Request and a Direct Request?',
      answer:
        'A General Marketplace Request matches your issue with qualified professionals in your area so you can compare multiple written quotes side by side. A Direct Request lets you pick a specific professional from the directory and send your job straight to them—and if they are unavailable, you can switch to the general marketplace in one click.',
    },
    {
      id: 'faq_how_fast',
      category: 'Process',
      question: 'Do I need to know the exact technical repair name before requesting?',
      answer:
        'No. You can describe what happened in everyday words—such as "my car won\'t start" or "flat tire on my trailer"—and FixSoon automatically suggests the right service category and only asks relevant follow-up questions.',
    },
    {
      id: 'faq_verification',
      category: 'Verification',
      question: 'How does FixSoon verify mechanics and service providers?',
      answer: `FixSoon separates self-reported profile info from verified checks. Our operations team reviews email and phone reachability, business identity, commercial liability insurance, and trade licences (such as Red Seal) before marking a check as Verified. Currently ${approvedCount} approved demo profile(s) illustrate how verification badges appear.`,
    },
    {
      id: 'faq_privacy_pricing',
      category: 'Pricing & Privacy',
      question: 'When is my exact street address shared, and how do quotes work?',
      answer:
        'Providers only see your general city or neighbourhood while reviewing a request and submitting a written estimate (labour, parts, call-out/diagnostic terms, and ETA). Your exact street address and direct contact details stay private until you accept a quote.',
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
  const { category, subcategory, city, verifiedOnly, availableNow, q } = req.query as Record<string, string | undefined>;

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
    list = list.filter((p) => p.verifications.business_verified && p.verifications.insurance_verified);
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
  const services = db.data.service_subcategories.filter((s) => provider.subcategory_ids.includes(s.id));
  res.json({ provider, reviews, services });
});

// ==========================================
// AUTHENTICATION API
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role, city } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: UserRole;
    city?: string;
  };

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: 'Name, valid email, and password (6+ chars) are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (db.data.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const assignedRole: UserRole = role === 'provider' ? 'provider' : 'customer';
  const user = {
    id: db.newId('usr'),
    name: name.trim(),
    email: normalizedEmail,
    phone: (phone || '').trim(),
    role: assignedRole,
    password_hash: hashPassword(password),
    city: (city || 'Toronto').trim(),
    saved_provider_ids: [],
    created_at: new Date().toISOString(),
  };

  db.data.users.push(user);
  db.save();

  const token = signSessionToken(user.id, user.role);
  res.status(201).json({ token, user: toPublicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signSessionToken(user.id, user.role);
  const providerProfile = db.data.provider_profiles.find((p) => p.user_id === user.id) || null;
  res.json({ token, user: toPublicUser(user), providerProfile });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const providerProfile = db.data.provider_profiles.find((p) => p.user_id === user.id) || null;
  res.json({ user: toPublicUser(user), providerProfile });
});

app.post('/api/auth/firebase', (req, res) => {
  const { uid, name, email } = req.body as { uid?: string; name?: string; email?: string };
  if (!uid || !email) {
    return res.status(400).json({ error: 'Firebase uid and email are required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  let user = db.data.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    user = {
      id: `usr_fb_${uid.slice(0, 12)}`,
      name: (name || 'FixSoon User').trim(),
      email: normalizedEmail,
      phone: '',
      role: 'customer',
      password_hash: hashPassword(uid),
      city: 'Toronto',
      saved_provider_ids: [],
      created_at: new Date().toISOString(),
    };
    db.data.users.push(user);
    db.save();
  }
  const token = signSessionToken(user.id, user.role);
  const providerProfile = db.data.provider_profiles.find((p) => p.user_id === user!.id) || null;
  res.json({ token, user: toPublicUser(user), providerProfile });
});

// ==========================================
// GEMINI SEARCH & MAPS GROUNDING API
// ==========================================
app.post('/api/grounding/search', async (req, res) => {
  const { query } = req.body as { query?: string };
  if (!query?.trim()) {
    return res.status(400).json({ error: 'Search query is required.' });
  }
  if (!process.env.GEMINI_API_KEY) {
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
  if (!process.env.GEMINI_API_KEY) {
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

app.post('/api/customer/saved-providers/:providerId', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required' });
  const { providerId } = req.params;
  const idx = user.saved_provider_ids.indexOf(providerId);
  if (idx >= 0) {
    user.saved_provider_ids.splice(idx, 1);
  } else {
    user.saved_provider_ids.push(providerId);
  }
  db.save();
  res.json({ saved_provider_ids: user.saved_provider_ids });
});

// ==========================================
// CUSTOMER REQUESTS, QUOTES & JOBS API
// ==========================================
app.post('/api/requests', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in or create an account to submit a request.' });

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
    return res.status(400).json({ error: 'Service category, problem summary, and city are required.' });
  }

  const category = db.data.service_categories.find((c) => c.id === category_id);
  const subcategory = db.data.service_subcategories.find((s) => s.id === subcategory_id);
  const targetProvider = target_provider_id
    ? db.data.provider_profiles.find((p) => p.id === target_provider_id && p.status === 'approved')
    : null;

  if (request_type === 'direct' && !targetProvider) {
    return res.status(404).json({ error: 'Selected professional is not currently available.' });
  }

  const newRequest = {
    id: db.newId('req'),
    reference_code: db.newRefCode(),
    customer_id: user.id,
    customer_name: user.name,
    customer_phone: user.phone,
    request_type: request_type === 'direct' ? ('direct' as const) : ('marketplace' as const),
    target_provider_id: targetProvider ? targetProvider.id : null,
    target_provider_name: targetProvider ? targetProvider.business_name : null,
    category_id,
    category_name: category?.name || '',
    subcategory_id,
    subcategory_name: subcategory?.name || '',
    problem_summary: problem_summary.trim(),
    problem_details: (problem_details || '').trim(),
    dynamic_fields: dynamic_fields || {},
    city: city.trim(),
    neighbourhood: (neighbourhood || '').trim(),
    postal_code: (postal_code || '').trim().toUpperCase(),
    exact_address: (exact_address || '').trim(),
    urgency: urgency || 'today',
    status: 'open' as const,
    created_at: new Date().toISOString(),
  };

  db.data.service_requests.unshift(newRequest);
  const matchedProviders = createMatchesForRequest(newRequest);
  db.save();

  res.status(201).json({
    request: newRequest,
    matched_count: matchedProviders.length,
  });
});

// Fallback a declined/unanswered direct request to the general marketplace
app.post('/api/requests/:id/convert-to-marketplace', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const request = db.data.service_requests.find((r) => r.id === req.params.id && r.customer_id === user.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.request_type = 'marketplace';
  request.target_provider_id = null;
  request.target_provider_name = null;
  request.status = 'open';

  const matchedProviders = createMatchesForRequest(request);
  db.save();

  res.json({ request, matched_count: matchedProviders.length });
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
        provider_verified: Boolean(prov?.verifications.business_verified && prov?.verifications.insurance_verified),
      };
    });

  const jobs = db.data.jobs.filter((j) => j.customer_id === user.id);
  const savedProviders = db.data.provider_profiles.filter((p) => user.saved_provider_ids.includes(p.id));
  const notifications = db.data.notifications.filter((n) => n.user_id === user.id).slice(0, 20);
  const reviews = db.data.reviews.filter((r) => r.customer_id === user.id);

  res.json({ requests, quotes, jobs, savedProviders, notifications, reviews });
});

app.post('/api/quotes/:quoteId/accept', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const quote = db.data.quotes.find((q) => q.id === req.params.quoteId);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });

  const request = db.data.service_requests.find((r) => r.id === quote.request_id && r.customer_id === user.id);
  if (!request) return res.status(403).json({ error: 'Forbidden' });

  const provider = db.data.provider_profiles.find((p) => p.id === quote.provider_id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  const now = new Date().toISOString();
  quote.status = 'accepted';
  // Reject competing quotes
  for (const other of db.data.quotes) {
    if (other.request_id === request.id && other.id !== quote.id && other.status === 'pending') {
      other.status = 'rejected';
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
    exact_address: request.exact_address || `${request.neighbourhood ? request.neighbourhood + ', ' : ''}${request.city}`,
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
    created_at: now,
    updated_at: now,
  };

  db.data.jobs.unshift(job);
  notificationService.onQuoteAccepted({
    providerUserId: provider.user_id,
    customerName: user.name,
    referenceCode: request.reference_code,
  });

  db.save();
  res.json({ job, quote });
});

app.post('/api/jobs/:jobId/review', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const job = db.data.jobs.find((j) => j.id === req.params.jobId && j.customer_id === user.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Reviews can only be submitted after job completion.' });
  }
  if (job.review_submitted) {
    return res.status(400).json({ error: 'You have already reviewed this job.' });
  }

  const { rating, comment } = req.body as { rating?: number; comment?: string };
  const numRating = Math.max(1, Math.min(5, Math.round(Number(rating || 5))));
  const trimmedComment = (comment || '').trim();
  if (trimmedComment.length < 3 || trimmedComment.length > 1000) {
    return res.status(400).json({ error: 'Please write a review comment between 3 and 1000 characters.' });
  }

  const review = {
    id: db.newId('rev'),
    job_id: job.id,
    customer_id: user.id,
    customer_name: user.name,
    provider_id: job.provider_id,
    rating: numRating,
    comment: trimmedComment,
    service_name: job.service_name,
    verified_job: true,
    created_at: new Date().toISOString(),
  };

  db.data.reviews.unshift(review);
  job.review_submitted = true;

  const provider = db.data.provider_profiles.find((p) => p.id === job.provider_id);
  if (provider) {
    const provReviews = db.data.reviews.filter((r) => r.provider_id === provider.id);
    const total = provReviews.reduce((acc, r) => acc + r.rating, 0);
    provider.review_count = provReviews.length;
    provider.rating_avg = Math.round((total / provReviews.length) * 10) / 10;
  }

  db.save();
  res.status(201).json({ review });
});

app.post('/api/jobs/:jobId/dispute', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const job = db.data.jobs.find((j) => j.id === req.params.jobId && (j.customer_id === user.id || user.role === 'provider'));
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { reason, details } = req.body as { reason?: string; details?: string };
  if (!reason?.trim()) return res.status(400).json({ error: 'Reason is required.' });

  const now = new Date().toISOString();
  const dispute = {
    id: db.newId('disp'),
    job_id: job.id,
    request_id: job.request_id,
    reference_code: job.reference_code,
    reporter_id: user.id,
    reporter_name: user.name,
    reason: reason.trim(),
    details: (details || '').trim(),
    status: 'open' as const,
    created_at: now,
  };

  db.data.disputes.unshift(dispute);
  job.status = 'disputed';
  job.updated_at = now;
  job.status_history.push({
    status: 'disputed',
    note: `Report filed: ${reason.trim()}`,
    timestamp: now,
    actor_role: user.role,
  });

  db.save();
  res.status(201).json({ dispute });
});

// ==========================================
// MESSAGING API (Request / Job Thread)
// ==========================================
app.get('/api/requests/:requestId/messages', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const messages = db.data.messages.filter((m) => m.request_id === req.params.requestId);
  res.json({ messages });
});

app.post('/api/requests/:requestId/messages', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { body } = req.body as { body?: string };
  if (!body?.trim()) return res.status(400).json({ error: 'Message body is required.' });

  const msg = {
    id: db.newId('msg'),
    request_id: req.params.requestId,
    sender_id: user.id,
    sender_role: user.role,
    sender_name: user.name,
    body: body.trim(),
    created_at: new Date().toISOString(),
  };

  db.data.messages.push(msg);

  const reqRecord = db.data.service_requests.find((r) => r.id === req.params.requestId);
  if (reqRecord) {
    if (user.role === 'customer') {
      const assignedJob = db.data.jobs.find((j) => j.request_id === reqRecord.id);
      const targetProvId = assignedJob?.provider_id || reqRecord.target_provider_id;
      const prov = targetProvId ? db.data.provider_profiles.find((p) => p.id === targetProvId) : undefined;
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
  }

  db.save();
  res.status(201).json({ message: msg });
});

// ==========================================
// NOTIFICATION SERVICE API (REST + SSE)
// ==========================================
app.get('/api/notifications', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(notificationService.listForUser(user.id));
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
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const unsubscribe = notificationService.subscribe(user.id, res);
  req.on('close', unsubscribe);
});

// ==========================================
// PROVIDER ONBOARDING & DASHBOARD API
// ==========================================
app.post('/api/provider/onboarding', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const data = req.body as Partial<ProviderProfile>;
  if (!data.display_name?.trim() || !data.primary_city?.trim() || !data.category_ids?.length) {
    return res.status(400).json({ error: 'Display name, primary city, and at least one service category are required.' });
  }

  let existing = db.data.provider_profiles.find((p) => p.user_id === user.id);
  const slugBase = (data.business_name || data.display_name || user.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const now = new Date().toISOString();

  if (existing) {
    Object.assign(existing, {
      display_name: data.display_name.trim(),
      business_name: (data.business_name || data.display_name).trim(),
      provider_type: data.provider_type || existing.provider_type,
      bio: (data.bio || existing.bio).trim(),
      primary_city: data.primary_city.trim(),
      coverage_cities: data.coverage_cities?.length ? data.coverage_cities : [data.primary_city.trim()],
      coverage_radius_km: Number(data.coverage_radius_km || 25),
      category_ids: data.category_ids,
      subcategory_ids: data.subcategory_ids || [],
      languages: data.languages?.length ? data.languages : ['English'],
      years_experience: Number(data.years_experience || 1),
      starting_price: data.starting_price ?? null,
      diagnostic_fee: data.diagnostic_fee ?? null,
      free_estimates: Boolean(data.free_estimates),
      pricing_notes: (data.pricing_notes || '').trim(),
      operating_hours: (data.operating_hours || 'Mon–Fri 8:00 AM – 6:00 PM').trim(),
      emergency_available: Boolean(data.emergency_available),
      is_available_now: data.is_available_now ?? true,
      status: existing.status === 'draft' || existing.status === 'rejected' ? 'pending_verification' : existing.status,
    });
  } else {
    existing = {
      id: db.newId('prov'),
      user_id: user.id,
      slug: `${slugBase}-${Math.floor(100 + Math.random() * 900)}`,
      display_name: data.display_name.trim(),
      business_name: (data.business_name || data.display_name).trim(),
      provider_type: data.provider_type || 'independent_professional',
      bio: (data.bio || '').trim(),
      avatar_url: '',
      primary_city: data.primary_city.trim(),
      coverage_cities: data.coverage_cities?.length ? data.coverage_cities : [data.primary_city.trim()],
      coverage_radius_km: Number(data.coverage_radius_km || 25),
      category_ids: data.category_ids,
      subcategory_ids: data.subcategory_ids || [],
      languages: data.languages?.length ? data.languages : ['English'],
      years_experience: Number(data.years_experience || 1),
      starting_price: data.starting_price ?? null,
      diagnostic_fee: data.diagnostic_fee ?? null,
      free_estimates: Boolean(data.free_estimates),
      pricing_notes: (data.pricing_notes || '').trim(),
      operating_hours: (data.operating_hours || 'Mon–Fri 8:00 AM – 6:00 PM').trim(),
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
    user.role = 'provider';
  }

  db.save();
  res.status(201).json({ providerProfile: existing });
});

app.get('/api/provider/dashboard', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const profile = db.data.provider_profiles.find((p) => p.user_id === user.id);
  if (!profile) {
    return res.json({ profile: null, matchedRequests: [], myQuotes: [], jobs: [], reviews: [], notifications: [] });
  }

  const myMatches = db.data.request_matches.filter((m) => m.provider_id === profile.id);
  const matchMap = new Map(myMatches.map((m) => [m.request_id, m]));

  const urgencyRank: Record<string, number> = { emergency: 0, today: 1, scheduled: 2 };

  // Mask exact customer address & phone until job is assigned to this provider
  // Prioritize 'emergency' requests at the top of the provider's feed
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

app.post('/api/provider/availability', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const profile = db.data.provider_profiles.find((p) => p.user_id === user.id);
  if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

  if (req.body.is_available_now !== undefined) {
    profile.is_available_now = Boolean(req.body.is_available_now);
  }
  if (req.body.emergency_available !== undefined) {
    profile.emergency_available = Boolean(req.body.emergency_available);
  }
  db.save();
  res.json({ providerProfile: profile });
});

app.post('/api/provider/requests/:requestId/quote', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const profile = db.data.provider_profiles.find((p) => p.user_id === user.id);
  if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

  const match = db.data.request_matches.find((m) => m.request_id === req.params.requestId && m.provider_id === profile.id);
  if (!match) return res.status(403).json({ error: 'You are not matched to this request.' });

  const request = db.data.service_requests.find((r) => r.id === req.params.requestId);
  if (!request) return res.status(404).json({ error: 'Request not found' });

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
        .filter((item: { label?: string; cost?: number | string }) => item && String(item.label || '').trim() && Number(item.cost) >= 0)
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

  const parsedPartsCost =
    cleanPartsItems.length > 0
      ? cleanPartsItems.reduce((sum: number, item: { cost: number }) => sum + item.cost, 0)
      : parts_cost !== undefined && parts_cost !== '' && parts_cost !== null
        ? Number(parts_cost)
        : 0;

  const computedTotal =
    parsedServiceFee !== null && parsedServiceFee > 0
      ? Math.round((parsedServiceFee + parsedPartsCost) * 100) / 100
      : Number(estimated_price || 0);

  if (!computedTotal || computedTotal <= 0 || !eta_text?.trim()) {
    return res.status(400).json({ error: 'Service fee / estimated price and ETA/availability are required.' });
  }

  const now = new Date().toISOString();
  const quote = {
    id: db.newId('qt'),
    request_id: request.id,
    provider_id: profile.id,
    estimate_template: (estimate_template === 'flat_rate' ? 'flat_rate' : 'service_fee_plus_parts') as
      | 'service_fee_plus_parts'
      | 'flat_rate',
    service_fee: parsedServiceFee,
    parts_line_items: cleanPartsItems,
    estimated_price: computedTotal,
    labour_cost: parsedServiceFee,
    parts_cost: parsedPartsCost > 0 || cleanPartsItems.length > 0 ? parsedPartsCost : null,
    parts_included: Boolean(parts_included) || parsedPartsCost > 0 || cleanPartsItems.length > 0,
    eta_text: eta_text.trim(),
    estimated_duration: (estimated_duration || '1–2 hours').trim(),
    warranty_terms: (warranty_terms || '90-day workmanship warranty').trim(),
    message: (message || '').trim(),
    status: 'pending' as const,
    created_at: now,
  };

  db.data.quotes.unshift(quote);
  match.status = 'quoted';
  if (request.status === 'open') request.status = 'quoted';

  notificationService.onQuoteSubmitted({
    customerId: request.customer_id,
    providerBusinessName: profile.business_name,
    estimatedPrice: quote.estimated_price,
    referenceCode: request.reference_code,
  });

  db.save();
  res.status(201).json({ quote });
});

app.post('/api/provider/requests/:requestId/decline', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const profile = db.data.provider_profiles.find((p) => p.user_id === user.id);
  if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

  const match = db.data.request_matches.find((m) => m.request_id === req.params.requestId && m.provider_id === profile.id);
  if (!match) return res.status(403).json({ error: 'Not matched to this request' });

  const { reason } = req.body as { reason?: string };
  match.status = 'declined';
  match.decline_reason = (reason || 'Unavailable').trim();

  const request = db.data.service_requests.find((r) => r.id === req.params.requestId);
  if (request && request.request_type === 'direct') {
    request.status = 'declined_by_provider';
    notificationService.onDirectRequestDeclined({
      customerId: request.customer_id,
      providerBusinessName: profile.business_name,
      referenceCode: request.reference_code,
    });
  }

  db.save();
  res.json({ success: true });
});

app.post('/api/provider/jobs/:jobId/status', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const profile = db.data.provider_profiles.find((p) => p.user_id === user.id);
  if (!profile) return res.status(404).json({ error: 'Provider profile not found' });

  const job = db.data.jobs.find((j) => j.id === req.params.jobId && j.provider_id === profile.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { status, note } = req.body as { status?: JobStatus; note?: string };
  const validStatuses: JobStatus[] = ['on_the_way', 'arrived', 'work_in_progress', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid job status transition.' });
  }

  const now = new Date().toISOString();
  job.status = status;
  job.updated_at = now;
  job.status_history.push({
    status,
    note: (note || `Status updated to ${status.replace(/_/g, ' ')}`).trim(),
    timestamp: now,
    actor_role: 'provider',
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
  }

  notificationService.onJobStatusUpdated({
    customerId: job.customer_id,
    providerBusinessName: profile.business_name,
    referenceCode: job.reference_code,
    status,
  });

  db.save();
  res.json({ job });
});

// ==========================================
// ADMIN & OPERATIONS API (Strict RBAC)
// ==========================================
app.get('/api/admin/overview', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
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
      pending_verifications: db.data.provider_profiles.filter((p) => p.status === 'pending_verification' || p.status === 'submitted').length,
      open_requests: db.data.service_requests.filter((r) => r.status === 'open' || r.status === 'quoted').length,
      active_jobs: db.data.jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled').length,
      open_disputes: db.data.disputes.filter((d) => d.status !== 'resolved').length,
    },
  });
});

app.post('/api/admin/providers/:providerId/status', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const provider = db.data.provider_profiles.find((p) => p.id === req.params.providerId);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  const { status, verifications, note } = req.body;
  if (status) provider.status = status;
  if (verifications) {
    provider.verifications = { ...provider.verifications, ...verifications };
  }

  const now = new Date().toISOString();
  db.data.audit_logs.unshift({
    id: db.newId('aud'),
    actor_id: user.id,
    actor_name: user.name,
    action: `PROVIDER_${(status || 'UPDATED').toUpperCase()}`,
    target_type: 'provider_profile',
    target_id: provider.id,
    details: note || `Updated ${provider.business_name} status to ${provider.status}.`,
    created_at: now,
  });

  notificationService.onProviderVerificationUpdated({
    providerUserId: provider.user_id,
    status: provider.status,
  });

  db.save();
  res.json({ provider });
});

app.post('/api/admin/categories', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const { name, description, slug } = req.body as Partial<ServiceCategory>;
  if (!name?.trim()) return res.status(400).json({ error: 'Category name is required.' });

  const newCat: ServiceCategory = {
    id: db.newId('cat'),
    slug: (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: name.trim(),
    description: (description || '').trim(),
    image_url: '/src/assets/images/category_home_appliance_1794446298673.jpg',
    is_active: true,
    seo_title: `${name.trim()} Professionals in the GTA | FixSoon`,
    seo_description: (description || `Find independent ${name.trim()} professionals in the Greater Toronto Area.`).trim(),
    dynamic_fields: [
      { key: 'item_description', label: 'Item or equipment needing service', type: 'text', required: true, placeholder: 'Describe item' },
    ],
  };

  db.data.service_categories.push(newCat);
  db.data.audit_logs.unshift({
    id: db.newId('aud'),
    actor_id: user.id,
    actor_name: user.name,
    action: 'CATEGORY_CREATED',
    target_type: 'service_category',
    target_id: newCat.id,
    details: `Created service category: ${newCat.name}`,
    created_at: new Date().toISOString(),
  });
  db.save();
  res.status(201).json({ category: newCat });
});

app.post('/api/admin/disputes/:disputeId/resolve', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const dispute = db.data.disputes.find((d) => d.id === req.params.disputeId);
  if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

  const { resolution_notes } = req.body as { resolution_notes?: string };
  dispute.status = 'resolved';
  dispute.resolution_notes = (resolution_notes || 'Reviewed and resolved by FixSoon Operations.').trim();

  db.data.audit_logs.unshift({
    id: db.newId('aud'),
    actor_id: user.id,
    actor_name: user.name,
    action: 'DISPUTE_RESOLVED',
    target_type: 'dispute',
    target_id: dispute.id,
    details: dispute.resolution_notes,
    created_at: new Date().toISOString(),
  });

  db.save();
  res.json({ dispute });
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// ==========================================
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
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
    console.log(`FixSoon server listening on http://localhost:${PORT}`);
  });
}

startServer();

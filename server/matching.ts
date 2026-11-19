import { db } from './db.js';
import { notificationService } from './notifications.js';
import type { ProviderProfile, ServiceRequest, ServiceSubcategory } from '../src/types/fixsoon.js';

export interface ClassificationResult {
  matched_category_id: string | null;
  matched_subcategories: ServiceSubcategory[];
  confidence: 'high' | 'medium' | 'low';
}

export function classifyProblemText(query: string): ClassificationResult {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return { matched_category_id: null, matched_subcategories: [], confidence: 'low' };
  }

  const activeCatIds = new Set(
    db.data.service_categories.filter((c) => c.is_active).map((c) => c.id)
  );

  const scored = db.data.service_subcategories
    .filter((sub) => activeCatIds.has(sub.category_id))
    .map((sub) => {
      let score = 0;
      for (const kw of sub.keywords) {
        if (normalized.includes(kw.toLowerCase())) {
          score += kw.includes(' ') ? 3 : 2;
        }
      }
      if (normalized.includes(sub.name.toLowerCase())) score += 4;
      const words = normalized.split(/\s+/).filter((w) => w.length > 2);
      for (const w of words) {
        if (sub.description.toLowerCase().includes(w)) score += 1;
      }
      return { sub, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { matched_category_id: null, matched_subcategories: [], confidence: 'low' };
  }

  const top = scored.slice(0, 3).map((s) => s.sub);
  return {
    matched_category_id: top[0].category_id,
    matched_subcategories: top,
    confidence: scored[0].score >= 3 ? 'high' : 'medium',
  };
}

export function scoreProviderForRequest(provider: ProviderProfile, request: ServiceRequest): number {
  if (provider.status !== 'approved') return 0;

  const hasCategory = provider.category_ids.includes(request.category_id);
  const hasSubcategory = provider.subcategory_ids.includes(request.subcategory_id);
  if (!hasCategory && !hasSubcategory) return 0;

  let score = 40;
  if (hasSubcategory) score += 25;

  const cityMatch = provider.coverage_cities.some(
    (c) => c.toLowerCase() === request.city.toLowerCase()
  ) || provider.primary_city.toLowerCase() === request.city.toLowerCase();

  if (cityMatch) {
    score += 20;
  } else {
    // Do not spam providers outside their coverage area
    return 0;
  }

  if (provider.is_available_now) score += 8;
  if (request.urgency === 'emergency' && provider.emergency_available) score += 7;
  if (provider.verifications.insurance_verified) score += 4;
  if (provider.verifications.license_verified) score += 4;
  if (provider.rating_avg >= 4.5) score += 5;

  return Math.min(100, score);
}

export function createMatchesForRequest(request: ServiceRequest): ProviderProfile[] {
  const now = new Date().toISOString();

  if (request.request_type === 'direct' && request.target_provider_id) {
    const target = db.data.provider_profiles.find(
      (p) => p.id === request.target_provider_id && p.status === 'approved'
    );
    if (!target) return [];

    db.data.request_matches.push({
      id: db.newId('match'),
      request_id: request.id,
      provider_id: target.id,
      match_score: 100,
      status: 'pending',
    });

    notificationService.onRequestMatched({
      providerUserId: target.user_id,
      requestType: 'direct',
      customerName: request.customer_name,
      referenceCode: request.reference_code,
      city: request.city,
    });

    return [target];
  }

  // General marketplace matching
  const matched: { provider: ProviderProfile; score: number }[] = [];
  for (const provider of db.data.provider_profiles) {
    const score = scoreProviderForRequest(provider, request);
    if (score > 0) {
      matched.push({ provider, score });
    }
  }

  matched.sort((a, b) => b.score - a.score);
  const selected = matched.slice(0, 10);

  for (const item of selected) {
    db.data.request_matches.push({
      id: db.newId('match'),
      request_id: request.id,
      provider_id: item.provider.id,
      match_score: item.score,
      status: 'pending',
    });

    notificationService.onRequestMatched({
      providerUserId: item.provider.user_id,
      requestType: 'general',
      customerName: request.customer_name,
      referenceCode: request.reference_code,
      city: request.city,
    });
  }

  return selected.map((s) => s.provider);
}

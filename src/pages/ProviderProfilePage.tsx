import React, { useEffect, useState } from 'react';
import { Bookmark, Check, Clock, MapPin, Share2, ShieldCheck, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { loadProviderReviewsFromFirestore } from '../lib/firebase';
import { isWorldLeoVerified } from '../lib/commissions';
import { useAuth } from '../context/AuthContext';
import { SeoHead } from '../components/SeoHead';
import { TrustAndVerification } from '../components/TrustAndVerification';
import { WorldLeoVerifiedBadge } from '../components/WorldLeoVerifiedBadge';
import type { ProviderProfile, Review, ServiceSubcategory } from '../types/fixsoon';

interface ProviderProfilePageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export function ProviderProfilePage({ slug, onNavigate }: ProviderProfilePageProps) {
  const { user, refreshMe } = useAuth();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<ServiceSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ provider: ProviderProfile; reviews: Review[]; services: ServiceSubcategory[] }>(`/api/providers/${slug}`)
      .then(async (res) => {
        setProvider(res.provider);
        setServices(res.services);
        const fsReviews = await loadProviderReviewsFromFirestore(res.provider.id);
        const merged = [...res.reviews];
        for (const fsRev of fsReviews) {
          if (!merged.some((r) => r.id === fsRev.id || (fsRev.job_id && r.job_id === fsRev.job_id))) {
            merged.push(fsRev);
          }
        }
        merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setReviews(merged);
        setError('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Profile not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const isSaved = Boolean(provider && user?.saved_provider_ids?.includes(provider.id));

  const toggleSave = async () => {
    if (!user) {
      onNavigate('/auth');
      return;
    }
    if (!provider) return;
    await apiFetch(`/api/customer/saved-providers/${provider.id}`, { method: 'POST' });
    await refreshMe();
  };

  const handleShare = async () => {
    if (!provider) return;
    const profileUrl = `${window.location.origin}/professionals/${provider.slug}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = profileUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 4500);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-48 rounded-xl bg-[#FFFFFF] dark:bg-[#0B261E] border border-[#D8D4C7] dark:border-[#1E4438] animate-pulse" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Professional Profile Not Found
        </h1>
        <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
          This profile may be pending verification or no longer active.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/professionals')}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
        >
          Browse Directory
        </button>
      </div>
    );
  }

  const verified = isWorldLeoVerified(provider.verifications);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.business_name,
    description: provider.bio,
    areaServed: provider.coverage_cities,
  };
  if (provider.review_count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: provider.rating_avg,
      reviewCount: provider.review_count,
    };
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title={`${provider.business_name} – ${provider.primary_city} | WorldLeo`}
        description={provider.bio.slice(0, 155)}
        canonicalPath={`/professionals/${provider.slug}`}
        jsonLd={jsonLd}
      />

      {/* Breadcrumbs */}
      <nav className="text-xs text-[#6D756F] dark:text-[#A3ABA5] flex items-center gap-2">
        <button type="button" onClick={() => onNavigate('/')} className="hover:underline">Home</button>
        <span>/</span>
        <button type="button" onClick={() => onNavigate('/professionals')} className="hover:underline">Professionals</button>
        <span>/</span>
        <span className="text-[#171B19] dark:text-[#F6F2E8] font-medium">{provider.business_name}</span>
      </nav>

      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#D8D4C7] dark:border-[#1E4438] bg-[#063B2B] shrink-0">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.display_name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#F6F2E8]">
                {provider.display_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6D756F] dark:text-[#A3ABA5]">
              <span>{provider.primary_city}</span>
              <span aria-hidden="true">·</span>
              <span>{provider.years_experience} years experience</span>
              {provider.is_demo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Demo profile</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                {provider.business_name}
              </h1>
              {verified && <WorldLeoVerifiedBadge verifications={provider.verifications} />}
            </div>
            <div className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
              Technician: {provider.display_name} · Languages: {provider.languages.join(', ')}
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-[#171B19] dark:text-[#F6F2E8] tabular-nums">
                <Star className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B] fill-current" />
                {provider.review_count > 0
                  ? `${provider.rating_avg} (${provider.review_count} verified reviews)`
                  : 'No reviews yet'}
              </span>
              <span className="inline-flex items-center gap-1 text-[#6D756F] dark:text-[#A3ABA5]">
                <Clock className="w-3.5 h-3.5" />
                {provider.operating_hours}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-2.5 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {shareCopied ? (
              <>
                <Check className="w-4 h-4 text-[#145443] dark:text-[#D8B66F]" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={toggleSave}
            className="px-3.5 py-2.5 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-[#9F7B37] dark:text-[#C6A45B]' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(`/request-service?provider=${provider.id}`)}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] whitespace-nowrap cursor-pointer transition-colors"
          >
            Request This Professional
          </button>
        </div>
      </div>

      {shareCopied && (
        <div
          role="status"
          aria-live="polite"
          className="px-4 py-3 rounded-xl border border-[#145443]/30 dark:border-[#C6A45B]/40 bg-[#F6F2E8] dark:bg-[#063B2B]/50 text-xs sm:text-sm text-[#063B2B] dark:text-[#F6F2E8] flex items-center justify-between gap-3"
        >
          <span>
            Profile URL copied to your clipboard — share it with a friend, fleet manager, or neighbour who needs a trusted pro.
          </span>
        </div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3">
            <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
              About &amp; Services Offered
            </h2>
            <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5] leading-relaxed">
              {provider.bio}
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438]"
                >
                  <div className="text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8]">{s.name}</div>
                  <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5] mt-0.5">Typical: {s.typical_duration}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Verified Customer Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9F7B37] dark:text-[#C6A45B]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="tabular-nums">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} out of 5
                  </span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
                No completed-job reviews yet. Reviews appear here once customers rate completed jobs.
              </p>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                    const pct = Math.round((count / reviews.length) * 100);
                    return (
                      <div key={star} className="flex items-center gap-2.5 text-xs">
                        <span className="w-8 font-semibold text-[#6D756F] dark:text-[#A3ABA5] tabular-nums">
                          {star}★
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-[#D8D4C7] dark:bg-[#1E4438] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#9F7B37] dark:bg-[#C6A45B]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[#6D756F] dark:text-[#A3ABA5] tabular-nums">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pb-4 border-b last:border-b-0 border-[#D8D4C7] dark:border-[#1E4438]">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                            {rev.customer_name}
                          </span>
                          {rev.service_name && <span>· {rev.service_name}</span>}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#063B2B]/10 dark:bg-[#C6A45B]/15 text-[#063B2B] dark:text-[#D8B66F] text-[11px] font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Job
                          </span>
                        </div>
                        <span className="tabular-nums">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 my-1.5 text-[#9F7B37] dark:text-[#C6A45B]">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-[#171B19] dark:text-[#F6F2E8] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar: Verification & Pricing Transparency */}
        <div className="lg:col-span-4 space-y-6">
          <TrustAndVerification
            mode="provider"
            verifications={provider.verifications}
            businessName={provider.business_name}
            onNavigate={onNavigate}
          />

          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3 text-sm">
            <h2 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Coverage &amp; Pricing Notes
            </h2>
            <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5] space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B] shrink-0 mt-0.5" />
                <span>
                  Serves: {provider.coverage_cities.join(', ')} (~{provider.coverage_radius_km} km radius)
                </span>
              </div>
              {provider.starting_price !== null && (
                <div className="tabular-nums">Starting service rate: ${provider.starting_price}</div>
              )}
              {provider.diagnostic_fee !== null && (
                <div className="tabular-nums">Diagnostic fee: ${provider.diagnostic_fee}</div>
              )}
              {provider.free_estimates && <div>Provides free written estimates</div>}
              {provider.pricing_notes && <p className="pt-1 italic">{provider.pricing_notes}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

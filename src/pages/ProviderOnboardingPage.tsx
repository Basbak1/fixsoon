import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type {
  GtaLocation,
  ProviderProfile,
  ProviderType,
  ServiceCategory,
  ServiceSubcategory,
} from '../types/fixsoon';

interface ProviderOnboardingPageProps {
  categories: ServiceCategory[];
  subcategories: ServiceSubcategory[];
  locations: GtaLocation[];
  onNavigate: (path: string) => void;
}

export function ProviderOnboardingPage({
  categories,
  subcategories,
  locations,
  onNavigate,
}: ProviderOnboardingPageProps) {
  const { user, providerProfile, setProviderProfile } = useAuth();

  const [displayName, setDisplayName] = useState(providerProfile?.display_name || user?.name || '');
  const [businessName, setBusinessName] = useState(providerProfile?.business_name || '');
  const [providerType, setProviderType] = useState<ProviderType>(
    providerProfile?.provider_type || 'independent_professional'
  );
  const [selectedCats, setSelectedCats] = useState<string[]>(
    providerProfile?.category_ids || [categories[0]?.id || 'cat_auto']
  );
  const [selectedSubs, setSelectedSubs] = useState<string[]>(providerProfile?.subcategory_ids || []);
  const [primaryCity, setPrimaryCity] = useState(providerProfile?.primary_city || 'Toronto');
  const [coverageCities, setCoverageCities] = useState<string[]>(
    providerProfile?.coverage_cities || ['Toronto']
  );
  const [radiusKm, setRadiusKm] = useState(providerProfile?.coverage_radius_km || 25);
  const [yearsExp, setYearsExp] = useState(providerProfile?.years_experience || 3);
  const [bio, setBio] = useState(providerProfile?.bio || '');
  const [startingPrice, setStartingPrice] = useState<string>(
    providerProfile?.starting_price ? String(providerProfile.starting_price) : ''
  );
  const [diagnosticFee, setDiagnosticFee] = useState<string>(
    providerProfile?.diagnostic_fee ? String(providerProfile.diagnostic_fee) : ''
  );
  const [freeEstimates, setFreeEstimates] = useState(providerProfile?.free_estimates ?? true);
  const [operatingHours, setOperatingHours] = useState(
    providerProfile?.operating_hours || 'Mon–Sat 8:00 AM – 7:00 PM'
  );
  const [emergencyAvailable, setEmergencyAvailable] = useState(providerProfile?.emergency_available ?? false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleItem = (list: string[], setList: (next: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('/auth');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const res = await apiFetch<{ providerProfile: ProviderProfile }>('/api/provider/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          display_name: displayName,
          business_name: businessName || displayName,
          provider_type: providerType,
          category_ids: selectedCats,
          subcategory_ids: selectedSubs,
          primary_city: primaryCity,
          coverage_cities: coverageCities.length ? coverageCities : [primaryCity],
          coverage_radius_km: Number(radiusKm),
          years_experience: Number(yearsExp),
          bio,
          starting_price: startingPrice ? Number(startingPrice) : null,
          diagnostic_fee: diagnosticFee ? Number(diagnosticFee) : null,
          free_estimates: freeEstimates,
          operating_hours: operatingHours,
          emergency_available: emergencyAvailable,
          is_available_now: true,
        }),
      });
      setProviderProfile(res.providerProfile);
      onNavigate('/provider-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Professional Profile &amp; Verification Setup
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
          Complete your services, GTA coverage areas, and experience. Profiles are reviewed by FixSoon Operations before appearing in public searches.
        </p>
      </div>

      {!user && (
        <div className="p-4 rounded-xl border border-[#B45309]/50 bg-[#FFFFFF] dark:bg-[#111827] flex items-center justify-between gap-4">
          <span className="text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            Create a provider account or sign in first to submit your profile.
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/auth')}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
          >
            Sign In / Register
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-6"
      >
        {error && (
          <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Your Full Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Business / Trading Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Optional if operating under your name"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5">Provider Type</label>
          <select
            value={providerType}
            onChange={(e) => setProviderType(e.target.value as ProviderType)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
          >
            <option value="independent_professional">Independent Professional</option>
            <option value="mobile_technician">Mobile Technician</option>
            <option value="registered_business">Registered Business</option>
            <option value="repair_shop">Repair Shop</option>
            <option value="fleet_service_provider">Fleet Service Provider</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2">Service Categories *</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleItem(selectedCats, setSelectedCats, c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  selectedCats.includes(c.id)
                    ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/15'
                    : 'border-[#E2E8F0] dark:border-[#1E293B]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2">Specific Services Offered</label>
          <div className="flex flex-wrap gap-2">
            {subcategories
              .filter((s) => selectedCats.includes(s.category_id))
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleItem(selectedSubs, setSelectedSubs, s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    selectedSubs.includes(s.id)
                      ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/15'
                      : 'border-[#E2E8F0] dark:border-[#1E293B]'
                  }`}
                >
                  {s.name}
                </button>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Primary GTA City *</label>
            <select
              value={primaryCity}
              onChange={(e) => setPrimaryCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            >
              {locations.map((l) => (
                <option key={l.slug} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Service Radius (km)</label>
            <input
              type="number"
              min={5}
              max={150}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2">Coverage Cities</label>
          <div className="flex flex-wrap gap-2">
            {locations.map((l) => (
              <button
                key={l.slug}
                type="button"
                onClick={() => toggleItem(coverageCities, setCoverageCities, l.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  coverageCities.includes(l.name)
                    ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/15'
                    : 'border-[#E2E8F0] dark:border-[#1E293B]'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Years Experience</label>
            <input
              type="number"
              min={0}
              value={yearsExp}
              onChange={(e) => setYearsExp(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Starting Price ($ optional)</label>
            <input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="e.g. 75"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Diagnostic Fee ($ optional)</label>
            <input
              type="number"
              value={diagnosticFee}
              onChange={(e) => setDiagnosticFee(e.target.value)}
              placeholder="e.g. 85"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Professional Introduction &amp; Credentials *</label>
          <textarea
            rows={3}
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your experience, certifications, tools, and types of repairs you handle..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold mb-1">Operating Hours</label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
            />
          </div>
          <div className="space-y-2 pt-4 sm:pt-0 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={freeEstimates}
                onChange={(e) => setFreeEstimates(e.target.checked)}
                className="accent-[#B45309]"
              />
              <span>I provide free initial estimates</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyAvailable}
                onChange={(e) => setEmergencyAvailable(e.target.checked)}
                className="accent-[#B45309]"
              />
              <span>Available for urgent roadside / emergency calls</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] disabled:opacity-50"
          >
            {saving ? 'Submitting...' : 'Submit Profile for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}

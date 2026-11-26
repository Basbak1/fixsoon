import React, { useMemo, useState } from 'react';
import { MapPin, Search, Star } from 'lucide-react';
import { DirectorySkeleton } from '../components/SkeletonScreens';
import { WorldLeoVerifiedBadge } from '../components/WorldLeoVerifiedBadge';
import { isWorldLeoVerified } from '../lib/commissions';
import type { GtaLocation, ProviderProfile, ServiceCategory, ServiceSubcategory } from '../types/fixsoon';

interface DirectoryPageProps {
  categories: ServiceCategory[];
  subcategories: ServiceSubcategory[];
  locations: GtaLocation[];
  providers: ProviderProfile[];
  loading?: boolean;
  onNavigate: (path: string) => void;
}

export function DirectoryPage({
  categories,
  subcategories,
  locations,
  providers,
  loading = false,
  onNavigate,
}: DirectoryPageProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (selectedCat && !p.category_ids.includes(selectedCat)) return false;
      if (selectedSub && !p.subcategory_ids.includes(selectedSub)) return false;
      if (
        selectedCity &&
        p.primary_city.toLowerCase() !== selectedCity.toLowerCase() &&
        !p.coverage_cities.some((c) => c.toLowerCase() === selectedCity.toLowerCase())
      ) {
        return false;
      }
      if (verifiedOnly && !isWorldLeoVerified(p.verifications)) return false;
      if (availableNow && !p.is_available_now) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          p.display_name.toLowerCase().includes(q) ||
          p.business_name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.coverage_cities.some((c) => c.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [providers, selectedCat, selectedSub, selectedCity, verifiedOnly, availableNow, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#171B19] dark:text-[#F6F2E8]">
            WorldLeo Service Provider Directory
          </h1>
          <p className="text-sm sm:text-base text-[#6D756F] dark:text-[#A3ABA5] mt-1">
            Compare independent Home &amp; Auto professionals, view verified credentials, or request a specific pro directly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/request-service')}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
        >
          Post a General Request Instead
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 sm:p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17]">
          <Search className="w-4 h-4 text-[#6D756F] dark:text-[#A3ABA5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or city..."
            className="w-full bg-transparent text-sm text-[#171B19] dark:text-[#F6F2E8] focus:outline-none"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => {
            setSelectedCat(e.target.value);
            setSelectedSub('');
          }}
          className="px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSub}
          onChange={(e) => setSelectedSub(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
        >
          <option value="">All Services</option>
          {subcategories
            .filter((s) => !selectedCat || s.category_id === selectedCat)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
        >
          <option value="">All Ontario Cities</option>
          {locations.map((l) => (
            <option key={l.slug} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>

        <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center gap-4 pt-1 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer text-[#171B19] dark:text-[#F6F2E8]">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-[#9F7B37] dark:accent-[#C6A45B]"
            />
            <span>WorldLeo Verified only</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer text-[#171B19] dark:text-[#F6F2E8]">
            <input
              type="checkbox"
              checked={availableNow}
              onChange={(e) => setAvailableNow(e.target.checked)}
              className="accent-[#9F7B37] dark:accent-[#C6A45B]"
            />
            <span>Available now</span>
          </label>
          <span className="ml-auto text-[#6D756F] dark:text-[#A3ABA5] tabular-nums">
            Showing {filtered.length} professional(s)
          </span>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <DirectorySkeleton />
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-center space-y-3">
          <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
            No matching professionals found
          </h2>
          <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5] max-w-md mx-auto">
            Try clearing some filters or post a general marketplace request so available technicians and tradespeople in nearby areas can respond.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/request-service')}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
          >
            Post a General Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((prov) => {
            const isVerified = isWorldLeoVerified(prov.verifications);
            return (
              <div
                key={prov.id}
                className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D8D4C7] dark:border-[#1E4438] bg-[#063B2B] shrink-0">
                    {prov.avatar_url ? (
                      <img
                        src={prov.avatar_url}
                        alt={prov.display_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#F6F2E8]">
                        {prov.display_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {prov.primary_city}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{prov.years_experience} yrs exp</span>
                      {prov.is_demo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Demo profile</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8] mt-0.5">
                      {prov.business_name}
                    </h2>
                    <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5] mt-0.5">
                      {prov.display_name} · Coverage: {prov.coverage_cities.join(', ')}
                    </p>
                    <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5] mt-2 line-clamp-2">
                      {prov.bio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#D8D4C7] dark:border-[#1E4438]">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#171B19] dark:text-[#F6F2E8] tabular-nums">
                      <Star className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#C6A45B] fill-current" />
                      {prov.rating_avg > 0 ? `${prov.rating_avg} (${prov.review_count})` : 'No reviews yet'}
                    </span>
                    {isVerified && (
                      <WorldLeoVerifiedBadge verifications={prov.verifications} compact />
                    )}
                    {prov.starting_price && (
                      <span className="text-[#6D756F] dark:text-[#A3ABA5] tabular-nums">
                        From ${prov.starting_price}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/request-service?provider=${prov.id}`)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] cursor-pointer"
                    >
                      Request This Professional
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

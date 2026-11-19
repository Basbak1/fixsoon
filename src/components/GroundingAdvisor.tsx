import React, { useState } from 'react';
import { ExternalLink, MapPin, Search } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface GroundingSource {
  title: string;
  uri: string;
}

export function GroundingAdvisor() {
  const [mode, setMode] = useState<'search' | 'maps'>('search');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Toronto');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');
    setSources([]);

    try {
      const endpoint = mode === 'search' ? '/api/grounding/search' : '/api/grounding/maps';
      const res = await apiFetch<{ text: string; sources: GroundingSource[] }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ query: query.trim(), city }),
      });
      setAnswer(res.text);
      setSources(res.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch grounded information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Live Repair &amp; Local Parts Lookup
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Powered by Google Search &amp; Google Maps grounding for up-to-date repair safety info and nearby GTA supply locations.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
          <button
            type="button"
            onClick={() => setMode('search')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === 'search'
                ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                : 'text-[#475569] dark:text-[#94A3B8]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Info</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('maps')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === 'maps'
                ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                : 'text-[#475569] dark:text-[#94A3B8]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Nearby Places</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2">
        {mode === 'maps' && (
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
          >
            {['Toronto', 'Mississauga', 'Brampton', 'Markham', 'Vaughan', 'Oakville'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === 'search'
              ? 'e.g. Ontario winter roadside safety tips when battery dies'
              : 'e.g. Heavy-duty truck & trailer tire shops open now'
          }
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Searching...' : mode === 'search' ? 'Search Web' : 'Find on Maps'}
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {answer && (
        <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
          <div className="text-sm text-[#0F172A] dark:text-[#F8FAFC] whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
          {sources.length > 0 && (
            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-1.5">
              <div className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                {mode === 'maps' ? 'Google Maps Links:' : 'Sources:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, idx) => (
                  <a
                    key={`${s.uri}-${idx}`}
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] text-[#B45309] dark:text-[#F59E0B] hover:underline"
                  >
                    <span>{s.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { APIProvider, AdvancedMarker, InfoWindow, Map as GoogleMap, Pin } from '@vis.gl/react-google-maps';
import type { ProviderProfile } from '../types/fixsoon';

interface CoverageMapProps {
  providers: ProviderProfile[];
  onNavigate: (path: string) => void;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Mississauga: { lat: 43.589, lng: -79.6441 },
  Brampton: { lat: 43.7315, lng: -79.7624 },
  Markham: { lat: 43.8561, lng: -79.337 },
  Vaughan: { lat: 43.8361, lng: -79.4983 },
  Oakville: { lat: 43.4675, lng: -79.6877 },
  Burlington: { lat: 43.3255, lng: -79.799 },
  Hamilton: { lat: 43.2557, lng: -79.8711 },
  Grimsby: { lat: 43.1945, lng: -79.5612 },
  'St. Catharines': { lat: 43.1594, lng: -79.2469 },
  'Niagara Falls': { lat: 43.0896, lng: -79.0849 },
  Welland: { lat: 42.9922, lng: -79.2483 },
};

export function CoverageMap({ providers, onNavigate }: CoverageMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!apiKey) {
    return (
      <div className="h-[360px] rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-2">
          <div className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
            Ontario Service Coverage Map
          </div>
          <p className="text-xs text-[#58605A] dark:text-[#B4C2BC]">
            Interactive Google Maps view requires a configured Google Maps API key in the environment.
          </p>
        </div>
      </div>
    );
  }

  const selectedProvider = providers.find((p) => p.id === selectedId) || null;

  return (
    <div className="h-[380px] w-full rounded-xl overflow-hidden border border-[#D8D4C7] dark:border-[#1E4438]">
      <APIProvider apiKey={apiKey} language="en" region="CA">
        <GoogleMap
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: 43.38, lng: -79.52 }}
          defaultZoom={9}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="cooperative"
        >
          {providers.map((prov, idx) => {
            const base = CITY_COORDS[prov.primary_city] || CITY_COORDS.Toronto;
            const pos = {
              lat: base.lat + idx * 0.008,
              lng: base.lng + idx * 0.008,
            };
            return (
              <AdvancedMarker
                key={prov.id}
                position={pos}
                onClick={() => setSelectedId(prov.id)}
                title={prov.business_name}
              >
                <Pin background="#063B2B" borderColor="#C6A45B" glyphColor="#F6F2E8" />
              </AdvancedMarker>
            );
          })}

          {selectedProvider && (
            <InfoWindow
              position={CITY_COORDS[selectedProvider.primary_city] || CITY_COORDS.Toronto}
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="p-1 text-[#171B19] space-y-1 max-w-[220px]">
                <div className="font-bold text-sm">{selectedProvider.business_name}</div>
                <div className="text-xs text-[#58605A]">
                  {selectedProvider.primary_city} · {selectedProvider.years_experience} yrs exp
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/professionals/${selectedProvider.slug}`)}
                  className="text-xs font-semibold text-[#063B2B] underline cursor-pointer"
                >
                  View Profile &amp; Request
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}

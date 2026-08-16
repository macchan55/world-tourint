import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { GeoJSON as LeafletGeoJSON, Layer, Path } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { useTravelData } from '../lib/TravelDataContext';
import { worldCountriesGeoJson, isoCodeForFeatureId } from '../lib/worldGeo';
import type { Country } from '../lib/scoring';

const COLOR_VISITED = '#16a34a';
const COLOR_WISHLIST = '#f59e0b';
const COLOR_UNVISITED = '#cbd5e1';

function styleFor(country: Country | undefined, visited: boolean, wished: boolean) {
  if (!country) {
    return { fillColor: '#e2e8f0', color: '#94a3b8', weight: 0.5, fillOpacity: 0.4 };
  }
  if (visited) {
    return { fillColor: COLOR_VISITED, color: '#166534', weight: 0.8, fillOpacity: 0.75 };
  }
  if (wished) {
    return { fillColor: COLOR_WISHLIST, color: '#92400e', weight: 0.8, fillOpacity: 0.6 };
  }
  return { fillColor: COLOR_UNVISITED, color: '#64748b', weight: 0.5, fillOpacity: 0.5 };
}

export function WorldMapPage() {
  const {
    countries,
    visitedCountryIds,
    wishlistCountryIds,
    toggleVisit,
    referenceLoading,
  } = useTravelData();

  const countriesByIso = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach((c) => map.set(c.iso_code, c));
    return map;
  }, [countries]);

  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);

  const toggleVisitRef = useRef(toggleVisit);
  useEffect(() => {
    toggleVisitRef.current = toggleVisit;
  }, [toggleVisit]);

  const countriesByIsoRef = useRef(countriesByIso);
  useEffect(() => {
    countriesByIsoRef.current = countriesByIso;
  }, [countriesByIso]);

  // Re-style + re-tooltip layers whenever visited/wishlist status changes,
  // since react-leaflet only runs onEachFeature once per stable `data` prop.
  useEffect(() => {
    const layer = geoJsonRef.current;
    if (!layer) return;
    layer.eachLayer((l: Layer) => {
      const feature = (l as Layer & { feature?: Feature<Geometry> }).feature;
      const iso = isoCodeForFeatureId(feature?.id);
      const country = iso ? countriesByIso.get(iso) : undefined;
      const visited = country ? visitedCountryIds.has(country.id) : false;
      const wished = country ? wishlistCountryIds.has(country.id) : false;
      (l as Path).setStyle(styleFor(country, visited, wished));
      if ('bindTooltip' in l) {
        const label = country
          ? `${country.name_ja}${visited ? '（訪問済み）' : wished ? '（行きたい）' : ''}`
          : (feature?.properties as { name?: string } | undefined)?.name ?? '';
        (l as unknown as { bindTooltip: (s: string) => void }).bindTooltip(label);
      }
    });
  }, [countries, countriesByIso, visitedCountryIds, wishlistCountryIds]);

  if (referenceLoading) {
    return <p className="page-loading">読み込み中...</p>;
  }

  return (
    <div className="map-page">
      <h1 className="page-title">世界地図</h1>
      <p className="map-hint">国をクリックすると訪問済みのオン/オフを切り替えられます。</p>
      <div className="map-legend">
        <span><i style={{ background: COLOR_VISITED }} /> 訪問済み</span>
        <span><i style={{ background: COLOR_WISHLIST }} /> 行きたい</span>
        <span><i style={{ background: COLOR_UNVISITED }} /> 未訪問</span>
      </div>
      <div className="map-container">
        <MapContainer center={[20, 0]} zoom={2} minZoom={2} worldCopyJump style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON
            ref={geoJsonRef}
            data={worldCountriesGeoJson}
            style={() => styleFor(undefined, false, false)}
            onEachFeature={(feature: Feature<Geometry>, layer: Layer) => {
              const iso = isoCodeForFeatureId(feature.id);
              layer.on('click', () => {
                const country = iso ? countriesByIsoRef.current.get(iso) : undefined;
                if (country) toggleVisitRef.current(country.id);
              });
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}

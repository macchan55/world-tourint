import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import worldTopo from 'world-atlas/countries-50m.json';
import { ISO_NUMERIC_TO_ALPHA2 } from './isoNumericToAlpha2';

export type CountryFeatureProperties = {
  name: string;
  iso_code: string | null;
};

const topo = worldTopo as unknown as Topology<{ countries: GeometryCollection }>;

export const worldCountriesGeoJson = feature(
  topo,
  topo.objects.countries
) as unknown as FeatureCollection<Geometry, { name: string }>;

/** Attach our alpha-2 iso_code (via numeric id lookup) onto each feature's properties. */
export function isoCodeForFeatureId(id: string | number | undefined): string | null {
  if (id === undefined) return null;
  const key = String(id).padStart(3, '0');
  return ISO_NUMERIC_TO_ALPHA2[key] ?? null;
}

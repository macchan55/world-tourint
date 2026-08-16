import type { Tables } from '../types/database';

export type Country = Tables<'countries'>;
export type Region = Tables<'regions'>;
export type Visit = Tables<'visits'>;

export type RegionCoverage = {
  region: Region;
  visitedCount: number;
  totalCount: number;
  percentage: number;
};

/** Sum of difficulty points across all visited countries. */
export function calcTotalScore(countries: Country[], visitedCountryIds: Set<string>): number {
  return countries
    .filter((c) => visitedCountryIds.has(c.id))
    .reduce((sum, c) => sum + c.difficulty, 0);
}

export function calcVisitedCount(countries: Country[], visitedCountryIds: Set<string>): number {
  return countries.filter((c) => visitedCountryIds.has(c.id)).length;
}

/** Per-region visited/total breakdown, used for the coverage radar chart. */
export function calcRegionCoverage(
  countries: Country[],
  regions: Region[],
  visitedCountryIds: Set<string>
): RegionCoverage[] {
  return regions.map((region) => {
    const inRegion = countries.filter((c) => c.region_id === region.id);
    const visitedCount = inRegion.filter((c) => visitedCountryIds.has(c.id)).length;
    const totalCount = inRegion.length;
    return {
      region,
      visitedCount,
      totalCount,
      percentage: totalCount === 0 ? 0 : Math.round((visitedCount / totalCount) * 100),
    };
  });
}

/** A region is "conquered" once its visit rate reaches this threshold. */
export const REGION_COMPLETE_THRESHOLD = 0.8;

export function isRegionComplete(coverage: RegionCoverage): boolean {
  return coverage.totalCount > 0 && coverage.visitedCount / coverage.totalCount >= REGION_COMPLETE_THRESHOLD;
}

export function calcGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: '★☆☆☆☆ 簡単',
  2: '★★☆☆☆ やや易',
  3: '★★★☆☆ 普通',
  4: '★★★★☆ 難関',
  5: '★★★★★ 最難関',
};

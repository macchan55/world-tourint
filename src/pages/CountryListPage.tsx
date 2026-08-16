import { useMemo, useState } from 'react';
import { useTravelData } from '../lib/TravelDataContext';
import { DIFFICULTY_LABELS } from '../lib/scoring';

type StatusFilter = 'all' | 'visited' | 'unvisited' | 'wishlist';

export function CountryListPage() {
  const {
    countries,
    regions,
    cities,
    visitedCountryIds,
    wishlistCountryIds,
    visitedCityIds,
    toggleVisit,
    toggleWishlist,
    toggleCityVisit,
    referenceLoading,
  } = useTravelData();

  const [regionFilter, setRegionFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const regionById = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);

  const filtered = useMemo(() => {
    return countries
      .filter((c) => regionFilter === 'all' || c.region_id === regionFilter)
      .filter((c) => difficultyFilter === 'all' || c.difficulty === Number(difficultyFilter))
      .filter((c) => {
        if (statusFilter === 'visited') return visitedCountryIds.has(c.id);
        if (statusFilter === 'unvisited') return !visitedCountryIds.has(c.id);
        if (statusFilter === 'wishlist') return wishlistCountryIds.has(c.id);
        return true;
      })
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return c.name_ja.includes(search.trim()) || c.name_en.toLowerCase().includes(q);
      });
  }, [countries, regionFilter, difficultyFilter, statusFilter, search, visitedCountryIds, wishlistCountryIds]);

  if (referenceLoading) {
    return <p className="page-loading">読み込み中...</p>;
  }

  return (
    <div className="country-list-page">
      <h1 className="page-title">国一覧</h1>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="国名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="all">すべての地域</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name_ja}
            </option>
          ))}
        </select>
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
          <option value="all">すべての難易度</option>
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>
              {DIFFICULTY_LABELS[d]}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">すべて</option>
          <option value="visited">訪問済み</option>
          <option value="unvisited">未訪問</option>
          <option value="wishlist">行きたい</option>
        </select>
      </div>

      <p className="result-count">{filtered.length} 件</p>

      <ul className="country-list">
        {filtered.map((c) => {
          const visited = visitedCountryIds.has(c.id);
          const wished = wishlistCountryIds.has(c.id);
          const isExpanded = expandedId === c.id;
          const countryCities = cities.filter((city) => city.country_id === c.id);

          return (
            <li key={c.id} className={`country-row ${visited ? 'is-visited' : ''}`}>
              <div className="country-row-main">
                <button
                  type="button"
                  className="country-name-btn"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  disabled={countryCities.length === 0}
                >
                  <span className="country-name">{c.name_ja}</span>
                  <span className="country-meta">
                    {regionById.get(c.region_id)?.name_ja} ・ {c.sub_region} ・{' '}
                    {'★'.repeat(c.difficulty)}
                    {'☆'.repeat(5 - c.difficulty)}
                  </span>
                </button>

                <div className="country-row-actions">
                  <button
                    type="button"
                    className={`chip-btn ${wished ? 'active-wishlist' : ''}`}
                    onClick={() => toggleWishlist(c.id)}
                  >
                    ★ 行きたい
                  </button>
                  <button
                    type="button"
                    className={`chip-btn ${visited ? 'active-visited' : ''}`}
                    onClick={() => toggleVisit(c.id)}
                  >
                    {visited ? '✓ 訪問済み' : '訪問済みにする'}
                  </button>
                </div>
              </div>

              {isExpanded && countryCities.length > 0 && (
                <div className="city-checklist">
                  {countryCities.map((city) => (
                    <label key={city.id} className="city-checkbox">
                      <input
                        type="checkbox"
                        checked={visitedCityIds.has(city.id)}
                        onChange={() => toggleCityVisit(city.id)}
                      />
                      {city.name_ja}
                      {city.tier === 'capital' && <span className="capital-tag">首都</span>}
                    </label>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTravelData } from '../lib/TravelDataContext';
import { calcTotalScore, calcVisitedCount, calcRegionCoverage, isRegionComplete } from '../lib/scoring';

export function DashboardPage() {
  const { countries, regions, visitedCountryIds, referenceLoading, visitsLoading } = useTravelData();

  if (referenceLoading || visitsLoading) {
    return <p className="page-loading">読み込み中...</p>;
  }

  const totalScore = calcTotalScore(countries, visitedCountryIds);
  const visitedCount = calcVisitedCount(countries, visitedCountryIds);
  const unMemberTotal = countries.filter((c) => c.is_un_member).length;
  const coverage = calcRegionCoverage(countries, regions, visitedCountryIds);
  const conqueredRegions = coverage.filter(isRegionComplete);

  const radarData = coverage.map((c) => ({
    region: c.region.name_ja,
    percentage: c.percentage,
    fullMark: 100,
  }));

  return (
    <div className="dashboard">
      <h1 className="page-title">ダッシュボード</h1>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">総合スコア</span>
          <span className="stat-value">{totalScore}</span>
          <span className="stat-sub">難易度加重ポイント</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">訪問国数</span>
          <span className="stat-value">
            {visitedCount} <span className="stat-value-small">/ {unMemberTotal}</span>
          </span>
          <span className="stat-sub">国連加盟国ベース</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">地域制覇</span>
          <span className="stat-value">
            {conqueredRegions.length} <span className="stat-value-small">/ {regions.length}</span>
          </span>
          <span className="stat-sub">80%以上訪問した地域</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>地域別カバレッジ</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid />
              <PolarAngleAxis dataKey="region" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="訪問率" dataKey="percentage" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <h2>地域別内訳</h2>
          <ul className="region-breakdown">
            {coverage.map((c) => (
              <li key={c.region.id}>
                <div className="region-breakdown-header">
                  <span>{c.region.name_ja}</span>
                  <span>
                    {c.visitedCount} / {c.totalCount}
                    {isRegionComplete(c) && <span className="badge-complete">制覇</span>}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${c.percentage}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

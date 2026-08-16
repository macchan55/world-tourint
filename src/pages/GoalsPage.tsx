import { useMemo, useState, type FormEvent } from 'react';
import { useTravelData } from '../lib/TravelDataContext';
import type { Goal } from '../hooks/useGoals';
import { calcGoalProgress, calcRegionCoverage, calcVisitedCount } from '../lib/scoring';

type GoalType = Goal['type'];

function useGoalProgress() {
  const { countries, regions, visitedCountryIds } = useTravelData();
  const coverage = useMemo(
    () => calcRegionCoverage(countries, regions, visitedCountryIds),
    [countries, regions, visitedCountryIds]
  );

  return function progressFor(goal: Goal): { current: number; target: number; label: string; done: boolean } {
    if (goal.type === 'total_countries') {
      const current = calcVisitedCount(countries, visitedCountryIds);
      const target = goal.target_value ?? 0;
      return { current, target, label: `${current} / ${target} カ国`, done: current >= target };
    }
    if (goal.type === 'region_complete') {
      const regionCoverage = coverage.find((c) => c.region.id === goal.region_id);
      const current = regionCoverage?.percentage ?? 0;
      return { current, target: 100, label: `${current}%（${regionCoverage?.visitedCount ?? 0}/${regionCoverage?.totalCount ?? 0}カ国）`, done: current >= 80 };
    }
    // specific_country
    const done = goal.country_id ? visitedCountryIds.has(goal.country_id) : false;
    return { current: done ? 1 : 0, target: 1, label: done ? '達成済み' : '未達成', done };
  };
}

export function GoalsPage() {
  const { goals, addGoal, deleteGoal, countries, regions, goalsLoading, referenceLoading } = useTravelData();
  const progressFor = useGoalProgress();

  const [type, setType] = useState<GoalType>('total_countries');
  const [targetValue, setTargetValue] = useState(30);
  const [regionId, setRegionId] = useState('');
  const [countryId, setCountryId] = useState('');
  const [deadline, setDeadline] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await addGoal({
      type,
      target_value: type === 'total_countries' ? targetValue : null,
      region_id: type === 'region_complete' ? regionId || null : null,
      country_id: type === 'specific_country' ? countryId || null : null,
      deadline: deadline || null,
    });
  }

  if (referenceLoading || goalsLoading) {
    return <p className="page-loading">読み込み中...</p>;
  }

  const countryById = new Map(countries.map((c) => [c.id, c]));
  const regionById = new Map(regions.map((r) => [r.id, r]));

  return (
    <div className="goals-page">
      <h1 className="page-title">目標設定</h1>

      <section className="panel">
        <h2>新しい目標を追加</h2>
        <form className="goal-form" onSubmit={handleSubmit}>
          <select value={type} onChange={(e) => setType(e.target.value as GoalType)}>
            <option value="total_countries">訪問国数の目標</option>
            <option value="region_complete">地域制覇の目標</option>
            <option value="specific_country">特定の国を訪問する</option>
          </select>

          {type === 'total_countries' && (
            <input
              type="number"
              min={1}
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              placeholder="目標カ国数"
            />
          )}

          {type === 'region_complete' && (
            <select value={regionId} onChange={(e) => setRegionId(e.target.value)} required>
              <option value="">地域を選択</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name_ja}
                </option>
              ))}
            </select>
          )}

          {type === 'specific_country' && (
            <select value={countryId} onChange={(e) => setCountryId(e.target.value)} required>
              <option value="">国を選択</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ja}
                </option>
              ))}
            </select>
          )}

          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button type="submit">追加</button>
        </form>
      </section>

      <section className="panel">
        <h2>目標一覧</h2>
        {goals.length === 0 && <p className="empty-state">まだ目標がありません。</p>}
        <ul className="goal-list">
          {goals.map((goal) => {
            const progress = progressFor(goal);
            const percentage = calcGoalProgress(progress.current, progress.target);
            let title = '';
            if (goal.type === 'total_countries') title = `訪問国数 ${goal.target_value}カ国`;
            else if (goal.type === 'region_complete') title = `${regionById.get(goal.region_id ?? '')?.name_ja ?? ''} 制覇`;
            else title = `${countryById.get(goal.country_id ?? '')?.name_ja ?? ''} を訪問`;

            return (
              <li key={goal.id} className="goal-row">
                <div className="goal-row-header">
                  <span className="goal-title">{title}</span>
                  <button type="button" className="delete-btn" onClick={() => deleteGoal(goal.id)}>
                    削除
                  </button>
                </div>
                {goal.deadline && <span className="goal-deadline">期限: {goal.deadline}</span>}
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${progress.done ? 'progress-done' : ''}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="goal-progress-label">{progress.label}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

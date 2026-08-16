import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Visit } from '../lib/scoring';

export function useVisits() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setVisits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('visits').select('*').eq('user_id', user.id);
    if (!error && data) setVisits(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const visitedCountryIds = new Set(visits.map((v) => v.country_id));

  const toggleVisit = useCallback(
    async (countryId: string) => {
      if (!user) return;
      const existing = visits.find((v) => v.country_id === countryId);
      if (existing) {
        const { error } = await supabase.from('visits').delete().eq('id', existing.id);
        if (!error) setVisits((prev) => prev.filter((v) => v.id !== existing.id));
      } else {
        const { data, error } = await supabase
          .from('visits')
          .insert({ user_id: user.id, country_id: countryId })
          .select()
          .single();
        if (!error && data) setVisits((prev) => [...prev, data]);
      }
    },
    [user, visits]
  );

  return { visits, visitedCountryIds, loading, toggleVisit, reload };
}

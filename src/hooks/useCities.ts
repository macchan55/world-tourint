import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Tables } from '../types/database';

export type City = Tables<'cities'>;
export type CityVisit = Tables<'city_visits'>;

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('cities')
      .select('*')
      .order('name_ja')
      .then(({ data, error }) => {
        if (!error && data) setCities(data);
        setLoading(false);
      });
  }, []);

  return { cities, loading };
}

export function useCityVisits() {
  const { user } = useAuth();
  const [cityVisits, setCityVisits] = useState<CityVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setCityVisits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('city_visits').select('*').eq('user_id', user.id);
    if (!error && data) setCityVisits(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const visitedCityIds = new Set(cityVisits.map((cv) => cv.city_id));

  const toggleCityVisit = useCallback(
    async (cityId: string) => {
      if (!user) return;
      const existing = cityVisits.find((cv) => cv.city_id === cityId);
      if (existing) {
        const { error } = await supabase.from('city_visits').delete().eq('id', existing.id);
        if (!error) setCityVisits((prev) => prev.filter((cv) => cv.id !== existing.id));
      } else {
        const { data, error } = await supabase
          .from('city_visits')
          .insert({ user_id: user.id, city_id: cityId })
          .select()
          .single();
        if (!error && data) setCityVisits((prev) => [...prev, data]);
      }
    },
    [user, cityVisits]
  );

  return { cityVisits, visitedCityIds, loading, toggleCityVisit };
}

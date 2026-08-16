import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Country, Region } from '../lib/scoring';

export function useReferenceData() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [regionsRes, countriesRes] = await Promise.all([
        supabase.from('regions').select('*').order('name_ja'),
        supabase.from('countries').select('*').order('name_ja'),
      ]);

      if (cancelled) return;

      if (regionsRes.error) setError(regionsRes.error.message);
      else if (countriesRes.error) setError(countriesRes.error.message);
      else {
        setRegions(regionsRes.data);
        setCountries(countriesRes.data);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { regions, countries, loading, error };
}

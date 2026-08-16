import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Tables } from '../types/database';

type Wishlist = Tables<'wishlist'>;

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', user.id);
    if (!error && data) setItems(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const wishlistCountryIds = new Set(items.map((w) => w.country_id));

  const toggleWishlist = useCallback(
    async (countryId: string) => {
      if (!user) return;
      const existing = items.find((w) => w.country_id === countryId);
      if (existing) {
        const { error } = await supabase.from('wishlist').delete().eq('id', existing.id);
        if (!error) setItems((prev) => prev.filter((w) => w.id !== existing.id));
      } else {
        const { data, error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, country_id: countryId })
          .select()
          .single();
        if (!error && data) setItems((prev) => [...prev, data]);
      }
    },
    [user, items]
  );

  return { items, wishlistCountryIds, loading, toggleWishlist };
}

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Tables, TablesInsert } from '../types/database';

export type Goal = Tables<'goals'>;
export type NewGoal = Omit<TablesInsert<'goals'>, 'user_id'>;

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setGoals(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addGoal = useCallback(
    async (goal: NewGoal) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('goals')
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();
      if (!error && data) setGoals((prev) => [data, ...prev]);
    },
    [user]
  );

  const deleteGoal = useCallback(async (goalId: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (!error) setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  return { goals, loading, addGoal, deleteGoal };
}

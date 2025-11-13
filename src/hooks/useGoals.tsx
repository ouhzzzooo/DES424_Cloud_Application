import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useGoals = (isActive = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.id, isActive],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          activity_types (
            id,
            name,
            icon
          ),
          user_goal_progress (
            id,
            date,
            achieved_minutes,
            target_met
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', isActive)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useGoalProgress = (goalId: string, date?: string) => {
  const today = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['goal-progress', goalId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_goal_progress')
        .select('*')
        .eq('goal_id', goalId)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!goalId,
  });
};
